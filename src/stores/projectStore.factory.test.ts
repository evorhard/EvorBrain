import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createRoot } from 'solid-js';
import { createProjectStoreFactory } from './projectStore.factory';
import { createProject, createGoal } from '../test/utils';
import { ProjectStatus } from '../types/models';

describe('Project Store Factory', () => {
  let mockApi: any;
  let dispose: (() => void) | undefined;

  beforeEach(() => {
    // Create mock API
    mockApi = {
      project: {
        getAll: vi.fn(),
        getByGoal: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateStatus: vi.fn(),
        delete: vi.fn(),
        restore: vi.fn(),
      },
    };
  });

  afterEach(() => {
    dispose?.();
    dispose = undefined;
    vi.clearAllMocks();
  });

  describe('Store Creation', () => {
    it('should create independent store instances', () => {
      createRoot((d) => {
        dispose = d;

        const store1 = createProjectStoreFactory(mockApi);
        const store2 = createProjectStoreFactory(mockApi);

        // Stores should be independent
        store1.actions.select('test-id');

        expect(store1.state.selectedId).toBe('test-id');
        expect(store2.state.selectedId).toBeNull();
      });
    });

    it('should not make API calls on creation', () => {
      createRoot((d) => {
        dispose = d;
        const store = createProjectStoreFactory(mockApi);

        // Verify no API calls were made during creation
        expect(mockApi.project.getAll).not.toHaveBeenCalled();
        expect(mockApi.project.create).not.toHaveBeenCalled();

        // Store should have initial state
        expect(store.state.items).toEqual([]);
        expect(store.state.isLoading).toBe(false);
        expect(store.state.error).toBeNull();
      });
    });

    it('should accept initial state', () => {
      createRoot((d) => {
        dispose = d;
        const initialItems = [createProject({ title: 'Preset Project' })];
        const store = createProjectStoreFactory(mockApi, {
          initialState: {
            items: initialItems,
            selectedId: 'preset-id',
          },
        });

        expect(store.state.items).toEqual(initialItems);
        expect(store.state.selectedId).toBe('preset-id');
      });
    });
  });

  describe('fetchAll', () => {
    it('should fetch and set projects', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const goal = createGoal({ name: 'Learn TypeScript' });
        const mockProjects = [
          createProject({ title: 'Setup Environment', goal_id: goal.id }),
          createProject({ title: 'Complete Tutorial', goal_id: goal.id }),
        ];

        mockApi.project.getAll.mockResolvedValue(mockProjects);

        const store = createProjectStoreFactory(mockApi);

        // Initial state
        expect(store.state.items).toEqual([]);
        expect(store.state.isLoading).toBe(false);

        // Fetch projects
        await store.actions.fetchAll();

        // Verify API call
        expect(mockApi.project.getAll).toHaveBeenCalledTimes(1);

        // Verify state updates
        expect(store.state.items).toEqual(mockProjects);
        expect(store.state.isLoading).toBe(false);
        expect(store.state.error).toBeNull();
      });
    });

    it('should handle fetch errors', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const error = new Error('Network error');
        mockApi.project.getAll.mockRejectedValue(error);

        const store = createProjectStoreFactory(mockApi);

        // Fetch projects
        await store.actions.fetchAll();

        // Verify error state
        expect(store.state.items).toEqual([]);
        expect(store.state.isLoading).toBe(false);
        expect(store.state.error).toBe('Failed to fetch projects');
      });
    });
  });

  describe('fetchByGoal', () => {
    it('should fetch projects by goal', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const goal = createGoal({ name: 'Learn TypeScript' });
        const mockProjects = [
          createProject({ title: 'Setup Environment', goal_id: goal.id }),
          createProject({ title: 'Complete Tutorial', goal_id: goal.id }),
        ];

        mockApi.project.getByGoal.mockResolvedValue(mockProjects);

        const store = createProjectStoreFactory(mockApi);

        // Fetch projects by goal
        await store.actions.fetchByGoal(goal.id);

        // Verify API call
        expect(mockApi.project.getByGoal).toHaveBeenCalledWith(goal.id);

        // Verify state updates
        expect(store.state.items).toEqual(mockProjects);
        expect(store.state.isLoading).toBe(false);
        expect(store.state.error).toBeNull();
      });
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const goal = createGoal({ name: 'Learn TypeScript' });
        const newProjectData = {
          goal_id: goal.id,
          title: 'New Project',
          description: 'A new project',
          status: ProjectStatus.Planning,
        };

        const createdProject = createProject(newProjectData);
        mockApi.project.create.mockResolvedValue(createdProject);

        const store = createProjectStoreFactory(mockApi);

        // Create project
        const result = await store.actions.create(newProjectData);

        // Verify API call
        expect(mockApi.project.create).toHaveBeenCalledWith(newProjectData);

        // Verify return value
        expect(result).toEqual(createdProject);

        // Verify state updates
        expect(store.state.items).toContainEqual(createdProject);
        expect(store.state.isLoading).toBe(false);
        expect(store.state.error).toBeNull();
      });
    });

    it('should handle creation errors', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const error = new Error('Creation failed');
        mockApi.project.create.mockRejectedValue(error);

        const store = createProjectStoreFactory(mockApi);

        // Attempt to create
        await expect(
          store.actions.create({
            goal_id: 'goal-1',
            title: 'New Project',
            status: ProjectStatus.Planning,
          }),
        ).rejects.toThrow();

        // Verify error state
        expect(store.state.error).toBe('Failed to create project');
      });
    });
  });

  describe('updateStatus', () => {
    it('should update project status', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const project = createProject({ status: ProjectStatus.Planning });
        const updatedProject = { ...project, status: ProjectStatus.Active };

        mockApi.project.updateStatus.mockResolvedValue(updatedProject);

        const store = createProjectStoreFactory(mockApi, {
          initialState: { items: [project] },
        });

        // Update status
        const result = await store.actions.updateStatus(project.id, ProjectStatus.Active);

        // Verify API call
        expect(mockApi.project.updateStatus).toHaveBeenCalledWith(project.id, ProjectStatus.Active);

        // Verify return value
        expect(result).toEqual(updatedProject);

        // Verify state updates
        expect(store.state.items[0].status).toBe(ProjectStatus.Active);
      });
    });
  });

  describe('Computed Values', () => {
    it('should compute active projects', () => {
      createRoot((d) => {
        dispose = d;
        const activeProject = createProject({ title: 'Active Project' });
        const archivedProject = createProject({
          title: 'Archived Project',
          archived_at: '2024-01-01T00:00:00Z',
        });

        const store = createProjectStoreFactory(mockApi, {
          initialState: { items: [activeProject, archivedProject] },
        });

        expect(store.activeProjects()).toEqual([activeProject]);
      });
    });

    it('should compute projects by goal', () => {
      createRoot((d) => {
        dispose = d;
        const goal1 = createGoal({ name: 'Goal 1' });
        const goal2 = createGoal({ name: 'Goal 2' });
        const project1 = createProject({ title: 'Project 1', goal_id: goal1.id });
        const project2 = createProject({ title: 'Project 2', goal_id: goal1.id });
        const project3 = createProject({ title: 'Project 3', goal_id: goal2.id });

        const store = createProjectStoreFactory(mockApi, {
          initialState: { items: [project1, project2, project3] },
        });

        const byGoal = store.projectsByGoal();
        expect(byGoal.get(goal1.id)).toEqual([project1, project2]);
        expect(byGoal.get(goal2.id)).toEqual([project3]);
      });
    });

    it('should compute projects by status', () => {
      createRoot((d) => {
        dispose = d;
        const planningProject = createProject({
          title: 'Planning',
          status: ProjectStatus.Planning,
        });
        const activeProject = createProject({ title: 'Active', status: ProjectStatus.Active });
        const completedProject = createProject({
          title: 'Completed',
          status: ProjectStatus.Completed,
        });

        const store = createProjectStoreFactory(mockApi, {
          initialState: { items: [planningProject, activeProject, completedProject] },
        });

        const byStatus = store.projectsByStatus();
        expect(byStatus.get(ProjectStatus.Planning)).toEqual([planningProject]);
        expect(byStatus.get(ProjectStatus.Active)).toEqual([activeProject]);
        expect(byStatus.get(ProjectStatus.Completed)).toEqual([completedProject]);
      });
    });
  });

  describe('delete and restore', () => {
    it('should delete a project and refetch', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const project = createProject({ title: 'To Delete' });
        const remainingProject = createProject({ title: 'Remaining' });

        mockApi.project.delete.mockResolvedValue(undefined);
        mockApi.project.getAll.mockResolvedValue([remainingProject]);

        const store = createProjectStoreFactory(mockApi, {
          initialState: { items: [project, remainingProject] },
        });

        // Delete project
        await store.actions.delete(project.id);

        // Verify API calls
        expect(mockApi.project.delete).toHaveBeenCalledWith(project.id);
        expect(mockApi.project.getAll).toHaveBeenCalled();

        // Verify state updates
        expect(store.state.items).toEqual([remainingProject]);
      });
    });

    it('should restore an archived project', async () => {
      await createRoot(async (d) => {
        dispose = d;
        const archivedProject = createProject({
          title: 'Archived',
          archived_at: '2024-01-01T00:00:00Z',
        });
        const restoredProject = { ...archivedProject, archived_at: undefined };

        mockApi.project.restore.mockResolvedValue(restoredProject);

        const store = createProjectStoreFactory(mockApi, {
          initialState: { items: [archivedProject] },
        });

        // Restore project
        const result = await store.actions.restore(archivedProject.id);

        // Verify API call
        expect(mockApi.project.restore).toHaveBeenCalledWith(archivedProject.id);

        // Verify return value
        expect(result).toEqual(restoredProject);

        // Verify state updates
        expect(store.state.items[0].archived_at).toBeUndefined();
      });
    });
  });

  describe('Selection', () => {
    it('should select and deselect projects', () => {
      createRoot((d) => {
        dispose = d;
        const project = createProject({ title: 'Test Project' });
        const store = createProjectStoreFactory(mockApi, {
          initialState: { items: [project] },
        });

        // Select project
        store.actions.select(project.id);
        expect(store.state.selectedId).toBe(project.id);
        expect(store.selectedProject()).toEqual(project);

        // Deselect
        store.actions.select(null);
        expect(store.state.selectedId).toBeNull();
        expect(store.selectedProject()).toBeUndefined();
      });
    });
  });
});
