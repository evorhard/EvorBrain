import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { renderWithProviders } from '../../../test/utils';
import { createSignal, For, Show, type Component } from 'solid-js';
import type { Goal, LifeArea } from '../../../types/models';

// UI-focused component for testing without store dependencies
const GoalUI: Component<{
  goals: Goal[];
  lifeAreas: LifeArea[];
  isLoading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onRefresh: () => void;
}> = (props) => {
  const getLifeAreaName = (lifeAreaId: string) => {
    const area = props.lifeAreas.find((a) => a.id === lifeAreaId);
    return area?.name || 'Unknown';
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'low':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
    }
  };

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Goals</h2>
        <button
          onClick={() => props.onRefresh()}
          class="bg-primary hover:bg-primary-600 rounded px-3 py-1 text-sm text-white transition-colors"
          disabled={props.isLoading}
        >
          {props.isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <Show when={props.error}>
        <div class="rounded bg-red-50 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {props.error}
        </div>
      </Show>

      <Show when={!props.isLoading && props.goals.length === 0}>
        <p class="text-content-secondary">No goals yet. Create your first goal!</p>
      </Show>

      <div class="grid gap-3">
        <For each={props.goals}>
          {(goal) => (
            <div
              class="bg-surface shadow-card cursor-pointer rounded-lg p-4 transition-all"
              classList={{
                'ring-2 ring-primary': props.selectedId === goal.id,
                'hover:shadow-card-hover': props.selectedId !== goal.id,
                'opacity-60': goal.archived_at !== null,
              }}
              onClick={() => props.onSelect(goal.id)}
              data-testid={`goal-${goal.id}`}
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-content font-semibold">{goal.name}</h3>
                    <span
                      class={`rounded px-2 py-0.5 text-xs font-medium ${getPriorityColor(
                        goal.priority,
                      )}`}
                    >
                      {goal.priority}
                    </span>
                  </div>
                  <p class="text-content-secondary mt-1 text-sm">
                    {getLifeAreaName(goal.life_area_id)}
                  </p>
                  {goal.description && (
                    <p class="text-content-secondary mt-2 text-sm">{goal.description}</p>
                  )}
                  {goal.target_date && (
                    <p class="text-content-secondary mt-2 text-sm">
                      Target: {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div class="ml-4 flex flex-col gap-2">
                  <Show when={!goal.archived_at}>
                    <Show
                      when={goal.completed_at}
                      fallback={
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            props.onComplete(goal.id);
                          }}
                          class="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                          data-testid={`complete-${goal.id}`}
                        >
                          Complete
                        </button>
                      }
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          props.onUncomplete(goal.id);
                        }}
                        class="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600"
                        data-testid={`uncomplete-${goal.id}`}
                      >
                        Uncomplete
                      </button>
                    </Show>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        props.onArchive(goal.id);
                      }}
                      class="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                      data-testid={`archive-${goal.id}`}
                    >
                      Archive
                    </button>
                  </Show>
                  <Show when={goal.archived_at}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        props.onRestore(goal.id);
                      }}
                      class="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                      data-testid={`restore-${goal.id}`}
                    >
                      Restore
                    </button>
                  </Show>
                  <Show when={goal.completed_at}>
                    <span class="rounded bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-800 dark:text-green-300">
                      Completed
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
};

