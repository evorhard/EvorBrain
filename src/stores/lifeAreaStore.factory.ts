import { createStore } from 'solid-js/store';
import { createMemo } from 'solid-js';
import type { LifeAreaState } from './types';
import type { LifeArea } from '../types/models';
import type { CreateLifeAreaRequest, UpdateLifeAreaRequest } from '../types/commands';
import { EvorBrainError } from '../types/errors';

/**
 * Factory function that creates a completely independent life area store instance.
 * This is the preferred approach for testable stores.
 *
 * @param api - The API client to use for data fetching
 * @param options - Optional configuration for the store
 */
export function createLifeAreaStoreFactory(
  api: {
    lifeArea: {
      getAll: () => Promise<LifeArea[]>;
      create: (data: CreateLifeAreaRequest) => Promise<LifeArea>;
      update: (data: UpdateLifeAreaRequest) => Promise<LifeArea>;
      delete: (id: string) => Promise<void>;
      restore: (id: string) => Promise<LifeArea>;
    };
  },
  options?: {
    debug?: boolean;
    initialState?: Partial<LifeAreaState>;
  },
) {
  // Create initial state
  const initialState: LifeAreaState = {
    items: [],
    selectedId: null,
    isLoading: false,
    error: null,
    ...options?.initialState,
  };

  // Create the store
  const [state, setState] = createStore(initialState);

  if (options?.debug) {
    console.warn('[LifeArea Store] Created with initial state:', initialState);
  }

  // Computed values
  const selectedLifeArea = createMemo(() =>
    state.items.find((area) => area.id === state.selectedId),
  );

  const activeLifeAreas = createMemo(() => state.items.filter((area) => !area.archived_at));

  // Actions
  const actions = {
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
    async create(data: { name: string; description?: string; color?: string; icon?: string }) {
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
      data: { name: string; description?: string; color?: string; icon?: string },
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
        // Clear selection if the deleted item was selected
        if (state.selectedId === id) {
          setState('selectedId', null);
        }
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

    // For testing: direct state manipulation
    _setState: setState,
  };

  return {
    state,
    actions,
    selectedLifeArea,
    activeLifeAreas,
  };
}

export type LifeAreaStoreInstance = ReturnType<typeof createLifeAreaStoreFactory>;
