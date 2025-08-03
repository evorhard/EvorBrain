import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { renderWithProviders, createTask } from '../../../test/utils';
import { For, Show, createEffect, createRoot } from 'solid-js';
import { createTaskStoreFactory, type TaskStoreInstance } from '../../../stores/taskStore.factory';
import { Badge } from '../../ui/Badge';
import { format, isPast, isToday } from 'date-fns';
import type { Task } from '../../../types/models';

// Create a test version of TaskList that accepts store as props
function TaskListTestable(props: { taskStore: TaskStoreInstance; onEdit?: (id: string) => void }) {
  const { taskStore, onEdit = vi.fn() } = props;

  // Fetch tasks on mount
  createEffect(() => {
    taskStore.actions.fetchAll();
  });

  const handleComplete = async (id: string) => {
    await taskStore.actions.complete(id);
  };

  const handleUncomplete = async (id: string) => {
    await taskStore.actions.uncomplete(id);
  };

  const handleDelete = async (id: string) => {
    await taskStore.actions.delete(id);
  };

  const handleSelect = (id: string) => {
    taskStore.actions.select(taskStore.state.selectedId === id ? null : id);
  };

  const rootTasks = () =>
    taskStore.state.items.filter((task) => !task.parent_task_id && !task.archived_at);

  const getSubtasks = (parentId: string) =>
    taskStore.state.items.filter((task) => task.parent_task_id === parentId && !task.archived_at);

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

  const formatDueDate = (date: string | null | undefined) => {
    if (!date) return null;
    const dueDate = new Date(date);
    if (isToday(dueDate)) return 'Today';
    if (isPast(dueDate)) return `${format(dueDate, 'MMM d')} (overdue)`;
    return format(dueDate, 'MMM d');
  };

  const TaskItem = (props: { task: Task; level?: number }) => {
    const task = () => props.task;
    const level = () => props.level || 0;
    const subtasks = () => getSubtasks(task().id);
    const isOverdue = () =>
      task().due_date && !task().completed_at && isPast(new Date(task().due_date));

    return (
      <div class={level() > 0 ? 'ml-8' : ''} data-testid={`task-item-${task().id}`}>
        <div
          class={taskStore.state.selectedId === task().id ? 'selected' : ''}
          onClick={() => handleSelect(task().id)}
          data-testid={`task-${task().id}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (task().completed_at) {
                handleUncomplete(task().id);
              } else {
                handleComplete(task().id);
              }
            }}
            data-testid={`task-checkbox-${task().id}`}
          >
            <Show when={task().completed_at} fallback={<span>○</span>}>
              <span>✓</span>
            </Show>
          </button>

          <div>
            <p class={task().completed_at ? 'completed' : ''}>{task().title}</p>
            <Show when={task().description}>
              <p>{task().description}</p>
            </Show>
          </div>

          <div>
            <Badge variant={getPriorityColor(task().priority)}>{task().priority}</Badge>

            <Show when={task().due_date}>
              <div class={isOverdue() ? 'overdue' : ''}>
                <span>{formatDueDate(task().due_date)}</span>
              </div>
            </Show>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task().id);
              }}
              data-testid={`task-edit-${task().id}`}
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(task().id);
              }}
              data-testid={`task-delete-${task().id}`}
            >
              Delete
            </button>
          </div>
        </div>

        <Show when={subtasks().length > 0}>
          <For each={subtasks()}>
            {(subtask) => <TaskItem task={subtask} level={level() + 1} />}
          </For>
        </Show>
      </div>
    );
  };

  return (
    <div data-testid="task-list">
      <div class="flex items-center justify-between">
        <h2>Tasks</h2>
        <button
          onClick={() => taskStore.actions.fetchAll()}
          disabled={taskStore.state.isLoading}
          data-testid="refresh-button"
        >
          {taskStore.state.isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <Show when={taskStore.state.error}>
        <div data-testid="error-message" class="error">
          Error: {taskStore.state.error}
        </div>
      </Show>

      <Show when={taskStore.state.isLoading}>
        <div data-testid="loading-message">Loading tasks...</div>
      </Show>

      <Show when={!taskStore.state.isLoading} fallback={null}>
        <Show
          when={rootTasks().length > 0}
          fallback={
            <div data-testid="empty-message">
              No tasks yet. Create your first task to get started.
            </div>
          }
        >
          <For each={rootTasks()}>{(task) => <TaskItem task={task} />}</For>
        </Show>
      </Show>
    </div>
  );
}

describe('TaskList with Factory', () => {
  let mockApi: any;
  let taskStore: TaskStoreInstance;
  let dispose: (() => void) | undefined;

  beforeEach(() => {
    // Create mock API
    mockApi = {
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
  });

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    vi.clearAllMocks();
  });

  const setup = async (initialTasks: Task[] = []) => {
    let storeInstance: TaskStoreInstance;

    // Set up the mock to return initial tasks
    mockApi.task.getAll.mockResolvedValue(initialTasks);

    const { unmount } = renderWithProviders(() =>
      createRoot((d) => {
        dispose = d;
        storeInstance = createTaskStoreFactory(mockApi);
        taskStore = storeInstance;
        return <TaskListTestable taskStore={storeInstance} />;
      }),
    );

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(mockApi.task.getAll).toHaveBeenCalled();
    });

    return { unmount, store: storeInstance };
  };

  describe('Rendering', () => {
    it('should render loading state initially', async () => {
      renderWithProviders(() =>
        createRoot((d) => {
          dispose = d;
          const storeInstance = createTaskStoreFactory(mockApi);
          taskStore = storeInstance;
          // Don't trigger fetch immediately to see loading state
          return (
            <div data-testid="task-list">
              <Show when={storeInstance.state.isLoading}>
                <div data-testid="loading-message">Loading tasks...</div>
              </Show>
            </div>
          );
        }),
      );

      // Manually trigger loading
      taskStore.actions._setState('isLoading', true);
      expect(screen.getByTestId('loading-message')).toBeTruthy();
    });

    it('should render empty state when no tasks', async () => {
      await setup([]);
      expect(screen.getByTestId('empty-message')).toBeTruthy();
    });

    it('should render tasks when available', async () => {
      const tasks = [
        createTask({ id: 'task-1', title: 'Task 1' }),
        createTask({ id: 'task-2', title: 'Task 2' }),
      ];
      await setup(tasks);

      expect(screen.getByText('Task 1')).toBeTruthy();
      expect(screen.getByText('Task 2')).toBeTruthy();
    });

    it('should render subtasks with indentation', async () => {
      const parentTask = createTask({ id: 'parent', title: 'Parent Task' });
      const subtask = createTask({
        id: 'subtask',
        title: 'Subtask',
        parent_task_id: 'parent',
      });
      await setup([parentTask, subtask]);

      expect(screen.getByText('Parent Task')).toBeTruthy();
      expect(screen.getByText('Subtask')).toBeTruthy();
      // Check that subtask is indented
      const subtaskElement = screen.getByTestId('task-item-subtask');
      expect(subtaskElement.classList.contains('ml-8')).toBe(true);
    });

    it('should not render archived tasks', async () => {
      const tasks = [
        createTask({ id: 'task-1', title: 'Active Task' }),
        createTask({ id: 'task-2', title: 'Archived Task', archived_at: new Date().toISOString() }),
      ];
      await setup(tasks);

      expect(screen.getByText('Active Task')).toBeTruthy();
      expect(screen.queryByText('Archived Task')).toBeNull();
    });
  });

  describe('Task Selection', () => {
    it('should select task on click', async () => {
      const task = createTask({ id: 'task-1', title: 'Task 1' });
      await setup([task]);

      expect(screen.getByTestId('task-task-1')).toBeTruthy();

      fireEvent.click(screen.getByTestId('task-task-1'));

      expect(taskStore.state.selectedId).toBe('task-1');
      expect(screen.getByTestId('task-task-1').classList.contains('selected')).toBe(true);
    });

    it('should deselect task when clicking again', async () => {
      const task = createTask({ id: 'task-1', title: 'Task 1' });
      await setup([task]);

      expect(screen.getByTestId('task-task-1')).toBeTruthy();

      // Select
      fireEvent.click(screen.getByTestId('task-task-1'));
      expect(taskStore.state.selectedId).toBe('task-1');

      // Deselect
      fireEvent.click(screen.getByTestId('task-task-1'));
      expect(taskStore.state.selectedId).toBeNull();
    });
  });

  describe('Task Completion', () => {
    it('should complete task when checkbox clicked', async () => {
      const task = createTask({ id: 'task-1', title: 'Task 1', completed_at: null });
      await setup([task]);

      const completedTask = { ...task, completed_at: new Date().toISOString() };
      mockApi.task.complete.mockResolvedValue(completedTask);

      expect(screen.getByTestId('task-checkbox-task-1')).toBeTruthy();

      fireEvent.click(screen.getByTestId('task-checkbox-task-1'));

      await waitFor(() => {
        expect(mockApi.task.complete).toHaveBeenCalledWith('task-1');
      });
    });

    it('should uncomplete task when completed checkbox clicked', async () => {
      const task = createTask({
        id: 'task-1',
        title: 'Task 1',
        completed_at: new Date().toISOString(),
      });
      await setup([task]);

      const uncompletedTask = { ...task, completed_at: null };
      mockApi.task.uncomplete.mockResolvedValue(uncompletedTask);

      expect(screen.getByTestId('task-checkbox-task-1')).toBeTruthy();

      fireEvent.click(screen.getByTestId('task-checkbox-task-1'));

      await waitFor(() => {
        expect(mockApi.task.uncomplete).toHaveBeenCalledWith('task-1');
      });
    });
  });

  describe('Task Actions', () => {
    it('should call onEdit when edit clicked', async () => {
      const onEdit = vi.fn();
      const task = createTask({ id: 'task-1', title: 'Task 1' });

      renderWithProviders(() =>
        createRoot((d) => {
          dispose = d;
          const storeInstance = createTaskStoreFactory(mockApi);
          taskStore = storeInstance;
          return <TaskListTestable taskStore={storeInstance} onEdit={onEdit} />;
        }),
      );

      mockApi.task.getAll.mockResolvedValue([task]);
      await taskStore.actions.fetchAll();

      await waitFor(() => {
        expect(screen.getByTestId('task-edit-task-1')).toBeTruthy();
      });

      fireEvent.click(screen.getByTestId('task-edit-task-1'));
      expect(onEdit).toHaveBeenCalledWith('task-1');
    });

    it('should delete task when delete clicked', async () => {
      const task = createTask({ id: 'task-1', title: 'Task 1' });
      await setup([task]);

      mockApi.task.delete.mockResolvedValue(undefined);
      mockApi.task.getAll.mockResolvedValue([]);

      expect(screen.getByTestId('task-delete-task-1')).toBeTruthy();

      fireEvent.click(screen.getByTestId('task-delete-task-1'));

      await waitFor(() => {
        expect(mockApi.task.delete).toHaveBeenCalledWith('task-1');
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh tasks when refresh button clicked', async () => {
      await setup([]);

      expect(screen.getByTestId('refresh-button')).toBeTruthy();

      // Reset mock call count
      mockApi.task.getAll.mockClear();

      fireEvent.click(screen.getByTestId('refresh-button'));

      await waitFor(() => {
        expect(mockApi.task.getAll).toHaveBeenCalled();
      });
    });

    it('should show loading state during refresh', async () => {
      await setup([]);

      expect(screen.getByTestId('refresh-button')).toBeTruthy();

      // Make the API call pending
      let resolvePromise: ((value: any) => void) | undefined;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApi.task.getAll.mockReturnValue(pendingPromise);

      fireEvent.click(screen.getByTestId('refresh-button'));

      // Should show loading
      expect(screen.getByText('Loading...')).toBeTruthy();

      // Resolve the promise
      resolvePromise?.([]);

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeTruthy();
      });
    });
  });

  describe('Priority Display', () => {
    it('should display task priority badges with correct variants', async () => {
      const tasks = [
        createTask({ id: 'task-1', title: 'Urgent Task', priority: 'urgent' }),
        createTask({ id: 'task-2', title: 'High Task', priority: 'high' }),
        createTask({ id: 'task-3', title: 'Medium Task', priority: 'medium' }),
        createTask({ id: 'task-4', title: 'Low Task', priority: 'low' }),
      ];
      await setup(tasks);

      expect(screen.getByText('urgent')).toBeTruthy();
      expect(screen.getByText('high')).toBeTruthy();
      expect(screen.getByText('medium')).toBeTruthy();
      expect(screen.getByText('low')).toBeTruthy();
    });
  });

  describe('Due Date Display', () => {
    it('should display "Today" for tasks due today', async () => {
      const todayTask = createTask({
        id: 'task-1',
        title: 'Today Task',
        due_date: new Date().toISOString(),
      });
      await setup([todayTask]);

      expect(screen.getByText('Today')).toBeTruthy();
    });

    it('should display overdue indication for past due dates', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const overdueTask = createTask({
        id: 'task-1',
        title: 'Overdue Task',
        due_date: yesterday.toISOString(),
        completed_at: null,
      });
      await setup([overdueTask]);

      // The formatDueDate function should add "(overdue)" to the date
      const formattedDate = format(yesterday, 'MMM d');
      await waitFor(() => {
        expect(screen.getByText(`${formattedDate} (overdue)`)).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', async () => {
      mockApi.task.getAll.mockRejectedValue(new Error('Failed to fetch'));

      renderWithProviders(() =>
        createRoot((d) => {
          dispose = d;
          const storeInstance = createTaskStoreFactory(mockApi);
          taskStore = storeInstance;
          return <TaskListTestable taskStore={storeInstance} />;
        }),
      );

      // Wait for the error to be set
      await waitFor(() => {
        expect(taskStore.state.error).toBeTruthy();
      });

      expect(screen.getByTestId('error-message')).toBeTruthy();
      expect(screen.getByText(/Failed to fetch tasks/)).toBeTruthy();
    });
  });
});
