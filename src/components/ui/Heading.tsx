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

  const Tag = `h${level()}`;

  return <Tag class={cn(baseStyles, sizeStyles[level()], props.class)}>{props.children}</Tag>;
};