describe('Goal UI Component', () => {
  const createMockGoal = (overrides?: Partial<Goal>): Goal => ({
    id: 'test-id',
    life_area_id: 'life-area-1',
    name: 'Test Goal',
    description: null,
    target_date: null,
    priority: 'medium',
    completed_at: null,
    position: 0,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  });

  const createMockLifeArea = (overrides?: Partial<LifeArea>): LifeArea => ({
    id: 'life-area-1',
    name: 'Test Life Area',
    description: null,
    color: null,
    icon: null,
    position: 0,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  });

  const defaultLifeAreas = [
    createMockLifeArea({ id: 'life-area-1', name: 'Career' }),
    createMockLifeArea({ id: 'life-area-2', name: 'Health' }),
  ];

  it('should render goals correctly', () => {
    const mockGoals = [
      createMockGoal({
        id: '1',
        name: 'Learn TypeScript',
        description: 'Master TypeScript for better code',
        life_area_id: 'life-area-1',
      }),
      createMockGoal({
        id: '2',
        name: 'Exercise Daily',
        description: 'Build a consistent workout routine',
        life_area_id: 'life-area-2',
      }),
    ];

    const mockCallbacks = {
      onSelect: vi.fn(),
      onComplete: vi.fn(),
      onUncomplete: vi.fn(),
      onArchive: vi.fn(),
      onRestore: vi.fn(),
      onRefresh: vi.fn(),
    };

    renderWithProviders(() => (
      <GoalUI
        goals={mockGoals}
        lifeAreas={defaultLifeAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        {...mockCallbacks}
      />
    ));

    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Learn TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Master TypeScript for better code')).toBeInTheDocument();
    expect(screen.getByText('Career')).toBeInTheDocument();
    expect(screen.getByText('Exercise Daily')).toBeInTheDocument();
    expect(screen.getByText('Build a consistent workout routine')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    renderWithProviders(() => (
      <GoalUI
        goals={[]}
        lifeAreas={[]}
        isLoading={true}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onComplete={() => {}}
        onUncomplete={() => {}}
        onArchive={() => {}}
        onRestore={() => {}}
        onRefresh={() => {}}
      />
    ));

    const refreshButton = screen.getByText('Loading...');
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toBeDisabled();
  });

  it('should show empty state', () => {
    renderWithProviders(() => (
      <GoalUI
        goals={[]}
        lifeAreas={[]}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onComplete={() => {}}
        onUncomplete={() => {}}
        onArchive={() => {}}
        onRestore={() => {}}
        onRefresh={() => {}}
      />
    ));

    expect(screen.getByText('No goals yet. Create your first goal!')).toBeInTheDocument();
  });

  it('should show error state', () => {
    renderWithProviders(() => (
      <GoalUI
        goals={[]}
        lifeAreas={[]}
        isLoading={false}
        error="Failed to load goals"
        selectedId={null}
        onSelect={() => {}}
        onComplete={() => {}}
        onUncomplete={() => {}}
        onArchive={() => {}}
        onRestore={() => {}}
        onRefresh={() => {}}
      />
    ));

    const errorText = screen.getByText('Failed to load goals');
    expect(errorText).toBeInTheDocument();
    const errorContainer = errorText.closest('.bg-red-50');
    expect(errorContainer).toBeInTheDocument();
  });

  it('should display priority badges correctly', () => {
    const mockGoals = [
      createMockGoal({ id: '1', name: 'High Priority', priority: 'high' }),
      createMockGoal({ id: '2', name: 'Medium Priority', priority: 'medium' }),
      createMockGoal({ id: '3', name: 'Low Priority', priority: 'low' }),
    ];

    renderWithProviders(() => (
      <GoalUI
        goals={mockGoals}
        lifeAreas={defaultLifeAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onComplete={() => {}}
        onUncomplete={() => {}}
        onArchive={() => {}}
        onRestore={() => {}}
        onRefresh={() => {}}
      />
    ));

    const highBadge = screen.getByText('high');
    expect(highBadge).toHaveClass('text-red-600');

    const mediumBadge = screen.getByText('medium');
    expect(mediumBadge).toHaveClass('text-yellow-600');

    const lowBadge = screen.getByText('low');
    expect(lowBadge).toHaveClass('text-blue-600');
  });

  it('should display target date correctly', () => {
    const targetDate = new Date('2024-12-31');
    const mockGoal = createMockGoal({
      name: 'Goal with Target',
      target_date: targetDate.toISOString(),
    });

    renderWithProviders(() => (
      <GoalUI
        goals={[mockGoal]}
        lifeAreas={defaultLifeAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onComplete={() => {}}
        onUncomplete={() => {}}
        onArchive={() => {}}
        onRestore={() => {}}
        onRefresh={() => {}}
      />
    ));

    expect(screen.getByText(`Target: ${targetDate.toLocaleDateString()}`)).toBeInTheDocument();
  });

  it('should handle goal selection', async () => {
    const mockGoals = [
      createMockGoal({ id: '1', name: 'Goal 1' }),
      createMockGoal({ id: '2', name: 'Goal 2' }),
    ];

    const onSelect = vi.fn();
    const [selectedId, setSelectedId] = createSignal<string | null>(null);

    renderWithProviders(() => (
      <GoalUI
        goals={mockGoals}
        lifeAreas={defaultLifeAreas}
        isLoading={false}
        error={null}
        selectedId={selectedId()}
        onSelect={(id) => {
          onSelect(id);
          setSelectedId(id);
        }}
        onComplete={() => {}}
        onUncomplete={() => {}}
        onArchive={() => {}}
        onRestore={() => {}}
        onRefresh={() => {}}
      />
    ));

    const goal1 = screen.getByTestId('goal-1');
    fireEvent.click(goal1);

    expect(onSelect).toHaveBeenCalledWith('1');
    expect(onSelect).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(goal1).toHaveClass('ring-2');
      expect(goal1).toHaveClass('ring-primary');
    });
  });

  it('should handle complete button click', () => {
    const mockGoal = createMockGoal({ id: '1', name: 'Incomplete Goal' });
    const onComplete = vi.fn();

    renderWithProviders(() => (
      <GoalUI
        goals={[mockGoal]}
        lifeAreas={defaultLifeAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onComplete={onComplete}
        onUncomplete={() => {}}
        onArchive={() => {}}
        onRestore={() => {}}
        onRefresh={() => {}}
      />
    ));

    const completeButton = screen.getByTestId('complete-1');
    fireEvent.click(completeButton);

    expect(onComplete).toHaveBeenCalledWith('1');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should handle uncomplete button click', () => {
    const mockGoal = createMockGoal({
      id: '1',
      name: 'Completed Goal',
      completed_at: new Date().toISOString(),
    });
    const onUncomplete = vi.fn();

    renderWithProviders(() => (
      <GoalUI
        goals={[mockGoal]}
        lifeAreas={defaultLifeAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onComplete={() => {}}
        onUncomplete={onUncomplete}
        onArchive={() => {}}
        onRestore={() => {}}
        onRefresh={() => {}}
      />
    ));

    const uncompleteButton = screen.getByTestId('uncomplete-1');
    fireEvent.click(uncompleteButton);

    expect(onUncomplete).toHaveBeenCalledWith('1');
    expect(onUncomplete).toHaveBeenCalledTimes(1);
  });

  it('should display completed badge', () => {
    const mockGoal = createMockGoal({
      name: 'Completed Goal',
      completed_at: new Date().toISOString(),
    });

    renderWithProviders(() => (
      <GoalUI
        goals={[mockGoal]}
        lifeAreas={defaultLifeAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onComplete={() => {}}
        onUncomplete={() => {}}
        onArchive={() => {}}
        onRestore={() => {}}
        onRefresh={() => {}}
      />
    ));

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should handle archive button click', () => {
    const mockGoal = createMockGoal({ id: '1', name: 'Active Goal' });
    const onArchive = vi.fn();

    renderWithProviders(() => (
      <GoalUI
        goals={[mockGoal]}
        lifeAreas={defaultLifeAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onComplete={() => {}}
        onUncomplete={() => {}}
        onArchive={onArchive}
        onRestore={() => {}}
        onRefresh={() => {}}
      />
    ));

    const archiveButton = screen.getByTestId('archive-1');
    fireEvent.click(archiveButton);

    expect(onArchive).toHaveBeenCalledWith('1');
    expect(onArchive).toHaveBeenCalledTimes(1);
  });

  it('should handle restore button click', () => {
    const mockGoal = createMockGoal({
      id: '1',
      name: 'Archived Goal',
      archived_at: new Date().toISOString(),
    });
    const onRestore = vi.fn();

    renderWithProviders(() => (
      <GoalUI
        goals={[mockGoal]}
        lifeAreas={defaultLifeAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onComplete={() => {}}
        onUncomplete={() => {}}
        onArchive={() => {}}
        onRestore={onRestore}
        onRefresh={() => {}}
      />
    ));

    const restoreButton = screen.getByTestId('restore-1');
    fireEvent.click(restoreButton);

    expect(onRestore).toHaveBeenCalledWith('1');
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it('should display archived goals with reduced opacity', () => {
    const mockGoal = createMockGoal({
      id: '1',
      name: 'Archived Goal',
      archived_at: new Date().toISOString(),
    });

    renderWithProviders(() => (
      <GoalUI
        goals={[mockGoal]}
        lifeAreas={defaultLifeAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onComplete={() => {}}
        onUncomplete={() => {}}
        onArchive={() => {}}
        onRestore={() => {}}
        onRefresh={() => {}}
      />
    ));

    const goalElement = screen.getByTestId('goal-1');
    expect(goalElement).toHaveClass('opacity-60');
  });

  it('should handle refresh button click', () => {
    const onRefresh = vi.fn();

    renderWithProviders(() => (
      <GoalUI
        goals={[]}
        lifeAreas={[]}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onComplete={() => {}}
        onUncomplete={() => {}}
        onArchive={() => {}}
        onRestore={() => {}}
        onRefresh={onRefresh}
      />
    ));

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should stop event propagation on button clicks', () => {
    const mockGoal = createMockGoal({ id: '1', name: 'Test Goal' });
    const onSelect = vi.fn();
    const onComplete = vi.fn();

    renderWithProviders(() => (
      <GoalUI
        goals={[mockGoal]}
        lifeAreas={defaultLifeAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={onSelect}
        onComplete={onComplete}
        onUncomplete={() => {}}
        onArchive={() => {}}
        onRestore={() => {}}
        onRefresh={() => {}}
      />
    ));

    const completeButton = screen.getByTestId('complete-1');
    fireEvent.click(completeButton);

    // Complete button should be called, but not select
    expect(onComplete).toHaveBeenCalledWith('1');
    expect(onSelect).not.toHaveBeenCalled();
  });
});
