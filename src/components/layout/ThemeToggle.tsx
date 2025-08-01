import type { Component } from "solid-js";
import { HiOutlineSun, HiOutlineMoon, HiOutlineComputerDesktop } from "solid-icons/hi";
import { useTheme } from "../../providers/ThemeProvider";

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
      class="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors focus-ring"
      aria-label="Toggle theme"
    >
      {theme() === 'light' && <HiOutlineSun class="w-5 h-5 text-content-secondary" />}
      {theme() === 'dark' && <HiOutlineMoon class="w-5 h-5 text-content-secondary" />}
      {theme() === 'system' && <HiOutlineComputerDesktop class="w-5 h-5 text-content-secondary" />}
    </button>
  );
};

export default ThemeToggle;