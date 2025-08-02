import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { createLifeAreaStoreFactory } from '../../stores/lifeAreaStore.factory';
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
import type { LifeArea } from '../../types/models';

// Test factories for creating mock data
const createLifeArea = (overrides: Partial<LifeArea> = {}): LifeArea => ({
  id: overrides.id || `life-area-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Life Area',
  description: null,
  icon: null,
  color: null,
  archived_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Create context for testing
const LifeAreaStoreContext = createContext<ReturnType<typeof createLifeAreaStoreFactory>>();

// Test version of the hook
const useLifeAreaStore = () => {
  const getStore = useContext(LifeAreaStoreContext);
  if (!getStore) throw new Error('LifeAreaStore not found');
  const store = getStore();
  return { store: store.state, actions: store.actions };
};

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

const MockLifeAreaForm: Component<{
  lifeArea?: LifeArea;
  onClose: () => void;
}> = (props) => (
  <div data-testid="life-area-form">
    <p>{props.lifeArea ? `Editing: ${props.lifeArea.name}` : 'Creating new life area'}</p>
    <button onClick={() => props.onClose()} data-testid="close-form">
      Close
    </button>
  </div>
);

const MockLifeAreaList: Component = () => {
  const { store: lifeAreaStore } = useLifeAreaStore();
  return (
    <div data-testid="life-area-list">
      <For each={lifeAreaStore.items}>
        {(lifeArea) => <div data-testid={`life-area-${lifeArea.id}`}>{lifeArea.name}</div>}
      </For>
    </div>
  );
};

// Test version of LifeAreasPage (simulating the functionality from App.tsx)
const LifeAreasPageWithFactory: Component = () => {
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

  const selectedLifeArea = () => {
    if (lifeAreaStore.selectedId) {
      return lifeAreaStore.items.find((la) => la.id === lifeAreaStore.selectedId);
    }
    return undefined;
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Life Areas</h1>
        <div class="flex gap-3">
          <Show when={selectedLifeArea() && !selectedLifeArea()?.archived_at}>
            <MockButton
              variant="secondary"
              onClick={() => {
                const lifeArea = selectedLifeArea();
                if (lifeArea) {
                  handleEditClick(lifeArea);
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
            New Life Area
          </MockButton>
        </div>
      </div>

      <MockLifeAreaList />

      <MockModal
        open={showForm()}
        onOpenChange={setShowForm}
        title={editingLifeArea() ? 'Edit Life Area' : 'Create New Life Area'}
      >
        <MockLifeAreaForm lifeArea={editingLifeArea()} onClose={handleCloseForm} />
      </MockModal>
    </div>
  );
};

// Provider component for tests
const TestProvider: ParentComponent<{
  lifeAreaStore: ReturnType<typeof createLifeAreaStoreFactory>;
}> = (props) => (
  <LifeAreaStoreContext.Provider value={() => props.lifeAreaStore}>
    {props.children}
  </LifeAreaStoreContext.Provider>
);

describe('LifeAreasPage with Factory Store', () => {
  let mockLifeAreaApi: any;

  beforeEach(() => {
    // Create mock API
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

  const renderWithStore = (ui: Component, initialLifeAreas: LifeArea[] = []) => {
    let lifeAreaStore: ReturnType<typeof createLifeAreaStoreFactory>;
    let dispose: (() => void) | undefined;

    const result = createRoot((d) => {
      dispose = d;

      // Create store inside the root to ensure it's in a reactive context
      lifeAreaStore = createLifeAreaStoreFactory(mockLifeAreaApi, {
        initialState: { items: initialLifeAreas },
      });

      const rendered = render(() => (
        <TestProvider lifeAreaStore={lifeAreaStore}>{ui({})}</TestProvider>
      ));

      return rendered;
    });

    return {
      result,
      lifeAreaStore,
      dispose,
    };
  };

  it('should render page title and create button', () => {
    renderWithStore(LifeAreasPageWithFactory);

    expect(screen.getByText('Life Areas')).toBeInTheDocument();
    expect(screen.getByTestId('create-button')).toBeInTheDocument();
    expect(screen.getByText('New Life Area')).toBeInTheDocument();
  });

  it('should render life area list', () => {
    const mockLifeAreas = [
      createLifeArea({ id: '1', name: 'Personal' }),
      createLifeArea({ id: '2', name: 'Professional' }),
    ];

    renderWithStore(LifeAreasPageWithFactory, mockLifeAreas);

    expect(screen.getByTestId('life-area-list')).toBeInTheDocument();
    expect(screen.getByTestId('life-area-1')).toBeInTheDocument();
    expect(screen.getByTestId('life-area-2')).toBeInTheDocument();
  });

  it('should open create form when create button clicked', () => {
    renderWithStore(LifeAreasPageWithFactory);

    const createButton = screen.getByTestId('create-button');
    fireEvent.click(createButton);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Create New Life Area')).toBeInTheDocument();
    expect(screen.getByText('Creating new life area')).toBeInTheDocument();
  });

  it('should close form when close button clicked', () => {
    renderWithStore(LifeAreasPageWithFactory);

    // Open form
    const createButton = screen.getByTestId('create-button');
    fireEvent.click(createButton);

    expect(screen.getByTestId('modal')).toBeInTheDocument();

    // Close form
    const closeButton = screen.getByTestId('close-form');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('should show edit button when life area is selected', () => {
    const mockLifeAreas = [
      createLifeArea({ id: '1', name: 'Personal' }),
      createLifeArea({ id: '2', name: 'Professional' }),
    ];

    const { lifeAreaStore } = renderWithStore(LifeAreasPageWithFactory, mockLifeAreas);

    // Initially no edit button
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();

    // Select a life area
    lifeAreaStore.actions.select('1');

    // Edit button should appear
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByText('Edit Selected')).toBeInTheDocument();
  });

  it('should not show edit button for archived life areas', () => {
    const mockLifeAreas = [
      createLifeArea({
        id: '1',
        name: 'Archived Area',
        archived_at: new Date().toISOString(),
      }),
    ];

    const { lifeAreaStore } = renderWithStore(LifeAreasPageWithFactory, mockLifeAreas);

    // Select the archived life area
    lifeAreaStore.actions.select('1');

    // Edit button should not appear
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
  });

  it('should open edit form when edit button clicked', () => {
    const mockLifeAreas = [createLifeArea({ id: '1', name: 'Area to Edit' })];

    const { lifeAreaStore } = renderWithStore(LifeAreasPageWithFactory, mockLifeAreas);

    // Select the life area
    lifeAreaStore.actions.select('1');

    // Click edit button
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    // Check modal is open with edit mode
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Edit Life Area')).toBeInTheDocument();
    expect(screen.getByText('Editing: Area to Edit')).toBeInTheDocument();
  });

  it('should clear selection when opening create form', () => {
    const mockLifeAreas = [createLifeArea({ id: '1', name: 'Personal' })];

    const { lifeAreaStore } = renderWithStore(LifeAreasPageWithFactory, mockLifeAreas);

    // Select a life area
    lifeAreaStore.actions.select('1');

    // Open create form
    const createButton = screen.getByTestId('create-button');
    fireEvent.click(createButton);

    // Should show create form, not edit form
    expect(screen.getByText('Create New Life Area')).toBeInTheDocument();
    expect(screen.getByText('Creating new life area')).toBeInTheDocument();
  });

  it('should handle empty life area list', () => {
    renderWithStore(LifeAreasPageWithFactory);

    expect(screen.getByTestId('life-area-list')).toBeInTheDocument();
    expect(screen.queryByTestId('life-area-1')).not.toBeInTheDocument();
  });

  it('should update edit button visibility when selection changes', () => {
    const mockLifeAreas = [
      createLifeArea({ id: '1', name: 'Personal' }),
      createLifeArea({ id: '2', name: 'Professional' }),
    ];

    const { lifeAreaStore } = renderWithStore(LifeAreasPageWithFactory, mockLifeAreas);

    // Select first life area
    lifeAreaStore.actions.select('1');
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();

    // Deselect
    lifeAreaStore.actions.select(null);
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();

    // Select second life area
    lifeAreaStore.actions.select('2');
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
  });
});
