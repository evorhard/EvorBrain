/* @refresh reload */
import { render } from 'solid-js/web';
import './index.css';
import App from './App';
import { ThemeProvider } from './providers/ThemeProvider';

render(
  () => (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  ),
  document.getElementById('root') as HTMLElement,
);
