import { Switch as KobalteSwitch } from "@kobalte/core/switch";
import type { Component} from "solid-js";
import { splitProps } from "solid-js";

interface SwitchProps extends KobalteSwitch.SwitchRootProps {
  label?: string;
}

const Switch: Component<SwitchProps> = (props) => {
  const [local, others] = splitProps(props, ["label", "class"]);

  return (
    <KobalteSwitch
      class={`flex items-center space-x-2 ${local.class || ""}`}
      {...others}
    >
      <KobalteSwitch.Control class="h-6 w-11 cursor-pointer rounded-full border-2 border-transparent bg-surface-200 transition-colors ui-checked:bg-primary-500 dark:bg-surface-700 dark:ui-checked:bg-primary-500 focus-ring">
        <KobalteSwitch.Thumb class="pointer-events-none block h-5 w-5 rounded-full bg-surface shadow-lg ring-0 transition-transform ui-checked:translate-x-5 dark:bg-surface-100" />
      </KobalteSwitch.Control>
      {local.label && (
        <KobalteSwitch.Label class="text-sm font-medium text-content">
          {local.label}
        </KobalteSwitch.Label>
      )}
    </KobalteSwitch>
  );
};

export { Switch };