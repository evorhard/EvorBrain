import { createSignal, Show, For, createEffect } from 'solid-js';
import { useGoalStore, useLifeAreaStore } from '../../../stores';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Label } from '../../ui/Label';
import { Select } from '../../ui/Select';
import type { Goal } from '../../../types/models';

interface GoalFormProps {
  goal?: Goal;
  onClose: () => void;
}

export function GoalForm(props: GoalFormProps) {
  const { actions: goalActions } = useGoalStore();
  const { store: lifeAreaStore } = useLifeAreaStore();

  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [lifeAreaId, setLifeAreaId] = createSignal('');
  const [priority, setPriority] = createSignal<'low' | 'medium' | 'high'>('medium');
  const [targetDate, setTargetDate] = createSignal('');
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Update form fields when goal prop changes
  createEffect(() => {
    setName(props.goal?.name || '');
    setDescription(props.goal?.description || '');
    setLifeAreaId(props.goal?.life_area_id || '');
    setPriority(props.goal?.priority || 'medium');
    setTargetDate(props.goal?.target_date || '');
  });

  // Format date for input field
  createEffect(() => {
    if (props.goal?.target_date) {
      const date = new Date(props.goal.target_date);
      const formattedDate = date.toISOString().split('T')[0];
      setTargetDate(formattedDate);
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    if (!name().trim()) {
      setError('Goal name is required');
      return;
    }

    if (!lifeAreaId()) {
      setError('Please select a life area');
      return;
    }

    setIsSubmitting(true);

    try {
      const goalData = {
        name: name().trim(),
        description: description().trim() || undefined,
        life_area_id: lifeAreaId(),
        priority: priority(),
        target_date: targetDate() || undefined,
      };

      if (props.goal) {
        await goalActions.update(props.goal.id, {
          name: goalData.name,
          description: goalData.description,
          priority: goalData.priority,
          target_date: goalData.target_date,
        });
      } else {
        await goalActions.create(goalData);
      }

      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeLifeAreas = () => lifeAreaStore.items.filter((area) => !area.archived_at);

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div>
        <Label for="goal-name">Goal Name *</Label>
        <Input
          id="goal-name"
          type="text"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          placeholder="Enter goal name"
          required
          autofocus
        />
      </div>

      <div>
        <Label for="goal-life-area">Life Area *</Label>
        <Select
          id="goal-life-area"
          value={lifeAreaId()}
          onChange={(e) => setLifeAreaId(e.currentTarget.value)}
          required
        >
          <option value="">Select a life area</option>
          <For each={activeLifeAreas()}>
            {(area) => <option value={area.id}>{area.name}</option>}
          </For>
        </Select>
      </div>

      <div>
        <Label for="goal-description">Description</Label>
        <Textarea
          id="goal-description"
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          placeholder="Describe your goal (optional)"
          rows={3}
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label for="goal-priority">Priority</Label>
          <Select
            id="goal-priority"
            value={priority()}
            onChange={(e) => setPriority(e.currentTarget.value as 'low' | 'medium' | 'high')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>

        <div>
          <Label for="goal-target-date">Target Date</Label>
          <Input
            id="goal-target-date"
            type="date"
            value={targetDate()}
            onInput={(e) => setTargetDate(e.currentTarget.value)}
          />
        </div>
      </div>

      <Show when={error()}>
        <div class="rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error()}
        </div>
      </Show>

      <div class="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={props.onClose} disabled={isSubmitting()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting()}>
          {isSubmitting() ? 'Saving...' : props.goal ? 'Update Goal' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
}
