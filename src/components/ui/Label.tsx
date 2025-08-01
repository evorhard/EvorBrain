import type { Component, JSX} from "solid-js";
import { splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      error: {
        true: "text-danger-500",
        false: "text-content",
      },
    },
    defaultVariants: {
      error: false,
    },
  }
);

export interface LabelProps
  extends JSX.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {}

const Label: Component<LabelProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "error"]);

  return (
    <label
      class={labelVariants({
        error: local.error,
        class: local.class,
      })}
      {...others}
    />
  );
};

export { Label, labelVariants };