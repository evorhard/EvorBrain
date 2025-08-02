import { vi, expect, type Mock } from 'vitest';

/**
 * Tauri command mocking utilities for testing
 */

export interface MockTauriOptions {
  /** Default delay in ms to simulate async behavior */
  delay?: number;
  /** Whether to automatically fail on unknown commands */
  failOnUnknownCommand?: boolean;
  /** Whether to log all commands for debugging */
  logCommands?: boolean;
}

/**
 * Enhanced mock for Tauri invoke function with better type safety
 */
export class TauriMock {
  private mockFn: Mock;
  private commandHandlers: Map<string, (args?: unknown) => unknown> = new Map();
  private defaultDelay: number;
  private failOnUnknownCommand: boolean;
  private logCommands: boolean;
  private commandCalls: Map<string, unknown[]> = new Map();
  private commandCallCounts: Map<string, number> = new Map();

  constructor(options: MockTauriOptions = {}) {
    this.mockFn = vi.fn();
    this.defaultDelay = options.delay ?? 0;
    this.failOnUnknownCommand = options.failOnUnknownCommand ?? false;
    this.logCommands = options.logCommands ?? false;
    this.setupDefaultImplementation();
  }

  private setupDefaultImplementation() {
    this.mockFn.mockImplementation(async (command: string, args?: unknown) => {
      // Log command if debugging is enabled
      if (this.logCommands) {
        // eslint-disable-next-line no-console
        console.log(`[TauriMock] Command: ${command}`, args);
      }

      // Track command calls
      if (!this.commandCalls.has(command)) {
        this.commandCalls.set(command, []);
      }
      this.commandCalls.get(command)?.push(args);

      // Track call counts
      this.commandCallCounts.set(command, (this.commandCallCounts.get(command) ?? 0) + 1);

      const handler = this.commandHandlers.get(command);

      if (!handler) {
        if (this.failOnUnknownCommand) {
          throw new Error(`Unknown Tauri command: ${command}`);
        }
        if (this.logCommands) {
          console.warn(`[TauriMock] No handler for command: ${command}`);
        }
        return undefined;
      }

      // Simulate async delay
      if (this.defaultDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.defaultDelay));
      }

      try {
        const result = await handler(args);
        if (this.logCommands) {
          // eslint-disable-next-line no-console
          console.log(`[TauriMock] Command ${command} returned:`, result);
        }
        return result;
      } catch (error) {
        if (this.logCommands) {
          console.error(`[TauriMock] Command ${command} failed:`, error);
        }
        throw error;
      }
    });
  }

  /**
   * Register a handler for a specific command
   */
  onCommand<T>(command: string, handler: (args?: unknown) => T | Promise<T>) {
    this.commandHandlers.set(command, handler);
    return this;
  }

  /**
   * Register a one-time response for a command
   */
  onceCommand<T = unknown>(command: string, response: T) {
    let called = false;
    this.onCommand(command, () => {
      if (called) {
        throw new Error(`Command ${command} called more than once`);
      }
      called = true;
      return response;
    });
    return this;
  }

  /**
   * Set up a command to always fail
   */
  failCommand(command: string, error: Error | string) {
    this.onCommand(command, () => {
      throw typeof error === 'string' ? new Error(error) : error;
    });
    return this;
  }

  /**
   * Get the mock function to pass to tests
   */
  getMock() {
    return this.mockFn;
  }

  /**
   * Reset all handlers and mock state
   */
  reset() {
    this.mockFn.mockReset();
    this.commandHandlers.clear();
    this.commandCalls.clear();
    this.commandCallCounts.clear();
    this.setupDefaultImplementation();
  }

  /**
   * Get all calls for a specific command
   */
  getCommandCalls(command: string): Array<unknown> {
    return this.commandCalls.get(command) ?? [];
  }

  /**
   * Get the last call arguments for a command
   */
  getLastCommandCall(command: string): unknown {
    const calls = this.getCommandCalls(command);
    return calls[calls.length - 1];
  }

  /**
   * Check if a command was called
   */
  wasCommandCalled(command: string): boolean {
    return (this.commandCallCounts.get(command) ?? 0) > 0;
  }

  /**
   * Get the number of times a command was called
   */
  getCommandCallCount(command: string): number {
    return this.commandCallCounts.get(command) ?? 0;
  }

  /**
   * Assert that a command was called with specific arguments
   */
  expectCommand(command: string) {
    return {
      toHaveBeenCalledWith: (expectedArgs?: unknown) => {
        expect(this.mockFn).toHaveBeenCalledWith(command, expectedArgs);
      },
      toHaveBeenCalledTimes: (times: number) => {
        const calls = this.mockFn.mock.calls.filter((call) => call[0] === command);
        expect(calls).toHaveLength(times);
      },
      notToHaveBeenCalled: () => {
        const calls = this.mockFn.mock.calls.filter((call) => call[0] === command);
        expect(calls).toHaveLength(0);
      },
    };
  }
}

