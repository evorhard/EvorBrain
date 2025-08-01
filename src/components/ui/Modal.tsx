import { Dialog as KobalteDialog } from '@kobalte/core/dialog';
import { splitProps, Show, type Component, type JSX } from 'solid-js';
import { HiOutlineXMark } from 'solid-icons/hi';
import { cva, type VariantProps } from 'class-variance-authority';

const Modal = KobalteDialog;

const ModalTrigger = KobalteDialog.Trigger;

const ModalPortal = KobalteDialog.Portal;

const modalOverlayVariants = cva(
  'animate-fade-in fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
  {
    variants: {
      blur: {
        none: 'backdrop-blur-none',
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
      },
    },
    defaultVariants: {
      blur: 'sm',
    },
  },
);

interface ModalOverlayProps
  extends KobalteDialog.DialogOverlayProps,
    VariantProps<typeof modalOverlayVariants> {}

const ModalOverlay: Component<ModalOverlayProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'blur']);
  return (
    <KobalteDialog.Overlay
      class={modalOverlayVariants({
        blur: local.blur,
        class: local.class,
      })}
      {...others}
    />
  );
};

const modalContentVariants = cva(
  'border-border bg-surface shadow-modal animate-fade-in fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border p-6',
  {
    variants: {
      size: {
        sm: 'max-w-sm rounded-lg',
        md: 'max-w-md rounded-lg',
        lg: 'max-w-lg rounded-lg',
        xl: 'max-w-xl rounded-lg',
        full: 'max-h-[95vh] max-w-[95vw] rounded-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

interface ModalContentProps
  extends KobalteDialog.DialogContentProps,
    VariantProps<typeof modalContentVariants> {
  showCloseButton?: boolean;
}

const ModalContent: Component<ModalContentProps> = (props) => {
  const [local, others] = splitProps(props, ['class', 'size', 'children', 'showCloseButton']);
  return (
    <ModalPortal>
      <ModalOverlay />
      <KobalteDialog.Content
        class={modalContentVariants({
          size: local.size,
          class: local.class,
        })}
        {...others}
      >
        {local.children}
        <Show when={local.showCloseButton !== false}>
          <KobalteDialog.CloseButton class="ring-offset-background focus-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none">
            <HiOutlineXMark class="h-4 w-4" />
            <span class="sr-only">Close</span>
          </KobalteDialog.CloseButton>
        </Show>
      </KobalteDialog.Content>
    </ModalPortal>
  );
};

const ModalHeader: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <div
      class={`flex flex-col space-y-1.5 text-center sm:text-left ${local.class || ''}`}
      {...others}
    />
  );
};

const ModalTitle: Component<KobalteDialog.DialogTitleProps> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <KobalteDialog.Title
      class={`text-content text-lg leading-none font-semibold tracking-tight ${local.class || ''}`}
      {...others}
    />
  );
};

const ModalDescription: Component<KobalteDialog.DialogDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <KobalteDialog.Description
      class={`text-content-secondary text-sm ${local.class || ''}`}
      {...others}
    />
  );
};

const ModalFooter: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <div
      class={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${local.class || ''}`}
      {...others}
    />
  );
};

export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
};
