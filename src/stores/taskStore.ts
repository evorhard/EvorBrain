import { createStore } from './createStore';
import { createMemo } from 'solid-js';
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

const [state, { setState }] = createStore(initialState, 'Task');

// Computed values
export const selectedTask = createMemo(() =>
  state.items.find((task) => task.id === state.selectedId),
);

export const activeTasks = createMemo(() =>
  state.items.filter((task) => !task.archived_at && !task.completed_at),
);

export const completedTasks = createMemo(() =>
  state.items.filter((task) => task.completed_at && !task.archived_at),
);

export const tasksByProject = createMemo(() => {
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

export const tasksByPriority = createMemo(() => {
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

export const overdueTasks = createMemo(() =>
  state.items.filter((task) => {
    if (!task.due_date || task.completed_at || task.archived_at) return false;
    return new Date(task.due_date) < new Date();
  }),
);

export const upcomingTasks = createMemo(() =>
  state.items.filter((task) => {
    if (!task.due_date || task.completed_at || task.archived_at) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= nextWeek;
  }),
);

// Get root tasks (tasks without parent)
export const rootTasks = createMemo(() =>
  state.items.filter((task) => !task.parent_task_id && !task.archived_at),
);

// Get subtasks for a given parent task
export const getSubtasks = (parentId: string) =>
  state.items.filter((task) => task.parent_task_id === parentId && !task.archived_at);

// Actions
export const taskActions = {
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
      const todaysTasks = await api.task.getTodaysTasks();
      setState('todaysTasks', todaysTasks);
    } catch (error) {
      const message = error instanceof EvorBrainError ? error.message : 'Failed to fetch today\'s tasks';
      setState('error', message);
      console.error('Failed to fetch today\'s tasks:', error);
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
      await taskActions.fetchAll();
      return created;
    } catch (error) {
      const message = error instanceof EvorBrainError ? error.message : 'Failed to create task with subtasks';
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
      const message = error instanceof EvorBrainError ? error.message : 'Failed to uncomplete task';
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
      await taskActions.fetchAll();
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
};

// Export store and actions
export const taskStore = state;