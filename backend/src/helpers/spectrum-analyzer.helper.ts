/**
 * Main Responsibility:
 *  This file will calculate all 5 rules
 * 1. Harmonic Slope Score (35%)
 * 2. Slope Monotonicity (30%)
 * 3. SNR Db (20%)
 * 4. Noise Floor Ratio (15%)
 * 5. Peak Sharpness (10%)
 */

/**
 * - harmonicsSlopeScore: A[2x]/A[1x], A[3x]/A[1x] must be reduced
 * - slopeMonotonicity: 1.0 = perfect slope, 0 = chaos
 * - snrDb: peak vs noise floor (dB)
 * - sidebandSymmetry: |left_energy - right_energy| / avg
 * - peakSharpness: peak width at -3dB
 * - noiseFloorRms: RMS of non-harmonic bins
 */
// interface SpectrumFeatures {
//     harmonicsSlopeScore: number;
//     slopeMonotonicity: number;
//     snrDb: number;
//     sidebandSymmetry: number;
//     peakSharpness: number;
//     noiseFloorRms: number;
// }

export interface SpectrumFeatures {
    harmonicSlopeScore: number;
    slopeMonotonicity: number;
    snrScore: number;
    peakSharpness: number;
    // freqOriginScore: number;
    noiseFloorRatio: number;
}

interface SpectrumScore {
    features: SpectrumFeatures;
    composite: number;
    isTrueF: boolean;
    rejectReason: string | null;
}

const WEIGHTS = {
    harmonicSlopeScore: 0.35,
    slopeMonotonicity: 0.30,
    snrScore: 0.2,
    peakSharpness: 0.10,
    // freqOriginScore: 0.5,
    noiseFloorRatio: 0.15,
} as const

// gate
const TRUE_F_THRESHOLD = 0.80;
const MIN_SNR_DB = 10; // if it below this then filter out
const MIN_MONOTONICITY = 0.34;  // must pass atleast 3/4 pairs
const MIN_HARMONIC_SLOPE = 0.85;
const MIN_NOISE_FLOOR_RATIO = 0.35;

function clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
}

function ampNear(fft: number[][], bin: number, win = 2): number {
    let max = 0;
    for (let i = Math.max(0, bin - win); i <= Math.min(fft.length - 1, bin + win); i++) {
        const amp = fft[i][1];
        if (amp > max) max = amp;
    }
    return max;
}

/* median finding noise floor**/
function median(arr: number[]): number {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b)
    const m = Math.floor(s.length / 2)
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

function calcSlopeScore(a1: number, a2: number, a3: number, a4: number): number {
  const ratios = [
    a2 / (a1 + 1e-9),
    a3 / (a1 + 1e-9),
    a4 / (a1 + 1e-9),
  ];

  const IDEAL_MIN = 0.35;
  const IDEAL_MAX = 0.90;

  // 1. range score 
  const rangeScores = ratios.map(r => {
    if (r >= IDEAL_MIN && r <= IDEAL_MAX) return 1.0;
    if (r < IDEAL_MIN) return clamp(r / IDEAL_MIN, 0, 1);
    return clamp(1 - (r - IDEAL_MAX) / (1 - IDEAL_MAX), 0, 1);
  });
  const rangeScore = rangeScores.reduce((s, v) => s + v, 0) / rangeScores.length;

  // 2. progression score — ratio they must decrease between each other.
  // r[0] > r[1] > r[2] = F real
  // r[0] ≈ r[1] ≈ r[2] = plateau = not
  const progressionScores = [
    ratios[0] - ratios[1],  // should positive
    ratios[1] - ratios[2],  // should positive
  ].map(diff => clamp(diff / 0.20, 0, 1));
  // diff=0.20 = good decrease (score=1.0)
  // diff=0.0  = not decrease (score=0.0)
  // diff<0    = up = clamp to 0
  const progressionScore = progressionScores.reduce((s, v) => s + v, 0) / progressionScores.length;

  // combine two part: range 40%, progression 60%
  return rangeScore * 0.40 + progressionScore * 0.60;
}

function calcMonotonicity(a1: number, a2: number, a3: number, a4: number): number {
    const pairs: [number, number][] = [[a1, a2], [a2, a3], [a3, a4]]
    return pairs.filter(([p, c]) => p > c).length / pairs.length
}

