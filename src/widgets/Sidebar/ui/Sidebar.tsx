/**
 * Sidebar Widget
 * 
 * Main navigation sidebar with Life Areas and collapsible functionality
 */

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/shared/lib';
import { useLifeAreasStore, useLifeAreasList } from '@/features/life-areas';
import type { LifeArea } from '@/entities/life-area';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button, Dialog, DialogHeader, DialogTitle, DialogContent } from '@/shared/ui';
import { LifeAreaForm } from '@/features/life-areas';
import type { CreateLifeAreaDto } from '@/entities/life-area';

interface SortableLifeAreaItemProps {
  lifeArea: LifeArea;
  isSelected: boolean;
  onSelect: () => void;
}

const SortableLifeAreaItem = ({ lifeArea, isSelected, onSelect }: SortableLifeAreaItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lifeArea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative cursor-pointer select-none',
        isDragging && 'opacity-50'
      )}
    >
      <button
        onClick={onSelect}
        className={cn(
          'w-full text-left px-3 py-2 rounded-lg transition-colors',
          'hover:bg-gray-200 dark:hover:bg-gray-700',
          'flex items-center gap-2',
          isSelected && 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
        )}
      >
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: lifeArea.color }}
        />
        <span className="flex-1 truncate">{lifeArea.name}</span>
        <div
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded cursor-move"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 2h10v2H3zm0 5h10v2H3zm0 5h10v2H3z" />
          </svg>
        </div>
      </button>
    </div>
  );
};

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const lifeAreas = useLifeAreasList();
  const selectedLifeAreaId = useLifeAreasStore((state) => state.selectedLifeAreaId);
  const selectLifeArea = useLifeAreasStore((state) => state.selectLifeArea);
  const loadLifeAreas = useLifeAreasStore((state) => state.loadLifeAreas);
  const updateLifeAreaOrder = useLifeAreasStore((state) => state.updateLifeAreaOrder);
  const createLifeArea = useLifeAreasStore((state) => state.createLifeArea);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load life areas on mount
  useEffect(() => {
    void loadLifeAreas();
  }, [loadLifeAreas]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = lifeAreas.findIndex((item) => item.id === active.id);
      const newIndex = lifeAreas.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(lifeAreas, oldIndex, newIndex);

        // Update sort order for all affected items
        const updates = reorderedItems.map((item, index) => ({
          id: item.id,
          orderIndex: index,
        }));

        // Update each life area's sort order
        for (const update of updates) {
          const currentOrderIndex = lifeAreas.find(la => la.id === update.id)?.orderIndex;
          if (currentOrderIndex !== update.orderIndex) {
            await updateLifeAreaOrder(update.id, update.orderIndex);
          }
        }
        
        // Reload to get the updated order from the backend
        await loadLifeAreas();
      }
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', path: 'dashboard' },
    { id: 'tasks', label: 'Tasks', path: 'tasks' },
    { id: 'calendar', label: 'Calendar', path: 'calendar' },
  ];

  const activeLifeArea = lifeAreas.find((la) => la.id === activeId);

  return (
    <aside className={cn(
      'h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
      'flex flex-col transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <h1 className="text-xl font-bold">EvorBrain</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className="w-5 h-5" />
          ) : (
            <ChevronDoubleLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Main Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentPath(item.path)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg transition-colors',
                  'hover:bg-gray-200 dark:hover:bg-gray-700',
                  currentPath === item.path && 'bg-gray-200 dark:bg-gray-700',
                  isCollapsed && 'text-center px-0'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {!isCollapsed && item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Life Areas Section */}
      <div className="flex-1 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            {!isCollapsed && (
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Life Areas
              </h2>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(true)}
              className={cn(
                'p-1',
                isCollapsed && 'mx-auto'
              )}
              title="Add Life Area"
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          </div>
          
          {!isCollapsed && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={lifeAreas.map(la => la.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {lifeAreas.map((lifeArea) => (
                    <SortableLifeAreaItem
                      key={lifeArea.id}
                      lifeArea={lifeArea}
                      isSelected={lifeArea.id === selectedLifeAreaId}
                      onSelect={() => selectLifeArea(lifeArea.id)}
                    />
                  ))}
                </div>
              </SortableContext>
              
              <DragOverlay>
                {activeId && activeLifeArea ? (
                  <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: activeLifeArea.color }}
                      />
                      <span>{activeLifeArea.name}</span>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
          
          {isCollapsed && (
            <div className="space-y-2">
              {lifeAreas.map((lifeArea) => (
                <button
                  key={lifeArea.id}
                  onClick={() => selectLifeArea(lifeArea.id)}
                  className={cn(
                    'w-8 h-8 rounded-full mx-auto block transition-all',
                    'hover:ring-2 hover:ring-offset-2 hover:ring-blue-500',
                    lifeArea.id === selectedLifeAreaId && 'ring-2 ring-offset-2 ring-blue-500'
                  )}
                  style={{ backgroundColor: lifeArea.color }}
                  title={lifeArea.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Create Life Area Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      >
        <DialogHeader>
          <DialogTitle>Create Life Area</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <LifeAreaForm
            onSubmit={async (data: CreateLifeAreaDto) => {
              setIsSubmitting(true);
              const result = await createLifeArea(data);
              setIsSubmitting(false);
              if (result) {
                setIsCreateDialogOpen(false);
              }
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </aside>
  );
};