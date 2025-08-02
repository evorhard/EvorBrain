import { createEffect, For, Show, createSignal } from 'solid-js';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { DropdownMenu } from '../../ui/DropdownMenu';
import { createConfirmDialog } from '../../ui/ConfirmDialog';
import { useProjectStore, useGoalStore } from '../../../stores';
import type { Project, ProjectStatus } from '../../../types/models';
import { formatDate } from '../../../utils/formatters';

interface ProjectListProps {
  onEdit?: (project: Project) => void;
}

export function ProjectList(props: ProjectListProps) {
  const { store: projectStore, actions: projectActions } = useProjectStore();
  const { store: goalStore, actions: goalActions } = useGoalStore();
  const [projectToDelete, setProjectToDelete] = createSignal<Project | null>(null);

  // Fetch projects and goals on mount
  createEffect(() => {
    try {
      projectActions.fetchAll().catch((error) => {
        console.error('[ProjectList] Failed to fetch projects:', error);
      });
      goalActions.fetchAll().catch((error) => {
        console.error('[ProjectList] Failed to fetch goals:', error);
      });
    } catch (error) {
      console.error('[ProjectList] Error in createEffect:', error);
    }
  });

  const handleDelete = async () => {
    const project = projectToDelete();
    if (project) {
      try {
        await projectActions.delete(project.id);
        setProjectToDelete(null);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const [DeleteConfirmDialog, deleteConfirmHandle] = createConfirmDialog({
    title: 'Delete Project',
    description: () => {
      const project = projectToDelete();
      return project
        ? `Are you sure you want to delete "${project.title}"? This will also archive all tasks associated with this project.`
        : '';
    },
    confirmText: 'Delete',
    variant: 'danger',
    onConfirm: handleDelete,
    onCancel: () => setProjectToDelete(null),
  });

  const handleRestore = async (project: Project) => {
    try {
      await projectActions.restore(project.id);
    } catch (error) {
      console.error('Failed to restore project:', error);
    }
  };

  const handleStatusChange = async (project: Project, status: ProjectStatus) => {
    try {
      await projectActions.updateStatus(project.id, status);
    } catch (error) {
      console.error('Failed to update project status:', error);
    }
  };

  const handleSelect = (project: Project) => {
    projectActions.select(project.id === projectStore.selectedId ? null : project.id);
  };

  const getGoalName = (goalId: string) => {
    const goal = goalStore.items.find((g) => g.id === goalId);
    return goal?.name || 'Unknown Goal';
  };

  const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
      case 'planning':
        return 'secondary';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'on_hold':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: ProjectStatus) =>
    status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return (
    <div class="space-y-4">
      <Show
        when={!projectStore.isLoading}
        fallback={
          <div class="flex items-center justify-center py-8">
            <div class="text-neutral-500">Loading projects...</div>
          </div>
        }
      >
        <Show
          when={projectStore.items.length > 0}
          fallback={
            <Card>
              <div class="p-8 text-center">
                <p class="text-neutral-500">No projects yet. Create your first project!</p>
              </div>
            </Card>
          }
        >
          <For each={projectStore.items}>
            {(project) => (
              <Card
                class={`cursor-pointer transition-all ${
                  projectStore.selectedId === project.id
                    ? 'ring-primary-500 ring-2'
                    : 'hover:shadow-md'
                } ${project.archived_at ? 'opacity-60' : ''}`}
                onClick={() => handleSelect(project)}
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="mb-2 flex items-center gap-3">
                      <h3 class="text-lg font-semibold">{project.title}</h3>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
                      <Show when={project.archived_at}>
                        <Badge variant="secondary">Archived</Badge>
                      </Show>
                    </div>
                    <Show when={project.description}>
                      <p class="mb-2 text-neutral-600 dark:text-neutral-400">
                        {project.description}
                      </p>
                    </Show>
                    <div class="flex items-center gap-4 text-sm text-neutral-500">
                      <span>Goal: {getGoalName(project.goal_id)}</span>
                      <span>Created: {formatDate(project.created_at)}</span>
                      <Show when={project.completed_at}>
                        <span>Completed: {formatDate(project.completed_at || '')}</span>
                      </Show>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      {(triggerProps) => (
                        <Button
                          {...triggerProps}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerProps.onClick(e);
                          }}
                        >
                          <svg
                            class="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </Button>
                      )}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <Show when={!project.archived_at}>
                        <DropdownMenu.Item
                          onSelect={() => {
                            props.onEdit?.(project);
                          }}
                        >
                          Edit
                        </DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <Show when={project.status !== 'planning'}>
                          <DropdownMenu.Item
                            onSelect={() => handleStatusChange(project, 'planning')}
                          >
                            Mark as Planning
                          </DropdownMenu.Item>
                        </Show>
                        <Show when={project.status !== 'in_progress'}>
                          <DropdownMenu.Item
                            onSelect={() => handleStatusChange(project, 'in_progress')}
                          >
                            Mark as In Progress
                          </DropdownMenu.Item>
                        </Show>
                        <Show when={project.status !== 'completed'}>
                          <DropdownMenu.Item
                            onSelect={() => handleStatusChange(project, 'completed')}
                          >
                            Mark as Completed
                          </DropdownMenu.Item>
                        </Show>
                        <Show when={project.status !== 'on_hold'}>
                          <DropdownMenu.Item
                            onSelect={() => handleStatusChange(project, 'on_hold')}
                          >
                            Mark as On Hold
                          </DropdownMenu.Item>
                        </Show>
                        <Show when={project.status !== 'cancelled'}>
                          <DropdownMenu.Item
                            onSelect={() => handleStatusChange(project, 'cancelled')}
                          >
                            Mark as Cancelled
                          </DropdownMenu.Item>
                        </Show>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item
                          class="text-danger-600"
                          onSelect={() => {
                            setProjectToDelete(project);
                            deleteConfirmHandle.open();
                          }}
                        >
                          Delete
                        </DropdownMenu.Item>
                      </Show>
                      <Show when={project.archived_at}>
                        <DropdownMenu.Item onSelect={() => handleRestore(project)}>
                          Restore
                        </DropdownMenu.Item>
                      </Show>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </div>
              </Card>
            )}
          </For>
        </Show>
      </Show>

      <DeleteConfirmDialog />
    </div>
  );
}