function calcNoiseFloorRatio(
    fft: number[][],
    peakBin: number,
    peakAmp: number,
    harmonicBins: Set<number>
): number {
    const start = Math.floor(fft.length * 0.05);
    const end = Math.floor(fft.length * 0.80);

    const localNoise = fft
        .slice(start, end)
        .filter((_, i) => !harmonicBins.has(i + start))
        .map(b => b[1]);

    // use percentile 75 intead of median
    // found that zeros drag the median down but p75 would be represent หญ้า ได้ดีกว่า
    const sorted = [...localNoise].sort((a, b) => a - b);
    const p75 = sorted[Math.floor(sorted.length * 0.75)];

    const ratio = p75 / (peakAmp + 1e-9);
    return clamp(1 - (ratio / 0.12), 0, 1);
}

function calcSnr(fft: number[][], peakAmp: number, harmonicBins: Set<number>): number {
    const noiseBins = fft
        .filter((_, i) => !harmonicBins.has(i))
        .map(bin => bin[1]);
    const floor = median(noiseBins) + 1e-9;
    const db = 20 * Math.log10(peakAmp / floor);
    return clamp((db - MIN_SNR_DB) / (50 - MIN_SNR_DB), 0, 1);
}

function calcSharpness(fft: number[][], peakBin: number, peakAmp: number): number {
    const threshold = peakAmp * 0.5;
    let width = 0;
    for (let i = Math.max(0, peakBin - 15); i <= Math.min(fft.length - 1, peakBin + 15); i++) {
        if (fft[i][1] >= threshold) width++;
    }
    return clamp(1 - (width - 1) / 9, 0, 1);
}

export function analyzeSpectrum(
    envelopedFft: number[][] | null,
    detailPeak: number[] | null,
    bpfo: number | null,
    df: number | null,
): SpectrumScore {

    // guard
    if (!envelopedFft?.length || !detailPeak?.length) {
        return {
            features: {
                harmonicSlopeScore: 0, slopeMonotonicity: 0, snrScore: 0, peakSharpness: 0,
                noiseFloorRatio: 0,
            },
            composite: 0,
            isTrueF: false,
            rejectReason: 'missing_data',
        };
    }

    const fft = envelopedFft;
    const peak1Bin = detailPeak[0];
    const a1 = ampNear(fft, peak1Bin);
    const a2 = ampNear(fft, peak1Bin * 2);
    const a3 = ampNear(fft, peak1Bin * 3);
    const a4 = ampNear(fft, peak1Bin * 4);

    const harmonicBins = new Set<number>();
    [1, 2, 3, 4].forEach(n => {
        const c = peak1Bin * n;
        for (let b = c - 3; b <= c + 3; b++) harmonicBins.add(b);
    });

    const features: SpectrumFeatures = {
        harmonicSlopeScore: calcSlopeScore(a1, a2, a3, a4),
        slopeMonotonicity: calcMonotonicity(a1, a2, a3, a4),
        snrScore: calcSnr(fft, a1, harmonicBins),
        peakSharpness: calcSharpness(fft, peak1Bin, a1),
        noiseFloorRatio: calcNoiseFloorRatio(fft, peak1Bin, a1, harmonicBins),
        // freqOriginScore // later
    };

    const composite =
        features.harmonicSlopeScore * WEIGHTS.harmonicSlopeScore +
        features.slopeMonotonicity * WEIGHTS.slopeMonotonicity +
        features.snrScore * WEIGHTS.snrScore +
        features.peakSharpness * WEIGHTS.peakSharpness;

    let rejectReason: string | null = null;
    if (features.snrScore < 0.01) rejectReason = 'snr_too_low';
    else if (features.harmonicSlopeScore < MIN_HARMONIC_SLOPE) rejectReason = 'slope_too_flat'
    else if (features.slopeMonotonicity < MIN_MONOTONICITY) rejectReason = 'slope_not_monotonic';
    else if (composite < TRUE_F_THRESHOLD) rejectReason = 'composite_score_low';
    else if (features.noiseFloorRatio < MIN_NOISE_FLOOR_RATIO) {
        rejectReason = 'noise_floor_too_high';
    }

    return {
        features,
        composite: parseFloat(composite.toFixed(4)),
        isTrueF: rejectReason === null,
        rejectReason,
    };
}