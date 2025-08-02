import MainLayout from './components/layout/MainLayout';
import { Container } from './components/ui/Container';
import { invoke } from '@tauri-apps/api/core';
import { createSignal, onMount, Switch, Match } from 'solid-js';
import { StoreProvider, useUIStore } from './stores';
import { uiActions } from './stores/uiStore';
import { GoalsPage } from './components/features/goals';
import { ProjectsPage } from './components/features/projects';
import TasksPage from './components/features/tasks/TasksPage';
import { LifeAreaList } from './components/features';

function AppContent() {
  const { store: uiStore } = useUIStore();
  const [dbStatus, setDbStatus] = createSignal<string>('');

  const testDatabase = async () => {
    try {
      const result = await invoke<string>('test_database');
      setDbStatus(result);
    } catch (error) {
      setDbStatus(`Error: ${error}`);
    }
  };

  return (
    <MainLayout>
      <Switch>
        <Match when={uiStore.activeView === 'goals'}>
          <Container class="py-4 sm:py-6 lg:py-8">
            <GoalsPage />
          </Container>
        </Match>
        <Match when={uiStore.activeView === 'projects'}>
          <Container class="py-4 sm:py-6 lg:py-8">
            <ProjectsPage />
          </Container>
        </Match>
        <Match when={uiStore.activeView === 'tasks'}>
          <Container class="py-4 sm:py-6 lg:py-8">
            <TasksPage />
          </Container>
        </Match>
        <Match when={uiStore.activeView === 'life-areas'}>
          <Container class="py-4 sm:py-6 lg:py-8">
            <h1 class="mb-6 text-2xl font-bold">Life Areas</h1>
            <LifeAreaList />
          </Container>
        </Match>
        <Match when={uiStore.activeView === 'dashboard'}>
          <Container class="py-4 sm:py-6 lg:py-8">
            <div class="space-y-4 sm:space-y-6">
              <div class="bg-surface shadow-card hover:shadow-card-hover rounded-lg p-4 transition-shadow sm:p-6">
                <h2 class="text-content mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">
                  Welcome to EvorBrain
                </h2>
                <p class="text-content-secondary text-sm sm:text-base">
                  Your intelligent life management system. Start by creating your first task or
                  exploring the features.
                </p>
                <div class="mt-4">
                  <button
                    onClick={testDatabase}
                    class="bg-primary hover:bg-primary-600 rounded-md px-4 py-2 text-white transition-colors"
                  >
                    Test Database Connection
                  </button>
                  {dbStatus() && <p class="text-content-secondary mt-2 text-sm">{dbStatus()}</p>}
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                <div class="bg-surface shadow-card hover:shadow-card-hover rounded-lg p-4 transition-shadow sm:p-6">
                  <h3 class="text-content mb-2 text-base font-semibold sm:text-lg">
                    Quick Actions
                  </h3>
                  <div class="space-y-2">
                    <button class="hover:bg-surface-100 dark:hover:bg-surface-200 text-content focus-ring w-full rounded-md px-3 py-2 text-left text-sm transition-colors sm:px-4 sm:text-base">
                      + New Task
                    </button>
                    <button class="hover:bg-surface-100 dark:hover:bg-surface-200 text-content focus-ring w-full rounded-md px-3 py-2 text-left text-sm transition-colors sm:px-4 sm:text-base">
                      + New Note
                    </button>
                    <button class="hover:bg-surface-100 dark:hover:bg-surface-200 text-content focus-ring w-full rounded-md px-3 py-2 text-left text-sm transition-colors sm:px-4 sm:text-base">
                      + New Project
                    </button>
                  </div>
                </div>

                <div class="bg-surface shadow-card hover:shadow-card-hover rounded-lg p-4 transition-shadow sm:p-6">
                  <h3 class="text-content mb-2 text-base font-semibold sm:text-lg">
                    Today's Tasks
                  </h3>
                  <p class="text-content-tertiary text-sm">No tasks scheduled for today</p>
                </div>

                <div class="bg-surface shadow-card hover:shadow-card-hover rounded-lg p-4 transition-shadow sm:col-span-2 sm:p-6 lg:col-span-1">
                  <h3 class="text-content mb-2 text-base font-semibold sm:text-lg">
                    Recent Activity
                  </h3>
                  <p class="text-content-tertiary text-sm">No recent activity</p>
                </div>
              </div>
            </div>
          </Container>
        </Match>
      </Switch>
    </MainLayout>
  );
}

function App() {
  onMount(() => {
    // Initialize theme on app start
    uiActions.initializeTheme();
  });

  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
