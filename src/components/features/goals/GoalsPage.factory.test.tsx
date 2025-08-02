import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { createGoalStoreFactory } from '../../../stores/goalStore.factory';
import { createLifeAreaStoreFactory } from '../../../stores/lifeAreaStore.factory';
import {
  createContext,
  useContext,
  type ParentComponent,
  Show,
  createSignal,
  type Component,
  createRoot,
  For,
} from 'solid-js';
import type { Goal } from '../../../types/models';
// Test factories for creating mock data
const createGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: overrides.id || `goal-${Math.random().toString(36).substr(2, 9)}`,
  life_area_id: 'default-life-area',
  name: 'Test Goal',
  description: null,
  target_date: null,
  priority: 'medium',
  completed_at: null,
  archived_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Create contexts for testing
const GoalStoreContext = createContext<ReturnType<typeof createGoalStoreFactory>>();
const LifeAreaStoreContext = createContext<ReturnType<typeof createLifeAreaStoreFactory>>();

// Test version of the hooks
const useGoalStore = () => {
  const getStore = useContext(GoalStoreContext);
  if (!getStore) throw new Error('GoalStore not found');
  const store = getStore();
  return { store: store.state, actions: store.actions };
};

// Unused but keeping for consistency with other factory tests
// const useLifeAreaStore = () => {
//   const store = useContext(LifeAreaStoreContext);
//   if (!store) throw new Error('LifeAreaStore not found');
//   return { store: store.state };
// };

// Mock components
const MockButton: Component<{
  onClick?: () => void;
  variant?: string;
  children: any;
}> = (props) => (
  <button
    onClick={() => props.onClick?.()}
    class={props.variant === 'secondary' ? 'secondary' : 'primary'}
    data-testid={props.variant === 'secondary' ? 'edit-button' : 'create-button'}
  >
    {props.children}
  </button>
);

const MockModal: Component<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: any;
}> = (props) => (
  <Show when={props.open}>
    <div data-testid="modal">
      <h2>{props.title}</h2>
      {props.children}
    </div>
  </Show>
);

const MockGoalForm: Component<{
  goal?: Goal;
  onClose: () => void;
}> = (props) => (
  <div data-testid="goal-form">
    <p>{props.goal ? `Editing: ${props.goal.name}` : 'Creating new goal'}</p>
    <button onClick={() => props.onClose()} data-testid="close-form">
      Close
    </button>
  </div>
);

const MockGoalList: Component = () => {
  const { store: goalStore } = useGoalStore();
  return (
    <div data-testid="goal-list">
      <For each={goalStore.items}>
        {(goal) => <div data-testid={`goal-${goal.id}`}>{goal.name}</div>}
      </For>
    </div>
  );
};

// Test version of GoalsPage
const GoalsPageWithFactory: Component = () => {
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

  const selectedGoal = () => {
    if (goalStore.selectedId) {
      return goalStore.items.find((g) => g.id === goalStore.selectedId);
    }
    return undefined;
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Goals</h1>
        <div class="flex gap-3">
          <Show when={selectedGoal() && !selectedGoal()?.archived_at}>
            <MockButton
              variant="secondary"
              onClick={() => {
                const goal = selectedGoal();
                if (goal) {
                  handleEditClick(goal);
                }
              }}
            >
              Edit Selected
            </MockButton>
          </Show>
          <MockButton onClick={handleCreateClick}>
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Goal
          </MockButton>
        </div>
      </div>

      <MockGoalList />

      <MockModal
        open={showForm()}
        onOpenChange={setShowForm}
        title={editingGoal() ? 'Edit Goal' : 'Create New Goal'}
      >
        <MockGoalForm goal={editingGoal()} onClose={handleCloseForm} />
      </MockModal>
    </div>
  );
};

// Provider component for tests
const TestProvider: ParentComponent<{
  goalStore: ReturnType<typeof createGoalStoreFactory>;
  lifeAreaStore: ReturnType<typeof createLifeAreaStoreFactory>;
}> = (props) => (
  <GoalStoreContext.Provider value={() => props.goalStore}>
    <LifeAreaStoreContext.Provider value={() => props.lifeAreaStore}>
      {props.children}
    </LifeAreaStoreContext.Provider>
  </GoalStoreContext.Provider>
);

