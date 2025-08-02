import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRoot } from 'solid-js';
import { createLifeAreaStore } from './lifeAreaStore.lazy';
import { createLifeArea } from '../test/utils';

describe('Lazy Life Area Store', () => {
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

    // Create reactive root for tests
    createRoot((d) => {
      dispose = d;
    });
  });

  afterEach(() => {
    dispose?.();
    vi.clearAllMocks();
  });

  describe('Store Creation', () => {
    it('should create store lazily without API calls', () => {
      // This should not make any API calls
      const store = createLifeAreaStore(mockApi);
      
      // Verify no API calls were made during creation
      expect(mockApi.lifeArea.getAll).not.toHaveBeenCalled();
      expect(mockApi.lifeArea.create).not.toHaveBeenCalled();
      
      // Store should be accessible
      expect(store.state).toBeDefined();
      expect(store.state.items).toEqual([]);
      expect(store.state.isLoading).toBe(false);
      expect(store.state.error).toBeNull();
    });

    it('should allow multiple independent store instances', () => {
      const store1 = createLifeAreaStore(mockApi);
      const store2 = createLifeAreaStore(mockApi);
      
      // Stores should be independent
      store1.actions.select('test-id');
      
      expect(store1.state.selectedId).toBe('test-id');
      expect(store2.state.selectedId).toBeNull();
    });
  });

  describe('fetchAll', () => {
    it('should fetch and set life areas', async () => {
      const mockAreas = [
        createLifeArea({ name: 'Work' }),
        createLifeArea({ name: 'Personal' }),
      ];
      
      mockApi.lifeArea.getAll.mockResolvedValue(mockAreas);
      
      const store = createLifeAreaStore(mockApi);
      
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
      
      const store = createLifeAreaStore(mockApi);
      await store.actions.fetchAll();
      
      expect(store.state.items).toEqual([]);
      expect(store.state.error).toBe('Failed to fetch life areas');
      expect(store.state.isLoading).toBe(false);
    });
  });

  describe('create', () => {
    it('should create a new life area', async () => {
      const newArea = createLifeArea({ name: 'Health' });
      mockApi.lifeArea.create.mockResolvedValue(newArea);
      
      const store = createLifeAreaStore(mockApi);
      
      const result = await store.actions.create({ name: 'Health' });
      
      expect(mockApi.lifeArea.create).toHaveBeenCalledWith({ name: 'Health' });
      expect(result).toEqual(newArea);
      expect(store.state.items).toContainEqual(newArea);
    });

    it('should handle validation errors', async () => {
      const error = new Error('Name is required');
      mockApi.lifeArea.create.mockRejectedValue(error);
      
      const store = createLifeAreaStore(mockApi);
      
      await expect(store.actions.create({ name: '' })).rejects.toThrow();
      expect(store.state.error).toBe('Failed to create life area');
    });
  });

  describe('Computed Values', () => {
    it('should compute selectedLifeArea correctly', () => {
      const areas = [
        createLifeArea({ id: '1', name: 'Work' }),
        createLifeArea({ id: '2', name: 'Personal' }),
      ];
      
      const store = createLifeAreaStore(mockApi);
      
      // Manually set state for testing
      const setState = (store as any).getSetState();
      setState('items', areas);
      setState('selectedId', '1');
      
      const selectedArea = store.selectedLifeArea()();
      expect(selectedArea).toEqual(areas[0]);
    });

    it('should compute activeLifeAreas correctly', () => {
      const areas = [
        createLifeArea({ name: 'Active 1' }),
        createLifeArea({ name: 'Archived', archived_at: new Date().toISOString() }),
        createLifeArea({ name: 'Active 2' }),
      ];
      
      const store = createLifeAreaStore(mockApi);
      
      // Manually set state for testing
      const setState = (store as any).getSetState();
      setState('items', areas);
      
      const activeAreas = store.activeLifeAreas()();
      expect(activeAreas).toHaveLength(2);
      expect(activeAreas.every(a => !a.archived_at)).toBe(true);
    });
  });
});