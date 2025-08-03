import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { createGoalStoreFactory } from './goalStore.factory';
import { TestApiClient } from '../lib/api/test-double';
import { createGoal, createLifeArea } from '../test/utils/data-factories';
import { createStoreWrapper, type Store } from './types';
import type { Goal } from '../types/models';

describe('GoalStore Integration Tests', () => {
  let api: TestApiClient;
  let store: Store<Goal>;
  let dispose: (() => void) | undefined;
  let testLifeAreaId: string;

  beforeEach(() => {
    api = new TestApiClient();
    api.testHelpers.clear();
    dispose = undefined;

    // Create a test life area for goals
    const lifeArea = createLifeArea({ name: 'Test Life Area' });
    api.testHelpers.addLifeArea(lifeArea);
    testLifeAreaId = lifeArea.id;
  });

  afterEach(() => {
    if (dispose) {
      dispose();
    }
  });

  const createStore = () =>
    createRoot((d) => {
      dispose = d;
      const factoryStore = createGoalStoreFactory(api);
      return createStoreWrapper<Goal>(factoryStore);
    });

  describe('Full CRUD Flow', () => {
    it('should handle complete lifecycle of a goal', async () => {
      store = createStore();

      // 1. Create
      const newGoal = await store.actions.create({
        life_area_id: testLifeAreaId,
        title: 'Learn TypeScript',
        description: 'Master TypeScript for better code quality',
        target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      });

      expect(newGoal.title).toBe('Learn TypeScript');
      expect(store.items()).toHaveLength(1);

      // 2. Read
      await store.actions.fetchAll();
      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].title).toBe('Learn TypeScript');

      // 3. Update
      const updated = await store.actions.update(newGoal.id, {
        title: 'Master TypeScript',
        description: 'Become an expert in TypeScript',
      });

      expect(updated.title).toBe('Master TypeScript');
      expect(store.items()[0].title).toBe('Master TypeScript');

      // 4. Complete
      await store.actions.complete(newGoal.id);
      const completed = store.items().find((g) => g.id === newGoal.id);
      expect(completed?.completed_at).toBeTruthy();

      // 5. Uncomplete
      await store.actions.uncomplete(newGoal.id);
      const uncompleted = store.items().find((g) => g.id === newGoal.id);
      expect(uncompleted?.completed_at).toBeNull();

      // 6. Archive
      await store.actions.archive(newGoal.id);
      expect(store.archived()).toHaveLength(1);
      expect(store.active()).toHaveLength(0);

      // 7. Restore
      await store.actions.restore(newGoal.id);
      expect(store.archived()).toHaveLength(0);
      expect(store.active()).toHaveLength(1);

      // 8. Delete (actually archives)
      await store.actions.delete(newGoal.id);
      expect(store.items()).toHaveLength(1);
      expect(store.archived()).toHaveLength(1);
      expect(store.active()).toHaveLength(0);
    });
  });

  describe('Goal Filtering by Life Area', () => {
    it('should correctly filter goals by life area', async () => {
      store = createStore();

      // Create additional life areas
      const workArea = createLifeArea({ name: 'Work' });
      const personalArea = createLifeArea({ name: 'Personal' });
      api.testHelpers.addLifeArea(workArea);
      api.testHelpers.addLifeArea(personalArea);

      // Create goals for different life areas
      const workGoals = [
        await store.actions.create({
          life_area_id: workArea.id,
          title: 'Get Promotion',
          description: 'Advance career',
        }),
        await store.actions.create({
          life_area_id: workArea.id,
          title: 'Complete Project',
          description: 'Finish major project',
        }),
      ];

      const personalGoals = [
        await store.actions.create({
          life_area_id: personalArea.id,
          title: 'Read 12 Books',
          description: 'One book per month',
        }),
        await store.actions.create({
          life_area_id: personalArea.id,
          title: 'Learn Guitar',
          description: 'Master basic chords',
        }),
      ];

      // Fetch all goals
      await store.actions.fetchAll();
      expect(store.items()).toHaveLength(4);

      // Fetch goals for specific life area
      await store.actions.fetchByLifeArea(workArea.id);
      expect(store.items()).toHaveLength(2);
      expect(store.items().every((g) => g.life_area_id === workArea.id)).toBe(true);

      await store.actions.fetchByLifeArea(personalArea.id);
      expect(store.items()).toHaveLength(2);
      expect(store.items().every((g) => g.life_area_id === personalArea.id)).toBe(true);
    });
  });

  describe('Goal Completion States', () => {
    it('should manage completion states correctly', async () => {
      store = createStore();

      // Create multiple goals
      const goals = await Promise.all([
        store.actions.create({
          life_area_id: testLifeAreaId,
          title: 'Goal 1',
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        store.actions.create({
          life_area_id: testLifeAreaId,
          title: 'Goal 2',
          target_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        store.actions.create({
          life_area_id: testLifeAreaId,
          title: 'Goal 3',
          target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      ]);

      // Complete some goals
      await store.actions.complete(goals[0].id);
      await store.actions.complete(goals[2].id);

      // Check completion status
      const items = store.items();
      const completedGoals = items.filter((g) => g.completed_at !== null);
      const incompleteGoals = items.filter((g) => g.completed_at === null);

      expect(completedGoals).toHaveLength(2);
      expect(incompleteGoals).toHaveLength(1);

      // Verify specific goals
      expect(items.find((g) => g.id === goals[0].id)?.completed_at).toBeTruthy();
      expect(items.find((g) => g.id === goals[1].id)?.completed_at).toBeNull();
      expect(items.find((g) => g.id === goals[2].id)?.completed_at).toBeTruthy();

      // Uncomplete a goal
      await store.actions.uncomplete(goals[0].id);
      const updatedItems = store.items();
      expect(updatedItems.find((g) => g.id === goals[0].id)?.completed_at).toBeNull();
    });
  });

  describe('Target Date Management', () => {
    it('should handle goals with various target dates', async () => {
      store = createStore();

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

      // Create goals with different target dates
      const goals = await Promise.all([
        store.actions.create({
          life_area_id: testLifeAreaId,
          title: 'Overdue Goal',
          target_date: yesterday.toISOString(),
        }),
        store.actions.create({
          life_area_id: testLifeAreaId,
          title: 'Due Tomorrow',
          target_date: tomorrow.toISOString(),
        }),
        store.actions.create({
          life_area_id: testLifeAreaId,
          title: 'Due Next Month',
          target_date: nextMonth.toISOString(),
        }),
        store.actions.create({
          life_area_id: testLifeAreaId,
          title: 'Long Term Goal',
          target_date: nextYear.toISOString(),
        }),
        store.actions.create({
          life_area_id: testLifeAreaId,
          title: 'No Target Date',
          // No target_date
        }),
      ]);

      // Verify all goals created
      expect(store.items()).toHaveLength(5);

      // Check overdue goals
      const overdueGoals = store.items().filter((g) => {
        if (!g.target_date) return false;
        return new Date(g.target_date) < now;
      });
      expect(overdueGoals).toHaveLength(1);
      expect(overdueGoals[0].title).toBe('Overdue Goal');

      // Update target date
      await store.actions.update(goals[0].id, {
        target_date: nextMonth.toISOString(),
      });

      const updatedGoal = store.items().find((g) => g.id === goals[0].id);
      expect(new Date(updatedGoal!.target_date!)).toBeInstanceOf(Date);
      expect(new Date(updatedGoal!.target_date!) > now).toBe(true);
    });
  });

  describe('Batch Operations', () => {
    it('should handle batch operations efficiently', async () => {
      store = createStore();

      // Create multiple life areas for testing
      const areas = ['Health', 'Career', 'Education'].map((name) => {
        const area = createLifeArea({ name });
        api.testHelpers.addLifeArea(area);
        return area;
      });

      // Create multiple goals per life area
      const goalPromises = areas.flatMap((area) =>
        ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) =>
          store.actions.create({
            life_area_id: area.id,
            title: `${area.name} Goal ${quarter}`,
            description: `${quarter} goal for ${area.name}`,
          }),
        ),
      );

      const goals = await Promise.all(goalPromises);
      expect(store.items()).toHaveLength(12);

      // Batch complete Q1 goals
      const q1Goals = goals.filter((g) => g.title.includes('Q1'));
      await Promise.all(q1Goals.map((g) => store.actions.complete(g.id)));

      const completedCount = store.items().filter((g) => g.completed_at !== null).length;
      expect(completedCount).toBe(3);

      // Batch archive completed goals
      const completedGoals = store.items().filter((g) => g.completed_at !== null);
      await Promise.all(completedGoals.map((g) => store.actions.archive(g.id)));

      expect(store.archived()).toHaveLength(3);
      expect(store.active()).toHaveLength(9);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle quarterly goal review workflow', async () => {
      store = createStore();

      // Setup: Create goals from previous quarter
      const lastQuarterGoals = [
        {
          title: 'Lose 10 pounds',
          description: 'Health goal',
          completed: true,
        },
        {
          title: 'Save $5000',
          description: 'Financial goal',
          completed: true,
        },
        {
          title: 'Read 10 books',
          description: 'Personal development',
          completed: false, // Partially completed
        },
        {
          title: 'Learn Spanish',
          description: 'Education goal',
          completed: false, // Not started
        },
      ];

      // Create goals
      const goals = await Promise.all(
        lastQuarterGoals.map((g) =>
          store.actions.create({
            life_area_id: testLifeAreaId,
            title: g.title,
            description: g.description,
            target_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Past date
          }),
        ),
      );

      // Mark completed goals
      for (let i = 0; i < goals.length; i++) {
        if (lastQuarterGoals[i].completed) {
          await store.actions.complete(goals[i].id);
        }
      }

      // Archive completed goals
      const completed = store.items().filter((g) => g.completed_at !== null);
      for (const goal of completed) {
        await store.actions.archive(goal.id);
      }

      expect(store.archived()).toHaveLength(2);
      expect(store.active()).toHaveLength(2);

      // Roll over incomplete goals to new quarter
      const activeGoals = store.active();
      const nextQuarterDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

      for (const goal of activeGoals) {
        if (goal.title === 'Read 10 books') {
          // Adjust goal for partial completion
          await store.actions.update(goal.id, {
            title: 'Read 5 more books',
            description: 'Continue reading habit',
            target_date: nextQuarterDate,
          });
        } else {
          // Extend deadline for unstarted goal
          await store.actions.update(goal.id, {
            target_date: nextQuarterDate,
            description: `${goal.description} - Carried over from Q1`,
          });
        }
      }

      // Add new goals for the quarter
      const newQuarterGoals = [
        {
          title: 'Start a side project',
          description: 'Build a SaaS application',
        },
        {
          title: 'Network more',
          description: 'Attend 2 conferences',
        },
      ];

      for (const newGoal of newQuarterGoals) {
        await store.actions.create({
          life_area_id: testLifeAreaId,
          title: newGoal.title,
          description: newGoal.description,
          target_date: nextQuarterDate,
        });
      }

      // Final state check
      expect(store.active()).toHaveLength(4); // 2 rolled over + 2 new
      expect(store.archived()).toHaveLength(2); // Completed from last quarter
      expect(store.items()).toHaveLength(6); // Total goals
    });
  });

  describe('Error Handling', () => {
    it('should recover from errors during operations', async () => {
      store = createStore();

      // Create a valid goal
      const validGoal = await store.actions.create({
        life_area_id: testLifeAreaId,
        title: 'Valid Goal',
      });

      expect(store.items()).toHaveLength(1);

      // Attempt operations on non-existent goal
      const fakeId = 'non-existent-id';

      try {
        await store.actions.complete(fakeId);
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Store should maintain valid state
      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].completed_at).toBeNull();

      // Should be able to continue with valid operations
      await store.actions.complete(validGoal.id);
      expect(store.items()[0].completed_at).toBeTruthy();
    });
  });
});
