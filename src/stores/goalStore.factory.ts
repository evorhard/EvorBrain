import { createStore } from 'solid-js/store';
import { createMemo } from 'solid-js';
import type { GoalState } from './types';
import type { Goal } from '../types/models';
import type { CreateGoalRequest, UpdateGoalRequest } from '../types/commands';
import { EvorBrainError } from '../types/errors';

/**
 * Factory function that creates a completely independent goal store instance.
 * This is the preferred approach for testable stores.
 *
 * @param api - The API client to use for data fetching
 * @param options - Optional configuration for the store
 */
export function createGoalStoreFactory(
  api: {
    goal: {
      getAll: () => Promise<Goal[]>;
      getByLifeArea: (lifeAreaId: string) => Promise<Goal[]>;
      create: (data: CreateGoalRequest) => Promise<Goal>;
      update: (data: UpdateGoalRequest) => Promise<Goal>;
      complete: (id: string) => Promise<Goal>;
      uncomplete: (id: string) => Promise<Goal>;
      delete: (id: string) => Promise<void>;
      restore: (id: string) => Promise<Goal>;
    };
  },
  options?: {
    debug?: boolean;
    initialState?: Partial<GoalState>;
  },
) {
  // Create initial state
  const initialState: GoalState = {
    items: [],
    selectedId: null,
    isLoading: false,
    error: null,
    ...options?.initialState,
  };

  // Create the store
  const [state, setState] = createStore(initialState);

  if (options?.debug) {
    console.warn('[Goal Store] Created with initial state:', initialState);
  }

  // Computed values
  const selectedGoal = createMemo(() => state.items.find((goal) => goal.id === state.selectedId));

  const activeGoals = createMemo(() => state.items.filter((goal) => !goal.archived_at));

  const completedGoals = createMemo(() => state.items.filter((goal) => goal.completed_at));

  const goalsByLifeArea = createMemo(() => {
    const grouped = new Map<string, Goal[]>();
    state.items.forEach((goal) => {
      if (!grouped.has(goal.life_area_id)) {
        grouped.set(goal.life_area_id, []);
      }
      const goals = grouped.get(goal.life_area_id);
      if (goals) {
        goals.push(goal);
      }
    });
    return grouped;
  });

  // Actions
  const actions = {
    // Fetch all goals
    async fetchAll() {
      setState('isLoading', true);
      setState('error', null);

      try {
        const items = await api.goal.getAll();
        setState('items', items);
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to fetch goals';
        setState('error', message);
        console.error('Failed to fetch goals:', error);
      } finally {
        setState('isLoading', false);
      }
    },

    // Fetch goals by life area
    async fetchByLifeArea(lifeAreaId: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const items = await api.goal.getByLifeArea(lifeAreaId);
        setState('items', items);
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to fetch goals';
        setState('error', message);
        console.error('Failed to fetch goals:', error);
      } finally {
        setState('isLoading', false);
      }
    },

    // Create a new goal
    async create(data: {
      life_area_id: string;
      name: string;
      description?: string;
      target_date?: string;
      priority?: 'low' | 'medium' | 'high';
    }) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const created = await api.goal.create(data);
        setState('items', (items) => [...items, created]);
        return created;
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to create goal';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Update a goal
    async update(
      id: string,
      data: {
        name: string;
        description?: string;
        target_date?: string;
        priority?: 'low' | 'medium' | 'high';
      },
    ) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const updated = await api.goal.update({ id, ...data });
        setState('items', (item) => item.id === id, updated);
        return updated;
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to update goal';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Complete a goal
    async complete(id: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const completed = await api.goal.complete(id);
        setState('items', (item) => item.id === id, completed);
        return completed;
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to complete goal';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Uncomplete a goal
    async uncomplete(id: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const uncompleted = await api.goal.uncomplete(id);
        setState('items', (item) => item.id === id, uncompleted);
        return uncompleted;
      } catch (error) {
        const message =
          error instanceof EvorBrainError ? error.message : 'Failed to uncomplete goal';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Delete (archive) a goal
    async delete(id: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        await api.goal.delete(id);
        // Refetch to get updated state (with cascaded archives)
        await actions.fetchAll();
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to delete goal';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Restore an archived goal
    async restore(id: string) {
      setState('isLoading', true);
      setState('error', null);

      try {
        const restored = await api.goal.restore(id);
        setState('items', (item) => item.id === id, restored);
        return restored;
      } catch (error) {
        const message = error instanceof EvorBrainError ? error.message : 'Failed to restore goal';
        setState('error', message);
        throw error;
      } finally {
        setState('isLoading', false);
      }
    },

    // Select a goal
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
    selectedGoal,
    activeGoals,
    completedGoals,
    goalsByLifeArea,
  };
}

export type GoalStoreInstance = ReturnType<typeof createGoalStoreFactory>;

