import type {
  LifeArea,
  Goal,
  Project,
  Task,
  Note,
  Priority,
  ProjectStatus,
} from '../../types/models';

/**
 * Factory functions for creating test data
 */

let idCounter = 0;

/**
 * Generate a unique ID for testing
 */
export const generateId = (prefix = 'test') => `${prefix}-${++idCounter}-${Date.now()}`;

/**
 * Reset the ID counter (useful between test suites)
 */
export const resetIdCounter = () => {
  idCounter = 0;
};

/**
 * Create a test timestamp
 */
export const createTimestamp = (daysOffset = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

/**
 * Factory for creating Life Area test data
 */
export const createLifeArea = (overrides?: Partial<LifeArea>): LifeArea => ({
  id: generateId('life-area'),
  name: 'Test Life Area',
  description: 'A test life area for testing purposes',
  color: '#3B82F6',
  icon: '🎯',
  position: 0,
  created_at: createTimestamp(),
  updated_at: createTimestamp(),
  archived_at: null,
  ...overrides,
});

/**
 * Factory for creating Goal test data
 */
export const createGoal = (overrides?: Partial<Goal>): Goal => ({
  id: generateId('goal'),
  life_area_id: generateId('life-area'),
  title: 'Test Goal',
  description: 'A test goal for testing purposes',
  target_date: createTimestamp(30), // 30 days from now
  completed_at: null,
  position: 0,
  created_at: createTimestamp(),
  updated_at: createTimestamp(),
  archived_at: null,
  ...overrides,
});

/**
 * Factory for creating Project test data
 */
export const createProject = (overrides?: Partial<Project>): Project => ({
  id: generateId('project'),
  goal_id: generateId('goal'),
  name: 'Test Project',
  description: 'A test project for testing purposes',
  status: 'not_started' as ProjectStatus,
  position: 0,
  created_at: createTimestamp(),
  updated_at: createTimestamp(),
  archived_at: null,
  ...overrides,
});

/**
 * Factory for creating Task test data
 */
export const createTask = (overrides?: Partial<Task>): Task => ({
  id: generateId('task'),
  project_id: generateId('project'),
  parent_task_id: null,
  title: 'Test Task',
  description: 'A test task for testing purposes',
  priority: 'medium' as Priority,
  due_date: null,
  completed_at: null,
  position: 0,
  created_at: createTimestamp(),
  updated_at: createTimestamp(),
  archived_at: null,
  ...overrides,
});

/**
 * Factory for creating Note test data
 */
export const createNote = (overrides?: Partial<Note>): Note => ({
  id: generateId('note'),
  content: '# Test Note\n\nThis is a test note with **markdown** content.',
  task_id: null,
  project_id: null,
  goal_id: null,
  life_area_id: null,
  tags: [],
  created_at: createTimestamp(),
  updated_at: createTimestamp(),
  archived_at: null,
  ...overrides,
});

/**
 * Create a complete hierarchy of test data
 */
export interface TestDataHierarchy {
  lifeArea: LifeArea;
  goal: Goal;
  project: Project;
  task: Task;
  subtask: Task;
  note: Note;
}

export const createTestHierarchy = (overrides?: {
  lifeArea?: Partial<LifeArea>;
  goal?: Partial<Goal>;
  project?: Partial<Project>;
  task?: Partial<Task>;
  subtask?: Partial<Task>;
  note?: Partial<Note>;
}): TestDataHierarchy => {
  const lifeArea = createLifeArea(overrides?.lifeArea);
  const goal = createGoal({
    life_area_id: lifeArea.id,
    ...overrides?.goal,
  });
  const project = createProject({
    goal_id: goal.id,
    ...overrides?.project,
  });
  const task = createTask({
    project_id: project.id,
    ...overrides?.task,
  });
  const subtask = createTask({
    project_id: project.id,
    parent_task_id: task.id,
    ...overrides?.subtask,
  });
  const note = createNote({
    task_id: task.id,
    ...overrides?.note,
  });

  return { lifeArea, goal, project, task, subtask, note };
};

/**
 * Create multiple items with relationships
 */
export const createLifeAreaWithGoals = (
  goalCount = 3,
  lifeAreaOverrides?: Partial<LifeArea>,
  goalOverrides?: Partial<Goal>,
) => {
  const lifeArea = createLifeArea(lifeAreaOverrides);
  const goals = Array.from({ length: goalCount }, (_, i) =>
    createGoal({
      life_area_id: lifeArea.id,
      title: `Goal ${i + 1}`,
      position: i,
      ...goalOverrides,
    }),
  );

  return { lifeArea, goals };
};

/**
 * Create a project with tasks
 */
export const createProjectWithTasks = (
  taskCount = 5,
  projectOverrides?: Partial<Project>,
  taskOverrides?: Partial<Task>,
) => {
  const project = createProject(projectOverrides);
  const tasks = Array.from({ length: taskCount }, (_, i) =>
    createTask({
      project_id: project.id,
      title: `Task ${i + 1}`,
      position: i,
      priority: ['low', 'medium', 'high'][i % 3] as Priority,
      ...taskOverrides,
    }),
  );

  return { project, tasks };
};

/**
 * Create test data for different states
 */
export const createCompletedGoal = (overrides?: Partial<Goal>): Goal =>
  createGoal({
    completed_at: createTimestamp(),
    ...overrides,
  });

export const createArchivedLifeArea = (overrides?: Partial<LifeArea>): LifeArea =>
  createLifeArea({
    archived_at: createTimestamp(),
    ...overrides,
  });

export const createOverdueTask = (overrides?: Partial<Task>): Task =>
  createTask({
    due_date: createTimestamp(-7), // 7 days ago
    ...overrides,
  });

export const createInProgressProject = (overrides?: Partial<Project>): Project =>
  createProject({
    status: 'in_progress' as ProjectStatus,
    ...overrides,
  });

/**
 * Create invalid test data for error testing
 */
export const createInvalidLifeArea = (): Partial<LifeArea> => ({
  id: generateId('invalid'),
  name: '', // Invalid: empty name
  color: 'not-a-color', // Invalid: not a valid color
  position: -1, // Invalid: negative position
});

/**
 * Batch create test data
 */
export const batchCreate = <T>(
  factory: (overrides?: Partial<T>) => T,
  count: number,
  overrides?: (index: number) => Partial<T>,
): T[] => Array.from({ length: count }, (_, i) => factory(overrides ? overrides(i) : undefined));
