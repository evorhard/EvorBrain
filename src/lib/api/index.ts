/**
 * API client exports for EvorBrain
 *
 * This module provides the main API interface and implementations
 * for communicating with the Tauri backend.
 */

export type { ApiClient, ApiClientOptions } from './interface';
export { TauriApiClient } from './tauri-client';
export { TestApiClient } from './test-double';

import { TauriApiClient } from './tauri-client';

/**
 * Default API client instance for the application.
 * This is the main entry point for all API calls.
 *
 * @example
 * ```typescript
 * import { api } from './lib/api';
 *
 * // Create a new life area
 * const lifeArea = await api.lifeArea.create({ name: 'Work' });
 *
 * // Get all tasks for today
 * const tasks = await api.task.getTodaysTasks();
 * ```
 */
export const api = new TauriApiClient({
  debug: process.env.NODE_ENV === 'development',
});

/**
 * Create a custom API client with specific options
 *
 * @example
 * ```typescript
 * const customApi = createApiClient({
 *   debug: true,
 *   onError: (error) => console.error('API Error:', error),
 *   onRequest: (command, args) => console.log('Request:', command, args),
 * });
 * ```
 */
export function createApiClient(options?: ApiClientOptions): ApiClient {
  return new TauriApiClient(options);
}
