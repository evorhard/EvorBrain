import { For, Show, onMount, createSignal } from 'solid-js';
import { useLifeAreaStore } from '../../stores';
import { Button } from '../ui/Button';
import { DropdownMenu } from '../ui/DropdownMenu';
import { createConfirmDialog } from '../ui/ConfirmDialog';
import type { LifeArea } from '../../types/models';

interface LifeAreaListProps {
  onEdit?: (area: LifeArea) => void;
}

export function LifeAreaList(props: LifeAreaListProps) {
  const { store, actions } = useLifeAreaStore();
  const [areaToDelete, setAreaToDelete] = createSignal<LifeArea | null>(null);

  onMount(() => {
    // Fetch life areas when component mounts
    actions.fetchAll();
  });

  const handleDelete = async () => {
    const area = areaToDelete();
    if (area) {
      try {
        await actions.delete(area.id);
        setAreaToDelete(null);
      } catch (error) {
        console.error('Failed to delete life area:', error);
      }
    }
  };

  const [DeleteConfirmDialog, deleteConfirmHandle] = createConfirmDialog({
    title: 'Delete Life Area',
    description: () => {
      const area = areaToDelete();
      return area
        ? `Are you sure you want to delete "${area.name}"? This will also archive all associated goals, projects, and tasks.`
        : '';
    },
    confirmText: 'Delete',
    variant: 'danger',
    onConfirm: handleDelete,
    onCancel: () => setAreaToDelete(null),
  });

  const handleRestore = async (area: LifeArea) => {
    try {
      await actions.restore(area.id);
    } catch (error) {
      console.error('Failed to restore life area:', error);
    }
  };

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Life Areas</h2>
        <button
          onClick={() => actions.fetchAll()}
          class="bg-primary hover:bg-primary-600 rounded px-3 py-1 text-sm text-white transition-colors"
          disabled={store.isLoading}
        >
          {store.isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <Show when={store.error}>
        <div class="rounded bg-red-50 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {store.error}
        </div>
      </Show>

      <Show when={!store.isLoading && store.items.length === 0}>
        <p class="text-content-secondary">No life areas yet. Create your first one!</p>
      </Show>

      <div class="grid gap-3">
        <For each={store.items}>
          {(area) => {
            // Defensive check to ensure area is not null and has required properties
            if (!area || typeof area !== 'object' || !area.id || !area.name) {
              console.warn('Invalid life area object received:', area);
              return null;
            }

            return (
              <div
                class="bg-surface shadow-card cursor-pointer rounded-lg p-4 transition-all"
                classList={{
                  'ring-2 ring-primary': store.selectedId === area.id,
                  'hover:shadow-card-hover': store.selectedId !== area.id,
                  'opacity-60': Boolean(area.archived_at),
                }}
                onClick={() => actions.select(area.id)}
              >
                <div class="flex items-start justify-between">
                  <div class="flex flex-1 items-start gap-3">
                    {area.icon && (
                      <span class="text-2xl" style={{ color: area.color || undefined }}>
                        {area.icon}
                      </span>
                    )}
                    <div class="flex-1">
                      <h3 class="text-content font-semibold">{area.name}</h3>
                      {area.description && (
                        <p class="text-content-secondary mt-1 text-sm">{area.description}</p>
                      )}
                      <Show when={area.archived_at}>
                        <span class="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Archived
                        </span>
                      </Show>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      {(triggerProps) => (
                        <Button
                          {...triggerProps}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerProps.onClick(e);
                          }}
                        >
                          <svg
                            class="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </Button>
                      )}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <Show when={!area.archived_at}>
                        <DropdownMenu.Item
                          onSelect={() => {
                            props.onEdit?.(area);
                          }}
                        >
                          Edit
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item
                          class="text-danger-600"
                          onSelect={() => {
                            setAreaToDelete(area);
                            deleteConfirmHandle.open();
                          }}
                        >
                          Delete
                        </DropdownMenu.Item>
                      </Show>
                      <Show when={area.archived_at}>
                        <DropdownMenu.Item onSelect={() => handleRestore(area)}>
                          Restore
                        </DropdownMenu.Item>
                      </Show>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      <DeleteConfirmDialog />
    </div>
  );
}
