// Central export for all stores
export * from './types';
export * from './StoreProvider';
export { lifeAreaStore, lifeAreaActions } from './lifeAreaStore';
export { goalStore, goalActions } from './goalStore';
export { projectStore, projectActions } from './projectStore';
export { taskStore, taskActions } from './taskStore';
export { uiStore, uiActions } from './uiStore';

// Re-export hooks for convenience
export {
  useStore,
  useLifeAreaStore,
  useGoalStore,
  useProjectStore,
  useTaskStore,
  useUIStore,
} from './StoreProvider';
