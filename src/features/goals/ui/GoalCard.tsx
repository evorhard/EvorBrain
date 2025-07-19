/**
 * Goal Card Component
 * 
 * Displays a single goal with actions
 */

import { useState } from 'react';
import { 
  CalendarIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon,
  PauseIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/Dialog';
import type { Goal } from '@/entities/goal';
import { useLifeAreasStore } from '@/features/life-areas/model/store';

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Goal['status']) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const lifeArea = useLifeAreasStore(state => state.lifeAreas.get(goal.lifeAreaId));
  
  const statusConfig = {
    active: { 
      label: 'Active', 
      color: 'bg-green-100 text-green-800',
      icon: PlayIcon
    },
    completed: { 
      label: 'Completed', 
      color: 'bg-blue-100 text-blue-800',
      icon: CheckCircleIcon
    },
    on_hold: { 
      label: 'On Hold', 
      color: 'bg-yellow-100 text-yellow-800',
      icon: PauseIcon
    },
    cancelled: { 
      label: 'Cancelled', 
      color: 'bg-gray-100 text-gray-800',
      icon: XCircleIcon
    }
  };
  
  const currentStatus = statusConfig[goal.status];
  const StatusIcon = currentStatus.icon;
  
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getDaysRemaining = (targetDate: Date | string | undefined) => {
    if (!targetDate || goal.status !== 'active') return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };
  
  const daysRemaining = getDaysRemaining(goal.targetDate);
  
  return (
    <>
      <div className={cn(
        "p-6 rounded-lg border shadow-sm transition-shadow hover:shadow-md",
        goal.status === 'completed' && "opacity-75"
      )}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
            {lifeArea && (
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: lifeArea.color }}
                />
                <span className="text-sm text-gray-600">{lifeArea.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              currentStatus.color
            )}>
              <StatusIcon className="w-3 h-3" />
              {currentStatus.label}
            </span>
          </div>
        </div>
        
        {goal.description && (
          <p className="text-gray-600 mb-4">{goal.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {goal.targetDate && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(goal.targetDate)}</span>
                {daysRemaining && (
                  <span className={cn(
                    "ml-2 font-medium",
                    daysRemaining === 'Overdue' && "text-red-600",
                    daysRemaining === 'Due today' && "text-orange-600",
                    daysRemaining.includes('day') && "text-blue-600"
                  )}>
                    ({daysRemaining})
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {goal.progress}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-1">
            {goal.status === 'active' && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onStatusChange('on_hold')}
                  title="Put on hold"
                >
                  <PauseIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onStatusChange('completed')}
                  title="Mark as completed"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                </Button>
              </>
            )}
            {goal.status === 'on_hold' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onStatusChange('active')}
                title="Resume goal"
              >
                <PlayIcon className="w-4 h-4" />
              </Button>
            )}
            {goal.status === 'completed' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onStatusChange('active')}
                title="Reopen goal"
              >
                <PlayIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={onEdit}
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Goal</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete "{goal.name}"? This will also delete all associated projects and tasks.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {
              onDelete();
              setShowDeleteConfirm(false);
            }}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};