// API client for Tauri commands with full TypeScript support

import { invoke } from '@tauri-apps/api/core';
import type {
  LifeArea,
  Goal,
  Project,
  Task,
  Note,
  ProjectStatus,
} from '../types/models';
import type {
  CreateLifeAreaRequest,
  UpdateLifeAreaRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  CreateTaskWithSubtasksRequest,
  UpdateTaskRequest,
  CreateNoteRequest,
  UpdateNoteRequest,
  MigrationStatus,
  MigrationResult,
} from '../types/commands';
import { EvorBrainError } from '../types/errors';
import type { LogEntry, LogLevel, GetLogsRequest } from '../types/logging';
import type {
  TransactionResult,
  BatchDeleteRequest,
  DatabaseStats,
  CleanupOptions,
  ExportRequest,
  ExportResult,
} from '../types/repository';

// Helper function to invoke Tauri commands with proper error handling
async function invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    throw EvorBrainError.fromTauriError(error);
  }
}

// Life Area API
export const lifeAreaApi = {
  create: (request: CreateLifeAreaRequest) =>
    invokeCommand<LifeArea>('create_life_area', { request }),

  getAll: () =>
    invokeCommand<LifeArea[]>('get_life_areas'),

  getById: (id: string) =>
    invokeCommand<LifeArea>('get_life_area', { id }),

  update: (request: UpdateLifeAreaRequest) =>
    invokeCommand<LifeArea>('update_life_area', { request }),

  delete: (id: string) =>
    invokeCommand<void>('delete_life_area', { id }),

  restore: (id: string) =>
    invokeCommand<LifeArea>('restore_life_area', { id }),
};

// Goal API
export const goalApi = {
  create: (request: CreateGoalRequest) =>
    invokeCommand<Goal>('create_goal', { request }),

  getAll: () =>
    invokeCommand<Goal[]>('get_goals'),

  getByLifeArea: (lifeAreaId: string) =>
    invokeCommand<Goal[]>('get_goals_by_life_area', { life_area_id: lifeAreaId }),

  getById: (id: string) =>
    invokeCommand<Goal>('get_goal', { id }),

  update: (request: UpdateGoalRequest) =>
    invokeCommand<Goal>('update_goal', { request }),

  complete: (id: string) =>
    invokeCommand<Goal>('complete_goal', { id }),

  uncomplete: (id: string) =>
    invokeCommand<Goal>('uncomplete_goal', { id }),

  delete: (id: string) =>
    invokeCommand<void>('delete_goal', { id }),

  restore: (id: string) =>
    invokeCommand<Goal>('restore_goal', { id }),
};

// Project API
export const projectApi = {
  create: (request: CreateProjectRequest) =>
    invokeCommand<Project>('create_project', { request }),

  getAll: () =>
    invokeCommand<Project[]>('get_projects'),

  getByGoal: (goalId: string) =>
    invokeCommand<Project[]>('get_projects_by_goal', { goal_id: goalId }),

  getById: (id: string) =>
    invokeCommand<Project>('get_project', { id }),

  update: (request: UpdateProjectRequest) =>
    invokeCommand<Project>('update_project', { request }),

  updateStatus: (id: string, status: ProjectStatus) =>
    invokeCommand<Project>('update_project_status', { id, status }),

  delete: (id: string) =>
    invokeCommand<void>('delete_project', { id }),

  restore: (id: string) =>
    invokeCommand<Project>('restore_project', { id }),
};

// Task API
export const taskApi = {
  create: (request: CreateTaskRequest) =>
    invokeCommand<Task>('create_task', { request }),

  createWithSubtasks: (request: CreateTaskWithSubtasksRequest) =>
    invokeCommand<Task>('create_task_with_subtasks', { request }),

  getAll: () =>
    invokeCommand<Task[]>('get_tasks'),

  getByProject: (projectId: string) =>
    invokeCommand<Task[]>('get_tasks_by_project', { project_id: projectId }),

  getSubtasks: (parentTaskId: string) =>
    invokeCommand<Task[]>('get_subtasks', { parent_task_id: parentTaskId }),

  getById: (id: string) =>
    invokeCommand<Task>('get_task', { id }),

  update: (request: UpdateTaskRequest) =>
    invokeCommand<Task>('update_task', { request }),

  complete: (id: string) =>
    invokeCommand<Task>('complete_task', { id }),

  uncomplete: (id: string) =>
    invokeCommand<Task>('uncomplete_task', { id }),

  delete: (id: string) =>
    invokeCommand<void>('delete_task', { id }),

  restore: (id: string) =>
    invokeCommand<Task>('restore_task', { id }),

  getTodaysTasks: () =>
    invokeCommand<Task[]>('get_todays_tasks'),
};

// Note API
export const noteApi = {
  create: (request: CreateNoteRequest) =>
    invokeCommand<Note>('create_note', { request }),

  getAll: () =>
    invokeCommand<Note[]>('get_notes'),

  getByTask: (taskId: string) =>
    invokeCommand<Note[]>('get_notes_by_task', { task_id: taskId }),

  getByProject: (projectId: string) =>
    invokeCommand<Note[]>('get_notes_by_project', { project_id: projectId }),

  getByGoal: (goalId: string) =>
    invokeCommand<Note[]>('get_notes_by_goal', { goal_id: goalId }),

  getByLifeArea: (lifeAreaId: string) =>
    invokeCommand<Note[]>('get_notes_by_life_area', { life_area_id: lifeAreaId }),

  getById: (id: string) =>
    invokeCommand<Note>('get_note', { id }),

  update: (request: UpdateNoteRequest) =>
    invokeCommand<Note>('update_note', { request }),

  delete: (id: string) =>
    invokeCommand<void>('delete_note', { id }),

  restore: (id: string) =>
    invokeCommand<Note>('restore_note', { id }),

  search: (query: string) =>
    invokeCommand<Note[]>('search_notes', { query }),
};

// Migration API
export const migrationApi = {
  getStatus: () =>
    invokeCommand<MigrationStatus>('get_migration_status'),

  runMigrations: () =>
    invokeCommand<MigrationResult>('run_migrations'),

  rollback: (version: number) =>
    invokeCommand<MigrationResult>('rollback_migration', { version }),

  reset: () =>
    invokeCommand<MigrationResult>('reset_database'),
};

// Database test API
export const databaseApi = {
  test: () =>
    invokeCommand<string>('test_database'),
};

// Logging API
export const loggingApi = {
  getRecentLogs: (request?: GetLogsRequest) =>
    invokeCommand<LogEntry[]>('get_recent_logs', { request: request || {} }),
    
  setLogLevel: (level: LogLevel) =>
    invokeCommand<void>('set_log_level', { level }),
};

// Repository API
export const repositoryApi = {
  checkHealth: () =>
    invokeCommand<TransactionResult>('check_repository_health'),
    
  batchDelete: (request: BatchDeleteRequest) =>
    invokeCommand<TransactionResult>('batch_delete', { request }),
    
  getStats: () =>
    invokeCommand<DatabaseStats>('get_database_stats'),
    
  cleanup: (options: CleanupOptions) =>
    invokeCommand<TransactionResult>('cleanup_database', { options }),
    
  exportData: (request: ExportRequest) =>
    invokeCommand<ExportResult>('export_all_data', { request }),
};

// Export everything as a single API object for convenience
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