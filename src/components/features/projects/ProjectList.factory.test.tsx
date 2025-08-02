import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@solidjs/testing-library';
import {
  renderWithProviders,
  createProject,
  createGoal,
  createArchivedProject,
} from '../../../test/utils';
import { For, Show, createEffect, createRoot } from 'solid-js';
import {
  createProjectStoreFactory,
  type ProjectStoreInstance,
} from '../../../stores/projectStore.factory';
import { createGoalStoreFactory, type GoalStoreInstance } from '../../../stores/goalStore.factory';
import { ProjectStatus } from '../../../types/models';
import { Badge } from '../../ui/Badge';

// Create a test version of ProjectList that accepts stores as props
function ProjectListTestable(props: {
  projectStore: ProjectStoreInstance;
  goalStore: GoalStoreInstance;
  onEdit?: (project: any) => void;
}) {
  const { projectStore, goalStore, onEdit } = props;

  // Fetch projects and goals on mount
  createEffect(() => {
    projectStore.actions.fetchAll();
    goalStore.actions.fetchAll();
  });

  const handleDelete = async (projectId: string) => {
    await projectStore.actions.delete(projectId);
  };

  const handleRestore = async (projectId: string) => {
    await projectStore.actions.restore(projectId);
  };

  const handleStatusChange = async (projectId: string, status: ProjectStatus) => {
    await projectStore.actions.updateStatus(projectId, status);
  };

  const handleSelect = (projectId: string) => {
    projectStore.actions.select(projectStore.state.selectedId === projectId ? null : projectId);
  };

  const getGoalName = (goalId: string) => {
    const goal = goalStore.state.items.find((g) => g.id === goalId);
    return goal?.name || 'Unknown Goal';
  };

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Planning:
        return 'secondary';
      case ProjectStatus.Active:
        return 'primary';
      case ProjectStatus.Completed:
        return 'success';
      case ProjectStatus.OnHold:
        return 'warning';
      case ProjectStatus.Cancelled:
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Planning:
        return 'Planning';
      case ProjectStatus.Active:
        return 'Active';
      case ProjectStatus.OnHold:
        return 'On Hold';
      case ProjectStatus.Completed:
        return 'Completed';
      case ProjectStatus.Cancelled:
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Projects</h2>
        <button
          onClick={() => projectStore.actions.fetchAll()}
          class="bg-primary rounded px-3 py-1 text-sm text-white"
          disabled={projectStore.state.isLoading}
        >
          {projectStore.state.isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <Show when={projectStore.state.error}>
        <div class="rounded bg-red-50 p-3 text-red-600">{projectStore.state.error}</div>
      </Show>

      <Show when={!projectStore.state.isLoading && projectStore.state.items.length === 0}>
        <p class="text-gray-500">No projects yet. Create your first project!</p>
      </Show>

      <div class="grid gap-3">
        <For each={projectStore.state.items}>
          {(project) => (
            <div
              class="cursor-pointer rounded-lg bg-white p-4 transition-all"
              classList={{
                'ring-2 ring-primary': projectStore.state.selectedId === project.id,
                'opacity-60': Boolean(project.archived_at),
              }}
              onClick={() => handleSelect(project.id)}
              data-testid={`project-${project.id}`}
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="mb-2 flex items-center gap-3">
                    <h3 class="text-lg font-semibold">{project.title}</h3>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                    <Show when={project.archived_at}>
                      <Badge variant="secondary">Archived</Badge>
                    </Show>
                  </div>
                  <Show when={project.description}>
                    <p class="mb-2 text-gray-600">{project.description}</p>
                  </Show>
                  <div class="text-sm text-gray-500">
                    <span>Goal: {getGoalName(project.goal_id)}</span>
                  </div>
                </div>
                <div class="relative">
                  <button
                    class="rounded p-2 hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Dropdown would be here in real component
                    }}
                    data-testid={`project-menu-${project.id}`}
                  >
                    •••
                  </button>
                  <Show when={!project.archived_at}>
                    <div class="actions" style={{ display: 'none' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(project);
                        }}
                        data-testid={`edit-${project.id}`}
                      >
                        Edit
                      </button>
                      <Show when={project.status !== ProjectStatus.Active}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(project.id, ProjectStatus.Active);
                          }}
                          data-testid={`status-active-${project.id}`}
                        >
                          Mark as Active
                        </button>
                      </Show>
                      <Show when={project.status !== ProjectStatus.Completed}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(project.id, ProjectStatus.Completed);
                          }}
                          data-testid={`status-completed-${project.id}`}
                        >
                          Mark as Completed
                        </button>
                      </Show>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // eslint-disable-next-line no-alert
                          if (window.confirm(`Delete "${project.title}"?`)) {
                            handleDelete(project.id);
                          }
                        }}
                        data-testid={`delete-${project.id}`}
                      >
                        Delete
                      </button>
                    </div>
                  </Show>
                  <Show when={project.archived_at}>
                    <div class="actions" style={{ display: 'none' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(project.id);
                        }}
                        data-testid={`restore-${project.id}`}
                      >
                        Restore
                      </button>
                    </div>
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

