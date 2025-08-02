import { createMemo } from 'solid-js';
import { createLazyStore } from './createLazyStore';
import type { LifeAreaState } from './types';
import type { LifeArea } from '../types/models';
import type { CreateLifeAreaRequest, UpdateLifeAreaRequest } from '../types/commands';
import { EvorBrainError } from '../types/errors';

const initialState: LifeAreaState = {
  items: [],
  selectedId: null,
  isLoading: false,
  error: null,
};

/**
 * Factory function that creates a life area store with its actions.
 * This allows for better testing by deferring store creation.
 *
 * @param api - The API client to use for data fetching
 */
export function createLifeAreaStore(api: {
  lifeArea: {
    getAll: () => Promise<LifeArea[]>;
    create: (data: CreateLifeAreaRequest) => Promise<LifeArea>;
    update: (data: UpdateLifeAreaRequest) => Promise<LifeArea>;
    delete: (id: string) => Promise<void>;
    restore: (id: string) => Promise<LifeArea>;
  };
}) {
  const getStore = createLazyStore(initialState, { name: 'LifeArea', debug: true });

  // Lazy getters for store access
  const getState = () => getStore().state;
  const getSetState = () => getStore().setState;

  // Computed values
  const selectedLifeArea = () => {
    const state = getState();
    return createMemo(() => state.items.find((area) => area.id === state.selectedId));
  };

  const activeLifeAreas = () => {
    const state = getState();
    return createMemo(() => state.items.filter((area) => !area.archived_at));
  };

  // Actions
  const actions = {
    // Fetch all life areas
    async fetchAll() {
      const setState = getSetState();
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
      const setState = getSetState();
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
      const setState = getSetState();
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
      const setState = getSetState();
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
      const setState = getSetState();
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
      const setState = getSetState();
      setState('selectedId', id);
    },

    // Clear error
    clearError() {
      const setState = getSetState();
      setState('error', null);
    },
  };

  return {
    get state() {
      return getState();
    },
    actions,
    selectedLifeArea,
    activeLifeAreas,
  };
}
