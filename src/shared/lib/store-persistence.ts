/**
 * Store Persistence Utilities
 * 
 * Shared utilities for Zustand store persistence with migration support
 */

import type { StateStorage } from 'zustand/middleware';
import { storeLogger } from './logger';

/**
 * Custom storage adapter for Zustand persist middleware
 * Uses localStorage with error handling and migration support
 */
export const createStorageAdapter = (): StateStorage => ({
  getItem: (name: string) => {
    try {
      const item = localStorage.getItem(name);
      return item ?? null;
    } catch (error) {
      storeLogger.error(`Failed to get item from storage: ${name}`, error);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      storeLogger.error(`Failed to set item in storage: ${name}`, error);
      // Handle storage quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Clear old data or notify user
        storeLogger.warn('Storage quota exceeded, clearing old data...');
        clearOldStorageData();
      }
    }
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      storeLogger.error(`Failed to remove item from storage: ${name}`, error);
    }
  },
});

/**
 * Migration function type
 */
type Migration<T> = (persistedState: unknown) => T;

/**
 * Create a migration function with version checking
 */
export const createMigration = <T>(
  currentVersion: number,
  migrations: Record<number, Migration<T>>
): Migration<T> => {
  return (persistedState: unknown) => {
    const typed = persistedState as { version?: number } | null | undefined;
    const storedVersion = typed?.version ?? 0;
    let state = typed as T & { version: number };

    // Apply all migrations from stored version to current version
    for (let v = storedVersion + 1; v <= currentVersion; v++) {
      const migration = migrations[v];
      if (migration) {
        state = migration(state) as T & { version: number };
      }
    }

    // Set the current version
    state.version = currentVersion;
    return state;
  };
};

/**
 * Clear old storage data to free up space
 */
const clearOldStorageData = (): void => {
  const keysToKeep = [
    'tasks-storage',
    'life-areas-storage',
    'goals-storage',
    'projects-storage',
    'app-preferences',
  ];

  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    storeLogger.error('Failed to clear old storage data', error);
  }
};

/**
 * Storage size utilities
 */
export const getStorageSize = (): number => {
  let size = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        size += value.length + key.length;
      }
    }
  }
  return size;
};

export const formatStorageSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Create persist configuration with common defaults
 */
export interface PersistConfig<T> {
  name: string;
  partialize?: (state: T) => Partial<T>;
  migrate?: Migration<T>;
  skipHydration?: boolean;
}

export const createPersistConfig = <T>({
  name,
  partialize,
  migrate,
  skipHydration = false,
}: PersistConfig<T>): {
  name: string;
  storage: StateStorage;
  partialize?: (state: T) => Partial<T>;
  migrate?: Migration<T>;
  skipHydration: boolean;
} => {
  const config: {
    name: string;
    storage: StateStorage;
    partialize?: (state: T) => Partial<T>;
    migrate?: Migration<T>;
    skipHydration: boolean;
  } = {
    name,
    storage: createStorageAdapter(),
    skipHydration,
  };
  
  if (partialize) {
    config.partialize = partialize;
  }
  
  if (migrate) {
    config.migrate = migrate;
  }
  
  return config;
};