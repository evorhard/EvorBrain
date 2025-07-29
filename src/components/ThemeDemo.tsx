import { Component, For } from "solid-js";
import { createTheme } from "../lib/theme";

const ThemeDemo: Component = () => {
  const { theme, setTheme, resolvedTheme } = createTheme();

  const colorGroups = [
    {
      name: "Primary Colors",
      prefix: "primary",
      shades: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
    },
    {
      name: "Accent Colors",
      prefix: "accent",
      shades: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"],
    },
    {
      name: "Success Colors",
      prefix: "success",
      shades: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
    },
    {
      name: "Warning Colors",
      prefix: "warning",
      shades: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
    },
    {
      name: "Danger Colors",
      prefix: "danger",
      shades: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
    },
  ];

  const priorityColors = [
    { name: "Low", class: "bg-priority-low" },
    { name: "Medium", class: "bg-priority-medium" },
    { name: "High", class: "bg-priority-high" },
    { name: "Urgent", class: "bg-priority-urgent" },
  ];

  const lifeAreaColors = [
    { name: "Personal", class: "bg-life-area-personal" },
    { name: "Work", class: "bg-life-area-work" },
    { name: "Health", class: "bg-life-area-health" },
    { name: "Relationships", class: "bg-life-area-relationships" },
    { name: "Finance", class: "bg-life-area-finance" },
    { name: "Growth", class: "bg-life-area-growth" },
  ];

  return (
    <div class="p-8 space-y-8">
      <div class="bg-surface rounded-lg shadow-card p-6">
        <h2 class="text-2xl font-bold text-content mb-4">EvorBrain Theme System</h2>
        <p class="text-content-secondary mb-6">
          A comprehensive color system designed for productivity and visual clarity.
        </p>

        <div class="flex gap-4 mb-6">
          <button
            onClick={() => setTheme("light")}
            class={`px-4 py-2 rounded-md transition-colors focus-ring ${
              theme() === "light"
                ? "bg-primary-500 text-content-inverse"
                : "bg-surface-100 dark:bg-surface-200 text-content"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            class={`px-4 py-2 rounded-md transition-colors focus-ring ${
              theme() === "dark"
                ? "bg-primary-500 text-content-inverse"
                : "bg-surface-100 dark:bg-surface-200 text-content"
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setTheme("system")}
            class={`px-4 py-2 rounded-md transition-colors focus-ring ${
              theme() === "system"
                ? "bg-primary-500 text-content-inverse"
                : "bg-surface-100 dark:bg-surface-200 text-content"
            }`}
          >
            System
          </button>
        </div>

        <p class="text-sm text-content-tertiary">
          Current theme: <span class="font-medium text-content">{theme()}</span> (resolved: {resolvedTheme()})
        </p>
      </div>

      <For each={colorGroups}>
        {(group) => (
          <div class="bg-surface rounded-lg shadow-card p-6">
            <h3 class="text-lg font-semibold text-content mb-4">{group.name}</h3>
            <div class="grid grid-cols-11 gap-2">
              <For each={group.shades}>
                {(shade) => (
                  <div class="text-center">
                    <div
                      class="w-full h-16 rounded-md mb-1"
                      style={{
                        "background-color": `rgb(var(--color-${group.prefix}-${shade}))`,
                      }}
                    />
                    <span class="text-xs text-content-secondary">{shade}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </For>

      <div class="bg-surface rounded-lg shadow-card p-6">
        <h3 class="text-lg font-semibold text-content mb-4">Priority Colors</h3>
        <div class="grid grid-cols-4 gap-4">
          <For each={priorityColors}>
            {(priority) => (
              <div class="text-center">
                <div class={`w-full h-16 rounded-md ${priority.class} mb-2`} />
                <span class="text-sm text-content">{priority.name}</span>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="bg-surface rounded-lg shadow-card p-6">
        <h3 class="text-lg font-semibold text-content mb-4">Life Area Colors</h3>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
          <For each={lifeAreaColors}>
            {(area) => (
              <div class="text-center">
                <div class={`w-full h-16 rounded-md ${area.class} mb-2`} />
                <span class="text-sm text-content">{area.name}</span>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="bg-surface rounded-lg shadow-card p-6">
        <h3 class="text-lg font-semibold text-content mb-4">Component Examples</h3>
        <div class="space-y-4">
          <div class="flex gap-4">
            <button class="bg-primary-500 hover:bg-primary-600 text-content-inverse px-4 py-2 rounded-md transition-colors focus-ring">
              Primary Button
            </button>
            <button class="bg-accent-500 hover:bg-accent-600 text-content-inverse px-4 py-2 rounded-md transition-colors focus-ring">
              Accent Button
            </button>
            <button class="bg-surface-100 dark:bg-surface-200 hover:bg-surface-200 dark:hover:bg-surface-300 text-content px-4 py-2 rounded-md transition-colors focus-ring">
              Secondary Button
            </button>
          </div>

          <div class="flex gap-2">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-500/10 text-success-600 dark:text-success-400">
              Success
            </span>
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-500/10 text-warning-600 dark:text-warning-400">
              Warning
            </span>
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger-500/10 text-danger-600 dark:text-danger-400">
              Danger
            </span>
          </div>
        </div>
      </div>

      <div class="bg-surface rounded-lg shadow-card p-6">
        <h3 class="text-lg font-semibold text-content mb-4">Text Hierarchy</h3>
        <div class="space-y-2">
          <p class="text-content">Primary text (content)</p>
          <p class="text-content-secondary">Secondary text (content-secondary)</p>
          <p class="text-content-tertiary">Tertiary text (content-tertiary)</p>
          <div class="bg-primary-500 p-2 rounded">
            <p class="text-content-inverse">Inverse text on dark background</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;