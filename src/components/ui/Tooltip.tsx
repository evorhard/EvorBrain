import { Tooltip as KobalteTooltip } from '@kobalte/core/tooltip';
import { splitProps, type Component, type JSX } from 'solid-js';

interface TooltipProps {
  children: JSX.Element;
  content: JSX.Element;
  openDelay?: number;
  closeDelay?: number;
  placement?: 'top' | 'right' | 'bottom' | 'left';
}

const Tooltip: Component<TooltipProps> = (props) => {
  const [local, others] = splitProps(props, ['children', 'content']);

  return (
    <KobalteTooltip openDelay={500} closeDelay={0} placement="top" {...others}>
      <KobalteTooltip.Trigger asChild>{local.children}</KobalteTooltip.Trigger>
      <KobalteTooltip.Portal>
        <KobalteTooltip.Content class="bg-surface-900 dark:bg-surface-100 text-content-inverse dark:text-content animate-fade-in z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs">
          <KobalteTooltip.Arrow />
          {local.content}
        </KobalteTooltip.Content>
      </KobalteTooltip.Portal>
    </KobalteTooltip>
  );
};

export { Tooltip };
