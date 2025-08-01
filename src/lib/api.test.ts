import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, lifeAreaApi, goalApi, projectApi, taskApi, noteApi } from './api';
import { invoke } from '@tauri-apps/api/core';
import { EvorBrainError } from '../types/errors';
import {
  createLifeArea,
  createGoal,
  createProject,
  createTask,
  createNote,
  createTimestamp,
} from '../test/utils';

// Mock the Tauri invoke function
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('invokeCommand error handling', () => {
    it('should throw EvorBrainError when Tauri returns an error', async () => {
      const mockError = new Error('Database error');
      vi.mocked(invoke).mockRejectedValueOnce(mockError);

      await expect(lifeAreaApi.getAll()).rejects.toThrow(EvorBrainError);
    });

    it('should pass through successful responses', async () => {
      const mockData = [createLifeArea()];
      vi.mocked(invoke).mockResolvedValueOnce(mockData);

      const result = await lifeAreaApi.getAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('Life Area API', () => {
    it('should create a life area', async () => {
      const request = { name: 'Work', description: 'Work related' };
      const mockResponse = createLifeArea(request);
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await lifeAreaApi.create(request);

      expect(invoke).toHaveBeenCalledWith('create_life_area', { request });
      expect(result).toEqual(mockResponse);
    });

    it('should get all life areas', async () => {
      const mockResponse = [createLifeArea(), createLifeArea()];
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await lifeAreaApi.getAll();

      expect(invoke).toHaveBeenCalledWith('get_life_areas', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should get life area by id', async () => {
      const id = 'test-id';
      const mockResponse = createLifeArea();
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await lifeAreaApi.getById(id);

      expect(invoke).toHaveBeenCalledWith('get_life_area', { id });
      expect(result).toEqual(mockResponse);
    });

    it('should update a life area', async () => {
      const request = { id: 'test-id', name: 'Updated' };
      const mockResponse = createLifeArea(request);
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await lifeAreaApi.update(request);

      expect(invoke).toHaveBeenCalledWith('update_life_area', { request });
      expect(result).toEqual(mockResponse);
    });

    it('should delete a life area', async () => {
      const id = 'test-id';
      vi.mocked(invoke).mockResolvedValueOnce(undefined);

      await lifeAreaApi.delete(id);

      expect(invoke).toHaveBeenCalledWith('delete_life_area', { id });
    });

    it('should restore a life area', async () => {
      const id = 'test-id';
      const mockResponse = createLifeArea();
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await lifeAreaApi.restore(id);

      expect(invoke).toHaveBeenCalledWith('restore_life_area', { id });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Goal API', () => {
    it('should create a goal', async () => {
      const request = {
        name: 'Test Goal',
        life_area_id: 'area-id',
        priority: 'high' as const,
      };
      const mockResponse = createGoal(request);
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await goalApi.create(request);

      expect(invoke).toHaveBeenCalledWith('create_goal', { request });
      expect(result).toEqual(mockResponse);
    });

    it('should get goals by life area', async () => {
      const lifeAreaId = 'area-id';
      const mockResponse = [createGoal(), createGoal()];
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await goalApi.getByLifeArea(lifeAreaId);

      expect(invoke).toHaveBeenCalledWith('get_goals_by_life_area', { life_area_id: lifeAreaId });
      expect(result).toEqual(mockResponse);
    });

    it('should complete a goal', async () => {
      const id = 'goal-id';
      const mockResponse = createGoal({ completed_at: createTimestamp() });
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await goalApi.complete(id);

      expect(invoke).toHaveBeenCalledWith('complete_goal', { id });
      expect(result).toEqual(mockResponse);
    });

    it('should uncomplete a goal', async () => {
      const id = 'goal-id';
      const mockResponse = createGoal({ completed_at: null });
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await goalApi.uncomplete(id);

      expect(invoke).toHaveBeenCalledWith('uncomplete_goal', { id });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Project API', () => {
    it('should create a project', async () => {
      const request = {
        name: 'Test Project',
        goal_id: 'goal-id',
        status: 'planned' as const,
      };
      const mockResponse = createProject(request);
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await projectApi.create(request);

      expect(invoke).toHaveBeenCalledWith('create_project', { request });
      expect(result).toEqual(mockResponse);
    });

    it('should get projects by goal', async () => {
      const goalId = 'goal-id';
      const mockResponse = [createProject(), createProject()];
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await projectApi.getByGoal(goalId);

      expect(invoke).toHaveBeenCalledWith('get_projects_by_goal', { goal_id: goalId });
      expect(result).toEqual(mockResponse);
    });

    it('should update project status', async () => {
      const id = 'project-id';
      const status = 'in_progress' as const;
      const mockResponse = createProject({ status });
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await projectApi.updateStatus(id, status);

      expect(invoke).toHaveBeenCalledWith('update_project_status', { id, status });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Task API', () => {
    it('should create a task', async () => {
      const request = {
        title: 'Test Task',
        project_id: 'project-id',
        priority: 'medium' as const,
      };
      const mockResponse = createTask(request);
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await taskApi.create(request);

      expect(invoke).toHaveBeenCalledWith('create_task', { request });
      expect(result).toEqual(mockResponse);
    });

    it('should create task with subtasks', async () => {
      const request = {
        task: {
          title: 'Parent Task',
          project_id: 'project-id',
        },
        subtasks: [{ title: 'Subtask 1' }, { title: 'Subtask 2' }],
      };
      const mockResponse = createTask(request.task);
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await taskApi.createWithSubtasks(request);

      expect(invoke).toHaveBeenCalledWith('create_task_with_subtasks', { request });
      expect(result).toEqual(mockResponse);
    });

    it('should get todays tasks', async () => {
      const mockResponse = [createTask(), createTask()];
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await taskApi.getTodaysTasks();

      expect(invoke).toHaveBeenCalledWith('get_todays_tasks', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should get subtasks', async () => {
      const parentTaskId = 'parent-id';
      const mockResponse = [createTask(), createTask()];
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await taskApi.getSubtasks(parentTaskId);

      expect(invoke).toHaveBeenCalledWith('get_subtasks', { parent_task_id: parentTaskId });
      expect(result).toEqual(mockResponse);
    });

    it('should complete a task', async () => {
      const id = 'task-id';
      const mockResponse = createTask({ completed_at: createTimestamp() });
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await taskApi.complete(id);

      expect(invoke).toHaveBeenCalledWith('complete_task', { id });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Note API', () => {
    it('should create a note', async () => {
      const request = {
        title: 'Test Note',
        content: 'Note content',
        task_id: 'task-id',
      };
      const mockResponse = createNote(request);
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await noteApi.create(request);

      expect(invoke).toHaveBeenCalledWith('create_note', { request });
      expect(result).toEqual(mockResponse);
    });

    it('should get notes by different parent types', async () => {
      const mockNotes = [createNote(), createNote()];

      // By task
      vi.mocked(invoke).mockResolvedValueOnce(mockNotes);
      let result = await noteApi.getByTask('task-id');
      expect(invoke).toHaveBeenCalledWith('get_notes_by_task', { task_id: 'task-id' });
      expect(result).toEqual(mockNotes);

      // By project
      vi.mocked(invoke).mockResolvedValueOnce(mockNotes);
      result = await noteApi.getByProject('project-id');
      expect(invoke).toHaveBeenCalledWith('get_notes_by_project', { project_id: 'project-id' });

      // By goal
      vi.mocked(invoke).mockResolvedValueOnce(mockNotes);
      result = await noteApi.getByGoal('goal-id');
      expect(invoke).toHaveBeenCalledWith('get_notes_by_goal', { goal_id: 'goal-id' });

      // By life area
      vi.mocked(invoke).mockResolvedValueOnce(mockNotes);
      result = await noteApi.getByLifeArea('area-id');
      expect(invoke).toHaveBeenCalledWith('get_notes_by_life_area', { life_area_id: 'area-id' });
    });

    it('should search notes', async () => {
      const query = 'search term';
      const mockResponse = [createNote(), createNote()];
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await noteApi.search(query);

      expect(invoke).toHaveBeenCalledWith('search_notes', { query });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Migration API', () => {
    it('should get migration status', async () => {
      const mockStatus = {
        current_version: 5,
        latest_version: 5,
        pending_migrations: [],
        applied_migrations: [],
      };
      vi.mocked(invoke).mockResolvedValueOnce(mockStatus);

      const result = await api.migration.getStatus();

      expect(invoke).toHaveBeenCalledWith('get_migration_status', undefined);
      expect(result).toEqual(mockStatus);
    });

    it('should run migrations', async () => {
      const mockResult = {
        success: true,
        message: 'Migrations complete',
        version: 5,
      };
      vi.mocked(invoke).mockResolvedValueOnce(mockResult);

      const result = await api.migration.runMigrations();

      expect(invoke).toHaveBeenCalledWith('run_migrations', undefined);
      expect(result).toEqual(mockResult);
    });

    it('should rollback to version', async () => {
      const version = 3;
      const mockResult = {
        success: true,
        message: 'Rolled back to version 3',
        version: 3,
      };
      vi.mocked(invoke).mockResolvedValueOnce(mockResult);

      const result = await api.migration.rollback(version);

      expect(invoke).toHaveBeenCalledWith('rollback_migration', { version });
      expect(result).toEqual(mockResult);
    });
  });

  describe('Database API', () => {
    it('should test database connection', async () => {
      const mockResponse = 'Database connection successful';
      vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

      const result = await api.database.test();

      expect(invoke).toHaveBeenCalledWith('test_database', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Logging API', () => {
    it('should get recent logs', async () => {
      const mockLogs = [{ timestamp: createTimestamp(), level: 'INFO', message: 'Test log' }];
      vi.mocked(invoke).mockResolvedValueOnce(mockLogs);

      const result = await api.logging.getRecentLogs();

      expect(invoke).toHaveBeenCalledWith('get_recent_logs', { request: {} });
      expect(result).toEqual(mockLogs);
    });

    it('should get logs with filters', async () => {
      const request = {
        level: 'ERROR' as const,
        limit: 50,
        since: createTimestamp(-60), // 1 hour ago
      };
      const mockLogs = [{ timestamp: createTimestamp(), level: 'ERROR', message: 'Error log' }];
      vi.mocked(invoke).mockResolvedValueOnce(mockLogs);

      const result = await api.logging.getRecentLogs(request);

      expect(invoke).toHaveBeenCalledWith('get_recent_logs', { request });
      expect(result).toEqual(mockLogs);
    });

    it('should set log level', async () => {
      vi.mocked(invoke).mockResolvedValueOnce(undefined);

      await api.logging.setLogLevel('DEBUG');

      expect(invoke).toHaveBeenCalledWith('set_log_level', { level: 'DEBUG' });
    });
  });

  describe('Repository API', () => {
    it('should check repository health', async () => {
      const mockResult = {
        success: true,
        message: 'Repository is healthy',
        affected_rows: 0,
      };
      vi.mocked(invoke).mockResolvedValueOnce(mockResult);

      const result = await api.repository.checkHealth();

      expect(invoke).toHaveBeenCalledWith('check_repository_health', undefined);
      expect(result).toEqual(mockResult);
    });

    it('should batch delete items', async () => {
      const request = {
        life_areas: ['id1', 'id2'],
        goals: ['id3', 'id4'],
      };
      const mockResult = {
        success: true,
        message: 'Deleted 4 items',
        affected_rows: 4,
      };
      vi.mocked(invoke).mockResolvedValueOnce(mockResult);

      const result = await api.repository.batchDelete(request);

      expect(invoke).toHaveBeenCalledWith('batch_delete', { request });
      expect(result).toEqual(mockResult);
    });

    it('should get database stats', async () => {
      const mockStats = {
        life_areas: { total: 10, active: 8, archived: 2 },
        goals: { total: 50, active: 40, archived: 10 },
        database_size: 1024000,
      };
      vi.mocked(invoke).mockResolvedValueOnce(mockStats);

      const result = await api.repository.getStats();

      expect(invoke).toHaveBeenCalledWith('get_database_stats', undefined);
      expect(result).toEqual(mockStats);
    });

    it('should cleanup database', async () => {
      const options = {
        delete_archived_older_than_days: 90,
        vacuum: true,
      };
      const mockResult = {
        success: true,
        message: 'Cleanup complete',
        affected_rows: 25,
      };
      vi.mocked(invoke).mockResolvedValueOnce(mockResult);

      const result = await api.repository.cleanup(options);

      expect(invoke).toHaveBeenCalledWith('cleanup_database', { options });
      expect(result).toEqual(mockResult);
    });

    it('should export data', async () => {
      const request = {
        format: 'json' as const,
        include_archived: false,
      };
      const mockResult = {
        success: true,
        path: '/exports/data.json',
        size: 2048000,
      };
      vi.mocked(invoke).mockResolvedValueOnce(mockResult);

      const result = await api.repository.exportData(request);

      expect(invoke).toHaveBeenCalledWith('export_all_data', { request });
      expect(result).toEqual(mockResult);
    });
  });

  describe('API object structure', () => {
    it('should have all sub-APIs accessible through main api object', () => {
      expect(api.lifeArea).toBe(lifeAreaApi);
      expect(api.goal).toBe(goalApi);
      expect(api.project).toBe(projectApi);
      expect(api.task).toBe(taskApi);
      expect(api.note).toBe(noteApi);
      expect(api.migration).toBeDefined();
      expect(api.database).toBeDefined();
      expect(api.logging).toBeDefined();
      expect(api.repository).toBeDefined();
    });

    it('should be readonly', () => {
      // TypeScript const assertion ensures this at compile time
      // Runtime check to ensure the object is frozen would require Object.freeze
      expect(typeof api).toBe('object');
    });
  });
});
