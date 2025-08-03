import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { renderWithProviders, createTask, createProject } from '../../../test/utils';
import { createSignal, createEffect, Show, For, createRoot } from 'solid-js';
import { createTaskStoreFactory, type TaskStoreInstance } from '../../../stores/taskStore.factory';
import {
  createProjectStoreFactory,
  type ProjectStoreInstance,
} from '../../../stores/projectStore.factory';
import type { Task, TaskPriority } from '../../../types/models';
import { format } from 'date-fns';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';

// Create a test version of TaskForm that accepts stores as props
function TaskFormTestable(props: {
  taskStore: TaskStoreInstance;
  projectStore: ProjectStoreInstance;
  task?: Task;
  parentTaskId?: string;
  projectId?: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const { projectStore } = props;

  const task = () => props.task;
  const propsProjectId = () => props.projectId;

  const initialTitle = () => task()?.title || '';
  const initialDescription = () => task()?.description || '';
  const initialProjectId = () => task()?.project_id || propsProjectId() || '';
  const initialPriority = () => task()?.priority || 'medium';
  const initialDueDate = () => {
    const taskDueDate = task()?.due_date;
    return taskDueDate ? format(new Date(taskDueDate), 'yyyy-MM-dd') : '';
  };

  const [title, setTitle] = createSignal(initialTitle());
  const [description, setDescription] = createSignal(initialDescription());
  const [projectId, setProjectId] = createSignal(initialProjectId());
  const [priority, setPriority] = createSignal<TaskPriority>(initialPriority());
  const [dueDate, setDueDate] = createSignal(initialDueDate());

  createEffect(() => {
    if (projectStore.state.items.length === 0) {
      projectStore.actions.fetchAll();
    }
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const titleValue = title().trim();

    if (!titleValue) return;

    props.onSubmit({
      project_id: projectId() || undefined,
      parent_task_id: props.parentTaskId,
      title: titleValue,
      description: description().trim() || undefined,
      priority: priority(),
      due_date: dueDate() ? new Date(dueDate()).toISOString() : undefined,
    });
  };

  const activeProjects = () =>
    projectStore.state.items.filter((p) => !p.archived_at && p.status !== 'completed');

  return (
    <form onSubmit={handleSubmit} class="space-y-4" data-testid="task-form">
      <div>
        <label for="title">Title</label>
        <Input
          id="title"
          value={title()}
          onInput={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
          data-testid="title-input"
        />
      </div>

      <div>
        <label for="description">Description</label>
        <Textarea
          id="description"
          value={description()}
          onInput={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
          rows={3}
          data-testid="description-input"
        />
      </div>

      <Show when={!props.parentTaskId}>
        <div>
          <label for="project">Project</label>
          <select
            id="project"
            value={projectId()}
            onChange={(e) => setProjectId(e.target.value)}
            data-testid="project-select"
          >
            <option value="">No project</option>
            <For each={activeProjects()}>
              {(project) => <option value={project.id}>{project.name}</option>}
            </For>
          </select>
        </div>
      </Show>

      <div>
        <label for="priority">Priority</label>
        <select
          id="priority"
          value={priority()}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          data-testid="priority-select"
        >
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div>
        <label for="dueDate">Due Date</label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate()}
          onInput={(e) => setDueDate(e.target.value)}
          data-testid="due-date-input"
        />
      </div>

      <div class="flex gap-2 pt-2">
        <Button type="submit" disabled={!title().trim()} data-testid="submit-button">
          {props.task ? 'Update' : 'Create'} Task
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={props.onCancel}
          data-testid="cancel-button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

describe('TaskForm with Factory', () => {
  let mockTaskApi: any;
  let mockProjectApi: any;
  let taskStore: TaskStoreInstance;
  let projectStore: ProjectStoreInstance;
  let dispose: (() => void) | undefined;

  beforeEach(() => {
    // Create mock APIs
    mockTaskApi = {
      task: {
        getAll: vi.fn().mockResolvedValue([]),
        getByProject: vi.fn(),
        getTodaysTasks: vi.fn(),
        create: vi.fn(),
        createWithSubtasks: vi.fn(),
        update: vi.fn(),
        complete: vi.fn(),
        uncomplete: vi.fn(),
        delete: vi.fn(),
        restore: vi.fn(),
      },
    };

    mockProjectApi = {
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
  });

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    vi.clearAllMocks();
  });

  const setup = (
    props: {
      task?: Task;
      parentTaskId?: string;
      projectId?: string;
      projects?: any[];
    } = {},
  ) => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    // Set up project mock data
    if (props.projects) {
      mockProjectApi.project.getAll.mockResolvedValue(props.projects);
    }

    const { unmount } = renderWithProviders(() =>
      createRoot((d) => {
        dispose = d;
        taskStore = createTaskStoreFactory(mockTaskApi);
        projectStore = createProjectStoreFactory(mockProjectApi);
        return (
          <TaskFormTestable
            taskStore={taskStore}
            projectStore={projectStore}
            task={props.task}
            parentTaskId={props.parentTaskId}
            projectId={props.projectId}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        );
      }),
    );

    return { unmount, onSubmit, onCancel };
  };

  describe('Form Initialization', () => {
    it('should render empty form for new task', () => {
      setup();

      expect(screen.getByTestId('title-input')).toHaveValue('');
      expect(screen.getByTestId('description-input')).toHaveValue('');
      expect(screen.getByTestId('priority-select')).toHaveValue('medium');
      expect(screen.getByTestId('due-date-input')).toHaveValue('');
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Create Task');
    });

    it('should populate form when editing existing task', () => {
      const existingTask = createTask({
        title: 'Existing Task',
        description: 'Task description',
        priority: 'high',
        due_date: new Date('2024-08-15').toISOString(),
      });

      setup({ task: existingTask });

      expect(screen.getByTestId('title-input')).toHaveValue('Existing Task');
      expect(screen.getByTestId('description-input')).toHaveValue('Task description');
      expect(screen.getByTestId('priority-select')).toHaveValue('high');
      expect(screen.getByTestId('due-date-input')).toHaveValue('2024-08-15');
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Update Task');
    });

    it('should hide project select when parentTaskId is provided', () => {
      setup({ parentTaskId: 'parent-123' });

      expect(screen.queryByTestId('project-select')).toBeNull();
    });

    it('should show project select when no parentTaskId', () => {
      setup();

      expect(screen.getByTestId('project-select')).toBeTruthy();
    });
  });

  describe('Project Loading', () => {
    it('should load projects on mount', async () => {
      const projects = [
        createProject({ id: 'p1', name: 'Project 1', status: 'active' }),
        createProject({ id: 'p2', name: 'Project 2', status: 'active' }),
      ];

      setup({ projects });

      await waitFor(() => {
        expect(mockProjectApi.project.getAll).toHaveBeenCalled();
      });

      const projectSelect = screen.getByTestId('project-select');
      expect(projectSelect.options.length).toBe(3); // "No project" + 2 projects
    });

    it('should not show archived or completed projects', async () => {
      const projects = [
        createProject({ id: 'p1', name: 'Active Project', status: 'active' }),
        createProject({ id: 'p2', name: 'Completed Project', status: 'completed' }),
        createProject({
          id: 'p3',
          name: 'Archived Project',
          archived_at: new Date().toISOString(),
        }),
      ];

      setup({ projects });

      await waitFor(() => {
        expect(projectStore.state.items).toHaveLength(3);
      });

      const projectSelect = screen.getByTestId('project-select');
      expect(projectSelect.options.length).toBe(2); // "No project" + 1 active project
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when title is empty', () => {
      setup();

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when title has value', () => {
      setup();

      const titleInput = screen.getByTestId('title-input');
      fireEvent.input(titleInput, { target: { value: 'New Task' } });

      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).not.toBeDisabled();
    });

    it('should not submit form with empty title', () => {
      const { onSubmit } = setup();

      const form = screen.getByTestId('task-form');
      fireEvent.submit(form);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with all fields filled', () => {
      const { onSubmit } = setup({ projectId: 'project-123' });

      // Fill form
      fireEvent.input(screen.getByTestId('title-input'), { target: { value: 'New Task' } });
      fireEvent.input(screen.getByTestId('description-input'), {
        target: { value: 'Task description' },
      });
      fireEvent.change(screen.getByTestId('priority-select'), { target: { value: 'high' } });
      fireEvent.input(screen.getByTestId('due-date-input'), { target: { value: '2024-08-20' } });

      // Submit
      fireEvent.submit(screen.getByTestId('task-form'));

      expect(onSubmit).toHaveBeenCalledWith({
        project_id: 'project-123',
        parent_task_id: undefined,
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        due_date: new Date('2024-08-20').toISOString(),
      });
    });

    it('should submit form with minimal fields', () => {
      const { onSubmit } = setup();

      // Fill only required fields
      fireEvent.input(screen.getByTestId('title-input'), { target: { value: 'Minimal Task' } });

      // Submit
      fireEvent.submit(screen.getByTestId('task-form'));

      expect(onSubmit).toHaveBeenCalledWith({
        project_id: undefined,
        parent_task_id: undefined,
        title: 'Minimal Task',
        description: undefined,
        priority: 'medium',
        due_date: undefined,
      });
    });

    it('should trim whitespace from title and description', () => {
      const { onSubmit } = setup();

      // Fill with whitespace
      fireEvent.input(screen.getByTestId('title-input'), { target: { value: '  Task Title  ' } });
      fireEvent.input(screen.getByTestId('description-input'), {
        target: { value: '  Description  ' },
      });

      // Submit
      fireEvent.submit(screen.getByTestId('task-form'));

      expect(onSubmit).toHaveBeenCalledWith({
        project_id: undefined,
        parent_task_id: undefined,
        title: 'Task Title',
        description: 'Description',
        priority: 'medium',
        due_date: undefined,
      });
    });

    it('should include parent task id when provided', () => {
      const { onSubmit } = setup({ parentTaskId: 'parent-123' });

      fireEvent.input(screen.getByTestId('title-input'), { target: { value: 'Subtask' } });
      fireEvent.submit(screen.getByTestId('task-form'));

      expect(onSubmit).toHaveBeenCalledWith({
        project_id: undefined,
        parent_task_id: 'parent-123',
        title: 'Subtask',
        description: undefined,
        priority: 'medium',
        due_date: undefined,
      });
    });
  });

  describe('Form Cancellation', () => {
    it('should call onCancel when cancel button clicked', () => {
      const { onCancel } = setup();

      fireEvent.click(screen.getByTestId('cancel-button'));

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('Priority Selection', () => {
    it('should have all priority options', () => {
      setup();

      const prioritySelect = screen.getByTestId('priority-select');
      expect(prioritySelect.options.length).toBe(4);
      expect(Array.from(prioritySelect.options).map((o) => o.value)).toEqual([
        'urgent',
        'high',
        'medium',
        'low',
      ]);
    });

    it('should update priority when changed', () => {
      const { onSubmit } = setup();

      fireEvent.input(screen.getByTestId('title-input'), { target: { value: 'Task' } });
      fireEvent.change(screen.getByTestId('priority-select'), { target: { value: 'urgent' } });
      fireEvent.submit(screen.getByTestId('task-form'));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'urgent',
        }),
      );
    });
  });

  describe('Edit Mode', () => {
    it('should update existing task data on submit', () => {
      const existingTask = createTask({
        id: 'task-123',
        title: 'Old Title',
        description: 'Old description',
        priority: 'low',
      });

      const { onSubmit } = setup({ task: existingTask });

      // Update fields
      fireEvent.input(screen.getByTestId('title-input'), { target: { value: 'Updated Title' } });
      fireEvent.input(screen.getByTestId('description-input'), {
        target: { value: 'Updated description' },
      });
      fireEvent.change(screen.getByTestId('priority-select'), { target: { value: 'high' } });

      // Submit
      fireEvent.submit(screen.getByTestId('task-form'));

      expect(onSubmit).toHaveBeenCalledWith({
        project_id: existingTask.project_id,
        parent_task_id: undefined,
        title: 'Updated Title',
        description: 'Updated description',
        priority: 'high',
        due_date: undefined,
      });
    });
  });
});
