import { Tooltip as KobalteTooltip } from "@kobalte/core/tooltip";
import { Component, JSX, splitProps } from "solid-js";

interface TooltipProps {
  children: JSX.Element;
  content: JSX.Element;
  openDelay?: number;
  closeDelay?: number;
  placement?: "top" | "right" | "bottom" | "left";
}

const Tooltip: Component<TooltipProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "content"]);

  return (
    <KobalteTooltip openDelay={500} closeDelay={0} placement="top" {...others}>
      <KobalteTooltip.Trigger asChild>{local.children}</KobalteTooltip.Trigger>
      <KobalteTooltip.Portal>
        <KobalteTooltip.Content class="z-50 overflow-hidden rounded-md bg-surface-900 dark:bg-surface-100 px-3 py-1.5 text-xs text-content-inverse dark:text-content animate-fade-in">
          <KobalteTooltip.Arrow />
          {local.content}
        </KobalteTooltip.Content>
      </KobalteTooltip.Portal>
    </KobalteTooltip>
  );
};

export { Tooltip };