import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { renderWithProviders, createProject, createGoal } from '../../../test/utils';
import { createSignal, Show, createRoot } from 'solid-js';
import {
  createProjectStoreFactory,
  type ProjectStoreInstance,
} from '../../../stores/projectStore.factory';
import {
  createGoalStoreFactory,
  type GoalStoreInstance,
} from '../../../stores/goalStore.factory';
import { ProjectStatus } from '../../../types/models';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

// Mock components
vi.mock('./ProjectList', () => ({
  ProjectList: (props: any) => (
    <div data-testid="project-list">
      <button
        data-testid="project-list-edit"
        onClick={() => props.onEdit?.({ id: 'test-project', title: 'Test Project' })}
      >
        Edit from List
      </button>
    </div>
  ),
}));

vi.mock('./ProjectForm', () => ({
  ProjectForm: (props: any) => (
    <div data-testid="project-form">
      <div>Form for {props.project ? 'editing' : 'creating'} project</div>
      <button data-testid="close-form" onClick={() => props.onClose()}>
        Close
      </button>
    </div>
  ),
}));

// Create a test version of ProjectsPage that accepts stores as props
function ProjectsPageTestable(props: {
  projectStore: ProjectStoreInstance;
  goalStore: GoalStoreInstance;
}) {
  const { projectStore } = props;
  const [showForm, setShowForm] = createSignal(false);
  const [editingProject, setEditingProject] = createSignal<any | undefined>(undefined);

  const handleCreateClick = () => {
    setEditingProject(undefined);
    setShowForm(true);
  };

  const handleEditClick = (project: any) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(undefined);
  };

  // Listen for project selection to enable editing
  const selectedProject = () => {
    if (projectStore.state.selectedId) {
      return projectStore.state.items.find((p) => p.id === projectStore.state.selectedId);
    }
    return undefined;
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Projects</h1>
        <div class="flex gap-3">
          <Show when={selectedProject() && !selectedProject()?.archived_at}>
            <Button
              variant="secondary"
              onClick={() => {
                const project = selectedProject();
                if (project) {
                  handleEditClick(project);
                }
              }}
              data-testid="edit-selected-button"
            >
              Edit Selected
            </Button>
          </Show>
          <Button onClick={handleCreateClick} data-testid="new-project-button">
            New Project
          </Button>
        </div>
      </div>

      {/* Mocked ProjectList */}
      <div data-testid="project-list">
        <button
          data-testid="project-list-edit"
          onClick={() => handleEditClick({ id: 'test-project', title: 'Test Project' })}
        >
          Edit from List
        </button>
      </div>

      <Modal
        open={showForm()}
        onOpenChange={setShowForm}
        title={editingProject() ? 'Edit Project' : 'Create New Project'}
      >
        {/* Mocked ProjectForm */}
        <div data-testid="project-form">
          <div>Form for {editingProject() ? 'editing' : 'creating'} project</div>
          <button data-testid="close-form" onClick={() => handleCloseForm()}>
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}

