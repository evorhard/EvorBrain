# EvorBrain Theme System Guide

## Overview

EvorBrain uses a comprehensive theme system built on CSS custom properties and Tailwind CSS. This allows for dynamic theming, consistent color usage, and excellent dark mode support.

## Color Palette

### Primary Colors (Blue)
Used for main actions, active states, and productivity-focused elements.
- `primary-50` to `primary-950`: Full range from lightest to darkest

### Accent Colors (Purple)
Used for creative elements, highlights, and secondary actions.
- `accent-50` to `accent-950`: Full range from lightest to darkest

### Semantic Colors
- **Success (Green)**: Completion states, positive feedback
- **Warning (Amber)**: Caution states, deadlines approaching
- **Danger (Red)**: Errors, deletions, urgent priorities

### Surface Colors
Used for cards, modals, and elevated UI elements.
- `surface`: Default surface color
- `surface-50` to `surface-900`: Elevation levels

### Background Colors
- `background`: Main app background
- `background-secondary`: Secondary areas, sidebars

### Text Colors
- `content`: Primary text
- `content-secondary`: Secondary text, descriptions
- `content-tertiary`: Disabled text, placeholders
- `content-inverse`: Text on dark backgrounds

### Border Colors
- `border`: Default borders
- `border-subtle`: Light borders for subtle separation
- `border-strong`: Strong borders for emphasis

### Priority Colors
For task prioritization:
- `priority-low`: Gray tone
- `priority-medium`: Blue tone
- `priority-high`: Amber tone
- `priority-urgent`: Red tone

### Life Area Colors
Distinct colors for different life areas:
- `life-area-personal`: Purple
- `life-area-work`: Blue
- `life-area-health`: Green
- `life-area-relationships`: Pink
- `life-area-finance`: Amber
- `life-area-growth`: Cyan

## Usage Examples

### Basic Card
```jsx
<div class="bg-surface rounded-lg shadow-card p-6">
  <h3 class="text-lg font-semibold text-content">Card Title</h3>
  <p class="text-content-secondary">Card description</p>
</div>
```

### Primary Button
```jsx
<button class="bg-primary-500 hover:bg-primary-600 text-content-inverse px-4 py-2 rounded-md focus-ring">
  Primary Action
</button>
```

### Task Priority Badge
```jsx
<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-priority-high/10 text-priority-high">
  High Priority
</span>
```

### Dark Mode
The theme automatically adjusts for dark mode. Colors are inverted to maintain proper contrast and readability.

## Animations

The theme includes several animation utilities:
- `animate-fade-in`: Smooth fade-in effect
- `animate-slide-in`: Slide in from left
- `animate-check`: Checkbox/completion animation

## Focus States

Use the `focus-ring` utility class for consistent focus indicators:
```jsx
<button class="focus-ring">Focusable Element</button>
```

## Typography

- **Sans**: Inter for UI text
- **Mono**: JetBrains Mono for code/technical content

## Shadows

- `shadow-card`: Default card shadow
- `shadow-card-hover`: Elevated card shadow on hover
- `shadow-modal`: Modal/dialog shadow

## Best Practices

1. Always use semantic color names instead of specific color values
2. Use `content-*` colors for text to ensure proper contrast
3. Apply `focus-ring` to all interactive elements
4. Use surface colors for elevated components
5. Maintain consistency with priority and life area colors