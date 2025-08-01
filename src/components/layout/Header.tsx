import { createSignal, Show, type Component } from 'solid-js';
import {
  HiOutlineBars3,
  HiOutlineMagnifyingGlass,
  HiOutlineBell,
  HiOutlineCog,
} from 'solid-icons/hi';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

const Header: Component<HeaderProps> = (props) => {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [showMobileSearch, setShowMobileSearch] = createSignal(false);

  return (
    <header class="bg-surface border-border border-b">
      <div class="px-3 py-3 sm:px-4 lg:px-6">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 sm:gap-4">
            <button
              class="hover:bg-surface-100 dark:hover:bg-surface-200 focus-ring -ml-2 rounded-md p-2 transition-colors lg:hidden"
              aria-label="Toggle sidebar"
              onClick={props.onToggleMobileSidebar}
            >
              <HiOutlineBars3 class="text-content-secondary h-5 w-5" />
            </button>

            <h1 class="text-content text-lg font-semibold sm:text-xl">EvorBrain</h1>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search */}
            <div class="relative hidden md:block">
              <input
                type="text"
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
                placeholder="Search..."
                class="bg-surface-100 dark:bg-surface-200 border-border focus-ring placeholder:text-content-tertiary w-48 rounded-lg border px-4 py-2 pr-4 pl-10 text-sm lg:w-64"
              />
              <HiOutlineMagnifyingGlass class="text-content-tertiary absolute top-2.5 left-3 h-5 w-5" />
            </div>

            {/* Mobile Search Toggle */}
            <button
              class="hover:bg-surface-100 dark:hover:bg-surface-200 focus-ring rounded-md p-2 transition-colors md:hidden"
              aria-label="Search"
              onClick={() => setShowMobileSearch(!showMobileSearch())}
            >
              <HiOutlineMagnifyingGlass class="text-content-secondary h-5 w-5" />
            </button>

            <button
              class="hover:bg-surface-100 dark:hover:bg-surface-200 focus-ring rounded-md p-2 transition-colors"
              aria-label="Notifications"
            >
              <HiOutlineBell class="text-content-secondary h-5 w-5" />
            </button>

            <ThemeToggle />

            <button
              class="xs:block hover:bg-surface-100 dark:hover:bg-surface-200 focus-ring hidden rounded-md p-2 transition-colors"
              aria-label="Settings"
            >
              <HiOutlineCog class="text-content-secondary h-5 w-5" />
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
                class="bg-surface-100 dark:bg-surface-200 border-border focus-ring placeholder:text-content-tertiary w-full rounded-lg border px-4 py-2 pr-4 pl-10 text-sm"
                autofocus
              />
              <HiOutlineMagnifyingGlass class="text-content-tertiary absolute top-2.5 left-3 h-5 w-5" />
            </div>
          </div>
        </Show>
      </div>
    </header>
  );
};

export default Header;
