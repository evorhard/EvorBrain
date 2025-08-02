import { createContext, useContext, type ParentComponent } from 'solid-js';
import { createLifeAreaStore } from './lifeAreaStore.lazy';
import { api } from '../lib/api';

interface LazyStoreContextValue {
  lifeAreaStore: ReturnType<typeof createLifeAreaStore>;
  // Add other stores here as they are refactored
}

const LazyStoreContext = createContext<LazyStoreContextValue>();

/**
 * Store provider that uses lazy initialization for better testability.
 * Stores are created when the provider is mounted, not when modules are imported.
 */
export const LazyStoreProvider: ParentComponent = (props) => {
  // Create stores with dependency injection
  const lifeAreaStore = createLifeAreaStore(api);

  // Add other stores here as they are refactored
  // const goalStore = createGoalStore(api);
  // const projectStore = createProjectStore(api);
  // const taskStore = createTaskStore(api);

  const value: LazyStoreContextValue = {
    lifeAreaStore,
    // Add other stores here
  };

  return <LazyStoreContext.Provider value={value}>{props.children}</LazyStoreContext.Provider>;
};

export function useLazyStore() {
  const context = useContext(LazyStoreContext);
  if (!context) {
    throw new Error('useLazyStore must be used within a LazyStoreProvider');
  }
  return context;
}

// Convenience hook for life area store
export function useLazyLifeAreaStore() {
  const { lifeAreaStore } = useLazyStore();
  return {
    store: lifeAreaStore.state,
    actions: lifeAreaStore.actions,
    selectedLifeArea: lifeAreaStore.selectedLifeArea,
    activeLifeAreas: lifeAreaStore.activeLifeAreas,
  };
}

/**
 * Create a test provider with mocked API for testing
 */
export function createTestStoreProvider(mockApi: unknown): ParentComponent {
  return (props) => {
    const lifeAreaStore = createLifeAreaStore(mockApi);

    const value: LazyStoreContextValue = {
      lifeAreaStore,
    };

    return <LazyStoreContext.Provider value={value}>{props.children}</LazyStoreContext.Provider>;
  };
}
