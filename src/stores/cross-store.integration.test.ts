import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { createLifeAreaStoreFactory } from './lifeAreaStore.factory';
import { createGoalStoreFactory } from './goalStore.factory';
import { createProjectStoreFactory } from './projectStore.factory';
import { createTaskStoreFactory } from './taskStore.factory';
import { TestApiClient } from '../lib/api/test-double';
import { createStoreWrapper, type Store } from './types';
import type { LifeArea, Goal, Project, Task } from '../types/models';

describe('Cross-Store Integration Tests', () => {
  let api: TestApiClient;
  let lifeAreaStore: Store<LifeArea>;
  let goalStore: Store<Goal>;
  let projectStore: Store<Project>;
  let taskStore: Store<Task>;
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

  const createStores = () =>
    createRoot((d) => {
      dispose = d;
      return {
        lifeAreaStore: createStoreWrapper<LifeArea>(createLifeAreaStoreFactory(api)),
        goalStore: createStoreWrapper<Goal>(createGoalStoreFactory(api)),
        projectStore: createStoreWrapper<Project>(createProjectStoreFactory(api)),
        taskStore: createStoreWrapper<Task>(createTaskStoreFactory(api)),
      };
    });

  describe('Cascading Operations', () => {
    it('should handle cascading archives from life area to tasks', async () => {
      const stores = createStores();
      lifeAreaStore = stores.lifeAreaStore;
      goalStore = stores.goalStore;
      projectStore = stores.projectStore;
      taskStore = stores.taskStore;

      // Create hierarchy
      const lifeArea = await lifeAreaStore.actions.create({
        name: 'Work',
        color: '#3B82F6',
        icon: '💼',
      });

      const goal = await goalStore.actions.create({
        life_area_id: lifeArea.id,
        title: 'Q1 Objectives',
        target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });

      const project = await projectStore.actions.create({
        goal_id: goal.id,
        name: 'Product Launch',
        status: 'in_progress',
      });

      const tasks = await Promise.all([
        taskStore.actions.create({
          project_id: project.id,
          title: 'Design landing page',
          priority: 'high',
        }),
        taskStore.actions.create({
          project_id: project.id,
          title: 'Set up analytics',
          priority: 'medium',
        }),
      ]);

      // Archive life area should cascade
      await lifeAreaStore.actions.archive(lifeArea.id);

      // Verify cascading archives
      expect(lifeAreaStore.archived()).toHaveLength(1);

      // Fetch updated data
      await goalStore.actions.fetchAll();
      await projectStore.actions.fetchAll();
      await taskStore.actions.fetchAll();

      const archivedGoals = goalStore.items().filter((g) => g.archived_at !== null);
      const archivedProjects = projectStore.items().filter((p) => p.archived_at !== null);
      const archivedTasks = taskStore.items().filter((t) => t.archived_at !== null);

      expect(archivedGoals).toHaveLength(1);
      expect(archivedProjects).toHaveLength(1);
      expect(archivedTasks).toHaveLength(2);
    });

    it('should handle cascading restores', async () => {
      const stores = createStores();
      lifeAreaStore = stores.lifeAreaStore;
      goalStore = stores.goalStore;
      projectStore = stores.projectStore;
      taskStore = stores.taskStore;

      // Create archived hierarchy
      const lifeArea = await lifeAreaStore.actions.create({
        name: 'Personal',
        color: '#10B981',
        icon: '🏠',
      });

      const goal = await goalStore.actions.create({
        life_area_id: lifeArea.id,
        title: 'Health Goals',
      });

      const project = await projectStore.actions.create({
        goal_id: goal.id,
        name: 'Fitness Plan',
        status: 'planning',
      });

      const task = await taskStore.actions.create({
        project_id: project.id,
        title: 'Join gym',
        priority: 'high',
      });

      // Archive everything
      await lifeAreaStore.actions.archive(lifeArea.id);

      // Refresh all stores
      await goalStore.actions.fetchAll();
      await projectStore.actions.fetchAll();
      await taskStore.actions.fetchAll();

      // Verify all archived
      expect(lifeAreaStore.archived()).toHaveLength(1);
      expect(goalStore.archived()).toHaveLength(1);
      expect(projectStore.archived()).toHaveLength(1);
      expect(taskStore.archived()).toHaveLength(1);

      // Restore life area should cascade
      await lifeAreaStore.actions.restore(lifeArea.id);

      // Refresh all stores
      await goalStore.actions.fetchAll();
      await projectStore.actions.fetchAll();
      await taskStore.actions.fetchAll();

      // Verify all restored
      expect(lifeAreaStore.archived()).toHaveLength(0);
      expect(goalStore.archived()).toHaveLength(0);
      expect(projectStore.archived()).toHaveLength(0);
      expect(taskStore.archived()).toHaveLength(0);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity across stores', async () => {
      const stores = createStores();
      lifeAreaStore = stores.lifeAreaStore;
      goalStore = stores.goalStore;
      projectStore = stores.projectStore;
      taskStore = stores.taskStore;

      // Create multiple life areas
      const lifeAreas = await Promise.all([
        lifeAreaStore.actions.create({ name: 'Work', color: '#FF0000', icon: '💼' }),
        lifeAreaStore.actions.create({ name: 'Personal', color: '#00FF00', icon: '🏠' }),
        lifeAreaStore.actions.create({ name: 'Health', color: '#0000FF', icon: '💪' }),
      ]);

      // Create goals for each life area
      const goals = [];
      for (const area of lifeAreas) {
        const areaGoals = await Promise.all([
          goalStore.actions.create({
            life_area_id: area.id,
            title: `${area.name} Goal 1`,
          }),
          goalStore.actions.create({
            life_area_id: area.id,
            title: `${area.name} Goal 2`,
          }),
        ]);
        goals.push(...areaGoals);
      }

      // Create projects for goals
      const projects = [];
      for (const goal of goals) {
        const project = await projectStore.actions.create({
          goal_id: goal.id,
          name: `Project for ${goal.title}`,
          status: 'not_started',
        });
        projects.push(project);
      }

      // Create tasks for projects
      const tasks = [];
      for (const project of projects) {
        const projectTasks = await Promise.all([
          taskStore.actions.create({
            project_id: project.id,
            title: `Task 1 for ${project.name}`,
            priority: 'high',
          }),
          taskStore.actions.create({
            project_id: project.id,
            title: `Task 2 for ${project.name}`,
            priority: 'medium',
          }),
        ]);
        tasks.push(...projectTasks);
      }

      // Verify counts
      expect(lifeAreaStore.items()).toHaveLength(3);
      expect(goalStore.items()).toHaveLength(6);
      expect(projectStore.items()).toHaveLength(6);
      expect(taskStore.items()).toHaveLength(12);

      // Delete (archive) a life area
      await lifeAreaStore.actions.delete(lifeAreas[0].id);

      // Refresh all stores
      await goalStore.actions.fetchAll();
      await projectStore.actions.fetchAll();
      await taskStore.actions.fetchAll();

      // Verify cascading archives
      const archivedLifeAreas = lifeAreaStore
        .items()
        .filter((la) => la.id === lifeAreas[0].id && la.archived_at !== null);
      expect(archivedLifeAreas).toHaveLength(1);

      // Goals for archived life area should be archived
      const archivedGoals = goalStore
        .items()
        .filter((g) => g.life_area_id === lifeAreas[0].id && g.archived_at !== null);
      const activeGoalsForArchivedArea = goalStore
        .items()
        .filter((g) => g.life_area_id === lifeAreas[0].id && !g.archived_at);
      expect(archivedGoals).toHaveLength(2); // 2 goals per life area
      expect(activeGoalsForArchivedArea).toHaveLength(0);

      // Projects for archived goals should be archived
      const archivedGoalIds = goals
        .filter((g) => g.life_area_id === lifeAreas[0].id)
        .map((g) => g.id);
      const archivedProjects = projectStore
        .items()
        .filter((p) => archivedGoalIds.includes(p.goal_id) && p.archived_at !== null);
      expect(archivedProjects).toHaveLength(2); // 1 project per goal × 2 goals

      // Tasks for archived projects should be archived
      const archivedProjectIds = projects
        .filter((p) => archivedGoalIds.includes(p.goal_id))
        .map((p) => p.id);
      const archivedTasks = taskStore
        .items()
        .filter(
          (t) =>
            t.project_id && archivedProjectIds.includes(t.project_id) && t.archived_at !== null,
        );
      expect(archivedTasks).toHaveLength(4); // 2 tasks per project × 2 projects
    });

    it('should handle concurrent updates across stores', async () => {
      const stores = createStores();
      lifeAreaStore = stores.lifeAreaStore;
      goalStore = stores.goalStore;
      projectStore = stores.projectStore;
      taskStore = stores.taskStore;

      // Create base hierarchy
      const lifeArea = await lifeAreaStore.actions.create({
        name: 'Test Area',
        color: '#FF00FF',
        icon: '🧪',
      });

      const goals = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          goalStore.actions.create({
            life_area_id: lifeArea.id,
            title: `Goal ${i + 1}`,
          }),
        ),
      );

      const projects = await Promise.all(
        goals.map((goal, i) =>
          projectStore.actions.create({
            goal_id: goal.id,
            name: `Project ${i + 1}`,
            status: 'not_started',
          }),
        ),
      );

      // Concurrent operations
      const operations = [
        lifeAreaStore.actions.update(lifeArea.id, { name: 'Updated Area' }),
        goalStore.actions.complete(goals[0].id),
        goalStore.actions.complete(goals[1].id),
        projectStore.actions.updateStatus(projects[0].id, 'in_progress'),
        projectStore.actions.updateStatus(projects[1].id, 'completed'),
        projectStore.actions.archive(projects[2].id),
      ];

      await Promise.all(operations);

      // Verify all updates applied correctly
      expect(lifeAreaStore.items()[0].name).toBe('Updated Area');
      expect(goalStore.items().filter((g) => g.completed_at !== null)).toHaveLength(2);
      expect(projectStore.items().find((p) => p.id === projects[0].id)?.status).toBe('in_progress');
      expect(projectStore.items().find((p) => p.id === projects[1].id)?.status).toBe('completed');
      expect(projectStore.archived()).toHaveLength(1);
    });
  });

  describe('Complex Workflows', () => {
    it('should handle quarterly planning workflow across all stores', async () => {
      const stores = createStores();
      lifeAreaStore = stores.lifeAreaStore;
      goalStore = stores.goalStore;
      projectStore = stores.projectStore;
      taskStore = stores.taskStore;

      // Setup life areas for balanced life
      const lifeAreas = await Promise.all([
        lifeAreaStore.actions.create({ name: 'Career', color: '#3B82F6', icon: '💼' }),
        lifeAreaStore.actions.create({ name: 'Health', color: '#10B981', icon: '💪' }),
        lifeAreaStore.actions.create({ name: 'Relationships', color: '#EC4899', icon: '❤️' }),
        lifeAreaStore.actions.create({ name: 'Personal Growth', color: '#F59E0B', icon: '🌱' }),
      ]);

      // Create quarterly goals for each area
      const quarterEndDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      const goals = [];

      for (const area of lifeAreas) {
        const goal = await goalStore.actions.create({
          life_area_id: area.id,
          title: `Q1 ${area.name} Goal`,
          target_date: quarterEndDate,
          description: `Key objective for ${area.name} this quarter`,
        });
        goals.push(goal);
      }

      // Create projects for each goal
      const projectTemplates = [
        { suffix: 'Initiative', status: 'planning' as const },
        { suffix: 'Quick Win', status: 'in_progress' as const },
      ];

      const projects = [];
      for (const goal of goals) {
        for (const template of projectTemplates) {
          const project = await projectStore.actions.create({
            goal_id: goal.id,
            name: `${goal.title} ${template.suffix}`,
            status: template.status,
          });
          projects.push(project);
        }
      }

      // Create tasks for in-progress projects
      const inProgressProjects = projects.filter((p) => p.status === 'in_progress');
      for (const project of inProgressProjects) {
        await Promise.all([
          taskStore.actions.create({
            project_id: project.id,
            title: 'Research',
            priority: 'medium',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }),
          taskStore.actions.create({
            project_id: project.id,
            title: 'Implementation',
            priority: 'high',
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          }),
          taskStore.actions.create({
            project_id: project.id,
            title: 'Review',
            priority: 'low',
            due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          }),
        ]);
      }

      // Simulate mid-quarter review
      // Complete some tasks
      const allTasks = taskStore.items();
      const tasksToComplete = allTasks.filter((t) => t.title === 'Research');
      await Promise.all(tasksToComplete.map((t) => taskStore.actions.complete(t.id)));

      // Update some project statuses
      const planningProjects = projects.filter((p) => p.status === 'planning');
      await Promise.all(
        planningProjects
          .slice(0, 2)
          .map((p) => projectStore.actions.updateStatus(p.id, 'in_progress')),
      );

      // Complete a goal
      await goalStore.actions.complete(goals[0].id);

      // Archive completed goal's projects
      const completedGoalProjects = projects.filter((p) => p.goal_id === goals[0].id);
      await Promise.all(completedGoalProjects.map((p) => projectStore.actions.archive(p.id)));

      // Verify quarterly status
      const activeGoals = goalStore.items().filter((g) => !g.completed_at && !g.archived_at);
      const completedGoals = goalStore.items().filter((g) => g.completed_at !== null);
      const activeProjects = projectStore.active();
      const completedTasks = taskStore.items().filter((t) => t.completed_at !== null);

      expect(lifeAreaStore.items()).toHaveLength(4);
      expect(completedGoals).toHaveLength(1);
      expect(activeGoals).toHaveLength(3);
      expect(activeProjects.length).toBeGreaterThan(0);
      expect(completedTasks.length).toBeGreaterThan(0);
    });

    it('should handle GTD weekly review across all stores', async () => {
      const stores = createStores();
      lifeAreaStore = stores.lifeAreaStore;
      goalStore = stores.goalStore;
      projectStore = stores.projectStore;
      taskStore = stores.taskStore;

      // Setup GTD contexts as life areas
      const contexts = await Promise.all([
        lifeAreaStore.actions.create({ name: '@Work', color: '#3B82F6', icon: '💼' }),
        lifeAreaStore.actions.create({ name: '@Home', color: '#10B981', icon: '🏠' }),
        lifeAreaStore.actions.create({ name: '@Errands', color: '#F59E0B', icon: '🚗' }),
      ]);

      // Create goals and projects from last week
      const lastWeekGoals = [];
      const lastWeekProjects = [];

      for (const context of contexts) {
        const goal = await goalStore.actions.create({
          life_area_id: context.id,
          title: `${context.name} Weekly Outcomes`,
        });
        lastWeekGoals.push(goal);

        const projects = await Promise.all([
          projectStore.actions.create({
            goal_id: goal.id,
            name: `${context.name} Project 1`,
            status: 'in_progress',
          }),
          projectStore.actions.create({
            goal_id: goal.id,
            name: `${context.name} Project 2`,
            status: 'not_started',
          }),
        ]);
        lastWeekProjects.push(...projects);
      }

      // Create tasks from last week
      const lastWeekTasks = [];
      for (const project of lastWeekProjects) {
        const tasks = await Promise.all([
          taskStore.actions.create({
            project_id: project.id,
            title: `${project.name} - Next Action`,
            priority: 'high',
            due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Overdue
          }),
        ]);
        lastWeekTasks.push(...tasks);
      }

      // Weekly Review Process
      // 1. Complete done tasks
      const completedTasks = lastWeekTasks.slice(0, 3);
      await Promise.all(completedTasks.map((t) => taskStore.actions.complete(t.id)));

      // 2. Review and update projects
      const stuckProjects = lastWeekProjects.filter((p) => p.status === 'not_started');
      await Promise.all(
        stuckProjects.map((p) => projectStore.actions.updateStatus(p.id, 'on_hold')),
      );

      // 3. Archive completed projects
      const projectsToComplete = lastWeekProjects.slice(0, 2);
      await Promise.all(
        projectsToComplete.map((p) => projectStore.actions.updateStatus(p.id, 'completed')),
      );
      await Promise.all(projectsToComplete.map((p) => projectStore.actions.archive(p.id)));

      // 4. Create new projects for next week
      const nextWeekProjects = [];
      for (const goal of lastWeekGoals) {
        const newProject = await projectStore.actions.create({
          goal_id: goal.id,
          name: `Week ${new Date().getWeek()} Priority`,
          status: 'planning',
        });
        nextWeekProjects.push(newProject);
      }

      // 5. Create next actions for new projects
      for (const project of nextWeekProjects) {
        await taskStore.actions.create({
          project_id: project.id,
          title: 'Define success criteria',
          priority: 'high',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      // Verify weekly review results
      const activeTasks = taskStore.items().filter((t) => !t.completed_at && !t.archived_at);
      const onHoldProjects = projectStore.items().filter((p) => p.status === 'on_hold');
      const planningProjects = projectStore.items().filter((p) => p.status === 'planning');

      expect(activeTasks.length).toBeGreaterThan(0);
      expect(onHoldProjects.length).toBeGreaterThan(0);
      expect(planningProjects).toHaveLength(nextWeekProjects.length);
      expect(projectStore.archived()).toHaveLength(2);
    });
  });

  describe('Performance and Optimization', () => {
    it('should efficiently handle bulk operations across stores', async () => {
      const stores = createStores();
      lifeAreaStore = stores.lifeAreaStore;
      goalStore = stores.goalStore;
      projectStore = stores.projectStore;
      taskStore = stores.taskStore;

      const startTime = Date.now();

      // Create bulk data
      const lifeAreaCount = 5;
      const goalsPerArea = 4;
      const projectsPerGoal = 3;
      const tasksPerProject = 5;

      // Batch create life areas
      const lifeAreas = await Promise.all(
        Array.from({ length: lifeAreaCount }, (_, i) =>
          lifeAreaStore.actions.create({
            name: `Area ${i + 1}`,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            icon: '📁',
          }),
        ),
      );

      // Batch create goals
      const goalPromises = [];
      for (const area of lifeAreas) {
        for (let i = 0; i < goalsPerArea; i++) {
          goalPromises.push(
            goalStore.actions.create({
              life_area_id: area.id,
              title: `${area.name} Goal ${i + 1}`,
            }),
          );
        }
      }
      const goals = await Promise.all(goalPromises);

      // Batch create projects
      const projectPromises = [];
      for (const goal of goals) {
        for (let i = 0; i < projectsPerGoal; i++) {
          projectPromises.push(
            projectStore.actions.create({
              goal_id: goal.id,
              name: `Project ${i + 1} for ${goal.title}`,
              status: ['not_started', 'planning', 'in_progress'][i % 3] as any,
            }),
          );
        }
      }
      const projects = await Promise.all(projectPromises);

      // Batch create tasks
      const taskPromises = [];
      for (const project of projects) {
        for (let i = 0; i < tasksPerProject; i++) {
          taskPromises.push(
            taskStore.actions.create({
              project_id: project.id,
              title: `Task ${i + 1}`,
              priority: ['low', 'medium', 'high', 'critical'][i % 4] as any,
            }),
          );
        }
      }
      await Promise.all(taskPromises);

      const totalTime = Date.now() - startTime;

      // Verify counts
      expect(lifeAreaStore.items()).toHaveLength(lifeAreaCount);
      expect(goalStore.items()).toHaveLength(lifeAreaCount * goalsPerArea);
      expect(projectStore.items()).toHaveLength(lifeAreaCount * goalsPerArea * projectsPerGoal);
      expect(taskStore.items()).toHaveLength(
        lifeAreaCount * goalsPerArea * projectsPerGoal * tasksPerProject,
      );

      // Performance assertion - should complete in reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds for all operations

      // Test bulk fetch performance
      const fetchStartTime = Date.now();
      await Promise.all([
        lifeAreaStore.actions.fetchAll(),
        goalStore.actions.fetchAll(),
        projectStore.actions.fetchAll(),
        taskStore.actions.fetchAll(),
      ]);
      const fetchTime = Date.now() - fetchStartTime;

      expect(fetchTime).toBeLessThan(1000); // Fetching should be fast
    });
  });
});

// Helper to get week number
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function () {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};
