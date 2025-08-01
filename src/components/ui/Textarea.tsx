import { splitProps, createMemo, type Component, type JSX } from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

const textareaVariants = cva(
  'placeholder:text-content-tertiary focus-ring flex min-h-[80px] w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface hover:border-border-strong',
        error: 'border-danger-500 hover:border-danger-600 focus:ring-danger-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface TextareaProps
  extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea: Component<TextareaProps> = (props) => {
  const [local, others] = splitProps(props, [
    'variant',
    'class',
    'label',
    'error',
    'helperText',
    'id',
  ]);

  const textareaId = createMemo(
    () => local.id || `textarea-${Math.random().toString(36).substr(2, 9)}`,
  );
  const actualVariant = createMemo(() => (local.error ? 'error' : local.variant));

  return (
    <div class="w-full">
      {local.label && (
        <label for={textareaId()} class="text-content mb-2 block text-sm font-medium">
          {local.label}
        </label>
      )}
      <textarea
        id={textareaId()}
        class={textareaVariants({
          variant: actualVariant(),
          class: local.class,
        })}
        aria-invalid={Boolean(local.error)}
        aria-describedby={
          local.error || local.helperText ? `${textareaId()}-description` : undefined
        }
        {...others}
      />
      {(local.error || local.helperText) && (
        <p
          id={`${textareaId()}-description`}
          class={`mt-1 text-sm ${local.error ? 'text-danger-500' : 'text-content-secondary'}`}
        >
          {local.error || local.helperText}
        </p>
      )}
    </div>
  );
};

export { Textarea, textareaVariants };
