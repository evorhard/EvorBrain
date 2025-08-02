import { createSignal, Show, createEffect } from 'solid-js';
import { useLifeAreaStore } from '../../stores';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import type { LifeArea } from '../../types/models';

interface LifeAreaFormProps {
  lifeArea?: LifeArea;
  onClose: () => void;
}

export function LifeAreaForm(props: LifeAreaFormProps) {
  const { actions: lifeAreaActions } = useLifeAreaStore();

  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [color, setColor] = createSignal('#3B82F6'); // Default blue color
  const [icon, setIcon] = createSignal('');
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Update form fields when lifeArea prop changes
  createEffect(() => {
    setName(props.lifeArea?.name || '');
    setDescription(props.lifeArea?.description || '');
    setColor(props.lifeArea?.color || '#3B82F6');
    setIcon(props.lifeArea?.icon || '');
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    if (!name().trim()) {
      setError('Life area name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        name: name().trim(),
        description: description().trim() || undefined,
        color: color(),
        icon: icon().trim() || undefined,
      };

      if (props.lifeArea) {
        // Update existing life area
        await lifeAreaActions.update(props.lifeArea.id, data);
      } else {
        // Create new life area
        await lifeAreaActions.create(data);
      }
      props.onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <Show when={error()}>
        <div class="bg-danger-50 dark:bg-danger-900/20 rounded-md p-4">
          <p class="text-danger-800 dark:text-danger-200 text-sm">{error()}</p>
        </div>
      </Show>

      <div>
        <Label for="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          placeholder="e.g., Work, Health, Family"
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
          placeholder="Describe this area of your life (optional)"
          rows={3}
          disabled={isSubmitting()}
        />
      </div>

      <div>
        <Label for="color">Color</Label>
        <div class="flex gap-2">
          <Input
            id="color"
            type="color"
            value={color()}
            onInput={(e) => setColor(e.currentTarget.value)}
            disabled={isSubmitting()}
            class="h-10 w-20"
          />
          <Input
            type="text"
            value={color()}
            onInput={(e) => setColor(e.currentTarget.value)}
            placeholder="#3B82F6"
            disabled={isSubmitting()}
            class="flex-1"
          />
        </div>
      </div>

      <div>
        <Label for="icon">Icon (optional)</Label>
        <Input
          id="icon"
          type="text"
          value={icon()}
          onInput={(e) => setIcon(e.currentTarget.value)}
          placeholder="e.g., 💼, 💪, 👨‍👩‍👧‍👦"
          disabled={isSubmitting()}
        />
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={props.onClose}
          disabled={isSubmitting()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting()}>
          {props.lifeArea ? 'Update' : 'Create'} Life Area
        </Button>
      </div>
    </form>
  );
}