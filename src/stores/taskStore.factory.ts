import { createStore } from 'solid-js/store';
import { createMemo } from 'solid-js';
import type { TaskState } from './types';
import type { Task, TaskPriority } from '../types/models';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateTaskWithSubtasksRequest,
} from '../types/commands';
import { EvorBrainError } from '../types/errors';

/**
 * Factory function that creates a completely independent task store instance.
 * This is the preferred approach for testable stores.
 *
 * @param api - The API client to use for data fetching
 * @param options - Optional configuration for the store
 */
export function createTaskStoreFactory(
  api: {
    task: {
      getAll: () => Promise<Task[]>;
      getByProject: (projectId: string) => Promise<Task[]>;
      getTodaysTasks: () => Promise<Task[]>;
      create: (data: CreateTaskRequest) => Promise<Task>;
      createWithSubtasks: (data: CreateTaskWithSubtasksRequest) => Promise<Task>;
      update: (data: UpdateTaskRequest) => Promise<Task>;
      complete: (id: string) => Promise<Task>;
      uncomplete: (id: string) => Promise<Task>;
      delete: (id: string) => Promise<void>;
      restore: (id: string) => Promise<Task>;
    };
  },
  options?: {
    debug?: boolean;
    initialState?: Partial<TaskState>;
  },
) {
  // Create initial state
  const initialState: TaskState = {
    items: [],
    selectedId: null,
    todaysTasks: [],
    isLoading: false,
    error: null,
    ...options?.initialState,
  };

  // Create the store
  const [state, setState] = createStore(initialState);

  if (options?.debug) {
    console.warn('[Task Store] Created with initial state:', initialState);
  }

  // Computed values
  const selectedTask = createMemo(() => state.items.find((task) => task.id === state.selectedId));

  const activeTasks = createMemo(() =>
    state.items.filter((task) => !task.archived_at && !task.completed_at),
  );

  const completedTasks = createMemo(() =>
    state.items.filter((task) => task.completed_at && !task.archived_at),
  );

  const tasksByProject = createMemo(() => {
    const grouped = new Map<string | null, Task[]>();
    state.items.forEach((task) => {
      const projectId = task.project_id || null;
      if (!grouped.has(projectId)) {
        grouped.set(projectId, []);
      }
      const tasks = grouped.get(projectId);
      if (tasks) {
        tasks.push(task);
      }
    });
    return grouped;
  });

  const tasksByPriority = createMemo(() => {
    const grouped = new Map<TaskPriority, Task[]>();
    state.items.forEach((task) => {
      if (!grouped.has(task.priority)) {
        grouped.set(task.priority, []);
      }
      const tasks = grouped.get(task.priority);
      if (tasks) {
        tasks.push(task);
      }
    });
    return grouped;
  });

  const overdueTasks = createMemo(() =>
    state.items.filter((task) => {
      if (!task.due_date || task.completed_at || task.archived_at) return false;
      return new Date(task.due_date) < new Date();
    }),
  );

  const upcomingTasks = createMemo(() =>
    state.items.filter((task) => {
      if (!task.due_date || task.completed_at || task.archived_at) return false;
      const dueDate = new Date(task.due_date);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate >= today && dueDate <= nextWeek;
    }),
  );

  // Get root tasks (tasks without parent)
  const rootTasks = createMemo(() =>
    state.items.filter((task) => !task.parent_task_id && !task.archived_at),
  );

  // Get subtasks for a given parent task
  const getSubtasks = (parentId: string) =>
    state.items.filter((task) => task.parent_task_id === parentId && !task.archived_at);

  // Actions
  const actions = {
    // Fetch all tasks
    async fetchAll() {
      setState('isLoading', true);
      setState('error', null);

      try {
        const items = await api.task.getAll();
        setState('items', items);
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to fetch tasks';
        setState('error', message);
        console.error('Failed to fetch tasks:', error);
      } finally {
        setState('isLoading', false);
      }
    },

    // Fetch tasks by project
    async fetchByProject(projectId: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const items = await api.task.getByProject(projectId);
        setState('items', items);
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to fetch tasks';
        setState('error', message);
        console.error('Failed to fetch tasks:', error);
      } finally {
        setState('isLoading', false);
      }
    },

    // Fetch subtasks for a parent task
    async fetchSubtasks(parentTaskId: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const subtasks = await api.task.getSubtasks(parentTaskId);
        // Merge subtasks with existing items, avoiding duplicates
        setState('items', (current) => {
          const existingIds = new Set(current.map((t) => t.id));
          const newSubtasks = subtasks.filter((t) => !existingIds.has(t.id));
          return [...current, ...newSubtasks];
        });
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to fetch subtasks';
        setState('error', message);
        console.error('Failed to fetch subtasks:', error);
      } finally {
        setState('isLoading', false);
      }
    },

    // Fetch today's tasks
    async fetchTodaysTasks() {
      setState('isLoading', true);
      setState('error', null);

      try {
        const todaysTasks = await api.task.getTodaysTasks();
        setState('todaysTasks', todaysTasks);
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : "Failed to fetch today's tasks";
        setState('error', message);
        console.error("Failed to fetch today's tasks:", error);
      } finally {
        setState('isLoading', false);
      }
    },

    // Create a new task
    async create(data: {
      project_id?: string;
      parent_task_id?: string;
      title: string;
      description?: string;
      priority?: TaskPriority;
      due_date?: string;
    }) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const created = await api.task.create(data);
        setState('items', (items) => [...items, created]);
        return created;
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to create task';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Create a task with subtasks
    async createWithSubtasks(data: {
      task: {
        project_id?: string;
        parent_task_id?: string;
        title: string;
        description?: string;
        priority?: TaskPriority;
        due_date?: string;
      };
      subtasks: Array<{
        project_id?: string;
        parent_task_id?: string;
        title: string;
        description?: string;
        priority?: TaskPriority;
        due_date?: string;
      }>;
    }) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const created = await api.task.createWithSubtasks(data);
        // Refetch to get all tasks including subtasks
        await actions.fetchAll();
        return created;
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to create task with subtasks';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Update a task
    async update(
      id: string,
      data: {
        project_id?: string;
        parent_task_id?: string;
        title: string;
        description?: string;
        priority: TaskPriority;
        due_date?: string;
      },
    ) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const updated = await api.task.update({ id, ...data });
        setState('items', (item) => item.id === id, updated);
        return updated;
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to update task';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Complete a task
    async complete(id: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const completed = await api.task.complete(id);
        setState('items', (item) => item.id === id, completed);
        return completed;
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to complete task';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Uncomplete a task
    async uncomplete(id: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const uncompleted = await api.task.uncomplete(id);
        setState('items', (item) => item.id === id, uncompleted);
        return uncompleted;
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to uncomplete task';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Delete (archive) a task
    async delete(id: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        await api.task.delete(id);
        // Clear selection if the deleted item was selected
        if (state.selectedId === id) {
          setState('selectedId', null);
        }
        // Refetch to get updated state (with cascaded archives)
        await actions.fetchAll();
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to delete task';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Restore an archived task
    async restore(id: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const restored = await api.task.restore(id);
        setState('items', (item) => item.id === id, restored);
        return restored;
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to restore task';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Select a task
    select(id: string | null) {
      setState('selectedId', id);
    },

    // Clear error
    clearError() {
      setState('error', null);
    },

    // For testing: direct state manipulation
    _setState: setState,
  };

  return {
    state,
    actions,
    selectedTask,
    activeTasks,
    completedTasks,
    tasksByProject,
    tasksByPriority,
    overdueTasks,
    upcomingTasks,
    rootTasks,
    getSubtasks,
  };
}

export type TaskStoreInstance = ReturnType<typeof createTaskStoreFactory>;
