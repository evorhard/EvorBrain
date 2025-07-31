import { For, Show, createEffect, onMount } from 'solid-js';
import { useGoalStore, useLifeAreaStore } from '../../../stores';
import { formatDate } from '../../../utils/date';

export function GoalList() {
  const { store: goalStore, actions: goalActions } = useGoalStore();
  const { store: lifeAreaStore } = useLifeAreaStore();
  
  onMount(() => {
    // Fetch goals when component mounts
    goalActions.fetchAll();
  });
  
  createEffect(() => {
    // Log when selected goal changes
    if (goalStore.selectedId) {
      console.log('Selected goal:', goalStore.selectedId);
    }
  });
  
  const getLifeAreaName = (lifeAreaId: string) => {
    const lifeArea = lifeAreaStore.items.find(area => area.id === lifeAreaId);
    return lifeArea?.name || 'Unknown';
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-content-secondary';
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    const color = getPriorityColor(priority);
    const label = priority.charAt(0).toUpperCase() + priority.slice(1);
    return (
      <span class={`inline-block px-2 py-1 text-xs font-medium rounded ${color} bg-opacity-10 bg-current`}>
        {label}
      </span>
    );
  };
  
  return (
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Goals</h2>
        <button
          onClick={() => goalActions.fetchAll()}
          class="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-600 transition-colors"
          disabled={goalStore.isLoading}
        >
          {goalStore.isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      <Show when={goalStore.error}>
        <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
          {goalStore.error}
        </div>
      </Show>
      
      <Show when={!goalStore.isLoading && goalStore.items.length === 0}>
        <p class="text-content-secondary">No goals yet. Create your first one!</p>
      </Show>
      
      <div class="grid gap-3">
        <For each={goalStore.items}>
          {(goal) => (
            <div
              class="p-4 bg-surface rounded-lg shadow-card cursor-pointer transition-all"
              classList={{
                'ring-2 ring-primary': goalStore.selectedId === goal.id,
                'hover:shadow-card-hover': goalStore.selectedId !== goal.id,
                'opacity-60': goal.completed_at,
              }}
              onClick={() => goalActions.select(goal.id)}
            >
              <div class="flex items-start gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-semibold text-content">{goal.name}</h3>
                    {goal.priority && getPriorityBadge(goal.priority)}
                  </div>
                  
                  {goal.description && (
                    <p class="text-sm text-content-secondary mt-1">{goal.description}</p>
                  )}
                  
                  <div class="flex items-center gap-4 mt-2 text-xs text-content-secondary">
                    <span>Life Area: {getLifeAreaName(goal.life_area_id)}</span>
                    {goal.target_date && (
                      <span>Target: {formatDate(goal.target_date)}</span>
                    )}
                  </div>
                  
                  <div class="flex items-center gap-2 mt-2">
                    <Show when={goal.completed_at}>
                      <span class="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded">
                        Completed {formatDate(goal.completed_at)}
                      </span>
                    </Show>
                    <Show when={goal.archived_at}>
                      <span class="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                        Archived
                      </span>
                    </Show>
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                  <Show when={!goal.completed_at && !goal.archived_at}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goalActions.complete(goal.id);
                      }}
                      class="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                      title="Mark as completed"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </Show>
                  
                  <Show when={goal.completed_at && !goal.archived_at}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goalActions.uncomplete(goal.id);
                      }}
                      class="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors"
                      title="Mark as incomplete"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Show>
                  
                  <Show when={!goal.archived_at}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete "${goal.name}"?`)) {
                          goalActions.delete(goal.id);
                        }
                      }}
                      class="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete goal"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </Show>
                  
                  <Show when={goal.archived_at}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goalActions.restore(goal.id);
                      }}
                      class="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Restore goal"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </Show>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}