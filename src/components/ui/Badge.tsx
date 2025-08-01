/**
 * @component Badge
 * @description A small status indicator component used to display counts, labels, or status information.
 * Commonly used for notifications, status indicators, and categorization.
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" size="large">3 Updates</Badge>
 * <Badge variant="danger" dot>Error</Badge>
 * ```
 * @see {@link Button} - Often used alongside buttons for notification counts
 * @see {@link Card} - Used within cards to show status
 * @since 1.0.0
 */

import { Show, splitProps, createMemo, type Component, type JSXElement } from 'solid-js';
import { clx } from '@/utils/responsive';

/**
 * Props for the Badge component
 */
export interface BadgeProps {
  /**
   * Content to display in the badge
   * @example "New", "3", "Beta"
   */
  children: JSXElement;

  /**
   * Visual style variant of the badge
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

  /**
   * Size of the badge
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Whether to show only a dot indicator (hides children)
   * @default false
   */
  dot?: boolean;

  /**
   * Whether the badge should have rounded corners
   * @default true
   */
  rounded?: boolean;

  /**
   * Whether the badge has an outline style
   * @default false
   */
  outline?: boolean;

  /**
   * Additional CSS classes
   */
  class?: string;

  /**
   * ARIA label for accessibility (important when using dot mode)
   */
  'aria-label'?: string;
}

/**
 * Badge component for displaying small pieces of information or status indicators.
 *
 * ## Features
 * - Multiple visual variants for different contexts
 * - Three size options
 * - Dot mode for minimal indicators
 * - Outline style option
 * - Full accessibility support
 * - Dark mode compatible
 *
 * ## Usage Examples
 *
 * ### Basic Usage
 * ```tsx
 * <Badge>New</Badge>
 * ```
 *
 * ### With Variants
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="danger">Offline</Badge>
 * <Badge variant="warning">Pending</Badge>
 * ```
 *
 * ### Notification Badge
 * ```tsx
 * <div class="relative">
 *   <Button>
 *     <BellIcon />
 *   </Button>
 *   <Badge
 *     class="absolute -top-1 -right-1"
 *     variant="danger"
 *     size="small"
 *   >
 *     3
 *   </Badge>
 * </div>
 * ```
 *
 * ### Status Indicator
 * ```tsx
 * <div class="flex items-center gap-2">
 *   <Badge dot variant="success" aria-label="Online" />
 *   <span>John Doe</span>
 * </div>
 * ```
 *
 * @accessibility
 * - Uses appropriate color contrast for all variants
 * - Includes aria-label support for dot indicators
 * - Semantic HTML with proper text content
 * - Visible focus states when interactive
 *
 * @keyboard
 * - Not interactive by default
 * - When used as child of interactive element, inherits keyboard behavior
 */
export const Badge: Component<BadgeProps> = (props) => {
  const [local, others] = splitProps(props, [
    'children',
    'variant',
    'size',
    'dot',
    'rounded',
    'outline',
    'class',
  ]);

  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors';

  // Size styles
  const sizeStyles = createMemo(() => {
    const size = local.size || 'medium';
    if (local.dot) {
      return {
        small: 'w-2 h-2',
        medium: 'w-2.5 h-2.5',
        large: 'w-3 h-3',
      }[size];
    }
    return {
      small: 'px-1.5 py-0.5 text-xs',
      medium: 'px-2 py-0.5 text-xs',
      large: 'px-2.5 py-1 text-sm',
    }[size];
  });

  // Variant styles
  const variantStyles = createMemo(() => {
    const variant = local.variant || 'default';
    const { outline } = local;

    const styles = {
      default: outline
        ? 'border border-surface-300 text-content-primary bg-surface-50'
        : 'bg-surface-200 text-content-primary',
      primary: outline
        ? 'border border-primary-500 text-primary-600 bg-primary-50'
        : 'bg-primary-500 text-white',
      success: outline
        ? 'border border-green-500 text-green-700 bg-green-50'
        : 'bg-green-500 text-white',
      warning: outline
        ? 'border border-yellow-500 text-yellow-700 bg-yellow-50'
        : 'bg-yellow-500 text-white',
      danger: outline ? 'border border-red-500 text-red-700 bg-red-50' : 'bg-red-500 text-white',
      info: outline ? 'border border-blue-500 text-blue-700 bg-blue-50' : 'bg-blue-500 text-white',
    };

    return styles[variant];
  });

  // Rounded styles
  const roundedStyles = createMemo(() => {
    if (local.rounded !== false) {
      return 'rounded-full';
    }
    return 'rounded';
  });

  return (
    <span
      class={clx(baseStyles, sizeStyles(), variantStyles(), roundedStyles(), local.class)}
      {...others}
    >
      <Show when={!local.dot}>{local.children}</Show>
    </span>
  );
};

// Re-export the type for convenience
export type { BadgeProps };
