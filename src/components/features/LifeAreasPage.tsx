import { createSignal, Show } from 'solid-js';
import { LifeAreaList } from './LifeAreaList';
import { LifeAreaForm } from './LifeAreaForm';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useLifeAreaStore } from '../../stores';
import type { LifeArea } from '../../types/models';

export function LifeAreasPage() {
  const { store: lifeAreaStore } = useLifeAreaStore();
  const [showForm, setShowForm] = createSignal(false);
  const [editingLifeArea, setEditingLifeArea] = createSignal<LifeArea | undefined>(undefined);

  const handleCreateClick = () => {
    setEditingLifeArea(undefined);
    setShowForm(true);
  };

  const handleEditClick = (lifeArea: LifeArea) => {
    setEditingLifeArea(lifeArea);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLifeArea(undefined);
  };

  // Listen for life area selection to enable editing
  const selectedLifeArea = () => {
    if (lifeAreaStore.selectedId) {
      return lifeAreaStore.items.find((area) => area.id === lifeAreaStore.selectedId);
    }
    return undefined;
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Life Areas</h1>
        <div class="flex gap-3">
          <Show when={selectedLifeArea() && !selectedLifeArea()?.archived_at}>
            <Button
              variant="secondary"
              onClick={() => {
                const area = selectedLifeArea();
                if (area) {
                  handleEditClick(area);
                }
              }}
            >
              Edit Selected
            </Button>
          </Show>
          <Button onClick={handleCreateClick}>
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Life Area
          </Button>
        </div>
      </div>

      <LifeAreaList onEdit={handleEditClick} />

      <Modal
        open={showForm()}
        onOpenChange={setShowForm}
        title={editingLifeArea() ? 'Edit Life Area' : 'Create New Life Area'}
      >
        <LifeAreaForm lifeArea={editingLifeArea()} onClose={handleCloseForm} />
      </Modal>
    </div>
  );
}