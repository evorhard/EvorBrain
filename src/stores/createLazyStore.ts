import { createStore as solidCreateStore, type Store } from 'solid-js/store';
import { batch } from 'solid-js';
import type { StoreOptions } from './types';

/**
 * Creates a lazy-initialized store factory that can be used for better testing.
 * The store is not created until the factory function is called.
 */
export function createLazyStore<T extends object>(
  initialState: () => T,
  options?: StoreOptions,
): () => {
  state: Store<T>;
  setState: ReturnType<typeof solidCreateStore>[1];
} {
  let store: Store<T> | null = null;
  let setStore: ReturnType<typeof solidCreateStore>[1] | null = null;

  return () => {
    if (!store || !setStore) {
      // Call initialState function to get fresh state
      const [s, ss] = solidCreateStore<T>(initialState());
      store = s;
      setStore = ss;

      // Set up debug logging if enabled
      if (options?.debug) {
        const storeName = options.name || 'Unknown';
        console.warn(`[${storeName} Store] Initialized with state:`, initialState());
      }
    }

    return {
      state: store,
      setState: setStore,
    };
  };
}

/**
 * Helper to batch multiple store updates
 */
export function batchUpdates(fn: () => void) {
  batch(fn);
}
