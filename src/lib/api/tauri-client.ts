import { invoke } from '@tauri-apps/api/core';
import { isTauri, mockInvoke } from '../tauriCheck';
import type { ApiClient, ApiClientOptions } from './interface';
import type {
  LifeArea,
  Goal,
  Project,
  Task,
  Note,
  MigrationStatus,
} from '../../types/models';
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
} from '../../types/commands';
import { EvorBrainError } from '../../types/errors';

/**
 * Tauri implementation of the API client interface.
 * This is the real implementation that communicates with the Tauri backend.
 */
export class TauriApiClient implements ApiClient {
  constructor(private options?: ApiClientOptions) {}

  /**
   * Helper function to invoke Tauri commands with proper error handling
   */
  private async invokeCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
    try {
      this.options?.onRequest?.(command, args);
      
      let result: T;
      if (isTauri()) {
        result = await invoke<T>(command, args);
      } else {
        // Use mock for development in browser
        result = await mockInvoke(command, args) as T;
      }
      
      this.options?.onResponse?.(command, result);
      return result;
    } catch (error) {
      const wrappedError = EvorBrainError.fromTauriError(error);
      this.options?.onError?.(wrappedError);
      throw wrappedError;
    }
  }

  // Migration operations
  migration = {
    getStatus: () => this.invokeCommand<MigrationStatus>('get_migration_status'),
    run: () => this.invokeCommand<void>('run_migrations'),
    rollback: (version: number) => this.invokeCommand<void>('rollback_migration', { version }),
    reset: () => this.invokeCommand<void>('reset_database'),
  };

  // Life Area operations
  lifeArea = {
    getAll: () => this.invokeCommand<LifeArea[]>('get_life_areas'),
    getOne: (id: string) => this.invokeCommand<LifeArea>('get_life_area', { id }),
    create: (data: CreateLifeAreaRequest) =>
      this.invokeCommand<LifeArea>('create_life_area', { request: data }),
    update: (data: UpdateLifeAreaRequest) =>
      this.invokeCommand<LifeArea>('update_life_area', { request: data }),
    delete: (id: string) => this.invokeCommand<void>('delete_life_area', { id }),
    restore: (id: string) => this.invokeCommand<LifeArea>('restore_life_area', { id }),
  };

  // Goal operations
  goal = {
    getAll: () => this.invokeCommand<Goal[]>('get_goals'),
    getByLifeArea: (lifeAreaId: string) =>
      this.invokeCommand<Goal[]>('get_goals_by_life_area', { life_area_id: lifeAreaId }),
    getOne: (id: string) => this.invokeCommand<Goal>('get_goal', { id }),
    create: (data: CreateGoalRequest) => 
      this.invokeCommand<Goal>('create_goal', { request: data }),
    update: (data: UpdateGoalRequest) => 
      this.invokeCommand<Goal>('update_goal', { request: data }),
    complete: (id: string) => this.invokeCommand<Goal>('complete_goal', { id }),
    uncomplete: (id: string) => this.invokeCommand<Goal>('uncomplete_goal', { id }),
    delete: (id: string) => this.invokeCommand<void>('delete_goal', { id }),
    restore: (id: string) => this.invokeCommand<Goal>('restore_goal', { id }),
  };

  // Project operations
  project = {
    getAll: () => this.invokeCommand<Project[]>('get_projects'),
    getByGoal: (goalId: string) =>
      this.invokeCommand<Project[]>('get_projects_by_goal', { goal_id: goalId }),
    getOne: (id: string) => this.invokeCommand<Project>('get_project', { id }),
    create: (data: CreateProjectRequest) => 
      this.invokeCommand<Project>('create_project', { request: data }),
    update: (data: UpdateProjectRequest) => 
      this.invokeCommand<Project>('update_project', { request: data }),
    updateStatus: (id: string, status: Project['status']) =>
      this.invokeCommand<Project>('update_project_status', { id, status }),
    delete: (id: string) => this.invokeCommand<void>('delete_project', { id }),
    restore: (id: string) => this.invokeCommand<Project>('restore_project', { id }),
  };

  // Task operations
  task = {
    getAll: () => this.invokeCommand<Task[]>('get_tasks'),
    getByProject: (projectId: string) =>
      this.invokeCommand<Task[]>('get_tasks_by_project', { project_id: projectId }),
    getSubtasks: (parentId: string) =>
      this.invokeCommand<Task[]>('get_subtasks', { parent_task_id: parentId }),
    getOne: (id: string) => this.invokeCommand<Task>('get_task', { id }),
    getTodaysTasks: () => this.invokeCommand<Task[]>('get_todays_tasks'),
    create: (data: CreateTaskRequest) => 
      this.invokeCommand<Task>('create_task', { request: data }),
    createWithSubtasks: (data: CreateTaskRequest, subtasks: CreateTaskRequest[]) =>
      this.invokeCommand<Task>('create_task_with_subtasks', { 
        request: { task: data, subtasks } as CreateTaskWithSubtasksRequest 
      }),
    update: (data: UpdateTaskRequest) => 
      this.invokeCommand<Task>('update_task', { request: data }),
    complete: (id: string) => this.invokeCommand<Task>('complete_task', { id }),
    uncomplete: (id: string) => this.invokeCommand<Task>('uncomplete_task', { id }),
    delete: (id: string) => this.invokeCommand<void>('delete_task', { id }),
    restore: (id: string) => this.invokeCommand<Task>('restore_task', { id }),
  };

  // Note operations
  note = {
    getAll: () => this.invokeCommand<Note[]>('get_notes'),
    getByTask: (taskId: string) => 
      this.invokeCommand<Note[]>('get_notes_by_task', { task_id: taskId }),
    getByProject: (projectId: string) =>
      this.invokeCommand<Note[]>('get_notes_by_project', { project_id: projectId }),
    getByGoal: (goalId: string) => 
      this.invokeCommand<Note[]>('get_notes_by_goal', { goal_id: goalId }),
    getByLifeArea: (lifeAreaId: string) =>
      this.invokeCommand<Note[]>('get_notes_by_life_area', { life_area_id: lifeAreaId }),
    getOne: (id: string) => this.invokeCommand<Note>('get_note', { id }),
    create: (data: CreateNoteRequest) => 
      this.invokeCommand<Note>('create_note', { request: data }),
    update: (data: UpdateNoteRequest) => 
      this.invokeCommand<Note>('update_note', { request: data }),
    delete: (id: string) => this.invokeCommand<void>('delete_note', { id }),
    restore: (id: string) => this.invokeCommand<Note>('restore_note', { id }),
    search: (query: string) => this.invokeCommand<Note[]>('search_notes', { query }),
  };
}