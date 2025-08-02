import { createMemo } from 'solid-js';
import { createStore } from './createStore';
import { createStoreContext } from './createStoreContext';
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

// Factory function that creates the store and computed values
export function createProjectStore() {
  const [state, { setState }] = createStore(initialState, 'Project');

  // Computed values - created inside the factory to ensure proper reactive context
  const selectedProject = createMemo(() =>
    state.items.find((project) => project.id === state.selectedId),
  );

  const activeProjects = createMemo(() => state.items.filter((project) => !project.archived_at));

  const completedProjects = createMemo(() =>
    state.items.filter((project) => project.status === 'completed'),
  );

  const projectsByGoal = createMemo(() => {
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

  const projectsByStatus = createMemo(() => {
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

  const computed = {
    selectedProject,
    activeProjects,
    completedProjects,
    projectsByGoal,
    projectsByStatus,
  };

  // Actions
  const actions = {
    setState,

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
          error instanceof EvorBrainError ? error.message : 'Failed to fetch projects';
        setState('error', message);
        console.error('Failed to fetch projects:', error);
      } finally {
        setState('isLoading', false);
      }
    },

    // Create a new project
    async create(data: {
      goal_id: string;
      name: string;
      description?: string;
      status?: ProjectStatus;
      start_date?: string;
      end_date?: string;
      priority?: 'low' | 'medium' | 'high';
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
    async update(
      id: string,
      data: {
        name: string;
        description?: string;
        status?: ProjectStatus;
        start_date?: string;
        end_date?: string;
        priority?: 'low' | 'medium' | 'high';
      },
    ) {
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
  };

  return { state, actions, computed };
}

// Create the context-based store
export const ProjectStoreContext = createStoreContext({
  name: 'ProjectStore',
  factory: createProjectStore,
});

// Export provider and hook for convenience
export const ProjectStoreProvider = ProjectStoreContext.Provider;
export const useProjectStore = ProjectStoreContext.useStore;

// For backward compatibility, export a singleton instance
// This will be deprecated in favor of the context-based approach
let singletonInstance: ReturnType<typeof createProjectStore> | null = null;

export function getProjectStore() {
  if (!singletonInstance) {
    console.warn(
      'Using getProjectStore() is deprecated. Please use ProjectStoreProvider and useProjectStore() instead.',
    );
    singletonInstance = createProjectStore();
  }
  return singletonInstance;
}

// Export individual pieces for backward compatibility
export const projectStore = new Proxy({} as ProjectState, {
  get(_target, prop) {
    return getProjectStore().state[prop as keyof ProjectState];
  },
});

export const projectActions = new Proxy({} as ReturnType<typeof createProjectStore>['actions'], {
  get(_target, prop) {
    return getProjectStore().actions[
      prop as keyof ReturnType<typeof createProjectStore>['actions']
    ];
  },
});

export const selectedProject = () => getProjectStore().computed.selectedProject();
export const activeProjects = () => getProjectStore().computed.activeProjects();
export const completedProjects = () => getProjectStore().computed.completedProjects();
export const projectsByGoal = () => getProjectStore().computed.projectsByGoal();
export const projectsByStatus = () => getProjectStore().computed.projectsByStatus();
