import { createMemo } from 'solid-js';
import { createStore } from './createStore';
import { createStoreContext } from './createStoreContext';
import type { TaskState } from './types';
import type { Task, TaskPriority } from '../types/models';
import { api } from '../lib/api';
import { EvorBrainError } from '../types/errors';

const initialState: TaskState = {
  items: [],
  selectedId: null,
  todaysTasks: [],
  isLoading: false,
  error: null,
};

// Factory function that creates the store and computed values
export function createTaskStore() {
  const [state, { setState }] = createStore(initialState, 'Task');

  // Computed values - created inside the factory to ensure proper reactive context
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

  const computed = {
    selectedTask,
    activeTasks,
    completedTasks,
    tasksByProject,
    tasksByPriority,
    overdueTasks,
  };

  // Actions
  const actions = {
    setState,

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

    // Fetch today's tasks
    async fetchTodaysTasks() {
      setState('isLoading', true);
      setState('error', null);

      try {
        const items = await api.task.getTodaysTasks();
        setState('todaysTasks', items);
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
      project_id?: string | null;
      parent_task_id?: string | null;
      name: string;
      description?: string;
      priority?: TaskPriority;
      due_date?: string;
      estimated_duration?: number;
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

    // Create task with subtasks
    async createWithSubtasks(data: {
      parent: {
        project_id?: string | null;
        name: string;
        description?: string;
        priority?: TaskPriority;
        due_date?: string;
        estimated_duration?: number;
      };
      subtasks: Array<{
        name: string;
        description?: string;
        priority?: TaskPriority;
        due_date?: string;
        estimated_duration?: number;
      }>;
    }) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const result = await api.task.createWithSubtasks(data);
        // Add parent and subtasks to items
        setState('items', (items) => [...items, result.parent, ...result.subtasks]);
        return result;
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
        name: string;
        description?: string;
        priority?: TaskPriority;
        due_date?: string;
        estimated_duration?: number;
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

    // Get subtasks for a parent task
    async getSubtasks(parentId: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const subtasks = await api.task.getSubtasks(parentId);
        // Add subtasks to items if not already present
        setState('items', (items) => {
          const existingIds = new Set(items.map((t) => t.id));
          const newSubtasks = subtasks.filter((t) => !existingIds.has(t.id));
          return [...items, ...newSubtasks];
        });
        return subtasks;
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to fetch subtasks';
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
  };

  return { state, actions, computed };
}

// Create the context-based store
export const TaskStoreContext = createStoreContext({
  name: 'TaskStore',
  factory: createTaskStore,
});

// Export provider and hook for convenience
export const TaskStoreProvider = TaskStoreContext.Provider;
export const useTaskStore = TaskStoreContext.useStore;

// For backward compatibility, export a singleton instance
// This will be deprecated in favor of the context-based approach
let singletonInstance: ReturnType<typeof createTaskStore> | null = null;

export function getTaskStore() {
  if (!singletonInstance) {
    console.warn(
      'Using getTaskStore() is deprecated. Please use TaskStoreProvider and useTaskStore() instead.',
    );
    singletonInstance = createTaskStore();
  }
  return singletonInstance;
}

// Export individual pieces for backward compatibility
export const taskStore = new Proxy({} as TaskState, {
  get(_target, prop) {
    return getTaskStore().state[prop as keyof TaskState];
  },
});

export const taskActions = new Proxy({} as ReturnType<typeof createTaskStore>['actions'], {
  get(_target, prop) {
    return getTaskStore().actions[prop as keyof ReturnType<typeof createTaskStore>['actions']];
  },
});

export const selectedTask = () => getTaskStore().computed.selectedTask();
export const activeTasks = () => getTaskStore().computed.activeTasks();
export const completedTasks = () => getTaskStore().computed.completedTasks();
export const tasksByProject = () => getTaskStore().computed.tasksByProject();
export const tasksByPriority = () => getTaskStore().computed.tasksByPriority();
export const overdueTasks = () => getTaskStore().computed.overdueTasks();
