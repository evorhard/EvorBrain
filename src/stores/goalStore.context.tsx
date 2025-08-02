import { createMemo } from 'solid-js';
import { createStore } from './createStore';
import { createStoreContext } from './createStoreContext';
import type { GoalState } from './types';
import type { Goal } from '../types/models';
import { api } from '../lib/api';
import { EvorBrainError } from '../types/errors';

const initialState: GoalState = {
  items: [],
  selectedId: null,
  isLoading: false,
  error: null,
};

// Factory function that creates the store and computed values
export function createGoalStore() {
  const [state, { setState }] = createStore(initialState, 'Goal');

  // Computed values - created inside the factory to ensure proper reactive context
  const computed = {
    selectedGoal: createMemo(() =>
      state.items.find((goal) => goal.id === state.selectedId),
    ),

    activeGoals: createMemo(() => state.items.filter((goal) => !goal.archived_at)),

    completedGoals: createMemo(() => state.items.filter((goal) => goal.completed_at)),

    goalsByLifeArea: createMemo(() => {
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
    }),
  };

  // Actions
  const actions = {
    setState,
    
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
        const message = error instanceof EvorBrainError ? error.message : 'Failed to uncomplete goal';
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
  };

  return { state, actions, computed };
}

// Create the context-based store
export const GoalStoreContext = createStoreContext({
  name: 'GoalStore',
  factory: createGoalStore,
});

// Export provider and hook for convenience
export const GoalStoreProvider = GoalStoreContext.Provider;
export const useGoalStore = GoalStoreContext.useStore;

// For backward compatibility, export a singleton instance
// This will be deprecated in favor of the context-based approach
let singletonInstance: ReturnType<typeof createGoalStore> | null = null;

export function getGoalStore() {
  if (!singletonInstance) {
    console.warn(
      'Using getGoalStore() is deprecated. Please use GoalStoreProvider and useGoalStore() instead.'
    );
    singletonInstance = createGoalStore();
  }
  return singletonInstance;
}

// Export individual pieces for backward compatibility
export const goalStore = new Proxy({} as GoalState, {
  get(_target, prop) {
    return getGoalStore().state[prop as keyof GoalState];
  },
});

export const goalActions = new Proxy({} as ReturnType<typeof createGoalStore>['actions'], {
  get(_target, prop) {
    return getGoalStore().actions[prop as keyof ReturnType<typeof createGoalStore>['actions']];
  },
});

export const selectedGoal = () => getGoalStore().computed.selectedGoal();
export const activeGoals = () => getGoalStore().computed.activeGoals();
export const completedGoals = () => getGoalStore().computed.completedGoals();
export const goalsByLifeArea = () => getGoalStore().computed.goalsByLifeArea();