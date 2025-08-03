import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { createLifeAreaStoreFactory } from './lifeAreaStore.factory';
import { TestApiClient } from '../lib/api/test-double';
import { createLifeArea } from '../test/utils/data-factories';
import { createStoreWrapper, type Store } from './types';
import type { LifeArea } from '../types/models';

describe('LifeAreaStore Integration Tests', () => {
  let api: TestApiClient;
  let store: Store<LifeArea>;
  let dispose: (() => void) | undefined;

  beforeEach(() => {
    api = new TestApiClient();
    api.testHelpers.clear();
    dispose = undefined;
  });

  afterEach(() => {
    if (dispose) {
      dispose();
    }
  });

  const createStore = () => {
    return createRoot((d) => {
      dispose = d;
      const factoryStore = createLifeAreaStoreFactory(api);
      return createStoreWrapper<LifeArea>(factoryStore);
    });
  };

  describe('Full CRUD Flow', () => {
    it('should handle complete lifecycle of a life area', async () => {
      store = createStore();

      // 1. Create
      const newLifeArea = await store.actions.create({
        name: 'Career',
        description: 'Professional development',
        color: '#3B82F6',
        icon: '💼',
      });

      expect(newLifeArea.name).toBe('Career');
      expect(store.items()).toHaveLength(1);

      // 2. Read
      await store.actions.fetchAll();
      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].name).toBe('Career');

      // 3. Update
      const updated = await store.actions.update(newLifeArea.id, {
        name: 'Professional Growth',
        description: 'Career and skill development',
      });

      expect(updated.name).toBe('Professional Growth');
      expect(store.items()[0].name).toBe('Professional Growth');

      // 4. Archive
      await store.actions.archive(newLifeArea.id);
      expect(store.archived()).toHaveLength(1);
      expect(store.active()).toHaveLength(0);

      // 5. Restore
      await store.actions.restore(newLifeArea.id);
      expect(store.archived()).toHaveLength(0);
      expect(store.active()).toHaveLength(1);

      // 6. Delete (actually archives)
      await store.actions.delete(newLifeArea.id);
      expect(store.items()).toHaveLength(1);
      expect(store.archived()).toHaveLength(1);
      expect(store.active()).toHaveLength(0);
    });
  });

  describe('Batch Operations', () => {
    it('should handle multiple life areas efficiently', async () => {
      store = createStore();

      // Create multiple life areas
      const areas = [
        { name: 'Work', description: 'Professional', color: '#FF0000', icon: '💼' },
        { name: 'Health', description: 'Physical wellness', color: '#00FF00', icon: '💪' },
        { name: 'Family', description: 'Relationships', color: '#0000FF', icon: '👨‍👩‍👧‍👦' },
        { name: 'Hobbies', description: 'Personal interests', color: '#FFFF00', icon: '🎨' },
        { name: 'Finance', description: 'Money management', color: '#FF00FF', icon: '💰' },
      ];

      // Create all areas
      for (const area of areas) {
        await store.actions.create(area);
      }

      expect(store.items()).toHaveLength(5);
      expect(store.active()).toHaveLength(5);

      // Archive some areas
      const itemsToArchive = store.items().slice(0, 2);
      for (const item of itemsToArchive) {
        await store.actions.archive(item.id);
      }

      expect(store.active()).toHaveLength(3);
      expect(store.archived()).toHaveLength(2);

      // Update all active areas
      const activeItems = store.active();
      for (const item of activeItems) {
        await store.actions.update(item.id, {
          description: `${item.description} - Updated`,
        });
      }

      const updatedActive = store.active();
      expect(updatedActive.every((item) => item.description?.includes('Updated'))).toBe(true);

      // Restore all archived
      const archivedItems = store.archived();
      for (const item of archivedItems) {
        await store.actions.restore(item.id);
      }

      expect(store.archived()).toHaveLength(0);
      expect(store.active()).toHaveLength(5);
    });
  });

  describe('Selection Management', () => {
    it('should maintain selection state through operations', async () => {
      store = createStore();

      // Create test data
      const area1 = await store.actions.create({ name: 'Area 1', color: '#FF0000', icon: '1️⃣' });
      const area2 = await store.actions.create({ name: 'Area 2', color: '#00FF00', icon: '2️⃣' });
      const area3 = await store.actions.create({ name: 'Area 3', color: '#0000FF', icon: '3️⃣' });

      // Test selection
      store.actions.selectItem(area2.id);
      expect(store.selectedId()).toBe(area2.id);
      expect(store.selectedItem()?.name).toBe('Area 2');

      // Selection should persist through update
      await store.actions.update(area2.id, { name: 'Area 2 Updated' });
      expect(store.selectedId()).toBe(area2.id);
      expect(store.selectedItem()?.name).toBe('Area 2 Updated');

      // Selection should clear on delete
      await store.actions.delete(area2.id);
      expect(store.selectedId()).toBeNull();
      expect(store.selectedItem()).toBeUndefined();

      // Select archived item
      await store.actions.archive(area1.id);
      store.actions.selectItem(area1.id);
      expect(store.selectedItem()?.archived_at).toBeTruthy();

      // Clear selection
      store.actions.clearSelection();
      expect(store.selectedId()).toBeNull();
      expect(store.selectedItem()).toBeUndefined();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      store = createStore();

      // Populate initial data
      const initialAreas = [
        createLifeArea({ name: 'A', position: 0 }),
        createLifeArea({ name: 'B', position: 1 }),
        createLifeArea({ name: 'C', position: 2 }),
      ];

      for (const area of initialAreas) {
        api.testHelpers.addLifeArea(area);
      }

      await store.actions.fetchAll();
      expect(store.items()).toHaveLength(3);

      // Concurrent updates should maintain consistency
      const updatePromises = store.items().map((item, index) =>
        store.actions.update(item.id, { position: index * 10 }),
      );

      await Promise.all(updatePromises);

      const positions = store.items().map((item) => item.position);
      expect(positions).toEqual([0, 10, 20]);

      // Mixed operations
      const mixedOps = [
        store.actions.create({ name: 'D', color: '#000000', icon: '🆕' }),
        store.actions.archive(store.items()[0].id),
        store.actions.update(store.items()[1].id, { name: 'B Updated' }),
      ];

      await Promise.all(mixedOps);

      expect(store.items()).toHaveLength(4); // 3 original + 1 new
      expect(store.active()).toHaveLength(3); // 4 total - 1 archived
      expect(store.archived()).toHaveLength(1);
    });
  });

  describe('Error Recovery', () => {
    it('should handle and recover from errors gracefully', async () => {
      store = createStore();

      // Create valid area
      const validArea = await store.actions.create({
        name: 'Valid Area',
        color: '#FF0000',
        icon: '✅',
      });

      expect(store.items()).toHaveLength(1);

      // Attempt to update non-existent item (should handle gracefully)
      try {
        await store.actions.update('non-existent-id', { name: 'Updated' });
      } catch (error) {
        // Error is expected
        expect(error).toBeDefined();
      }

      // Store should still be in valid state
      expect(store.items()).toHaveLength(1);
      expect(store.error()).toBeDefined();

      // Should be able to continue with valid operations
      const anotherArea = await store.actions.create({
        name: 'Another Area',
        color: '#00FF00',
        icon: '➕',
      });

      expect(store.items()).toHaveLength(2);
      expect(store.error()).toBeNull(); // Error should be cleared
    });
  });

  describe('Loading States', () => {
    it('should properly manage loading states during operations', async () => {
      store = createStore();

      // Check initial state
      expect(store.loading()).toBe(false);

      // Start async operation
      const fetchPromise = store.actions.fetchAll();
      
      // Loading should be true immediately
      expect(store.loading()).toBe(true);

      // Wait for completion
      await fetchPromise;
      
      // Loading should be false after completion
      expect(store.loading()).toBe(false);

      // Multiple operations
      const createPromise = store.actions.create({
        name: 'Test',
        color: '#FF0000',
        icon: '🧪',
      });

      expect(store.loading()).toBe(true);
      await createPromise;
      expect(store.loading()).toBe(false);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle a typical user session workflow', async () => {
      store = createStore();

      // User starts app - fetch existing data
      const existingAreas = [
        createLifeArea({ name: 'Work', archived_at: null }),
        createLifeArea({ name: 'Personal', archived_at: new Date().toISOString() }),
      ];

      for (const area of existingAreas) {
        api.testHelpers.addLifeArea(area);
      }

      await store.actions.fetchAll();

      expect(store.active()).toHaveLength(1);
      expect(store.archived()).toHaveLength(1);

      // User creates new area
      const newArea = await store.actions.create({
        name: 'Fitness',
        description: 'Health and exercise goals',
        color: '#10B981',
        icon: '🏃',
      });

      expect(store.active()).toHaveLength(2);

      // User edits existing area
      const workArea = store.items().find((a) => a.name === 'Work')!;
      await store.actions.update(workArea.id, {
        description: 'Career and professional development',
        color: '#3B82F6',
      });

      // User reviews archived items and restores one
      const archivedArea = store.archived()[0];
      await store.actions.restore(archivedArea.id);

      expect(store.active()).toHaveLength(3);
      expect(store.archived()).toHaveLength(0);

      // User reorganizes by archiving less important area
      await store.actions.archive(newArea.id);

      // Final state check
      expect(store.active()).toHaveLength(2);
      expect(store.archived()).toHaveLength(1);
      expect(store.items()).toHaveLength(3);
    });
  });
});