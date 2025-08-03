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
    // Track when selected goal changes
    if (goalStore.selectedId) {
      // Selected goal changed
    }
  });

  const getLifeAreaName = (lifeAreaId: string) => {
    const lifeArea = lifeAreaStore.items.find((area) => area.id === lifeAreaId);
    return lifeArea?.name || 'Unknown';
  };

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Goals</h2>
        <button
          onClick={() => goalActions.fetchAll()}
          class="bg-primary hover:bg-primary-600 rounded px-3 py-1 text-sm text-white transition-colors"
          disabled={goalStore.isLoading}
        >
          {goalStore.isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <Show when={goalStore.error}>
        <div class="rounded bg-red-50 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
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
              class="bg-surface shadow-card cursor-pointer rounded-lg p-4 transition-all"
              classList={{
                'ring-2 ring-primary': goalStore.selectedId === goal.id,
                'hover:shadow-card-hover': goalStore.selectedId !== goal.id,
              }}
              onClick={() => goalActions.select(goal.id)}
            >
              <div class="flex items-start gap-3">
                <div class="flex-1">
                  <div class="mb-1 flex items-center gap-2">
                    <h3 class="text-content font-semibold">{goal.title}</h3>
                  </div>

                  {goal.description && (
                    <p class="text-content-secondary mt-1 text-sm">{goal.description}</p>
                  )}

                  <div class="text-content-secondary mt-2 flex items-center gap-4 text-xs">
                    <span>Life Area: {getLifeAreaName(goal.life_area_id)}</span>
                    {goal.target_date && <span>Target: {formatDate(goal.target_date)}</span>}
                  </div>

                  <div class="mt-2 flex items-center gap-2">
                    <Show when={goal.completed_at}>
                      <span class="inline-block rounded bg-green-100 px-2 py-1 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
                        Completed {formatDate(goal.completed_at)}
                      </span>
                    </Show>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <Show when={!goal.completed_at}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goalActions.complete(goal.id);
                      }}
                      class="rounded p-1.5 text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="Mark as completed"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </Show>

                  <Show when={goal.completed_at}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goalActions.uncomplete(goal.id);
                      }}
                      class="rounded p-1.5 text-yellow-600 transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                      title="Mark as incomplete"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </Show>

                  <Show when={true}>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        // eslint-disable-next-line no-alert
                        const confirmDelete = window.confirm(
                          `Are you sure you want to delete "${goal.title}"? This action cannot be undone.`,
                        );
                        if (confirmDelete) {
                          await goalActions.delete(goal.id);
                        }
                      }}
                      class="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete goal"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
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
