import { Checkbox as KobalteCheckbox } from '@kobalte/core/checkbox';
import { splitProps, type Component } from 'solid-js';
import { HiSolidCheck } from 'solid-icons/hi';

interface CheckboxProps extends KobalteCheckbox.CheckboxRootProps {
  label?: string;
}

const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, others] = splitProps(props, ['label', 'class']);

  return (
    <KobalteCheckbox class={`flex items-center space-x-2 ${local.class || ''}`} {...others}>
      <KobalteCheckbox.Control class="border-primary-500 bg-surface focus-ring ui-checked:bg-primary-500 ui-checked:text-content-inverse ui-indeterminate:bg-primary-500 ui-indeterminate:text-content-inverse h-4 w-4 shrink-0 rounded-sm border shadow">
        <KobalteCheckbox.Indicator class="flex items-center justify-center text-current">
          <HiSolidCheck class="h-3 w-3" />
        </KobalteCheckbox.Indicator>
      </KobalteCheckbox.Control>
      {local.label && (
        <KobalteCheckbox.Label class="text-content text-sm font-medium">
          {local.label}
        </KobalteCheckbox.Label>
      )}
    </KobalteCheckbox>
  );
};

export { Checkbox };