/**
 * Pre-configured mocks for common CRUD operations
 */
export const createCrudMocks = () => {
  const mock = new TauriMock();

  // Life Areas
  mock.onCommand('get_life_areas', () => []);
  mock.onCommand('create_life_area', ({ request }) => ({
    id: 'test-id',
    ...request,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
  }));
  mock.onCommand('update_life_area', ({ id, updates }) => ({
    id,
    ...updates,
    updated_at: new Date().toISOString(),
  }));
  mock.onCommand('delete_life_area', () => null);
  mock.onCommand('restore_life_area', () => null);

  // Goals
  mock.onCommand('get_goals', () => []);
  mock.onCommand('get_goals_by_life_area', () => []);
  mock.onCommand('create_goal', ({ request }) => ({
    id: 'test-goal-id',
    ...request,
    completed_at: null,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
  }));

  // Tasks
  mock.onCommand('get_tasks', () => []);
  mock.onCommand('get_tasks_by_project', () => []);
  mock.onCommand('create_task', ({ request }) => ({
    id: 'test-task-id',
    ...request,
    completed_at: null,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
  }));
  mock.onCommand('complete_task', ({ id }) => ({
    id,
    completed_at: new Date().toISOString(),
  }));
  mock.onCommand('uncomplete_task', ({ id }) => ({
    id,
    completed_at: null,
  }));

  return mock;
};

/**
 * Mock successful Tauri responses
 * @deprecated Use TauriMock class instead
 */
// export const mockTauriSuccess = <T>(command: string, response: T) => {
//   const mockInvoke = vi.fn().mockResolvedValueOnce(response);
//   vi.mock('@tauri-apps/api/core', () => ({
//     invoke: mockInvoke,
//   }));
//   return mockInvoke;
// };

/**
 * Mock Tauri errors
 * @deprecated Use TauriMock class instead
 */
// export const mockTauriError = (command: string, error: string | Error) => {
//   const mockInvoke = vi
//     .fn()
//     .mockRejectedValueOnce(typeof error === 'string' ? new Error(error) : error);
//   vi.mock('@tauri-apps/api/core', () => ({
//     invoke: mockInvoke,
//   }));
//   return mockInvoke;
// };

/**
 * Create a mock that simulates loading states
 */
export const createLoadingMock = (finalResponse: unknown, loadingTime = 100) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(finalResponse), loadingTime);
  });

/**
 * Install TauriMock globally for all tests in a file
 * This should be called in a beforeEach hook
 */
export function installTauriMock(mock: TauriMock) {
  // @ts-expect-error - We're mocking a global
  window.__TAURI__ = {
    invoke: mock.getMock(),
  };

  // Also mock the module import
  vi.doMock('@tauri-apps/api/core', () => ({
    invoke: mock.getMock(),
  }));
}

/**
 * Uninstall TauriMock and restore original state
 * This should be called in an afterEach hook
 */
export function uninstallTauriMock() {
  // @ts-expect-error - We're cleaning up our mock
  delete window.__TAURI__;

  // Clear module mock
  vi.doUnmock('@tauri-apps/api/core');
}

/**
 * Create a TauriMock instance with state management capabilities
 */
export class StatefulTauriMock extends TauriMock {
  private state: Map<string, unknown> = new Map();

  /**
   * Set initial state for testing
   */
  setState(key: string, value: unknown) {
    this.state.set(key, value);
    return this;
  }

  /**
   * Get current state
   */
  getState(key: string): unknown {
    return this.state.get(key);
  }

  /**
   * Clear all state
   */
  clearState() {
    this.state.clear();
    return this;
  }

  /**
   * Override reset to also clear state
   */
  reset() {
    super.reset();
    this.clearState();
  }
}
