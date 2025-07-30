import { For, Show, createEffect, onMount } from 'solid-js';
import { useLifeAreaStore } from '../../stores';

export function LifeAreaList() {
  const { store, actions } = useLifeAreaStore();
  
  onMount(() => {
    // Fetch life areas when component mounts
    actions.fetchAll();
  });
  
  createEffect(() => {
    // Log when selected life area changes
    if (store.selectedId) {
      console.log('Selected life area:', store.selectedId);
    }
  });
  
  return (
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Life Areas</h2>
        <button
          onClick={() => actions.fetchAll()}
          class="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-600 transition-colors"
          disabled={store.isLoading}
        >
          {store.isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      <Show when={store.error}>
        <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
          {store.error}
        </div>
      </Show>
      
      <Show when={!store.isLoading && store.items.length === 0}>
        <p class="text-content-secondary">No life areas yet. Create your first one!</p>
      </Show>
      
      <div class="grid gap-3">
        <For each={store.items}>
          {(area) => (
            <div
              class="p-4 bg-surface rounded-lg shadow-card cursor-pointer transition-all"
              classList={{
                'ring-2 ring-primary': store.selectedId === area.id,
                'hover:shadow-card-hover': store.selectedId !== area.id,
              }}
              onClick={() => actions.select(area.id)}
            >
              <div class="flex items-start gap-3">
                {area.icon && (
                  <span class="text-2xl" style={{ color: area.color || undefined }}>
                    {area.icon}
                  </span>
                )}
                <div class="flex-1">
                  <h3 class="font-semibold text-content">{area.name}</h3>
                  {area.description && (
                    <p class="text-sm text-content-secondary mt-1">{area.description}</p>
                  )}
                  <Show when={area.archived_at}>
                    <span class="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                      Archived
                    </span>
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