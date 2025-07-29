import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <MainLayout>
      <div class="space-y-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to EvorBrain
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Your intelligent life management system. Start by creating your first task or exploring the features.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Quick Actions
            </h3>
            <div class="space-y-2">
              <button class="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
                + New Task
              </button>
              <button class="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
                + New Note
              </button>
              <button class="w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">
                + New Project
              </button>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Today's Tasks
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              No tasks scheduled for today
            </p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Recent Activity
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              No recent activity
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default App;
