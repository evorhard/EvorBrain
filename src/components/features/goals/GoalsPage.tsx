import { createSignal, Show } from 'solid-js';
import { GoalList } from './GoalList';
import { GoalForm } from './GoalForm';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { useGoalStore } from '../../../stores';
import type { Goal } from '../../../types/models';

export function GoalsPage() {
  const { store: goalStore } = useGoalStore();
  const [showForm, setShowForm] = createSignal(false);
  const [editingGoal, setEditingGoal] = createSignal<Goal | undefined>(undefined);
  
  const handleCreateClick = () => {
    setEditingGoal(undefined);
    setShowForm(true);
  };
  
  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGoal(undefined);
  };
  
  // Listen for goal selection to enable editing
  const selectedGoal = () => {
    if (goalStore.selectedId) {
      return goalStore.items.find(g => g.id === goalStore.selectedId);
    }
    return undefined;
  };
  
  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Goals</h1>
        <div class="flex gap-3">
          <Show when={selectedGoal() && !selectedGoal()?.archived_at}>
            <Button
              variant="secondary"
              onClick={() => handleEditClick(selectedGoal()!)}
            >
              Edit Selected
            </Button>
          </Show>
          <Button onClick={handleCreateClick}>
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Goal
          </Button>
        </div>
      </div>
      
      <GoalList />
      
      <Modal
        open={showForm()}
        onOpenChange={setShowForm}
        title={editingGoal() ? 'Edit Goal' : 'Create New Goal'}
      >
        <GoalForm
          goal={editingGoal()}
          onClose={handleCloseForm}
        />
      </Modal>
    </div>
  );
}