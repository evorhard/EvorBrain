# EvorBrain API Documentation

This document describes the TypeScript API client for interacting with the EvorBrain backend through Tauri IPC commands.

## Overview

The API client provides type-safe access to all backend functionality through a unified interface. All API calls return Promises and handle errors consistently.

## Usage

```typescript
import { api } from '@/lib/api';

// Example: Create a new life area
const newArea = await api.lifeArea.create({
  name: 'Health & Fitness',
  description: 'Physical and mental wellbeing',
  color: '#10B981',
  icon: '💪'
});
```

## Error Handling

All API methods can throw an `ApiError` with details about what went wrong:

```typescript
import { api, ApiError } from '@/lib/api';

try {
  const areas = await api.lifeArea.getAll();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.details);
  }
}
```

## API Reference

### Life Areas

Life Areas are the top-level organizational units in EvorBrain.

```typescript
// Create a new life area
api.lifeArea.create(request: CreateLifeAreaRequest): Promise<LifeArea>

// Get all life areas
api.lifeArea.getAll(): Promise<LifeArea[]>

// Get a specific life area
api.lifeArea.getById(id: string): Promise<LifeArea>

// Update a life area
api.lifeArea.update(request: UpdateLifeAreaRequest): Promise<LifeArea>

// Archive a life area (soft delete)
api.lifeArea.delete(id: string): Promise<void>

// Restore an archived life area
api.lifeArea.restore(id: string): Promise<LifeArea>
```

### Goals

Goals belong to Life Areas and represent long-term objectives.

```typescript
// Create a new goal
api.goal.create(request: CreateGoalRequest): Promise<Goal>

// Get all goals
api.goal.getAll(): Promise<Goal[]>

// Get goals for a specific life area
api.goal.getByLifeArea(lifeAreaId: string): Promise<Goal[]>

// Get a specific goal
api.goal.getById(id: string): Promise<Goal>

// Update a goal
api.goal.update(request: UpdateGoalRequest): Promise<Goal>

// Mark a goal as completed
api.goal.complete(id: string): Promise<Goal>

// Mark a goal as not completed
api.goal.uncomplete(id: string): Promise<Goal>

// Archive a goal
api.goal.delete(id: string): Promise<void>

// Restore an archived goal
api.goal.restore(id: string): Promise<Goal>
```

### Projects

Projects belong to Goals and represent actionable work items.

```typescript
// Create a new project
api.project.create(request: CreateProjectRequest): Promise<Project>

// Get all projects
api.project.getAll(): Promise<Project[]>

// Get projects for a specific goal
api.project.getByGoal(goalId: string): Promise<Project[]>

// Get a specific project
api.project.getById(id: string): Promise<Project>

// Update a project
api.project.update(request: UpdateProjectRequest): Promise<Project>

// Update only the project status
api.project.updateStatus(id: string, status: ProjectStatus): Promise<Project>

// Archive a project (cascades to tasks and notes)
api.project.delete(id: string): Promise<void>

// Restore an archived project
api.project.restore(id: string): Promise<Project>
```

### Tasks

Tasks belong to Projects (or can be standalone) and represent specific actions.

```typescript
// Create a new task
api.task.create(request: CreateTaskRequest): Promise<Task>

// Create a task with subtasks
api.task.createWithSubtasks(request: CreateTaskWithSubtasksRequest): Promise<Task>

// Get all tasks
api.task.getAll(): Promise<Task[]>

// Get tasks for a specific project
api.task.getByProject(projectId: string): Promise<Task[]>

// Get subtasks of a parent task
api.task.getSubtasks(parentTaskId: string): Promise<Task[]>

// Get a specific task
api.task.getById(id: string): Promise<Task>

// Update a task
api.task.update(request: UpdateTaskRequest): Promise<Task>

// Mark a task as completed
api.task.complete(id: string): Promise<Task>

// Mark a task as not completed
api.task.uncomplete(id: string): Promise<Task>

// Archive a task (cascades to subtasks)
api.task.delete(id: string): Promise<void>

// Restore an archived task
api.task.restore(id: string): Promise<Task>

// Get today's tasks (due today or urgent priority)
api.task.getTodaysTasks(): Promise<Task[]>
```

### Notes

Notes can be attached to any entity or stand alone.

