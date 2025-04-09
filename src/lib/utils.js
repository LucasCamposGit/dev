// lib/utils.js

/**
 * Formats a date string into a relative time string (e.g., "5m", "2h", "3d")
 * or a short date format (e.g., "Apr 8", "Apr 8, 2024").
 * @param {string} dateString - An ISO 8601 compatible date string.
 * @returns {string} - The formatted date string.
 */
export function formatDate(dateString) {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn(`Invalid dateString passed to formatDate: ${dateString}`);
            return '';
        }

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds}s`;
        } else if (diffInSeconds < 3600) { // Less than 1 hour
            return `${Math.floor(diffInSeconds / 60)}m`;
        } else if (diffInSeconds < 86400) { // Less than 1 day
            return `${Math.floor(diffInSeconds / 3600)}h`;
        } else if (diffInSeconds < 604800) { // Less than 1 week
            return `${Math.floor(diffInSeconds / 86400)}d`;
        } else {
            // Use Intl.DateTimeFormat for locale-aware formatting
            const options = { month: 'short', day: 'numeric' };
            if (date.getFullYear() !== now.getFullYear()) {
                options.year = 'numeric';
            }
            // Specify 'en-US' locale for consistency or rely on user's locale (undefined)
            return new Intl.DateTimeFormat('en-US', options).format(date);
        }
    } catch (error) {
        console.error(`Error formatting date: ${dateString}`, error);
        return ''; // Return empty string on error
    }
}
