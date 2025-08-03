import { createSignal, createEffect, Show, For } from 'solid-js';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Select } from '../../ui/SelectHtml';
import { Button } from '../../ui/Button';
import { Label } from '../../ui/Label';
import { useProjectStore, useGoalStore } from '../../../stores';
import type { Project, ProjectStatus } from '../../../types/models';

interface ProjectFormProps {
  project?: Project;
  onClose: () => void;
}

export function ProjectForm(props: ProjectFormProps) {
  const { actions: projectActions } = useProjectStore();
  const { store: goalStore, actions: goalActions } = useGoalStore();

  const [goalId, setGoalId] = createSignal('');
  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [status, setStatus] = createSignal<ProjectStatus>('planning');
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Initialize form values and fetch goals on mount
  createEffect(() => {
    goalActions.fetchAll();

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
        await projectActions.update(props.project.id, {
          goal_id: goalId(),
          title: title().trim(),
          description: description().trim() || undefined,
          status: status(),
        });
      } else {
        // Create new project
        await projectActions.create({
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

  const activeGoals = () => goalStore.items.filter((goal) => !goal.archived_at);

  const statusOptions: { value: ProjectStatus; label: string }[] = [
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <Show when={error()}>
        <div class="bg-danger-50 dark:bg-danger-900/20 rounded-md p-4">
          <p class="text-danger-800 dark:text-danger-200 text-sm">{error()}</p>
        </div>
      </Show>

      <div>
        <Label for="goal">Goal</Label>
        <Select id="goal" value={goalId()} onChange={(e) => setGoalId(e.currentTarget.value)} disabled={isSubmitting()} required>
          <option value="">Select a goal...</option>
          <For each={activeGoals()}>{(goal) => <option value={goal.id}>{goal.title}</option>}</For>
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
        />
      </div>

      <div>
        <Label for="status">Status</Label>
        <Select
          id="status"
          value={status()}
          onChange={(e) => setStatus(e.currentTarget.value as ProjectStatus)}
          disabled={isSubmitting()}
        >
          <For each={statusOptions}>
            {(option) => <option value={option.value}>{option.label}</option>}
          </For>
        </Select>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={props.onClose} disabled={isSubmitting()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting()}>
          {(() => {
            if (isSubmitting()) return 'Saving...';
            return props.project ? 'Update' : 'Create';
          })()}{' '}
          Project
        </Button>
      </div>
    </form>
  );
}
