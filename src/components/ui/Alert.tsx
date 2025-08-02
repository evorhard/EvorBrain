import type { Component, JSX } from 'solid-js';
import { cn } from '../../utils/cn';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-solid';

export interface AlertProps {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info' | 'error';
  children: JSX.Element;
  class?: string;
}

export const Alert: Component<AlertProps> = (props) => {
  const variant = () => props.variant || 'default';

  const variantStyles = {
    default: 'bg-background text-foreground border-border',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    success:
      'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800',
    warning:
      'bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800',
  };

  const icons = {
    default: <Info class="h-4 w-4" />,
    destructive: <XCircle class="h-4 w-4" />,
    error: <XCircle class="h-4 w-4" />,
    success: <CheckCircle2 class="h-4 w-4" />,
    warning: <AlertCircle class="h-4 w-4" />,
    info: <Info class="h-4 w-4" />,
  };

  return (
    <div
      role="alert"
      class={cn(
        'relative flex items-start gap-3 rounded-lg border p-4',
        variantStyles[variant()],
        props.class,
      )}
    >
      <div class="shrink-0">{icons[variant()]}</div>
      <div class="flex-1">{props.children}</div>
    </div>
  );
};
