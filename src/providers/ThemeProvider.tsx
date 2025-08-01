import { createContext, useContext, type Component, type JSX } from 'solid-js';
import { createTheme } from '../lib/theme';

type ThemeContextType = ReturnType<typeof createTheme>;

const ThemeContext = createContext<ThemeContextType>();

export const ThemeProvider: Component<{ children: JSX.Element }> = (props) => {
  const theme = createTheme();

  return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
