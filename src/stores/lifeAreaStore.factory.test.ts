import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRoot } from 'solid-js';
import { createLifeAreaStoreFactory } from './lifeAreaStore.factory';
import { createLifeArea } from '../test/utils';

describe('Life Area Store Factory', () => {
  let mockApi: any;
  let dispose: () => void;

  beforeEach(() => {
    // Create mock API
    mockApi = {
      lifeArea: {
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        restore: vi.fn(),
      },
    };
  });

  afterEach(() => {
    dispose?.();
    vi.clearAllMocks();
  });

  describe('Store Creation', () => {
    it('should create independent store instances', () => {
      createRoot((d) => {
        dispose = d;

        const store1 = createLifeAreaStoreFactory(mockApi);
        const store2 = createLifeAreaStoreFactory(mockApi);

        // Stores should be independent
        store1.actions.select('test-id');

        expect(store1.state.selectedId).toBe('test-id');
        expect(store2.state.selectedId).toBeNull();
      });
    });

    it('should not make API calls on creation', () => {
      const store = createLifeAreaStoreFactory(mockApi);

      // Verify no API calls were made during creation
      expect(mockApi.lifeArea.getAll).not.toHaveBeenCalled();
      expect(mockApi.lifeArea.create).not.toHaveBeenCalled();

      // Store should have initial state
      expect(store.state.items).toEqual([]);
      expect(store.state.isLoading).toBe(false);
      expect(store.state.error).toBeNull();
    });

    it('should accept initial state', () => {
      const initialItems = [createLifeArea({ name: 'Preset' })];
      const store = createLifeAreaStoreFactory(mockApi, {
        initialState: {
          items: initialItems,
          selectedId: 'preset-id',
        },
      });

      expect(store.state.items).toEqual(initialItems);
      expect(store.state.selectedId).toBe('preset-id');
    });
  });

  describe('fetchAll', () => {
    it('should fetch and set life areas', async () => {
      const mockAreas = [createLifeArea({ name: 'Work' }), createLifeArea({ name: 'Personal' })];

      mockApi.lifeArea.getAll.mockResolvedValue(mockAreas);

      const store = createLifeAreaStoreFactory(mockApi);

      // Initial state
      expect(store.state.items).toEqual([]);
      expect(store.state.isLoading).toBe(false);

      // Fetch areas
      await store.actions.fetchAll();

      // Verify API was called
      expect(mockApi.lifeArea.getAll).toHaveBeenCalledTimes(1);

      // Verify state was updated
      expect(store.state.items).toEqual(mockAreas);
      expect(store.state.isLoading).toBe(false);
      expect(store.state.error).toBeNull();
    });

    it('should handle errors when fetching fails', async () => {
      const error = new Error('Database error');
      mockApi.lifeArea.getAll.mockRejectedValue(error);

      const store = createLifeAreaStoreFactory(mockApi);
      await store.actions.fetchAll();

      expect(store.state.items).toEqual([]);
      expect(store.state.error).toBe('Failed to fetch life areas');
      expect(store.state.isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApi.lifeArea.getAll.mockReturnValue(promise);

      const store = createLifeAreaStoreFactory(mockApi);

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

  describe('create', () => {
    it('should create a new life area', async () => {
      const newArea = createLifeArea({ name: 'Health' });
      mockApi.lifeArea.create.mockResolvedValue(newArea);

      const store = createLifeAreaStoreFactory(mockApi);

      const result = await store.actions.create({ name: 'Health' });

      expect(mockApi.lifeArea.create).toHaveBeenCalledWith({ name: 'Health' });
      expect(result).toEqual(newArea);
      expect(store.state.items).toContainEqual(newArea);
    });

    it('should handle validation errors', async () => {
      const error = new Error('Name is required');
      mockApi.lifeArea.create.mockRejectedValue(error);

      const store = createLifeAreaStoreFactory(mockApi);

      await expect(store.actions.create({ name: '' })).rejects.toThrow();
      expect(store.state.error).toBe('Failed to create life area');
    });
  });

  describe('update', () => {
    it('should update an existing life area', async () => {
      const existingArea = createLifeArea({ id: 'test-id', name: 'Work' });
      const updatedArea = { ...existingArea, name: 'Career' };

      mockApi.lifeArea.update.mockResolvedValue(updatedArea);

      const store = createLifeAreaStoreFactory(mockApi, {
        initialState: { items: [existingArea] },
      });

      const result = await store.actions.update('test-id', { name: 'Career' });

      expect(mockApi.lifeArea.update).toHaveBeenCalledWith({ id: 'test-id', name: 'Career' });
      expect(result).toEqual(updatedArea);
      expect(store.state.items[0]).toEqual(updatedArea);
    });
  });

  describe('delete', () => {
    it('should delete and refetch life areas', async () => {
      const area = createLifeArea({ id: 'test-id', name: 'Work' });
      const archivedArea = { ...area, archived_at: new Date().toISOString() };

      mockApi.lifeArea.delete.mockResolvedValue(undefined);
      mockApi.lifeArea.getAll.mockResolvedValue([archivedArea]);

      const store = createLifeAreaStoreFactory(mockApi, {
        initialState: { items: [area] },
      });

      await store.actions.delete('test-id');

      expect(mockApi.lifeArea.delete).toHaveBeenCalledWith('test-id');
      expect(mockApi.lifeArea.getAll).toHaveBeenCalled();
      expect(store.state.items[0].archived_at).toBeTruthy();
    });
  });

  describe('restore', () => {
    it('should restore an archived life area', async () => {
      const archivedArea = createLifeArea({
        id: 'test-id',
        name: 'Work',
        archived_at: new Date().toISOString(),
      });
      const restoredArea = { ...archivedArea, archived_at: null };

      mockApi.lifeArea.restore.mockResolvedValue(restoredArea);

      const store = createLifeAreaStoreFactory(mockApi, {
        initialState: { items: [archivedArea] },
      });

      const result = await store.actions.restore('test-id');

      expect(mockApi.lifeArea.restore).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(restoredArea);
      expect(store.state.items[0].archived_at).toBeNull();
    });
  });

  describe('Computed Values', () => {
    it('should compute selectedLifeArea correctly', () => {
      const areas = [
        createLifeArea({ id: '1', name: 'Work' }),
        createLifeArea({ id: '2', name: 'Personal' }),
      ];

      const store = createLifeAreaStoreFactory(mockApi, {
        initialState: { items: areas },
      });

      // Initially no selection
      expect(store.selectedLifeArea()).toBeUndefined();

      // Select first area
      store.actions.select('1');
      expect(store.selectedLifeArea()).toEqual(areas[0]);

      // Select second area
      store.actions.select('2');
      expect(store.selectedLifeArea()).toEqual(areas[1]);
    });

    it('should compute activeLifeAreas correctly', () => {
      const areas = [
        createLifeArea({ name: 'Active 1' }),
        createLifeArea({ name: 'Archived', archived_at: new Date().toISOString() }),
        createLifeArea({ name: 'Active 2' }),
      ];

      const store = createLifeAreaStoreFactory(mockApi, {
        initialState: { items: areas },
      });

      const activeAreas = store.activeLifeAreas();
      expect(activeAreas).toHaveLength(2);
      expect(activeAreas.every((a) => !a.archived_at)).toBe(true);
      expect(activeAreas.map((a) => a.name)).toEqual(['Active 1', 'Active 2']);
    });
  });

  describe('Error Handling', () => {
    it('should clear error with clearError', async () => {
      const error = new Error('Test error');
      mockApi.lifeArea.getAll.mockRejectedValue(error);

      const store = createLifeAreaStoreFactory(mockApi);
      await store.actions.fetchAll();

      expect(store.state.error).toBe('Failed to fetch life areas');

      store.actions.clearError();
      expect(store.state.error).toBeNull();
    });
  });
});
