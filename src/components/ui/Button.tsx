import { Button as KobalteButton } from '@kobalte/core/button';
import { splitProps, type Component, type JSX } from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'focus-ring inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-content-inverse hover:bg-primary-600',
        secondary:
          'bg-surface-100 dark:bg-surface-200 text-content hover:bg-surface-200 dark:hover:bg-surface-300',
        outline:
          'border-border hover:bg-surface-100 dark:hover:bg-surface-200 border bg-transparent',
        ghost: 'hover:bg-surface-100 dark:hover:bg-surface-200',
        danger: 'bg-danger text-content-inverse hover:bg-danger-600',
        success: 'bg-success text-content-inverse hover:bg-success-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends KobalteButton.ButtonRootProps,
    VariantProps<typeof buttonVariants> {
  children?: JSX.Element;
}

const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, ['variant', 'size', 'class']);

  return (
    <KobalteButton
      class={buttonVariants({
        variant: local.variant,
        size: local.size,
        class: local.class,
      })}
      {...others}
    />
  );
};

export { Button, buttonVariants };
