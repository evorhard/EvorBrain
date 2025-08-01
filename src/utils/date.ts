/**
 * Formats a date string into a human-readable format
 * @param dateString - ISO 8601 date string to format
 * @returns Formatted date string:
 *   - Today: shows time (e.g., "2:30 PM")
 *   - This year: shows month and day (e.g., "Jan 15")
 *   - Other years: shows full date (e.g., "Jan 15, 2023")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // If today, show time
  if (diffDays === 0 && date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  // If this year, don't show year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  // Otherwise show full date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a date string into a relative format
 * @param dateString - ISO 8601 date string to format
 * @returns Relative date string:
 *   - "Today" for current day
 *   - "Yesterday" for previous day
 *   - "Tomorrow" for next day
 *   - "X days ago" for recent past (up to 7 days)
 *   - "in X days" for near future (up to 7 days)
 *   - Otherwise uses formatDate() output
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 0 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 0 && diffDays > -7) return `in ${Math.abs(diffDays)} days`;

  return formatDate(dateString);
}

/**
 * Checks if a date is in the past (overdue)
 * @param dateString - ISO 8601 date string to check
 * @returns true if the date is before today (midnight comparison)
 */
export function isOverdue(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < now;
}

/**
 * Calculates the number of days until a given date
 * @param dateString - ISO 8601 date string to calculate days until
 * @returns Number of days until the date (negative if in the past)
 */
export function getDaysUntil(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
