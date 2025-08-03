import { DropdownMenu as KobalteDropdownMenu } from '@kobalte/core/dropdown-menu';
import { splitProps, type Component, type JSX } from 'solid-js';

const DropdownMenu = KobalteDropdownMenu;

const DropdownMenuTrigger = KobalteDropdownMenu.Trigger;

const DropdownMenuPortal = KobalteDropdownMenu.Portal;

const DropdownMenuContent: Component<KobalteDropdownMenu.DropdownMenuContentProps> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <KobalteDropdownMenu.Content
      class={`border-border bg-surface text-content shadow-modal animate-fade-in z-40 min-w-[8rem] overflow-hidden rounded-md border p-1 ${local.class || ''}`}
      {...others}
    />
  );
};

const DropdownMenuItem: Component<KobalteDropdownMenu.DropdownMenuItemProps> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <KobalteDropdownMenu.Item
      class={`ui-highlighted:bg-surface-100 dark:ui-highlighted:bg-surface-200 ui-disabled:pointer-events-none ui-disabled:opacity-50 relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none ${local.class || ''}`}
      {...others}
    />
  );
};

const DropdownMenuSeparator: Component<KobalteDropdownMenu.DropdownMenuSeparatorProps> = (
  props,
) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <KobalteDropdownMenu.Separator
      class={`bg-border -mx-1 my-1 h-px ${local.class || ''}`}
      {...others}
    />
  );
};

const DropdownMenuLabel: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return <div class={`px-2 py-1.5 text-sm font-semibold ${local.class || ''}`} {...others} />;
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
