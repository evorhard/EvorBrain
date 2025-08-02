import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@solidjs/testing-library';
import { createRoot, createSignal } from 'solid-js';
import { createGoalStore, GoalStoreProvider, useGoalStore } from './goalStore.context';

describe('Goal Store Context', () => {
  describe('createGoalStore factory', () => {
    it('should create store with initial state', () => {
      const store = createRoot(() => createGoalStore());

      expect(store.state.items).toEqual([]);
      expect(store.state.selectedId).toBe(null);
      expect(store.state.isLoading).toBe(false);
      expect(store.state.error).toBe(null);
    });

    it('should have all computed values', () => {
      const store = createRoot(() => createGoalStore());

      expect(store.computed.selectedGoal()).toBe(undefined);
      expect(store.computed.activeGoals()).toEqual([]);
      expect(store.computed.completedGoals()).toEqual([]);
      expect(store.computed.goalsByLifeArea()).toBeInstanceOf(Map);
    });

    it('should have all actions', () => {
      const store = createRoot(() => createGoalStore());

      expect(store.actions.fetchAll).toBeInstanceOf(Function);
      expect(store.actions.fetchByLifeArea).toBeInstanceOf(Function);
      expect(store.actions.create).toBeInstanceOf(Function);
      expect(store.actions.update).toBeInstanceOf(Function);
      expect(store.actions.complete).toBeInstanceOf(Function);
      expect(store.actions.uncomplete).toBeInstanceOf(Function);
      expect(store.actions.delete).toBeInstanceOf(Function);
      expect(store.actions.restore).toBeInstanceOf(Function);
      expect(store.actions.select).toBeInstanceOf(Function);
      expect(store.actions.clearError).toBeInstanceOf(Function);
    });
  });

  describe('GoalStore with context', () => {
    it('should provide store through context', async () => {
      let capturedStore: ReturnType<typeof useGoalStore> | null = null;

      function TestComponent() {
        capturedStore = useGoalStore();
        return null;
      }

      render(() => (
        <GoalStoreProvider>
          <TestComponent />
        </GoalStoreProvider>
      ));

      await waitFor(() => {
        expect(capturedStore).not.toBe(null);
        expect(capturedStore!.state).toBeDefined();
        expect(capturedStore!.actions).toBeDefined();
        expect(capturedStore!.computed).toBeDefined();
      });
    });

    it('should throw error when used outside provider', () => {
      function TestComponent() {
        useGoalStore();
        return null;
      }

      expect(() => render(() => <TestComponent />)).toThrow(
        'useGoalStore must be used within GoalStoreProvider',
      );
    });
  });

  describe('Store actions', () => {
    it('should update selected id', () => {
      const store = createRoot(() => createGoalStore());

      expect(store.state.selectedId).toBe(null);
      
      store.actions.select('test-id');
      expect(store.state.selectedId).toBe('test-id');
      
      store.actions.select(null);
      expect(store.state.selectedId).toBe(null);
    });

    it('should clear error', () => {
      const store = createRoot(() => createGoalStore());

      // Set an error
      store.actions.setState('error', 'Test error');
      expect(store.state.error).toBe('Test error');
      
      // Clear error
      store.actions.clearError();
      expect(store.state.error).toBe(null);
    });

    it('should handle loading state', () => {
      const store = createRoot(() => createGoalStore());

      expect(store.state.isLoading).toBe(false);
      
      store.actions.setState('isLoading', true);
      expect(store.state.isLoading).toBe(true);
      
      store.actions.setState('isLoading', false);
      expect(store.state.isLoading).toBe(false);
    });
  });
});