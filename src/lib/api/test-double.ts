import type { ApiClient } from './interface';
import type { LifeArea, Goal, Project, Task, Note, MigrationStatus } from '../../types/models';
import type {
  CreateLifeAreaRequest,
  UpdateLifeAreaRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateNoteRequest,
  UpdateNoteRequest,
} from '../../types/commands';

/**
 * Test double for the API client that can be used in tests.
 * This implementation stores data in memory and provides helpers
 * for setting up test scenarios.
 */
export class TestApiClient implements ApiClient {
  private data = {
    lifeAreas: new Map<string, LifeArea>(),
    goals: new Map<string, Goal>(),
    projects: new Map<string, Project>(),
    tasks: new Map<string, Task>(),
    notes: new Map<string, Note>(),
  };

  private migrationStatus: MigrationStatus = {
    current_version: 1,
    target_version: 1,
    migrations_needed: [],
  };

  // Test helpers
  public testHelpers = {
    addLifeArea: (lifeArea: LifeArea) => {
      this.data.lifeAreas.set(lifeArea.id, lifeArea);
    },
    addGoal: (goal: Goal) => {
      this.data.goals.set(goal.id, goal);
    },
    addProject: (project: Project) => {
      this.data.projects.set(project.id, project);
    },
    addTask: (task: Task) => {
      this.data.tasks.set(task.id, task);
    },
    addNote: (note: Note) => {
      this.data.notes.set(note.id, note);
    },
    setMigrationStatus: (status: MigrationStatus) => {
      this.migrationStatus = status;
    },
    clear: () => {
      this.data.lifeAreas.clear();
      this.data.goals.clear();
      this.data.projects.clear();
      this.data.tasks.clear();
      this.data.notes.clear();
    },
  };

  // Migration operations
  migration = {
    getStatus: async () => this.migrationStatus,
    run: async () => {
      this.migrationStatus = {
        ...this.migrationStatus,
        current_version: this.migrationStatus.target_version,
        migrations_needed: [],
      };
    },
    rollback: async (version: number) => {
      this.migrationStatus.current_version = version;
    },
    reset: async () => {
      this.testHelpers.clear();
      this.migrationStatus.current_version = 0;
    },
  };

