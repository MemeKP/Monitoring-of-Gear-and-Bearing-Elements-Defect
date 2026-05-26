/**
 * Main Responsibility:
 *  This file will calculate all 5 rules
 * 1. Harmonic Slope Score (35%)
 * 2. Slope Monotonicity (25%)
 * 3. SNR Db (20%)
 * 4. Side Band Symmetry (10%)
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
interface SpectrumFeatures {
    harmonicsSlopeScore: number;
    slopeMonotonicity: number;
    snrDb: number;
    sidebandSymmetry: number;
    peakSharpness: number;
    noiseFloorRms: number;
}

interface SpectrumScore {
    features: SpectrumFeatures;
    composite: number;
    isTrueF: boolean;
    rejectReason: string | null;
}

const WEIGHTS = {
    harmonicSlopeScore: 0.40,
    slopeMonotonicity: 0.30,
    snrScore: 0.2,
    peakSharpness: 0.10,
} as const

const TRUE_F_THRESHOLD = 0.65;
const MIN_SNR_DB = 10; // if it below this then filter out
const MIN_MONOTONICITY = 0.34; // must pass atleast 1/3 pairs

function clamp(v: number, min:number, max:number){
    return Math.max;
}

function ampNear(fft: number[], bin:number, win = 2): number{
    let max = 0
    for(let i= Math.max(0, bin - win); i<= Math.min(fft.length - 1, bin+win); i++){
        if (fft[i] > max) max = fft[i]
    }
    return max
}