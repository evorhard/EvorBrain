import type { Component } from "solid-js";
import { Root as AlertDialogRoot } from "@kobalte/core/alert-dialog";
import { Root as DialogRoot } from "@kobalte/core/dialog";
import { Root as PopoverRoot } from "@kobalte/core/popover";
import { Root as TooltipRoot } from "@kobalte/core/tooltip";

// Global configuration for Kobalte components
export const globalConfig = {
  // Dialog default props
  Dialog: {
    modal: true,
    closeOnOutsideClick: true,
    closeOnEscapeKeyDown: true,
  },
  
  // Tooltip default props
  Tooltip: {
    openDelay: 500,
    closeDelay: 0,
    placement: "top" as const,
  },
  
  // Popover default props
  Popover: {
    placement: "bottom" as const,
    modal: false,
  },
  
  // Alert Dialog default props
  AlertDialog: {
    modal: true,
    closeOnOutsideClick: false,
    closeOnEscapeKeyDown: false,
  },
};

// Helper to apply default props
export function withDefaults<T extends Record<string, unknown>, P extends T = T>(
  Component: Component<P>,
  defaults: T
): Component<Partial<P>> {
  return (props) => <Component {...defaults} {...props as P} />;
}