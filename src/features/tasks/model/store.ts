/**
 * Tasks Store
 * 
 * Zustand store for task state management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Task, CreateTaskDto, UpdateTaskDto } from '@/entities/task';
import { tasksApi } from '../api';

interface TasksState {
  tasks: Map<string, Task>;
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTasks: () => Promise<void>;
  loadTasksByProject: (projectId: string) => Promise<void>;
  createTask: (task: CreateTaskDto) => Promise<void>;
  updateTask: (id: string, updates: UpdateTaskDto) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  selectTask: (id: string | null) => void;
}

export const useTasksStore = create<TasksState>()(
  devtools(
    persist(
      (set, get) => ({
        tasks: new Map(),
        selectedTaskId: null,
        isLoading: false,
        error: null,

        loadTasks: async () => {
          set({ isLoading: true, error: null });
          
          try {
            const tasks = await tasksApi.getAll();
            set({ 
              tasks: new Map(tasks.map(t => [t.id, t])),
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load tasks',
              isLoading: false 
            });
          }
        },

        loadTasksByProject: async (projectId) => {
          set({ isLoading: true, error: null });
          
          try {
            const tasks = await tasksApi.getByProject(projectId);
            const tasksMap = new Map<string, Task>();
            tasks.forEach(task => {
              tasksMap.set(task.id, task);
            });
            set({ 
              tasks: tasksMap,
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load tasks',
              isLoading: false 
            });
          }
        },

        createTask: async (dto) => {
          try {
            const task = await tasksApi.create(dto);
            const currentTasks = get().tasks;
            const newTasks = new Map(currentTasks);
            newTasks.set(task.id, task);
            set({ tasks: newTasks });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to create task' 
            });
            throw error;
          }
        },

        updateTask: async (id, updates) => {
          // Optimistic update
          const currentTasks = get().tasks;
          const originalTask = currentTasks.get(id);
          
          if (originalTask) {
            const newTasks = new Map(currentTasks);
            newTasks.set(id, { ...originalTask, ...updates });
            set({ tasks: newTasks });
          }

          try {
            const updatedTask = await tasksApi.update(id, updates);
            const latestTasks = get().tasks;
            const finalTasks = new Map(latestTasks);
            finalTasks.set(id, updatedTask);
            set({ tasks: finalTasks });
          } catch (error) {
            // Revert on error
            if (originalTask) {
              const revertTasks = get().tasks;
              const revertedTasks = new Map(revertTasks);
              revertedTasks.set(id, originalTask);
              set({ tasks: revertedTasks });
            }
            set({ 
              error: error instanceof Error ? error.message : 'Failed to update task' 
            });
            throw error;
          }
        },

        deleteTask: async (id) => {
          const currentTasks = get().tasks;
          const originalTask = currentTasks.get(id);
          
          // Optimistic delete
          const newTasks = new Map(currentTasks);
          newTasks.delete(id);
          set({ 
            tasks: newTasks,
            selectedTaskId: get().selectedTaskId === id ? null : get().selectedTaskId
          });

          try {
            await tasksApi.delete(id);
          } catch (error) {
            // Revert on error
            if (originalTask) {
              const revertTasks = get().tasks;
              const revertedTasks = new Map(revertTasks);
              revertedTasks.set(id, originalTask);
              set({ tasks: revertedTasks });
            }
            set({ 
              error: error instanceof Error ? error.message : 'Failed to delete task' 
            });
            throw error;
          }
        },

        selectTask: (id) => set({ selectedTaskId: id }),
      }),
      {
        name: 'tasks-storage',
        partialize: (state) => ({ selectedTaskId: state.selectedTaskId }),
      }
    ),
    {
      name: 'tasks-store',
    }
  )
);