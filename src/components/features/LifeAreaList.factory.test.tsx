import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { renderWithProviders, createLifeArea, createArchivedLifeArea } from '../../test/utils';
import { For, Show, onMount, createRoot } from 'solid-js';
import {
  createLifeAreaStoreFactory,
  type LifeAreaStoreInstance,
} from '../../stores/lifeAreaStore.factory';

// Create a test version of LifeAreaList that accepts store as prop
function LifeAreaListTestable(props: { store: LifeAreaStoreInstance }) {
  const { store } = props;

  onMount(() => {
    // Fetch life areas when component mounts
    props.store.actions.fetchAll();
  });

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Life Areas</h2>
        <button
          onClick={() => store.actions.fetchAll()}
          class="bg-primary hover:bg-primary-600 rounded px-3 py-1 text-sm text-white transition-colors"
          disabled={store.state.isLoading}
        >
          {store.state.isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <Show when={store.state.error}>
        <div class="rounded bg-red-50 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {store.state.error}
        </div>
      </Show>

      <Show when={!store.state.isLoading && store.state.items.length === 0}>
        <p class="text-content-secondary">No life areas yet. Create your first one!</p>
      </Show>

      <div class="grid gap-3">
        <For each={store.state.items}>
          {(area) => (
            <div
              class="bg-surface shadow-card cursor-pointer rounded-lg p-4 transition-all"
              classList={{
                'ring-2 ring-primary': store.state.selectedId === area.id,
                'hover:shadow-card-hover': store.state.selectedId !== area.id,
              }}
              onClick={() => {
                store.actions.select(area.id);
                console.log('Selected life area:', area.id);
              }}
            >
              <div class="flex items-start gap-3">
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
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

describe('LifeAreaList with Factory Store', () => {
  let mockApi: any;
  let store: LifeAreaStoreInstance;

  beforeEach(() => {
    mockApi = {
      lifeArea: {
        getAll: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        restore: vi.fn(),
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    // Mock a slow API call
    mockApi.lifeArea.getAll.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(() =>
      createRoot(() => {
        store = createLifeAreaStoreFactory(mockApi);
        return <LifeAreaListTestable store={store} />;
      }),
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should fetch and display life areas on mount', async () => {
    const lifeAreas = [
      createLifeArea({ name: 'Work', description: 'Professional life' }),
      createLifeArea({ name: 'Personal', description: 'Personal development' }),
      createLifeArea({ name: 'Health', icon: '💪', color: '#22c55e' }),
    ];

    mockApi.lifeArea.getAll.mockResolvedValue(lifeAreas);

    renderWithProviders(() =>
      createRoot(() => {
        store = createLifeAreaStoreFactory(mockApi);
        return <LifeAreaListTestable store={store} />;
      }),
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    // Verify all life areas are displayed
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Professional life')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Personal development')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('💪')).toBeInTheDocument();

    // Verify API was called
    expect(mockApi.lifeArea.getAll).toHaveBeenCalledTimes(1);
  });

  it('should display empty state when no life areas exist', async () => {
    mockApi.lifeArea.getAll.mockResolvedValue([]);

    renderWithProviders(() =>
      createRoot(() => {
        store = createLifeAreaStoreFactory(mockApi);
        return <LifeAreaListTestable store={store} />;
      }),
    );

    await waitFor(() => {
      expect(screen.getByText('No life areas yet. Create your first one!')).toBeInTheDocument();
    });
  });

  it('should display error state when fetch fails', async () => {
    mockApi.lifeArea.getAll.mockRejectedValue(new Error('Database connection failed'));

    renderWithProviders(() =>
      createRoot(() => {
        store = createLifeAreaStoreFactory(mockApi);
        return <LifeAreaListTestable store={store} />;
      }),
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch life areas')).toBeInTheDocument();
    });

    // Error should be displayed with proper styling
    const errorContainer = screen.getByText('Failed to fetch life areas').closest('div');
    expect(errorContainer).toHaveClass('bg-red-50');
    expect(errorContainer).toHaveClass('text-red-600');
  });

  it('should handle refresh button click', async () => {
    const initialAreas = [createLifeArea({ name: 'Initial' })];
    const refreshedAreas = [
      createLifeArea({ name: 'Initial' }),
      createLifeArea({ name: 'New Area' }),
    ];

    let callCount = 0;
    mockApi.lifeArea.getAll.mockImplementation(() => {
      callCount++;
      return Promise.resolve(callCount === 1 ? initialAreas : refreshedAreas);
    });

    renderWithProviders(() =>
      createRoot(() => {
        store = createLifeAreaStoreFactory(mockApi);
        return <LifeAreaListTestable store={store} />;
      }),
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Initial')).toBeInTheDocument();
    });

    // Click refresh
    fireEvent.click(screen.getByText('Refresh'));

    // Wait for new data
    await waitFor(() => {
      expect(screen.getByText('New Area')).toBeInTheDocument();
    });

    expect(mockApi.lifeArea.getAll).toHaveBeenCalledTimes(2);
  });

  it('should handle area selection', async () => {
    const lifeAreas = [
      createLifeArea({ id: 'work-id', name: 'Work' }),
      createLifeArea({ id: 'personal-id', name: 'Personal' }),
    ];

    mockApi.lifeArea.getAll.mockResolvedValue(lifeAreas);

    const consoleSpy = vi.spyOn(console, 'log');

    renderWithProviders(() =>
      createRoot(() => {
        store = createLifeAreaStoreFactory(mockApi);
        return <LifeAreaListTestable store={store} />;
      }),
    );

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    // Click on Work area
    const workAreaElement = screen.getByText('Work');
    const workArea = workAreaElement.closest('div[class*="cursor-pointer"]');
    expect(workArea).toBeDefined();

    if (workArea) {
      fireEvent.click(workArea);

      // Should have selection ring
      await waitFor(() => {
        expect(workArea).toHaveClass('ring-2');
        expect(workArea).toHaveClass('ring-primary');
      });
    }

    // Console should log the selection
    expect(consoleSpy).toHaveBeenCalledWith('Selected life area:', 'work-id');

    consoleSpy.mockRestore();
  });

  it('should display archived areas with badge', async () => {
    const lifeAreas = [
      createLifeArea({ name: 'Active Area' }),
      createArchivedLifeArea({ name: 'Archived Area' }),
    ];

    mockApi.lifeArea.getAll.mockResolvedValue(lifeAreas);

    renderWithProviders(() =>
      createRoot(() => {
        store = createLifeAreaStoreFactory(mockApi);
        return <LifeAreaListTestable store={store} />;
      }),
    );

    await waitFor(() => {
      expect(screen.getByText('Active Area')).toBeInTheDocument();
    });

    // Archived area should have archived badge
    expect(screen.getByText('Archived Area')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();

    const archivedBadge = screen.getByText('Archived');
    expect(archivedBadge).toHaveClass('bg-gray-100');
    expect(archivedBadge).toHaveClass('text-gray-600');
  });
});
