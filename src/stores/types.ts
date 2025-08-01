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
