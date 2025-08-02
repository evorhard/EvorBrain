import { createStore } from 'solid-js/store';
import { createMemo } from 'solid-js';
import type { ProjectState } from './types';
import type { Project, ProjectStatus } from '../types/models';
import type { CreateProjectRequest, UpdateProjectRequest } from '../types/commands';
import { EvorBrainError } from '../types/errors';

/**
 * Factory function that creates a completely independent project store instance.
 * This is the preferred approach for testable stores.
 *
 * @param api - The API client to use for data fetching
 * @param options - Optional configuration for the store
 */
export function createProjectStoreFactory(
  api: {
    project: {
      getAll: () => Promise<Project[]>;
      getByGoal: (goalId: string) => Promise<Project[]>;
      create: (data: CreateProjectRequest) => Promise<Project>;
      update: (data: UpdateProjectRequest) => Promise<Project>;
      updateStatus: (id: string, status: ProjectStatus) => Promise<Project>;
      delete: (id: string) => Promise<void>;
      restore: (id: string) => Promise<Project>;
    };
  },
  options?: {
    debug?: boolean;
    initialState?: Partial<ProjectState>;
  },
) {
  // Create initial state
  const initialState: ProjectState = {
    items: [],
    selectedId: null,
    isLoading: false,
    error: null,
    ...options?.initialState,
  };

  // Create the store
  const [state, setState] = createStore(initialState);

  if (options?.debug) {
    console.warn('[Project Store] Created with initial state:', initialState);
  }

  // Computed values
  const selectedProject = createMemo(() =>
    state.items.find((project) => project.id === state.selectedId),
  );

  const activeProjects = createMemo(() => state.items.filter((project) => !project.archived_at));

  const projectsByGoal = createMemo(() => {
    const map = new Map<string, Project[]>();
    state.items.forEach((project) => {
      const projects = map.get(project.goal_id) || [];
      projects.push(project);
      map.set(project.goal_id, projects);
    });
    return map;
  });

  const projectsByStatus = createMemo(() => {
    const map = new Map<ProjectStatus, Project[]>();
    state.items.forEach((project) => {
      const projects = map.get(project.status) || [];
      projects.push(project);
      map.set(project.status, projects);
    });
    return map;
  });

  // Actions
  const actions = {
    // Fetch all projects
    async fetchAll() {
      setState('isLoading', true);
      setState('error', null);

      try {
        const items = await api.project.getAll();
        setState('items', items);
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to fetch projects';
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
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to fetch projects by goal';
        setState('error', message);
        console.error('Failed to fetch projects by goal:', error);
      } finally {
        setState('isLoading', false);
      }
    },

    // Create a new project
    async create(data: {
      goal_id: string;
      title: string;
      description?: string;
      status: ProjectStatus;
    }) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const created = await api.project.create(data);
        setState('items', (items) => [...items, created]);
        return created;
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to create project';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Update a project
    async update(id: string, data: { title: string; description?: string; status: ProjectStatus }) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const updated = await api.project.update({ id, ...data });
        setState('items', (item) => item.id === id, updated);
        return updated;
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to update project';
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
        await actions.fetchAll();
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to delete project';
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
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to restore project';
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

    // For testing: direct state manipulation
    _setState: setState,
  };

  return {
    state,
    actions,
    selectedProject,
    activeProjects,
    projectsByGoal,
    projectsByStatus,
  };
}

export type ProjectStoreInstance = ReturnType<typeof createProjectStoreFactory>;
