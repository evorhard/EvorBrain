import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { createGoalStoreFactory } from './goalStore.factory';
import { createGoal, createLifeArea } from '../test/utils';

describe('Goal Store Factory', () => {
  let mockApi: any;
  let dispose: (() => void) | undefined;

  beforeEach(() => {
    // Create mock API
    mockApi = {
      goal: {
        getAll: vi.fn(),
        getByLifeArea: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        complete: vi.fn(),
        uncomplete: vi.fn(),
        delete: vi.fn(),
        restore: vi.fn(),
      },
    };
  });

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    vi.clearAllMocks();
  });

  describe('Store Creation', () => {
    it('should create independent store instances', () => {
      createRoot((d) => {
        dispose = d;

        const store1 = createGoalStoreFactory(mockApi);
        const store2 = createGoalStoreFactory(mockApi);

        // Stores should be independent
        store1.actions.select('test-id');

        expect(store1.state.selectedId).toBe('test-id');
        expect(store2.state.selectedId).toBeNull();
      });
    });

    it('should not make API calls on creation', () => {
      createRoot((d) => {
        dispose = d;
        const store = createGoalStoreFactory(mockApi);

        // Verify no API calls were made during creation
        expect(mockApi.goal.getAll).not.toHaveBeenCalled();
        expect(mockApi.goal.create).not.toHaveBeenCalled();

        // Store should have initial state
        expect(store.state.items).toEqual([]);
        expect(store.state.isLoading).toBe(false);
        expect(store.state.error).toBeNull();
      });
    });

    it('should accept initial state', () => {
      createRoot((d) => {
        dispose = d;
        const initialItems = [createGoal({ name: 'Preset Goal' })];
        const store = createGoalStoreFactory(mockApi, {
          initialState: {
            items: initialItems,
            selectedId: 'preset-id',
          },
        });

        expect(store.state.items).toEqual(initialItems);
        expect(store.state.selectedId).toBe('preset-id');
      });
    });
  });

  describe('fetchAll', () => {
    it('should fetch and set goals', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const lifeArea = createLifeArea({ name: 'Career' });
        const mockGoals = [
          createGoal({ name: 'Learn TypeScript', life_area_id: lifeArea.id }),
          createGoal({ name: 'Build SaaS', life_area_id: lifeArea.id }),
        ];

        mockApi.goal.getAll.mockResolvedValue(mockGoals);

        const store = createGoalStoreFactory(mockApi);

        // Initial state
        expect(store.state.items).toEqual([]);
        expect(store.state.isLoading).toBe(false);

        // Fetch goals
        await store.actions.fetchAll();

        // Verify API was called
        expect(mockApi.goal.getAll).toHaveBeenCalledTimes(1);

        // Verify state was updated
        expect(store.state.items).toEqual(mockGoals);
        expect(store.state.isLoading).toBe(false);
        expect(store.state.error).toBeNull();
      });
    });

    it('should handle errors when fetching fails', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const error = new Error('Database error');
        mockApi.goal.getAll.mockRejectedValue(error);

        const store = createGoalStoreFactory(mockApi);
        await store.actions.fetchAll();

        expect(store.state.items).toEqual([]);
        expect(store.state.error).toBe('Failed to fetch goals');
        expect(store.state.isLoading).toBe(false);
      });
    });

    it('should set loading state during fetch', async () => {
      await createRoot(async (d) => {
        dispose = d;
        let resolvePromise: (value: any) => void;
        const promise = new Promise((resolve) => {
          resolvePromise = resolve;
        });
        mockApi.goal.getAll.mockReturnValue(promise);

        const store = createGoalStoreFactory(mockApi);

        // Start fetching
        const fetchPromise = store.actions.fetchAll();

        // Should be loading
        expect(store.state.isLoading).toBe(true);

        // Resolve the promise
        resolvePromise([]);
        await fetchPromise;

        // Should not be loading anymore
        expect(store.state.isLoading).toBe(false);
      });
    });
  });

  describe('fetchByLifeArea', () => {
    it('should fetch goals by life area', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const lifeAreaId = 'life-area-123';
        const mockGoals = [
          createGoal({ name: 'Goal 1', life_area_id: lifeAreaId }),
          createGoal({ name: 'Goal 2', life_area_id: lifeAreaId }),
        ];

        mockApi.goal.getByLifeArea.mockResolvedValue(mockGoals);

        const store = createGoalStoreFactory(mockApi);
        await store.actions.fetchByLifeArea(lifeAreaId);

        expect(mockApi.goal.getByLifeArea).toHaveBeenCalledWith(lifeAreaId);
        expect(store.state.items).toEqual(mockGoals);
      });
    });
  });

  describe('create', () => {
    it('should create a new goal', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const lifeAreaId = 'life-area-123';
        const newGoal = createGoal({
          name: 'New Goal',
          life_area_id: lifeAreaId,
          priority: 'high',
        });
        mockApi.goal.create.mockResolvedValue(newGoal);

        const store = createGoalStoreFactory(mockApi);

        const result = await store.actions.create({
          name: 'New Goal',
          life_area_id: lifeAreaId,
          priority: 'high',
        });

        expect(mockApi.goal.create).toHaveBeenCalledWith({
          name: 'New Goal',
          life_area_id: lifeAreaId,
          priority: 'high',
        });
        expect(result).toEqual(newGoal);
        expect(store.state.items).toContainEqual(newGoal);
      });
    });

    it('should handle validation errors', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const error = new Error('Name is required');
        mockApi.goal.create.mockRejectedValue(error);

        const store = createGoalStoreFactory(mockApi);

        await expect(store.actions.create({ name: '', life_area_id: 'test' })).rejects.toThrow();
        expect(store.state.error).toBe('Failed to create goal');
      });
    });
  });

  describe('update', () => {
    it('should update an existing goal', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const existingGoal = createGoal({ id: 'test-id', name: 'Old Name' });
        const updatedGoal = { ...existingGoal, name: 'New Name' };

        mockApi.goal.update.mockResolvedValue(updatedGoal);

        const store = createGoalStoreFactory(mockApi, {
          initialState: { items: [existingGoal] },
        });

        const result = await store.actions.update('test-id', { name: 'New Name' });

        expect(mockApi.goal.update).toHaveBeenCalledWith({ id: 'test-id', name: 'New Name' });
        expect(result).toEqual(updatedGoal);
        expect(store.state.items[0]).toEqual(updatedGoal);
      });
    });
  });

  describe('complete/uncomplete', () => {
    it('should complete a goal', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const goal = createGoal({ id: 'test-id', name: 'Test Goal' });
        const completedGoal = {
          ...goal,
          completed_at: new Date().toISOString(),
        };

        mockApi.goal.complete.mockResolvedValue(completedGoal);

        const store = createGoalStoreFactory(mockApi, {
          initialState: { items: [goal] },
        });

        const result = await store.actions.complete('test-id');

        expect(mockApi.goal.complete).toHaveBeenCalledWith('test-id');
        expect(result).toEqual(completedGoal);
        expect(store.state.items[0].completed_at).toBeTruthy();
      });
    });

    it('should uncomplete a goal', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const completedGoal = createGoal({
          id: 'test-id',
          name: 'Test Goal',
          completed_at: new Date().toISOString(),
        });
        const uncompletedGoal = { ...completedGoal, completed_at: null };

        mockApi.goal.uncomplete.mockResolvedValue(uncompletedGoal);

        const store = createGoalStoreFactory(mockApi, {
          initialState: { items: [completedGoal] },
        });

        const result = await store.actions.uncomplete('test-id');

        expect(mockApi.goal.uncomplete).toHaveBeenCalledWith('test-id');
        expect(result).toEqual(uncompletedGoal);
        expect(store.state.items[0].completed_at).toBeNull();
      });
    });
  });

  describe('delete', () => {
    it('should delete and refetch goals', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const goal = createGoal({ id: 'test-id', name: 'Test Goal' });
        const archivedGoal = { ...goal, archived_at: new Date().toISOString() };

        mockApi.goal.delete.mockResolvedValue(undefined);
        mockApi.goal.getAll.mockResolvedValue([archivedGoal]);

        const store = createGoalStoreFactory(mockApi, {
          initialState: { items: [goal] },
        });

        await store.actions.delete('test-id');

        expect(mockApi.goal.delete).toHaveBeenCalledWith('test-id');
        expect(mockApi.goal.getAll).toHaveBeenCalled();
        expect(store.state.items[0].archived_at).toBeTruthy();
      });
    });
  });

  describe('restore', () => {
    it('should restore an archived goal', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const archivedGoal = createGoal({
          id: 'test-id',
          name: 'Test Goal',
          archived_at: new Date().toISOString(),
        });
        const restoredGoal = { ...archivedGoal, archived_at: null };

        mockApi.goal.restore.mockResolvedValue(restoredGoal);

        const store = createGoalStoreFactory(mockApi, {
          initialState: { items: [archivedGoal] },
        });

        const result = await store.actions.restore('test-id');

        expect(mockApi.goal.restore).toHaveBeenCalledWith('test-id');
        expect(result).toEqual(restoredGoal);
        expect(store.state.items[0].archived_at).toBeNull();
      });
    });
  });

  describe('Computed Values', () => {
    it('should compute selectedGoal correctly', () => {
      createRoot((d) => {
        dispose = d;
        const goals = [
          createGoal({ id: '1', name: 'Goal 1' }),
          createGoal({ id: '2', name: 'Goal 2' }),
        ];

        const store = createGoalStoreFactory(mockApi, {
          initialState: { items: goals },
        });

        // Initially no selection
        expect(store.selectedGoal()).toBeUndefined();

        // Select first goal
        store.actions.select('1');
        expect(store.selectedGoal()).toEqual(goals[0]);

        // Select second goal
        store.actions.select('2');
        expect(store.selectedGoal()).toEqual(goals[1]);
      });
    });

    it('should compute activeGoals correctly', () => {
      createRoot((d) => {
        dispose = d;
        const goals = [
          createGoal({ name: 'Active 1' }),
          createGoal({ name: 'Archived', archived_at: new Date().toISOString() }),
          createGoal({ name: 'Active 2' }),
        ];

        const store = createGoalStoreFactory(mockApi, {
          initialState: { items: goals },
        });

        const activeGoals = store.activeGoals();
        expect(activeGoals).toHaveLength(2);
        expect(activeGoals.every((g) => !g.archived_at)).toBe(true);
        expect(activeGoals.map((g) => g.name)).toEqual(['Active 1', 'Active 2']);
      });
    });

    it('should compute completedGoals correctly', () => {
      createRoot((d) => {
        dispose = d;
        const goals = [
          createGoal({ name: 'Incomplete 1' }),
          createGoal({ name: 'Complete', completed_at: new Date().toISOString() }),
          createGoal({ name: 'Incomplete 2' }),
        ];

        const store = createGoalStoreFactory(mockApi, {
          initialState: { items: goals },
        });

        const completedGoals = store.completedGoals();
        expect(completedGoals).toHaveLength(1);
        expect(completedGoals[0].name).toBe('Complete');
      });
    });

    it('should compute goalsByLifeArea correctly', () => {
      createRoot((d) => {
        dispose = d;
        const lifeArea1 = 'life-area-1';
        const lifeArea2 = 'life-area-2';
        const goals = [
          createGoal({ name: 'Goal 1', life_area_id: lifeArea1 }),
          createGoal({ name: 'Goal 2', life_area_id: lifeArea2 }),
          createGoal({ name: 'Goal 3', life_area_id: lifeArea1 }),
        ];

        const store = createGoalStoreFactory(mockApi, {
          initialState: { items: goals },
        });

        const grouped = store.goalsByLifeArea();
        expect(grouped.get(lifeArea1)?.length).toBe(2);
        expect(grouped.get(lifeArea2)?.length).toBe(1);
        expect(grouped.get(lifeArea1)?.map((g) => g.name)).toEqual(['Goal 1', 'Goal 3']);
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear error with clearError', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const error = new Error('Test error');
        mockApi.goal.getAll.mockRejectedValue(error);

        const store = createGoalStoreFactory(mockApi);
        await store.actions.fetchAll();

        expect(store.state.error).toBe('Failed to fetch goals');

        store.actions.clearError();
        expect(store.state.error).toBeNull();
      });
    });
  });
});

