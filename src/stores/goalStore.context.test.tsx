import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup } from '@solidjs/testing-library';
import { GoalStoreProvider, useGoalStore } from './goalStore.context';
import { createTestStore } from './createStoreContext';
import type { Goal } from '../types/models';

// Mock the API
vi.mock('../lib/api', () => ({
  api: {
    goal: {
      getAll: vi.fn().mockResolvedValue([]),
      getByLifeArea: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      complete: vi.fn(),
      uncomplete: vi.fn(),
      delete: vi.fn(),
      restore: vi.fn(),
    },
  },
}));

describe('GoalStore Context', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should provide store through context without reactive warnings', () => {
    let storeResult: any;

    const TestComponent = () => {
      const store = useGoalStore();
      storeResult = store;
      return <div>Test</div>;
    };

    render(() => (
      <GoalStoreProvider>
        <TestComponent />
      </GoalStoreProvider>
    ));

    expect(storeResult).toBeDefined();
    expect(storeResult.state).toBeDefined();
    expect(storeResult.actions).toBeDefined();
    expect(storeResult.computed).toBeDefined();
  });

  it('should provide reactive computed values', () => {
    let activeGoalsResult: Goal[] | undefined;
    let completedGoalsResult: Goal[] | undefined;

    const TestComponent = () => {
      const { computed } = useGoalStore();
      activeGoalsResult = computed.activeGoals();
      completedGoalsResult = computed.completedGoals();
      return <div>Test</div>;
    };

    render(() => (
      <GoalStoreProvider>
        <TestComponent />
      </GoalStoreProvider>
    ));

    expect(activeGoalsResult).toEqual([]);
    expect(completedGoalsResult).toEqual([]);
  });

  it('should throw error when used outside provider', () => {
    const TestComponent = () => {
      try {
        useGoalStore();
      } catch (error) {
        return <div>{(error as Error).message}</div>;
      }
      return <div>No error</div>;
    };

    const { getByText } = render(() => <TestComponent />);
    expect(getByText('useGoalStore must be used within GoalStoreProvider')).toBeTruthy();
  });

  it('should support testing with createTestStore', async () => {
    // This demonstrates how to test stores without the provider
    const { api } = await import('../lib/api');
    
    // Create a test goal
    const testGoal: Goal = {
      id: '1',
      life_area_id: 'life-1',
      name: 'Test Goal',
      description: 'Test description',
      priority: 'high',
      target_date: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived_at: null,
    };

    // Mock the API response
    vi.mocked(api.goal.create).mockResolvedValue(testGoal);

    // Import the factory directly for testing
    const { createGoalStore } = await import('./goalStore.context');
    const testStore = createTestStore(() => createGoalStore());
    const { getStore, cleanup: cleanupStore } = testStore();
    
    const store = getStore();
    expect(store.state.items).toHaveLength(0);
    
    // Test an action
    await store.actions.create({
      life_area_id: 'life-1',
      name: 'Test Goal',
      description: 'Test description',
      priority: 'high',
    });
    
    expect(store.state.items).toHaveLength(1);

    // Cleanup
    cleanupStore();
  });
});