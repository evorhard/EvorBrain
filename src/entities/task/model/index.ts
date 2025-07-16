/**
 * Task Model
 * 
 * Task entity types and interfaces
 */

import { TaskPriority, TaskStatus } from '@/shared/config';

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate?: Date;
  completedAt?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes?: number;
  actualMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  name: string;
  projectId: string;
  description?: string;
  dueDate?: Date;
  priority: TaskPriority;
  estimatedMinutes?: number;
}

export interface UpdateTaskDto extends Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>> {}