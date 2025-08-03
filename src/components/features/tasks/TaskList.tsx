import { type Component, For, Show, createMemo } from 'solid-js';
import type { Task } from '../../../types/models';
import {
  CheckCircle2,
  Circle,
  Calendar,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit,
} from 'lucide-solid';
import { cn } from '../../../utils/cn';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/DropdownMenu';
import { format, isPast, isToday } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskList: Component<TaskListProps> = (props) => {
  const rootTasks = createMemo(() =>
    props.tasks.filter((task) => !task.parent_task_id && !task.archived_at),
  );

  const getSubtasks = (parentId: string) =>
    props.tasks.filter((task) => task.parent_task_id === parentId && !task.archived_at);

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
    if (isPast(dueDate)) return format(dueDate, 'MMM d (overdue)');
    return format(dueDate, 'MMM d');
  };

  const TaskItem: Component<{ task: Task; level?: number }> = (itemProps) => {
    const task = () => itemProps.task;
    const level = () => itemProps.level || 0;
    const subtasks = createMemo(() => getSubtasks(task().id));
    const isOverdue = createMemo(
      () => task().due_date && !task().completed_at && isPast(new Date(task().due_date)),
    );

    return (
      <div class={cn('border-b last:border-b-0', level() > 0 && 'ml-8')}>
        <div
          class={cn(
            'hover:bg-muted/50 flex cursor-pointer items-center gap-3 p-4 transition-colors',
            props.selectedId === task().id && 'bg-muted',
          )}
          onClick={() => props.onSelect(task().id)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (task().completed_at) {
                props.onUncomplete(task().id);
              } else {
                props.onComplete(task().id);
              }
            }}
            class="shrink-0"
          >
            <Show
              when={task().completed_at}
              fallback={<Circle class="text-muted-foreground h-5 w-5" />}
            >
              <CheckCircle2 class="text-primary h-5 w-5" />
            </Show>
          </button>

          <div class="min-w-0 flex-1">
            <p
              class={cn('font-medium', task().completed_at && 'text-muted-foreground line-through')}
            >
              {task().title}
            </p>
            <Show when={task().description}>
              <p class="text-muted-foreground mt-1 truncate text-sm">{task().description}</p>
            </Show>
          </div>

          <div class="flex items-center gap-2">
            <Badge variant={getPriorityColor(task().priority)}>{task().priority}</Badge>

            <Show when={task().due_date}>
              <div
                class={cn(
                  'flex items-center gap-1 text-sm',
                  isOverdue() ? 'text-destructive' : 'text-muted-foreground',
                )}
              >
                <Show when={isOverdue()}>
                  <AlertCircle class="h-4 w-4" />
                </Show>
                <Calendar class="h-4 w-4" />
                <span>{formatDueDate(task().due_date)}</span>
              </div>
            </Show>

            <DropdownMenu>
              <DropdownMenuTrigger as={Button} variant="ghost" size="icon">
                <MoreVertical class="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => props.onEdit(task().id)}>
                  <Edit class="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => props.onDelete(task().id)}
                  class="text-destructive"
                >
                  <Trash2 class="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
    <div class="divide-y">
      <Show
        when={rootTasks().length > 0}
        fallback={
          <div class="text-muted-foreground p-8 text-center">
            No tasks yet. Create your first task to get started.
          </div>
        }
      >
        <For each={rootTasks()}>{(task) => <TaskItem task={task} />}</For>
      </Show>
    </div>
  );
};

export default TaskList;
