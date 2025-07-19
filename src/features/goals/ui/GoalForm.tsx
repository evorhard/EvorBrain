/**
 * Goal Form Component
 * 
 * Form for creating and editing goals
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/Dialog';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { CalendarIcon } from '@heroicons/react/24/outline';
import type { Goal, CreateGoalDto } from '@/entities/goal';
import { useLifeAreasStore } from '@/features/life-areas/model/store';

interface GoalFormProps {
  goal?: Goal;
  lifeAreaId?: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGoalDto | Partial<Goal>) => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  goal,
  lifeAreaId,
  open,
  onClose,
  onSubmit
}) => {
  const lifeAreas = useLifeAreasStore(state => state.lifeAreas);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetDate: '',
    lifeAreaId: '',
    status: 'active' as Goal['status']
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (goal) {
      const targetDateStr = goal.targetDate
        ? new Date(goal.targetDate).toISOString().split('T')[0]
        : '';
      
      setFormData(prev => ({
        ...prev,
        name: goal.name,
        description: goal.description ?? '',
        targetDate: targetDateStr,
        lifeAreaId: goal.lifeAreaId,
        status: goal.status
      }));
    } else {
      setFormData({
        name: '',
        description: '',
        targetDate: '',
        lifeAreaId: lifeAreaId || '',
        status: 'active'
      });
    }
    setErrors({});
  }, [goal, lifeAreaId]);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors['name'] = 'Goal name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors['name'] = 'Goal name must be at least 2 characters';
    }
    
    if (!formData.lifeAreaId) {
      newErrors['lifeAreaId'] = 'Life area is required';
    }
    
    if (formData.targetDate) {
      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (targetDate < today) {
        newErrors['targetDate'] = 'Target date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const baseData = {
      name: formData.name.trim(),
      ...(formData.description.trim() && { description: formData.description.trim() }),
      ...(formData.targetDate && { targetDate: new Date(formData.targetDate) })
    };
    
    const data = goal 
      ? { ...baseData, status: formData.status }
      : { ...baseData, lifeAreaId: formData.lifeAreaId, status: formData.status };
    
    onSubmit(data);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Goal Name *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Lose 20 pounds"
              error={!!errors['name']}
            />
            {errors['name'] && (
              <p className="text-sm text-red-600">{errors['name']}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="lifeAreaId" className="text-sm font-medium">
              Life Area *
            </label>
            <select
              id="lifeAreaId"
              value={formData.lifeAreaId}
              onChange={(e) => setFormData({ ...formData, lifeAreaId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!goal} // Cannot change life area when editing
            >
              <option value="">Select a life area</option>
              {Array.from(lifeAreas.values()).map(area => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            {errors['lifeAreaId'] && (
              <p className="text-sm text-red-600">{errors['lifeAreaId']}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="targetDate" className="text-sm font-medium">
              Target Date
            </label>
            <div className="relative">
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                error={!!errors['targetDate']}
              />
              <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors['targetDate'] && (
              <p className="text-sm text-red-600">{errors['targetDate']}</p>
            )}
          </div>
          
          {goal && (
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Goal['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {goal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};