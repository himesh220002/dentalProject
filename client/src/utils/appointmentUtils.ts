/**
 * Parses an appointment reason string into treatment name and notes.
 * Format: "Treatment Name (Notes)" or "Treatment Name(Notes)"
 * @param reason The reason string from the appointment
 * @returns An object containing the treatmentName and notes
 */
export const parseAppointmentReason = (reason: string = '') => {
    if (!reason) return { treatmentName: 'N/A', notes: '' };

    // Matches the part before the LAST opening parenthesis and the part inside the parentheses
    // Using [\s\S]* instead of .* with 's' flag for compatibility
    const lastParenMatch = reason.match(/([\s\S]*)\s?\(([\s\S]*)\)\s*$/);

    if (lastParenMatch) {
        return {
            treatmentName: lastParenMatch[1].trim(),
            notes: lastParenMatch[2].trim()
        };
    }

    return { treatmentName: reason.trim(), notes: '' };
};

/**
 * Cleans up legacy auto-generated notes to remove redundant fillers.
 * Legacy format: "Patient visited for [Reason]. Procedure completed and fee of [Amount] was collected."
 * @param notes The raw notes string
 * @returns Cleaned notes
 */
export const cleanNotes = (notes: string = '') => {
    if (!notes) return '';

    const legacyPrefix = 'Patient visited for ';
    const legacyInfix = '. Procedure completed and fee of ';

    if (notes.startsWith(legacyPrefix) && notes.includes(legacyInfix)) {
        // Extract the reason part that was embedded in the legacy note
        const reasonPart = notes.substring(legacyPrefix.length, notes.indexOf(legacyInfix));
        const parsed = parseAppointmentReason(reasonPart);
        return parsed.notes || 'Procedure completed.';
    }

    return notes;
};
