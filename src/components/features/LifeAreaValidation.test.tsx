import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { renderWithProviders } from '../../test/utils';
import { createSignal, Show, type Component } from 'solid-js';
import type { LifeArea } from '../../types/models';

// Validation rules for Life Area
const validateLifeAreaName = (name: string, existingNames: string[] = []): string | null => {
  if (!name.trim()) {
    return 'Name is required';
  }
  if (name.length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (name.length > 50) {
    return 'Name must be less than 50 characters';
  }
  if (existingNames.includes(name.trim())) {
    return 'A life area with this name already exists';
  }
  return null;
};

const validateDescription = (description: string): string | null => {
  if (description.length > 200) {
    return 'Description must be less than 200 characters';
  }
  return null;
};

const validateIcon = (icon: string): string | null => {
  if (icon && icon.length > 2) {
    return 'Icon must be a single emoji';
  }
  return null;
};

// Component with validation
const LifeAreaFormWithValidation: Component<{
  existingLifeAreas?: LifeArea[];
  onSubmit: (data: any) => void;
  onError: (errors: Record<string, string>) => void;
}> = (props) => {
  const [name, setName] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [icon, setIcon] = createSignal('');
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [touched, setTouched] = createSignal<Record<string, boolean>>({});

  const existingNames = () => props.existingLifeAreas?.map((area) => area.name) || [];

  const validateField = (field: string, value: string) => {
    let error: string | null = null;

    switch (field) {
      case 'name':
        error = validateLifeAreaName(value, existingNames());
        break;
      case 'description':
        error = validateDescription(value);
        break;
      case 'icon':
        error = validateIcon(value);
        break;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(
      field,
      field === 'name' ? name() : field === 'description' ? description() : icon(),
    );
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, description: true, icon: true });

    // Validate all fields
    const nameError = validateLifeAreaName(name(), existingNames());
    const descError = validateDescription(description());
    const iconError = validateIcon(icon());

    const validationErrors: Record<string, string> = {};
    if (nameError) validationErrors.name = nameError;
    if (descError) validationErrors.description = descError;
    if (iconError) validationErrors.icon = iconError;

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      props.onError(validationErrors);
      return;
    }

    props.onSubmit({
      name: name().trim(),
      description: description().trim() || undefined,
      icon: icon().trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div>
        <label for="name" class="mb-1 block text-sm font-medium">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name()}
          onInput={(e) => {
            setName(e.currentTarget.value);
            if (touched().name) {
              validateField('name', e.currentTarget.value);
            }
          }}
          onBlur={() => handleBlur('name')}
          class={`w-full rounded-md border px-3 py-2 ${
            errors().name && touched().name ? 'border-red-500' : ''
          }`}
          aria-invalid={Boolean(errors().name && touched().name)}
          aria-describedby={errors().name && touched().name ? 'name-error' : undefined}
        />
        <Show when={errors().name && touched().name}>
          <p id="name-error" class="mt-1 text-sm text-red-500">
            {errors().name}
          </p>
        </Show>
      </div>

      <div>
        <label for="description" class="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={description()}
          onInput={(e) => {
            setDescription(e.currentTarget.value);
            if (touched().description) {
              validateField('description', e.currentTarget.value);
            }
          }}
          onBlur={() => handleBlur('description')}
          class={`w-full rounded-md border px-3 py-2 ${
            errors().description && touched().description ? 'border-red-500' : ''
          }`}
          rows="3"
          aria-invalid={Boolean(errors().description && touched().description)}
          aria-describedby={
            errors().description && touched().description ? 'desc-error' : undefined
          }
        />
        <Show when={errors().description && touched().description}>
          <p id="desc-error" class="mt-1 text-sm text-red-500">
            {errors().description}
          </p>
        </Show>
        <p class="mt-1 text-sm text-gray-500">{description().length}/200 characters</p>
      </div>

      <div>
        <label for="icon" class="mb-1 block text-sm font-medium">
          Icon (Emoji)
        </label>
        <input
          id="icon"
          type="text"
          value={icon()}
          onInput={(e) => {
            setIcon(e.currentTarget.value);
            if (touched().icon) {
              validateField('icon', e.currentTarget.value);
            }
          }}
          onBlur={() => handleBlur('icon')}
          class={`w-full rounded-md border px-3 py-2 ${
            errors().icon && touched().icon ? 'border-red-500' : ''
          }`}
          placeholder="e.g., 💼"
          aria-invalid={Boolean(errors().icon && touched().icon)}
          aria-describedby={errors().icon && touched().icon ? 'icon-error' : undefined}
        />
        <Show when={errors().icon && touched().icon}>
          <p id="icon-error" class="mt-1 text-sm text-red-500">
            {errors().icon}
          </p>
        </Show>
      </div>

      <button
        type="submit"
        class="bg-primary hover:bg-primary-600 w-full rounded-md px-4 py-2 text-white disabled:opacity-50"
        disabled={Object.keys(errors()).length > 0}
      >
        Submit
      </button>
    </form>
  );
};

