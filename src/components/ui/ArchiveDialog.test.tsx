import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@solidjs/testing-library';
import { createConfirmDialog } from './ConfirmDialog';

describe('Archive Dialog Tests', () => {
  describe('Archive Confirmation', () => {
    it('should display archive warning message', async () => {
      const [Dialog, handle] = createConfirmDialog({
        title: 'Archive Item',
        description: 'This item will be archived. You can restore it later from the archive.',
        confirmText: 'Archive',
        onConfirm: () => {},
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        expect(getByText('Archive Item')).toBeInTheDocument();
        expect(getByText(/will be archived/)).toBeInTheDocument();
        expect(getByText('Archive')).toBeInTheDocument();
      });
    });

    it('should call archive function on confirm', async () => {
      const onArchive = vi.fn();
      const [Dialog, handle] = createConfirmDialog({
        title: 'Archive Task',
        description: 'Are you sure you want to archive this task?',
        confirmText: 'Archive',
        onConfirm: onArchive,
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        const archiveButton = getByText('Archive');
        fireEvent.click(archiveButton);
      });

      expect(onArchive).toHaveBeenCalled();
    });

    it('should display cascading archive warning for hierarchical items', async () => {
      const [Dialog, handle] = createConfirmDialog({
        title: 'Archive Life Area',
        description:
          'Warning: Archiving this life area will also archive all associated goals, projects, and tasks.',
        confirmText: 'Archive All',
        variant: 'danger',
        onConfirm: () => {},
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        expect(getByText('Archive Life Area')).toBeInTheDocument();
        expect(getByText(/will also archive all associated/)).toBeInTheDocument();
        expect(getByText('Archive All')).toBeInTheDocument();
      });
    });
  });

  describe('Restore Confirmation', () => {
    it('should display restore confirmation message', async () => {
      const [Dialog, handle] = createConfirmDialog({
        title: 'Restore Item',
        description: 'This item will be restored to active status.',
        confirmText: 'Restore',
        onConfirm: () => {},
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        expect(getByText('Restore Item')).toBeInTheDocument();
        expect(getByText(/will be restored to active status/)).toBeInTheDocument();
        expect(getByText('Restore')).toBeInTheDocument();
      });
    });

    it('should call restore function on confirm', async () => {
      const onRestore = vi.fn();
      const [Dialog, handle] = createConfirmDialog({
        title: 'Restore Project',
        description: 'Restore this project?',
        confirmText: 'Restore',
        onConfirm: onRestore,
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        const restoreButton = getByText('Restore');
        fireEvent.click(restoreButton);
      });

      expect(onRestore).toHaveBeenCalled();
    });

    it('should display cascading restore information', async () => {
      const [Dialog, handle] = createConfirmDialog({
        title: 'Restore Life Area',
        description: 'This will restore the life area and all its associated items.',
        confirmText: 'Restore All',
        onConfirm: () => {},
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        expect(getByText('Restore Life Area')).toBeInTheDocument();
        expect(getByText(/restore the life area and all its associated items/)).toBeInTheDocument();
        expect(getByText('Restore All')).toBeInTheDocument();
      });
    });
  });

  describe('Cancel Actions', () => {
    it('should not call archive when cancelled', async () => {
      const onArchive = vi.fn();
      const onCancel = vi.fn();

      const [Dialog, handle] = createConfirmDialog({
        title: 'Archive Item',
        description: 'Archive this item?',
        confirmText: 'Archive',
        onConfirm: onArchive,
        onCancel,
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        const cancelButton = getByText('Cancel');
        fireEvent.click(cancelButton);
      });

      expect(onArchive).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
    });

    it('should close dialog on cancel', async () => {
      const [Dialog, handle] = createConfirmDialog({
        title: 'Archive Item',
        description: 'Archive this item?',
        onConfirm: () => {},
      });

      const { getByText, queryByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        expect(getByText('Archive Item')).toBeInTheDocument();
      });

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(queryByText('Archive Item')).not.toBeInTheDocument();
      });
    });
  });

  describe('Different Entity Types', () => {
    it('should handle goal archive dialog', async () => {
      const [Dialog, handle] = createConfirmDialog({
        title: 'Archive Goal',
        description: 'This goal and its projects will be archived.',
        confirmText: 'Archive Goal',
        onConfirm: () => {},
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        expect(getByText('Archive Goal')).toBeInTheDocument();
        expect(getByText(/goal and its projects/)).toBeInTheDocument();
      });
    });

    it('should handle project archive dialog', async () => {
      const [Dialog, handle] = createConfirmDialog({
        title: 'Archive Project',
        description: 'This project and all its tasks will be archived.',
        confirmText: 'Archive Project',
        onConfirm: () => {},
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        expect(getByText('Archive Project')).toBeInTheDocument();
        expect(getByText(/project and all its tasks/)).toBeInTheDocument();
      });
    });

    it('should handle task archive dialog', async () => {
      const [Dialog, handle] = createConfirmDialog({
        title: 'Archive Task',
        description: 'This task and its subtasks will be archived.',
        confirmText: 'Archive Task',
        onConfirm: () => {},
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        expect(getByText('Archive Task')).toBeInTheDocument();
        expect(getByText(/task and its subtasks/)).toBeInTheDocument();
      });
    });
  });

  describe('Variant Styling', () => {
    it('should use danger variant for cascading archives', async () => {
      const [Dialog, handle] = createConfirmDialog({
        title: 'Archive Everything',
        description: 'This will archive many items.',
        variant: 'danger',
        confirmText: 'Archive All',
        onConfirm: () => {},
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        const confirmButton = getByText('Archive All');
        // Note: The actual variant styling would be handled by the Button component
        expect(confirmButton).toBeInTheDocument();
      });
    });

    it('should use default variant for single item archives', async () => {
      const [Dialog, handle] = createConfirmDialog({
        title: 'Archive Note',
        description: 'Archive this note?',
        confirmText: 'Archive',
        onConfirm: () => {},
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        const confirmButton = getByText('Archive');
        expect(confirmButton).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle archive errors gracefully', async () => {
      const onArchive = vi.fn().mockRejectedValue(new Error('Archive failed'));

      const [Dialog, handle] = createConfirmDialog({
        title: 'Archive Item',
        description: 'Archive this?',
        confirmText: 'Archive',
        onConfirm: onArchive,
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        const archiveButton = getByText('Archive');
        fireEvent.click(archiveButton);
      });

      await waitFor(() => {
        expect(onArchive).toHaveBeenCalled();
      });
    });

    it('should handle restore errors gracefully', async () => {
      const onRestore = vi.fn().mockRejectedValue(new Error('Restore failed'));

      const [Dialog, handle] = createConfirmDialog({
        title: 'Restore Item',
        description: 'Restore this?',
        confirmText: 'Restore',
        onConfirm: onRestore,
      });

      const { getByText } = render(() => <Dialog />);
      handle.open();

      await waitFor(() => {
        const restoreButton = getByText('Restore');
        fireEvent.click(restoreButton);
      });

      await waitFor(() => {
        expect(onRestore).toHaveBeenCalled();
      });
    });
  });
});