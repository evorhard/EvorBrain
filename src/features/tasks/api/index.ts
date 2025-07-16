/**
 * Tasks API
 * 
 * API calls for task operations
 */

import { invokeCommand } from '@/shared/api';
import { Task, CreateTaskDto, UpdateTaskDto } from '@/entities/task';

export const tasksApi = {
  getAll: () => invokeCommand<Task[]>('get_all_tasks'),
  
  getByProject: (projectId: string) => 
    invokeCommand<Task[]>('get_tasks_by_project', { projectId }),
  
  create: (task: CreateTaskDto) => 
    invokeCommand<Task>('create_task', { task }),
  
  update: (id: string, updates: UpdateTaskDto) => 
    invokeCommand<Task>('update_task', { id, updates }),
  
  delete: (id: string) => 
    invokeCommand<void>('delete_task', { id }),
};