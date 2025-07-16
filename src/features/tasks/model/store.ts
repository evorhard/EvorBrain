/**
 * Tasks Store
 * 
 * Zustand store for task state management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Task, CreateTaskDto, UpdateTaskDto } from '@/entities/task';
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
      immer((set, get) => ({
        tasks: new Map(),
        selectedTaskId: null,
        isLoading: false,
        error: null,

        loadTasks: async () => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });
          
          try {
            const tasks = await tasksApi.getAll();
            set((state) => {
              state.tasks = new Map(tasks.map(t => [t.id, t]));
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to load tasks';
              state.isLoading = false;
            });
          }
        },

        loadTasksByProject: async (projectId) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });
          
          try {
            const tasks = await tasksApi.getByProject(projectId);
            set((state) => {
              // Clear existing tasks and add project tasks
              state.tasks.clear();
              tasks.forEach(task => {
                state.tasks.set(task.id, task);
              });
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to load tasks';
              state.isLoading = false;
            });
          }
        },

        createTask: async (dto) => {
          try {
            const task = await tasksApi.create(dto);
            set((state) => {
              state.tasks.set(task.id, task);
            });
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to create task';
            });
            throw error;
          }
        },

        updateTask: async (id, updates) => {
          // Optimistic update
          const originalTask = get().tasks.get(id);
          if (originalTask) {
            set((state) => {
              state.tasks.set(id, { ...originalTask, ...updates });
            });
          }

          try {
            const updatedTask = await tasksApi.update(id, updates);
            set((state) => {
              state.tasks.set(id, updatedTask);
            });
          } catch (error) {
            // Revert on error
            if (originalTask) {
              set((state) => {
                state.tasks.set(id, originalTask);
              });
            }
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update task';
            });
            throw error;
          }
        },

        deleteTask: async (id) => {
          const originalTask = get().tasks.get(id);
          
          // Optimistic delete
          set((state) => {
            state.tasks.delete(id);
            if (state.selectedTaskId === id) {
              state.selectedTaskId = null;
            }
          });

          try {
            await tasksApi.delete(id);
          } catch (error) {
            // Revert on error
            if (originalTask) {
              set((state) => {
                state.tasks.set(id, originalTask);
              });
            }
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to delete task';
            });
            throw error;
          }
        },

        selectTask: (id) => set({ selectedTaskId: id }),
      })),
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