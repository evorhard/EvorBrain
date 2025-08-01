// API client for Tauri commands with full TypeScript support

import { invoke } from '@tauri-apps/api/core';
import type { LifeArea, Goal, Project, Task, Note, ProjectStatus } from '../types/models';
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

/**
 * Helper function to invoke Tauri commands with proper error handling
 * @template T - The expected return type from the command
 * @param command - The name of the Tauri command to invoke
 * @param args - Optional arguments to pass to the command
 * @returns Promise that resolves with the command result
 * @throws {EvorBrainError} Throws a wrapped error if the command fails
 * @internal
 */
async function invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    throw EvorBrainError.fromTauriError(error);
  }
}

/**
 * API for managing Life Areas - the top-level organizational units in EvorBrain
 * Life Areas represent major domains of life (e.g., Work, Health, Family)
 */
export const lifeAreaApi = {
  /**
   * Creates a new life area
   * @param request - The life area creation request containing name, description, color, and icon
   * @returns Promise that resolves with the created LifeArea
   * @throws {EvorBrainError} If creation fails or validation errors occur
   */
  create: (request: CreateLifeAreaRequest) =>
    invokeCommand<LifeArea>('create_life_area', { request }),

  /**
   * Retrieves all life areas
   * @returns Promise that resolves with an array of all LifeArea objects
   * @throws {EvorBrainError} If the database query fails
   */
  getAll: () => invokeCommand<LifeArea[]>('get_life_areas'),

  /**
   * Retrieves a specific life area by ID
   * @param id - The UUID of the life area to retrieve
   * @returns Promise that resolves with the requested LifeArea
   * @throws {EvorBrainError} If the life area is not found or query fails
   */
  getById: (id: string) => invokeCommand<LifeArea>('get_life_area', { id }),

  /**
   * Updates an existing life area
   * @param request - The update request containing the ID and fields to update
   * @returns Promise that resolves with the updated LifeArea
   * @throws {EvorBrainError} If the life area is not found or update fails
   */
  update: (request: UpdateLifeAreaRequest) =>
    invokeCommand<LifeArea>('update_life_area', { request }),

  /**
   * Soft deletes a life area (marks as archived)
   * @param id - The UUID of the life area to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {EvorBrainError} If the life area is not found or has active goals
   */
  delete: (id: string) => invokeCommand<void>('delete_life_area', { id }),

  /**
   * Restores a previously deleted life area
   * @param id - The UUID of the life area to restore
   * @returns Promise that resolves with the restored LifeArea
   * @throws {EvorBrainError} If the life area is not found or not archived
   */
  restore: (id: string) => invokeCommand<LifeArea>('restore_life_area', { id }),
};

/**
 * API for managing Goals - objectives within Life Areas
 * Goals are specific outcomes to achieve within a life area (e.g., "Run a marathon")
 */
