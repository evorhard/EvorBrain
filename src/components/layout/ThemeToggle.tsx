import type { Component } from 'solid-js';
import { HiOutlineSun, HiOutlineMoon, HiOutlineComputerDesktop } from 'solid-icons/hi';
import { useTheme } from '../../providers/ThemeProvider';

const ThemeToggle: Component = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const current = theme();
    if (current === 'light') {
      setTheme('dark');
    } else if (current === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <button
      onClick={cycleTheme}
      class="hover:bg-surface-100 dark:hover:bg-surface-200 focus-ring rounded-lg p-2 transition-colors"
      aria-label="Toggle theme"
    >
      {theme() === 'light' && <HiOutlineSun class="text-content-secondary h-5 w-5" />}
      {theme() === 'dark' && <HiOutlineMoon class="text-content-secondary h-5 w-5" />}
      {theme() === 'system' && <HiOutlineComputerDesktop class="text-content-secondary h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;
