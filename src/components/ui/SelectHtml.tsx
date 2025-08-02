import { splitProps, type JSX, type Component } from 'solid-js';

export interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

/**
 * Simple HTML select component with consistent styling
 */
export const Select: Component<SelectProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'error']);

  return (
    <select
      class={`focus-ring flex h-10 w-full items-center rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        local.error
          ? 'border-danger-500 hover:border-danger-600'
          : 'border-border bg-surface hover:border-border-strong'
      } ${local.class || ''}`}
      {...others}
    />
  );
};