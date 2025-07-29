# EvorBrain UI Components

This directory contains reusable UI components built with [Kobalte](https://kobalte.dev/), an accessible component library for SolidJS.

## Overview

Kobalte provides unstyled, accessible components that we style using our theme system and Tailwind CSS. This approach gives us:

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

**Variants**: `default`, `secondary`, `outline`, `ghost`, `danger`, `success`
**Sizes**: `sm`, `default`, `lg`, `icon`

### Checkbox
An accessible checkbox with optional label.

```tsx
import { Checkbox } from "@/components/ui";

<Checkbox 
  label="I agree to terms" 
  checked={checked()} 
  onChange={setChecked} 
/>
```

### Switch
A toggle switch for boolean values.

```tsx
import { Switch } from "@/components/ui";

<Switch 
  label="Enable notifications" 
  checked={enabled()} 
  onChange={setEnabled} 
/>
```

### Tooltip
Provides additional context on hover.

```tsx
import { Tooltip } from "@/components/ui";

<Tooltip content="Helpful information">
  <Button>Hover me</Button>
</Tooltip>
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
  DropdownMenuSeparator
} from "@/components/ui";

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
</DropdownMenu>
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
import { ComponentPrimitive } from "@kobalte/core/component";
import { Component, splitProps } from "solid-js";

interface ComponentProps extends ComponentPrimitive.ComponentRootProps {
  // Custom props
}

const Component: Component<ComponentProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  
  return (
    <ComponentPrimitive
      class={`base-styles ${local.class || ""}`}
      {...others}
    />
  );
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