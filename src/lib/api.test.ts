import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lifeAreaApi, goalApi, projectApi, taskApi, noteApi } from './api';
import type { CreateLifeAreaRequest, CreateGoalRequest } from '../types/commands';
import type { LifeArea, Goal } from '../types/models';

// Mock the Tauri invoke function
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
const mockInvoke = vi.mocked(invoke);

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('lifeAreaApi', () => {
    it('should create a life area', async () => {
      const mockLifeArea: LifeArea = {
        id: '123',
        name: 'Career',
        description: 'Career development',
        color: '#3B82F6',
        icon: '💼',
        position: 0,
        created_at: '2025-01-31T12:00:00Z',
        updated_at: '2025-01-31T12:00:00Z',
        archived_at: null,
      };

      mockInvoke.mockResolvedValueOnce(mockLifeArea);

      const request: CreateLifeAreaRequest = {
        name: 'Career',
        description: 'Career development',
        color: '#3B82F6',
        icon: '💼',
      };

      const result = await lifeAreaApi.create(request);

      expect(mockInvoke).toHaveBeenCalledWith('create_life_area', { request });
      expect(result).toEqual(mockLifeArea);
    });

    it('should get all life areas', async () => {
      const mockLifeAreas: LifeArea[] = [
        {
          id: '123',
          name: 'Career',
          description: 'Career development',
          color: '#3B82F6',
          icon: '💼',
          position: 0,
          created_at: '2025-01-31T12:00:00Z',
          updated_at: '2025-01-31T12:00:00Z',
          archived_at: null,
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockLifeAreas);

      const result = await lifeAreaApi.getAll();

      expect(mockInvoke).toHaveBeenCalledWith('get_life_areas', undefined);
      expect(result).toEqual(mockLifeAreas);
    });

    it('should handle errors properly', async () => {
      const error = new Error('Command failed');
      mockInvoke.mockRejectedValueOnce(error);

      await expect(lifeAreaApi.getAll()).rejects.toThrow();
    });
  });

  describe('goalApi', () => {
    it('should create a goal', async () => {
      const mockGoal: Goal = {
        id: '456',
        life_area_id: '123',
        title: 'Learn Rust',
        description: 'Master Rust programming',
        target_date: '2025-12-31',
        completed_at: null,
        position: 0,
        created_at: '2025-01-31T12:00:00Z',
        updated_at: '2025-01-31T12:00:00Z',
        archived_at: null,
      };

      mockInvoke.mockResolvedValueOnce(mockGoal);

      const request: CreateGoalRequest = {
        life_area_id: '123',
        title: 'Learn Rust',
        description: 'Master Rust programming',
        target_date: '2025-12-31',
      };

      const result = await goalApi.create(request);

      expect(mockInvoke).toHaveBeenCalledWith('create_goal', { request });
      expect(result).toEqual(mockGoal);
    });

    it('should get goals by life area', async () => {
      const mockGoals: Goal[] = [];
      mockInvoke.mockResolvedValueOnce(mockGoals);

      const result = await goalApi.getByLifeArea('123');

      expect(mockInvoke).toHaveBeenCalledWith('get_goals_by_life_area', { life_area_id: '123' });
      expect(result).toEqual(mockGoals);
    });
  });

  describe('taskApi', () => {
    it('should create a task with subtasks', async () => {
      const mockResponse = {
        parent: {
          id: '789',
          project_id: '456',
          parent_task_id: null,
          title: 'Main Task',
          description: null,
          priority: 'medium' as const,
          due_date: null,
          completed_at: null,
          position: 0,
          created_at: '2025-01-31T12:00:00Z',
          updated_at: '2025-01-31T12:00:00Z',
          archived_at: null,
        },
        subtasks: [],
      };

      mockInvoke.mockResolvedValueOnce(mockResponse);

      const result = await taskApi.createWithSubtasks({
        parent: {
          project_id: '456',
          title: 'Main Task',
          priority: 'medium',
        },
        subtasks: [],
      });

      expect(mockInvoke).toHaveBeenCalledWith('create_task_with_subtasks', {
        request: {
          parent: {
            project_id: '456',
            title: 'Main Task',
            priority: 'medium',
          },
          subtasks: [],
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });
});