import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRoot } from 'solid-js';
import { createTaskStoreFactory } from './taskStore.factory';
import { createTask } from '../test/utils';

describe('Task Store Factory', () => {
  let mockApi: any;
  let dispose: (() => void) | undefined;

  beforeEach(() => {
    // Create mock API
    mockApi = {
      task: {
        getAll: vi.fn(),
        getByProject: vi.fn(),
        getTodaysTasks: vi.fn(),
        create: vi.fn(),
        createWithSubtasks: vi.fn(),
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

        const store1 = createTaskStoreFactory(mockApi);
        const store2 = createTaskStoreFactory(mockApi);

        // Stores should be independent
        store1.actions.select('test-id');

        expect(store1.state.selectedId).toBe('test-id');
        expect(store2.state.selectedId).toBeNull();
      });
    });

    it('should not make API calls on creation', () => {
      createRoot((d) => {
        dispose = d;
        createTaskStoreFactory(mockApi);

        // Verify no API calls were made during creation
        expect(mockApi.task.getAll).not.toHaveBeenCalled();
        expect(mockApi.task.getByProject).not.toHaveBeenCalled();
      });
    });

    it('should accept custom initial state', () => {
      const customState = {
        items: [createTask()],
        selectedId: 'test-id',
        isLoading: true,
        error: 'Test error',
      };

      createRoot((d) => {
        dispose = d;
        const store = createTaskStoreFactory(mockApi, { initialState: customState });

        expect(store.state.items).toEqual(customState.items);
        expect(store.state.selectedId).toBe('test-id');
        expect(store.state.isLoading).toBe(true);
        expect(store.state.error).toBe('Test error');
      });
    });
  });

  describe('Actions', () => {
    describe('fetchAll', () => {
      it('should fetch all tasks successfully', async () => {
        await createRoot(async (d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          const tasks = [createTask(), createTask()];
          mockApi.task.getAll.mockResolvedValue(tasks);

          await store.actions.fetchAll();

          expect(mockApi.task.getAll).toHaveBeenCalled();
          expect(store.state.items).toEqual(tasks);
          expect(store.state.isLoading).toBe(false);
          expect(store.state.error).toBeNull();
        });
      });

      it('should handle fetch error', async () => {
        await createRoot(async (d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          mockApi.task.getAll.mockRejectedValue(new Error('Network error'));

          await store.actions.fetchAll();

          expect(store.state.items).toEqual([]);
          expect(store.state.isLoading).toBe(false);
          expect(store.state.error).toBe('Failed to fetch tasks');
        });
      });
    });

    describe('fetchByProject', () => {
      it('should fetch tasks by project successfully', async () => {
        await createRoot(async (d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          const projectId = 'project-1';
          const tasks = [
            createTask({ project_id: projectId }),
            createTask({ project_id: projectId }),
          ];
          mockApi.task.getByProject.mockResolvedValue(tasks);

          await store.actions.fetchByProject(projectId);

          expect(mockApi.task.getByProject).toHaveBeenCalledWith(projectId);
          expect(store.state.items).toEqual(tasks);
          expect(store.state.isLoading).toBe(false);
        });
      });
    });

    describe('fetchTodaysTasks', () => {
      it('should fetch todays tasks successfully', async () => {
        await createRoot(async (d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          const todaysTasks = [
            createTask({ due_date: new Date().toISOString() }),
            createTask({ due_date: new Date().toISOString() }),
          ];
          mockApi.task.getTodaysTasks.mockResolvedValue(todaysTasks);

          await store.actions.fetchTodaysTasks();

          expect(mockApi.task.getTodaysTasks).toHaveBeenCalled();
          expect(store.state.todaysTasks).toEqual(todaysTasks);
          expect(store.state.isLoading).toBe(false);
        });
      });
    });

    describe('create', () => {
      it('should create a task successfully', async () => {
        await createRoot(async (d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          const newTask = createTask();
          mockApi.task.create.mockResolvedValue(newTask);

          const result = await store.actions.create({
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
          });

          expect(mockApi.task.create).toHaveBeenCalledWith({
            title: newTask.title,
            description: newTask.description,
            priority: newTask.priority,
          });
          expect(result).toEqual(newTask);
          expect(store.state.items).toContainEqual(newTask);
        });
      });

      it('should handle create error', async () => {
        await createRoot(async (d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          mockApi.task.create.mockRejectedValue(new Error('Create failed'));

          await expect(
            store.actions.create({
              title: 'Test Task',
            }),
          ).rejects.toThrow('Create failed');

          expect(store.state.error).toBe('Failed to create task');
        });
      });
    });

    describe('createWithSubtasks', () => {
      it('should create task with subtasks successfully', async () => {
        await createRoot(async (d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          const parentTask = createTask();
          const subtask1 = createTask({ parent_task_id: parentTask.id });
          const subtask2 = createTask({ parent_task_id: parentTask.id });

          mockApi.task.createWithSubtasks.mockResolvedValue(parentTask);
          mockApi.task.getAll.mockResolvedValue([parentTask, subtask1, subtask2]);

          const result = await store.actions.createWithSubtasks({
            task: {
              title: parentTask.title,
              description: parentTask.description,
            },
            subtasks: [{ title: 'Subtask 1' }, { title: 'Subtask 2' }],
          });

          expect(result).toEqual(parentTask);
          expect(mockApi.task.getAll).toHaveBeenCalled(); // Should refetch
          expect(store.state.items).toHaveLength(3);
        });
      });
    });

    describe('update', () => {
      it('should update a task successfully', async () => {
        await createRoot(async (d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          const task = createTask();
          store.actions._setState('items', [task]);

          const updatedTask = { ...task, title: 'Updated Task' };
          mockApi.task.update.mockResolvedValue(updatedTask);

          const result = await store.actions.update(task.id, {
            title: 'Updated Task',
            priority: task.priority,
          });

          expect(mockApi.task.update).toHaveBeenCalledWith({
            id: task.id,
            title: 'Updated Task',
            priority: task.priority,
          });
          expect(result).toEqual(updatedTask);
          expect(store.state.items[0].title).toBe('Updated Task');
        });
      });
    });

    describe('complete/uncomplete', () => {
      it('should complete a task', async () => {
        await createRoot(async (d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          const task = createTask({ completed_at: null });
          store.actions._setState('items', [task]);

          const completedTask = { ...task, completed_at: new Date().toISOString() };
          mockApi.task.complete.mockResolvedValue(completedTask);

          await store.actions.complete(task.id);

          expect(mockApi.task.complete).toHaveBeenCalledWith(task.id);
          expect(store.state.items[0].completed_at).toBeTruthy();
        });
      });

      it('should uncomplete a task', async () => {
        await createRoot(async (d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          const task = createTask({ completed_at: new Date().toISOString() });
          store.actions._setState('items', [task]);

          const uncompletedTask = { ...task, completed_at: null };
          mockApi.task.uncomplete.mockResolvedValue(uncompletedTask);

          await store.actions.uncomplete(task.id);

          expect(mockApi.task.uncomplete).toHaveBeenCalledWith(task.id);
          expect(store.state.items[0].completed_at).toBeNull();
        });
      });
    });

    describe('delete and restore', () => {
      it('should delete (archive) a task', async () => {
        await createRoot(async (d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          const task = createTask();
          store.actions._setState('items', [task]);

          mockApi.task.delete.mockResolvedValue(undefined);
          mockApi.task.getAll.mockResolvedValue([]); // Empty list after deletion

          await store.actions.delete(task.id);

          expect(mockApi.task.delete).toHaveBeenCalledWith(task.id);
          expect(mockApi.task.getAll).toHaveBeenCalled(); // Should refetch
          expect(store.state.items).toEqual([]);
        });
      });

      it('should restore an archived task', async () => {
        await createRoot(async (d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          const task = createTask({ archived_at: new Date().toISOString() });
          store.actions._setState('items', [task]);

          const restoredTask = { ...task, archived_at: null };
          mockApi.task.restore.mockResolvedValue(restoredTask);

          await store.actions.restore(task.id);

          expect(mockApi.task.restore).toHaveBeenCalledWith(task.id);
          expect(store.state.items[0].archived_at).toBeNull();
        });
      });
    });

    describe('select', () => {
      it('should select a task', () => {
        createRoot((d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          const task = createTask();
          store.actions._setState('items', [task]);

          store.actions.select(task.id);

          expect(store.state.selectedId).toBe(task.id);
          expect(store.selectedTask()).toEqual(task);
        });
      });

      it('should clear selection', () => {
        createRoot((d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          store.actions._setState('selectedId', 'test-id');

          store.actions.select(null);

          expect(store.state.selectedId).toBeNull();
          expect(store.selectedTask()).toBeUndefined();
        });
      });
    });

    describe('clearError', () => {
      it('should clear error state', () => {
        createRoot((d) => {
          dispose = d;
          const store = createTaskStoreFactory(mockApi);
          store.actions._setState('error', 'Test error');

          store.actions.clearError();

          expect(store.state.error).toBeNull();
        });
      });
    });
  });

  describe('Computed Values', () => {
    it('should compute active tasks', () => {
      createRoot((d) => {
        dispose = d;
        const store = createTaskStoreFactory(mockApi);
        const active1 = createTask({ archived_at: null, completed_at: null });
        const active2 = createTask({ archived_at: null, completed_at: null });
        const completed = createTask({ completed_at: new Date().toISOString() });
        const archived = createTask({ archived_at: new Date().toISOString() });

        store.actions._setState('items', [active1, active2, completed, archived]);

        expect(store.activeTasks()).toEqual([active1, active2]);
      });
    });

    it('should compute completed tasks', () => {
      createRoot((d) => {
        dispose = d;
        const store = createTaskStoreFactory(mockApi);
        const active = createTask({ completed_at: null });
        const completed1 = createTask({ completed_at: new Date().toISOString() });
        const completed2 = createTask({ completed_at: new Date().toISOString() });
        const archivedCompleted = createTask({
          completed_at: new Date().toISOString(),
          archived_at: new Date().toISOString(),
        });

        store.actions._setState('items', [active, completed1, completed2, archivedCompleted]);

        expect(store.completedTasks()).toEqual([completed1, completed2]);
      });
    });

    it('should group tasks by project', () => {
      createRoot((d) => {
        dispose = d;
        const store = createTaskStoreFactory(mockApi);
        const project1Task1 = createTask({ project_id: 'project-1' });
        const project1Task2 = createTask({ project_id: 'project-1' });
        const project2Task = createTask({ project_id: 'project-2' });
        const noProjectTask = createTask({ project_id: undefined });

        store.actions._setState('items', [
          project1Task1,
          project1Task2,
          project2Task,
          noProjectTask,
        ]);

        const grouped = store.tasksByProject();
        expect(grouped.get('project-1')).toEqual([project1Task1, project1Task2]);
        expect(grouped.get('project-2')).toEqual([project2Task]);
        expect(grouped.get(null)).toEqual([noProjectTask]);
      });
    });

    it('should group tasks by priority', () => {
      createRoot((d) => {
        dispose = d;
        const store = createTaskStoreFactory(mockApi);
        const highTask1 = createTask({ priority: 'high' });
        const highTask2 = createTask({ priority: 'high' });
        const mediumTask = createTask({ priority: 'medium' });
        const lowTask = createTask({ priority: 'low' });

        store.actions._setState('items', [highTask1, highTask2, mediumTask, lowTask]);

        const grouped = store.tasksByPriority();
        expect(grouped.get('high')).toEqual([highTask1, highTask2]);
        expect(grouped.get('medium')).toEqual([mediumTask]);
        expect(grouped.get('low')).toEqual([lowTask]);
      });
    });

    it('should compute overdue tasks', () => {
      createRoot((d) => {
        dispose = d;
        const store = createTaskStoreFactory(mockApi);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const overdueTask = createTask({ due_date: yesterday.toISOString() });
        const futureTask = createTask({ due_date: tomorrow.toISOString() });
        const completedOverdue = createTask({
          due_date: yesterday.toISOString(),
          completed_at: new Date().toISOString(),
        });

        store.actions._setState('items', [overdueTask, futureTask, completedOverdue]);

        expect(store.overdueTasks()).toEqual([overdueTask]);
      });
    });

    it('should compute upcoming tasks', () => {
      createRoot((d) => {
        dispose = d;
        const store = createTaskStoreFactory(mockApi);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 8);

        const todayTask = createTask({ due_date: today.toISOString() });
        const tomorrowTask = createTask({ due_date: tomorrow.toISOString() });
        const nextWeekTask = createTask({ due_date: nextWeek.toISOString() });

        store.actions._setState('items', [todayTask, tomorrowTask, nextWeekTask]);

        const upcoming = store.upcomingTasks();
        // Today's task should be included (>= today)
        expect(upcoming).toHaveLength(2);
        expect(upcoming.some((t) => t.id === todayTask.id)).toBe(true);
        expect(upcoming.some((t) => t.id === tomorrowTask.id)).toBe(true);
        expect(upcoming.some((t) => t.id === nextWeekTask.id)).toBe(false);
      });
    });

    it('should get root tasks', () => {
      createRoot((d) => {
        dispose = d;
        const store = createTaskStoreFactory(mockApi);
        const rootTask1 = createTask({ parent_task_id: undefined });
        const rootTask2 = createTask({ parent_task_id: undefined });
        const subtask = createTask({ parent_task_id: 'parent-id' });
        const archivedRoot = createTask({
          parent_task_id: undefined,
          archived_at: new Date().toISOString(),
        });

        store.actions._setState('items', [rootTask1, rootTask2, subtask, archivedRoot]);

        expect(store.rootTasks()).toEqual([rootTask1, rootTask2]);
      });
    });

    it('should get subtasks', () => {
      createRoot((d) => {
        dispose = d;
        const store = createTaskStoreFactory(mockApi);
        const parentId = 'parent-task-id';
        const subtask1 = createTask({ parent_task_id: parentId });
        const subtask2 = createTask({ parent_task_id: parentId });
        const otherTask = createTask({ parent_task_id: 'other-parent' });
        const archivedSubtask = createTask({
          parent_task_id: parentId,
          archived_at: new Date().toISOString(),
        });

        store.actions._setState('items', [subtask1, subtask2, otherTask, archivedSubtask]);

        expect(store.getSubtasks(parentId)).toEqual([subtask1, subtask2]);
      });
    });
  });
});
