/**
 * Tasks Store
 * 
 * Zustand store for task state management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Task, CreateTaskDto, UpdateTaskDto } from '@/entities/task';
import { tasksApi } from '../api';
import { createMigration } from '@/shared/lib/store-persistence';

interface TasksState {
  tasks: Map<string, Task>;
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;
  version: number; // For persistence migrations

  // Actions
  loadTasks: () => Promise<void>;
  loadTasksByProject: (projectId: string) => Promise<void>;
  createTask: (task: CreateTaskDto) => Promise<void>;
  updateTask: (id: string, updates: UpdateTaskDto) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  selectTask: (id: string | null) => void;
}

// Store version for migrations
const STORE_VERSION = 1;

// Migration functions
interface V0State {
  tasks: Task[] | Map<string, Task>;
  selectedTaskId: string | null;
  isLoading: boolean;
  error: string | null;
  version?: number;
}

const migrations = {
  1: (state: unknown) => {
    const oldState = state as V0State;
    // Initial version - convert old array format to Map if needed
    if (Array.isArray(oldState.tasks)) {
      return {
        ...oldState,
        tasks: new Map(oldState.tasks.map((t: Task) => [t.id, t])),
        version: 1,
      };
    }
    return {
      ...oldState,
      version: 1,
    };
  },
};

export const useTasksStore = create<TasksState>()(
  devtools(
    persist(
      /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
      immer((set, get) => ({
        tasks: new Map(),
        selectedTaskId: null,
        isLoading: false,
        error: null,
        version: STORE_VERSION,

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
              state.tasks = new Map(tasks.map(task => [task.id, task]));
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
          // Store original for rollback
          const originalTask = get().tasks.get(id);
          
          if (originalTask) {
            // Optimistic update
            set((state) => {
              const task = state.tasks.get(id);
              if (task) {
                state.tasks.set(id, { ...task, ...updates });
              }
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
                state.error = error instanceof Error ? error.message : 'Failed to update task';
              });
            }
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
                state.error = error instanceof Error ? error.message : 'Failed to delete task';
              });
            }
            throw error;
          }
        },

        selectTask: (id) => set((state) => {
          state.selectedTaskId = id;
        }),
      }))
      /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */,
      {
        name: 'tasks-storage',
        partialize: (state) => ({ 
          selectedTaskId: state.selectedTaskId,
          version: state.version 
        }),
        migrate: createMigration(STORE_VERSION, migrations),
      }
    ),
    {
      name: 'tasks-store',
    }
  )
);