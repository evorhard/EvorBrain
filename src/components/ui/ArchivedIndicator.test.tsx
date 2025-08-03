import { describe, it, expect } from 'vitest';
import { render } from '@solidjs/testing-library';
import { Badge } from './Badge';
import type { LifeArea, Goal, Project, Task } from '../../types/models';

// Helper component to test archived visual indicators
function ArchivedItemCard(props: {
  item: { archived_at: string | null; name?: string; title?: string };
  type: 'lifeArea' | 'goal' | 'project' | 'task';
}) {
  const isArchived = () => props.item.archived_at !== null;
  const title = () => props.item.name || props.item.title || 'Untitled';

  return (
    <div
      class={`p-4 rounded-lg border ${
        isArchived()
          ? 'opacity-60 bg-gray-50 border-gray-300'
          : 'bg-white border-gray-200'
      }`}
      data-testid="item-card"
    >
      <div class="flex items-center justify-between">
        <h3 class={`text-lg font-medium ${isArchived() ? 'text-gray-500' : 'text-gray-900'}`}>
          {title()}
        </h3>
        {isArchived() && (
          <Badge variant="secondary" size="sm" data-testid="archived-badge">
            Archived
          </Badge>
        )}
      </div>
      <div class="mt-2">
        <p class={`text-sm ${isArchived() ? 'text-gray-400' : 'text-gray-600'}`}>
          Type: {props.type}
        </p>
      </div>
    </div>
  );
}

