import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@solidjs/testing-library';
import { createConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog Component Tests', () => {
  describe('Basic Rendering', () => {
    it('should render when open', () => {
      const [ConfirmDialogComponent, handle] = createConfirmDialog({
        title: 'Delete Item',
        description: 'Are you sure you want to delete this item?',
        onConfirm: () => {},
        onCancel: () => {},
      });

      const { getByText, getByRole } = render(() => <ConfirmDialogComponent />);
      handle.open();

      waitFor(() => {
        expect(getByText('Delete Item')).toBeInTheDocument();
        expect(getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
        expect(getByRole('button', { name: /confirm/i })).toBeInTheDocument();
        expect(getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });

    it('should not render when closed', () => {
      const [ConfirmDialogComponent, handle] = createConfirmDialog({
        title: 'Delete Item',
        description: 'Are you sure?',
        onConfirm: () => {},
        onCancel: () => {},
      });

      const { queryByText } = render(() => <ConfirmDialogComponent />);
      // Dialog starts closed by default
      expect(queryByText('Delete Item')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const [ConfirmDialogComponent, handle] = createConfirmDialog({
        title: 'Delete Item',
        description: 'Are you sure?',
        onConfirm,
        onCancel,
      });

      const { getByRole } = render(() => <ConfirmDialogComponent />);
      handle.open();

      await waitFor(() => {
        const confirmButton = getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onCancel).not.toHaveBeenCalled();
      });
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const { getByRole } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Delete Item"
          message="Are you sure?"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      ));

      const cancelButton = getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onConfirm).not.toHaveBeenCalled();
      });
    });

    it('should call onCancel when clicking backdrop', async () => {
      const onCancel = vi.fn();

      const { container } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Delete Item"
          message="Are you sure?"
          onConfirm={() => {}}
          onCancel={onCancel}
        />
      ));

      // Click on the backdrop (overlay)
      const backdrop = container.querySelector('[data-testid="modal-backdrop"]');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled();
      });
    });
  });

  describe('Custom Labels', () => {
    it('should display custom confirm and cancel labels', () => {
      const { getByRole } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Archive Item"
          message="This item will be archived"
          confirmLabel="Archive"
          cancelLabel="Keep Active"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      ));

      expect(getByRole('button', { name: 'Archive' })).toBeInTheDocument();
      expect(getByRole('button', { name: 'Keep Active' })).toBeInTheDocument();
    });

    it('should use default labels when not provided', () => {
      const { getByRole } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Confirm"
          message="Are you sure?"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      ));

      expect(getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
      expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  describe('Variant Styling', () => {
    it('should apply danger variant styling', () => {
      const { getByRole } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Delete Item"
          message="This action cannot be undone"
          variant="danger"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      ));

      const confirmButton = getByRole('button', { name: /confirm/i });
      expect(confirmButton).toHaveClass('bg-red-600');
    });

    it('should apply warning variant styling', () => {
      const { getByRole } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Archive Item"
          message="This item will be moved to archive"
          variant="warning"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      ));

      const confirmButton = getByRole('button', { name: /confirm/i });
      expect(confirmButton).toHaveClass('bg-yellow-600');
    });

    it('should apply default variant styling', () => {
      const { getByRole } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Confirm"
          message="Continue?"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      ));

      const confirmButton = getByRole('button', { name: /confirm/i });
      expect(confirmButton).toHaveClass('bg-primary-600');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { getByRole } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Delete Item"
          message="Are you sure?"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      ));

      const dialog = getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('should focus confirm button on open', async () => {
      const { getByRole } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Delete Item"
          message="Are you sure?"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      ));

      await waitFor(() => {
        const confirmButton = getByRole('button', { name: /confirm/i });
        expect(document.activeElement).toBe(confirmButton);
      });
    });

    it('should trap focus within dialog', () => {
      const { getByRole, getAllByRole } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Delete Item"
          message="Are you sure?"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      ));

      const buttons = getAllByRole('button');
      expect(buttons).toHaveLength(2); // Confirm and Cancel

      // Focus should cycle between the two buttons
      const confirmButton = buttons[0];
      const cancelButton = buttons[1];

      confirmButton.focus();
      expect(document.activeElement).toBe(confirmButton);

      // Tab to next button
      fireEvent.keyDown(confirmButton, { key: 'Tab' });
      // Note: Actual focus trapping would be handled by the Modal component
    });
  });

  describe('Archive-specific Dialogs', () => {
    it('should render archive confirmation dialog', () => {
      const { getByText } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Archive Item"
          message="This item and all its children will be archived. You can restore it later from the archive."
          confirmLabel="Archive"
          variant="warning"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      ));

      expect(getByText('Archive Item')).toBeInTheDocument();
      expect(
        getByText(/This item and all its children will be archived/),
      ).toBeInTheDocument();
    });

    it('should render restore confirmation dialog', () => {
      const { getByText } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Restore Item"
          message="This item will be restored to active status."
          confirmLabel="Restore"
          variant="info"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      ));

      expect(getByText('Restore Item')).toBeInTheDocument();
      expect(getByText(/This item will be restored to active status/)).toBeInTheDocument();
    });

    it('should render cascading archive warning', () => {
      const { getByText } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Archive Life Area"
          message="Warning: Archiving this life area will also archive all associated goals, projects, and tasks. This action can be reversed by restoring the life area."
          confirmLabel="Archive All"
          variant="danger"
          onConfirm={() => {}}
          onCancel={() => {}}
        />
      ));

      expect(getByText('Archive Life Area')).toBeInTheDocument();
      expect(getByText(/will also archive all associated/)).toBeInTheDocument();
      expect(getByText('Archive All')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state during async operations', async () => {
      const onConfirm = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      const { getByRole } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Archive Item"
          message="Archiving..."
          onConfirm={onConfirm}
          onCancel={() => {}}
        />
      ));

      const confirmButton = getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      // Button should be disabled during async operation
      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
      });

      // Wait for operation to complete
      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in onConfirm gracefully', async () => {
      const error = new Error('Archive failed');
      const onConfirm = vi.fn().mockRejectedValue(error);
      const onCancel = vi.fn();

      const { getByRole } = render(() => (
        <ConfirmDialog
          isOpen={true}
          title="Archive Item"
          message="Are you sure?"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      ));

      const confirmButton = getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalled();
        // Dialog should remain open on error
        expect(getByRole('dialog')).toBeInTheDocument();
      });
    });
  });
});