describe('GoalsPage with Factory Store', () => {
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
    initialLifeAreas: any[] = [],
  ) => {
    let goalStore: ReturnType<typeof createGoalStoreFactory>;
    let lifeAreaStore: ReturnType<typeof createLifeAreaStoreFactory>;
    let dispose: (() => void) | undefined;

    const result = createRoot((d) => {
      dispose = d;

      // Create stores inside the root to ensure they're in a reactive context
      goalStore = createGoalStoreFactory(mockGoalApi, {
        initialState: { items: initialGoals },
      });
      lifeAreaStore = createLifeAreaStoreFactory(mockLifeAreaApi, {
        initialState: { items: initialLifeAreas },
      });

      const rendered = render(() => (
        <TestProvider goalStore={goalStore} lifeAreaStore={lifeAreaStore}>
          {ui({})}
        </TestProvider>
      ));

      return rendered;
    });

    return {
      result,
      goalStore,
      lifeAreaStore,
      dispose,
    };
  };

  it('should render page title and create button', () => {
    renderWithStores(GoalsPageWithFactory);

    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByTestId('create-button')).toBeInTheDocument();
    expect(screen.getByText('New Goal')).toBeInTheDocument();
  });

  it('should render goal list', () => {
    const mockGoals = [
      createGoal({ id: '1', name: 'Goal 1' }),
      createGoal({ id: '2', name: 'Goal 2' }),
    ];

    renderWithStores(GoalsPageWithFactory, mockGoals);

    expect(screen.getByTestId('goal-list')).toBeInTheDocument();
    expect(screen.getByTestId('goal-1')).toBeInTheDocument();
    expect(screen.getByTestId('goal-2')).toBeInTheDocument();
  });

  it('should open create form when create button clicked', () => {
    renderWithStores(GoalsPageWithFactory);

    const createButton = screen.getByTestId('create-button');
    fireEvent.click(createButton);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Create New Goal')).toBeInTheDocument();
    expect(screen.getByText('Creating new goal')).toBeInTheDocument();
  });

  it('should close form when close button clicked', () => {
    renderWithStores(GoalsPageWithFactory);

    // Open form
    const createButton = screen.getByTestId('create-button');
    fireEvent.click(createButton);

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // Close form
    const closeButton = screen.getByTestId('close-form');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('should show edit button when goal is selected', () => {
    const mockGoals = [
      createGoal({ id: '1', name: 'Goal 1' }),
      createGoal({ id: '2', name: 'Goal 2' }),
    ];

    const { goalStore } = renderWithStores(GoalsPageWithFactory, mockGoals);

    // Initially no edit button
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();

    // Select a goal
    goalStore.actions.select('1');

    // Edit button should appear
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByText('Edit Selected')).toBeInTheDocument();
  });

  it('should not show edit button for archived goals', () => {
    const mockGoals = [
      createGoal({ id: '1', name: 'Archived Goal', archived_at: new Date().toISOString() }),
    ];

    const { goalStore } = renderWithStores(GoalsPageWithFactory, mockGoals);

    // Select the archived goal
    goalStore.actions.select('1');

    // Edit button should not appear
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
  });

  it('should open edit form when edit button clicked', () => {
    const mockGoals = [createGoal({ id: '1', name: 'Goal to Edit' })];

    const { goalStore } = renderWithStores(GoalsPageWithFactory, mockGoals);

    // Select the goal
    goalStore.actions.select('1');

    // Click edit button
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    // Check modal is open with edit mode
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Edit Goal')).toBeInTheDocument();
    expect(screen.getByText('Editing: Goal to Edit')).toBeInTheDocument();
  });

  it('should clear selection when opening create form', () => {
    const mockGoals = [createGoal({ id: '1', name: 'Goal 1' })];

    const { goalStore } = renderWithStores(GoalsPageWithFactory, mockGoals);

    // Select a goal
    goalStore.actions.select('1');

    // Open create form
    const createButton = screen.getByTestId('create-button');
    fireEvent.click(createButton);

    // Should show create form, not edit form
    expect(screen.getByText('Create New Goal')).toBeInTheDocument();
    expect(screen.getByText('Creating new goal')).toBeInTheDocument();
  });

  it('should handle empty goal list', () => {
    renderWithStores(GoalsPageWithFactory);

    expect(screen.getByTestId('goal-list')).toBeInTheDocument();
    expect(screen.queryByTestId('goal-1')).not.toBeInTheDocument();
  });

  it('should update edit button visibility when selection changes', () => {
    const mockGoals = [
      createGoal({ id: '1', name: 'Goal 1' }),
      createGoal({ id: '2', name: 'Goal 2' }),
    ];

    const { goalStore } = renderWithStores(GoalsPageWithFactory, mockGoals);

    // Select first goal
    goalStore.actions.select('1');
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();

    // Deselect
    goalStore.actions.select(null);
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();

    // Select second goal
    goalStore.actions.select('2');
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
  });
});