export const goalApi = {
  /**
   * Creates a new goal within a life area
   * @param request - The goal creation request containing title, description, and life_area_id
   * @returns Promise that resolves with the created Goal
   * @throws {EvorBrainError} If creation fails or the life area doesn't exist
   */
  create: (request: CreateGoalRequest) => invokeCommand<Goal>('create_goal', { request }),

  /**
   * Retrieves all goals across all life areas
   * @returns Promise that resolves with an array of all Goal objects
   * @throws {EvorBrainError} If the database query fails
   */
  getAll: () => invokeCommand<Goal[]>('get_goals'),

  /**
   * Retrieves all goals for a specific life area
   * @param lifeAreaId - The UUID of the life area
   * @returns Promise that resolves with an array of Goals for the life area
   * @throws {EvorBrainError} If the query fails
   */
  getByLifeArea: (lifeAreaId: string) =>
    invokeCommand<Goal[]>('get_goals_by_life_area', { life_area_id: lifeAreaId }),

  /**
   * Retrieves a specific goal by ID
   * @param id - The UUID of the goal to retrieve
   * @returns Promise that resolves with the requested Goal
   * @throws {EvorBrainError} If the goal is not found or query fails
   */
  getById: (id: string) => invokeCommand<Goal>('get_goal', { id }),

  /**
   * Updates an existing goal
   * @param request - The update request containing the ID and fields to update
   * @returns Promise that resolves with the updated Goal
   * @throws {EvorBrainError} If the goal is not found or update fails
   */
  update: (request: UpdateGoalRequest) => invokeCommand<Goal>('update_goal', { request }),

  /**
   * Marks a goal as completed
   * @param id - The UUID of the goal to complete
   * @returns Promise that resolves with the completed Goal
   * @throws {EvorBrainError} If the goal is not found or already completed
   */
  complete: (id: string) => invokeCommand<Goal>('complete_goal', { id }),

  /**
   * Marks a completed goal as incomplete
   * @param id - The UUID of the goal to uncomplete
   * @returns Promise that resolves with the uncompleted Goal
   * @throws {EvorBrainError} If the goal is not found or not completed
   */
  uncomplete: (id: string) => invokeCommand<Goal>('uncomplete_goal', { id }),

  /**
   * Soft deletes a goal (marks as archived)
   * @param id - The UUID of the goal to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {EvorBrainError} If the goal is not found or has active projects
   */
  delete: (id: string) => invokeCommand<void>('delete_goal', { id }),

  /**
   * Restores a previously deleted goal
   * @param id - The UUID of the goal to restore
   * @returns Promise that resolves with the restored Goal
   * @throws {EvorBrainError} If the goal is not found or not archived
   */
  restore: (id: string) => invokeCommand<Goal>('restore_goal', { id }),
};

/**
 * API for managing Projects - concrete work items within Goals
 * Projects break down goals into actionable work with defined status
 */
export const projectApi = {
  /**
   * Creates a new project within a goal
   * @param request - The project creation request containing title, description, goal_id, and status
   * @returns Promise that resolves with the created Project
   * @throws {EvorBrainError} If creation fails or the goal doesn't exist
   */
  create: (request: CreateProjectRequest) => invokeCommand<Project>('create_project', { request }),

  /**
   * Retrieves all projects across all goals
   * @returns Promise that resolves with an array of all Project objects
   * @throws {EvorBrainError} If the database query fails
   */
  getAll: () => invokeCommand<Project[]>('get_projects'),

  /**
   * Retrieves all projects for a specific goal
   * @param goalId - The UUID of the goal
   * @returns Promise that resolves with an array of Projects for the goal
   * @throws {EvorBrainError} If the query fails
   */
  getByGoal: (goalId: string) =>
    invokeCommand<Project[]>('get_projects_by_goal', { goal_id: goalId }),

  /**
   * Retrieves a specific project by ID
   * @param id - The UUID of the project to retrieve
   * @returns Promise that resolves with the requested Project
   * @throws {EvorBrainError} If the project is not found or query fails
   */
  getById: (id: string) => invokeCommand<Project>('get_project', { id }),

  /**
   * Updates an existing project
   * @param request - The update request containing the ID and fields to update
   * @returns Promise that resolves with the updated Project
   * @throws {EvorBrainError} If the project is not found or update fails
   */
  update: (request: UpdateProjectRequest) => invokeCommand<Project>('update_project', { request }),

  /**
   * Updates the status of a project
   * @param id - The UUID of the project
   * @param status - The new ProjectStatus (not_started, in_progress, completed, on_hold, cancelled)
   * @returns Promise that resolves with the updated Project
   * @throws {EvorBrainError} If the project is not found or update fails
   */
  updateStatus: (id: string, status: ProjectStatus) =>
    invokeCommand<Project>('update_project_status', { id, status }),

  /**
   * Soft deletes a project and all its tasks (marks as archived)
   * @param id - The UUID of the project to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {EvorBrainError} If the project is not found
   */
  delete: (id: string) => invokeCommand<void>('delete_project', { id }),

  /**
   * Restores a previously deleted project
   * @param id - The UUID of the project to restore
   * @returns Promise that resolves with the restored Project
   * @throws {EvorBrainError} If the project is not found or not archived
   */
  restore: (id: string) => invokeCommand<Project>('restore_project', { id }),
};

