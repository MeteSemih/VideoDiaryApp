/**
 * Format a date string to readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate duration between two timestamps
 * @param startTime - Start time in seconds
 * @param endTime - End time in seconds
 * @returns Formatted duration string (MM:SS)
 */
export const calculateDuration = (startTime: number, endTime: number): string => {
  const duration = endTime - startTime;
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format seconds to MM:SS format
 * @param seconds - Total seconds
 * @returns Formatted time string (MM:SS)
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format seconds to human readable format (e.g., "1m 30s")
 * @param seconds - Total seconds
 * @returns Formatted string with minutes and seconds
 */
export const formatDurationHuman = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  if (minutes === 0) {
    return `${secs}s`;
  }
  if (secs === 0) {
    return `${minutes}m`;
  }
  return `${minutes}m ${secs}s`;
};