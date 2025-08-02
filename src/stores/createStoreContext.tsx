import { createContext, useContext, createRoot, type ParentComponent } from 'solid-js';
import type { StoreActions } from './createStore';

/**
 * Configuration for creating a store context
 * @template T - The store state type
 */
export interface CreateStoreContextConfig<T extends object> {
  /** The factory function that creates the store and derived state */
  factory: () => {
    state: T;
    actions: StoreActions<T>;
    computed?: Record<string, unknown>;
  };
  /** Name for the store (used in error messages) */
  name: string;
}

/**
 * Creates a context-based store with proper reactive disposal
 * This ensures that all reactive computations are created within a root
 * and properly disposed when the provider unmounts
 *
 * @template T - The store state type
 * @param config - Configuration for the store
 * @returns An object containing the Provider component and useStore hook
 *
 * @example
 * ```tsx
 * // Define the store
 * const GoalStoreContext = createStoreContext({
 *   name: 'GoalStore',
 *   factory: () => {
 *     const [state, actions] = createStore(initialState);
 *
 *     // Create computed values inside the factory
 *     const computed = {
 *       activeGoals: createMemo(() => state.items.filter(g => !g.archived_at)),
 *       selectedGoal: createMemo(() => state.items.find(g => g.id === state.selectedId))
 *     };
 *
 *     return { state, actions, computed };
 *   }
 * });
 *
 * // Use in your app
 * <GoalStoreContext.Provider>
 *   <App />
 * </GoalStoreContext.Provider>
 *
 * // Access in components
 * const { state, actions, computed } = GoalStoreContext.useStore();
 * ```
 */
export function createStoreContext<T extends object>(config: CreateStoreContextConfig<T>) {
  const { factory, name } = config;

  type StoreValue = ReturnType<typeof factory>;
  const StoreContext = createContext<StoreValue>();

  const Provider: ParentComponent = (props) => {
    // Create store instance within a reactive root
    const storeInstance = createRoot(() => factory());

    return <StoreContext.Provider value={storeInstance}>{props.children}</StoreContext.Provider>;
  };

  const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
      throw new Error(`use${name} must be used within ${name}Provider`);
    }
    return context;
  };

  return {
    Provider,
    useStore,
  };
}

/**
 * Creates a lazy store instance for testing
 * This allows tests to create stores on-demand without context
 *
 * @template T - The store state type
 * @param factory - The factory function that creates the store
 * @returns A function that creates a new store instance
 */
export function createTestStore<T extends object>(
  factory: () => { state: T; actions: StoreActions<T>; computed?: Record<string, unknown> },
) {
  return () => {
    let storeInstance: ReturnType<typeof factory> | null = null;
    let dispose: (() => void) | null = null;

    const getStore = () => {
      if (!storeInstance) {
        createRoot((disposer) => {
          storeInstance = factory();
          dispose = disposer;
        });
      }
      return storeInstance as NonNullable<typeof storeInstance>;
    };

    const cleanup = () => {
      if (dispose) {
        dispose();
        storeInstance = null;
        dispose = null;
      }
    };

    return { getStore, cleanup };
  };
}
