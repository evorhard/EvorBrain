// Core domain models matching Rust backend structures

// Enums
export enum ProjectStatus {
  Planning = "planning",
  Active = "active",
  OnHold = "onhold",
  Completed = "completed",
  Cancelled = "cancelled"
}

export enum TaskPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
  Urgent = "urgent"
}

// Core Models
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
export function isLifeArea(obj: any): obj is LifeArea {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

export function isGoal(obj: any): obj is Goal {
  return obj && typeof obj.id === 'string' && typeof obj.life_area_id === 'string' && typeof obj.title === 'string';
}

export function isProject(obj: any): obj is Project {
  return obj && typeof obj.id === 'string' && typeof obj.goal_id === 'string' && typeof obj.title === 'string' && obj.status in ProjectStatus;
}

export function isTask(obj: any): obj is Task {
  return obj && typeof obj.id === 'string' && typeof obj.title === 'string' && obj.priority in TaskPriority;
}

export function isNote(obj: any): obj is Note {
  return obj && typeof obj.id === 'string' && typeof obj.title === 'string' && typeof obj.content === 'string';
}