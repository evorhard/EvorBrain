import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  TauriMock,
  StatefulTauriMock,
  installTauriMock,
  uninstallTauriMock,
  createLoadingMock,
} from './tauri-mocks';

describe('TauriMock', () => {
  let mock: TauriMock;

  beforeEach(() => {
    mock = new TauriMock();
  });

  afterEach(() => {
    mock.reset();
  });

  describe('Basic functionality', () => {
    it('should handle registered commands', async () => {
      mock.onCommand('test_command', () => 'test response');

      const result = await mock.getMock()('test_command');
      expect(result).toBe('test response');
    });

    it('should handle commands with arguments', async () => {
      mock.onCommand('echo', (args) => args);

      const result = await mock.getMock()('echo', { message: 'hello' });
      expect(result).toEqual({ message: 'hello' });
    });

    it('should track command calls', async () => {
      mock.onCommand('tracked_command', () => 'response');

      await mock.getMock()('tracked_command', { id: 1 });
      await mock.getMock()('tracked_command', { id: 2 });

      expect(mock.getCommandCallCount('tracked_command')).toBe(2);
      expect(mock.wasCommandCalled('tracked_command')).toBe(true);
      expect(mock.getCommandCalls('tracked_command')).toEqual([{ id: 1 }, { id: 2 }]);
      expect(mock.getLastCommandCall('tracked_command')).toEqual({ id: 2 });
    });

    it('should handle unknown commands', async () => {
      const result = await mock.getMock()('unknown_command');
      expect(result).toBeUndefined();
      expect(mock.wasCommandCalled('unknown_command')).toBe(true);
    });

    it('should fail on unknown commands when configured', async () => {
      mock = new TauriMock({ failOnUnknownCommand: true });

      await expect(mock.getMock()('unknown_command')).rejects.toThrow(
        'Unknown Tauri command: unknown_command',
      );
    });

    it('should simulate async delay', async () => {
      mock = new TauriMock({ delay: 50 });
      mock.onCommand('delayed_command', () => 'response');

      const start = Date.now();
      await mock.getMock()('delayed_command');
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Command handlers', () => {
    it('should handle one-time commands', async () => {
      mock.onceCommand('once_command', 'first response');

      const result1 = await mock.getMock()('once_command');
      expect(result1).toBe('first response');

      await expect(mock.getMock()('once_command')).rejects.toThrow(
        'Command once_command called more than once',
      );
    });

    it('should handle failing commands', async () => {
      mock.failCommand('error_command', 'Something went wrong');

      await expect(mock.getMock()('error_command')).rejects.toThrow('Something went wrong');
    });

    it('should handle async handlers', async () => {
      mock.onCommand('async_command', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'async response';
      });

      const result = await mock.getMock()('async_command');
      expect(result).toBe('async response');
    });
  });

  describe('Expectations', () => {
    it('should verify command calls with expectCommand', async () => {
      mock.onCommand('test_command', () => 'response');

      await mock.getMock()('test_command', { id: 123 });

      mock.expectCommand('test_command').toHaveBeenCalledWith({ id: 123 });
      mock.expectCommand('test_command').toHaveBeenCalledTimes(1);
      mock.expectCommand('other_command').notToHaveBeenCalled();
    });
  });

  describe('Reset functionality', () => {
    it('should clear all state on reset', async () => {
      mock.onCommand('test_command', () => 'response');
      await mock.getMock()('test_command');

      expect(mock.wasCommandCalled('test_command')).toBe(true);

      mock.reset();

      expect(mock.wasCommandCalled('test_command')).toBe(false);
      expect(mock.getCommandCallCount('test_command')).toBe(0);
    });
  });
});

describe('StatefulTauriMock', () => {
  let mock: StatefulTauriMock;

  beforeEach(() => {
    mock = new StatefulTauriMock();
  });

  it('should manage state', () => {
    mock.setState('user', { id: 1, name: 'Test User' });
    mock.setState('settings', { theme: 'dark' });

    expect(mock.getState('user')).toEqual({ id: 1, name: 'Test User' });
    expect(mock.getState('settings')).toEqual({ theme: 'dark' });

    mock.clearState();

    expect(mock.getState('user')).toBeUndefined();
    expect(mock.getState('settings')).toBeUndefined();
  });

  it('should clear state on reset', () => {
    mock.setState('test', 'value');
    expect(mock.getState('test')).toBe('value');

    mock.reset();
    expect(mock.getState('test')).toBeUndefined();
  });
});

describe('Global installation', () => {
  let mock: TauriMock;

  beforeEach(() => {
    mock = new TauriMock();
    installTauriMock(mock);
  });

  afterEach(() => {
    uninstallTauriMock();
  });

  it('should install mock globally', () => {
    expect(window.__TAURI__).toBeDefined();
    expect(window.__TAURI__.invoke).toBe(mock.getMock());
  });

  it('should clean up after uninstall', () => {
    uninstallTauriMock();
    expect(window.__TAURI__).toBeUndefined();
  });
});

describe('Utility functions', () => {
  it('should create loading mock', async () => {
    const start = Date.now();
    const result = await createLoadingMock('delayed response', 50);
    const duration = Date.now() - start;

    expect(result).toBe('delayed response');
    expect(duration).toBeGreaterThanOrEqual(50);
  });
});
