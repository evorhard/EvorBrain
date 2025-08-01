import { Select as KobalteSelect } from '@kobalte/core/select';
import type { Component } from 'solid-js';
import { JSX, splitProps } from 'solid-js';
import { HiOutlineChevronUpDown, HiOutlineCheck } from 'solid-icons/hi';

const Select = KobalteSelect;

const SelectValue = KobalteSelect.Value;

interface SelectTriggerProps extends KobalteSelect.SelectTriggerProps {
  label?: string;
  error?: string;
  placeholder?: string;
}

const SelectTrigger: Component<SelectTriggerProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children', 'label', 'error', 'placeholder']);
  const triggerId = `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div class="w-full">
      {local.label && (
        <label for={triggerId} class="text-content mb-2 block text-sm font-medium">
          {local.label}
        </label>
      )}
      <KobalteSelect.Trigger
        id={triggerId}
        class={`focus-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          local.error
            ? 'border-danger-500 hover:border-danger-600'
            : 'border-border bg-surface hover:border-border-strong'
        } ${local.class || ''}`}
        {...others}
      >
        <KobalteSelect.Value placeholder={local.placeholder || 'Select an option'} />
        <KobalteSelect.Icon>
          <HiOutlineChevronUpDown class="h-4 w-4 opacity-50" />
        </KobalteSelect.Icon>
      </KobalteSelect.Trigger>
      {local.error && <p class="text-danger-500 mt-1 text-sm">{local.error}</p>}
    </div>
  );
};

const SelectPortal = KobalteSelect.Portal;

const SelectContent: Component<KobalteSelect.SelectContentProps> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <KobalteSelect.Content
      class={`border-border bg-surface text-content shadow-modal animate-fade-in relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border ${local.class || ''}`}
      {...others}
    >
      <KobalteSelect.Listbox class="p-1" />
    </KobalteSelect.Content>
  );
};

const SelectItem: Component<KobalteSelect.SelectItemProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'children']);
  return (
    <KobalteSelect.Item
      class={`ui-highlighted:bg-surface-100 dark:ui-highlighted:bg-surface-200 ui-disabled:pointer-events-none ui-disabled:opacity-50 relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none ${local.class || ''}`}
      {...others}
    >
      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <KobalteSelect.ItemIndicator>
          <HiOutlineCheck class="h-4 w-4" />
        </KobalteSelect.ItemIndicator>
      </span>
      <KobalteSelect.ItemLabel>{local.children}</KobalteSelect.ItemLabel>
    </KobalteSelect.Item>
  );
};

export { Select, SelectValue, SelectTrigger, SelectPortal, SelectContent, SelectItem };
