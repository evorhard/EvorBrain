import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { renderWithProviders, createProject, createGoal } from '../../../test/utils';
import { createSignal, createEffect, Show, For, createRoot } from 'solid-js';
import {
  createProjectStoreFactory,
  type ProjectStoreInstance,
} from '../../../stores/projectStore.factory';
import {
  createGoalStoreFactory,
  type GoalStoreInstance,
} from '../../../stores/goalStore.factory';
import { ProjectStatus } from '../../../types/models';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Select } from '../../ui/SelectHtml';
import { Button } from '../../ui/Button';
import { Label } from '../../ui/Label';

// Create a test version of ProjectForm that accepts stores as props
function ProjectFormTestable(props: {
  projectStore: ProjectStoreInstance;
  goalStore: GoalStoreInstance;
  project?: any;
  onClose: () => void;
}) {
  const { projectStore, goalStore } = props;

  const [goalId, setGoalId] = createSignal('');
  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [status, setStatus] = createSignal<ProjectStatus>(ProjectStatus.Planning);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Initialize form values and fetch goals on mount
  createEffect(() => {
    goalStore.actions.fetchAll();

    // Initialize form values from props
    if (props.project) {
      setGoalId(props.project.goal_id);
      setTitle(props.project.title);
      setDescription(props.project.description || '');
      setStatus(props.project.status);
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    if (!goalId()) {
      setError('Please select a goal');
      return;
    }

    if (!title().trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (props.project) {
        // Update existing project
        await projectStore.actions.update(props.project.id, {
          title: title().trim(),
          description: description().trim() || undefined,
          status: status(),
        });
      } else {
        // Create new project
        await projectStore.actions.create({
          goal_id: goalId(),
          title: title().trim(),
          description: description().trim() || undefined,
          status: status(),
        });
      }
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeGoals = () => goalStore.state.items.filter((goal) => !goal.archived_at);

  const statusOptions: { value: ProjectStatus; label: string }[] = [
    { value: ProjectStatus.Planning, label: 'Planning' },
    { value: ProjectStatus.Active, label: 'Active' },
    { value: ProjectStatus.Completed, label: 'Completed' },
    { value: ProjectStatus.OnHold, label: 'On Hold' },
    { value: ProjectStatus.Cancelled, label: 'Cancelled' },
  ];

  return (
    <form onSubmit={handleSubmit} class="space-y-4" data-testid="project-form">
      <Show when={error()}>
        <div class="bg-red-50 p-3 text-red-600" data-testid="error-message">
          {error()}
        </div>
      </Show>

      <div>
        <Label for="goal">Goal</Label>
        <Select
          id="goal"
          value={goalId()}
          onChange={(e: any) => setGoalId(typeof e === 'string' ? e : e.target.value)}
          disabled={isSubmitting()}
          required
          data-testid="goal-select"
        >
          <option value="">Select a goal...</option>
          <For each={activeGoals()}>
            {(goal) => <option value={goal.id}>{goal.name}</option>}
          </For>
        </Select>
      </div>

      <div>
        <Label for="title">Title</Label>
        <Input
          id="title"
          type="text"
          value={title()}
          onInput={(e) => setTitle(e.currentTarget.value)}
          placeholder="Enter project title"
          disabled={isSubmitting()}
          required
          data-testid="title-input"
        />
      </div>

      <div>
        <Label for="description">Description</Label>
        <Textarea
          id="description"
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          placeholder="Enter project description (optional)"
          rows={3}
          disabled={isSubmitting()}
          data-testid="description-textarea"
        />
      </div>

      <div>
        <Label for="status">Status</Label>
        <Select
          id="status"
          value={status()}
          onChange={(e: any) => setStatus((typeof e === 'string' ? e : e.target.value) as ProjectStatus)}
          disabled={isSubmitting()}
          data-testid="status-select"
        >
          <For each={statusOptions}>
            {(option) => <option value={option.value}>{option.label}</option>}
          </For>
        </Select>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={props.onClose}
          disabled={isSubmitting()}
          data-testid="cancel-button"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting()} data-testid="submit-button">
          {isSubmitting() ? 'Saving...' : props.project ? 'Update' : 'Create'} Project
        </Button>
      </div>
    </form>
  );
}

describe('ProjectForm Factory', () => {
  let projectApi: any;
  let goalApi: any;
  let dispose: (() => void) | undefined;
  let onClose: () => void;

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

    onClose = vi.fn();
  });

  afterEach(() => {
    dispose?.();
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render form with empty fields', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const goals = [
          createGoal({ name: 'Goal 1' }),
          createGoal({ name: 'Goal 2' }),
        ];
        goalApi.goal.getAll.mockResolvedValue(goals);

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectFormTestable
            projectStore={projectStore}
            goalStore={goalStore}
            onClose={onClose}
          />
        ));

        await waitFor(() => {
          expect(screen.getByTestId('title-input')).toHaveValue('');
          expect(screen.getByTestId('description-textarea')).toHaveValue('');
          expect(screen.getByTestId('goal-select')).toHaveValue('');
          expect(screen.getByTestId('status-select')).toHaveValue(ProjectStatus.Planning);
          expect(screen.getByTestId('submit-button')).toHaveTextContent('Create Project');
        });
      });
    });

    it('should populate goal dropdown with active goals', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const activeGoal = createGoal({ name: 'Active Goal' });
        const archivedGoal = createGoal({ name: 'Archived Goal', archived_at: '2024-01-01' });
        goalApi.goal.getAll.mockResolvedValue([activeGoal, archivedGoal]);

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectFormTestable
            projectStore={projectStore}
            goalStore={goalStore}
            onClose={onClose}
          />
        ));

        await waitFor(() => {
          const goalSelect = screen.getByTestId('goal-select');
          expect(goalSelect).toContainHTML('Active Goal');
          expect(goalSelect).not.toContainHTML('Archived Goal');
        });
      });
    });

    it('should validate required fields', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectFormTestable
            projectStore={projectStore}
            goalStore={goalStore}
            onClose={onClose}
          />
        ));

        // Submit without filling required fields
        const form = screen.getByTestId('project-form');
        fireEvent.submit(form);

        await waitFor(() => {
          expect(screen.getByTestId('error-message')).toHaveTextContent('Please select a goal');
        });

        // Select a goal but leave title empty
        const goalSelect = screen.getByTestId('goal-select');
        fireEvent.change(goalSelect, { target: { value: 'goal-1' } });
        fireEvent.submit(form);

        await waitFor(() => {
          expect(screen.getByTestId('error-message')).toHaveTextContent('Title is required');
        });
      });
    });

    it('should create project successfully', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const goal = createGoal({ name: 'Test Goal' });
        goalApi.goal.getAll.mockResolvedValue([goal]);

        const newProject = createProject({
          goal_id: goal.id,
          title: 'New Project',
          description: 'Test description',
          status: ProjectStatus.Active,
        });
        projectApi.project.create.mockResolvedValue(newProject);

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectFormTestable
            projectStore={projectStore}
            goalStore={goalStore}
            onClose={onClose}
          />
        ));

        await waitFor(() => {
          // Fill out form
          fireEvent.change(screen.getByTestId('goal-select'), {
            target: { value: goal.id },
          });
          fireEvent.input(screen.getByTestId('title-input'), {
            target: { value: 'New Project' },
          });
          fireEvent.input(screen.getByTestId('description-textarea'), {
            target: { value: 'Test description' },
          });
          fireEvent.change(screen.getByTestId('status-select'), {
            target: { value: ProjectStatus.Active },
          });
        });

        // Submit form
        const form = screen.getByTestId('project-form');
        fireEvent.submit(form);

        await waitFor(() => {
          expect(projectApi.project.create).toHaveBeenCalledWith({
            goal_id: goal.id,
            title: 'New Project',
            description: 'Test description',
            status: ProjectStatus.Active,
          });
          expect(onClose).toHaveBeenCalled();
        });
      });
    });

    it('should handle creation errors', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const goal = createGoal({ name: 'Test Goal' });
        goalApi.goal.getAll.mockResolvedValue([goal]);
        projectApi.project.create.mockRejectedValue(new Error('Creation failed'));

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectFormTestable
            projectStore={projectStore}
            goalStore={goalStore}
            onClose={onClose}
          />
        ));

        await waitFor(() => {
          fireEvent.change(screen.getByTestId('goal-select'), {
            target: { value: goal.id },
          });
          fireEvent.input(screen.getByTestId('title-input'), {
            target: { value: 'New Project' },
          });
        });

        const form = screen.getByTestId('project-form');
        fireEvent.submit(form);

        await waitFor(() => {
          expect(screen.getByTestId('error-message')).toHaveTextContent('Creation failed');
          expect(onClose).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('Edit Mode', () => {
    it('should populate form with existing project data', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const goal = createGoal({ name: 'Test Goal' });
        const project = createProject({
          title: 'Existing Project',
          description: 'Existing description',
          goal_id: goal.id,
          status: ProjectStatus.Active,
        });

        goalApi.goal.getAll.mockResolvedValue([goal]);

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectFormTestable
            projectStore={projectStore}
            goalStore={goalStore}
            project={project}
            onClose={onClose}
          />
        ));

        await waitFor(() => {
          expect(screen.getByTestId('title-input')).toHaveValue('Existing Project');
          expect(screen.getByTestId('description-textarea')).toHaveValue('Existing description');
          expect(screen.getByTestId('goal-select')).toHaveValue(goal.id);
          expect(screen.getByTestId('status-select')).toHaveValue(ProjectStatus.Active);
          expect(screen.getByTestId('submit-button')).toHaveTextContent('Update Project');
        });
      });
    });

    it('should update project successfully', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const goal = createGoal({ name: 'Test Goal' });
        const project = createProject({
          title: 'Original Title',
          goal_id: goal.id,
          status: ProjectStatus.Planning,
        });

        goalApi.goal.getAll.mockResolvedValue([goal]);
        projectApi.project.update.mockResolvedValue({
          ...project,
          title: 'Updated Title',
          status: ProjectStatus.Active,
        });

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectFormTestable
            projectStore={projectStore}
            goalStore={goalStore}
            project={project}
            onClose={onClose}
          />
        ));

        await waitFor(() => {
          // Update fields
          fireEvent.input(screen.getByTestId('title-input'), {
            target: { value: 'Updated Title' },
          });
          fireEvent.change(screen.getByTestId('status-select'), {
            target: { value: ProjectStatus.Active },
          });
        });

        // Submit form
        const form = screen.getByTestId('project-form');
        fireEvent.submit(form);

        await waitFor(() => {
          expect(projectApi.project.update).toHaveBeenCalledWith(project.id, {
            title: 'Updated Title',
            description: undefined,
            status: ProjectStatus.Active,
          });
          expect(onClose).toHaveBeenCalled();
        });
      });
    });
  });

  describe('Form Interactions', () => {
    it('should disable fields while submitting', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const goal = createGoal({ name: 'Test Goal' });
        goalApi.goal.getAll.mockResolvedValue([goal]);

        // Mock a slow API call
        projectApi.project.create.mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectFormTestable
            projectStore={projectStore}
            goalStore={goalStore}
            onClose={onClose}
          />
        ));

        await waitFor(() => {
          fireEvent.change(screen.getByTestId('goal-select'), {
            target: { value: goal.id },
          });
          fireEvent.input(screen.getByTestId('title-input'), {
            target: { value: 'New Project' },
          });
        });

        const form = screen.getByTestId('project-form');
        fireEvent.submit(form);

        await waitFor(() => {
          expect(screen.getByTestId('title-input')).toBeDisabled();
          expect(screen.getByTestId('description-textarea')).toBeDisabled();
          expect(screen.getByTestId('goal-select')).toBeDisabled();
          expect(screen.getByTestId('status-select')).toBeDisabled();
          expect(screen.getByTestId('submit-button')).toHaveTextContent('Saving...');
        });
      });
    });

    it('should call onClose when cancel button clicked', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectFormTestable
            projectStore={projectStore}
            goalStore={goalStore}
            onClose={onClose}
          />
        ));

        fireEvent.click(screen.getByTestId('cancel-button'));

        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should trim whitespace from input values', async () => {
      await createRoot(async (d) => {
        dispose = d;

        const goal = createGoal({ name: 'Test Goal' });
        goalApi.goal.getAll.mockResolvedValue([goal]);
        projectApi.project.create.mockResolvedValue(
          createProject({ title: 'Trimmed Title' })
        );

        const projectStore = createProjectStoreFactory(projectApi);
        const goalStore = createGoalStoreFactory(goalApi);

        renderWithProviders(() => (
          <ProjectFormTestable
            projectStore={projectStore}
            goalStore={goalStore}
            onClose={onClose}
          />
        ));

        await waitFor(() => {
          fireEvent.change(screen.getByTestId('goal-select'), {
            target: { value: goal.id },
          });
          fireEvent.input(screen.getByTestId('title-input'), {
            target: { value: '  Trimmed Title  ' },
          });
          fireEvent.input(screen.getByTestId('description-textarea'), {
            target: { value: '  Trimmed Description  ' },
          });
        });

        const form = screen.getByTestId('project-form');
        fireEvent.submit(form);

        await waitFor(() => {
          expect(projectApi.project.create).toHaveBeenCalledWith({
            goal_id: goal.id,
            title: 'Trimmed Title',
            description: 'Trimmed Description',
            status: ProjectStatus.Planning,
          });
        });
      });
    });
  });
});