describe('ProjectList Factory', () => {
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

  describe('Rendering', () => {
    it('should render empty state when no projects', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectListTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        await waitFor(() => {
          expect(
            screen.getByText('No projects yet. Create your first project!'),
          ).toBeInTheDocument();
        });
      });
    });

    it('should render projects with status badges', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const goal = createGoal({ name: 'Build App' });
        const projects = [
          createProject({
            title: 'Planning Phase',
            status: ProjectStatus.Planning,
            goal_id: goal.id,
          }),
          createProject({
            title: 'Active Development',
            status: ProjectStatus.Active,
            goal_id: goal.id,
          }),
          createProject({
            title: 'Completed Feature',
            status: ProjectStatus.Completed,
            goal_id: goal.id,
          }),
        ];

        projectApi.project.getAll.mockResolvedValue(projects);
        goalApi.goal.getAll.mockResolvedValue([goal]);

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectListTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        await waitFor(() => {
          expect(screen.getByText('Planning Phase')).toBeInTheDocument();
          expect(screen.getByText('Planning')).toBeInTheDocument();
          expect(screen.getByText('Active Development')).toBeInTheDocument();
          expect(screen.getByText('Active')).toBeInTheDocument();
          expect(screen.getByText('Completed Feature')).toBeInTheDocument();
          expect(screen.getByText('Completed')).toBeInTheDocument();
        });
      });
    });

    it('should show archived projects with reduced opacity', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const goal = createGoal({ name: 'Test Goal' });
        const activeProject = createProject({ title: 'Active Project', goal_id: goal.id });
        const archivedProject = createArchivedProject({
          title: 'Archived Project',
          goal_id: goal.id,
        });

        projectApi.project.getAll.mockResolvedValue([activeProject, archivedProject]);
        goalApi.goal.getAll.mockResolvedValue([goal]);

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectListTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        await waitFor(() => {
          const archivedElement = screen.getByTestId(`project-${archivedProject.id}`);
          expect(archivedElement).toHaveClass('opacity-60');
          expect(screen.getByText('Archived')).toBeInTheDocument();
        });
      });
    });

    it('should display goal names for projects', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const goal = createGoal({ name: 'Learn TypeScript' });
        const project = createProject({ title: 'Setup Environment', goal_id: goal.id });

        projectApi.project.getAll.mockResolvedValue([project]);
        goalApi.goal.getAll.mockResolvedValue([goal]);

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectListTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        await waitFor(() => {
          expect(screen.getByText('Goal: Learn TypeScript')).toBeInTheDocument();
        });
      });
    });
  });

  describe('Interactions', () => {
    it('should select and deselect projects on click', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const project = createProject({ title: 'Test Project' });
        projectApi.project.getAll.mockResolvedValue([project]);

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectListTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        await waitFor(() => {
          const projectElement = screen.getByTestId(`project-${project.id}`);

          // Click to select
          fireEvent.click(projectElement);
          expect(projectElement).toHaveClass('ring-2');
          expect(projectElement).toHaveClass('ring-primary');

          // Click again to deselect
          fireEvent.click(projectElement);
          expect(projectElement).not.toHaveClass('ring-2');
        });
      });
    });

    it('should refresh projects when refresh button clicked', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectListTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        await waitFor(() => {
          const refreshButton = screen.getByText('Refresh');
          fireEvent.click(refreshButton);

          // Should call fetchAll again (once on mount, once on click)
          expect(projectApi.project.getAll).toHaveBeenCalledTimes(2);
        });
      });
    });

    it('should call onEdit when edit action is triggered', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const project = createProject({ title: 'Test Project' });
        projectApi.project.getAll.mockResolvedValue([project]);

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);
        const onEdit = vi.fn();

        renderWithProviders(() => (
          <ProjectListTestable projectStore={projectStore} goalStore={goalStore} onEdit={onEdit} />
        ));

        await waitFor(() => {
          const editButton = screen.getByTestId(`edit-${project.id}`);
          fireEvent.click(editButton);

          expect(onEdit).toHaveBeenCalledWith(project);
        });
      });
    });

    it('should update project status', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const project = createProject({ title: 'Test Project', status: ProjectStatus.Planning });
        projectApi.project.getAll.mockResolvedValue([project]);
        projectApi.project.updateStatus.mockResolvedValue({
          ...project,
          status: ProjectStatus.Active,
        });

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectListTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        await waitFor(() => {
          const activeButton = screen.getByTestId(`status-active-${project.id}`);
          fireEvent.click(activeButton);
        });

        await waitFor(() => {
          expect(projectApi.project.updateStatus).toHaveBeenCalledWith(
            project.id,
            ProjectStatus.Active,
          );
        });
      });
    });

    it('should delete project with confirmation', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const project = createProject({ title: 'Test Project' });
        projectApi.project.getAll.mockResolvedValue([project]);
        projectApi.project.delete.mockResolvedValue(undefined);

        // Mock confirm dialog
        global.confirm = vi.fn().mockReturnValue(true);

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectListTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        await waitFor(() => {
          const deleteButton = screen.getByTestId(`delete-${project.id}`);
          fireEvent.click(deleteButton);
        });

        await waitFor(() => {
          expect(global.confirm).toHaveBeenCalledWith('Delete "Test Project"?');
          expect(projectApi.project.delete).toHaveBeenCalledWith(project.id);
        });
      });
    });

    it('should restore archived project', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const archivedProject = createArchivedProject({ title: 'Archived Project' });
        projectApi.project.getAll.mockResolvedValue([archivedProject]);
        projectApi.project.restore.mockResolvedValue({
          ...archivedProject,
          archived_at: undefined,
        });

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectListTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        await waitFor(() => {
          const restoreButton = screen.getByTestId(`restore-${archivedProject.id}`);
          fireEvent.click(restoreButton);
        });

        await waitFor(() => {
          expect(projectApi.project.restore).toHaveBeenCalledWith(archivedProject.id);
        });
      });
    });

    it('should show error message when fetch fails', async () => {
      await createRoot(async (d) => {
        dispose = d;

        projectApi.project.getAll.mockRejectedValue(new Error('Network error'));

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectListTestable projectStore={projectStore} goalStore={goalStore} />
        ));

        await waitFor(() => {
          expect(screen.getByText('Failed to fetch projects')).toBeInTheDocument();
        });
      });
    });
  });
});
