// Command request/response types for Tauri IPC

import type { ProjectStatus, TaskPriority } from './models';

// Life Area Commands
export interface CreateLifeAreaRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateLifeAreaRequest {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

// Goal Commands
export interface CreateGoalRequest {
  life_area_id: string;
  title: string;
  description?: string;
  target_date?: string;
}

export interface UpdateGoalRequest {
  id: string;
  life_area_id: string;
  title: string;
  description?: string;
  target_date?: string;
}

// Project Commands
export interface CreateProjectRequest {
  goal_id: string;
  title: string;
  description?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectRequest {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
}

// Task Commands
export interface CreateTaskRequest {
  project_id?: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
}

export interface CreateTaskWithSubtasksRequest {
  task: CreateTaskRequest;
  subtasks: CreateTaskRequest[];
}

export interface UpdateTaskRequest {
  id: string;
  project_id?: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  due_date?: string;
}

// Note Commands
export interface CreateNoteRequest {
  task_id?: string;
  project_id?: string;
  goal_id?: string;
  life_area_id?: string;
  title: string;
  content: string;
}

export interface UpdateNoteRequest {
  id: string;
  task_id?: string;
  project_id?: string;
  goal_id?: string;
  life_area_id?: string;
  title: string;
  content: string;
}

// Migration Commands
export interface MigrationStatus {
  current_version: number;
  pending_migrations: number[];
  applied_migrations: number[];
}

export interface MigrationResult {
  success: boolean;
  version: number;
  message: string;
}