import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { createProjectStoreFactory } from './projectStore.factory';
import { TestApiClient } from '../lib/api/test-double';
import { createProject, createGoal, createLifeArea } from '../test/utils/data-factories';
import { createStoreWrapper, type Store } from './types';
import type { Project, ProjectStatus } from '../types/models';

describe('ProjectStore Integration Tests', () => {
  let api: TestApiClient;
  let store: Store<Project>;
  let dispose: (() => void) | undefined;
  let testGoalId: string;

  beforeEach(() => {
    api = new TestApiClient();
    api.testHelpers.clear();
    dispose = undefined;

    // Create test hierarchy: Life Area -> Goal -> Projects
    const lifeArea = createLifeArea({ name: 'Test Life Area' });
    api.testHelpers.addLifeArea(lifeArea);

    const goal = createGoal({
      life_area_id: lifeArea.id,
      title: 'Test Goal',
    });
    api.testHelpers.addGoal(goal);
    testGoalId = goal.id;
  });

  afterEach(() => {
    if (dispose) {
      dispose();
    }
  });

  const createStore = () =>
    createRoot((d) => {
      dispose = d;
      const factoryStore = createProjectStoreFactory(api);
      return createStoreWrapper<Project>(factoryStore);
    });

  describe('Full CRUD Flow', () => {
    it('should handle complete lifecycle of a project', async () => {
      store = createStore();

      // 1. Create
      const newProject = await store.actions.create({
        goal_id: testGoalId,
        name: 'Build Todo App',
        description: 'Create a full-stack todo application',
        status: 'not_started' as ProjectStatus,
      });

      expect(newProject.name).toBe('Build Todo App');
      expect(newProject.status).toBe('not_started');
      expect(store.items()).toHaveLength(1);

      // 2. Read
      await store.actions.fetchAll();
      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].name).toBe('Build Todo App');

      // 3. Update
      const updated = await store.actions.update(newProject.id, {
        name: 'Build Task Manager App',
        description: 'Create a comprehensive task management system',
      });

      expect(updated.name).toBe('Build Task Manager App');
      expect(store.items()[0].name).toBe('Build Task Manager App');

      // 4. Update Status
      await store.actions.updateStatus(newProject.id, 'in_progress');
      expect(store.items()[0].status).toBe('in_progress');

      await store.actions.updateStatus(newProject.id, 'completed');
      expect(store.items()[0].status).toBe('completed');

      // 5. Archive
      await store.actions.archive(newProject.id);
      expect(store.archived()).toHaveLength(1);
      expect(store.active()).toHaveLength(0);

      // 6. Restore
      await store.actions.restore(newProject.id);
      expect(store.archived()).toHaveLength(0);
      expect(store.active()).toHaveLength(1);

      // 7. Delete (actually archives)
      await store.actions.delete(newProject.id);
      expect(store.items()).toHaveLength(1);
      expect(store.archived()).toHaveLength(1);
      expect(store.active()).toHaveLength(0);
    });
  });

  describe('Project Status Management', () => {
    it('should correctly manage project status transitions', async () => {
      store = createStore();

      const project = await store.actions.create({
        goal_id: testGoalId,
        name: 'Test Project',
        status: 'not_started' as ProjectStatus,
      });

      // Valid status transitions
      const statusFlow: ProjectStatus[] = [
        'not_started',
        'planning',
        'in_progress',
        'on_hold',
        'in_progress', // Can go back to in_progress
        'completed',
      ];

      for (const status of statusFlow) {
        await store.actions.updateStatus(project.id, status);
        const updated = store.items().find((p) => p.id === project.id);
        expect(updated?.status).toBe(status);
      }

      // Can also be cancelled from any state
      await store.actions.updateStatus(project.id, 'cancelled');
      expect(store.items()[0].status).toBe('cancelled');
    });

    it('should filter projects by status', async () => {
      store = createStore();

      // Create projects with different statuses
      const statuses: ProjectStatus[] = [
        'not_started',
        'planning',
        'in_progress',
        'in_progress', // Duplicate to test multiple
        'on_hold',
        'completed',
        'cancelled',
      ];

      const projects = await Promise.all(
        statuses.map((status, index) =>
          store.actions.create({
            goal_id: testGoalId,
            name: `Project ${index + 1}`,
            status,
          }),
        ),
      );

      // Group by status
      const byStatus = store.items().reduce(
        (acc, project) => {
          const { status } = project;
          if (!acc[status]) acc[status] = [];
          acc[status].push(project);
          return acc;
        },
        {} as Record<ProjectStatus, Project[]>,
      );

      expect(byStatus['not_started']).toHaveLength(1);
      expect(byStatus['planning']).toHaveLength(1);
      expect(byStatus['in_progress']).toHaveLength(2);
      expect(byStatus['on_hold']).toHaveLength(1);
      expect(byStatus['completed']).toHaveLength(1);
      expect(byStatus['cancelled']).toHaveLength(1);

      // Test active vs inactive projects
      const activeStatuses: ProjectStatus[] = ['not_started', 'planning', 'in_progress', 'on_hold'];
      const activeProjects = store
        .items()
        .filter((p) => activeStatuses.includes(p.status) && !p.archived_at);
      expect(activeProjects).toHaveLength(5); // All except completed and cancelled
    });
  });

  describe('Project-Goal Relationship', () => {
    it('should manage projects across multiple goals', async () => {
      store = createStore();

      // Create additional goals
      const goals = ['Q1 Goals', 'Q2 Goals', 'Q3 Goals'].map((title) => {
        const goal = createGoal({ title });
        api.testHelpers.addGoal(goal);
        return goal;
      });

      // Create projects for each goal
      const projectsPerGoal = 3;
      for (const goal of goals) {
        for (let i = 0; i < projectsPerGoal; i++) {
          await store.actions.create({
            goal_id: goal.id,
            name: `${goal.title} - Project ${i + 1}`,
            status: 'not_started' as ProjectStatus,
          });
        }
      }

      expect(store.items()).toHaveLength(goals.length * projectsPerGoal);

      // Fetch projects for specific goal
      await store.actions.fetchByGoal(goals[0].id);
      expect(store.items()).toHaveLength(projectsPerGoal);
      expect(store.items().every((p) => p.goal_id === goals[0].id)).toBe(true);

      // Fetch all projects again
      await store.actions.fetchAll();
      expect(store.items()).toHaveLength(goals.length * projectsPerGoal);
    });
  });

  describe('Batch Operations', () => {
    it('should handle batch project operations efficiently', async () => {
      store = createStore();

      // Create multiple projects
      const projectCount = 10;
      const projects = await Promise.all(
        Array.from({ length: projectCount }, (_, i) =>
          store.actions.create({
            goal_id: testGoalId,
            name: `Project ${i + 1}`,
            description: `Description for project ${i + 1}`,
            status: 'not_started' as ProjectStatus,
          }),
        ),
      );

      expect(store.items()).toHaveLength(projectCount);

      // Batch update status for first half to in_progress
      const firstHalf = projects.slice(0, 5);
      await Promise.all(firstHalf.map((p) => store.actions.updateStatus(p.id, 'in_progress')));

      const inProgress = store.items().filter((p) => p.status === 'in_progress');
      expect(inProgress).toHaveLength(5);

      // Batch complete some projects
      const toComplete = inProgress.slice(0, 2);
      await Promise.all(toComplete.map((p) => store.actions.updateStatus(p.id, 'completed')));

      const completed = store.items().filter((p) => p.status === 'completed');
      expect(completed).toHaveLength(2);

      // Batch archive completed projects
      await Promise.all(completed.map((p) => store.actions.archive(p.id)));

      expect(store.archived()).toHaveLength(2);
      expect(store.active()).toHaveLength(8);

      // Batch update positions
      const activeProjects = store.active();
      await Promise.all(
        activeProjects.map((p, index) => store.actions.update(p.id, { position: index * 10 })),
      );

      const positions = store.active().map((p) => p.position);
      expect(positions).toEqual([0, 10, 20, 30, 40, 50, 60, 70]);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle a sprint planning workflow', async () => {
      store = createStore();

      // Create backlog of projects
      const backlog = [
        { name: 'User Authentication', priority: 'high', effort: 'large' },
        { name: 'Dashboard UI', priority: 'high', effort: 'medium' },
        { name: 'API Integration', priority: 'medium', effort: 'large' },
        { name: 'Email Notifications', priority: 'medium', effort: 'small' },
        { name: 'Performance Optimization', priority: 'low', effort: 'medium' },
        { name: 'Documentation', priority: 'low', effort: 'small' },
      ];

      // Create all projects in backlog
      const projects = await Promise.all(
        backlog.map((item) =>
          store.actions.create({
            goal_id: testGoalId,
            name: item.name,
            description: `Priority: ${item.priority}, Effort: ${item.effort}`,
            status: 'not_started' as ProjectStatus,
          }),
        ),
      );

      // Sprint planning: Move high priority items to planning
      const highPriority = projects.filter((_, i) => backlog[i].priority === 'high');
      await Promise.all(highPriority.map((p) => store.actions.updateStatus(p.id, 'planning')));

      // Start sprint: Move planned items to in_progress
      const plannedProjects = store.items().filter((p) => p.status === 'planning');
      await Promise.all(
        plannedProjects.map((p) => store.actions.updateStatus(p.id, 'in_progress')),
      );

      // Mid-sprint: Complete small effort items
      const smallEffortInProgress = projects.filter(
        (p, i) =>
          backlog[i].effort === 'small' &&
          store.items().find((item) => item.id === p.id)?.status === 'not_started',
      );

      // Move small items directly to in_progress (fast track)
      for (const project of smallEffortInProgress) {
        await store.actions.updateStatus(project.id, 'in_progress');
      }

      // End of sprint: Complete some projects
      const toComplete = store
        .items()
        .filter((p) => p.status === 'in_progress')
        .slice(0, 2);

      await Promise.all(toComplete.map((p) => store.actions.updateStatus(p.id, 'completed')));

      // Sprint review
      const statusSummary = store.items().reduce(
        (acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      expect(statusSummary['completed']).toBe(2);
      expect(statusSummary['in_progress']).toBeGreaterThan(0);
      expect(statusSummary['not_started']).toBeGreaterThan(0);

      // Archive completed projects
      const completedProjects = store.items().filter((p) => p.status === 'completed');
      await Promise.all(completedProjects.map((p) => store.actions.archive(p.id)));

      expect(store.archived()).toHaveLength(2);
    });

    it('should handle project portfolio management', async () => {
      store = createStore();

      // Create a portfolio of projects across different categories
      const portfolio = [
        { name: 'Website Redesign', category: 'Marketing', budget: 50000 },
        { name: 'Mobile App', category: 'Product', budget: 100000 },
        { name: 'Data Migration', category: 'Infrastructure', budget: 75000 },
        { name: 'Customer Portal', category: 'Product', budget: 80000 },
        { name: 'Analytics Platform', category: 'Infrastructure', budget: 120000 },
      ];

      // Create projects with metadata in description
      const projects = await Promise.all(
        portfolio.map((item) =>
          store.actions.create({
            goal_id: testGoalId,
            name: item.name,
            description: `Category: ${item.category}, Budget: $${item.budget.toLocaleString()}`,
            status: 'planning' as ProjectStatus,
          }),
        ),
      );

      // Simulate project lifecycle over time
      // Month 1: Start high-budget projects
      const highBudgetProjects = projects.filter((_, i) => portfolio[i].budget >= 80000);
      await Promise.all(
        highBudgetProjects.map((p) => store.actions.updateStatus(p.id, 'in_progress')),
      );

      // Month 2: One project goes on hold due to issues
      const projectOnHold = highBudgetProjects[0];
      await store.actions.updateStatus(projectOnHold.id, 'on_hold');

      // Month 3: Complete a project, start new ones
      const activeProjects = store.items().filter((p) => p.status === 'in_progress');
      if (activeProjects.length > 0) {
        await store.actions.updateStatus(activeProjects[0].id, 'completed');
      }

      // Start remaining projects
      const notStarted = store.items().filter((p) => p.status === 'planning');
      await Promise.all(
        notStarted.slice(0, 2).map((p) => store.actions.updateStatus(p.id, 'in_progress')),
      );

      // Final portfolio status
      const finalStatus = store.items().reduce(
        (acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // Verify portfolio has projects in various states
      expect(Object.keys(finalStatus).length).toBeGreaterThan(2);
      expect(store.items()).toHaveLength(portfolio.length);
    });
  });

  describe('Selection and Navigation', () => {
    it('should maintain selection through various operations', async () => {
      store = createStore();

      // Create projects
      const projects = await Promise.all([
        store.actions.create({
          goal_id: testGoalId,
          name: 'Project A',
          status: 'not_started' as ProjectStatus,
        }),
        store.actions.create({
          goal_id: testGoalId,
          name: 'Project B',
          status: 'in_progress' as ProjectStatus,
        }),
        store.actions.create({
          goal_id: testGoalId,
          name: 'Project C',
          status: 'completed' as ProjectStatus,
        }),
      ]);

      // Select a project
      store.actions.selectItem(projects[1].id);
      expect(store.selectedId()).toBe(projects[1].id);
      expect(store.selectedItem()?.name).toBe('Project B');

      // Update selected project
      await store.actions.update(projects[1].id, { name: 'Project B Updated' });
      expect(store.selectedItem()?.name).toBe('Project B Updated');

      // Change status of selected project
      await store.actions.updateStatus(projects[1].id, 'completed');
      expect(store.selectedItem()?.status).toBe('completed');

      // Archive selected project (archive action uses delete which clears selection)
      await store.actions.archive(projects[1].id);
      expect(store.selectedId()).toBeNull();
      expect(store.archived()).toHaveLength(1); // Only this one is archived

      // Since project was already archived, just verify state
      expect(store.selectedId()).toBeNull();
      expect(store.selectedItem()).toBeUndefined();
    });
  });

  describe('Error Recovery', () => {
    it('should handle errors gracefully and maintain consistency', async () => {
      store = createStore();

      // Create valid project
      const validProject = await store.actions.create({
        goal_id: testGoalId,
        name: 'Valid Project',
        status: 'not_started' as ProjectStatus,
      });

      // Attempt to update non-existent project
      try {
        await store.actions.updateStatus('fake-id', 'completed');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Store should maintain valid state
      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].status).toBe('not_started');

      // Should be able to continue with valid operations
      await store.actions.updateStatus(validProject.id, 'in_progress');
      expect(store.items()[0].status).toBe('in_progress');
    });
  });
});
