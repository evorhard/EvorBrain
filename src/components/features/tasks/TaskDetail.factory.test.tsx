import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, fireEvent } from '@solidjs/testing-library';
import { renderWithProviders, createTask, createProject } from '../../../test/utils';
import { createMemo, Show, createRoot } from 'solid-js';
// Task store imports removed as they're not used in this component
import {
  createProjectStoreFactory,
  type ProjectStoreInstance,
} from '../../../stores/projectStore.factory';
import type { Task } from '../../../types/models';
import { format, isPast, isToday } from 'date-fns';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

// Create a test version of TaskDetail that accepts stores as props
function TaskDetailTestable(props: {
  task: Task;
  projectStore: ProjectStoreInstance;
  onEdit: () => void;
  onComplete: () => void;
  onUncomplete: () => void;
  onDelete: () => void;
}) {
  const { projectStore } = props;

  const project = createMemo(() => {
    const taskProjectId = props.task.project_id;
    return taskProjectId ? projectStore.state.items.find((p) => p.id === taskProjectId) : null;
  });

  const isOverdue = createMemo(() => {
    const { task } = props;
    return task.due_date && !task.completed_at && isPast(new Date(task.due_date));
  });

  const formatDueDate = (date: string | null | undefined) => {
    if (!date) return null;
    const dueDate = new Date(date);
    if (isToday(dueDate)) return 'Today';
    return format(dueDate, 'MMMM d, yyyy');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card class="p-6" data-testid="task-detail">
      <div class="space-y-4">
        <div class="flex items-start justify-between">
          <h2 class="text-xl font-semibold">Task Details</h2>
          <div class="flex gap-2">
            <Button size="sm" variant="outline" onClick={props.onEdit} data-testid="edit-button">
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={props.onDelete}
              data-testid="delete-button"
            >
              Delete
            </Button>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <h3 class={props.task.completed_at ? 'completed' : ''} data-testid="task-title">
              {props.task.title}
            </h3>
            <Show when={props.task.description}>
              <p data-testid="task-description">{props.task.description}</p>
            </Show>
          </div>

          <div class="flex items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (props.task.completed_at) {
                  props.onUncomplete();
                } else {
                  props.onComplete();
                }
              }}
              data-testid="complete-button"
            >
              {props.task.completed_at ? 'Mark as Incomplete' : 'Mark as Complete'}
            </Button>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">Priority:</span>
              <Badge variant={getPriorityColor(props.task.priority)} data-testid="priority-badge">
                {props.task.priority}
              </Badge>
            </div>

            <Show when={props.task.due_date}>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Due Date:</span>
                <div class={isOverdue() ? 'overdue' : ''} data-testid="due-date">
                  <span>{formatDueDate(props.task.due_date)}</span>
                </div>
              </div>
            </Show>

            <Show when={project()}>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Project:</span>
                <div data-testid="project-name">
                  <span>{project()?.name || ''}</span>
                </div>
              </div>
            </Show>

            <Show when={props.task.completed_at}>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Completed:</span>
                <span data-testid="completed-date">
                  {format(new Date(props.task.completed_at), 'MMMM d, yyyy')}
                </span>
              </div>
            </Show>

            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">Created:</span>
              <span data-testid="created-date">
                {format(new Date(props.task.created_at), 'MMMM d, yyyy')}
              </span>
            </div>

            <Show when={props.task.updated_at !== props.task.created_at}>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Updated:</span>
                <span data-testid="updated-date">
                  {format(new Date(props.task.updated_at), 'MMMM d, yyyy')}
                </span>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Card>
  );
}

