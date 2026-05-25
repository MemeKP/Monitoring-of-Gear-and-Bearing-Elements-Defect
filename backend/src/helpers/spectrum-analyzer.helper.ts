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

// function extractFeatures(fft: number[][], f0: number, bpfo: number): SpectrumFeatures {
//     const harmonics = [1, 2, 3, 4].map(n => {
//         const targetBin = Math.round((bpfo * n) / f0);
//         return getAmplitudeNearBin(fft, targetBin, 3); 

//     })
// }