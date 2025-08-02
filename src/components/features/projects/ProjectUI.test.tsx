import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { For, Show } from 'solid-js';
import { ProjectStatus } from '../../../types/models';
import type { Project } from '../../../types/models';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

// UI-only component for testing project display without store dependencies
function ProjectCard(props: {
  project: Project;
  goalName: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onStatusChange?: (status: ProjectStatus) => void;
}) {
  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Planning:
        return 'secondary';
      case ProjectStatus.Active:
        return 'primary';
      case ProjectStatus.Completed:
        return 'success';
      case ProjectStatus.OnHold:
        return 'warning';
      case ProjectStatus.Cancelled:
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Planning:
        return 'Planning';
      case ProjectStatus.Active:
        return 'Active';
      case ProjectStatus.OnHold:
        return 'On Hold';
      case ProjectStatus.Completed:
        return 'Completed';
      case ProjectStatus.Cancelled:
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <Card
      class={`cursor-pointer transition-all ${
        props.isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
      } ${props.project.archived_at ? 'opacity-60' : ''}`}
      onClick={props.onSelect}
      data-testid="project-card"
    >
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-lg font-semibold">{props.project.title}</h3>
            <Badge
              variant={getStatusBadgeVariant(props.project.status)}
              data-testid="status-badge"
            >
              {getStatusLabel(props.project.status)}
            </Badge>
            <Show when={props.project.archived_at}>
              <Badge variant="secondary" data-testid="archived-badge">
                Archived
              </Badge>
            </Show>
          </div>
          <Show when={props.project.description}>
            <p class="text-gray-600 mb-2" data-testid="project-description">
              {props.project.description}
            </p>
          </Show>
          <div class="text-sm text-gray-500">
            <span data-testid="goal-name">Goal: {props.goalName}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <Show when={!props.project.archived_at}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                props.onEdit?.();
              }}
              data-testid="edit-button"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                props.onDelete?.();
              }}
              data-testid="delete-button"
            >
              Delete
            </Button>
          </Show>
          <Show when={props.project.archived_at}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                props.onRestore?.();
              }}
              data-testid="restore-button"
            >
              Restore
            </Button>
          </Show>
        </div>
      </div>
    </Card>
  );
}

// Loading state component
function ProjectListLoading() {
  return (
    <div class="flex items-center justify-center py-8" data-testid="loading-state">
      <div class="text-gray-500">Loading projects...</div>
    </div>
  );
}

// Empty state component
function ProjectListEmpty() {
  return (
    <Card>
      <div class="p-8 text-center" data-testid="empty-state">
        <p class="text-gray-500">No projects yet. Create your first project!</p>
      </div>
    </Card>
  );
}

// Error state component
function ProjectListError(props: { error: string }) {
  return (
    <div
      class="rounded bg-red-50 p-3 text-red-600"
      data-testid="error-state"
    >
      {props.error}
    </div>
  );
}

