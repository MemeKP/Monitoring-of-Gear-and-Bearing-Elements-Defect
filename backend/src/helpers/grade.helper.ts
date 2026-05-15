export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type StatusLabel = 'Normal' | 'Careful' | 'Warning' | 'Critical';

/**
 * Converts state (1-6) → letter grade
 * Matches the color coding in the Figma dashboard.
 */
export function computeGrade(state: number | null): Grade {
    if (state === null) return 'A';

    switch (state) {
        case 6: return 'F';
        case 5: return 'E';
        case 4: return 'D';
        case 3: return 'C';
        case 2: return 'B';
        case 1: return 'A';
        default: return 'A'; 
    }
}

/** Converts grade → status label shown on dashboard chips */
export function gradeToStatus(grade: Grade): StatusLabel {
    if (grade === 'F') return 'Critical';
    if (grade === 'E') return 'Warning';
    if (grade === 'D') return 'Careful';
    return 'Normal';
}

/** Calculates days since a measurement date */
export function daysSinceCheck(measDate: string): number {
    const measured = new Date(measDate);
    const today = new Date();
    const diffMs = today.getTime() - measured.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}