import { Component, createSignal } from "solid-js";
import { HiOutlineBars3, HiOutlineMagnifyingGlass, HiOutlineBell, HiOutlineCog } from "solid-icons/hi";

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

const Header: Component<HeaderProps> = (props) => {
  const [searchQuery, setSearchQuery] = createSignal("");

  return (
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            class="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle sidebar"
            onClick={props.onToggleMobileSidebar}
          >
            <HiOutlineBars3 class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            EvorBrain
          </h1>
        </div>

        <div class="flex items-center gap-4">
          <div class="relative hidden md:block">
            <input
              type="text"
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              placeholder="Search..."
              class="w-64 px-4 py-2 pl-10 pr-4 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-evorbrain-500 dark:text-white"
            />
            <HiOutlineMagnifyingGlass class="absolute left-3 top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>

          <button
            class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Notifications"
          >
            <HiOutlineBell class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Settings"
          >
            <HiOutlineCog class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;