import { createStore } from './createStore';
import type { UIState } from './types';

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'system',
  activeView: 'dashboard',
};

const [state, { setState }] = createStore(initialState, 'UI');

// Actions
export const uiActions = {
  toggleSidebar() {
    setState('sidebarOpen', open => !open);
  },
  
  setSidebarOpen(open: boolean) {
    setState('sidebarOpen', open);
  },
  
  setTheme(theme: UIState['theme']) {
    setState('theme', theme);
    // Apply theme to document
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  setActiveView(view: UIState['activeView']) {
    setState('activeView', view);
  },
  
  // Initialize theme on app start
  initializeTheme() {
    const savedTheme = localStorage.getItem('theme') as UIState['theme'] | null;
    if (savedTheme) {
      uiActions.setTheme(savedTheme);
    } else {
      uiActions.setTheme('system');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (state.theme === 'system') {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    });
  },
  
  // Save theme preference
  saveThemePreference(theme: UIState['theme']) {
    localStorage.setItem('theme', theme);
  },
};

// Export store
export const uiStore = state;