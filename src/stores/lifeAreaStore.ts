import { createStore } from './createStore';
import { createMemo } from 'solid-js';
import type { LifeAreaState } from './types';
import { api } from '../lib/api';
import { EvorBrainError } from '../types/errors';

const initialState: LifeAreaState = {
  items: [],
  selectedId: null,
  isLoading: false,
  error: null,
};

const [state, { setState }] = createStore(initialState, 'LifeArea');

// Computed values
export const selectedLifeArea = createMemo(() =>
  state.items.find((area) => area.id === state.selectedId),
);

export const activeLifeAreas = createMemo(() => state.items.filter((area) => !area.archived_at));

// Actions
export const lifeAreaActions = {
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
      // Refetch to get updated state (with cascaded archives)
      await lifeAreaActions.fetchAll();
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

// Export store and actions
export const lifeAreaStore = state;
