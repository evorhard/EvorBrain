# EvorBrain Responsive Design Guide

## Overview

EvorBrain uses a mobile-first responsive design system built on Tailwind CSS. This guide covers
breakpoints, responsive utilities, and best practices for building adaptive interfaces.

## Breakpoints

Our design system includes the following breakpoints:

| Breakpoint | Min Width | CSS Prefix | Target Devices                  |
| ---------- | --------- | ---------- | ------------------------------- |
| xs         | 475px     | `xs:`      | Large phones                    |
| sm         | 640px     | `sm:`      | Small tablets, landscape phones |
| md         | 768px     | `md:`      | Tablets                         |
| lg         | 1024px    | `lg:`      | Small laptops, large tablets    |
| xl         | 1280px    | `xl:`      | Desktops                        |
| 2xl        | 1536px    | `2xl:`     | Large desktops                  |
| 3xl        | 1920px    | `3xl:`     | Full HD and larger screens      |

### Special Breakpoints

We also include interaction-based breakpoints:

- `touch:` - Touch devices (hover: none, pointer: coarse)
- `stylus:` - Stylus devices (hover: none, pointer: fine)
- `mouse:` - Mouse devices (hover: hover, pointer: fine)
- `can-hover:` - Any device that supports hover

## Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```tsx
// ❌ Desktop-first (avoid)
<div class="text-2xl sm:text-base">

// ✅ Mobile-first (preferred)
<div class="text-base sm:text-2xl">
```

## Responsive Utilities

### Container Component

The `Container` component provides consistent max-widths and padding:

```tsx
import { Container } from '@/components/ui';

<Container maxWidth="7xl" padding="default">
  {/* Content */}
</Container>;
```

### Grid System

Use responsive grid classes for layouts:

```tsx
// 1 column on mobile, 2 on tablet, 3 on desktop
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{/* Grid items */}</div>
```

### useBreakpoint Hook

Access current breakpoint information programmatically:

```tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';

const Component = () => {
  const { currentBreakpoint, isMobile, isTablet, isDesktop, isTouch } = useBreakpoint();

  return (
    <Show when={isMobile()}>
      <MobileLayout />
    </Show>
  );
};
```

## Common Patterns

### Responsive Text

```tsx
// Heading that scales with screen size
<h1 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl">

// Using utility classes
<h1 class={responsive.heading.h1}>
```

### Responsive Spacing

```tsx
// Padding that increases on larger screens
<div class="p-4 sm:p-6 lg:p-8">

// Using utility classes
<div class={responsive.padding.md}>
```

### Responsive Visibility

```tsx
// Hide on mobile
<div class="hidden sm:block">

// Show only on mobile
<div class="block sm:hidden">

// Using utility classes
<div class={responsive.display.desktopOnly}>
```

### Responsive Columns

```tsx
// Stack on mobile, side-by-side on desktop
<div class="flex flex-col gap-4 lg:flex-row">
  <div class="flex-1">Main content</div>
  <div class="w-full lg:w-64">Sidebar</div>
</div>
```

## Component Examples

### Responsive Card Grid

```tsx
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
  <Card class="p-4 sm:p-6">{/* Card content */}</Card>
</div>
```

### Responsive Navigation

```tsx
// Desktop: horizontal, Mobile: vertical
<nav class="flex flex-col gap-2 sm:flex-row sm:gap-4">
  <a class="px-4 py-2">Link 1</a>
  <a class="px-4 py-2">Link 2</a>
</nav>
```

### Responsive Form Layout

```tsx
<form class="space-y-4">
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    <Input label="First Name" />
    <Input label="Last Name" />
  </div>
  <Input label="Email" class="w-full" />
</form>
```

## Best Practices

1. **Test on Real Devices**: Don't rely solely on browser dev tools
2. **Consider Touch Targets**: Minimum 44x44px for touch devices
3. **Optimize Images**: Use responsive images with srcset
4. **Avoid Fixed Widths**: Use max-width instead of width
5. **Test Orientations**: Check both portrait and landscape
6. **Progressive Enhancement**: Start simple, add complexity

## Performance Tips

1. **Use CSS Grid/Flexbox**: More performant than floats
2. **Avoid JavaScript for Layout**: Use CSS when possible
3. **Lazy Load Content**: Especially images below the fold
4. **Minimize Reflows**: Batch DOM updates

## Accessibility

1. **Maintain Reading Order**: Ensure logical flow on all sizes
2. **Test with Zoom**: Support up to 200% zoom
3. **Consider Thumb Reach**: Important actions within thumb range
4. **Provide Skip Links**: For keyboard navigation

## Testing Checklist

- [ ] Test on actual mobile devices
- [ ] Check all breakpoints
- [ ] Verify touch targets are large enough
- [ ] Test in both orientations
- [ ] Ensure text remains readable
- [ ] Check performance on slow connections
- [ ] Verify accessibility at all sizes

## Common Issues and Solutions

### Text Overflow

```tsx
// Add text truncation
<p class="truncate">Long text that might overflow</p>

// Or allow wrapping
<p class="break-words">Verylongwordthatmightoverflow</p>
```

### Image Responsiveness

```tsx
// Responsive image
<img src="..." class="w-full h-auto" />

// With aspect ratio
<div class="aspect-video">
  <img src="..." class="w-full h-full object-cover" />
</div>
```

### Table Responsiveness

```tsx
// Horizontal scroll for tables
<div class="overflow-x-auto">
  <table class="min-w-full">{/* Table content */}</table>
</div>
```
