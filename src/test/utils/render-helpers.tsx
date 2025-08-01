import { render } from '@solidjs/testing-library';
import type { RenderResult } from '@solidjs/testing-library';
import { createContext, useContext } from 'solid-js';
import type { JSX, Component } from 'solid-js';
import { MemoryRouter } from '@solidjs/router';
import type { Mock } from 'vitest';

/**
 * Render helpers for SolidJS component testing
 */

export interface RenderOptions {
  /** Wrap component with router */
  withRouter?: boolean;
  /** Initial route for router */
  initialRoute?: string;
  /** Providers to wrap the component */
  wrapper?: Component<{ children: JSX.Element }>;
  /** Mock Tauri invoke function */
  mockInvoke?: Mock;
}

/**
 * Enhanced render function with common wrappers
 */
export function renderWithProviders(
  ui: () => JSX.Element,
  options: RenderOptions = {},
): RenderResult {
  const { withRouter = false, initialRoute = '/', wrapper: Wrapper, mockInvoke } = options;

  // Set up mock invoke if provided
  if (mockInvoke && typeof window !== 'undefined') {
    (window as Window & { __TAURI__?: { tauri: { invoke: Mock } } }).__TAURI__ = {
      tauri: {
        invoke: mockInvoke,
      },
    };
  }

  let component = ui;

  // Wrap with router if needed
  if (withRouter) {
    const RouterWrapper: Component<{ children: JSX.Element }> = (props) => (
      <MemoryRouter initialEntries={[initialRoute]}>{props.children}</MemoryRouter>
    );
    const originalComponent = component;
    component = () => <RouterWrapper>{originalComponent()}</RouterWrapper>;
  }

  // Apply custom wrapper if provided
  if (Wrapper) {
    const originalComponent = component;
    component = () => <Wrapper>{originalComponent()}</Wrapper>;
  }

  return render(component);
}

/**
 * Create a test context provider
 */
export function createTestContext<T>(defaultValue: T) {
  const Context = createContext<T>(defaultValue);

  const TestProvider: Component<{ value?: T; children: JSX.Element }> = (props) => {
    const value = () => props.value ?? defaultValue;
    return <Context.Provider value={value()}>{props.children}</Context.Provider>;
  };

  return {
    Context,
    Provider: TestProvider,
    useTestContext: () => useContext(Context),
  };
}

/**
 * Render with mock theme context
 */
export function renderWithTheme(ui: () => JSX.Element, theme: 'light' | 'dark' = 'light') {
  const ThemeProvider: Component<{ children: JSX.Element }> = (props) => (
    <div class={theme === 'dark' ? 'dark' : ''}>{props.children}</div>
  );

  return renderWithProviders(ui, { wrapper: ThemeProvider });
}

/**
 * Render a component that needs loading states
 */
export async function renderWithLoadingState(
  ui: () => JSX.Element,
  options: RenderOptions & {
    loadingDelay?: number;
    onLoad?: () => void | Promise<void>;
  } = {},
) {
  const { loadingDelay = 100, onLoad, ...renderOptions } = options;

  const result = renderWithProviders(ui, renderOptions);

  // Wait for loading to complete
  await new Promise((resolve) => setTimeout(resolve, loadingDelay));

  if (onLoad) {
    await onLoad();
  }

  return result;
}

/**
 * Render with mock data providers
 */
export function renderWithMockData<T extends Record<string, unknown>>(
  ui: () => JSX.Element,
  mockData: T,
  options: RenderOptions = {},
) {
  const MockDataContext = createContext(mockData);

  const MockDataProvider: Component<{ children: JSX.Element }> = (props) => (
    <MockDataContext.Provider value={mockData}>{props.children}</MockDataContext.Provider>
  );

  return {
    ...renderWithProviders(ui, { ...options, wrapper: MockDataProvider }),
    mockData,
    updateMockData: (updates: Partial<T>) => {
      Object.assign(mockData, updates);
    },
  };
}

/**
 * Render component with error boundary
 */
export function renderWithErrorBoundary(
  ui: () => JSX.Element,
  options: RenderOptions & {
    onError?: (error: Error) => void;
  } = {},
) {
  const { onError: _onError, ...renderOptions } = options;

  const ErrorBoundary: Component<{ children: JSX.Element }> = (props) => (
    <div class="error-boundary-wrapper">{props.children}</div>
  );

  // Note: SolidJS doesn't have built-in error boundaries like React
  // This is a placeholder for when error boundary support is added
  return renderWithProviders(ui, { ...renderOptions, wrapper: ErrorBoundary });
}

/**
 * Utility to wait for async updates
 */
export async function waitForUpdate(ms = 50) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Render with all common providers
 */
export function renderWithAllProviders(
  ui: () => JSX.Element,
  options: RenderOptions & {
    theme?: 'light' | 'dark';
    mockData?: Record<string, unknown>;
  } = {},
) {
  const { theme = 'light', mockData: _mockData = {}, ...renderOptions } = options;

  const AllProviders: Component<{ children: JSX.Element }> = (props) => (
    <div class={theme === 'dark' ? 'dark' : ''}>{props.children}</div>
  );

  return renderWithProviders(ui, {
    ...renderOptions,
    wrapper: AllProviders,
    withRouter: true,
  });
}
