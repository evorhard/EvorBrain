import { Component, Show, createMemo } from 'solid-js';
import type { Task } from '../../../types/models';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Edit, Trash2, CheckCircle2, Circle, Calendar, AlertCircle, FolderOpen } from 'lucide-solid';
import { format, isPast, isToday } from 'date-fns';
import { useProjectStore } from '../../../stores';
import { cn } from '../../../utils/cn';

interface TaskDetailProps {
  task: Task;
  onEdit: () => void;
  onComplete: () => void;
  onUncomplete: () => void;
  onDelete: () => void;
}

const TaskDetail: Component<TaskDetailProps> = (props) => {
  const { store: projectStore } = useProjectStore();
  
  const project = createMemo(() => 
    props.task.project_id 
      ? projectStore.items.find(p => p.id === props.task.project_id)
      : null
  );

  const isOverdue = createMemo(() => 
    props.task.due_date && !props.task.completed_at && isPast(new Date(props.task.due_date))
  );

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
    <Card class="p-6">
      <div class="space-y-4">
        <div class="flex items-start justify-between">
          <h2 class="text-xl font-semibold">Task Details</h2>
          <div class="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={props.onEdit}
              leftIcon={<Edit size={16} />}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={props.onDelete}
              leftIcon={<Trash2 size={16} />}
              class="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <h3 class={cn(
              'text-lg font-medium',
              props.task.completed_at && 'line-through text-muted-foreground'
            )}>
              {props.task.title}
            </h3>
            <Show when={props.task.description}>
              <p class="text-muted-foreground mt-2">{props.task.description}</p>
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
              leftIcon={
                props.task.completed_at 
                  ? <CheckCircle2 size={16} />
                  : <Circle size={16} />
              }
            >
              {props.task.completed_at ? 'Mark as Incomplete' : 'Mark as Complete'}
            </Button>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">Priority:</span>
              <Badge variant={getPriorityColor(props.task.priority)}>
                {props.task.priority}
              </Badge>
            </div>

            <Show when={props.task.due_date}>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Due Date:</span>
                <div class={cn(
                  'flex items-center gap-1 text-sm',
                  isOverdue() ? 'text-destructive' : 'text-muted-foreground'
                )}>
                  <Show when={isOverdue()}>
                    <AlertCircle class="h-4 w-4" />
                  </Show>
                  <Calendar class="h-4 w-4" />
                  <span>{formatDueDate(props.task.due_date)}</span>
                </div>
              </div>
            </Show>

            <Show when={project()}>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Project:</span>
                <div class="flex items-center gap-1 text-sm text-muted-foreground">
                  <FolderOpen class="h-4 w-4" />
                  <span>{project()!.title}</span>
                </div>
              </div>
            </Show>

            <Show when={props.task.completed_at}>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Completed:</span>
                <span class="text-sm text-muted-foreground">
                  {format(new Date(props.task.completed_at), 'MMMM d, yyyy')}
                </span>
              </div>
            </Show>

            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">Created:</span>
              <span class="text-sm text-muted-foreground">
                {format(new Date(props.task.created_at), 'MMMM d, yyyy')}
              </span>
            </div>

            <Show when={props.task.updated_at !== props.task.created_at}>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">Updated:</span>
                <span class="text-sm text-muted-foreground">
                  {format(new Date(props.task.updated_at), 'MMMM d, yyyy')}
                </span>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskDetail;