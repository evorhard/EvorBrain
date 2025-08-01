import type { Component} from "solid-js";
import { createSignal, Show, For } from "solid-js";
import { Portal } from "solid-js/web";
import {
  HiOutlineXMark,
  HiOutlineHome,
  HiOutlineRectangleStack,
  HiOutlineClipboardDocumentList,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineFolder,
  HiOutlineChartBar,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
} from "solid-icons/hi";

interface NavItem {
  id: string;
  label: string;
  icon: Component<{ class?: string }>;
  children?: NavItem[];
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: Component<MobileSidebarProps> = (props) => {
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

  const renderNavItem = (item: NavItem, level = 0) => {
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
        </button>
        {hasChildren && isExpanded && (
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
    <Show when={props.isOpen}>
      <Portal>
        <div class="fixed inset-0 z-50 lg:hidden">
          <div
            class="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={props.onClose}
          />
          <div class="fixed inset-y-0 left-0 flex max-w-xs w-full">
            <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
              <div class="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={props.onClose}
                >
                  <HiOutlineXMark class="h-6 w-6 text-white" />
                </button>
              </div>
              
              <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div class="flex items-center flex-shrink-0 px-4">
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
                    EvorBrain
                  </h2>
                </div>
                <nav class="mt-5 px-2">
                  <For each={navItems}>{(item) => renderNavItem(item)}</For>
                </nav>
              </div>
              
              <div class="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-evorbrain-500 rounded-full flex items-center justify-center text-white font-semibold">
                    U
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">User</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">user@example.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};

export default MobileSidebar;