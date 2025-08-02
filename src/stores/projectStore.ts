import { createStore } from './createStore';
import { createMemo } from 'solid-js';
import type { ProjectState } from './types';
import type { Project, ProjectStatus } from '../types/models';
import { api } from '../lib/api';
import { EvorBrainError } from '../types/errors';

const initialState: ProjectState = {
  items: [],
  selectedId: null,
  isLoading: false,
  error: null,
};

const [state, { setState }] = createStore(initialState, 'Project');

// Computed values
export const selectedProject = createMemo(() =>
  state.items.find((project) => project.id === state.selectedId),
);

export const activeProjects = createMemo(() =>
  state.items.filter((project) => !project.archived_at),
);

export const completedProjects = createMemo(() =>
  state.items.filter((project) => project.status === 'completed'),
);

export const projectsByGoal = createMemo(() => {
  const grouped = new Map<string, Project[]>();
  state.items.forEach((project) => {
    if (!grouped.has(project.goal_id)) {
      grouped.set(project.goal_id, []);
    }
    const projects = grouped.get(project.goal_id);
    if (projects) {
      projects.push(project);
    }
  });
  return grouped;
});

export const projectsByStatus = createMemo(() => {
  const grouped = new Map<ProjectStatus, Project[]>();
  state.items.forEach((project) => {
    if (!grouped.has(project.status)) {
      grouped.set(project.status, []);
    }
    const projects = grouped.get(project.status);
    if (projects) {
      projects.push(project);
    }
  });
  return grouped;
});

// Actions
export const projectActions = {
  // Fetch all projects
  async fetchAll() {
    setState('isLoading', true);
    setState('error', null);

    try {
      const items = await api.project.getAll();
      setState('items', items);
    } catch (error) {
      const message = error instanceof EvorBrainError ? error.message : 'Failed to fetch projects';
      setState('error', message);
      console.error('Failed to fetch projects:', error);
    } finally {
      setState('isLoading', false);
    }
  },

  // Fetch projects by goal
  async fetchByGoal(goalId: string) {
    setState('isLoading', true);
    setState('error', null);

    try {
      const items = await api.project.getByGoal(goalId);
      setState('items', items);
    } catch (error) {
      const message = error instanceof EvorBrainError ? error.message : 'Failed to fetch projects';
      setState('error', message);
      console.error('Failed to fetch projects:', error);
    } finally {
      setState('isLoading', false);
    }
  },

  // Create a new project
  async create(data: {
    goal_id: string;
    title: string;
    description?: string;
    status?: ProjectStatus;
  }) {
    setState('isLoading', true);
    setState('error', null);

    try {
      const created = await api.project.create(data);
      setState('items', (items) => [...items, created]);
      return created;
    } catch (error) {
      const message = error instanceof EvorBrainError ? error.message : 'Failed to create project';
      setState('error', message);
      throw error;
    } finally {
      setState('isLoading', false);
    }
  },

  // Update a project
  async update(
    id: string,
    data: {
      goal_id: string;
      title: string;
      description?: string;
      status: ProjectStatus;
    },
  ) {
    setState('isLoading', true);
    setState('error', null);

    try {
      const updated = await api.project.update({ id, ...data });
      setState('items', (item) => item.id === id, updated);
      return updated;
    } catch (error) {
      const message = error instanceof EvorBrainError ? error.message : 'Failed to update project';
      setState('error', message);
      throw error;
    } finally {
      setState('isLoading', false);
    }
  },

  // Update project status
  async updateStatus(id: string, status: ProjectStatus) {
    setState('isLoading', true);
    setState('error', null);

    try {
      const updated = await api.project.updateStatus(id, status);
      setState('items', (item) => item.id === id, updated);
      return updated;
    } catch (error) {
      const message =
        error instanceof EvorBrainError ? error.message : 'Failed to update project status';
      setState('error', message);
      throw error;
    } finally {
      setState('isLoading', false);
    }
  },

  // Delete (archive) a project
  async delete(id: string) {
    setState('isLoading', true);
    setState('error', null);

    try {
      await api.project.delete(id);
      // Refetch to get updated state (with cascaded archives)
      await projectActions.fetchAll();
    } catch (error) {
      const message = error instanceof EvorBrainError ? error.message : 'Failed to delete project';
      setState('error', message);
      throw error;
    } finally {
      setState('isLoading', false);
    }
  },

  // Restore an archived project
  async restore(id: string) {
    setState('isLoading', true);
    setState('error', null);

    try {
      const restored = await api.project.restore(id);
      setState('items', (item) => item.id === id, restored);
      return restored;
    } catch (error) {
      const message = error instanceof EvorBrainError ? error.message : 'Failed to restore project';
      setState('error', message);
      throw error;
    } finally {
      setState('isLoading', false);
    }
  },

  // Select a project
  select(id: string | null) {
    setState('selectedId', id);
  },

  // Clear error
  clearError() {
    setState('error', null);
  },
};

// Export store and actions
export const projectStore = state;
