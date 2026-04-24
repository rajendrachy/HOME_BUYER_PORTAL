/**
 * Formats a given time duration in seconds into a human-readable string.
 * - Under 1 minute: "X seconds"
 * - 1 minute to 59 minutes: "X minutes"
 * - 1 hour to 23 hours: "X hours"
 * - 1 day or more: "X days"
 * 
 * @param {number} seconds - The number of seconds elapsed.
 * @returns {string} - The formatted time string.
 */
export const formatTimeElapsed = (seconds) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ${minutes % 60}m`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
};

/**
 * Formats a Date object or timestamp into a relative human-readable string.
 * @param {Date|string|number} date - The date to format.
 * @returns {string} - The formatted relative time.
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Recent';
  const elapsed = Math.floor((new Date() - new Date(date)) / 1000);
  return formatTimeElapsed(elapsed);
};
