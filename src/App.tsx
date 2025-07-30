import MainLayout from "./components/layout/MainLayout";
import { Container } from "./components/ui/Container";
import { invoke } from "@tauri-apps/api/core";
import { createSignal, onMount } from "solid-js";
import { StoreProvider } from "./stores";
import { uiActions } from "./stores/uiStore";

function App() {
  const [dbStatus, setDbStatus] = createSignal<string>("");

  const testDatabase = async () => {
    try {
      const result = await invoke<string>("test_database");
      setDbStatus(result);
    } catch (error) {
      setDbStatus(`Error: ${error}`);
    }
  };
  
  onMount(() => {
    // Initialize theme on app start
    uiActions.initializeTheme();
  });
  
  return (
    <StoreProvider>
      <MainLayout>
      <Container class="py-4 sm:py-6 lg:py-8">
        <div class="space-y-4 sm:space-y-6">
          <div class="bg-surface rounded-lg shadow-card p-4 sm:p-6 transition-shadow hover:shadow-card-hover">
            <h2 class="text-xl sm:text-2xl font-bold text-content mb-3 sm:mb-4">
              Welcome to EvorBrain
            </h2>
            <p class="text-sm sm:text-base text-content-secondary">
              Your intelligent life management system. Start by creating your first task or exploring the features.
            </p>
            <div class="mt-4">
              <button 
                onClick={testDatabase}
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
              >
                Test Database Connection
              </button>
              {dbStatus() && (
                <p class="mt-2 text-sm text-content-secondary">{dbStatus()}</p>
              )}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div class="bg-surface rounded-lg shadow-card p-4 sm:p-6 transition-shadow hover:shadow-card-hover">
              <h3 class="text-base sm:text-lg font-semibold text-content mb-2">
                Quick Actions
              </h3>
              <div class="space-y-2">
                <button class="w-full text-left px-3 sm:px-4 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors text-sm sm:text-base text-content focus-ring">
                  + New Task
                </button>
                <button class="w-full text-left px-3 sm:px-4 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors text-sm sm:text-base text-content focus-ring">
                  + New Note
                </button>
                <button class="w-full text-left px-3 sm:px-4 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors text-sm sm:text-base text-content focus-ring">
                  + New Project
                </button>
              </div>
            </div>

            <div class="bg-surface rounded-lg shadow-card p-4 sm:p-6 transition-shadow hover:shadow-card-hover">
              <h3 class="text-base sm:text-lg font-semibold text-content mb-2">
                Today's Tasks
              </h3>
              <p class="text-content-tertiary text-sm">
                No tasks scheduled for today
              </p>
            </div>

            <div class="bg-surface rounded-lg shadow-card p-4 sm:p-6 transition-shadow hover:shadow-card-hover sm:col-span-2 lg:col-span-1">
              <h3 class="text-base sm:text-lg font-semibold text-content mb-2">
                Recent Activity
              </h3>
              <p class="text-content-tertiary text-sm">
                No recent activity
              </p>
            </div>
          </div>
        </div>
      </Container>
    </MainLayout>
    </StoreProvider>
  );
}

export default App;