/**
 * API for managing Tasks - actionable items within Projects
 * Tasks can have subtasks and are the primary unit of work in EvorBrain
 */
export const taskApi = {
  /**
   * Creates a new task within a project
   * @param request - The task creation request containing title, project_id, and optional fields
   * @returns Promise that resolves with the created Task
   * @throws {EvorBrainError} If creation fails or the project doesn't exist
   */
  create: (request: CreateTaskRequest) => invokeCommand<Task>('create_task', { request }),

  /**
   * Creates a new task with subtasks in a single operation
   * @param request - The request containing the main task and array of subtasks
   * @returns Promise that resolves with the created parent Task
   * @throws {EvorBrainError} If creation fails or validation errors occur
   */
  createWithSubtasks: (request: CreateTaskWithSubtasksRequest) =>
    invokeCommand<Task>('create_task_with_subtasks', { request }),

  /**
   * Retrieves all tasks across all projects
   * @returns Promise that resolves with an array of all Task objects
   * @throws {EvorBrainError} If the database query fails
   */
  getAll: () => invokeCommand<Task[]>('get_tasks'),

  /**
   * Retrieves all tasks for a specific project
   * @param projectId - The UUID of the project
   * @returns Promise that resolves with an array of Tasks for the project
   * @throws {EvorBrainError} If the query fails
   */
  getByProject: (projectId: string) =>
    invokeCommand<Task[]>('get_tasks_by_project', { project_id: projectId }),

  /**
   * Retrieves all subtasks of a parent task
   * @param parentTaskId - The UUID of the parent task
   * @returns Promise that resolves with an array of subtasks
   * @throws {EvorBrainError} If the query fails
   */
  getSubtasks: (parentTaskId: string) =>
    invokeCommand<Task[]>('get_subtasks', { parent_task_id: parentTaskId }),

  /**
   * Retrieves a specific task by ID
   * @param id - The UUID of the task to retrieve
   * @returns Promise that resolves with the requested Task
   * @throws {EvorBrainError} If the task is not found or query fails
   */
  getById: (id: string) => invokeCommand<Task>('get_task', { id }),

  /**
   * Updates an existing task
   * @param request - The update request containing the ID and fields to update
   * @returns Promise that resolves with the updated Task
   * @throws {EvorBrainError} If the task is not found or update fails
   */
  update: (request: UpdateTaskRequest) => invokeCommand<Task>('update_task', { request }),

  /**
   * Marks a task as completed
   * @param id - The UUID of the task to complete
   * @returns Promise that resolves with the completed Task
   * @throws {EvorBrainError} If the task is not found or already completed
   */
  complete: (id: string) => invokeCommand<Task>('complete_task', { id }),

  /**
   * Marks a completed task as incomplete
   * @param id - The UUID of the task to uncomplete
   * @returns Promise that resolves with the uncompleted Task
   * @throws {EvorBrainError} If the task is not found or not completed
   */
  uncomplete: (id: string) => invokeCommand<Task>('uncomplete_task', { id }),

  /**
   * Soft deletes a task (marks as archived)
   * @param id - The UUID of the task to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {EvorBrainError} If the task is not found
   */
  delete: (id: string) => invokeCommand<void>('delete_task', { id }),

  /**
   * Restores a previously deleted task
   * @param id - The UUID of the task to restore
   * @returns Promise that resolves with the restored Task
   * @throws {EvorBrainError} If the task is not found or not archived
   */
  restore: (id: string) => invokeCommand<Task>('restore_task', { id }),

  /**
   * Retrieves all tasks due today
   * @returns Promise that resolves with an array of Tasks due today
   * @throws {EvorBrainError} If the database query fails
   */
  getTodaysTasks: () => invokeCommand<Task[]>('get_todays_tasks'),
};

