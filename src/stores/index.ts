// Central export for all stores
export * from './types';
export * from './StoreProvider';
export { lifeAreaStore, lifeAreaActions } from './lifeAreaStore';
export { uiStore, uiActions } from './uiStore';

// Re-export hooks for convenience
export { useStore, useLifeAreaStore, useUIStore } from './StoreProvider';