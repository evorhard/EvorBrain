import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { renderWithProviders, createGoal, createLifeArea } from '../../../test/utils';
import { createGoalStoreFactory } from '../../../stores/goalStore.factory';
import { createLifeAreaStoreFactory } from '../../../stores/lifeAreaStore.factory';
import { createContext, useContext, type ParentComponent, For, type Component } from 'solid-js';
import { formatDate } from '../../../utils/date';
import type { Goal, LifeArea } from '../../../types/models';

// Create contexts for testing
const GoalStoreContext = createContext<ReturnType<typeof createGoalStoreFactory>>();
const LifeAreaStoreContext = createContext<ReturnType<typeof createLifeAreaStoreFactory>>();

// Test version of the hooks
const useGoalStore = () => {
  const store = useContext(GoalStoreContext);
  if (!store) throw new Error('GoalStore not found');
  return { store: store.state, actions: store.actions };
};

const useLifeAreaStore = () => {
  const store = useContext(LifeAreaStoreContext);
  if (!store) throw new Error('LifeAreaStore not found');
  return { store: store.state };
};

// Create a test version of GoalList that uses the factory stores
const GoalListWithFactory: Component = () => {
  const { store: goalStore, actions: goalActions } = useGoalStore();
  const { store: lifeAreaStore } = useLifeAreaStore();

  const getLifeAreaName = (lifeAreaId: string) => {
    const lifeArea = lifeAreaStore.items.find((area) => area.id === lifeAreaId);
    return lifeArea?.name || 'Unknown';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-content-secondary';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const color = getPriorityColor(priority);
    const label = priority.charAt(0).toUpperCase() + priority.slice(1);
    return (
      <span
        class={`inline-block rounded px-2 py-1 text-xs font-medium ${color} bg-opacity-10 bg-current`}
      >
        {label}
      </span>
    );
  };

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Goals</h2>
        <button
          onClick={() => goalActions.fetchAll()}
          class="bg-primary hover:bg-primary-600 rounded px-3 py-1 text-sm text-white transition-colors"
          disabled={goalStore.isLoading}
          data-testid="refresh-button"
        >
          {goalStore.isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {goalStore.error && (
        <div class="rounded bg-red-50 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {goalStore.error}
        </div>
      )}

      {!goalStore.isLoading && goalStore.items.length === 0 && (
        <p class="text-content-secondary">No goals yet. Create your first one!</p>
      )}

      <div class="grid gap-3">
        <For each={goalStore.items}>
          {(goal) => (
            <div
              class="bg-surface shadow-card cursor-pointer rounded-lg p-4 transition-all"
              classList={{
                'ring-2 ring-primary': goalStore.selectedId === goal.id,
                'hover:shadow-card-hover': goalStore.selectedId !== goal.id,
                'opacity-60': goal.completed_at !== null,
              }}
              onClick={() => goalActions.select(goal.id)}
              data-testid={`goal-${goal.id}`}
            >
              <div class="flex items-start gap-3">
                <div class="flex-1">
                  <div class="mb-1 flex items-center gap-2">
                    <h3 class="text-content font-semibold">{goal.name}</h3>
                    {goal.priority && getPriorityBadge(goal.priority)}
                  </div>

                  {goal.description && (
                    <p class="text-content-secondary mt-1 text-sm">{goal.description}</p>
                  )}

                  <div class="text-content-secondary mt-2 flex items-center gap-4 text-xs">
                    <span>Life Area: {getLifeAreaName(goal.life_area_id)}</span>
                    {goal.target_date && <span>Target: {formatDate(goal.target_date)}</span>}
                  </div>

                  <div class="mt-2 flex items-center gap-2">
                    {goal.completed_at && (
                      <span class="inline-block rounded bg-green-100 px-2 py-1 text-xs text-green-600 dark:bg-green-900/20 dark:text-green-400">
                        Completed {formatDate(goal.completed_at)}
                      </span>
                    )}
                    {goal.archived_at && (
                      <span class="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        Archived
                      </span>
                    )}
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  {!goal.completed_at && !goal.archived_at && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goalActions.complete(goal.id);
                      }}
                      class="rounded p-1.5 text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="Mark as completed"
                      data-testid={`complete-${goal.id}`}
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
                  )}

                  {goal.completed_at && !goal.archived_at && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goalActions.uncomplete(goal.id);
                      }}
                      class="rounded p-1.5 text-yellow-600 transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                      title="Mark as incomplete"
                      data-testid={`uncomplete-${goal.id}`}
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
                  )}

                  {!goal.archived_at && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goalActions.delete(goal.id);
                      }}
                      class="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete goal"
                      data-testid={`delete-${goal.id}`}
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
                  )}

                  {goal.archived_at && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goalActions.restore(goal.id);
                      }}
                      class="rounded p-1.5 text-blue-600 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Restore goal"
                      data-testid={`restore-${goal.id}`}
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

