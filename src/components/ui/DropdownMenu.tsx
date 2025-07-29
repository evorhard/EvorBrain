import { DropdownMenu as KobalteDropdownMenu } from "@kobalte/core/dropdown-menu";
import { Component, JSX, splitProps } from "solid-js";

const DropdownMenu = KobalteDropdownMenu;

const DropdownMenuTrigger = KobalteDropdownMenu.Trigger;

const DropdownMenuPortal = KobalteDropdownMenu.Portal;

const DropdownMenuContent: Component<KobalteDropdownMenu.DropdownMenuContentProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <KobalteDropdownMenu.Content
      class={`z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface p-1 text-content shadow-modal animate-fade-in ${local.class || ""}`}
      {...others}
    />
  );
};

const DropdownMenuItem: Component<KobalteDropdownMenu.DropdownMenuItemProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <KobalteDropdownMenu.Item
      class={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors ui-highlighted:bg-surface-100 dark:ui-highlighted:bg-surface-200 ui-disabled:pointer-events-none ui-disabled:opacity-50 ${local.class || ""}`}
      {...others}
    />
  );
};

const DropdownMenuSeparator: Component<KobalteDropdownMenu.DropdownMenuSeparatorProps> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <KobalteDropdownMenu.Separator
      class={`-mx-1 my-1 h-px bg-border ${local.class || ""}`}
      {...others}
    />
  );
};

const DropdownMenuLabel: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <div
      class={`px-2 py-1.5 text-sm font-semibold ${local.class || ""}`}
      {...others}
    />
  );
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};