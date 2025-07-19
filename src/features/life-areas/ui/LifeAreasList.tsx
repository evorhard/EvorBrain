/**
 * Life Areas List Component
 * 
 * List view for all life areas with CRUD operations
 */

import { useState, useEffect } from 'react';
import { 
  Button, 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogContent 
} from '@/shared/ui';
import { LifeAreaCard } from './LifeAreaCard';
import { LifeAreaForm } from './LifeAreaForm';
import { useLifeAreasStore, useLifeAreasList } from '../model';
import type { LifeArea, CreateLifeAreaDto } from '@/entities/life-area';

export const LifeAreasList = (): JSX.Element => {
  const lifeAreas = useLifeAreasList();
  const selectedLifeAreaId = useLifeAreasStore((state) => state.selectedLifeAreaId);
  const isLoading = useLifeAreasStore((state) => state.isLoading);
  const loadLifeAreas = useLifeAreasStore((state) => state.loadLifeAreas);
  const createLifeArea = useLifeAreasStore((state) => state.createLifeArea);
  const updateLifeArea = useLifeAreasStore((state) => state.updateLifeArea);
  const deleteLifeArea = useLifeAreasStore((state) => state.deleteLifeArea);
  const selectLifeArea = useLifeAreasStore((state) => state.selectLifeArea);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLifeArea, setEditingLifeArea] = useState<LifeArea | null>(null);
  const [deletingLifeArea, setDeletingLifeArea] = useState<LifeArea | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load life areas on mount
  useEffect(() => {
    void loadLifeAreas();
  }, [loadLifeAreas]);

  const handleCreate = async (data: CreateLifeAreaDto): Promise<void> => {
    setIsSubmitting(true);
    const result = await createLifeArea(data);
    setIsSubmitting(false);
    if (result) {
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdate = async (data: Partial<LifeArea>): Promise<void> => {
    if (!editingLifeArea) return;
    setIsSubmitting(true);
    await updateLifeArea(editingLifeArea.id, data);
    setIsSubmitting(false);
    setEditingLifeArea(null);
  };

  const handleDelete = async (): Promise<void> => {
    if (!deletingLifeArea) return;
    await deleteLifeArea(deletingLifeArea.id);
    setDeletingLifeArea(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading life areas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Life Areas</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Add Life Area
        </Button>
      </div>

      {lifeAreas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No life areas yet.</p>
          <p className="mt-2">Create your first life area to get started!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {lifeAreas.map((lifeArea) => (
            <LifeAreaCard
              key={lifeArea.id}
              lifeArea={lifeArea}
              isSelected={lifeArea.id === selectedLifeAreaId}
              onSelect={() => selectLifeArea(lifeArea.id)}
              onEdit={() => setEditingLifeArea(lifeArea)}
              onDelete={() => setDeletingLifeArea(lifeArea)}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      >
        <DialogHeader>
          <DialogTitle>Create Life Area</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <LifeAreaForm
            onSubmit={(data) => void handleCreate(data)}
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingLifeArea}
        onOpenChange={(open) => !open && setEditingLifeArea(null)}
      >
        <DialogHeader>
          <DialogTitle>Edit Life Area</DialogTitle>
        </DialogHeader>
        <DialogContent>
          {editingLifeArea && (
            <LifeAreaForm
              lifeArea={editingLifeArea}
              onSubmit={(data) => void handleUpdate(data)}
              onCancel={() => setEditingLifeArea(null)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingLifeArea}
        onOpenChange={(open) => !open && setDeletingLifeArea(null)}
      >
        <DialogHeader>
          <DialogTitle>Delete Life Area</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-gray-600">
            Are you sure you want to delete &quot;{deletingLifeArea?.name}&quot;? 
            This will also delete all associated goals, projects, and tasks.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="secondary"
              onClick={() => setDeletingLifeArea(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => void handleDelete()}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};