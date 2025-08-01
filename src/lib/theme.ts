import { createSignal, createEffect, onCleanup } from 'solid-js';

/**
 * Available theme options for the application
 * @typedef {'light' | 'dark' | 'system'} Theme
 */
export type Theme = 'light' | 'dark' | 'system';

/** Local storage key for persisting theme preference */
const STORAGE_KEY = 'evorbrain-theme';

/**
 * Detects the system's preferred color scheme
 * @returns {'light' | 'dark'} The system's color scheme preference
 * @private
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Retrieves the stored theme preference from localStorage
 * @returns {Theme} The stored theme or 'system' as default
 * @private
 */
function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

/**
 * Creates a reactive theme system with automatic persistence and system preference detection
 * @returns An object containing:
 *   - theme: Signal<Theme> - The current theme setting
 *   - setTheme: (theme: Theme) => void - Function to update the theme
 *   - resolvedTheme: Signal<'light' | 'dark'> - The actual theme being applied
 * @example
 * ```typescript
 * const { theme, setTheme, resolvedTheme } = createTheme();
 *
 * // Change to dark mode
 * setTheme('dark');
 *
 * // Use system preference
 * setTheme('system');
 * ```
 */
export function createTheme() {
  const [theme, setTheme] = createSignal<Theme>(getStoredTheme());
  const [resolvedTheme, setResolvedTheme] = createSignal<'light' | 'dark'>(
    theme() === 'system' ? getSystemTheme() : (theme() as 'light' | 'dark'),
  );

  createEffect(() => {
    const currentTheme = theme();
    localStorage.setItem(STORAGE_KEY, currentTheme);

    const resolved = currentTheme === 'system' ? getSystemTheme() : currentTheme;
    setResolvedTheme(resolved);

    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  });

  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme() === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(newTheme);
        const root = document.documentElement;
        if (newTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Clean up the event listener when the component is destroyed
    onCleanup(() => {
      mediaQuery.removeEventListener('change', handleChange);
    });
  }

  return {
    theme,
    setTheme,
    resolvedTheme,
  };
}
