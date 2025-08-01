# Component Documentation Standards

This document outlines the standards and best practices for documenting components in the EvorBrain project. Following these guidelines ensures consistency, maintainability, and ease of use across our component library.

## Table of Contents

1. [Component Documentation Requirements](#component-documentation-requirements)
2. [File Structure & Naming](#file-structure--naming)
3. [TypeScript Interface Documentation](#typescript-interface-documentation)
4. [Component Examples](#component-examples)
5. [Testing Documentation](#testing-documentation)
6. [Accessibility Documentation](#accessibility-documentation)
7. [Storybook Integration](#storybook-integration)
8. [Component Categories](#component-categories)

## Component Documentation Requirements

Every component MUST include the following documentation:

### 1. Component File Header

```tsx
/**
 * @component ComponentName
 * @description Brief description of what the component does and when to use it
 * @example
 * ```tsx
 * <ComponentName prop1="value" prop2={true} />
 * ```
 * @see {@link https://example.com/design-system} - Design system reference
 * @since 1.0.0
 */
```

### 2. Props Interface Documentation

```tsx
/**
 * Props for the ComponentName component
 */
export interface ComponentNameProps {
  /**
   * Primary content to display
   * @default undefined
   */
  children?: JSXElement;

  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger';

  /**
   * Size of the component
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  class?: string;

  /**
   * Callback fired when the component is clicked
   * @param event - The click event
   */
  onClick?: (event: MouseEvent) => void;
}
```

### 3. Component Usage Examples

Include at least 3 examples showing:
- Basic usage
- Advanced usage with all props
- Common use cases

```tsx
// Basic usage
<Button>Click me</Button>

// With props
<Button 
  variant="danger" 
  size="large" 
  disabled={isLoading()}
  onClick={handleDelete}
>
  Delete Item
</Button>

// In a form
<form onSubmit={handleSubmit}>
  <Input name="email" type="email" required />
  <Button type="submit">Submit</Button>
</form>
```

## File Structure & Naming

### Component Directory Structure

```
src/components/
├── ui/                    # Base UI components
│   ├── Button/
│   │   ├── Button.tsx     # Component implementation
│   │   ├── Button.test.tsx # Component tests
│   │   ├── Button.stories.tsx # Storybook stories
│   │   └── index.ts       # Barrel export
│   └── index.ts           # UI components barrel export
├── features/              # Feature-specific components
│   ├── goals/
│   │   ├── GoalList.tsx
│   │   ├── GoalList.test.tsx
│   │   └── index.ts
│   └── index.ts
└── layout/                # Layout components
    ├── Header.tsx
    ├── Sidebar.tsx
    └── index.ts
```

### Naming Conventions

1. **Component Files**: PascalCase (e.g., `Button.tsx`, `GoalList.tsx`)
2. **Test Files**: Same name with `.test.tsx` suffix
3. **Story Files**: Same name with `.stories.tsx` suffix
4. **Hook Files**: camelCase with `use` prefix (e.g., `useBreakpoint.ts`)
5. **Utility Files**: camelCase (e.g., `formatDate.ts`)

### Export Patterns

```tsx
// Component file (Button.tsx)
export interface ButtonProps { /* ... */ }
export const Button: Component<ButtonProps> = (props) => { /* ... */ }

// Index file (index.ts)
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

## TypeScript Interface Documentation

### Required Documentation Elements

1. **Interface Description**: What the interface represents
2. **Property Documentation**: Each property must have JSDoc
3. **Default Values**: Document defaults using `@default`
4. **Examples**: Include usage examples where helpful

```tsx
/**
 * Configuration options for the TaskFilter component
 */
export interface TaskFilterConfig {
  /**
   * Filter tasks by status
   * @default 'all'
   * @example
   * ```tsx
   * // Show only active tasks
   * config={{ status: 'active' }}
   * ```
   */
  status?: 'all' | 'active' | 'completed' | 'archived';

  /**
   * Filter tasks by priority level
   * @default undefined - shows all priorities
   */
  priority?: TaskPriority;

  /**
   * Date range for filtering tasks
   * @example
   * ```tsx
   * // Tasks due this week
   * dateRange={{
   *   start: startOfWeek(new Date()),
   *   end: endOfWeek(new Date())
   * }}
   * ```
   */
  dateRange?: {
    start: Date;
    end: Date;
  };
}
```

## Component Examples

### Example Component with Full Documentation

```tsx
/**
 * @component TaskCard
 * @description Displays a task with its details, status, and actions.
 * Used in task lists and kanban boards throughout the application.
 * @example
 * ```tsx
 * <TaskCard 
 *   task={task} 
 *   onComplete={handleComplete}
 *   onEdit={handleEdit}
 * />
 * ```
 * @see {@link TaskList} - Parent component that renders task cards
 * @see {@link Task} - Task data model
 * @since 1.0.0
 */

import { Component, Show, createSignal } from 'solid-js';
import { Task, TaskPriority } from '@/types/models';
import { Button } from '@/components/ui';
import { formatDate } from '@/utils/date';

/**
 * Props for the TaskCard component
 */
export interface TaskCardProps {
  /**
   * The task data to display
   */
  task: Task;

  /**
   * Whether the card is in a selected state
   * @default false
   */
  selected?: boolean;

  /**
   * Whether to show action buttons
   * @default true
   */
  showActions?: boolean;

  /**
   * Callback fired when the task is marked complete
   * @param taskId - The ID of the completed task
   */
  onComplete?: (taskId: string) => void;

  /**
   * Callback fired when the edit button is clicked
   * @param task - The task to edit
   */
  onEdit?: (task: Task) => void;

  /**
   * Callback fired when the card is clicked
   * @param task - The clicked task
   */
  onClick?: (task: Task) => void;

  /**
   * Additional CSS classes for the card container
   */
  class?: string;
}

/**
 * TaskCard displays a single task with its information and actions.
 * 
 * ## Features
 * - Displays task title, description, priority, and due date
 * - Shows completion status with visual indicators
 * - Provides actions for completing and editing tasks
 * - Supports keyboard navigation
 * - Fully accessible with ARIA labels
 * 
 * ## Usage Examples
 * 
 * ### Basic Usage
 * ```tsx
 * <TaskCard task={myTask} />
 * ```
 * 
 * ### With Actions
 * ```tsx
 * <TaskCard 
 *   task={myTask}
 *   onComplete={(id) => api.task.complete(id)}
 *   onEdit={(task) => openEditModal(task)}
 * />
 * ```
 * 
 * ### In a List
 * ```tsx
 * <For each={tasks()}>
 *   {(task) => (
 *     <TaskCard 
 *       task={task}
 *       selected={selectedId() === task.id}
 *       onClick={selectTask}
 *     />
 *   )}
 * </For>
 * ```
 */
export const TaskCard: Component<TaskCardProps> = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);

  const priorityColors = {
    [TaskPriority.Low]: 'text-blue-600 bg-blue-50',
    [TaskPriority.Medium]: 'text-yellow-600 bg-yellow-50',
    [TaskPriority.High]: 'text-orange-600 bg-orange-50',
    [TaskPriority.Urgent]: 'text-red-600 bg-red-50',
  };

  return (
    <div
      class={`
        rounded-lg border p-4 transition-all cursor-pointer
        ${props.selected ? 'border-primary-500 shadow-md' : 'border-surface-200'}
        ${isHovered() ? 'shadow-sm' : ''}
        ${props.task.completed_at ? 'opacity-60' : ''}
        ${props.class || ''}
      `}
      onClick={() => props.onClick?.(props.task)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Task: ${props.task.title}`}
      tabIndex={0}
    >
      {/* Task content */}
      <div class="space-y-2">
        <h3 class="font-medium text-content-primary">
          {props.task.title}
        </h3>
        
        <Show when={props.task.description}>
          <p class="text-sm text-content-secondary line-clamp-2">
            {props.task.description}
          </p>
        </Show>

        <div class="flex items-center gap-3 text-xs">
          <span class={`px-2 py-1 rounded-full ${priorityColors[props.task.priority]}`}>
            {props.task.priority}
          </span>
          
          <Show when={props.task.due_date}>
            <span class="text-content-tertiary">
              Due {formatDate(props.task.due_date!)}
            </span>
          </Show>
        </div>
      </div>

      {/* Actions */}
      <Show when={props.showActions !== false && !props.task.completed_at}>
        <div class="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              props.onComplete?.(props.task.id);
            }}
            aria-label="Mark task as complete"
          >
            Complete
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              props.onEdit?.(props.task);
            }}
            aria-label="Edit task"
          >
            Edit
          </Button>
        </div>
      </Show>
    </div>
  );
};
```

## Testing Documentation

### Test File Requirements

Every component should have a corresponding test file with:

1. **Component Rendering Tests**
   ```tsx
   it('should render with default props', () => {
     const { getByText } = render(() => <Button>Click me</Button>);
     expect(getByText('Click me')).toBeInTheDocument();
   });
   ```

2. **Props Behavior Tests**
   ```tsx
   it('should apply variant styles', () => {
     const { container } = render(() => <Button variant="danger">Delete</Button>);
     expect(container.querySelector('button')).toHaveClass('bg-danger-500');
   });
   ```

3. **User Interaction Tests**
   ```tsx
   it('should handle click events', async () => {
     const handleClick = vi.fn();
     const { getByRole } = render(() => 
       <Button onClick={handleClick}>Click me</Button>
     );
     
     await userEvent.click(getByRole('button'));
     expect(handleClick).toHaveBeenCalledOnce();
   });
   ```

4. **Accessibility Tests**
   ```tsx
   it('should be keyboard accessible', async () => {
     const handleClick = vi.fn();
     const { getByRole } = render(() => 
       <Button onClick={handleClick}>Click me</Button>
     );
     
     const button = getByRole('button');
     button.focus();
     await userEvent.keyboard('{Enter}');
     expect(handleClick).toHaveBeenCalledOnce();
   });
   ```

### Test Documentation Template

```tsx
/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  /**
   * Test default rendering and basic functionality
   */
  describe('Rendering', () => {
    it('should render with minimum props', () => {
      // Test implementation
    });

    it('should render children correctly', () => {
      // Test implementation
    });
  });

  /**
   * Test component props and their effects
   */
  describe('Props', () => {
    it('should apply variant styles', () => {
      // Test implementation
    });

    it('should handle disabled state', () => {
      // Test implementation
    });
  });

  /**
   * Test user interactions
   */
  describe('User Interactions', () => {
    it('should handle click events', async () => {
      // Test implementation
    });

    it('should support keyboard navigation', async () => {
      // Test implementation
    });
  });

  /**
   * Test accessibility requirements
   */
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      // Test implementation
    });

    it('should announce state changes to screen readers', () => {
      // Test implementation
    });
  });
});
```

## Accessibility Documentation

### Required Accessibility Documentation

1. **ARIA Attributes**
   ```tsx
   /**
    * @accessibility
    * - Uses role="button" for clickable elements
    * - Includes aria-label for icon-only buttons
    * - Implements aria-pressed for toggle buttons
    * - Supports aria-disabled for disabled state
    */
   ```

2. **Keyboard Support**
   ```tsx
   /**
    * @keyboard
    * - Enter/Space: Activate the button
    * - Tab: Move focus to/from the button
    * - Shift+Tab: Move focus backwards
    */
   ```

3. **Screen Reader Support**
   ```tsx
   /**
    * @screenreader
    * - Announces button label and state
    * - Provides context for icon-only buttons
    * - Announces state changes (pressed/unpressed)
    */
   ```

### Accessibility Checklist

Every component must:

- [ ] Support keyboard navigation
- [ ] Have proper focus indicators
- [ ] Include ARIA labels for interactive elements
- [ ] Provide text alternatives for visual information
- [ ] Maintain sufficient color contrast (WCAG AA)
- [ ] Work with screen readers
- [ ] Support reduced motion preferences
- [ ] Scale properly with browser zoom

## Storybook Integration

### Story File Structure

```tsx
/**
 * @storybook
 * Stories for the ComponentName component showcasing
 * different states and use cases
 */
import type { Meta, StoryObj } from 'storybook-solidjs';
import { ComponentName } from './ComponentName';

const meta = {
  title: 'UI/ComponentName',
  component: ComponentName,
  parameters: {
    docs: {
      description: {
        component: 'Detailed description of the component for Storybook docs',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
      description: 'Visual style variant',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story showing basic usage
 */
export const Default: Story = {
  args: {
    children: 'Click me',
  },
};

/**
 * Story showing all variants
 */
export const Variants: Story = {
  render: () => (
    <div class="space-y-4">
      <ComponentName variant="primary">Primary</ComponentName>
      <ComponentName variant="secondary">Secondary</ComponentName>
      <ComponentName variant="danger">Danger</ComponentName>
    </div>
  ),
};

/**
 * Story demonstrating interactive states
 */
export const States: Story = {
  render: () => (
    <div class="space-y-4">
      <ComponentName>Normal</ComponentName>
      <ComponentName disabled>Disabled</ComponentName>
      <ComponentName loading>Loading</ComponentName>
    </div>
  ),
};
```

## Component Categories

### UI Components (`src/components/ui/`)

Base-level, reusable components:
- Buttons, Inputs, Selects
- Cards, Modals, Tooltips
- Layout primitives

**Documentation Focus**: API flexibility, theming, accessibility

### Feature Components (`src/components/features/`)

Business logic components:
- GoalList, TaskCard, ProjectBoard
- Domain-specific UI

**Documentation Focus**: Business context, data flow, integration

### Layout Components (`src/components/layout/`)

Page structure components:
- Header, Sidebar, Footer
- Navigation, Containers

**Documentation Focus**: Responsive behavior, slots, composition

### Composite Components

Complex components built from primitives:
- Forms, Tables, Wizards
- Multi-step workflows

**Documentation Focus**: State management, validation, examples

## Best Practices

1. **Write Documentation First**: Document the API before implementing
2. **Include Real Examples**: Use realistic data in examples
3. **Document Edge Cases**: Explain how the component handles errors
4. **Keep It Updated**: Update docs when changing component behavior
5. **Test the Examples**: Ensure all code examples actually work
6. **Link Related Components**: Reference related components and patterns
7. **Version Changes**: Document breaking changes with `@deprecated`
8. **Performance Notes**: Document any performance considerations

## Documentation Review Checklist

Before marking a component as complete:

- [ ] Component has JSDoc header with description and example
- [ ] All props are documented with types and defaults
- [ ] At least 3 usage examples are provided
- [ ] Test file covers all major functionality
- [ ] Accessibility requirements are documented
- [ ] Keyboard shortcuts are listed
- [ ] Related components are linked
- [ ] Breaking changes are noted with version

---

## Recent Additions

### ConfirmDialog Component (2025-08-01)

A new `ConfirmDialog` component has been added to replace browser `confirm()` dialogs:

```tsx
import { createConfirmDialog } from '@/components/ui/ConfirmDialog';

// Create a confirm dialog instance
const [DeleteConfirmDialog, deleteConfirmHandle] = createConfirmDialog({
  title: 'Delete Item',
  description: 'Are you sure you want to delete this item?',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'danger',
  onConfirm: () => deleteItem(),
  onCancel: () => console.log('Cancelled')
});

// Usage in component
<Button onClick={() => deleteConfirmHandle.open()}>Delete</Button>
<DeleteConfirmDialog />
```

This component follows our accessibility standards and integrates with the existing Modal component system.

---

*Last updated: 2025-08-01*