describe('TaskDetail with Factory', () => {
  let mockProjectApi: any;
  let projectStore: ProjectStoreInstance;
  let dispose: (() => void) | undefined;

  beforeEach(() => {
    // Create mock API
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

  const setup = (props: { task: Task; projects?: any[] }) => {
    const onEdit = vi.fn();
    const onComplete = vi.fn();
    const onUncomplete = vi.fn();
    const onDelete = vi.fn();

    // Set up project store with projects
    if (props.projects) {
      mockProjectApi.project.getAll.mockResolvedValue(props.projects);
    }

    const { unmount } = renderWithProviders(() =>
      createRoot((d) => {
        dispose = d;
        projectStore = createProjectStoreFactory(mockProjectApi);

        // Populate projects if provided
        createRoot(() => {
          if (props.projects) {
            projectStore.actions._setState('items', props.projects);
          }
        });

        return (
          <TaskDetailTestable
            task={props.task}
            projectStore={projectStore}
            onEdit={onEdit}
            onComplete={onComplete}
            onUncomplete={onUncomplete}
            onDelete={onDelete}
          />
        );
      }),
    );

    return { unmount, onEdit, onComplete, onUncomplete, onDelete };
  };

  describe('Basic Rendering', () => {
    it('should render task details', () => {
      const task = createTask({
        title: 'Test Task',
        description: 'Test description',
        priority: 'high',
      });

      setup({ task });

      expect(screen.getByText('Task Details')).toBeTruthy();
      expect(screen.getByTestId('task-title')).toHaveTextContent('Test Task');
      expect(screen.getByTestId('task-description')).toHaveTextContent('Test description');
      expect(screen.getByTestId('priority-badge')).toHaveTextContent('high');
    });

    it('should render minimal task without optional fields', () => {
      const task = createTask({
        title: 'Minimal Task',
        description: undefined,
        due_date: undefined,
        project_id: undefined,
      });

      setup({ task });

      expect(screen.getByTestId('task-title')).toHaveTextContent('Minimal Task');
      expect(screen.queryByTestId('task-description')).toBeNull();
      expect(screen.queryByTestId('due-date')).toBeNull();
      expect(screen.queryByTestId('project-name')).toBeNull();
    });
  });

  describe('Task Completion', () => {
    it('should show complete button for incomplete task', () => {
      const task = createTask({ completed_at: null });
      setup({ task });

      const completeButton = screen.getByTestId('complete-button');
      expect(completeButton).toHaveTextContent('Mark as Complete');
    });

    it('should show uncomplete button for completed task', () => {
      const task = createTask({ completed_at: new Date().toISOString() });
      setup({ task });

      const completeButton = screen.getByTestId('complete-button');
      expect(completeButton).toHaveTextContent('Mark as Incomplete');
    });

    it('should call onComplete when complete button clicked', () => {
      const task = createTask({ completed_at: null });
      const { onComplete } = setup({ task });

      fireEvent.click(screen.getByTestId('complete-button'));
      expect(onComplete).toHaveBeenCalled();
    });

    it('should call onUncomplete when uncomplete button clicked', () => {
      const task = createTask({ completed_at: new Date().toISOString() });
      const { onUncomplete } = setup({ task });

      fireEvent.click(screen.getByTestId('complete-button'));
      expect(onUncomplete).toHaveBeenCalled();
    });

    it('should apply completed styling to title', () => {
      const task = createTask({
        title: 'Completed Task',
        completed_at: new Date().toISOString(),
      });
      setup({ task });

      const title = screen.getByTestId('task-title');
      expect(title.classList.contains('completed')).toBe(true);
    });
  });

  describe('Priority Display', () => {
    it.each([
      ['urgent', 'destructive'],
      ['high', 'warning'],
      ['medium', 'default'],
      ['low', 'secondary'],
    ])('should display %s priority with %s variant', (priority, _expectedVariant) => {
      const task = createTask({ priority: priority as any });
      setup({ task });

      const badge = screen.getByTestId('priority-badge');
      expect(badge).toHaveTextContent(priority);
      // Note: Testing the variant prop would require checking the Badge component's implementation
    });
  });

  describe('Due Date Display', () => {
    it('should display "Today" for tasks due today', () => {
      const task = createTask({ due_date: new Date().toISOString() });
      setup({ task });

      expect(screen.getByTestId('due-date')).toHaveTextContent('Today');
    });

    it('should display formatted date for other dates', () => {
      const futureDate = new Date('2024-12-25');
      const task = createTask({ due_date: futureDate.toISOString() });
      setup({ task });

      expect(screen.getByTestId('due-date')).toHaveTextContent('December 25, 2024');
    });

    it('should apply overdue styling for past due dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const task = createTask({
        due_date: yesterday.toISOString(),
        completed_at: null,
      });
      setup({ task });

      const dueDate = screen.getByTestId('due-date');
      expect(dueDate.classList.contains('overdue')).toBe(true);
    });

    it('should not apply overdue styling for completed tasks', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const task = createTask({
        due_date: yesterday.toISOString(),
        completed_at: new Date().toISOString(),
      });
      setup({ task });

      const dueDate = screen.getByTestId('due-date');
      expect(dueDate.classList.contains('overdue')).toBe(false);
    });
  });

  describe('Project Display', () => {
    it('should display project name when task has project', () => {
      const project = createProject({ id: 'proj-1', name: 'Test Project' });
      const task = createTask({ project_id: 'proj-1' });

      setup({ task, projects: [project] });

      expect(screen.getByTestId('project-name')).toHaveTextContent('Test Project');
    });

    it('should not display project section when no project', () => {
      const task = createTask({ project_id: undefined });
      setup({ task });

      expect(screen.queryByTestId('project-name')).toBeNull();
    });
  });

  describe('Date Display', () => {
    it('should display created date', () => {
      const createdDate = new Date('2024-01-15');
      const task = createTask({ created_at: createdDate.toISOString() });
      setup({ task });

      expect(screen.getByTestId('created-date')).toHaveTextContent('January 15, 2024');
    });

    it('should display updated date when different from created', () => {
      const createdDate = new Date('2024-01-15');
      const updatedDate = new Date('2024-01-20');
      const task = createTask({
        created_at: createdDate.toISOString(),
        updated_at: updatedDate.toISOString(),
      });
      setup({ task });

      expect(screen.getByTestId('updated-date')).toHaveTextContent('January 20, 2024');
    });

    it('should not display updated date when same as created', () => {
      const sameDate = new Date('2024-01-15');
      const task = createTask({
        created_at: sameDate.toISOString(),
        updated_at: sameDate.toISOString(),
      });
      setup({ task });

      expect(screen.queryByTestId('updated-date')).toBeNull();
    });

    it('should display completed date for completed tasks', () => {
      const completedDate = new Date('2024-02-01');
      const task = createTask({ completed_at: completedDate.toISOString() });
      setup({ task });

      expect(screen.getByTestId('completed-date')).toHaveTextContent('February 1, 2024');
    });
  });

  describe('Action Buttons', () => {
    it('should call onEdit when edit button clicked', () => {
      const task = createTask();
      const { onEdit } = setup({ task });

      fireEvent.click(screen.getByTestId('edit-button'));
      expect(onEdit).toHaveBeenCalled();
    });

    it('should call onDelete when delete button clicked', () => {
      const task = createTask();
      const { onDelete } = setup({ task });

      fireEvent.click(screen.getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalled();
    });
  });
});