/**
 * API for managing Notes - markdown content attached to any entity
 * Notes can be associated with tasks, projects, goals, or life areas
 */
export const noteApi = {
  /**
   * Creates a new note attached to an entity
   * @param request - The note creation request with title, content, and optional parent entity ID
   * @returns Promise that resolves with the created Note
   * @throws {EvorBrainError} If creation fails or parent entity doesn't exist
   */
  create: (request: CreateNoteRequest) => invokeCommand<Note>('create_note', { request }),

  /**
   * Retrieves all notes across all entities
   * @returns Promise that resolves with an array of all Note objects
   * @throws {EvorBrainError} If the database query fails
   */
  getAll: () => invokeCommand<Note[]>('get_notes'),

  /**
   * Retrieves all notes attached to a specific task
   * @param taskId - The UUID of the task
   * @returns Promise that resolves with an array of Notes for the task
   * @throws {EvorBrainError} If the query fails
   */
  getByTask: (taskId: string) => invokeCommand<Note[]>('get_notes_by_task', { task_id: taskId }),

  /**
   * Retrieves all notes attached to a specific project
   * @param projectId - The UUID of the project
   * @returns Promise that resolves with an array of Notes for the project
   * @throws {EvorBrainError} If the query fails
   */
  getByProject: (projectId: string) =>
    invokeCommand<Note[]>('get_notes_by_project', { project_id: projectId }),

  /**
   * Retrieves all notes attached to a specific goal
   * @param goalId - The UUID of the goal
   * @returns Promise that resolves with an array of Notes for the goal
   * @throws {EvorBrainError} If the query fails
   */
  getByGoal: (goalId: string) => invokeCommand<Note[]>('get_notes_by_goal', { goal_id: goalId }),

  /**
   * Retrieves all notes attached to a specific life area
   * @param lifeAreaId - The UUID of the life area
   * @returns Promise that resolves with an array of Notes for the life area
   * @throws {EvorBrainError} If the query fails
   */
  getByLifeArea: (lifeAreaId: string) =>
    invokeCommand<Note[]>('get_notes_by_life_area', { life_area_id: lifeAreaId }),

  /**
   * Retrieves a specific note by ID
   * @param id - The UUID of the note to retrieve
   * @returns Promise that resolves with the requested Note
   * @throws {EvorBrainError} If the note is not found or query fails
   */
  getById: (id: string) => invokeCommand<Note>('get_note', { id }),

  /**
   * Updates an existing note
   * @param request - The update request containing the ID and fields to update
   * @returns Promise that resolves with the updated Note
   * @throws {EvorBrainError} If the note is not found or update fails
   */
  update: (request: UpdateNoteRequest) => invokeCommand<Note>('update_note', { request }),

  /**
   * Soft deletes a note (marks as archived)
   * @param id - The UUID of the note to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {EvorBrainError} If the note is not found
   */
  delete: (id: string) => invokeCommand<void>('delete_note', { id }),

  /**
   * Restores a previously deleted note
   * @param id - The UUID of the note to restore
   * @returns Promise that resolves with the restored Note
   * @throws {EvorBrainError} If the note is not found or not archived
   */
  restore: (id: string) => invokeCommand<Note>('restore_note', { id }),

  /**
   * Searches notes by content using full-text search
   * @param query - The search query string
   * @returns Promise that resolves with an array of matching Notes
   * @throws {EvorBrainError} If the search query fails
   */
  search: (query: string) => invokeCommand<Note[]>('search_notes', { query }),
};

/**
 * API for managing database migrations
 * Handles schema versioning and database structure updates
 */
