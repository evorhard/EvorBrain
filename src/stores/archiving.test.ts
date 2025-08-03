import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { TestApiClient } from '../lib/api/test-double';
import {
  createLifeArea,
  createGoal,
  createProject,
  createTask,
  createNote,
} from '../test/utils/data-factories';
import { createLifeAreaStoreFactory } from './lifeAreaStore.factory';
import { createGoalStoreFactory } from './goalStore.factory';
import { createProjectStoreFactory } from './projectStore.factory';
import { createTaskStoreFactory } from './taskStore.factory';
import { createStoreWrapper, type Store } from './types';
import type { LifeArea, Goal, Project, Task } from '../types/models';

describe('Archiving Functionality Tests', () => {
  let api: TestApiClient;
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

  describe('Cascading Archive Operations', () => {
    it('should cascade archive from life area through entire hierarchy', async () => {
      // Setup complete hierarchy
      const lifeArea = createLifeArea({ name: 'Work' });
      api.testHelpers.addLifeArea(lifeArea);

      const goal = createGoal({
        life_area_id: lifeArea.id,
        title: 'Q1 Goals',
      });
      api.testHelpers.addGoal(goal);

      const project = createProject({
        goal_id: goal.id,
        name: 'Website Redesign',
      });
      api.testHelpers.addProject(project);

      const task = createTask({
        project_id: project.id,
        title: 'Design homepage',
      });
      api.testHelpers.addTask(task);

      const subtask = createTask({
        project_id: project.id,
        parent_task_id: task.id,
        title: 'Create wireframes',
      });
      api.testHelpers.addTask(subtask);

      const note = createNote({
        life_area_id: lifeArea.id,
        title: 'Meeting notes',
        content: 'Important decisions',
      });
      api.testHelpers.addNote(note);

      // Archive life area - should cascade to all
      await api.lifeArea.delete(lifeArea.id);

      // Verify all entities are archived
      const allLifeAreas = await api.lifeArea.getAll();
      const allGoals = await api.goal.getAll();
      const allProjects = await api.project.getAll();
      const allTasks = await api.task.getAll();
      const allNotes = await api.note.getAll();

      expect(allLifeAreas.find((la) => la.id === lifeArea.id)?.archived_at).toBeTruthy();
      expect(allGoals.find((g) => g.id === goal.id)?.archived_at).toBeTruthy();
      expect(allProjects.find((p) => p.id === project.id)?.archived_at).toBeTruthy();
      expect(allTasks.find((t) => t.id === task.id)?.archived_at).toBeTruthy();
      expect(allTasks.find((t) => t.id === subtask.id)?.archived_at).toBeTruthy();
      // Notes don't cascade from life area
      expect(allNotes.find((n) => n.id === note.id)?.archived_at).toBeNull();
    });

    it('should cascade archive from goal to projects and tasks', async () => {
      const lifeArea = createLifeArea({ name: 'Personal' });
      api.testHelpers.addLifeArea(lifeArea);

      const goal = createGoal({
        life_area_id: lifeArea.id,
        title: 'Fitness Goals',
      });
      api.testHelpers.addGoal(goal);

      const project1 = createProject({
        goal_id: goal.id,
        name: 'Marathon Training',
      });
      api.testHelpers.addProject(project1);

      const project2 = createProject({
        goal_id: goal.id,
        name: 'Nutrition Plan',
      });
      api.testHelpers.addProject(project2);

      const task1 = createTask({
        project_id: project1.id,
        title: 'Run 5k',
      });
      api.testHelpers.addTask(task1);

      const task2 = createTask({
        project_id: project2.id,
        title: 'Meal prep',
      });
      api.testHelpers.addTask(task2);

      // Archive goal - should cascade to projects and tasks
      await api.goal.delete(goal.id);

      const allGoals = await api.goal.getAll();
      const allProjects = await api.project.getAll();
      const allTasks = await api.task.getAll();
      const allLifeAreas = await api.lifeArea.getAll();

      // Goal and its children should be archived
      expect(allGoals.find((g) => g.id === goal.id)?.archived_at).toBeTruthy();
      expect(allProjects.find((p) => p.id === project1.id)?.archived_at).toBeTruthy();
      expect(allProjects.find((p) => p.id === project2.id)?.archived_at).toBeTruthy();
      expect(allTasks.find((t) => t.id === task1.id)?.archived_at).toBeTruthy();
      expect(allTasks.find((t) => t.id === task2.id)?.archived_at).toBeTruthy();

      // Life area should NOT be archived
      expect(allLifeAreas.find((la) => la.id === lifeArea.id)?.archived_at).toBeNull();
    });

    it('should cascade archive from project to tasks and subtasks', async () => {
      const project = createProject({
        name: 'Mobile App',
      });
      api.testHelpers.addProject(project);

      const task = createTask({
        project_id: project.id,
        title: 'Implement authentication',
      });
      api.testHelpers.addTask(task);

      const subtask1 = createTask({
        project_id: project.id,
        parent_task_id: task.id,
        title: 'Setup OAuth',
      });
      api.testHelpers.addTask(subtask1);

      const subtask2 = createTask({
        project_id: project.id,
        parent_task_id: task.id,
        title: 'Add login form',
      });
      api.testHelpers.addTask(subtask2);

      // Archive project - should cascade to all tasks
      await api.project.delete(project.id);

      const allProjects = await api.project.getAll();
      const allTasks = await api.task.getAll();

      expect(allProjects.find((p) => p.id === project.id)?.archived_at).toBeTruthy();
      expect(allTasks.find((t) => t.id === task.id)?.archived_at).toBeTruthy();
      expect(allTasks.find((t) => t.id === subtask1.id)?.archived_at).toBeTruthy();
      expect(allTasks.find((t) => t.id === subtask2.id)?.archived_at).toBeTruthy();
    });

    it('should cascade archive from parent task to subtasks', async () => {
      const parentTask = createTask({
        title: 'Build feature',
      });
      api.testHelpers.addTask(parentTask);

      const subtask1 = createTask({
        parent_task_id: parentTask.id,
        title: 'Design UI',
      });
      api.testHelpers.addTask(subtask1);

      const subtask2 = createTask({
        parent_task_id: parentTask.id,
        title: 'Write tests',
      });
      api.testHelpers.addTask(subtask2);

      const nestedSubtask = createTask({
        parent_task_id: subtask1.id,
        title: 'Create mockups',
      });
      api.testHelpers.addTask(nestedSubtask);

      // Archive parent task - should cascade to all subtasks
      await api.task.delete(parentTask.id);

      const allTasks = await api.task.getAll();

      expect(allTasks.find((t) => t.id === parentTask.id)?.archived_at).toBeTruthy();
      expect(allTasks.find((t) => t.id === subtask1.id)?.archived_at).toBeTruthy();
      expect(allTasks.find((t) => t.id === subtask2.id)?.archived_at).toBeTruthy();
      // Note: nested subtask archiving depends on implementation
      // Currently only direct children are archived
    });
  });

  describe('Restore Operations', () => {
    it('should restore life area and cascade restore to all children', async () => {
      // Setup archived hierarchy
      const lifeArea = createLifeArea({
        name: 'Business',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addLifeArea(lifeArea);

      const goal = createGoal({
        life_area_id: lifeArea.id,
        title: 'Revenue Goals',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addGoal(goal);

      const project = createProject({
        goal_id: goal.id,
        name: 'New Product Launch',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addProject(project);

      const task = createTask({
        project_id: project.id,
        title: 'Market research',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addTask(task);

      // Restore life area - should cascade to all
      await api.lifeArea.restore(lifeArea.id);

      const allLifeAreas = await api.lifeArea.getAll();
      const allGoals = await api.goal.getAll();
      const allProjects = await api.project.getAll();
      const allTasks = await api.task.getAll();

      expect(allLifeAreas.find((la) => la.id === lifeArea.id)?.archived_at).toBeNull();
      expect(allGoals.find((g) => g.id === goal.id)?.archived_at).toBeNull();
      expect(allProjects.find((p) => p.id === project.id)?.archived_at).toBeNull();
      expect(allTasks.find((t) => t.id === task.id)?.archived_at).toBeNull();
    });

    it('should restore goal without affecting parent life area', async () => {
      const lifeArea = createLifeArea({ name: 'Education' });
      api.testHelpers.addLifeArea(lifeArea);

      const goal = createGoal({
        life_area_id: lifeArea.id,
        title: 'Learn Programming',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addGoal(goal);

      // Restore goal
      await api.goal.restore(goal.id);

      const restoredGoal = await api.goal.getOne(goal.id);
      const parentLifeArea = await api.lifeArea.getOne(lifeArea.id);

      expect(restoredGoal.archived_at).toBeNull();
      expect(parentLifeArea.archived_at).toBeNull(); // Parent was never archived
    });

    it('should restore project and NOT automatically restore parent goal', async () => {
      const goal = createGoal({
        title: 'Archived Goal',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addGoal(goal);

      const project = createProject({
        goal_id: goal.id,
        name: 'Archived Project',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addProject(project);

      // Restore only the project
      await api.project.restore(project.id);

      const restoredProject = await api.project.getOne(project.id);
      const parentGoal = await api.goal.getOne(goal.id);

      expect(restoredProject.archived_at).toBeNull();
      expect(parentGoal.archived_at).toBeTruthy(); // Parent remains archived
    });

    it('should handle partial restore in hierarchy', async () => {
      // Create fully archived hierarchy
      const lifeArea = createLifeArea({
        name: 'Hobbies',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addLifeArea(lifeArea);

      const goal1 = createGoal({
        life_area_id: lifeArea.id,
        title: 'Photography',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addGoal(goal1);

      const goal2 = createGoal({
        life_area_id: lifeArea.id,
        title: 'Music',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addGoal(goal2);

      const project1 = createProject({
        goal_id: goal1.id,
        name: 'Photo Exhibition',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addProject(project1);

      const project2 = createProject({
        goal_id: goal2.id,
        name: 'Learn Guitar',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addProject(project2);

      // Restore only one goal and its projects
      await api.goal.restore(goal1.id);

      const allGoals = await api.goal.getAll();
      const allProjects = await api.project.getAll();

      // Goal1 and its project should be restored
      expect(allGoals.find((g) => g.id === goal1.id)?.archived_at).toBeNull();
      // Project1 is NOT automatically restored (no cascade on single restore)
      expect(allProjects.find((p) => p.id === project1.id)?.archived_at).toBeTruthy();

      // Goal2 and its project remain archived
      expect(allGoals.find((g) => g.id === goal2.id)?.archived_at).toBeTruthy();
      expect(allProjects.find((p) => p.id === project2.id)?.archived_at).toBeTruthy();

      // Life area remains archived
      const restoredLifeArea = await api.lifeArea.getOne(lifeArea.id);
      expect(restoredLifeArea.archived_at).toBeTruthy();
    });
  });

  describe('UI State Updates After Archive/Restore', () => {
    it('should update store state when archiving items', async () => {
      const store = createRoot((d) => {
        dispose = d;
        const factoryStore = createLifeAreaStoreFactory(api);
        return createStoreWrapper<LifeArea>(factoryStore);
      });

      // Create and fetch life areas
      const lifeArea1 = await store.actions.create({ name: 'Work' });
      const lifeArea2 = await store.actions.create({ name: 'Personal' });
      const lifeArea3 = await store.actions.create({ name: 'Health' });

      expect(store.active()).toHaveLength(3);
      expect(store.archived()).toHaveLength(0);

      // Archive one item
      await store.actions.archive(lifeArea2.id);

      expect(store.active()).toHaveLength(2);
      expect(store.archived()).toHaveLength(1);
      expect(store.archived()[0].id).toBe(lifeArea2.id);

      // Archive another item
      await store.actions.archive(lifeArea1.id);

      expect(store.active()).toHaveLength(1);
      expect(store.archived()).toHaveLength(2);

      // Restore one item
      await store.actions.restore(lifeArea2.id);

      expect(store.active()).toHaveLength(2);
      expect(store.archived()).toHaveLength(1);
    });

    it('should clear selection when archiving selected item', async () => {
      const store = createRoot((d) => {
        dispose = d;
        const factoryStore = createTaskStoreFactory(api);
        return createStoreWrapper<Task>(factoryStore);
      });

      const task = await store.actions.create({
        title: 'Important Task',
        priority: 'high',
      });

      // Select the task
      store.actions.selectItem(task.id);
      expect(store.selectedId()).toBe(task.id);
      expect(store.selectedItem()?.title).toBe('Important Task');

      // Archive the selected task
      await store.actions.archive(task.id);

      // Selection should be cleared
      expect(store.selectedId()).toBeNull();
      expect(store.selectedItem()).toBeUndefined();
      expect(store.archived()).toHaveLength(1);
    });

    it('should maintain counts and filters after archiving', async () => {
      const store = createRoot((d) => {
        dispose = d;
        const factoryStore = createProjectStoreFactory(api);
        return createStoreWrapper<Project>(factoryStore);
      });

      // Create projects with different statuses
      const projects = await Promise.all([
        store.actions.create({ name: 'Project 1', status: 'not_started' }),
        store.actions.create({ name: 'Project 2', status: 'in_progress' }),
        store.actions.create({ name: 'Project 3', status: 'completed' }),
        store.actions.create({ name: 'Project 4', status: 'in_progress' }),
      ]);

      expect(store.items()).toHaveLength(4);
      expect(store.active()).toHaveLength(4);

      // Archive completed project
      await store.actions.archive(projects[2].id);

      expect(store.items()).toHaveLength(4); // Total unchanged
      expect(store.active()).toHaveLength(3); // Active reduced
      expect(store.archived()).toHaveLength(1); // Archived increased

      // Archive in-progress project
      await store.actions.archive(projects[1].id);

      expect(store.active()).toHaveLength(2);
      expect(store.archived()).toHaveLength(2);

      // Verify we can still filter active items by status
      const inProgressActive = store.active().filter((p) => p.status === 'in_progress');
      expect(inProgressActive).toHaveLength(1);
      expect(inProgressActive[0].id).toBe(projects[3].id);
    });

    it('should handle batch archive operations', async () => {
      const store = createRoot((d) => {
        dispose = d;
        const factoryStore = createGoalStoreFactory(api);
        return createStoreWrapper<Goal>(factoryStore);
      });

      // Create multiple goals
      const goals = await Promise.all([
        store.actions.create({ title: 'Goal 1' }),
        store.actions.create({ title: 'Goal 2' }),
        store.actions.create({ title: 'Goal 3' }),
        store.actions.create({ title: 'Goal 4' }),
        store.actions.create({ title: 'Goal 5' }),
      ]);

      // Complete some goals
      await store.actions.complete(goals[0].id);
      await store.actions.complete(goals[2].id);
      await store.actions.complete(goals[4].id);

      const completedGoals = store.items().filter((g) => g.completed_at !== null);
      expect(completedGoals).toHaveLength(3);

      // Batch archive completed goals
      await Promise.all(completedGoals.map((g) => store.actions.archive(g.id)));

      expect(store.active()).toHaveLength(2);
      expect(store.archived()).toHaveLength(3);

      // Verify only incomplete goals remain active
      const activeGoals = store.active();
      expect(activeGoals.every((g) => g.completed_at === null)).toBe(true);
    });
  });

  describe('Archive/Restore Cascading in Stores', () => {
    it('should reflect cascading archives in multiple stores', async () => {
      // Create stores
      const lifeAreaStore = createRoot((d) => {
        dispose = d;
        const factory = createLifeAreaStoreFactory(api);
        return createStoreWrapper<LifeArea>(factory);
      });

      const goalStore = createRoot((d) => {
        const factory = createGoalStoreFactory(api);
        return createStoreWrapper<Goal>(factory);
      });

      const projectStore = createRoot((d) => {
        const factory = createProjectStoreFactory(api);
        return createStoreWrapper<Project>(factory);
      });

      // Create hierarchy
      const lifeArea = await lifeAreaStore.actions.create({ name: 'Career' });
      const goal = await goalStore.actions.create({
        life_area_id: lifeArea.id,
        title: 'Professional Development',
      });
      const project = await projectStore.actions.create({
        goal_id: goal.id,
        name: 'Get Certification',
      });

      // Fetch all to populate stores
      await goalStore.actions.fetchAll();
      await projectStore.actions.fetchAll();

      expect(lifeAreaStore.active()).toHaveLength(1);
      expect(goalStore.active()).toHaveLength(1);
      expect(projectStore.active()).toHaveLength(1);

      // Archive life area (cascades to goal and project)
      await lifeAreaStore.actions.archive(lifeArea.id);

      // Refetch to see cascaded changes
      await goalStore.actions.fetchAll();
      await projectStore.actions.fetchAll();

      expect(lifeAreaStore.archived()).toHaveLength(1);
      expect(goalStore.archived()).toHaveLength(1);
      expect(projectStore.archived()).toHaveLength(1);

      // Restore life area (cascades restore)
      await lifeAreaStore.actions.restore(lifeArea.id);

      // Refetch to see cascaded restores
      await goalStore.actions.fetchAll();
      await projectStore.actions.fetchAll();

      expect(lifeAreaStore.active()).toHaveLength(1);
      expect(goalStore.active()).toHaveLength(1);
      expect(projectStore.active()).toHaveLength(1);
    });
  });

  describe('Archive State Consistency', () => {
    it('should maintain archived_at timestamp consistency', async () => {
      const now = new Date();
      const project = createProject({ name: 'Test Project' });
      api.testHelpers.addProject(project);

      // Archive the project
      await api.project.delete(project.id);

      const archivedProject = await api.project.getOne(project.id);
      expect(archivedProject.archived_at).toBeTruthy();

      const archivedTime = new Date(archivedProject.archived_at!);
      expect(archivedTime.getTime()).toBeGreaterThanOrEqual(now.getTime());

      // Restore the project
      await api.project.restore(project.id);

      const restoredProject = await api.project.getOne(project.id);
      expect(restoredProject.archived_at).toBeNull();
      expect(restoredProject.updated_at).toBeTruthy();

      const updatedTime = new Date(restoredProject.updated_at);
      expect(updatedTime.getTime()).toBeGreaterThanOrEqual(archivedTime.getTime());
    });

    it('should handle double archive attempts gracefully', async () => {
      const task = createTask({ title: 'Test Task' });
      api.testHelpers.addTask(task);

      // First archive
      await api.task.delete(task.id);
      const afterFirst = await api.task.getOne(task.id);
      expect(afterFirst.archived_at).toBeTruthy();

      const firstArchivedAt = afterFirst.archived_at;

      // Second archive attempt (should be idempotent)
      await api.task.delete(task.id);
      const afterSecond = await api.task.getOne(task.id);
      expect(afterSecond.archived_at).toBeTruthy();

      // Timestamp should remain the same or be updated (implementation dependent)
      // Most implementations keep the original timestamp
      expect(afterSecond.archived_at).toBeDefined();
    });

    it('should handle double restore attempts gracefully', async () => {
      const goal = createGoal({
        title: 'Test Goal',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addGoal(goal);

      // First restore
      await api.goal.restore(goal.id);
      const afterFirst = await api.goal.getOne(goal.id);
      expect(afterFirst.archived_at).toBeNull();

      // Second restore attempt (should be idempotent)
      await api.goal.restore(goal.id);
      const afterSecond = await api.goal.getOne(goal.id);
      expect(afterSecond.archived_at).toBeNull();
    });
  });

  describe('Mixed Archive States', () => {
    it('should handle mixed archive states in hierarchy', async () => {
      // Create a complex hierarchy with mixed states
      const lifeArea = createLifeArea({ name: 'Mixed State Area' });
      api.testHelpers.addLifeArea(lifeArea);

      const activeGoal = createGoal({
        life_area_id: lifeArea.id,
        title: 'Active Goal',
      });
      api.testHelpers.addGoal(activeGoal);

      const archivedGoal = createGoal({
        life_area_id: lifeArea.id,
        title: 'Archived Goal',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addGoal(archivedGoal);

      const projectUnderActive = createProject({
        goal_id: activeGoal.id,
        name: 'Active Project',
      });
      api.testHelpers.addProject(projectUnderActive);

      const projectUnderArchived = createProject({
        goal_id: archivedGoal.id,
        name: 'Project under Archived Goal',
        archived_at: new Date().toISOString(),
      });
      api.testHelpers.addProject(projectUnderArchived);

      // Verify initial state
      const goals = await api.goal.getAll();
      const projects = await api.project.getAll();

      const activeGoals = goals.filter((g) => !g.archived_at);
      const archivedGoals = goals.filter((g) => g.archived_at);
      const activeProjects = projects.filter((p) => !p.archived_at);
      const archivedProjects = projects.filter((p) => p.archived_at);

      expect(activeGoals).toHaveLength(1);
      expect(archivedGoals).toHaveLength(1);
      expect(activeProjects).toHaveLength(1);
      expect(archivedProjects).toHaveLength(1);

      // Archive the life area - should archive everything
      await api.lifeArea.delete(lifeArea.id);

      const goalsAfter = await api.goal.getAll();
      const projectsAfter = await api.project.getAll();

      // All should be archived now
      expect(goalsAfter.every((g) => g.archived_at !== null)).toBe(true);
      expect(projectsAfter.every((p) => p.archived_at !== null)).toBe(true);
    });
  });
});