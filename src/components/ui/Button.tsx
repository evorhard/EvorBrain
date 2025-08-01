import { Button as KobalteButton } from "@kobalte/core/button";
import type { Component, JSX} from "solid-js";
import { splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-ring disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-content-inverse hover:bg-primary-600",
        secondary: "bg-surface-100 dark:bg-surface-200 text-content hover:bg-surface-200 dark:hover:bg-surface-300",
        outline: "border border-border bg-transparent hover:bg-surface-100 dark:hover:bg-surface-200",
        ghost: "hover:bg-surface-100 dark:hover:bg-surface-200",
        danger: "bg-danger-500 text-content-inverse hover:bg-danger-600",
        success: "bg-success-500 text-content-inverse hover:bg-success-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends KobalteButton.ButtonRootProps,
    VariantProps<typeof buttonVariants> {
  children?: JSX.Element;
}

const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, ["variant", "size", "class"]);

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