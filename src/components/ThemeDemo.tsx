import type { Component } from 'solid-js';
import { For } from 'solid-js';
import { useTheme } from '../providers/ThemeProvider';

const ThemeDemo: Component = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const colorGroups = [
    {
      name: 'Primary Colors',
      prefix: 'primary',
      shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    },
    {
      name: 'Accent Colors',
      prefix: 'accent',
      shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
    },
    {
      name: 'Success Colors',
      prefix: 'success',
      shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    },
    {
      name: 'Warning Colors',
      prefix: 'warning',
      shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    },
    {
      name: 'Danger Colors',
      prefix: 'danger',
      shades: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    },
  ];

  const priorityColors = [
    { name: 'Low', class: 'bg-priority-low' },
    { name: 'Medium', class: 'bg-priority-medium' },
    { name: 'High', class: 'bg-priority-high' },
    { name: 'Urgent', class: 'bg-priority-urgent' },
  ];

  const lifeAreaColors = [
    { name: 'Personal', class: 'bg-life-area-personal' },
    { name: 'Work', class: 'bg-life-area-work' },
    { name: 'Health', class: 'bg-life-area-health' },
    { name: 'Relationships', class: 'bg-life-area-relationships' },
    { name: 'Finance', class: 'bg-life-area-finance' },
    { name: 'Growth', class: 'bg-life-area-growth' },
  ];

  return (
    <div class="space-y-8 p-8">
      <div class="bg-surface shadow-card rounded-lg p-6">
        <h2 class="text-content mb-4 text-2xl font-bold">EvorBrain Theme System</h2>
        <p class="text-content-secondary mb-6">
          A comprehensive color system designed for productivity and visual clarity.
        </p>

        <div class="mb-6 flex gap-4">
          <button
            onClick={() => setTheme('light')}
            class={`focus-ring rounded-md px-4 py-2 transition-colors ${
              theme() === 'light'
                ? 'bg-primary-500 text-content-inverse'
                : 'bg-surface-100 dark:bg-surface-200 text-content'
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            class={`focus-ring rounded-md px-4 py-2 transition-colors ${
              theme() === 'dark'
                ? 'bg-primary-500 text-content-inverse'
                : 'bg-surface-100 dark:bg-surface-200 text-content'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setTheme('system')}
            class={`focus-ring rounded-md px-4 py-2 transition-colors ${
              theme() === 'system'
                ? 'bg-primary-500 text-content-inverse'
                : 'bg-surface-100 dark:bg-surface-200 text-content'
            }`}
          >
            System
          </button>
        </div>

        <p class="text-content-tertiary text-sm">
          Current theme: <span class="text-content font-medium">{theme()}</span> (resolved:{' '}
          {resolvedTheme()})
        </p>
      </div>

      <For each={colorGroups}>
        {(group) => (
          <div class="bg-surface shadow-card rounded-lg p-6">
            <h3 class="text-content mb-4 text-lg font-semibold">{group.name}</h3>
            <div class="grid grid-cols-11 gap-2">
              <For each={group.shades}>
                {(shade) => (
                  <div class="text-center">
                    <div
                      class="mb-1 h-16 w-full rounded-md"
                      style={{
                        'background-color': `rgb(var(--color-${group.prefix}-${shade}))`,
                      }}
                    />
                    <span class="text-content-secondary text-xs">{shade}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </For>

      <div class="bg-surface shadow-card rounded-lg p-6">
        <h3 class="text-content mb-4 text-lg font-semibold">Priority Colors</h3>
        <div class="grid grid-cols-4 gap-4">
          <For each={priorityColors}>
            {(priority) => (
              <div class="text-center">
                <div class={`h-16 w-full rounded-md ${priority.class} mb-2`} />
                <span class="text-content text-sm">{priority.name}</span>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="bg-surface shadow-card rounded-lg p-6">
        <h3 class="text-content mb-4 text-lg font-semibold">Life Area Colors</h3>
        <div class="grid grid-cols-3 gap-4 md:grid-cols-6">
          <For each={lifeAreaColors}>
            {(area) => (
              <div class="text-center">
                <div class={`h-16 w-full rounded-md ${area.class} mb-2`} />
                <span class="text-content text-sm">{area.name}</span>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="bg-surface shadow-card rounded-lg p-6">
        <h3 class="text-content mb-4 text-lg font-semibold">Component Examples</h3>
        <div class="space-y-4">
          <div class="flex gap-4">
            <button class="bg-primary-500 hover:bg-primary-600 text-content-inverse focus-ring rounded-md px-4 py-2 transition-colors">
              Primary Button
            </button>
            <button class="bg-accent-500 hover:bg-accent-600 text-content-inverse focus-ring rounded-md px-4 py-2 transition-colors">
              Accent Button
            </button>
            <button class="bg-surface-100 dark:bg-surface-200 hover:bg-surface-200 dark:hover:bg-surface-300 text-content focus-ring rounded-md px-4 py-2 transition-colors">
              Secondary Button
            </button>
          </div>

          <div class="flex gap-2">
            <span class="bg-success-500/10 text-success-600 dark:text-success-400 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
              Success
            </span>
            <span class="bg-warning-500/10 text-warning-600 dark:text-warning-400 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
              Warning
            </span>
            <span class="bg-danger-500/10 text-danger-600 dark:text-danger-400 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
              Danger
            </span>
          </div>
        </div>
      </div>

      <div class="bg-surface shadow-card rounded-lg p-6">
        <h3 class="text-content mb-4 text-lg font-semibold">Text Hierarchy</h3>
        <div class="space-y-2">
          <p class="text-content">Primary text (content)</p>
          <p class="text-content-secondary">Secondary text (content-secondary)</p>
          <p class="text-content-tertiary">Tertiary text (content-tertiary)</p>
          <div class="bg-primary-500 rounded p-2">
            <p class="text-content-inverse">Inverse text on dark background</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
