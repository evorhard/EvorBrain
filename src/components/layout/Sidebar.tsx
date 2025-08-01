import type { Component} from "solid-js";
import { createSignal, For } from "solid-js";
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
  HiOutlineFlag,
} from "solid-icons/hi";
import { useUIStore } from "../../stores";

interface NavItem {
  id: string;
  label: string;
  icon: Component<{ class?: string }>;
  viewId?: string;
  children?: NavItem[];
}

const Sidebar: Component = () => {
  const { store: uiStore, actions: uiActions } = useUIStore();
  const [collapsed, setCollapsed] = createSignal(false);
  const [expandedItems, setExpandedItems] = createSignal<Set<string>>(new Set());

  const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: HiOutlineHome, viewId: "dashboard" },
    {
      id: "life-areas",
      label: "Life Areas",
      icon: HiOutlineRectangleStack,
      viewId: "life-areas",
    },
    { id: "goals", label: "Goals", icon: HiOutlineFlag, viewId: "goals" },
    { id: "tasks", label: "Tasks", icon: HiOutlineClipboardDocumentList, viewId: "tasks" },
    { id: "calendar", label: "Calendar", icon: HiOutlineCalendar, viewId: "calendar" },
    { id: "notes", label: "Notes", icon: HiOutlineDocumentText, viewId: "notes" },
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

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems().has(item.id);
    const isActive = item.viewId && uiStore.activeView === item.viewId;

    const handleClick = () => {
      if (hasChildren) {
        toggleExpanded(item.id);
      } else if (item.viewId) {
        uiActions.setActiveView(item.viewId as any);
      }
    };

    return (
      <>
        <button
          class={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors text-content ${
            level > 0 ? "pl-8" : ""
          } ${isActive ? "bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400" : ""}`}
          onClick={handleClick}
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
      } bg-surface border-r border-border transition-all duration-300 hidden lg:block`}
    >
      <div class="flex flex-col h-full">
        <div class="p-4">
          <button
            onClick={() => setCollapsed(!collapsed())}
            class="w-full flex items-center justify-center p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-200 transition-colors focus-ring"
            aria-label={collapsed() ? "Expand sidebar" : "Collapse sidebar"}
          >
            <HiOutlineBars3 class="w-5 h-5 text-content-secondary" />
          </button>
        </div>

        <nav class="flex-1 px-3 pb-4 overflow-y-auto">
          <For each={navItems}>{(item) => renderNavItem(item)}</For>
        </nav>

        <div class="p-4 border-t border-border">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-content-inverse font-semibold">
              U
            </div>
            {!collapsed() && (
              <div class="flex-1">
                <p class="text-sm font-medium text-content">User</p>
                <p class="text-xs text-content-tertiary">user@example.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;