export const migrationApi = {
  /**
   * Gets the current migration status of the database
   * @returns Promise that resolves with the MigrationStatus including current version
   * @throws {EvorBrainError} If unable to check migration status
   */
  getStatus: () => invokeCommand<MigrationStatus>('get_migration_status'),

  /**
   * Runs all pending database migrations
   * @returns Promise that resolves with MigrationResult including applied migrations
   * @throws {EvorBrainError} If migration execution fails
   */
  runMigrations: () => invokeCommand<MigrationResult>('run_migrations'),

  /**
   * Rolls back the database to a specific migration version
   * @param version - The target migration version to rollback to
   * @returns Promise that resolves with MigrationResult
   * @throws {EvorBrainError} If rollback fails or version is invalid
   */
  rollback: (version: number) => invokeCommand<MigrationResult>('rollback_migration', { version }),

  /**
   * Resets the database by dropping all tables and running migrations from scratch
   * @returns Promise that resolves with MigrationResult
   * @throws {EvorBrainError} If reset fails
   * @warning This will delete all data in the database!
   */
  reset: () => invokeCommand<MigrationResult>('reset_database'),
};

/**
 * API for database testing and diagnostics
 */
export const databaseApi = {
  /**
   * Tests the database connection
   * @returns Promise that resolves with a success message
   * @throws {EvorBrainError} If the database connection test fails
   */
  test: () => invokeCommand<string>('test_database'),
};

/**
 * API for application logging and diagnostics
 * Manages log retrieval and log level configuration
 */
export const loggingApi = {
  /**
   * Retrieves recent application logs
   * @param request - Optional filter request with level, limit, and since parameters
   * @returns Promise that resolves with an array of LogEntry objects
   * @throws {EvorBrainError} If log retrieval fails
   */
  getRecentLogs: (request?: GetLogsRequest) =>
    invokeCommand<LogEntry[]>('get_recent_logs', { request: request || {} }),

  /**
   * Sets the application log level
   * @param level - The LogLevel to set (trace, debug, info, warn, error)
   * @returns Promise that resolves when the log level is updated
   * @throws {EvorBrainError} If setting the log level fails
   */
  setLogLevel: (level: LogLevel) => invokeCommand<void>('set_log_level', { level }),
};

/**
 * API for database repository operations
 * Provides database maintenance, health checks, and data export functionality
 */
export const repositoryApi = {
  /**
   * Checks the health of the database repository
   * @returns Promise that resolves with TransactionResult containing health status
   * @throws {EvorBrainError} If health check fails
   */
  checkHealth: () => invokeCommand<TransactionResult>('check_repository_health'),

  /**
   * Performs batch deletion of multiple entities
   * @param request - The batch delete request with entity IDs to delete
   * @returns Promise that resolves with TransactionResult
   * @throws {EvorBrainError} If batch deletion fails
   */
  batchDelete: (request: BatchDeleteRequest) =>
    invokeCommand<TransactionResult>('batch_delete', { request }),

  /**
   * Retrieves database statistics including entity counts and storage info
   * @returns Promise that resolves with DatabaseStats
   * @throws {EvorBrainError} If statistics retrieval fails
   */
  getStats: () => invokeCommand<DatabaseStats>('get_database_stats'),

  /**
   * Performs database cleanup operations
   * @param options - Cleanup options specifying what to clean
   * @returns Promise that resolves with TransactionResult
   * @throws {EvorBrainError} If cleanup operation fails
   */
  cleanup: (options: CleanupOptions) =>
    invokeCommand<TransactionResult>('cleanup_database', { options }),

  /**
   * Exports all database data in the specified format
   * @param request - Export request with format and options
   * @returns Promise that resolves with ExportResult containing exported data
   * @throws {EvorBrainError} If data export fails
   */
  exportData: (request: ExportRequest) =>
    invokeCommand<ExportResult>('export_all_data', { request }),
};

/**
 * Unified API object providing access to all EvorBrain backend functionality
 * Use this for convenient access to all API modules
 * @example
 * ```typescript
 * import { api } from './lib/api';
 *
 * // Create a new life area
 * const lifeArea = await api.lifeArea.create({ name: 'Work', ... });
 *
 * // Get all tasks for today
 * const todaysTasks = await api.task.getTodaysTasks();
 * ```
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
