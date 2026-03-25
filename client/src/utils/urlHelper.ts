/**
 * Ensures a URL is absolute. If it starts with 'www.' or doesn't have a protocol,
 * it prepends 'https://'.
 */
export const ensureAbsoluteUrl = (url: string | undefined): string => {
    if (!url || url === '#' || url === '' || url === 'https://') return '#';

    const trimmedUrl = url.trim().replace(/^https?:\/\//i, '');

    // Re-add https:// for all valid social/web links
    if (trimmedUrl.includes('.') || trimmedUrl.includes('/')) {
        return `https://${trimmedUrl}`;
    }

    if (trimmedUrl.startsWith('www.')) {
        return `https://${trimmedUrl}`;
    }

    // If it's just a handle (no dot or slash), we skip it as it's not a full URL
    // But if it has a dot (facebook.com) or a slash (facebook.com/profile), we prepend https://
    if (trimmedUrl.includes('.') || trimmedUrl.includes('/')) {
        return `https://${trimmedUrl}`;
    }

    // If it's just a fragment or already handled
    return trimmedUrl.startsWith('/') ? trimmedUrl : '#';
};

/**
 * Formats experience years to ensure it has a single '+' suffix if not already present.
 * Avoids double suffixes like '11++'.
 */
export const formatExperience = (exp: string | undefined): string => {
    if (!exp) return '10+';

    // Extract numbers only to prevent symbols like '++'
    const match = exp.match(/\d+/);
    if (match) {
        return `${match[0]}+`;
    }

    // Fallback if no digits found, but ensure it's not empty
    const trimmed = exp.trim();
    return trimmed ? (trimmed.endsWith('+') ? trimmed : `${trimmed}+`) : '10+';
};
