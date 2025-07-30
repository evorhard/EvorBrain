import { createSignal, createEffect, onCleanup } from 'solid-js';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'evorbrain-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

export function createTheme() {
  const [theme, setTheme] = createSignal<Theme>(getStoredTheme());
  const [resolvedTheme, setResolvedTheme] = createSignal<'light' | 'dark'>(
    theme() === 'system' ? getSystemTheme() : theme() as 'light' | 'dark'
  );

  createEffect(() => {
    const currentTheme = theme();
    localStorage.setItem(STORAGE_KEY, currentTheme);
    
    const resolved = currentTheme === 'system' ? getSystemTheme() : currentTheme as 'light' | 'dark';
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