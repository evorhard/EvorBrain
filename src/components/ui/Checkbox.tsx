import { Checkbox as KobalteCheckbox } from "@kobalte/core/checkbox";
import { Component, splitProps } from "solid-js";
import { HiSolidCheck } from "solid-icons/hi";

interface CheckboxProps extends KobalteCheckbox.CheckboxRootProps {
  label?: string;
}

const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, others] = splitProps(props, ["label", "class"]);

  return (
    <KobalteCheckbox
      class={`flex items-center space-x-2 ${local.class || ""}`}
      {...others}
    >
      <KobalteCheckbox.Control class="h-4 w-4 shrink-0 rounded-sm border border-primary-500 bg-surface shadow focus-ring ui-checked:bg-primary-500 ui-checked:text-content-inverse ui-indeterminate:bg-primary-500 ui-indeterminate:text-content-inverse">
        <KobalteCheckbox.Indicator class="flex items-center justify-center text-current">
          <HiSolidCheck class="h-3 w-3" />
        </KobalteCheckbox.Indicator>
      </KobalteCheckbox.Control>
      {local.label && (
        <KobalteCheckbox.Label class="text-sm font-medium text-content">
          {local.label}
        </KobalteCheckbox.Label>
      )}
    </KobalteCheckbox>
  );
};

export { Checkbox };