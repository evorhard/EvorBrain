import type { Component, JSX } from 'solid-js';
import { cn } from '../../utils/cn';

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: JSX.Element;
  class?: string;
}

export const Heading: Component<HeadingProps> = (props) => {
  const level = () => props.level || 1;

  const baseStyles = 'font-bold tracking-tight text-foreground';
  const sizeStyles = {
    1: 'text-4xl lg:text-5xl',
    2: 'text-3xl lg:text-4xl',
    3: 'text-2xl lg:text-3xl',
    4: 'text-xl lg:text-2xl',
    5: 'text-lg lg:text-xl',
    6: 'text-base lg:text-lg',
  };

  const className = () => cn(baseStyles, sizeStyles[level()], props.class);

  // eslint-disable-next-line solid/reactivity
  const currentLevel = level();
  switch (currentLevel) {
    case 1:
      return <h1 class={className()}>{props.children}</h1>;
    case 2:
      return <h2 class={className()}>{props.children}</h2>;
    case 3:
      return <h3 class={className()}>{props.children}</h3>;
    case 4:
      return <h4 class={className()}>{props.children}</h4>;
    case 5:
      return <h5 class={className()}>{props.children}</h5>;
    case 6:
      return <h6 class={className()}>{props.children}</h6>;
    default:
      return <h1 class={className()}>{props.children}</h1>;
  }
};
