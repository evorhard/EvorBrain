import { Component, createSignal, For } from "solid-js";
import {
  HiOutlineHome,
  HiOutlineRectangleStack,
  HiOutlineClipboardDocumentList,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineFolder,
  HiOutlineChartBar,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlineBars3,
} from "solid-icons/hi";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  children?: NavItem[];
}

const Sidebar: Component = () => {
  const [collapsed, setCollapsed] = createSignal(false);
  const [expandedItems, setExpandedItems] = createSignal<Set<string>>(new Set());

  const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: HiOutlineHome },
    {
      id: "life-areas",
      label: "Life Areas",
      icon: HiOutlineRectangleStack,
      children: [
        { id: "personal", label: "Personal", icon: HiOutlineFolder },
        { id: "work", label: "Work", icon: HiOutlineFolder },
        { id: "health", label: "Health", icon: HiOutlineFolder },
      ],
    },
    { id: "tasks", label: "Tasks", icon: HiOutlineClipboardDocumentList },
    { id: "calendar", label: "Calendar", icon: HiOutlineCalendar },
    { id: "notes", label: "Notes", icon: HiOutlineDocumentText },
    { id: "analytics", label: "Analytics", icon: HiOutlineChartBar },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems().has(item.id);

    return (
      <>
        <button
          class={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 ${
            level > 0 ? "pl-8" : ""
          }`}
          onClick={() => hasChildren && toggleExpanded(item.id)}
        >
          <item.icon class="w-5 h-5 flex-shrink-0" />
          {!collapsed() && (
            <>
              <span class="flex-1 text-left text-sm font-medium">{item.label}</span>
              {hasChildren && (
                <span class="ml-auto">
                  {isExpanded ? (
                    <HiOutlineChevronDown class="w-4 h-4" />
                  ) : (
                    <HiOutlineChevronRight class="w-4 h-4" />
                  )}
                </span>
              )}
            </>
          )}
        </button>
        {!collapsed() && hasChildren && isExpanded && (
          <div class="mt-1">
            <For each={item.children}>
              {(child) => renderNavItem(child, level + 1)}
            </For>
          </div>
        )}
      </>
    );
  };

  return (
    <aside
      class={`${
        collapsed() ? "w-16" : "w-64"
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 hidden lg:block`}
    >
      <div class="flex flex-col h-full">
        <div class="p-4">
          <button
            onClick={() => setCollapsed(!collapsed())}
            class="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={collapsed() ? "Expand sidebar" : "Collapse sidebar"}
          >
            <HiOutlineBars3 class="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <nav class="flex-1 px-3 pb-4 overflow-y-auto">
          <For each={navItems}>{(item) => renderNavItem(item)}</For>
        </nav>

        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-evorbrain-500 rounded-full flex items-center justify-center text-white font-semibold">
              U
            </div>
            {!collapsed() && (
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">User</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">user@example.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;