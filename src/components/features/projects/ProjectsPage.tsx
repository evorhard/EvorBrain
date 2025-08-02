import { createSignal, Show } from 'solid-js';
import { ProjectList } from './ProjectList';
import { ProjectForm } from './ProjectForm';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { useProjectStore } from '../../../stores';
import type { Project } from '../../../types/models';

export function ProjectsPage() {
  const { store: projectStore } = useProjectStore();
  const [showForm, setShowForm] = createSignal(false);
  const [editingProject, setEditingProject] = createSignal<Project | undefined>(undefined);

  const handleCreateClick = () => {
    setEditingProject(undefined);
    setShowForm(true);
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(undefined);
  };

  // Listen for project selection to enable editing
  const selectedProject = () => {
    if (projectStore.selectedId) {
      return projectStore.items.find((p) => p.id === projectStore.selectedId);
    }
    return undefined;
  };

  return (
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Projects</h1>
        <div class="flex gap-3">
          <Show when={selectedProject() && !selectedProject()?.archived_at}>
            <Button
              variant="secondary"
              onClick={() => {
                const project = selectedProject();
                if (project) {
                  handleEditClick(project);
                }
              }}
            >
              Edit Selected
            </Button>
          </Show>
          <Button onClick={handleCreateClick}>
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Project
          </Button>
        </div>
      </div>

      <ProjectList onEdit={handleEditClick} />

      <Modal
        open={showForm()}
        onOpenChange={setShowForm}
        title={editingProject() ? 'Edit Project' : 'Create New Project'}
      >
        <ProjectForm project={editingProject()} onClose={handleCloseForm} />
      </Modal>
    </div>
  );
}
