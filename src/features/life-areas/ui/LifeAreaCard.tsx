/**
 * Life Area Card Component
 * 
 * Card display for a single life area
 */

import { useState } from 'react';
import { Button } from '@/shared/ui';
import type { LifeArea } from '@/entities/life-area';

interface LifeAreaCardProps {
  lifeArea: LifeArea;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const LifeAreaCard = ({
  lifeArea,
  isSelected,
  onSelect,
  onEdit,
  onDelete
}: LifeAreaCardProps) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`
        relative group cursor-pointer rounded-lg p-4 transition-all
        ${isSelected 
          ? 'ring-2 ring-blue-600 ring-offset-2' 
          : 'hover:shadow-md'
        }
      `}
      style={{ backgroundColor: `${lifeArea.color}20` }}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: lifeArea.color }}
          />
          <h3 className="font-medium text-gray-900">{lifeArea.name}</h3>
        </div>
        
        {showActions && (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        )}
      </div>
      
      {lifeArea.description && (
        <p className="mt-2 text-sm text-gray-600">{lifeArea.description}</p>
      )}
    </div>
  );
};