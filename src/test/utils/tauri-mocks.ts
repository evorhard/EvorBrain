import { vi, expect } from 'vitest';
import type { Mock } from 'vitest';

/**
 * Tauri command mocking utilities for testing
 */

export interface MockTauriOptions {
  /** Default delay in ms to simulate async behavior */
  delay?: number;
  /** Whether to automatically fail on unknown commands */
  failOnUnknownCommand?: boolean;
}

/**
 * Enhanced mock for Tauri invoke function with better type safety
 */
export class TauriMock {
  private mockFn: Mock;
  private commandHandlers: Map<string, (args?: unknown) => unknown> = new Map();
  private defaultDelay: number;
  private failOnUnknownCommand: boolean;

  constructor(options: MockTauriOptions = {}) {
    this.mockFn = vi.fn();
    this.defaultDelay = options.delay ?? 0;
    this.failOnUnknownCommand = options.failOnUnknownCommand ?? false;
    this.setupDefaultImplementation();
  }

  private setupDefaultImplementation() {
    this.mockFn.mockImplementation(async (command: string, args?: unknown) => {
      const handler = this.commandHandlers.get(command);

      if (!handler) {
        if (this.failOnUnknownCommand) {
          throw new Error(`Unknown Tauri command: ${command}`);
        }
        return undefined;
      }

      // Simulate async delay
      if (this.defaultDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.defaultDelay));
      }

      return handler(args);
    });
  }

  /**
   * Register a handler for a specific command
   */
  onCommand<T = unknown>(command: string, handler: (args?: unknown) => T | Promise<T>) {
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
    this.setupDefaultImplementation();
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
 */
export const mockTauriSuccess = <T>(command: string, response: T) => {
  const mockInvoke = vi.fn().mockResolvedValueOnce(response);
  vi.mock('@tauri-apps/api/core', () => ({
    invoke: mockInvoke,
  }));
  return mockInvoke;
};

/**
 * Mock Tauri errors
 */
export const mockTauriError = (command: string, error: string | Error) => {
  const mockInvoke = vi
    .fn()
    .mockRejectedValueOnce(typeof error === 'string' ? new Error(error) : error);
  vi.mock('@tauri-apps/api/core', () => ({
    invoke: mockInvoke,
  }));
  return mockInvoke;
};

/**
 * Create a mock that simulates loading states
 */
export const createLoadingMock = (finalResponse: unknown, loadingTime = 100) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(finalResponse), loadingTime);
  });