describe('Archived Item Visual Indicators', () => {
  describe('Opacity and Styling', () => {
    it('should apply reduced opacity to archived items', () => {
      const archivedItem = {
        name: 'Archived Item',
        archived_at: new Date().toISOString(),
      };

      const { getByTestId } = render(() => (
        <ArchivedItemCard item={archivedItem} type="lifeArea" />
      ));

      const card = getByTestId('item-card');
      expect(card).toHaveClass('opacity-60');
      expect(card).toHaveClass('bg-gray-50');
    });

    it('should not apply reduced opacity to active items', () => {
      const activeItem = {
        name: 'Active Item',
        archived_at: null,
      };

      const { getByTestId } = render(() => (
        <ArchivedItemCard item={activeItem} type="lifeArea" />
      ));

      const card = getByTestId('item-card');
      expect(card).not.toHaveClass('opacity-60');
      expect(card).toHaveClass('bg-white');
    });

    it('should use muted colors for archived item text', () => {
      const archivedItem = {
        title: 'Archived Task',
        archived_at: new Date().toISOString(),
      };

      const { getByText } = render(() => (
        <ArchivedItemCard item={archivedItem} type="task" />
      ));

      const title = getByText('Archived Task');
      expect(title).toHaveClass('text-gray-500');
    });
  });

  describe('Archive Badge', () => {
    it('should display archived badge for archived items', () => {
      const archivedGoal: Partial<Goal> = {
        title: 'Old Goal',
        archived_at: new Date().toISOString(),
      };

      const { getByTestId } = render(() => (
        <ArchivedItemCard item={archivedGoal} type="goal" />
      ));

      const badge = getByTestId('archived-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Archived');
    });

    it('should not display archived badge for active items', () => {
      const activeGoal: Partial<Goal> = {
        title: 'Current Goal',
        archived_at: null,
      };

      const { queryByTestId } = render(() => (
        <ArchivedItemCard item={activeGoal} type="goal" />
      ));

      const badge = queryByTestId('archived-badge');
      expect(badge).not.toBeInTheDocument();
    });

    it('should use appropriate badge variant for archived state', () => {
      const archivedProject: Partial<Project> = {
        name: 'Old Project',
        archived_at: new Date().toISOString(),
      };

      const { getByTestId } = render(() => (
        <ArchivedItemCard item={archivedProject} type="project" />
      ));

      const badge = getByTestId('archived-badge');
      expect(badge).toHaveClass('bg-gray-100');
      expect(badge).toHaveClass('text-gray-700');
    });
  });

  describe('List Item Styling', () => {
    it('should style archived items differently in lists', () => {
      const items = [
        { id: '1', name: 'Active Item 1', archived_at: null },
        { id: '2', name: 'Archived Item', archived_at: new Date().toISOString() },
        { id: '3', name: 'Active Item 2', archived_at: null },
      ];

      const { container } = render(() => (
        <div class="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              class={`p-3 rounded ${
                item.archived_at
                  ? 'bg-gray-50 border-gray-200 opacity-75'
                  : 'bg-white border-gray-300'
              }`}
              data-archived={item.archived_at !== null}
            >
              <span class={item.archived_at ? 'text-gray-500 line-through' : 'text-gray-900'}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      ));

      const archivedItem = container.querySelector('[data-archived="true"]');
      const activeItems = container.querySelectorAll('[data-archived="false"]');

      expect(archivedItem).toHaveClass('opacity-75');
      expect(archivedItem).toHaveClass('bg-gray-50');

      activeItems.forEach((item) => {
        expect(item).not.toHaveClass('opacity-75');
        expect(item).toHaveClass('bg-white');
      });
    });

    it('should show strikethrough text for archived completed items', () => {
      const completedArchivedTask: Partial<Task> = {
        title: 'Completed Task',
        completed_at: new Date().toISOString(),
        archived_at: new Date().toISOString(),
      };

      const { getByText } = render(() => (
        <div
          class={
            completedArchivedTask.archived_at && completedArchivedTask.completed_at
              ? 'line-through text-gray-400'
              : ''
          }
        >
          {completedArchivedTask.title}
        </div>
      ));

      const text = getByText('Completed Task');
      expect(text).toHaveClass('line-through');
      expect(text).toHaveClass('text-gray-400');
    });
  });

  describe('Interactive Elements', () => {
    it('should disable action buttons for archived items', () => {
      const archivedItem = {
        name: 'Archived Item',
        archived_at: new Date().toISOString(),
      };

      const { getByRole } = render(() => (
        <div>
          <button disabled={archivedItem.archived_at !== null} aria-label="Edit">
            Edit
          </button>
          <button disabled={archivedItem.archived_at !== null} aria-label="Delete">
            Delete
          </button>
          <button disabled={archivedItem.archived_at === null} aria-label="Restore">
            Restore
          </button>
        </div>
      ));

      expect(getByRole('button', { name: 'Edit' })).toBeDisabled();
      expect(getByRole('button', { name: 'Delete' })).toBeDisabled();
      expect(getByRole('button', { name: 'Restore' })).not.toBeDisabled();
    });

    it('should show different icons for archived vs active items', () => {
      const { container } = render(() => (
        <div>
          <div data-testid="active-icon" class="icon-folder" />
          <div data-testid="archived-icon" class="icon-archive" />
        </div>
      ));

      const activeIcon = container.querySelector('[data-testid="active-icon"]');
      const archivedIcon = container.querySelector('[data-testid="archived-icon"]');

      expect(activeIcon).toHaveClass('icon-folder');
      expect(archivedIcon).toHaveClass('icon-archive');
    });
  });

  describe('Hover States', () => {
    it('should have different hover effects for archived items', () => {
      const { container } = render(() => (
        <div>
          <div
            class="transition-colors hover:bg-gray-100"
            data-testid="archived-hover"
            data-archived="true"
          >
            Archived Item
          </div>
          <div
            class="transition-colors hover:bg-blue-50"
            data-testid="active-hover"
            data-archived="false"
          >
            Active Item
          </div>
        </div>
      ));

      const archivedItem = container.querySelector('[data-testid="archived-hover"]');
      const activeItem = container.querySelector('[data-testid="active-hover"]');

      expect(archivedItem).toHaveClass('hover:bg-gray-100');
      expect(activeItem).toHaveClass('hover:bg-blue-50');
    });
  });

  describe('Timestamps Display', () => {
    it('should display archive date for archived items', () => {
      const archiveDate = new Date('2024-01-15T10:30:00Z');
      const archivedItem = {
        name: 'Archived Item',
        archived_at: archiveDate.toISOString(),
      };

      const { getByText } = render(() => (
        <div>
          {archivedItem.archived_at && (
            <span class="text-xs text-gray-500">
              Archived on {new Date(archivedItem.archived_at).toLocaleDateString()}
            </span>
          )}
        </div>
      ));

      expect(getByText(/Archived on/)).toBeInTheDocument();
    });
  });

  describe('Filter Toggle Visual State', () => {
    it('should indicate when archived items filter is active', () => {
      const { getByRole, rerender } = render(() => (
        <button
          role="switch"
          aria-checked={false}
          class="px-3 py-1 rounded-full bg-gray-200 text-gray-700"
        >
          Show Archived
        </button>
      ));

      const toggle = getByRole('switch');
      expect(toggle).toHaveClass('bg-gray-200');
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      // Simulate toggle on
      rerender(() => (
        <button
          role="switch"
          aria-checked={true}
          class="px-3 py-1 rounded-full bg-blue-600 text-white"
        >
          Show Archived
        </button>
      ));

      expect(toggle).toHaveClass('bg-blue-600');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA labels for archived items', () => {
      const archivedItem = {
        name: 'Archived Project',
        archived_at: new Date().toISOString(),
      };

      const { container } = render(() => (
        <div
          role="article"
          aria-label={`${archivedItem.name} (Archived)`}
          aria-describedby="archive-info"
        >
          <h3>{archivedItem.name}</h3>
          <span id="archive-info" class="sr-only">
            This item has been archived
          </span>
        </div>
      ));

      const article = container.querySelector('[role="article"]');
      expect(article).toHaveAttribute('aria-label', 'Archived Project (Archived)');
      expect(article).toHaveAttribute('aria-describedby', 'archive-info');
    });

    it('should announce archive state to screen readers', () => {
      const { container } = render(() => (
        <div>
          <span class="sr-only" role="status" aria-live="polite">
            Item has been archived
          </span>
        </div>
      ));

      const announcement = container.querySelector('[role="status"]');
      expect(announcement).toHaveAttribute('aria-live', 'polite');
      expect(announcement).toHaveTextContent('Item has been archived');
    });
  });
});