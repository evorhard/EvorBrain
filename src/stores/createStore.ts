import { createStore as createSolidStore, type SetStoreFunction } from 'solid-js/store';
import { batch } from 'solid-js';

/**
 * Actions available for manipulating store state
 * @interface StoreActions
 * @template T - The store state type
 */
export interface StoreActions<T> {
  setState: SetStoreFunction<T>;
  resetState: () => void;
}

/**
 * Creates a reactive store with SolidJS
 * @template T - The store state type (must be an object)
 * @param initialState - The initial state of the store
 * @param name - Optional name for the store (used for dev logging)
 * @returns A tuple containing:
 *   - [0]: The reactive store state object
 *   - [1]: Actions for manipulating the store
 * @example
 * ```typescript
 * interface TodoState {
 *   todos: Todo[];
 *   filter: 'all' | 'active' | 'completed';
 * }
 *
 * const [state, { setState, resetState }] = createStore<TodoState>({
 *   todos: [],
 *   filter: 'all'
 * }, 'TodoStore');
 *
 * // Update state
 * setState('todos', [...state.todos, newTodo]);
 *
 * // Reset to initial state
 * resetState();
 * ```
 */
export function createStore<T extends object>(
  initialState: T,
  _name?: string,
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

  return [state, actions];
}
