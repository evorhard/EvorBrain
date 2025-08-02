import { type ParentComponent } from 'solid-js';
import {
  LifeAreaStoreProvider,
  useLifeAreaStore,
  type createLifeAreaStore,
} from './lifeAreaStore.context';
import { GoalStoreProvider, useGoalStore, type createGoalStore } from './goalStore.context';
import {
  ProjectStoreProvider,
  useProjectStore,
  type createProjectStore,
} from './projectStore.context';
import { TaskStoreProvider, useTaskStore, type createTaskStore } from './taskStore.context';

/**
 * Root store provider that wraps all individual store providers.
 * This allows each store to be tested in isolation while providing
 * a convenient way to provide all stores to the app.
 */
export const StoreProvider: ParentComponent = (props) => (
  <LifeAreaStoreProvider>
    <GoalStoreProvider>
      <ProjectStoreProvider>
        <TaskStoreProvider>{props.children}</TaskStoreProvider>
      </ProjectStoreProvider>
    </GoalStoreProvider>
  </LifeAreaStoreProvider>
);

// Re-export hooks for convenience
export { useLifeAreaStore, useGoalStore, useProjectStore, useTaskStore };

// Helper to create a test provider with custom stores
export interface TestStoreProviders {
  lifeArea?: ReturnType<typeof createLifeAreaStore>;
  goal?: ReturnType<typeof createGoalStore>;
  project?: ReturnType<typeof createProjectStore>;
  task?: ReturnType<typeof createTaskStore>;
}

export function createTestStoreProvider(_stores: TestStoreProviders): ParentComponent {
  return (props) => (
    // Note: This is a simplified version for testing.
    // In a real test scenario, you would import these providers statically
    // or use a different approach to avoid dynamic imports
    <>{props.children}</>
  );
}
