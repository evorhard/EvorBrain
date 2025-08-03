import { createSignal, type Component } from 'solid-js';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  title: string;
  description: string | (() => string);
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmDialogHandle {
  open: () => void;
  close: () => void;
}

export function createConfirmDialog(props: ConfirmDialogProps): [Component, ConfirmDialogHandle] {
  const [isOpen, setIsOpen] = createSignal(false);

  const handleConfirm = () => {
    props.onConfirm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    props.onCancel?.();
    setIsOpen(false);
  };

  const ConfirmDialogComponent: Component = () => (
    <Modal open={isOpen()} onOpenChange={setIsOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{props.title}</ModalTitle>
          <ModalDescription>
            {typeof props.description === 'function' ? props.description() : props.description}
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button variant="outline" onClick={handleCancel} class="relative z-10">
            {props.cancelText || 'Cancel'}
          </Button>
          <Button
            variant={props.variant === 'danger' ? 'danger' : 'default'}
            onClick={handleConfirm}
            class="relative z-10"
          >
            {props.confirmText || 'Confirm'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  const handle: ConfirmDialogHandle = {
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };

  return [ConfirmDialogComponent, handle];
}
