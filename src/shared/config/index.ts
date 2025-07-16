/**
 * Shared Configuration
 * 
 * Application-wide constants and configuration
 */

export const APP_NAME = 'EvorBrain';
export const APP_VERSION = '0.1.0';

// Task priority levels
export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

// Task status
export const TASK_STATUSES = ['todo', 'in_progress', 'completed'] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

// Export other configuration as needed