// Provider component for tests
const TestProvider: ParentComponent<{
  goalStore: ReturnType<typeof createGoalStoreFactory>;
  lifeAreaStore: ReturnType<typeof createLifeAreaStoreFactory>;
}> = (props) => {
  return (
    <GoalStoreContext.Provider value={props.goalStore}>
      <LifeAreaStoreContext.Provider value={props.lifeAreaStore}>
        {props.children}
      </LifeAreaStoreContext.Provider>
    </GoalStoreContext.Provider>
  );
};

describe('GoalList with Factory Store', () => {
  let mockGoalApi: any;
  let mockLifeAreaApi: any;

  beforeEach(() => {
    // Create mock APIs
    mockGoalApi = {
      goal: {
        getAll: vi.fn(),
        getByLifeArea: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        complete: vi.fn(),
        uncomplete: vi.fn(),
        delete: vi.fn(),
        restore: vi.fn(),
      },
    };

    mockLifeAreaApi = {
      lifeArea: {
        getAll: vi.fn(),
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

  const renderWithStores = (
    ui: Component,
    initialGoals: Goal[] = [],
    initialLifeAreas: LifeArea[] = [],
  ) => {
    let goalStore: ReturnType<typeof createGoalStoreFactory>;
    let lifeAreaStore: ReturnType<typeof createLifeAreaStoreFactory>;

    const result = renderWithProviders(() => {
      // Create stores inside the render function to ensure they're in a reactive context
      goalStore = createGoalStoreFactory(mockGoalApi, {
        initialState: { items: initialGoals },
      });
      lifeAreaStore = createLifeAreaStoreFactory(mockLifeAreaApi, {
        initialState: { items: initialLifeAreas },
      });

      return (
        <TestProvider goalStore={goalStore} lifeAreaStore={lifeAreaStore}>
          {ui({})}
        </TestProvider>
      );
    });

    return {
      result,
      goalStore,
      lifeAreaStore,
    };
  };

  it('should render goals list', () => {
    const mockLifeAreas = [
      createLifeArea({ id: 'la1', name: 'Career' }),
      createLifeArea({ id: 'la2', name: 'Health' }),
    ];

    const mockGoals = [
      createGoal({ id: '1', name: 'Learn TypeScript', life_area_id: 'la1' }),
      createGoal({ id: '2', name: 'Exercise Daily', life_area_id: 'la2' }),
    ];

    renderWithStores(GoalListWithFactory, mockGoals, mockLifeAreas);

    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Learn TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Exercise Daily')).toBeInTheDocument();
    expect(screen.getByText('Life Area: Career')).toBeInTheDocument();
    expect(screen.getByText('Life Area: Health')).toBeInTheDocument();
  });

  it('should show empty state when no goals', () => {
    renderWithStores(GoalListWithFactory);

    expect(screen.getByText('No goals yet. Create your first one!')).toBeInTheDocument();
  });

  it('should show error state', () => {
    const { goalStore } = renderWithStores(GoalListWithFactory);

    goalStore.actions._setState('error', 'Failed to load goals');

    expect(screen.getByText('Failed to load goals')).toBeInTheDocument();
  });

  it('should handle refresh button', async () => {
    mockGoalApi.goal.getAll.mockResolvedValue([]);

    renderWithStores(GoalListWithFactory);

    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockGoalApi.goal.getAll).toHaveBeenCalledTimes(1);
    });
  });

  it('should display priority badges', () => {
    const mockGoals = [
      createGoal({ id: '1', name: 'High Priority', priority: 'high' }),
      createGoal({ id: '2', name: 'Medium Priority', priority: 'medium' }),
      createGoal({ id: '3', name: 'Low Priority', priority: 'low' }),
    ];

    renderWithStores(GoalListWithFactory, mockGoals);

    expect(screen.getByText('High')).toHaveClass('text-red-600');
    expect(screen.getByText('Medium')).toHaveClass('text-yellow-600');
    expect(screen.getByText('Low')).toHaveClass('text-green-600');
  });

  it('should handle goal selection', () => {
    const mockGoals = [
      createGoal({ id: '1', name: 'Goal 1' }),
      createGoal({ id: '2', name: 'Goal 2' }),
    ];

    const { goalStore } = renderWithStores(GoalListWithFactory, mockGoals);

    const goal1 = screen.getByTestId('goal-1');
    fireEvent.click(goal1);

    expect(goalStore.state.selectedId).toBe('1');
  });

  it('should handle complete action', async () => {
    const mockGoal = createGoal({ id: '1', name: 'Incomplete Goal' });
    const completedGoal = { ...mockGoal, completed_at: new Date().toISOString() };

    mockGoalApi.goal.complete.mockResolvedValue(completedGoal);

    renderWithStores(GoalListWithFactory, [mockGoal]);

    const completeButton = screen.getByTestId('complete-1');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockGoalApi.goal.complete).toHaveBeenCalledWith('1');
    });
  });

  it('should handle uncomplete action', async () => {
    const completedGoal = createGoal({
      id: '1',
      name: 'Completed Goal',
      completed_at: new Date().toISOString(),
    });
    const uncompletedGoal = { ...completedGoal, completed_at: null };

    mockGoalApi.goal.uncomplete.mockResolvedValue(uncompletedGoal);

    renderWithStores(GoalListWithFactory, [completedGoal]);

    const uncompleteButton = screen.getByTestId('uncomplete-1');
    fireEvent.click(uncompleteButton);

    await waitFor(() => {
      expect(mockGoalApi.goal.uncomplete).toHaveBeenCalledWith('1');
    });
  });

  it('should handle delete action', async () => {
    const mockGoal = createGoal({ id: '1', name: 'Goal to Delete' });

    mockGoalApi.goal.delete.mockResolvedValue(undefined);
    mockGoalApi.goal.getAll.mockResolvedValue([]);

    renderWithStores(GoalListWithFactory, [mockGoal]);

    const deleteButton = screen.getByTestId('delete-1');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockGoalApi.goal.delete).toHaveBeenCalledWith('1');
    });
  });

  it('should handle restore action', async () => {
    const archivedGoal = createGoal({
      id: '1',
      name: 'Archived Goal',
      archived_at: new Date().toISOString(),
    });
    const restoredGoal = { ...archivedGoal, archived_at: null };

    mockGoalApi.goal.restore.mockResolvedValue(restoredGoal);

    renderWithStores(GoalListWithFactory, [archivedGoal]);

    const restoreButton = screen.getByTestId('restore-1');
    fireEvent.click(restoreButton);

    await waitFor(() => {
      expect(mockGoalApi.goal.restore).toHaveBeenCalledWith('1');
    });
  });

  it('should show completed badge', () => {
    const completedGoal = createGoal({
      id: '1',
      name: 'Test Goal',
      completed_at: '2024-01-01T00:00:00Z',
    });

    renderWithStores(GoalListWithFactory, [completedGoal]);

    // Check specifically for the completed badge text
    expect(screen.getByText(/Completed Jan 1, 2024/)).toBeInTheDocument();
  });

  it('should show archived badge', () => {
    const archivedGoal = createGoal({
      id: '1',
      name: 'Archived Goal',
      archived_at: new Date().toISOString(),
    });

    renderWithStores(GoalListWithFactory, [archivedGoal]);

    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('should display target date', () => {
    const goalWithTarget = createGoal({
      id: '1',
      name: 'Goal with Target',
      target_date: '2024-12-31T00:00:00Z',
    });

    renderWithStores(GoalListWithFactory, [goalWithTarget]);

    expect(screen.getByText(/Target:/)).toBeInTheDocument();
  });

  it('should apply opacity to completed goals', () => {
    const completedGoal = createGoal({
      id: '1',
      name: 'Completed Goal',
      completed_at: new Date().toISOString(),
    });

    renderWithStores(GoalListWithFactory, [completedGoal]);

    const goalElement = screen.getByTestId('goal-1');
    expect(goalElement).toHaveClass('opacity-60');
  });
});

