import type { Component, JSX} from "solid-js";
import { splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";

const containerVariants = cva("mx-auto w-full", {
  variants: {
    maxWidth: {
      xs: "max-w-xs",
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      "3xl": "max-w-3xl",
      "4xl": "max-w-4xl",
      "5xl": "max-w-5xl",
      "6xl": "max-w-6xl",
      "7xl": "max-w-7xl",
      full: "max-w-full",
      prose: "max-w-prose",
      screen: "max-w-screen-2xl",
    },
    padding: {
      none: "",
      xs: "px-2 sm:px-4",
      sm: "px-4 sm:px-6",
      default: "px-4 sm:px-6 lg:px-8",
      lg: "px-6 sm:px-8 lg:px-12",
      xl: "px-8 sm:px-12 lg:px-16",
    },
  },
  defaultVariants: {
    maxWidth: "7xl",
    padding: "default",
  },
});

export interface ContainerProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container: Component<ContainerProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "maxWidth", "padding"]);

  return (
    <div
      class={containerVariants({
        maxWidth: local.maxWidth,
        padding: local.padding,
        class: local.class,
      })}
      {...others}
    />
  );
};

export { Container, containerVariants };