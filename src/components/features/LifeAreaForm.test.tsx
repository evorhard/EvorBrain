import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { renderWithProviders } from '../../test/utils';
import { createSignal, Show, type Component } from 'solid-js';
import type { LifeArea } from '../../types/models';

// Mock form component for testing create/edit operations
const LifeAreaForm: Component<{
  lifeArea?: LifeArea | null;
  onSubmit: (data: { name: string; description?: string; color?: string; icon?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}> = (props) => {
  const [name, setName] = createSignal(props.lifeArea?.name || '');
  const [description, setDescription] = createSignal(props.lifeArea?.description || '');
  const [color, setColor] = createSignal(props.lifeArea?.color || '#3b82f6');
  const [icon, setIcon] = createSignal(props.lifeArea?.icon || '');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const nameValue = name().trim();

    if (!nameValue) {
      return;
    }

    props.onSubmit({
      name: nameValue,
      description: description().trim() || undefined,
      color: color(),
      icon: icon().trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <h2 class="text-xl font-bold">{props.lifeArea ? 'Edit Life Area' : 'Create Life Area'}</h2>

      <Show when={props.error}>
        <div class="rounded bg-red-50 p-3 text-red-600">{props.error}</div>
      </Show>

      <div>
        <label for="name" class="mb-1 block text-sm font-medium">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          class="w-full rounded-md border px-3 py-2"
          placeholder="e.g., Work, Health, Personal"
          required
          aria-label="Life area name"
        />
      </div>

      <div>
        <label for="description" class="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          class="w-full rounded-md border px-3 py-2"
          placeholder="Brief description of this life area"
          rows="3"
          aria-label="Life area description"
        />
      </div>

      <div class="flex gap-4">
        <div class="flex-1">
          <label for="color" class="mb-1 block text-sm font-medium">
            Color
          </label>
          <input
            id="color"
            type="color"
            value={color()}
            onInput={(e) => setColor(e.currentTarget.value)}
            class="h-10 w-full"
            aria-label="Life area color"
          />
        </div>

        <div class="flex-1">
          <label for="icon" class="mb-1 block text-sm font-medium">
            Icon (Emoji)
          </label>
          <input
            id="icon"
            type="text"
            value={icon()}
            onInput={(e) => setIcon(e.currentTarget.value)}
            class="w-full rounded-md border px-3 py-2"
            placeholder="e.g., 💼, 🏃, 🎯"
            maxLength="2"
            aria-label="Life area icon"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <button
          type="button"
          onClick={props.onCancel}
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
          disabled={props.isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          class="bg-primary hover:bg-primary-600 rounded-md px-4 py-2 text-white disabled:opacity-50"
          disabled={props.isLoading || !name().trim()}
        >
          {props.isLoading ? 'Saving...' : props.lifeArea ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

describe('Life Area Form', () => {
  const createMockLifeArea = (overrides?: Partial<LifeArea>): LifeArea => ({
    id: 'test-id',
    name: 'Test Area',
    description: 'Test description',
    color: '#3b82f6',
    icon: '🎯',
    position: 0,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  });

  describe('Create Mode', () => {
    it('should render create form with empty fields', () => {
      renderWithProviders(() => <LifeAreaForm onSubmit={() => {}} onCancel={() => {}} />);

      expect(screen.getByText('Create Life Area')).toBeInTheDocument();
      expect(screen.getByLabelText('Life area name')).toHaveValue('');
      expect(screen.getByLabelText('Life area description')).toHaveValue('');
      expect(screen.getByLabelText('Life area color')).toHaveValue('#3b82f6');
      expect(screen.getByLabelText('Life area icon')).toHaveValue('');
      expect(screen.getByText('Create')).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
      const onSubmit = vi.fn();
      const onCancel = vi.fn();

      renderWithProviders(() => <LifeAreaForm onSubmit={onSubmit} onCancel={onCancel} />);

      // Fill in form fields
      const nameInput = screen.getByLabelText('Life area name');
      const descriptionInput = screen.getByLabelText('Life area description');
      const colorInput = screen.getByLabelText('Life area color');
      const iconInput = screen.getByLabelText('Life area icon');

      fireEvent.input(nameInput, { target: { value: 'Work' } });
      fireEvent.input(descriptionInput, { target: { value: 'Professional activities' } });
      fireEvent.input(colorInput, { target: { value: '#10b981' } });
      fireEvent.input(iconInput, { target: { value: '💼' } });

      // Submit form
      const submitButton = screen.getByText('Create');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: 'Work',
          description: 'Professional activities',
          color: '#10b981',
          icon: '💼',
        });
      });

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should require name field', () => {
      const onSubmit = vi.fn();

      renderWithProviders(() => <LifeAreaForm onSubmit={onSubmit} onCancel={() => {}} />);

      // Try to submit without filling name
      const submitButton = screen.getByText('Create');
      expect(submitButton).toBeDisabled();

      // Fill name
      const nameInput = screen.getByLabelText('Life area name');
      fireEvent.input(nameInput, { target: { value: 'Test' } });

      // Button should be enabled now
      expect(submitButton).not.toBeDisabled();
    });

    it('should handle empty optional fields', async () => {
      const onSubmit = vi.fn();

      renderWithProviders(() => <LifeAreaForm onSubmit={onSubmit} onCancel={() => {}} />);

      // Only fill required field
      const nameInput = screen.getByLabelText('Life area name');
      fireEvent.input(nameInput, { target: { value: 'Minimal Area' } });

      // Submit
      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: 'Minimal Area',
          description: undefined,
          color: '#3b82f6',
          icon: undefined,
        });
      });
    });
  });

  describe('Edit Mode', () => {
    it('should render edit form with existing values', () => {
      const lifeArea = createMockLifeArea({
        name: 'Health',
        description: 'Physical and mental wellness',
        color: '#10b981',
        icon: '🏃',
      });

      renderWithProviders(() => (
        <LifeAreaForm lifeArea={lifeArea} onSubmit={() => {}} onCancel={() => {}} />
      ));

      expect(screen.getByText('Edit Life Area')).toBeInTheDocument();
      expect(screen.getByLabelText('Life area name')).toHaveValue('Health');
      expect(screen.getByLabelText('Life area description')).toHaveValue(
        'Physical and mental wellness',
      );
      expect(screen.getByLabelText('Life area color')).toHaveValue('#10b981');
      expect(screen.getByLabelText('Life area icon')).toHaveValue('🏃');
      expect(screen.getByText('Update')).toBeInTheDocument();
    });

    it('should handle edit submission', async () => {
      const lifeArea = createMockLifeArea();
      const onSubmit = vi.fn();

      renderWithProviders(() => (
        <LifeAreaForm lifeArea={lifeArea} onSubmit={onSubmit} onCancel={() => {}} />
      ));

      // Modify name
      const nameInput = screen.getByLabelText('Life area name');
      fireEvent.input(nameInput, { target: { value: 'Updated Area' } });

      // Submit
      fireEvent.click(screen.getByText('Update'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: 'Updated Area',
          description: 'Test description',
          color: '#3b82f6',
          icon: '🎯',
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message', () => {
      renderWithProviders(() => (
        <LifeAreaForm onSubmit={() => {}} onCancel={() => {}} error="Name already exists" />
      ));

      const errorText = screen.getByText('Name already exists');
      expect(errorText).toBeInTheDocument();
      // Verify error is in a red background container
      const errorContainer = errorText.closest('.bg-red-50');
      expect(errorContainer).toBeInTheDocument();
    });

    it('should trim whitespace from inputs', async () => {
      const onSubmit = vi.fn();

      renderWithProviders(() => <LifeAreaForm onSubmit={onSubmit} onCancel={() => {}} />);

      // Fill with whitespace
      fireEvent.input(screen.getByLabelText('Life area name'), {
        target: { value: '  Trimmed Name  ' },
      });
      fireEvent.input(screen.getByLabelText('Life area description'), {
        target: { value: '  Trimmed Description  ' },
      });
      fireEvent.input(screen.getByLabelText('Life area icon'), {
        target: { value: '  🎯  ' },
      });

      // Submit
      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: 'Trimmed Name',
          description: 'Trimmed Description',
          color: '#3b82f6',
          icon: '🎯',
        });
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();

      renderWithProviders(() => <LifeAreaForm onSubmit={() => {}} onCancel={onCancel} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('should disable buttons and show loading text when loading', () => {
      renderWithProviders(() => (
        <LifeAreaForm onSubmit={() => {}} onCancel={() => {}} isLoading={true} />
      ));

      expect(screen.getByText('Cancel')).toBeDisabled();
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByText('Saving...')).toBeDisabled();
    });
  });
});
