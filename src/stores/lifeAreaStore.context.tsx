import { createMemo } from 'solid-js';
import { createStore } from './createStore';
import { createStoreContext } from './createStoreContext';
import type { LifeAreaState } from './types';
import { api } from '../lib/api';
import { EvorBrainError } from '../types/errors';

const initialState: LifeAreaState = {
  items: [],
  selectedId: null,
  isLoading: false,
  error: null,
};

// Factory function that creates the store and computed values
export function createLifeAreaStore() {
  const [state, { setState }] = createStore(initialState, 'LifeArea');

  // Computed values - created inside the factory to ensure proper reactive context
  const selectedLifeArea = createMemo(() =>
    state.items.find((area) => area.id === state.selectedId),
  );

  const activeLifeAreas = createMemo(() => state.items.filter((area) => !area.archived_at));

  const computed = {
    selectedLifeArea,
    activeLifeAreas,
  };

  // Actions
  const actions = {
    setState,

    // Fetch all life areas
    async fetchAll() {
      setState('isLoading', true);
      setState('error', null);

      try {
        const items = await api.lifeArea.getAll();
        setState('items', items);
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to fetch life areas';
        setState('error', message);
        console.error('Failed to fetch life areas:', error);
      } finally {
        setState('isLoading', false);
      }
    },

    // Create a new life area
    async create(data: {
      name: string;
      description?: string;
      icon?: string;
      color?: string;
      priority?: 'low' | 'medium' | 'high';
    }) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const created = await api.lifeArea.create(data);
        setState('items', (items) => [...items, created]);
        return created;
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to create life area';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Update a life area
    async update(
      id: string,
      data: {
        name: string;
        description?: string;
        icon?: string;
        color?: string;
        priority?: 'low' | 'medium' | 'high';
      },
    ) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const updated = await api.lifeArea.update({ id, ...data });
        setState('items', (item) => item.id === id, updated);
        return updated;
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to update life area';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Delete (archive) a life area
    async delete(id: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        await api.lifeArea.delete(id);
        // Refetch to get updated state (with cascaded archives)
        await actions.fetchAll();
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to delete life area';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Restore an archived life area
    async restore(id: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const restored = await api.lifeArea.restore(id);
        setState('items', (item) => item.id === id, restored);
        return restored;
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to restore life area';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Select a life area
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
export const LifeAreaStoreContext = createStoreContext({
  name: 'LifeAreaStore',
  factory: createLifeAreaStore,
});

// Export provider and hook for convenience
export const LifeAreaStoreProvider = LifeAreaStoreContext.Provider;
export const useLifeAreaStore = LifeAreaStoreContext.useStore;

// For backward compatibility, export a singleton instance
// This will be deprecated in favor of the context-based approach
let singletonInstance: ReturnType<typeof createLifeAreaStore> | null = null;

export function getLifeAreaStore() {
  if (!singletonInstance) {
    console.warn(
      'Using getLifeAreaStore() is deprecated. Please use LifeAreaStoreProvider and useLifeAreaStore() instead.',
    );
    singletonInstance = createLifeAreaStore();
  }
  return singletonInstance;
}

// Export individual pieces for backward compatibility
export const lifeAreaStore = new Proxy({} as LifeAreaState, {
  get(_target, prop) {
    return getLifeAreaStore().state[prop as keyof LifeAreaState];
  },
});

export const lifeAreaActions = new Proxy({} as ReturnType<typeof createLifeAreaStore>['actions'], {
  get(_target, prop) {
    return getLifeAreaStore().actions[
      prop as keyof ReturnType<typeof createLifeAreaStore>['actions']
    ];
  },
});

export const selectedLifeArea = () => getLifeAreaStore().computed.selectedLifeArea();
export const activeLifeAreas = () => getLifeAreaStore().computed.activeLifeAreas();