describe('Life Area Validation', () => {
  const createMockLifeArea = (name: string): LifeArea => ({
    id: `${name}-id`,
    name,
    description: null,
    color: null,
    icon: null,
    position: 0,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  describe('Name Validation', () => {
    it('should require name field', async () => {
      const onSubmit = vi.fn();
      const onError = vi.fn();

      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={onSubmit} onError={onError} />
      ));

      // Try to submit without name
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ name: 'Name is required' }));
    });

    it('should validate minimum length', async () => {
      const onError = vi.fn();

      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={() => {}} onError={onError} />
      ));

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.input(nameInput, { target: { value: 'A' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('should validate maximum length', async () => {
      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={() => {}} onError={() => {}} />
      ));

      const nameInput = screen.getByLabelText('Name *');
      const longName = 'A'.repeat(51);
      fireEvent.input(nameInput, { target: { value: longName } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText('Name must be less than 50 characters')).toBeInTheDocument();
      });
    });

    it('should check for duplicate names', async () => {
      const existingAreas = [createMockLifeArea('Work'), createMockLifeArea('Personal')];

      renderWithProviders(() => (
        <LifeAreaFormWithValidation
          existingLifeAreas={existingAreas}
          onSubmit={() => {}}
          onError={() => {}}
        />
      ));

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.input(nameInput, { target: { value: 'Work' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText('A life area with this name already exists')).toBeInTheDocument();
      });
    });

    it('should show error styling when invalid', async () => {
      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={() => {}} onError={() => {}} />
      ));

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.blur(nameInput); // Trigger validation on empty field

      await waitFor(() => {
        expect(nameInput).toHaveClass('border-red-500');
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
        expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
      });
    });
  });

  describe('Description Validation', () => {
    it('should validate description maximum length', async () => {
      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={() => {}} onError={() => {}} />
      ));

      const descInput = screen.getByLabelText('Description');
      const longDesc = 'A'.repeat(201);
      fireEvent.input(descInput, { target: { value: longDesc } });
      fireEvent.blur(descInput);

      await waitFor(() => {
        expect(
          screen.getByText('Description must be less than 200 characters'),
        ).toBeInTheDocument();
      });
    });

    it('should show character count', () => {
      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={() => {}} onError={() => {}} />
      ));

      const descInput = screen.getByLabelText('Description');

      // Initially should show 0/200
      expect(screen.getByText('0/200 characters')).toBeInTheDocument();

      // Type some text
      fireEvent.input(descInput, { target: { value: 'Test description' } });

      // Should update count
      expect(screen.getByText('16/200 characters')).toBeInTheDocument();
    });
  });

  describe('Icon Validation', () => {
    it('should validate icon length', async () => {
      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={() => {}} onError={() => {}} />
      ));

      const iconInput = screen.getByLabelText('Icon (Emoji)');
      fireEvent.input(iconInput, { target: { value: 'ABC' } });
      fireEvent.blur(iconInput);

      await waitFor(() => {
        expect(screen.getByText('Icon must be a single emoji')).toBeInTheDocument();
      });
    });

    it('should accept valid emoji', async () => {
      const onSubmit = vi.fn();

      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={onSubmit} onError={() => {}} />
      ));

      // Fill valid data
      fireEvent.input(screen.getByLabelText('Name *'), { target: { value: 'Health' } });
      fireEvent.input(screen.getByLabelText('Icon (Emoji)'), { target: { value: '🏃' } });

      // Submit
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: 'Health',
          description: undefined,
          icon: '🏃',
        });
      });
    });
  });

  describe('Real-time Validation', () => {
    it('should validate on blur', async () => {
      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={() => {}} onError={() => {}} />
      ));

      const nameInput = screen.getByLabelText('Name *');

      // Type invalid value
      fireEvent.input(nameInput, { target: { value: 'A' } });

      // Error should not show until blur
      expect(screen.queryByText('Name must be at least 2 characters')).not.toBeInTheDocument();

      // Blur to trigger validation
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('should validate on input after first blur', async () => {
      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={() => {}} onError={() => {}} />
      ));

      const nameInput = screen.getByLabelText('Name *');

      // First blur to mark as touched
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      // Now type - should validate on each input
      fireEvent.input(nameInput, { target: { value: 'A' } });
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();

      fireEvent.input(nameInput, { target: { value: 'AB' } });
      expect(screen.queryByText('Name must be at least 2 characters')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should disable submit button when there are errors', async () => {
      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={() => {}} onError={() => {}} />
      ));

      const nameInput = screen.getByLabelText('Name *');
      const submitButton = screen.getByText('Submit');

      // Initially button should be enabled (no errors shown yet)
      expect(submitButton).not.toBeDisabled();

      // Type invalid value and blur
      fireEvent.input(nameInput, { target: { value: 'A' } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should validate all fields on submit', async () => {
      const onError = vi.fn();

      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={() => {}} onError={onError} />
      ));

      // Fill with invalid data
      fireEvent.input(screen.getByLabelText('Name *'), { target: { value: 'A' } });
      fireEvent.input(screen.getByLabelText('Description'), { target: { value: 'A'.repeat(201) } });
      fireEvent.input(screen.getByLabelText('Icon (Emoji)'), { target: { value: 'ABC' } });

      // Submit
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith({
          name: 'Name must be at least 2 characters',
          description: 'Description must be less than 200 characters',
          icon: 'Icon must be a single emoji',
        });
      });
    });

    it('should trim whitespace in validation', async () => {
      const onSubmit = vi.fn();

      renderWithProviders(() => (
        <LifeAreaFormWithValidation onSubmit={onSubmit} onError={() => {}} />
      ));

      // Fill with whitespace-padded values
      fireEvent.input(screen.getByLabelText('Name *'), { target: { value: '  Valid Name  ' } });
      fireEvent.input(screen.getByLabelText('Description'), {
        target: { value: '  Description  ' },
      });

      // Submit
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: 'Valid Name',
          description: 'Description',
          icon: undefined,
        });
      });
    });
  });
});
