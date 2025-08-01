import { splitProps, createMemo, type Component, type JSX } from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'placeholder:text-content-tertiary focus-ring flex w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface hover:border-border-strong',
        error: 'border-danger-500 hover:border-danger-600 focus:ring-danger-500',
      },
      size: {
        default: 'h-10',
        sm: 'h-9 text-xs',
        lg: 'h-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface InputProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, [
    'variant',
    'size',
    'class',
    'label',
    'error',
    'helperText',
    'id',
  ]);

  const inputId = createMemo(() => local.id || `input-${Math.random().toString(36).substr(2, 9)}`);
  const actualVariant = createMemo(() => (local.error ? 'error' : local.variant));

  return (
    <div class="w-full">
      {local.label && (
        <label for={inputId()} class="text-content mb-2 block text-sm font-medium">
          {local.label}
        </label>
      )}
      <input
        id={inputId()}
        class={inputVariants({
          variant: actualVariant(),
          size: local.size,
          class: local.class,
        })}
        aria-invalid={Boolean(local.error)}
        aria-describedby={local.error || local.helperText ? `${inputId()}-description` : undefined}
        {...others}
      />
      {(local.error || local.helperText) && (
        <p
          id={`${inputId()}-description`}
          class={`mt-1 text-sm ${local.error ? 'text-danger-500' : 'text-content-secondary'}`}
        >
          {local.error || local.helperText}
        </p>
      )}
    </div>
  );
};

export { Input, inputVariants };
