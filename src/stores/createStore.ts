import { createStore as createSolidStore, SetStoreFunction } from 'solid-js/store';
import { batch } from 'solid-js';

export interface StoreActions<T> {
  setState: SetStoreFunction<T>;
  resetState: () => void;
}

export function createStore<T extends object>(
  initialState: T,
  name?: string
): [get: T, actions: StoreActions<T>] {
  const [state, setState] = createSolidStore<T>(initialState);
  
  const actions: StoreActions<T> = {
    setState,
    resetState: () => {
      batch(() => {
        setState(initialState);
      });
    },
  };
  
  // Dev mode: log state changes
  if (import.meta.env.DEV && name) {
    const originalSetState = setState;
    actions.setState = (...args: any[]) => {
      console.log(`[${name} Store Update]`, args);
      return originalSetState(...args);
    };
  }
  
  return [state, actions];
}