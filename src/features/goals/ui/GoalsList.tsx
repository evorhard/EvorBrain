/**
 * Goals List Component
 * 
 * Displays a list of goals with filtering options
 */

import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/shared/ui/Button';
import { GoalCard } from './GoalCard';
import { GoalForm } from './GoalForm';
import { useGoalsStore } from '../model/store';
import { useLifeAreasStore } from '@/features/life-areas/model/store';
import type { Goal } from '@/entities/goal';

interface GoalsListProps {
  lifeAreaId?: string;
}

export const GoalsList: React.FC<GoalsListProps> = ({ lifeAreaId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [statusFilter, setStatusFilter] = useState<Goal['status'] | 'all'>('all');
  
  const { 
    goals, 
    isLoading, 
    loadGoals, 
    loadGoalsByLifeArea,
    createGoal, 
    updateGoal, 
    deleteGoal 
  } = useGoalsStore();
  
  const selectedLifeAreaId = useLifeAreasStore(state => state.selectedLifeAreaId);
  const activeLifeAreaId = lifeAreaId || selectedLifeAreaId;
  
  useEffect(() => {
    if (activeLifeAreaId) {
      loadGoalsByLifeArea(activeLifeAreaId);
    } else {
      loadGoals();
    }
  }, [activeLifeAreaId, loadGoals, loadGoalsByLifeArea]);
  
  const filteredGoals = Array.from(goals.values()).filter(goal => {
    const matchesLifeArea = !activeLifeAreaId || goal.lifeAreaId === activeLifeAreaId;
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    return matchesLifeArea && matchesStatus;
  });
  
  const sortedGoals = filteredGoals.sort((a, b) => {
    // Sort by status first (active > on_hold > completed > cancelled)
    const statusOrder = { active: 0, on_hold: 1, completed: 2, cancelled: 3 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then by target date (earliest first, no date last)
    if (a.targetDate && b.targetDate) {
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    }
    if (a.targetDate) return -1;
    if (b.targetDate) return 1;
    
    // Finally by name
    return a.name.localeCompare(b.name);
  });
  
  const handleCreateGoal = async (data: any) => {
    await createGoal(data);
    setShowForm(false);
  };
  
  const handleUpdateGoal = async (data: any) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data);
      setEditingGoal(null);
    }
  };
  
  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
  };
  
  const handleStatusChange = async (goalId: string, status: Goal['status']) => {
    await updateGoal(goalId, { status });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading goals...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Goals</h2>
          <p className="text-gray-600 mt-1">
            {activeLifeAreaId 
              ? `Goals for this life area`
              : 'All your goals across life areas'
            }
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)}>
          <PlusIcon className="w-5 h-5 mr-2" />
          New Goal
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
        <div className="flex gap-1">
          {(['all', 'active', 'completed', 'on_hold', 'cancelled'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      
      {sortedGoals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            {statusFilter !== 'all' 
              ? `No ${statusFilter.replace('_', ' ')} goals found`
              : 'No goals yet. Create your first goal to get started!'
            }
          </p>
          {statusFilter === 'all' && (
            <Button onClick={() => setShowForm(true)}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Goal
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => setEditingGoal(goal)}
              onDelete={() => handleDeleteGoal(goal.id)}
              onStatusChange={(status) => handleStatusChange(goal.id, status)}
            />
          ))}
        </div>
      )}
      
      <GoalForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateGoal}
        {...(activeLifeAreaId && { lifeAreaId: activeLifeAreaId })}
      />
      
      {editingGoal && (
        <GoalForm
          goal={editingGoal}
          open={!!editingGoal}
          onClose={() => setEditingGoal(null)}
          onSubmit={handleUpdateGoal}
        />
      )}
    </div>
  );
};