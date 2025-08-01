// Core domain models matching Rust backend structures

/**
 * Status options for projects
 * @enum {string}
 */
export enum ProjectStatus {
  Planning = 'planning',
  Active = 'active',
  OnHold = 'onhold',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

/**
 * Priority levels for tasks
 * @enum {string}
 */
export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent',
}

// Core Models

/**
 * Represents a major area of life (e.g., Work, Health, Family)
 * The top-level organizational unit in EvorBrain
 * @interface LifeArea
 */
export interface LifeArea {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string; // ISO 8601 datetime
  updated_at: string;
  archived_at?: string;
}

/**
 * Represents a specific objective within a Life Area
 * Goals are achieved through completing related Projects
 * @interface Goal
 */
export interface Goal {
  id: string;
  life_area_id: string;
  title: string;
  description?: string;
  target_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  archived_at?: string;
}

/**
 * Represents a concrete work item within a Goal
 * Projects contain Tasks and have a defined status
 * @interface Project
 */
export interface Project {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  archived_at?: string;
}

/**
 * Represents an actionable item within a Project
 * Tasks can have subtasks and are the primary unit of work
 * @interface Task
 */
export interface Task {
  id: string;
  project_id?: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  archived_at?: string;
}

/**
 * Represents markdown content attached to any entity
 * Notes provide additional context and documentation
 * @interface Note
 */
export interface Note {
  id: string;
  task_id?: string;
  project_id?: string;
  goal_id?: string;
  life_area_id?: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

/**
 * Represents a label that can be attached to tasks or projects
 * @interface Tag
 */
export interface Tag {
  id: string;
  name: string;
  color?: string;
  created_at: string;
}

// Join table types
export interface TaskTag {
  task_id: string;
  tag_id: string;
}

export interface ProjectTag {
  project_id: string;
  tag_id: string;
}

// Helper types for common patterns
export type TaskWithTags = [Task, Tag[]];
export type ProjectWithTags = [Project, Tag[]];

// Query filter types
export interface TaskFilter {
  project_id?: string;
  parent_task_id?: string;
  priority?: TaskPriority;
  completed?: boolean;
  archived?: boolean;
  overdue?: boolean;
}

export interface ProjectFilter {
  goal_id?: string;
  status?: ProjectStatus;
  completed?: boolean;
  archived?: boolean;
}

// Utility types for working with models
export type ModelId = string;
export type ISODateString = string;

// Type guards

/**
 * Type guard to check if an object is a valid LifeArea
 * @param obj - The object to check
 * @returns True if the object is a LifeArea
 */
export function isLifeArea(obj: unknown): obj is LifeArea {
  const area = obj as Record<string, unknown>;
  return Boolean(obj) && typeof area.id === 'string' && typeof area.name === 'string';
}

/**
 * Type guard to check if an object is a valid Goal
 * @param obj - The object to check
 * @returns True if the object is a Goal
 */
export function isGoal(obj: unknown): obj is Goal {
  const goal = obj as Record<string, unknown>;
  return (
    Boolean(obj) &&
    typeof goal.id === 'string' &&
    typeof goal.life_area_id === 'string' &&
    typeof goal.title === 'string'
  );
}

/**
 * Type guard to check if an object is a valid Project
 * @param obj - The object to check
 * @returns True if the object is a Project with valid status
 */
export function isProject(obj: unknown): obj is Project {
  const project = obj as Record<string, unknown>;
  return (
    Boolean(obj) &&
    typeof project.id === 'string' &&
    typeof project.goal_id === 'string' &&
    typeof project.title === 'string' &&
    typeof project.status === 'string' &&
    Object.values(ProjectStatus).includes(project.status as ProjectStatus)
  );
}

/**
 * Type guard to check if an object is a valid Task
 * @param obj - The object to check
 * @returns True if the object is a Task with valid priority
 */
export function isTask(obj: unknown): obj is Task {
  const task = obj as Record<string, unknown>;
  return (
    Boolean(obj) &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.priority === 'string' &&
    Object.values(TaskPriority).includes(task.priority as TaskPriority)
  );
}

/**
 * Type guard to check if an object is a valid Note
 * @param obj - The object to check
 * @returns True if the object is a Note
 */
export function isNote(obj: unknown): obj is Note {
  const note = obj as Record<string, unknown>;
  return (
    Boolean(obj) &&
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    typeof note.content === 'string'
  );
}