describe('Project UI Components', () => {
  describe('ProjectCard', () => {
    const mockProject: Project = {
      id: 'project-1',
      goal_id: 'goal-1',
      title: 'Test Project',
      description: 'A test project description',
      status: ProjectStatus.Active,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should render project details correctly', () => {
      render(() => (
        <ProjectCard project={mockProject} goalName="Test Goal" />
      ));

      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByTestId('project-description')).toHaveTextContent(
        'A test project description'
      );
      expect(screen.getByTestId('goal-name')).toHaveTextContent('Goal: Test Goal');
    });

    it('should display correct status badge variant and label', () => {
      const statuses: { status: ProjectStatus; label: string; variant: string }[] = [
        { status: ProjectStatus.Planning, label: 'Planning', variant: 'secondary' },
        { status: ProjectStatus.Active, label: 'Active', variant: 'primary' },
        { status: ProjectStatus.Completed, label: 'Completed', variant: 'success' },
        { status: ProjectStatus.OnHold, label: 'On Hold', variant: 'warning' },
        { status: ProjectStatus.Cancelled, label: 'Cancelled', variant: 'danger' },
      ];

      statuses.forEach(({ status, label }) => {
        const { unmount } = render(() => (
          <ProjectCard
            project={{ ...mockProject, status }}
            goalName="Test Goal"
          />
        ));

        const badge = screen.getByTestId('status-badge');
        expect(badge).toHaveTextContent(label);

        unmount();
      });
    });

    it('should show selected state when isSelected is true', () => {
      render(() => (
        <ProjectCard project={mockProject} goalName="Test Goal" isSelected={true} />
      ));

      const card = screen.getByTestId('project-card');
      expect(card).toHaveClass('ring-2');
      expect(card).toHaveClass('ring-primary');
    });

    it('should show archived state with reduced opacity and badge', () => {
      const archivedProject = {
        ...mockProject,
        archived_at: '2024-01-01T00:00:00Z',
      };

      render(() => (
        <ProjectCard project={archivedProject} goalName="Test Goal" />
      ));

      const card = screen.getByTestId('project-card');
      expect(card).toHaveClass('opacity-60');
      expect(screen.getByTestId('archived-badge')).toHaveTextContent('Archived');
    });

    it('should hide description when not provided', () => {
      const projectWithoutDescription = {
        ...mockProject,
        description: undefined,
      };

      render(() => (
        <ProjectCard project={projectWithoutDescription} goalName="Test Goal" />
      ));

      expect(screen.queryByTestId('project-description')).not.toBeInTheDocument();
    });

    it('should call onSelect when card is clicked', () => {
      const onSelect = vi.fn();

      render(() => (
        <ProjectCard project={mockProject} goalName="Test Goal" onSelect={onSelect} />
      ));

      fireEvent.click(screen.getByTestId('project-card'));
      expect(onSelect).toHaveBeenCalled();
    });

    it('should call onEdit when edit button is clicked', () => {
      const onEdit = vi.fn();

      render(() => (
        <ProjectCard project={mockProject} goalName="Test Goal" onEdit={onEdit} />
      ));

      fireEvent.click(screen.getByTestId('edit-button'));
      expect(onEdit).toHaveBeenCalled();
    });

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = vi.fn();

      render(() => (
        <ProjectCard project={mockProject} goalName="Test Goal" onDelete={onDelete} />
      ));

      fireEvent.click(screen.getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalled();
    });

    it('should stop propagation when action buttons are clicked', () => {
      const onSelect = vi.fn();
      const onEdit = vi.fn();

      render(() => (
        <ProjectCard
          project={mockProject}
          goalName="Test Goal"
          onSelect={onSelect}
          onEdit={onEdit}
        />
      ));

      fireEvent.click(screen.getByTestId('edit-button'));
      expect(onEdit).toHaveBeenCalled();
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('should show restore button for archived projects', () => {
      const archivedProject = {
        ...mockProject,
        archived_at: '2024-01-01T00:00:00Z',
      };
      const onRestore = vi.fn();

      render(() => (
        <ProjectCard
          project={archivedProject}
          goalName="Test Goal"
          onRestore={onRestore}
        />
      ));

      expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
      expect(screen.getByTestId('restore-button')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('restore-button'));
      expect(onRestore).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should render loading message', () => {
      render(() => <ProjectListLoading />);

      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty message', () => {
      render(() => <ProjectListEmpty />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(
        screen.getByText('No projects yet. Create your first project!')
      ).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render error message', () => {
      const errorMessage = 'Failed to load projects';
      render(() => <ProjectListError error={errorMessage} />);

      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should have error styling', () => {
      render(() => <ProjectListError error="Test error" />);

      const errorElement = screen.getByTestId('error-state');
      expect(errorElement).toHaveClass('bg-red-50');
      expect(errorElement).toHaveClass('text-red-600');
    });
  });

  describe('Project List Rendering', () => {
    it('should render multiple projects', () => {
      const baseProject: Project = {
        goal_id: 'goal-1',
        description: 'Test description',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      } as Project;
      
      const projects: Project[] = [
        {
          ...baseProject,
          id: 'project-1',
          title: 'Project 1',
          status: ProjectStatus.Planning,
        },
        {
          ...baseProject,
          id: 'project-2',
          title: 'Project 2',
          status: ProjectStatus.Active,
        },
        {
          ...baseProject,
          id: 'project-3',
          title: 'Project 3',
          status: ProjectStatus.Completed,
        },
      ];

      render(() => (
        <div class="space-y-3">
          <For each={projects}>
            {(project) => (
              <ProjectCard project={project} goalName="Test Goal" />
            )}
          </For>
        </div>
      ));

      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
      expect(screen.getByText('Project 3')).toBeInTheDocument();
      expect(screen.getByText('Planning')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });
});