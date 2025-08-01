import { Switch as KobalteSwitch } from '@kobalte/core/switch';
import { splitProps, type Component } from 'solid-js';

interface SwitchProps extends KobalteSwitch.SwitchRootProps {
  label?: string;
}

const Switch: Component<SwitchProps> = (props) => {
  const [local, others] = splitProps(props, ['label', 'class']);

  return (
    <KobalteSwitch class={`flex items-center space-x-2 ${local.class || ''}`} {...others}>
      <KobalteSwitch.Control class="bg-surface-200 ui-checked:bg-primary-500 dark:bg-surface-700 dark:ui-checked:bg-primary-500 focus-ring h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors">
        <KobalteSwitch.Thumb class="bg-surface ui-checked:translate-x-5 dark:bg-surface-100 pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform" />
      </KobalteSwitch.Control>
      {local.label && (
        <KobalteSwitch.Label class="text-content text-sm font-medium">
          {local.label}
        </KobalteSwitch.Label>
      )}
    </KobalteSwitch>
  );
};

export { Switch };
