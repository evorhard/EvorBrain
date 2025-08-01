import { splitProps, type Component, type JSX } from 'solid-js';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva('bg-surface text-content rounded-lg border', {
  variants: {
    variant: {
      default: 'border-border shadow-card',
      outline: 'border-border',
      ghost: 'border-transparent shadow-none',
    },
    padding: {
      none: '',
      sm: 'p-4',
      default: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'default',
  },
});

export interface CardProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card: Component<CardProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'variant', 'padding']);

  return (
    <div
      class={cardVariants({
        variant: local.variant,
        padding: local.padding,
        class: local.class,
      })}
      {...others}
    />
  );
};

const CardHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return <div class={`flex flex-col space-y-1.5 ${local.class || ''}`} {...others} />;
};

const CardTitle: Component<JSX.HTMLAttributes<HTMLHeadingElement>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <h3
      class={`text-2xl leading-none font-semibold tracking-tight ${local.class || ''}`}
      {...others}
    />
  );
};

const CardDescription: Component<JSX.HTMLAttributes<HTMLParagraphElement>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return <p class={`text-content-secondary text-sm ${local.class || ''}`} {...others} />;
};

const CardContent: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return <div class={`pt-6 ${local.class || ''}`} {...others} />;
};

const CardFooter: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return <div class={`flex items-center pt-6 ${local.class || ''}`} {...others} />;
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
