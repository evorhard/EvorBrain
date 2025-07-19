/**
 * Goals Store
 * 
 * State management for goals
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { toast } from '@/shared/ui/toast';
import type { Goal, CreateGoalDto } from '@/entities/goal';
import { goalsApi } from '../api';

interface GoalsState {
  goals: Map<string, Goal>;
  isLoading: boolean;
  error: string | null;
  selectedGoalId: string | null;
  
  // Actions
  loadGoals: () => Promise<void>;
  loadGoalsByLifeArea: (lifeAreaId: string) => Promise<void>;
  createGoal: (goal: CreateGoalDto) => Promise<Goal | null>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
  selectGoal: (id: string | null) => void;
}

export const useGoalsStore = create<GoalsState>()(
  devtools(
    immer((set, get) => ({
      goals: new Map(),
      isLoading: false,
      error: null,
      selectedGoalId: null,
      
      loadGoals: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const goals = await goalsApi.getAll();
          set((state) => {
            state.goals = new Map(goals.map(goal => [goal.id, goal]));
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to load goals';
            state.isLoading = false;
          });
          toast.error('Failed to load goals');
        }
      },
      
      loadGoalsByLifeArea: async (lifeAreaId: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const goals = await goalsApi.getByLifeArea(lifeAreaId);
          set((state) => {
            // Clear existing goals for this life area
            for (const [id, goal] of state.goals.entries()) {
              if (goal.lifeAreaId === lifeAreaId) {
                state.goals.delete(id);
              }
            }
            // Add new goals
            goals.forEach(goal => {
              state.goals.set(goal.id, goal);
            });
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to load goals';
            state.isLoading = false;
          });
          toast.error('Failed to load goals for this life area');
        }
      },
      
      createGoal: async (dto: CreateGoalDto) => {
        try {
          const goal = await goalsApi.create(dto);
          set((state) => {
            state.goals.set(goal.id, goal);
          });
          toast.success('Goal created successfully');
          return goal;
        } catch (error) {
          toast.error('Failed to create goal');
          return null;
        }
      },
      
      updateGoal: async (id: string, updates: Partial<Goal>) => {
        const currentGoal = get().goals.get(id);
        if (!currentGoal) return false;
        
        // Optimistic update
        set((state) => {
          const goal = state.goals.get(id);
          if (goal) {
            state.goals.set(id, { ...goal, ...updates });
          }
        });
        
        try {
          const updatedGoal = await goalsApi.update(id, updates);
          set((state) => {
            state.goals.set(id, updatedGoal);
          });
          toast.success('Goal updated successfully');
          return true;
        } catch (error) {
          // Revert on error
          set((state) => {
            state.goals.set(id, currentGoal);
          });
          toast.error('Failed to update goal');
          return false;
        }
      },
      
      deleteGoal: async (id: string) => {
        const currentGoal = get().goals.get(id);
        if (!currentGoal) return false;
        
        // Optimistic delete
        set((state) => {
          state.goals.delete(id);
          if (state.selectedGoalId === id) {
            state.selectedGoalId = null;
          }
        });
        
        try {
          await goalsApi.delete(id);
          toast.success('Goal deleted successfully');
          return true;
        } catch (error) {
          // Revert on error
          set((state) => {
            state.goals.set(id, currentGoal);
          });
          toast.error('Failed to delete goal');
          return false;
        }
      },
      
      selectGoal: (id: string | null) => {
        set((state) => {
          state.selectedGoalId = id;
        });
      }
    })),
    {
      name: 'goals-store'
    }
  )
);