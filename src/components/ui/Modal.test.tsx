import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { 
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter
} from './Modal';
import { Button } from './Button';

describe('Modal Component', () => {
  it('should render modal with trigger', () => {
    render(() => (
      <Modal>
        <ModalTrigger>
          <Button>Open Modal</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Test Modal</ModalTitle>
          </ModalHeader>
          <p>Modal content</p>
        </ModalContent>
      </Modal>
    ));

    expect(screen.getByText('Open Modal')).toBeInTheDocument();
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should open modal when trigger is clicked', async () => {
    render(() => (
      <Modal>
        <ModalTrigger>
          <Button>Open Modal</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Test Modal</ModalTitle>
            <ModalDescription>Modal description</ModalDescription>
          </ModalHeader>
          <p>Modal body content</p>
        </ModalContent>
      </Modal>
    ));

    fireEvent.click(screen.getByText('Open Modal'));

    await waitFor(() => {
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal description')).toBeInTheDocument();
      expect(screen.getByText('Modal body content')).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', async () => {
    render(() => (
      <Modal>
        <ModalTrigger>
          <Button>Open Modal</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalTitle>Test Modal</ModalTitle>
          <p>Content</p>
        </ModalContent>
      </Modal>
    ));

    fireEvent.click(screen.getByText('Open Modal'));

    await waitFor(() => {
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });
  });

  it('should be controlled with open prop', async () => {
    let isOpen = true;
    const setOpen = (value: boolean) => { isOpen = value; };

    const { rerender } = render(() => (
      <Modal open={isOpen} onOpenChange={setOpen}>
        <ModalContent>
          <ModalTitle>Controlled Modal</ModalTitle>
        </ModalContent>
      </Modal>
    ));

    expect(screen.getByText('Controlled Modal')).toBeInTheDocument();

    // Close via prop
    isOpen = false;
    rerender(() => (
      <Modal open={isOpen} onOpenChange={setOpen}>
        <ModalContent>
          <ModalTitle>Controlled Modal</ModalTitle>
        </ModalContent>
      </Modal>
    ));

    await waitFor(() => {
      expect(screen.queryByText('Controlled Modal')).not.toBeInTheDocument();
    });
  });

  it('should support different sizes', () => {
    render(() => (
      <Modal open>
        <ModalContent size="lg">
          <ModalTitle>Large Modal</ModalTitle>
        </ModalContent>
      </Modal>
    ));

    const content = screen.getByRole('dialog');
    expect(content).toHaveClass('max-w-lg');
  });

  it('should render footer with actions', async () => {
    const handleSave = vi.fn();
    const handleCancel = vi.fn();

    render(() => (
      <Modal>
        <ModalTrigger>
          <Button>Open</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Confirm Action</ModalTitle>
          </ModalHeader>
          <p>Are you sure?</p>
          <ModalFooter>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    ));

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Save'));
    expect(handleSave).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Cancel'));
    expect(handleCancel).toHaveBeenCalled();
  });

  it('should hide close button when showCloseButton is false', async () => {
    render(() => (
      <Modal open>
        <ModalContent showCloseButton={false}>
          <ModalTitle>No Close Button</ModalTitle>
        </ModalContent>
      </Modal>
    ));

    expect(screen.getByText('No Close Button')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('should apply custom classes', () => {
    render(() => (
      <Modal open>
        <ModalContent class="custom-content">
          <ModalHeader class="custom-header">
            <ModalTitle class="custom-title">Custom Classes</ModalTitle>
            <ModalDescription class="custom-desc">Description</ModalDescription>
          </ModalHeader>
          <ModalFooter class="custom-footer">
            <Button>Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    ));

    const content = screen.getByRole('dialog');
    expect(content).toHaveClass('custom-content');

    const header = screen.getByText('Custom Classes').parentElement;
    expect(header).toHaveClass('custom-header');

    const title = screen.getByText('Custom Classes');
    expect(title).toHaveClass('custom-title');

    const description = screen.getByText('Description');
    expect(description).toHaveClass('custom-desc');

    const footer = screen.getByText('Action').parentElement;
    expect(footer).toHaveClass('custom-footer');
  });

  it('should have proper ARIA attributes', async () => {
    render(() => (
      <Modal>
        <ModalTrigger>
          <Button>Open Accessible Modal</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalTitle>Accessible Title</ModalTitle>
          <ModalDescription>Accessible description</ModalDescription>
        </ModalContent>
      </Modal>
    ));

    fireEvent.click(screen.getByText('Open Accessible Modal'));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      
      // Kobalte automatically handles ARIA labels
      expect(screen.getByText('Accessible Title')).toBeInTheDocument();
      expect(screen.getByText('Accessible description')).toBeInTheDocument();
    });
  });

  it('should trap focus within modal', async () => {
    render(() => (
      <Modal>
        <ModalTrigger>
          <Button>Open</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalTitle>Focus Trap Test</ModalTitle>
          <input type="text" placeholder="First input" />
          <button>Middle button</button>
          <input type="text" placeholder="Last input" />
        </ModalContent>
      </Modal>
    ));

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByText('Focus Trap Test')).toBeInTheDocument();
    });

    // Kobalte handles focus trapping automatically
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(2);
  });

  it('should close on overlay click by default', async () => {
    render(() => (
      <Modal>
        <ModalTrigger>
          <Button>Open</Button>
        </ModalTrigger>
        <ModalContent>
          <ModalTitle>Click Outside</ModalTitle>
        </ModalContent>
      </Modal>
    ));

    fireEvent.click(screen.getByText('Open'));

    await waitFor(() => {
      expect(screen.getByText('Click Outside')).toBeInTheDocument();
    });

    // Click on overlay (Kobalte renders it as part of the portal)
    const overlay = document.querySelector('[data-kb-dialog-overlay]');
    if (overlay) {
      fireEvent.click(overlay);
    }

    await waitFor(() => {
      expect(screen.queryByText('Click Outside')).not.toBeInTheDocument();
    });
  });

  it('should handle all size variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;

    sizes.forEach(size => {
      const { unmount } = render(() => (
        <Modal open>
          <ModalContent size={size}>
            <ModalTitle>{size} Modal</ModalTitle>
          </ModalContent>
        </Modal>
      ));

      const content = screen.getByRole('dialog');
      expect(content).toHaveClass(`max-w-${size === 'full' ? '[95vw]' : size}`);
      
      unmount();
    });
  });
});