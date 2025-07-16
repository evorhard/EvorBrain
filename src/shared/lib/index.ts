/**
 * Shared Libraries and Utilities
 * 
 * Common utility functions and helpers
 */

// Utility for combining class names (for Tailwind CSS)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Export other utilities as they are created