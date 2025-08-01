import { createContext, useContext, type ParentComponent } from 'solid-js';
import { lifeAreaStore, lifeAreaActions } from './lifeAreaStore';
import { goalStore, goalActions } from './goalStore';
import { uiStore, uiActions } from './uiStore';

interface StoreContextValue {
  stores: {
    lifeArea: typeof lifeAreaStore;
    goal: typeof goalStore;
    ui: typeof uiStore;
  };
  actions: {
    lifeArea: typeof lifeAreaActions;
    goal: typeof goalActions;
    ui: typeof uiActions;
  };
}

const StoreContext = createContext<StoreContextValue>();

export const StoreProvider: ParentComponent = (props) => {
  const value: StoreContextValue = {
    stores: {
      lifeArea: lifeAreaStore,
      goal: goalStore,
      ui: uiStore,
    },
    actions: {
      lifeArea: lifeAreaActions,
      goal: goalActions,
      ui: uiActions,
    },
  };

  return <StoreContext.Provider value={value}>{props.children}</StoreContext.Provider>;
};

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

// Convenience hooks for individual stores
export function useLifeAreaStore() {
  const { stores, actions } = useStore();
  return { store: stores.lifeArea, actions: actions.lifeArea };
}

export function useGoalStore() {
  const { stores, actions } = useStore();
  return { store: stores.goal, actions: actions.goal };
}

export function useUIStore() {
  const { stores, actions } = useStore();
  return { store: stores.ui, actions: actions.ui };
}
