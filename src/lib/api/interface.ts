import type { LifeArea, Goal, Project, Task, Note, MigrationStatus } from '../../types/models';
import type {
  CreateLifeAreaRequest,
  UpdateLifeAreaRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateNoteRequest,
  UpdateNoteRequest,
} from '../../types/commands';

/**
 * API interface that defines all available operations.
 * This interface can be implemented by both the real Tauri API client
 * and test doubles for testing.
 */
export interface ApiClient {
  // Migration operations
  migration: {
    getStatus: () => Promise<MigrationStatus>;
    run: () => Promise<void>;
    rollback: (version: number) => Promise<void>;
    reset: () => Promise<void>;
  };

  // Life Area operations
  lifeArea: {
    getAll: () => Promise<LifeArea[]>;
    getOne: (id: string) => Promise<LifeArea>;
    create: (data: CreateLifeAreaRequest) => Promise<LifeArea>;
    update: (data: UpdateLifeAreaRequest) => Promise<LifeArea>;
    delete: (id: string) => Promise<void>;
    restore: (id: string) => Promise<LifeArea>;
  };

  // Goal operations
  goal: {
    getAll: () => Promise<Goal[]>;
    getByLifeArea: (lifeAreaId: string) => Promise<Goal[]>;
    getOne: (id: string) => Promise<Goal>;
    create: (data: CreateGoalRequest) => Promise<Goal>;
    update: (data: UpdateGoalRequest) => Promise<Goal>;
    complete: (id: string) => Promise<Goal>;
    uncomplete: (id: string) => Promise<Goal>;
    delete: (id: string) => Promise<void>;
    restore: (id: string) => Promise<Goal>;
  };

  // Project operations
  project: {
    getAll: () => Promise<Project[]>;
    getByGoal: (goalId: string) => Promise<Project[]>;
    getOne: (id: string) => Promise<Project>;
    create: (data: CreateProjectRequest) => Promise<Project>;
    update: (data: UpdateProjectRequest) => Promise<Project>;
    updateStatus: (id: string, status: Project['status']) => Promise<Project>;
    delete: (id: string) => Promise<void>;
    restore: (id: string) => Promise<Project>;
  };

  // Task operations
  task: {
    getAll: () => Promise<Task[]>;
    getByProject: (projectId: string) => Promise<Task[]>;
    getSubtasks: (parentId: string) => Promise<Task[]>;
    getOne: (id: string) => Promise<Task>;
    getTodaysTasks: () => Promise<Task[]>;
    create: (data: CreateTaskRequest) => Promise<Task>;
    createWithSubtasks: (data: CreateTaskRequest, subtasks: CreateTaskRequest[]) => Promise<Task>;
    update: (data: UpdateTaskRequest) => Promise<Task>;
    complete: (id: string) => Promise<Task>;
    uncomplete: (id: string) => Promise<Task>;
    delete: (id: string) => Promise<void>;
    restore: (id: string) => Promise<Task>;
  };

  // Note operations
  note: {
    getAll: () => Promise<Note[]>;
    getByTask: (taskId: string) => Promise<Note[]>;
    getByProject: (projectId: string) => Promise<Note[]>;
    getByGoal: (goalId: string) => Promise<Note[]>;
    getByLifeArea: (lifeAreaId: string) => Promise<Note[]>;
    getOne: (id: string) => Promise<Note>;
    create: (data: CreateNoteRequest) => Promise<Note>;
    update: (data: UpdateNoteRequest) => Promise<Note>;
    delete: (id: string) => Promise<void>;
    restore: (id: string) => Promise<Note>;
    search: (query: string) => Promise<Note[]>;
  };
}

/**
 * Configuration options for the API client
 */
export interface ApiClientOptions {
  /**
   * Enable debug logging
   */
  debug?: boolean;

  /**
   * Custom error handler
   */
  onError?: (error: Error) => void;

  /**
   * Request interceptor for logging or modifications
   */
  onRequest?: (command: string, args: unknown) => void;

  /**
   * Response interceptor for logging or modifications
   */
  onResponse?: (command: string, response: unknown) => void;
}
