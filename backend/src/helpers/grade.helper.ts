export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type StatusLabel = 'Normal' | 'Careful' | 'Warning' | 'Critical';

/**
 * Converts adj_opt_point_value → letter grade
 * Matches the color coding in the Figma dashboard.
 */
export function computeGrade(adjOptPointValue: number | null): Grade {
    if (adjOptPointValue === null) return 'A';

    if (adjOptPointValue > 30.0) return 'F';
    if (adjOptPointValue > 20.0) return 'E';
    if (adjOptPointValue > 15.0) return 'D';
    if (adjOptPointValue > 10.0) return 'C';
    if (adjOptPointValue > 5.0) return 'B';
    return 'A';
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