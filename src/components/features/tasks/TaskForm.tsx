import { type Component, Show, createSignal, onMount, For } from 'solid-js';
import type { Task, TaskPriority } from '../../../types/models';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Select } from '../../ui/SelectHtml';
import { useProjectStore } from '../../../stores';
import { format } from 'date-fns';

interface TaskFormProps {
  task?: Task;
  parentTaskId?: string;
  projectId?: string;
  onSubmit: (data: {
    project_id?: string;
    parent_task_id?: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    due_date?: string;
  }) => void;
  onCancel: () => void;
}

const TaskForm: Component<TaskFormProps> = (props) => {
  const { store: projectStore, actions: projectActions } = useProjectStore();
  const initialTitle = () => props.task?.title || '';
  const initialDescription = () => props.task?.description || '';
  const initialProjectId = () => props.task?.project_id || props.projectId || '';
  const initialPriority = () => props.task?.priority || 'medium';
  const initialDueDate = () =>
    props.task?.due_date ? format(new Date(props.task.due_date), 'yyyy-MM-dd') : '';

  const [title, setTitle] = createSignal(initialTitle());
  const [description, setDescription] = createSignal(initialDescription());
  const [projectId, setProjectId] = createSignal(initialProjectId());
  const [priority, setPriority] = createSignal<TaskPriority>(initialPriority());
  const [dueDate, setDueDate] = createSignal(initialDueDate());

  onMount(async () => {
    if (projectStore.items.length === 0) {
      await projectActions.fetchAll();
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
    projectStore.items.filter((p) => !p.archived_at && p.status !== 'completed');

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div>
        <label for="title" class="mb-1 block text-sm font-medium">
          Title
        </label>
        <Input
          id="title"
          value={title()}
          onInput={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />
      </div>

      <div>
        <label for="description" class="mb-1 block text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          value={description()}
          onInput={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
          rows={3}
        />
      </div>

      <Show when={!props.parentTaskId}>
        <div>
          <label for="project" class="mb-1 block text-sm font-medium">
            Project
          </label>
          <Select
            id="project"
            value={projectId()}
            onChange={(e) => setProjectId(e.currentTarget.value)}
          >
            <option value="">No project</option>
            <For each={activeProjects()}>
              {(project) => <option value={project.id}>{project.title}</option>}
            </For>
          </Select>
        </div>
      </Show>

      <div>
        <label for="priority" class="mb-1 block text-sm font-medium">
          Priority
        </label>
        <Select
          id="priority"
          value={priority()}
          onChange={(e) => setPriority(e.currentTarget.value as TaskPriority)}
        >
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
      </div>

      <div>
        <label for="dueDate" class="mb-1 block text-sm font-medium">
          Due Date
        </label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate()}
          onInput={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div class="flex gap-2 pt-2">
        <Button type="submit" disabled={!title().trim()}>
          {props.task ? 'Update' : 'Create'} Task
        </Button>
        <Button type="button" variant="outline" onClick={props.onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
