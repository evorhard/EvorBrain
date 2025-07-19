/**
 * Goals API
 * 
 * Tauri commands for goal management
 */

import { invokeCommand } from '@/shared/api';
import type { Goal, CreateGoalDto } from '@/entities/goal';

export const goalsApi = {
  getAll: () => 
    invokeCommand<Goal[]>('get_goals'),
    
  getById: (id: string) => 
    invokeCommand<Goal>('get_goal', { id }),
    
  getByLifeArea: (lifeAreaId: string) =>
    invokeCommand<Goal[]>('get_goals_by_life_area', { lifeAreaId }),
    
  create: (goal: CreateGoalDto) => 
    invokeCommand<Goal>('create_goal', { dto: goal }),
    
  update: (id: string, updates: Partial<Goal>) => 
    invokeCommand<Goal>('update_goal', { id, dto: updates }),
    
  delete: (id: string) => 
    invokeCommand<void>('delete_goal', { id })
};