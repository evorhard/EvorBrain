# EvorBrain UI Components

> **Important**: All components must follow the [Component Documentation Standards](/docs/COMPONENT_STANDARDS.md).
> See the [Badge component](/src/components/ui/Badge.tsx) for a complete example.

This directory contains reusable UI components built with [Kobalte](https://kobalte.dev/), an
accessible component library for SolidJS.

## Overview

Kobalte provides unstyled, accessible components that we style using our theme system and Tailwind
CSS. This approach gives us:

- **Accessibility by default**: All components follow WAI-ARIA best practices
- **Full control over styling**: Components integrate seamlessly with our theme
- **Type safety**: Full TypeScript support
- **Composability**: Build complex UIs from simple primitives

## Available Components

### Button

A versatile button component with multiple variants and sizes.

```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="default">Click me</Button>
<Button variant="secondary" size="sm">Small button</Button>
<Button variant="danger" disabled>Disabled</Button>
```

**Variants**: `default`, `secondary`, `outline`, `ghost`, `danger`, `success` **Sizes**: `sm`,
`default`, `lg`, `icon`

### Input

Text input field with label, error, and helper text support.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error="Invalid email address"
  helperText="We'll never share your email"
/>;
```

**Props**: `label`, `error`, `helperText`, all standard input attributes **Sizes**: `sm`, `default`,
`lg`

### Textarea

Multi-line text input with label and validation support.

```tsx
import { Textarea } from '@/components/ui';

<Textarea
  label="Description"
  placeholder="Tell us more..."
  rows={4}
  error="Description is required"
/>;
```

### Select

Dropdown selection component with search and custom styling.

```tsx
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui';

<Select value={value()} onChange={setValue}>
  <SelectTrigger label="Priority" />
  <SelectPortal>
    <SelectContent>
      <SelectItem value="low">Low</SelectItem>
      <SelectItem value="high">High</SelectItem>
    </SelectContent>
  </SelectPortal>
</Select>;
```

### Modal

Dialog component for overlays and popups.

```tsx
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui';

<Modal>
  <ModalTrigger asChild>
    <Button>Open Modal</Button>
  </ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Title</ModalTitle>
      <ModalDescription>Description</ModalDescription>
    </ModalHeader>
    <div>Content</div>
    <ModalFooter>
      <Button>Close</Button>
    </ModalFooter>
  </ModalContent>
</Modal>;
```

**Sizes**: `sm`, `md`, `lg`, `xl`, `full`

### Card

Container component for grouped content.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';

<Card variant="default">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content goes here</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

**Variants**: `default`, `outline`, `ghost` **Padding**: `none`, `sm`, `default`, `lg`

### Label

Form label component with error state support.

```tsx
import { Label } from '@/components/ui';

<Label for="email" error={hasError}>
  Email Address
</Label>;
```

### Checkbox

An accessible checkbox with optional label.

```tsx
import { Checkbox } from '@/components/ui';

<Checkbox label="I agree to terms" checked={checked()} onChange={setChecked} />;
```

### Switch

A toggle switch for boolean values.

```tsx
import { Switch } from '@/components/ui';

<Switch label="Enable notifications" checked={enabled()} onChange={setEnabled} />;
```

### Tooltip

Provides additional context on hover.

```tsx
import { Tooltip } from '@/components/ui';

<Tooltip content="Helpful information">
  <Button>Hover me</Button>
</Tooltip>;
```

**Props**: `content`, `placement` (top/right/bottom/left), `openDelay`, `closeDelay`

### Dropdown Menu

A menu that appears on click.

```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuPortal>
    <DropdownMenuContent>
      <DropdownMenuItem>Option 1</DropdownMenuItem>
      <DropdownMenuItem>Option 2</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenuPortal>
</DropdownMenu>;
```

## Styling

All components use our theme system colors and Tailwind utilities. Key classes:

- `focus-ring`: Consistent focus states
- `ui-*`: Kobalte state modifiers (ui-checked, ui-disabled, etc.)
- Theme colors: `primary-*`, `surface-*`, `content-*`, etc.

## Adding New Components

1. Create a new file in `src/components/ui/`
2. Import the Kobalte primitive
3. Apply our theme styles
4. Export from `index.ts`

Example structure:

```tsx
import { ComponentPrimitive } from '@kobalte/core/component';
import { Component, splitProps } from 'solid-js';

interface ComponentProps extends ComponentPrimitive.ComponentRootProps {
  // Custom props
}

const Component: Component<ComponentProps> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return <ComponentPrimitive class={`base-styles ${local.class || ''}`} {...others} />;
};

export { Component };
```

## Best Practices

1. **Always use semantic color tokens** from our theme system
2. **Include focus states** using the `focus-ring` class
3. **Support dark mode** with appropriate color variants
4. **Keep components composable** - avoid building monolithic components
5. **Document props** with TypeScript interfaces
6. **Test accessibility** with keyboard navigation and screen readers

## Resources

- [Kobalte Documentation](https://kobalte.dev/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
