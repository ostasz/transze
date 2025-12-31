
import { format } from 'date-fns';

/**
 * Safely parses a date string that might be in YYYY-MM-DD or DD.MM.YYYY format.
 * Returns a valid Date object or falls back to current date (or handles invalidity gracefully elsewhere).
 */
export const safeParseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();

    // Handle DD.MM.YYYY (Polish format often seen in TGE data)
    if (dateStr.includes('.')) {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            // "15.03.2024" -> "2024-03-15"
            // parts[2] = YYYY, parts[1] = MM, parts[0] = DD
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
    }

    // Handle DD/MM/YYYY
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
    }

    // Fallback to standard parser (handles YYYY-MM-DD)
    const d = new Date(dateStr);

    // If invalid, try to return a valid object (or caller handles NaN check)
    // We return the object even if Invalid Date so caller can check isValid if needed, 
    // but usually for UI display we want to avoid crashing.
    return d;
};

export const safeFormatDate = (dateStr: string, fmt: string = 'dd.MM.yyyy'): string => {
    const d = safeParseDate(dateStr);
    if (isNaN(d.getTime())) return dateStr; // Return original string if parse fails
    return format(d, fmt);
};
