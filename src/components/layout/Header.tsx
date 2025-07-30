import { Component, createSignal, Show } from "solid-js";
import { HiOutlineBars3, HiOutlineMagnifyingGlass, HiOutlineBell, HiOutlineCog } from "solid-icons/hi";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

const Header: Component<HeaderProps> = (props) => {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [showMobileSearch, setShowMobileSearch] = createSignal(false);

  return (
    <header class="bg-surface border-b border-border">
      <div class="px-3 sm:px-4 lg:px-6 py-3">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 sm:gap-4">
            <button
              class="lg:hidden p-2 -ml-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors focus-ring"
              aria-label="Toggle sidebar"
              onClick={props.onToggleMobileSidebar}
            >
              <HiOutlineBars3 class="w-5 h-5 text-content-secondary" />
            </button>
            
            <h1 class="text-lg sm:text-xl font-semibold text-content">
              EvorBrain
            </h1>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search */}
            <div class="relative hidden md:block">
              <input
                type="text"
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                placeholder="Search..."
                class="w-48 lg:w-64 px-4 py-2 pl-10 pr-4 text-sm bg-surface-100 dark:bg-surface-200 border border-border rounded-lg focus-ring placeholder:text-content-tertiary"
              />
              <HiOutlineMagnifyingGlass class="absolute left-3 top-2.5 w-5 h-5 text-content-tertiary" />
            </div>

            {/* Mobile Search Toggle */}
            <button
              class="md:hidden p-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors focus-ring"
              aria-label="Search"
              onClick={() => setShowMobileSearch(!showMobileSearch())}
            >
              <HiOutlineMagnifyingGlass class="w-5 h-5 text-content-secondary" />
            </button>

            <button
              class="p-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors focus-ring"
              aria-label="Notifications"
            >
              <HiOutlineBell class="w-5 h-5 text-content-secondary" />
            </button>

            <ThemeToggle />
            
            <button
              class="hidden xs:block p-2 rounded-md hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors focus-ring"
              aria-label="Settings"
            >
              <HiOutlineCog class="w-5 h-5 text-content-secondary" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <Show when={showMobileSearch()}>
          <div class="mt-3 md:hidden">
            <div class="relative">
              <input
                type="text"
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                placeholder="Search..."
                class="w-full px-4 py-2 pl-10 pr-4 text-sm bg-surface-100 dark:bg-surface-200 border border-border rounded-lg focus-ring placeholder:text-content-tertiary"
                autofocus
              />
              <HiOutlineMagnifyingGlass class="absolute left-3 top-2.5 w-5 h-5 text-content-tertiary" />
            </div>
          </div>
        </Show>
      </div>
    </header>
  );
};

export default Header;