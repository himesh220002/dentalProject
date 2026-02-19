/**
 * Parses a date and time string into a valid Date object.
 * Supports "HH:mm" (24h) and "hh:mm AM/PM" (12h) formats.
 * @param dateStr ISO date string or similar
 * @param timeStr Time string in HH:mm or hh:mm AM/PM format
 * @returns Date object
 */
export const parseDateTime = (dateStr: string, timeStr: string): Date => {
    const date = new Date(dateStr);

    // Default to midnight if time is missing
    if (!timeStr) {
        date.setHours(0, 0, 0, 0);
        return date;
    }

    let hours = 0;
    let minutes = 0;

    const time12Match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    const time24Match = timeStr.match(/^(\d{1,2}):(\d{2})$/);

    if (time12Match) {
        hours = parseInt(time12Match[1]);
        minutes = parseInt(time12Match[2]);
        const ampm = time12Match[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
    } else if (time24Match) {
        hours = parseInt(time24Match[1]);
        minutes = parseInt(time24Match[2]);
    }

    date.setHours(hours, minutes, 0, 0);
    return date;
};
