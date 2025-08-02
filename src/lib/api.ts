/**
 * Legacy API exports for backward compatibility
 *
 * This file maintains the existing API structure while redirecting
 * to the new modular API implementation.
 *
 * @deprecated Use imports from './lib/api' instead
 */

import { api as apiClient, createApiClient } from './api/index';
import type { LogEntry, LogLevel, GetLogsRequest } from '../types/logging';
import type {
  TransactionResult,
  BatchDeleteRequest,
  DatabaseStats,
  CleanupOptions,
  ExportRequest,
  ExportResult,
} from '../types';

// Re-export the createApiClient function
export { createApiClient };

// Re-export the main API modules

export const lifeAreaApi = apiClient.lifeArea;

export const goalApi = apiClient.goal;

export const projectApi = apiClient.project;

export const taskApi = apiClient.task;

export const noteApi = apiClient.note;

export const migrationApi = apiClient.migration;

// Additional APIs not in the interface yet
import { TauriApiClient } from './api/tauri-client';
const tauriClient = new TauriApiClient();

export const databaseApi = {
  test: () => tauriClient['invokeCommand']<string>('test_database'),
};

export const loggingApi = {
  getRecentLogs: (request?: GetLogsRequest) =>
    tauriClient['invokeCommand']<LogEntry[]>('get_recent_logs', { request: request || {} }),
  setLogLevel: (level: LogLevel) => tauriClient['invokeCommand']<void>('set_log_level', { level }),
};

export const repositoryApi = {
  checkHealth: () => tauriClient['invokeCommand']<TransactionResult>('check_repository_health'),
  batchDelete: (request: BatchDeleteRequest) =>
    tauriClient['invokeCommand']<TransactionResult>('batch_delete', { request }),
  getStats: () => tauriClient['invokeCommand']<DatabaseStats>('get_database_stats'),
  cleanup: (options: CleanupOptions) =>
    tauriClient['invokeCommand']<TransactionResult>('cleanup_database', { options }),
  exportData: (request: ExportRequest) =>
    tauriClient['invokeCommand']<ExportResult>('export_all_data', { request }),
};

/**
 * Unified API object providing access to all EvorBrain backend functionality
 * @deprecated Use the new API from './lib/api' instead
 */
export const api = {
  lifeArea: lifeAreaApi,
  goal: goalApi,
  project: projectApi,
  task: taskApi,
  note: noteApi,
  migration: migrationApi,
  database: databaseApi,
  logging: loggingApi,
  repository: repositoryApi,
} as const;

// Re-export new API modules and types
export type { ApiClient, ApiClientOptions } from './api';
