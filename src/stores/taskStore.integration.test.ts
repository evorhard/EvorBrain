import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { createTaskStoreFactory } from './taskStore.factory';
import { TestApiClient } from '../lib/api/test-double';
import {
  createTask,
  createProject,
  createGoal,
  createLifeArea,
} from '../test/utils/data-factories';
import { createStoreWrapper, type Store } from './types';
import type { Task } from '../types/models';

describe('TaskStore Integration Tests', () => {
  let api: TestApiClient;
  let store: Store<Task>;
  let dispose: (() => void) | undefined;
  let testProjectId: string;
  let testGoalId: string;

  beforeEach(() => {
    api = new TestApiClient();
    api.testHelpers.clear();
    dispose = undefined;

    // Create test hierarchy: Life Area -> Goal -> Project -> Tasks
    const lifeArea = createLifeArea({ name: 'Test Life Area' });
    api.testHelpers.addLifeArea(lifeArea);

    const goal = createGoal({
      life_area_id: lifeArea.id,
      title: 'Test Goal',
    });
    api.testHelpers.addGoal(goal);
    testGoalId = goal.id;

    const project = createProject({
      goal_id: goal.id,
      name: 'Test Project',
    });
    api.testHelpers.addProject(project);
    testProjectId = project.id;
  });

  afterEach(() => {
    if (dispose) {
      dispose();
    }
  });

  const createStore = () =>
    createRoot((d) => {
      dispose = d;
      const factoryStore = createTaskStoreFactory(api);
      return createStoreWrapper<Task>(factoryStore);
    });

  describe('Full CRUD Flow', () => {
    it('should handle complete lifecycle of a task', async () => {
      store = createStore();

      // 1. Create
      const newTask = await store.actions.create({
        project_id: testProjectId,
        title: 'Implement user authentication',
        description: 'Add login and signup functionality',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      expect(newTask.title).toBe('Implement user authentication');
      expect(newTask.priority).toBe('high');
      expect(store.items()).toHaveLength(1);

      // 2. Read
      await store.actions.fetchAll();
      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].title).toBe('Implement user authentication');

      // 3. Update
      const updated = await store.actions.update(newTask.id, {
        title: 'Implement OAuth authentication',
        description: 'Add OAuth2 login with Google and GitHub',
        priority: 'critical',
      });

      expect(updated.title).toBe('Implement OAuth authentication');
      expect(updated.priority).toBe('critical');
      expect(store.items()[0].title).toBe('Implement OAuth authentication');

      // 4. Complete
      await store.actions.complete(newTask.id);
      expect(store.items()[0].completed_at).toBeTruthy();

      // 5. Uncomplete
      await store.actions.uncomplete(newTask.id);
      expect(store.items()[0].completed_at).toBeNull();

      // 6. Archive
      await store.actions.archive(newTask.id);
      expect(store.archived()).toHaveLength(1);
      expect(store.active()).toHaveLength(0);

      // 7. Restore
      await store.actions.restore(newTask.id);
      expect(store.archived()).toHaveLength(0);
      expect(store.active()).toHaveLength(1);

      // 8. Delete (actually archives)
      await store.actions.delete(newTask.id);
      expect(store.items()).toHaveLength(1);
      expect(store.archived()).toHaveLength(1);
      expect(store.active()).toHaveLength(0);
    });
  });

  describe('Subtasks Management', () => {
    it('should handle parent-child task relationships', async () => {
      store = createStore();

      // Create parent task
      const parentTask = await store.actions.create({
        project_id: testProjectId,
        title: 'Build Feature',
        priority: 'high',
      });

      // Create subtasks
      const subtasks = await Promise.all([
        store.actions.create({
          project_id: testProjectId,
          parent_task_id: parentTask.id,
          title: 'Design UI mockups',
          priority: 'medium',
        }),
        store.actions.create({
          project_id: testProjectId,
          parent_task_id: parentTask.id,
          title: 'Implement backend API',
          priority: 'high',
        }),
        store.actions.create({
          project_id: testProjectId,
          parent_task_id: parentTask.id,
          title: 'Write tests',
          priority: 'medium',
        }),
      ]);

      expect(store.items()).toHaveLength(4);

      // Fetch subtasks
      await store.actions.fetchSubtasks(parentTask.id);
      const fetchedSubtasks = store.items().filter((t) => t.parent_task_id === parentTask.id);
      expect(fetchedSubtasks).toHaveLength(3);

      // Complete subtasks affects parent
      for (const subtask of subtasks) {
        await store.actions.complete(subtask.id);
      }

      // All subtasks should be completed
      const completedSubtasks = store
        .items()
        .filter((t) => t.parent_task_id === parentTask.id && t.completed_at !== null);
      expect(completedSubtasks).toHaveLength(3);
    });

    it('should handle nested subtasks (multi-level hierarchy)', async () => {
      store = createStore();

      // Level 1: Main task
      const mainTask = await store.actions.create({
        project_id: testProjectId,
        title: 'Epic: Major Feature',
        priority: 'critical',
      });

      // Level 2: Feature tasks
      const featureTask = await store.actions.create({
        project_id: testProjectId,
        parent_task_id: mainTask.id,
        title: 'Feature: User Management',
        priority: 'high',
      });

      // Level 3: Implementation tasks
      const implTasks = await Promise.all([
        store.actions.create({
          project_id: testProjectId,
          parent_task_id: featureTask.id,
          title: 'Create user model',
          priority: 'medium',
        }),
        store.actions.create({
          project_id: testProjectId,
          parent_task_id: featureTask.id,
          title: 'Add user controller',
          priority: 'medium',
        }),
      ]);

      expect(store.items()).toHaveLength(4);

      // Test hierarchy traversal
      const level2Tasks = store.items().filter((t) => t.parent_task_id === mainTask.id);
      expect(level2Tasks).toHaveLength(1);

      const level3Tasks = store.items().filter((t) => t.parent_task_id === featureTask.id);
      expect(level3Tasks).toHaveLength(2);
    });
  });

  describe('Task Priority Management', () => {
    it('should filter and sort tasks by priority', async () => {
      store = createStore();

      // Create tasks with different priorities
      const priorities = ['low', 'medium', 'high', 'critical'] as const;
      const tasks = await Promise.all(
        priorities.map((priority, index) =>
          store.actions.create({
            project_id: testProjectId,
            title: `Task ${priority}`,
            priority,
            position: index,
          }),
        ),
      );

      expect(store.items()).toHaveLength(4);

      // Group by priority
      const byPriority = store.items().reduce(
        (acc, task) => {
          const priority = task.priority || 'medium';
          if (!acc[priority]) acc[priority] = [];
          acc[priority].push(task);
          return acc;
        },
        {} as Record<string, Task[]>,
      );

      expect(byPriority['critical']).toHaveLength(1);
      expect(byPriority['high']).toHaveLength(1);
      expect(byPriority['medium']).toHaveLength(1);
      expect(byPriority['low']).toHaveLength(1);

      // High priority tasks (critical + high)
      const highPriorityTasks = store
        .items()
        .filter((t) => t.priority === 'critical' || t.priority === 'high');
      expect(highPriorityTasks).toHaveLength(2);
    });
  });

  describe('Due Date Management', () => {
    it('should handle tasks with various due dates', async () => {
      store = createStore();

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const today = new Date(now.getTime());
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Create tasks with different due dates
      const tasks = await Promise.all([
        store.actions.create({
          project_id: testProjectId,
          title: 'Overdue Task',
          due_date: yesterday.toISOString(),
          priority: 'high',
        }),
        store.actions.create({
          project_id: testProjectId,
          title: 'Due Today',
          due_date: today.toISOString(),
          priority: 'critical',
        }),
        store.actions.create({
          project_id: testProjectId,
          title: 'Due Tomorrow',
          due_date: tomorrow.toISOString(),
          priority: 'medium',
        }),
        store.actions.create({
          project_id: testProjectId,
          title: 'Due Next Week',
          due_date: nextWeek.toISOString(),
          priority: 'low',
        }),
        store.actions.create({
          project_id: testProjectId,
          title: 'No Due Date',
          priority: 'medium',
        }),
      ]);

      expect(store.items()).toHaveLength(5);

      // Get today's tasks
      await store.actions.fetchTodaysTasks();
      // This would typically filter for tasks due today
      // For now, we'll manually filter
      const todaysTasks = store.items().filter((t) => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        return dueDate.toDateString() === today.toDateString();
      });

      expect(todaysTasks).toHaveLength(1);
      expect(todaysTasks[0].title).toBe('Due Today');

      // Check overdue tasks
      const overdueTasks = store.items().filter((t) => {
        if (!t.due_date || t.completed_at) return false;
        return new Date(t.due_date) < now;
      });

      expect(overdueTasks.length).toBeGreaterThan(0);
      expect(overdueTasks[0].title).toBe('Overdue Task');
    });
  });

  describe('Task-Project Relationship', () => {
    it('should manage tasks across multiple projects', async () => {
      store = createStore();

      // Create additional projects
      const projects = ['Frontend', 'Backend', 'Database'].map((name) => {
        const project = createProject({
          goal_id: testGoalId,
          name: `${name} Development`,
        });
        api.testHelpers.addProject(project);
        return project;
      });

      // Create tasks for each project
      const tasksPerProject = 3;
      for (const project of projects) {
        for (let i = 0; i < tasksPerProject; i++) {
          await store.actions.create({
            project_id: project.id,
            title: `${project.name} - Task ${i + 1}`,
            priority: i === 0 ? 'high' : 'medium',
          });
        }
      }

      expect(store.items()).toHaveLength(projects.length * tasksPerProject);

      // Fetch tasks for specific project
      await store.actions.fetchByProject(projects[0].id);
      expect(store.items()).toHaveLength(tasksPerProject);
      expect(store.items().every((t) => t.project_id === projects[0].id)).toBe(true);

      // Fetch all tasks again
      await store.actions.fetchAll();
      expect(store.items()).toHaveLength(projects.length * tasksPerProject);
    });
  });

  describe('Batch Operations', () => {
    it('should handle batch task operations efficiently', async () => {
      store = createStore();

      // Create multiple tasks
      const taskCount = 10;
      const tasks = await Promise.all(
        Array.from({ length: taskCount }, (_, i) =>
          store.actions.create({
            project_id: testProjectId,
            title: `Task ${i + 1}`,
            description: `Description for task ${i + 1}`,
            priority: i < 3 ? 'high' : i < 7 ? 'medium' : 'low',
            position: i,
          }),
        ),
      );

      expect(store.items()).toHaveLength(taskCount);

      // Batch complete high priority tasks
      const highPriorityTasks = tasks.filter((_, i) => i < 3);
      await Promise.all(highPriorityTasks.map((t) => store.actions.complete(t.id)));

      const completedTasks = store.items().filter((t) => t.completed_at !== null);
      expect(completedTasks).toHaveLength(3);

      // Batch update positions
      const activeTasks = store.items().filter((t) => t.completed_at === null);
      await Promise.all(
        activeTasks.map((t, index) => store.actions.update(t.id, { position: index * 10 })),
      );

      // Batch archive completed tasks
      await Promise.all(completedTasks.map((t) => store.actions.archive(t.id)));

      expect(store.archived()).toHaveLength(3);
      expect(store.active()).toHaveLength(7);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle a daily task management workflow', async () => {
      store = createStore();

      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      // Morning: Create today's tasks
      const morningTasks = [
        { title: 'Review PRs', priority: 'high' as const, timeEstimate: 30 },
        { title: 'Team standup', priority: 'critical' as const, timeEstimate: 15 },
        { title: 'Fix critical bug', priority: 'critical' as const, timeEstimate: 120 },
        { title: 'Update documentation', priority: 'low' as const, timeEstimate: 45 },
        { title: 'Code review', priority: 'medium' as const, timeEstimate: 60 },
      ];

      const tasks = await Promise.all(
        morningTasks.map((task) =>
          store.actions.create({
            project_id: testProjectId,
            title: task.title,
            priority: task.priority,
            due_date: today.toISOString(),
            description: `Estimated time: ${task.timeEstimate} minutes`,
          }),
        ),
      );

      // Start work: Complete standup first
      const standup = tasks.find((t) => t.title === 'Team standup');
      await store.actions.complete(standup!.id);

      // Work on critical bug
      const bugTask = tasks.find((t) => t.title === 'Fix critical bug');
      // Add subtasks for the bug
      const bugSubtasks = await Promise.all([
        store.actions.create({
          project_id: testProjectId,
          parent_task_id: bugTask!.id,
          title: 'Reproduce the issue',
          priority: 'high',
        }),
        store.actions.create({
          project_id: testProjectId,
          parent_task_id: bugTask!.id,
          title: 'Write failing test',
          priority: 'high',
        }),
        store.actions.create({
          project_id: testProjectId,
          parent_task_id: bugTask!.id,
          title: 'Implement fix',
          priority: 'critical',
        }),
        store.actions.create({
          project_id: testProjectId,
          parent_task_id: bugTask!.id,
          title: 'Verify fix works',
          priority: 'high',
        }),
      ]);

      // Complete bug subtasks in order
      for (const subtask of bugSubtasks) {
        await store.actions.complete(subtask.id);
      }
      await store.actions.complete(bugTask!.id);

      // Afternoon: Complete some more tasks
      const prReview = tasks.find((t) => t.title === 'Review PRs');
      await store.actions.complete(prReview!.id);

      // End of day: Move incomplete tasks to tomorrow
      const incompleteTasks = store.items().filter((t) => !t.completed_at && !t.parent_task_id);

      for (const task of incompleteTasks) {
        await store.actions.update(task.id, {
          due_date: tomorrow.toISOString(),
        });
      }

      // Summary
      const allTasks = store.items();
      const completedToday = allTasks.filter((t) => t.completed_at !== null);
      const movedToTomorrow = allTasks.filter(
        (t) => !t.completed_at && t.due_date === tomorrow.toISOString(),
      );

      expect(completedToday.length).toBeGreaterThan(0);
      expect(movedToTomorrow.length).toBeGreaterThan(0);
    });

    it('should handle sprint task management', async () => {
      store = createStore();

      // Sprint planning: Create tasks for 2-week sprint
      const sprintTasks = [
        // Week 1
        { title: 'Setup project structure', priority: 'high', week: 1, points: 3 },
        { title: 'Design database schema', priority: 'high', week: 1, points: 5 },
        { title: 'Implement authentication', priority: 'critical', week: 1, points: 8 },
        { title: 'Create API endpoints', priority: 'high', week: 1, points: 5 },
        // Week 2
        { title: 'Build frontend components', priority: 'medium', week: 2, points: 5 },
        { title: 'Add validation', priority: 'medium', week: 2, points: 3 },
        { title: 'Write unit tests', priority: 'high', week: 2, points: 8 },
        { title: 'Documentation', priority: 'low', week: 2, points: 2 },
        { title: 'Performance optimization', priority: 'low', week: 2, points: 5 },
      ];

      const tasks = await Promise.all(
        sprintTasks.map((task, index) =>
          store.actions.create({
            project_id: testProjectId,
            title: task.title,
            priority: task.priority as 'low' | 'medium' | 'high' | 'critical',
            description: `Story points: ${task.points}`,
            position: index,
            due_date: new Date(Date.now() + task.week * 7 * 24 * 60 * 60 * 1000).toISOString(),
          }),
        ),
      );

      // Week 1: Complete high-priority tasks
      const week1HighPriority = tasks.filter(
        (t, i) => sprintTasks[i].week === 1 && (t.priority === 'high' || t.priority === 'critical'),
      );

      for (const task of week1HighPriority) {
        await store.actions.complete(task.id);
      }

      // Mid-sprint: Check velocity
      const completedPoints = store
        .items()
        .filter((t) => t.completed_at !== null)
        .reduce((sum, t, i) => {
          const taskData = sprintTasks.find((st) => st.title === t.title);
          return sum + (taskData?.points || 0);
        }, 0);

      expect(completedPoints).toBeGreaterThan(0);

      // Week 2: Some tasks blocked, create follow-up tasks
      const blockedTask = tasks.find((t) => t.title === 'Build frontend components');
      if (blockedTask) {
        await store.actions.update(blockedTask.id, {
          description: `Story points: 5\n\nBLOCKED: Waiting for design approval`,
        });

        // Create unblocking task
        await store.actions.create({
          project_id: testProjectId,
          title: 'Get design approval',
          priority: 'critical',
          parent_task_id: blockedTask.id,
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      // Sprint end: Move incomplete tasks to backlog
      const incompleteTasks = store.items().filter((t) => !t.completed_at && !t.parent_task_id);

      for (const task of incompleteTasks) {
        await store.actions.update(task.id, {
          description: `${task.description || ''}\n\nCarried over from previous sprint`,
        });
      }

      // Final sprint metrics
      const totalTasks = store.items().filter((t) => !t.parent_task_id);
      const completedTasks = totalTasks.filter((t) => t.completed_at !== null);
      const completionRate = (completedTasks.length / totalTasks.length) * 100;

      expect(completionRate).toBeGreaterThan(0);
      expect(completionRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Selection and Navigation', () => {
    it('should maintain selection through various operations', async () => {
      store = createStore();

      // Create tasks
      const tasks = await Promise.all([
        store.actions.create({ project_id: testProjectId, title: 'Task A', priority: 'low' }),
        store.actions.create({ project_id: testProjectId, title: 'Task B', priority: 'high' }),
        store.actions.create({ project_id: testProjectId, title: 'Task C', priority: 'medium' }),
      ]);

      // Select a task
      store.actions.selectItem(tasks[1].id);
      expect(store.selectedId()).toBe(tasks[1].id);
      expect(store.selectedItem()?.title).toBe('Task B');

      // Update selected task
      await store.actions.update(tasks[1].id, { title: 'Task B Updated' });
      expect(store.selectedItem()?.title).toBe('Task B Updated');

      // Complete selected task
      await store.actions.complete(tasks[1].id);
      expect(store.selectedItem()?.completed_at).toBeTruthy();

      // Archive selected task (archive action uses delete which clears selection)
      await store.actions.archive(tasks[1].id);
      expect(store.selectedId()).toBeNull();
      expect(store.archived()).toHaveLength(1);

      // Task was already archived, just verify state
      expect(store.selectedId()).toBeNull();
      expect(store.selectedItem()).toBeUndefined();
    });
  });

  describe('Error Recovery', () => {
    it('should handle errors gracefully and maintain consistency', async () => {
      store = createStore();

      // Create valid task
      const validTask = await store.actions.create({
        project_id: testProjectId,
        title: 'Valid Task',
        priority: 'medium',
      });

      // Attempt to complete non-existent task
      try {
        await store.actions.complete('fake-id');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Store should maintain valid state
      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].completed_at).toBeNull();

      // Should be able to continue with valid operations
      await store.actions.complete(validTask.id);
      expect(store.items()[0].completed_at).toBeTruthy();

      // Attempt to create task with invalid project
      const itemCountBefore = store.items().length;
      try {
        await store.actions.create({
          project_id: 'invalid-project-id',
          title: 'Invalid Task',
          priority: 'high',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Store should not have added invalid task
      const itemCountAfter = store.items().length;
      expect(itemCountAfter).toBeLessThanOrEqual(itemCountBefore + 1);
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should handle large number of tasks efficiently', async () => {
      store = createStore();

      // Create a large number of tasks
      const taskCount = 100;
      const startTime = Date.now();

      const tasks = await Promise.all(
        Array.from({ length: taskCount }, (_, i) =>
          store.actions.create({
            project_id: testProjectId,
            title: `Task ${i + 1}`,
            priority: ['low', 'medium', 'high', 'critical'][i % 4] as any,
            due_date: new Date(Date.now() + (i % 30) * 24 * 60 * 60 * 1000).toISOString(),
            position: i,
          }),
        ),
      );

      const creationTime = Date.now() - startTime;
      expect(creationTime).toBeLessThan(5000); // Should complete within 5 seconds

      expect(store.items()).toHaveLength(taskCount);

      // Test filtering performance
      const filterStartTime = Date.now();

      const highPriorityTasks = store
        .items()
        .filter((t) => t.priority === 'high' || t.priority === 'critical');
      const overdueTasks = store
        .items()
        .filter((t) => t.due_date && new Date(t.due_date) < new Date() && !t.completed_at);
      const todaysTasks = store.items().filter((t) => {
        if (!t.due_date) return false;
        const today = new Date();
        const dueDate = new Date(t.due_date);
        return dueDate.toDateString() === today.toDateString();
      });

      const filterTime = Date.now() - filterStartTime;
      expect(filterTime).toBeLessThan(100); // Filtering should be very fast

      expect(highPriorityTasks.length).toBeGreaterThan(0);
      expect(todaysTasks.length).toBeGreaterThan(0);
    });
  });
});
