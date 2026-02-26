/**
 * Ensures a URL is absolute. If it starts with 'www.' or doesn't have a protocol,
 * it prepends 'https://'.
 */
export const ensureAbsoluteUrl = (url: string | undefined): string => {
    if (!url || url === '#' || url === '') return '#';

    const trimmedUrl = url.trim();

    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        return trimmedUrl;
    }

    if (trimmedUrl.startsWith('www.')) {
        return `https://${trimmedUrl}`;
    }

    // If it's a social handle (e.g., 'drtooth'), we might need more logic, 
    // but for now let's assume if it doesn't have a slash or dot it's just a handle
    // Actually, usually users enter 'facebook.com/profile'
    if (trimmedUrl.includes('.') || trimmedUrl.includes('/')) {
        return `https://${trimmedUrl}`;
    }

    return trimmedUrl; // fallback for fragments or internal links if needed, but mostly for social
};

/**
 * Formats experience years to ensure it has a single '+' suffix if not already present.
 * Avoids double suffixes like '11++'.
 */
export const formatExperience = (exp: string | undefined): string => {
    if (!exp) return '10+';

    const trimmed = exp.trim();
    if (trimmed.endsWith('+')) {
        return trimmed;
    }

    return `${trimmed}+`;
};
