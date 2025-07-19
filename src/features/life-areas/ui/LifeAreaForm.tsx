/**
 * Life Area Form Component
 * 
 * Form for creating and editing life areas
 */

import { useState, useEffect } from 'react';
import { Button, Input, ColorPicker } from '@/shared/ui';
import type { LifeArea, CreateLifeAreaDto } from '@/entities/life-area';

interface LifeAreaFormProps {
  lifeArea?: LifeArea;
  onSubmit: (data: CreateLifeAreaDto) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const LifeAreaForm = ({ 
  lifeArea, 
  onSubmit, 
  onCancel,
  isSubmitting = false
}: LifeAreaFormProps) => {
  const [formData, setFormData] = useState<CreateLifeAreaDto>({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: ''
  });

  useEffect(() => {
    if (lifeArea) {
      setFormData({
        name: lifeArea.name,
        description: lifeArea.description || '',
        color: lifeArea.color,
        icon: lifeArea.icon || ''
      });
    }
  }, [lifeArea]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Health, Career, Family"
          required
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description for this life area"
          className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <ColorPicker
          value={formData.color}
          onChange={(color) => setFormData({ ...formData, color })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !formData.name.trim()}
        >
          {isSubmitting ? 'Saving...' : lifeArea ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};