```typescript
// Create a new note
api.note.create(request: CreateNoteRequest): Promise<Note>

// Get all notes
api.note.getAll(): Promise<Note[]>

// Get notes for a specific task
api.note.getByTask(taskId: string): Promise<Note[]>

// Get notes for a specific project
api.note.getByProject(projectId: string): Promise<Note[]>

// Get notes for a specific goal
api.note.getByGoal(goalId: string): Promise<Note[]>

// Get notes for a specific life area
api.note.getByLifeArea(lifeAreaId: string): Promise<Note[]>

// Get a specific note
api.note.getById(id: string): Promise<Note>

// Update a note
api.note.update(request: UpdateNoteRequest): Promise<Note>

// Archive a note
api.note.delete(id: string): Promise<void>

// Restore an archived note
api.note.restore(id: string): Promise<Note>

// Search notes by title or content
api.note.search(query: string): Promise<Note[]>
```

### Database Management

#### Migrations

```typescript
// Get current migration status
api.migration.getStatus(): Promise<MigrationStatus>

// Run all pending migrations
api.migration.runMigrations(): Promise<MigrationResult>

// Rollback to a specific version
api.migration.rollback(version: number): Promise<MigrationResult>

// Reset database (development only)
api.migration.reset(): Promise<MigrationResult>
```

#### Testing

```typescript
// Test database connection
api.database.test(): Promise<string>
```

## Type Definitions

### Request Types

```typescript
interface CreateLifeAreaRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface CreateGoalRequest {
  life_area_id: string;
  title: string;
  description?: string;
  target_date?: string; // ISO 8601 datetime
}

interface CreateProjectRequest {
  goal_id: string;
  title: string;
  description?: string;
  status?: ProjectStatus;
}

interface CreateTaskRequest {
  project_id?: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string; // ISO 8601 datetime
}

interface CreateNoteRequest {
  task_id?: string;
  project_id?: string;
  goal_id?: string;
  life_area_id?: string;
  title: string;
  content: string;
}
```

### Model Types

See [`src/types/models.ts`](../src/types/models.ts) for complete model definitions.

### Enums

```typescript
enum ProjectStatus {
  Planning = "planning",
  Active = "active",
  OnHold = "onhold",
  Completed = "completed",
  Cancelled = "cancelled"
}

enum TaskPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
  Urgent = "urgent"
}
```

## Best Practices

1. **Always handle errors** - Use try/catch blocks or `.catch()` for error handling
2. **Check for null/undefined** - Some fields are optional and may not be present
3. **Use TypeScript types** - Import types from `@/types` for full type safety
4. **Batch operations when possible** - Multiple API calls can be made concurrently with `Promise.all()`
5. **Cache when appropriate** - Consider caching frequently accessed data like Life Areas

## Examples

### Creating a Complete Hierarchy

```typescript
// Create a life area
const area = await api.lifeArea.create({
  name: 'Career',
  description: 'Professional development and work',
  color: '#3B82F6',
  icon: '💼'
});

// Create a goal in that area
const goal = await api.goal.create({
  life_area_id: area.id,
  title: 'Become a Senior Developer',
  description: 'Advance technical skills and leadership',
  target_date: '2025-12-31T00:00:00Z'
});

// Create a project for that goal
const project = await api.project.create({
  goal_id: goal.id,
  title: 'Learn Rust Programming',
  description: 'Master Rust for systems programming',
  status: ProjectStatus.Active
});

// Create a task with subtasks
const mainTask = await api.task.createWithSubtasks({
  task: {
    project_id: project.id,
    title: 'Complete Rust Book',
    priority: TaskPriority.High,
    due_date: '2025-02-28T00:00:00Z'
  },
  subtasks: [
    { title: 'Read Chapter 1: Getting Started' },
    { title: 'Complete Chapter 1 exercises' },
    { title: 'Read Chapter 2: Programming Concepts' }
  ]
});
```

### Loading Dashboard Data

```typescript
// Load data for dashboard in parallel
const [todaysTasks, activeProjects, recentNotes] = await Promise.all([
  api.task.getTodaysTasks(),
  api.project.getAll().then(projects => 
    projects.filter(p => p.status === ProjectStatus.Active)
  ),
  api.note.getAll().then(notes => 
    notes.slice(0, 5) // Get 5 most recent
  )
]);
```

### Search and Filter

```typescript
// Search for notes containing "meeting"
const meetingNotes = await api.note.search('meeting');

// Get incomplete tasks for a project
const projectTasks = await api.task.getByProject(projectId);
const incompleteTasks = projectTasks.filter(task => !task.completed_at);

// Get goals by life area with error handling
try {
  const healthGoals = await api.goal.getByLifeArea(healthAreaId);
  const activeGoals = healthGoals.filter(goal => 
    !goal.completed_at && !goal.archived_at
  );
} catch (error) {
  console.error('Failed to load goals:', error);
  // Show user-friendly error message
}
```