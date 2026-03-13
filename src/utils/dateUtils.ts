/**
 * Formats a Unix timestamp as a short date string (e.g. "Jan 5, 2025").
 */
export const formatShortDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats a Unix timestamp as a long date-time string
 * (e.g. "January 5, 2025, 02:30 PM").
 */
export const formatLongDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
