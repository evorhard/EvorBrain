import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <MainLayout>
      <div class="space-y-6">
        <div class="bg-surface rounded-lg shadow-card p-6 transition-shadow hover:shadow-card-hover">
          <h2 class="text-2xl font-bold text-content mb-4">
            Welcome to EvorBrain
          </h2>
          <p class="text-content-secondary">
            Your intelligent life management system. Start by creating your first task or exploring the features.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-surface rounded-lg shadow-card p-6 transition-shadow hover:shadow-card-hover">
            <h3 class="text-lg font-semibold text-content mb-2">
              Quick Actions
            </h3>
            <div class="space-y-2">
              <button class="w-full text-left px-4 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors text-content focus-ring">
                + New Task
              </button>
              <button class="w-full text-left px-4 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors text-content focus-ring">
                + New Note
              </button>
              <button class="w-full text-left px-4 py-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors text-content focus-ring">
                + New Project
              </button>
            </div>
          </div>

          <div class="bg-surface rounded-lg shadow-card p-6 transition-shadow hover:shadow-card-hover">
            <h3 class="text-lg font-semibold text-content mb-2">
              Today's Tasks
            </h3>
            <p class="text-content-tertiary text-sm">
              No tasks scheduled for today
            </p>
          </div>

          <div class="bg-surface rounded-lg shadow-card p-6 transition-shadow hover:shadow-card-hover">
            <h3 class="text-lg font-semibold text-content mb-2">
              Recent Activity
            </h3>
            <p class="text-content-tertiary text-sm">
              No recent activity
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default App;