  // Life Area operations
  lifeArea = {
    getAll: async () => Array.from(this.data.lifeAreas.values()),
    getOne: async (id: string) => {
      const lifeArea = this.data.lifeAreas.get(id);
      if (!lifeArea) throw new Error(`Life area not found: ${id}`);
      return lifeArea;
    },
    create: async (data: CreateLifeAreaRequest) => {
      const lifeArea: LifeArea = {
        id: `la_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name: data.name,
        description: data.description || null,
        color: data.color || null,
        icon: data.icon || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      this.data.lifeAreas.set(lifeArea.id, lifeArea);
      return lifeArea;
    },
    update: async (data: UpdateLifeAreaRequest) => {
      const lifeArea = this.data.lifeAreas.get(data.id);
      if (!lifeArea) throw new Error(`Life area not found: ${data.id}`);

      const updated = {
        ...lifeArea,
        ...data,
        updated_at: new Date().toISOString(),
      };
      this.data.lifeAreas.set(data.id, updated);
      return updated;
    },
    delete: async (id: string) => {
      const lifeArea = this.data.lifeAreas.get(id);
      if (!lifeArea) throw new Error(`Life area not found: ${id}`);

      lifeArea.archived_at = new Date().toISOString();

      // Archive related entities - cascade through hierarchy
      const archivedGoalIds = new Set<string>();
      for (const goal of this.data.goals.values()) {
        if (goal.life_area_id === id) {
          goal.archived_at = new Date().toISOString();
          archivedGoalIds.add(goal.id);
        }
      }

      // Archive projects for archived goals
      const archivedProjectIds = new Set<string>();
      for (const project of this.data.projects.values()) {
        if (archivedGoalIds.has(project.goal_id)) {
          project.archived_at = new Date().toISOString();
          archivedProjectIds.add(project.id);
        }
      }

      // Archive tasks for archived projects
      for (const task of this.data.tasks.values()) {
        if (task.project_id && archivedProjectIds.has(task.project_id)) {
          task.archived_at = new Date().toISOString();
        }
      }
    },
    restore: async (id: string) => {
      const lifeArea = this.data.lifeAreas.get(id);
      if (!lifeArea) throw new Error(`Life area not found: ${id}`);

      lifeArea.archived_at = null;
      lifeArea.updated_at = new Date().toISOString();

      // Restore related entities - cascade through hierarchy
      const restoredGoalIds = new Set<string>();
      for (const goal of this.data.goals.values()) {
        if (goal.life_area_id === id) {
          goal.archived_at = null;
          goal.updated_at = new Date().toISOString();
          restoredGoalIds.add(goal.id);
        }
      }

      // Restore projects for restored goals
      const restoredProjectIds = new Set<string>();
      for (const project of this.data.projects.values()) {
        if (restoredGoalIds.has(project.goal_id)) {
          project.archived_at = null;
          project.updated_at = new Date().toISOString();
          restoredProjectIds.add(project.id);
        }
      }

      // Restore tasks for restored projects
      for (const task of this.data.tasks.values()) {
        if (task.project_id && restoredProjectIds.has(task.project_id)) {
          task.archived_at = null;
          task.updated_at = new Date().toISOString();
        }
      }

      return lifeArea;
    },
  };

  // Goal operations
  goal = {
    getAll: async () => Array.from(this.data.goals.values()),
    getByLifeArea: async (lifeAreaId: string) =>
      Array.from(this.data.goals.values()).filter((goal) => goal.life_area_id === lifeAreaId),
    getOne: async (id: string) => {
      const goal = this.data.goals.get(id);
      if (!goal) throw new Error(`Goal not found: ${id}`);
      return goal;
    },
    create: async (data: CreateGoalRequest) => {
      const goal: Goal = {
        id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        life_area_id: data.life_area_id,
        title: data.title,
        description: data.description || null,
        target_date: data.target_date || null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      this.data.goals.set(goal.id, goal);
      return goal;
    },
    update: async (data: UpdateGoalRequest) => {
      const goal = this.data.goals.get(data.id);
      if (!goal) throw new Error(`Goal not found: ${data.id}`);

      const updated = {
        ...goal,
        ...data,
        updated_at: new Date().toISOString(),
      };
      this.data.goals.set(data.id, updated);
      return updated;
    },
    complete: async (id: string) => {
      const goal = this.data.goals.get(id);
      if (!goal) throw new Error(`Goal not found: ${id}`);

      goal.completed_at = new Date().toISOString();
      goal.updated_at = new Date().toISOString();
      return goal;
    },
    uncomplete: async (id: string) => {
      const goal = this.data.goals.get(id);
      if (!goal) throw new Error(`Goal not found: ${id}`);

      goal.completed_at = null;
      goal.updated_at = new Date().toISOString();
      return goal;
    },
    delete: async (id: string) => {
      const goal = this.data.goals.get(id);
      if (!goal) throw new Error(`Goal not found: ${id}`);

      goal.archived_at = new Date().toISOString();

      // Archive related projects
      for (const project of this.data.projects.values()) {
        if (project.goal_id === id) {
          project.archived_at = new Date().toISOString();
        }
      }
    },
    restore: async (id: string) => {
      const goal = this.data.goals.get(id);
      if (!goal) throw new Error(`Goal not found: ${id}`);

      goal.archived_at = null;
      goal.updated_at = new Date().toISOString();
      return goal;
    },
  };

  // Project operations
  project = {
    getAll: async () => Array.from(this.data.projects.values()),
    getByGoal: async (goalId: string) =>
      Array.from(this.data.projects.values()).filter((project) => project.goal_id === goalId),
    getOne: async (id: string) => {
      const project = this.data.projects.get(id);
      if (!project) throw new Error(`Project not found: ${id}`);
      return project;
    },
    create: async (data: CreateProjectRequest) => {
      const project: Project = {
        id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        goal_id: data.goal_id || null,
        name: data.name,
        description: data.description || null,
        status: data.status || 'not_started',
        due_date: data.due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      this.data.projects.set(project.id, project);
      return project;
    },
    update: async (data: UpdateProjectRequest) => {
      const project = this.data.projects.get(data.id);
      if (!project) throw new Error(`Project not found: ${data.id}`);

      const updated = {
        ...project,
        ...data,
        updated_at: new Date().toISOString(),
      };
      this.data.projects.set(data.id, updated);
      return updated;
    },
    updateStatus: async (id: string, status: Project['status']) => {
      const project = this.data.projects.get(id);
      if (!project) throw new Error(`Project not found: ${id}`);

      project.status = status;
      project.updated_at = new Date().toISOString();
      return project;
    },
    delete: async (id: string) => {
      const project = this.data.projects.get(id);
      if (!project) throw new Error(`Project not found: ${id}`);

      project.archived_at = new Date().toISOString();

      // Archive related tasks
      for (const task of this.data.tasks.values()) {
        if (task.project_id === id) {
          task.archived_at = new Date().toISOString();
        }
      }
    },
    restore: async (id: string) => {
      const project = this.data.projects.get(id);
      if (!project) throw new Error(`Project not found: ${id}`);

      project.archived_at = null;
      project.updated_at = new Date().toISOString();
      return project;
    },
  };

  // Task operations
  task = {
    getAll: async () => Array.from(this.data.tasks.values()),
    getByProject: async (projectId: string) =>
      Array.from(this.data.tasks.values()).filter((task) => task.project_id === projectId),
    getSubtasks: async (parentId: string) =>
      Array.from(this.data.tasks.values()).filter((task) => task.parent_task_id === parentId),
    getOne: async (id: string) => {
      const task = this.data.tasks.get(id);
      if (!task) throw new Error(`Task not found: ${id}`);
      return task;
    },
    getTodaysTasks: async () => {
      const today = new Date().toISOString().split('T')[0];
      return Array.from(this.data.tasks.values()).filter((task) =>
        task.due_date?.startsWith(today),
      );
    },
    create: async (data: CreateTaskRequest) => {
      const task: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        project_id: data.project_id || null,
        parent_task_id: data.parent_task_id || null,
        title: data.title,
        description: data.description || null,
        status: data.status || 'inbox',
        priority: data.priority || 'medium',
        due_date: data.due_date || null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      this.data.tasks.set(task.id, task);
      return task;
    },
    createWithSubtasks: async (data: CreateTaskRequest, subtasks: CreateTaskRequest[]) => {
      const parent = await this.task.create(data);

      for (const subtaskData of subtasks) {
        await this.task.create({
          ...subtaskData,
          parent_task_id: parent.id,
          project_id: parent.project_id,
        });
      }

      return parent;
    },
    update: async (data: UpdateTaskRequest) => {
      const task = this.data.tasks.get(data.id);
      if (!task) throw new Error(`Task not found: ${data.id}`);

      const updated = {
        ...task,
        ...data,
        updated_at: new Date().toISOString(),
      };
      this.data.tasks.set(data.id, updated);
      return updated;
    },
    complete: async (id: string) => {
      const task = this.data.tasks.get(id);
      if (!task) throw new Error(`Task not found: ${id}`);

      task.completed_at = new Date().toISOString();
      task.updated_at = new Date().toISOString();
      return task;
    },
    uncomplete: async (id: string) => {
      const task = this.data.tasks.get(id);
      if (!task) throw new Error(`Task not found: ${id}`);

      task.completed_at = null;
      task.updated_at = new Date().toISOString();
      return task;
    },
    delete: async (id: string) => {
      const task = this.data.tasks.get(id);
      if (!task) throw new Error(`Task not found: ${id}`);

      task.archived_at = new Date().toISOString();

      // Archive subtasks
      for (const subtask of this.data.tasks.values()) {
        if (subtask.parent_task_id === id) {
          subtask.archived_at = new Date().toISOString();
        }
      }
    },
    restore: async (id: string) => {
      const task = this.data.tasks.get(id);
      if (!task) throw new Error(`Task not found: ${id}`);

      task.archived_at = null;
      task.updated_at = new Date().toISOString();
      return task;
    },
  };

  // Note operations
  note = {
    getAll: async () => Array.from(this.data.notes.values()),
    getByTask: async (taskId: string) =>
      Array.from(this.data.notes.values()).filter((note) => note.task_id === taskId),
    getByProject: async (projectId: string) =>
      Array.from(this.data.notes.values()).filter((note) => note.project_id === projectId),
    getByGoal: async (goalId: string) =>
      Array.from(this.data.notes.values()).filter((note) => note.goal_id === goalId),
    getByLifeArea: async (lifeAreaId: string) =>
      Array.from(this.data.notes.values()).filter((note) => note.life_area_id === lifeAreaId),
    getOne: async (id: string) => {
      const note = this.data.notes.get(id);
      if (!note) throw new Error(`Note not found: ${id}`);
      return note;
    },
    create: async (data: CreateNoteRequest) => {
      const note: Note = {
        id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        title: data.title,
        content: data.content,
        task_id: data.task_id || null,
        project_id: data.project_id || null,
        goal_id: data.goal_id || null,
        life_area_id: data.life_area_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      this.data.notes.set(note.id, note);
      return note;
    },
    update: async (data: UpdateNoteRequest) => {
      const note = this.data.notes.get(data.id);
      if (!note) throw new Error(`Note not found: ${data.id}`);

      const updated = {
        ...note,
        ...data,
        updated_at: new Date().toISOString(),
      };
      this.data.notes.set(data.id, updated);
      return updated;
    },
    delete: async (id: string) => {
      const note = this.data.notes.get(id);
      if (!note) throw new Error(`Note not found: ${id}`);

      note.archived_at = new Date().toISOString();
    },
    restore: async (id: string) => {
      const note = this.data.notes.get(id);
      if (!note) throw new Error(`Note not found: ${id}`);

      note.archived_at = null;
      note.updated_at = new Date().toISOString();
      return note;
    },
    search: async (query: string) => {
      const lowerQuery = query.toLowerCase();
      return Array.from(this.data.notes.values()).filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery),
      );
    },
  };
}
