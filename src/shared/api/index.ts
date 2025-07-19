/**
 * Shared API Layer
 * 
 * Common API utilities and Tauri IPC wrappers
 */

import { invoke } from '@tauri-apps/api/core';
import { apiLogger } from '../lib/logger';

// Type-safe invoke wrapper
export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    apiLogger.error(`Error invoking command ${command}:`, error);
    throw error;
  }
}

// Export other API utilities as they are created