describe('ProjectsPage Factory', () => {
  let projectApi: any;
  let goalApi: any;
  let dispose: (() => void) | undefined;

  beforeEach(() => {
    projectApi = {
      project: {
        getAll: vi.fn().mockResolvedValue([]),
        getByGoal: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateStatus: vi.fn(),
        delete: vi.fn(),
        restore: vi.fn(),
      },
    };

    goalApi = {
      goal: {
        getAll: vi.fn().mockResolvedValue([]),
        getByLifeArea: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        complete: vi.fn(),
        uncomplete: vi.fn(),
        delete: vi.fn(),
        restore: vi.fn(),
      },
    };
  });

  afterEach(() => {
    dispose?.();
    vi.clearAllMocks();
  });

  describe('Page Layout', () => {
    it('should render page title and new project button', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectsPageTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        expect(screen.getByText('Projects')).toBeInTheDocument();
        expect(screen.getByTestId('new-project-button')).toBeInTheDocument();
        expect(screen.getByTestId('project-list')).toBeInTheDocument();
      });
    });

    it('should not show edit selected button when no project is selected', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectsPageTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        expect(screen.queryByTestId('edit-selected-button')).not.toBeInTheDocument();
      });
    });

    it('should show edit selected button when a project is selected', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const project = createProject({ title: 'Selected Project' });
        const projectStore = createProjectStoreFactory(projectApi, {
          initialState: {
            items: [project],
            selectedId: project.id,
          },
        });
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectsPageTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        expect(screen.getByTestId('edit-selected-button')).toBeInTheDocument();
      });
    });

    it('should not show edit selected button for archived projects', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const archivedProject = createProject({
          title: 'Archived Project',
          archived_at: '2024-01-01',
        });
        const projectStore = createProjectStoreFactory(projectApi, {
          initialState: {
            items: [archivedProject],
            selectedId: archivedProject.id,
          },
        });
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectsPageTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        expect(screen.queryByTestId('edit-selected-button')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Modal', () => {
    it('should open create form when new project button clicked', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectsPageTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        // Form should not be visible initially
        expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();

        // Click new project button
        fireEvent.click(screen.getByTestId('new-project-button'));

        await waitFor(() => {
          expect(screen.getByText('Create New Project')).toBeInTheDocument();
          expect(screen.getByText('Form for creating project')).toBeInTheDocument();
        });
      });
    });

    it('should open edit form when edit selected button clicked', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const project = createProject({ title: 'Selected Project' });
        const projectStore = createProjectStoreFactory(projectApi, {
          initialState: {
            items: [project],
            selectedId: project.id,
          },
        });
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectsPageTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        // Click edit selected button
        fireEvent.click(screen.getByTestId('edit-selected-button'));

        await waitFor(() => {
          expect(screen.getByText('Edit Project')).toBeInTheDocument();
          expect(screen.getByText('Form for editing project')).toBeInTheDocument();
        });
      });
    });

    it('should open edit form when project edited from list', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectsPageTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        // Click edit from list
        fireEvent.click(screen.getByTestId('project-list-edit'));

        await waitFor(() => {
          expect(screen.getByText('Edit Project')).toBeInTheDocument();
          expect(screen.getByText('Form for editing project')).toBeInTheDocument();
        });
      });
    });

    it('should close form when close button clicked', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectsPageTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        // Open form
        fireEvent.click(screen.getByTestId('new-project-button'));

        await waitFor(() => {
          expect(screen.getByText('Create New Project')).toBeInTheDocument();
        });

        // Close form
        fireEvent.click(screen.getByTestId('close-form'));

        await waitFor(() => {
          expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('Integration with Stores', () => {
    it('should update when selected project changes', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const project1 = createProject({ title: 'Project 1' });
        const project2 = createProject({ title: 'Project 2' });
        const projectStore = createProjectStoreFactory(projectApi, {
          initialState: {
            items: [project1, project2],
          },
        });
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectsPageTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        // Initially no edit button
        expect(screen.queryByTestId('edit-selected-button')).not.toBeInTheDocument();

        // Select project 1
        projectStore.actions.select(project1.id);

        await waitFor(() => {
          expect(screen.getByTestId('edit-selected-button')).toBeInTheDocument();
        });

        // Click edit and verify correct project is being edited
        fireEvent.click(screen.getByTestId('edit-selected-button'));

        await waitFor(() => {
          expect(screen.getByText('Edit Project')).toBeInTheDocument();
        });
      });
    });

    it('should hide edit button when selected project becomes archived', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const project = createProject({ title: 'Active Project' });
        const projectStore = createProjectStoreFactory(projectApi, {
          initialState: {
            items: [project],
            selectedId: project.id,
          },
        });
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectsPageTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        // Initially edit button is visible
        expect(screen.getByTestId('edit-selected-button')).toBeInTheDocument();

        // Archive the project
        projectStore.actions._setState('items', 0, 'archived_at', '2024-01-01');

        await waitFor(() => {
          expect(screen.queryByTestId('edit-selected-button')).not.toBeInTheDocument();
        });
      });
    });
  });
});