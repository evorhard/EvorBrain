import type { LifeArea, Goal, Project, Task, Note } from '../types/models';

// Store state types
export interface LifeAreaState {
  items: LifeArea[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface GoalState {
  items: Goal[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ProjectState {
  items: Project[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface TaskState {
  items: Task[];
  selectedId: string | null;
  todaysTasks: Task[];
  isLoading: boolean;
  error: string | null;
}

export interface NoteState {
  items: Note[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  activeView: 'dashboard' | 'life-areas' | 'goals' | 'projects' | 'tasks' | 'notes' | 'calendar';
}

export interface AppState {
  lifeAreas: LifeAreaState;
  goals: GoalState;
  projects: ProjectState;
  tasks: TaskState;
  notes: NoteState;
  ui: UIState;
}

// Generic Store interface for integration tests
export interface Store<T> {
  // State accessors
  items: () => T[];
  selectedId: () => string | null;
  selectedItem: () => T | undefined;
  loading: () => boolean;
  error: () => string | null;
  active: () => T[];
  archived: () => T[];

  // Actions
  actions: {
    fetchAll: () => Promise<void>;
    fetchByLifeArea?: (lifeAreaId: string) => Promise<void>;
    fetchByGoal?: (goalId: string) => Promise<void>;
    fetchByProject?: (projectId: string) => Promise<void>;
    fetchSubtasks?: (parentTaskId: string) => Promise<void>;
    fetchTodaysTasks?: () => Promise<void>;
    create: (data: any) => Promise<T>;
    update: (id: string, data: any) => Promise<T>;
    delete: (id: string) => Promise<void>;
    archive: (id: string) => Promise<void>;
    restore: (id: string) => Promise<void>;
    complete?: (id: string) => Promise<void>;
    uncomplete?: (id: string) => Promise<void>;
    updateStatus?: (id: string, status: any) => Promise<void>;
    selectItem: (id: string | null) => void;
    clearSelection: () => void;
  };
}

// Helper to create Store wrapper from factory stores
export function createStoreWrapper<
  T extends { id: string; archived_at: string | null },
>(factoryStore: {
  state: { items: T[]; selectedId: string | null; isLoading: boolean; error: string | null };
  actions: any;
}): Store<T> {
  return {
    // State accessors
    items: () => factoryStore.state.items,
    selectedId: () => factoryStore.state.selectedId,
    selectedItem: () =>
      factoryStore.state.items.find((item) => item.id === factoryStore.state.selectedId),
    loading: () => factoryStore.state.isLoading,
    error: () => factoryStore.state.error,
    active: () => factoryStore.state.items.filter((item) => !item.archived_at),
    archived: () => factoryStore.state.items.filter((item) => item.archived_at !== null),

    // Actions - map to factory actions
    actions: {
      fetchAll: factoryStore.actions.fetchAll,
      fetchByLifeArea: factoryStore.actions.fetchByLifeArea,
      fetchByGoal: factoryStore.actions.fetchByGoal,
      fetchByProject: factoryStore.actions.fetchByProject,
      fetchSubtasks: factoryStore.actions.fetchSubtasks,
      fetchTodaysTasks: factoryStore.actions.fetchTodaysTasks,
      create: factoryStore.actions.create,
      update: factoryStore.actions.update,
      delete: factoryStore.actions.delete,
      archive: factoryStore.actions.delete, // delete is archive in the factory
      restore: factoryStore.actions.restore,
      complete: factoryStore.actions.complete,
      uncomplete: factoryStore.actions.uncomplete,
      updateStatus: factoryStore.actions.updateStatus,
      selectItem: factoryStore.actions.select || factoryStore.actions.selectItem,
      clearSelection: () => (factoryStore.actions.select || factoryStore.actions.selectItem)(null),
    },
  };
}
