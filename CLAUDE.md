# EvorBrain AI Assistant Guide (CLAUDE.md)

**Document Version:** 1.0  
**Last Updated:** 2025-01-15  
**Purpose:** Comprehensive guide for AI assistants contributing to the EvorBrain project

---

## Table of Contents

1. [Project Context & Goals](#project-context--goals)
2. [Technical Architecture Overview](#technical-architecture-overview)
3. [Coding Standards & Conventions](#coding-standards--conventions)
4. [Key Libraries & Usage](#key-libraries--usage)
5. [Development Workflow](#development-workflow)
6. [Feature Implementation Guide](#feature-implementation-guide)
7. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
8. [Future Feature Considerations](#future-feature-considerations)

---

## Project Context & Goals

### Vision: Offline-First Personal Productivity System

EvorBrain is a desktop application that empowers users to organize their entire life through a hierarchical structure, from high-level life areas down to actionable daily tasks. Unlike cloud-dependent solutions, EvorBrain prioritizes data privacy, ownership, and offline functionality.

### Core Philosophy & Design Principles

1. **Data Sovereignty**: Users own their data completely - no cloud dependency, no telemetry
2. **Hierarchy First**: Everything flows from Life Areas → Goals → Projects → Tasks
3. **Visual Clarity**: Complex information presented through intuitive visual interfaces
4. **Keyboard Efficiency**: Power users can navigate entirely without mouse
5. **Progressive Disclosure**: Simple for beginners, powerful for advanced users
6. **Resilient Architecture**: System should never lose user data or corrupt state

### Key Differentiators

- **True Offline**: Full functionality without internet (unlike Notion, Todoist)
- **Hierarchical by Design**: Not just tags/labels, but structured relationships
- **Desktop Native**: Optimized for desktop workflows, not mobile-first compromises
- **Open Core**: Extensible through plugins while maintaining core stability
- **Performance Focus**: Instant responses, even with 100k+ tasks

### User Experience Priorities

1. **Speed**: < 100ms response for all interactions
2. **Reliability**: Zero data loss, automatic backups
3. **Flexibility**: Multiple views (Calendar, Kanban, List) for different workflows
4. **Discoverability**: Features should be intuitive without documentation
5. **Consistency**: Same patterns throughout the application

---

## Technical Architecture Overview

### Feature-Sliced Design Implementation

```
src/
├── app/                    # Application initialization, providers, global styles
│   ├── providers/          # React context providers
│   ├── styles/            # Global CSS and theme
│   └── index.tsx          # App entry point
│
├── pages/                  # Route pages (thin layer)
│   ├── calendar/          # Calendar page
│   ├── dashboard/         # Dashboard page
│   └── tasks/             # Tasks page
│
├── widgets/                # Complete UI blocks
│   ├── Sidebar/           # Main navigation sidebar
│   ├── TaskCalendar/      # Calendar widget
│   └── GoalOverview/      # Goal progress widget
│
├── features/              # Business logic slices
│   ├── life-areas/        # Life area management
│   ├── goals/             # Goal CRUD and logic
│   ├── projects/          # Project management
│   └── tasks/             # Task operations
│
├── entities/              # Business entities
│   ├── task/              # Task model and types
│   ├── project/           # Project model
│   ├── goal/              # Goal model
│   └── life-area/         # Life area model
│
└── shared/                # Shared utilities
    ├── ui/                # UI components
    ├── api/               # Tauri IPC layer
    ├── lib/               # Utilities
    └── config/            # Constants
```

**Key FSD Rules:**

- Dependencies flow downward only: `app` → `pages` → `widgets` → `features` → `entities` → `shared`
- Cross-imports between slices on the same layer are forbidden
- Public API exports through `index.ts` files only

### State Management Patterns with Zustand

```typescript
// Example store structure
// src/features/tasks/model/store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface TasksState {
  tasks: Map<string, Task>;
  selectedTaskId: string | null;
  isLoading: boolean;

  // Actions
  loadTasks: () => Promise<void>;
  createTask: (task: CreateTaskDto) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>()(
  devtools(
    persist(
      immer((set, get) => ({
        tasks: new Map(),
        selectedTaskId: null,
        isLoading: false,

        loadTasks: async () => {
          set((state) => {
            state.isLoading = true;
          });
          const tasks = await invoke<Task[]>("get_tasks");
          set((state) => {
            state.tasks = new Map(tasks.map((t) => [t.id, t]));
            state.isLoading = false;
          });
        },

        createTask: async (dto) => {
          const task = await invoke<Task>("create_task", { task: dto });
          set((state) => {
            state.tasks.set(task.id, task);
          });
        },

        // ... other actions
      })),
      {
        name: "tasks-storage",
        partialize: (state) => ({ selectedTaskId: state.selectedTaskId }),
      }
    )
  )
);
```

### Database Access Patterns

```rust
// Rust backend example
// src-tauri/src/database/tasks.rs
use sqlx::{Pool, Sqlite};
use crate::models::Task;

pub async fn get_tasks_by_project(
    pool: &Pool<Sqlite>,
    project_id: &str
) -> Result<Vec<Task>, sqlx::Error> {
    sqlx::query_as!(
        Task,
        r#"
        SELECT
            id, project_id, name, description,
            due_date, completed_at, priority, status,
            estimated_minutes, actual_minutes,
            created_at, updated_at
        FROM tasks
        WHERE project_id = ?
        ORDER BY
            CASE status
                WHEN 'todo' THEN 1
                WHEN 'in_progress' THEN 2
                WHEN 'completed' THEN 3
                ELSE 4
            END,
            due_date ASC NULLS LAST
        "#,
        project_id
    )
    .fetch_all(pool)
    .await
}
```

### Component Composition Strategy

```typescript
// Composition over inheritance
// src/widgets/TaskCard/ui/TaskCard.tsx
import { Card } from "@/shared/ui/Card";
import { Checkbox } from "@/shared/ui/Checkbox";
import { TaskPriority } from "@/entities/task";
import { useTaskActions } from "@/features/tasks";

interface TaskCardProps {
  taskId: string;
  onEdit?: () => void;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  taskId,
  onEdit,
  className,
}) => {
  const task = useTasksStore((state) => state.tasks.get(taskId));
  const { toggleComplete, updatePriority } = useTaskActions();

  if (!task) return null;

  return (
    <Card className={cn("task-card", className)}>
      <Card.Header>
        <Checkbox
          checked={task.status === "completed"}
          onChange={() => toggleComplete(taskId)}
        />
        <Card.Title>{task.name}</Card.Title>
        <TaskPriority
          value={task.priority}
          onChange={(p) => updatePriority(taskId, p)}
        />
      </Card.Header>
      <Card.Content>
        {task.description && <p>{task.description}</p>}
      </Card.Content>
    </Card>
  );
};
```

---

## Coding Standards & Conventions

### TypeScript Standards

```typescript
// ✅ DO: Use strict type safety
interface CreateTaskDto {
  name: string;
  projectId: string;
  description?: string;
  dueDate?: Date;
  priority: TaskPriority;
}

// ❌ DON'T: Use 'any' or loose types
interface BadTask {
  data: any;
  priority: string; // Should be enum/union
}

// ✅ DO: Use discriminated unions for state
type TaskState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Task[] }
  | { status: "error"; error: string };

// ✅ DO: Use const assertions for configs
export const TASK_PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
```

### React Component Patterns

```typescript
// ✅ DO: Functional components with proper typing
export const TaskList: React.FC<TaskListProps> = ({ projectId }) => {
  const tasks = useTasksByProject(projectId);

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard key={task.id} taskId={task.id} />
      ))}
    </div>
  );
};

// ✅ DO: Custom hooks for logic reuse
export const useTaskFilters = () => {
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: null,
    search: "",
  });

  const filteredTasks = useMemo(() => {
    // Filter logic
  }, [filters]);

  return { filters, setFilters, filteredTasks };
};

// ❌ DON'T: Class components or inline styles
class OldTaskList extends React.Component {
  // Avoid
  render() {
    return <div style={{ padding: 20 }}>...</div>; // Use Tailwind
  }
}
```

### File Naming Conventions

```
✅ DO:
- Components: PascalCase (TaskCard.tsx)
- Hooks: camelCase starting with 'use' (useTaskActions.ts)
- Utils: camelCase (formatDate.ts)
- Types: PascalCase with .types.ts (Task.types.ts)
- Tests: Same name with .test.ts (TaskCard.test.tsx)

❌ DON'T:
- task-card.tsx (use PascalCase)
- UseTaskActions.ts (lowercase 'use')
- CONSTANTS.ts (use constants.ts)
```

### CSS/Tailwind Guidelines

```tsx
// ✅ DO: Use Tailwind utilities with cn() helper
import { cn } from '@/shared/lib/utils';

<div className={cn(
  'flex items-center gap-2',
  'hover:bg-gray-50 transition-colors',
  isActive && 'bg-blue-50 border-blue-500',
  className
)} />

// ✅ DO: Extract complex styles to CSS when needed
// styles.module.css
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(120px, 1fr);
}

// ❌ DON'T: Inline complex calculations
<div style={{
  width: `${100 / 7}%`,  // Use CSS Grid instead
  height: '120px'
}} />
```

### Error Handling Patterns

```typescript
// ✅ DO: Type-safe error handling
class TaskError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "PERMISSION_DENIED" | "VALIDATION_ERROR",
    public details?: unknown
  ) {
    super(message);
    this.name = "TaskError";
  }
}

// ✅ DO: Handle errors at appropriate levels
const createTask = async (dto: CreateTaskDto) => {
  try {
    const task = await invoke<Task>("create_task", { task: dto });
    return { success: true, data: task };
  } catch (error) {
    console.error("Failed to create task:", error);

    if (error instanceof TaskError) {
      toast.error(error.message);
      return { success: false, error: error.code };
    }

    toast.error("An unexpected error occurred");
    return { success: false, error: "UNKNOWN_ERROR" };
  }
};
```

---

## Key Libraries & Usage

### Tauri APIs Best Practices

```typescript
// src/shared/api/tauri.ts
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

// ✅ DO: Create typed wrappers
export const tauriApi = {
  tasks: {
    getAll: () => invoke<Task[]>("get_all_tasks"),
    getByProject: (projectId: string) =>
      invoke<Task[]>("get_tasks_by_project", { projectId }),
    create: (task: CreateTaskDto) => invoke<Task>("create_task", { task }),
    update: (id: string, updates: Partial<Task>) =>
      invoke<Task>("update_task", { id, updates }),
    delete: (id: string) => invoke<void>("delete_task", { id }),
  },
};

// ✅ DO: Handle events properly
export const subscribeToTaskUpdates = (callback: (task: Task) => void) => {
  const unlisten = listen<Task>("task-updated", (event) => {
    callback(event.payload);
  });

  return unlisten; // Return cleanup function
};
```

### React Patterns & Anti-Patterns

```typescript
// ✅ DO: Memoize expensive computations
const TaskStats = ({ tasks }: { tasks: Task[] }) => {
  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((t) => t.status === "completed").length,
      overdue: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < new Date() &&
          t.status !== "completed"
      ).length,
    }),
    [tasks]
  );

  return <StatsDisplay {...stats} />;
};

// ❌ DON'T: Cause unnecessary re-renders
const BadComponent = () => {
  // This creates new object every render
  const defaultFilters = { status: "all" }; // Move outside or useMemo

  // This creates new function every render
  return <Filter onChange={(f) => console.log(f)} />; // Use useCallback
};

// ✅ DO: Use proper effect dependencies
useEffect(() => {
  const unsubscribe = subscribeToTaskUpdates((task) => {
    updateTaskInStore(task);
  });

  return unsubscribe; // Cleanup
}, []); // Empty deps if subscription doesn't change
```

### SQLite Query Patterns

```sql
-- ✅ DO: Use indexes for common queries
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;

-- ✅ DO: Use window functions for efficient calculations
WITH task_progress AS (
  SELECT
    p.id as project_id,
    p.name as project_name,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    CAST(COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS FLOAT) /
      NULLIF(COUNT(t.id), 0) * 100 as progress_percentage
  FROM projects p
  LEFT JOIN tasks t ON p.id = t.project_id
  GROUP BY p.id
)
SELECT * FROM task_progress WHERE project_id = ?;

-- ❌ DON'T: N+1 queries
-- Bad: Getting project then tasks separately for each
-- Good: JOIN or batch fetch
```

### FullCalendar Customization

```typescript
// src/widgets/TaskCalendar/ui/TaskCalendar.tsx
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export const TaskCalendar = () => {
  const tasks = useTasksStore((state) => state.tasks);

  // ✅ DO: Transform data efficiently
  const events = useMemo(
    () =>
      Array.from(tasks.values())
        .filter((task) => task.dueDate)
        .map((task) => ({
          id: task.id,
          title: task.name,
          date: task.dueDate,
          backgroundColor: getPriorityColor(task.priority),
          extendedProps: { task },
        })),
    [tasks]
  );

  // ✅ DO: Handle drag properly
  const handleEventDrop = useCallback(
    async (info) => {
      const { task } = info.event.extendedProps;
      await updateTask(task.id, { dueDate: info.event.start });
    },
    [updateTask]
  );

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      events={events}
      editable={true}
      eventDrop={handleEventDrop}
      height="auto"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,dayGridWeek",
      }}
    />
  );
};
```

### @dnd-kit Implementation

```typescript
// src/features/tasks/ui/TaskKanban.tsx
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";

export const TaskKanban = () => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    // Optimistic update
    updateTaskOptimistic(taskId, { status: newStatus });

    try {
      await tauriApi.tasks.update(taskId, { status: newStatus });
    } catch (error) {
      // Revert on error
      revertOptimisticUpdate(taskId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      {/* Kanban columns */}
    </DndContext>
  );
};
```

---

## Development Workflow

### Git Workflow

```bash
# Branch naming
feature/add-recurring-tasks
fix/calendar-drag-issue
refactor/optimize-task-queries
docs/update-api-docs

# Commit message format
feat: add recurring task support with RRULE
fix: prevent calendar event overlap on drag
refactor: optimize task list queries with indexes
docs: update task API documentation
test: add unit tests for task recurrence
```

### Testing Approach

```typescript
// Unit Testing Example
// src/entities/task/lib/task.utils.test.ts
import { describe, it, expect } from "vitest";
import { calculateTaskProgress, isTaskOverdue } from "./task.utils";

describe("Task Utils", () => {
  describe("calculateTaskProgress", () => {
    it("should return 0 for tasks with no subtasks", () => {
      const task = { id: "1", subtasks: [] };
      expect(calculateTaskProgress(task)).toBe(0);
    });

    it("should calculate percentage of completed subtasks", () => {
      const task = {
        id: "1",
        subtasks: [
          { id: "2", status: "completed" },
          { id: "3", status: "todo" },
          { id: "4", status: "completed" },
        ],
      };
      expect(calculateTaskProgress(task)).toBe(66.67);
    });
  });
});

// Integration Testing
// src/features/tasks/api/tasks.integration.test.ts
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { setupTestDatabase, teardownTestDatabase } from "@/shared/test";

describe("Tasks API Integration", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("should create and retrieve tasks", async () => {
    const task = await tauriApi.tasks.create({
      name: "Test Task",
      projectId: "test-project-1",
      priority: "high",
    });

    expect(task.id).toBeDefined();

    const retrieved = await tauriApi.tasks.getByProject("test-project-1");
    expect(retrieved).toContainEqual(task);
  });
});
```

### Code Review Checklist

- [ ] **Type Safety**: No `any` types, proper null checks
- [ ] **Error Handling**: All async operations have try/catch
- [ ] **Performance**: No unnecessary re-renders, proper memoization
- [ ] **Accessibility**: ARIA labels, keyboard navigation works
- [ ] **Tests**: Unit tests for logic, integration tests for flows
- [ ] **Documentation**: JSDoc for public APIs, inline comments for complex logic
- [ ] **Security**: Input validation, no SQL injection risks
- [ ] **FSD Compliance**: No cross-slice imports, proper layer hierarchy

### Performance Monitoring

```typescript
// Use React DevTools Profiler in development
if (import.meta.env.DEV) {
  // Enable why-did-you-render
  import("./wdyr");
}

// Monitor Tauri command performance
const measureCommand = async <T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await invoke<T>(command, args);
    const duration = performance.now() - start;

    if (duration > 100) {
      console.warn(`Slow command: ${command} took ${duration}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`Command failed: ${command} after ${duration}ms`, error);
    throw error;
  }
};
```

### Debugging Strategies

```typescript
// Enable debug logging
const debug = import.meta.env.DEV ? console.log : () => {};

// Add debug info to Zustand stores
export const useTasksStore = create<TasksState>()(
  devtools(
    immer((set, get) => ({
      // ... store implementation
    })),
    {
      name: 'tasks-store',
      enabled: import.meta.env.DEV
    }
  )
);

// Tauri command logging
#[tauri::command]
pub async fn get_tasks(
    state: State<'_, AppState>
) -> Result<Vec<Task>, String> {
    log::debug!("Getting all tasks");

    let tasks = state
        .db
        .get_all_tasks()
        .await
        .map_err(|e| {
            log::error!("Failed to get tasks: {:?}", e);
            format!("Database error: {}", e)
        })?;

    log::debug!("Retrieved {} tasks", tasks.len());
    Ok(tasks)
}
```

---

## Feature Implementation Guide

### Adding New Entity Types

```typescript
// 1. Define the entity model
// src/entities/habit/model/types.ts
export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create the database schema
// migrations/003_create_habits.sql
CREATE TABLE habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  frequency TEXT CHECK(frequency IN ('daily', 'weekly', 'monthly')),
  target_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// 3. Implement Tauri commands
// src-tauri/src/commands/habits.rs
#[tauri::command]
pub async fn create_habit(
    state: State<'_, AppState>,
    habit: CreateHabitDto
) -> Result<Habit, String> {
    // Implementation
}

// 4. Create the feature slice
// src/features/habits/
// ├── api/
// ├── model/
// ├── ui/
// └── index.ts

// 5. Add to the UI
// src/widgets/HabitTracker/
```

### Adding New Views/Pages

```typescript
// 1. Create the page component
// src/pages/analytics/ui/AnalyticsPage.tsx
export const AnalyticsPage = () => {
  return (
    <PageLayout>
      <PageHeader title="Analytics" />
      <AnalyticsWidgets />
    </PageLayout>
  );
};

// 2. Add route configuration
// src/app/routes.tsx
export const routes = [
  // ... existing routes
  {
    path: "/analytics",
    element: <AnalyticsPage />,
    icon: <ChartIcon />,
    label: "Analytics",
  },
];

// 3. Update navigation
// src/widgets/Sidebar/ui/Sidebar.tsx
// Add new navigation item
```

### Implementing New UI Components

```typescript
// 1. Start with the primitive
// src/shared/ui/Progress/Progress.tsx
import * as ProgressPrimitive from "@radix-ui/react-progress";

export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export const Progress = ({
  value,
  max = 100,
  className,
  showLabel = false,
}: ProgressProps) => {
  const percentage = (value / max) * 100;

  return (
    <div className={cn("relative", className)}>
      <ProgressPrimitive.Root
        className="relative overflow-hidden bg-gray-200 rounded-full h-2"
        value={value}
        max={max}
      >
        <ProgressPrimitive.Indicator
          className="bg-blue-500 h-full transition-transform"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
      {showLabel && (
        <span className="absolute inset-0 flex items-center justify-center text-xs">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

// 2. Create composite component
// src/shared/ui/TaskProgress/TaskProgress.tsx
export const TaskProgress = ({ taskId }: { taskId: string }) => {
  const progress = useTaskProgress(taskId);

  return (
    <Progress
      value={progress.completed}
      max={progress.total}
      showLabel
      className="w-full"
    />
  );
};
```

### Adding Keyboard Shortcuts

```typescript
// src/shared/lib/keyboard.ts
import { useEffect } from "react";

export const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  deps: any[] = []
) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === key && event.metaKey) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [key, ...deps]);
};

// Usage in component
const TaskQuickAdd = () => {
  const [isOpen, setIsOpen] = useState(false);

  useKeyboardShortcut("k", () => setIsOpen(true), []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Quick add UI */}
    </Dialog>
  );
};
```

### Plugin System Considerations

```typescript
// Plugin manifest structure (future)
interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  permissions: PluginPermission[];
  exports: {
    widgets?: string[];
    commands?: string[];
    views?: string[];
  };
}

// Plugin API (future)
interface EvorBrainPluginAPI {
  // Data access
  data: {
    tasks: TaskAPI;
    projects: ProjectAPI;
    // ... other entities
  };

  // UI extension points
  ui: {
    registerWidget: (widget: WidgetDefinition) => void;
    registerCommand: (command: CommandDefinition) => void;
    registerView: (view: ViewDefinition) => void;
  };

  // Event system
  events: {
    on: (event: string, handler: EventHandler) => void;
    off: (event: string, handler: EventHandler) => void;
    emit: (event: string, data: any) => void;
  };
}
```

---

## Common Pitfalls & Solutions

### Performance Gotchas

```typescript
// ❌ PITFALL: Re-rendering entire list on single item update
const TaskList = () => {
  const tasks = useTasksStore((state) => state.tasks); // Whole map
  return tasks.map((task) => <TaskItem key={task.id} task={task} />);
};

// ✅ SOLUTION: Subscribe to specific data
const TaskItem = ({ taskId }: { taskId: string }) => {
  const task = useTasksStore((state) => state.tasks.get(taskId));
  return <div>{task?.name}</div>;
};

// ❌ PITFALL: Expensive calculations in render
const Dashboard = () => {
  // This runs every render!
  const stats = calculateComplexStats(tasks);
  return <StatsDisplay stats={stats} />;
};

// ✅ SOLUTION: Memoize expensive operations
const Dashboard = () => {
  const stats = useMemo(() => calculateComplexStats(tasks), [tasks]);
  return <StatsDisplay stats={stats} />;
};
```

### State Management Mistakes

```typescript
// ❌ PITFALL: Direct state mutation
const updateTask = (id: string, updates: Partial<Task>) => {
  const task = state.tasks.get(id);
  task.name = updates.name; // Mutation!
  setState({ tasks: state.tasks });
};

// ✅ SOLUTION: Use immer or create new objects
const updateTask = (id: string, updates: Partial<Task>) => {
  set((state) => {
    const task = state.tasks.get(id);
    if (task) {
      state.tasks.set(id, { ...task, ...updates });
    }
  });
};

// ❌ PITFALL: Async actions without error handling
const loadTasks = async () => {
  const tasks = await invoke("get_tasks");
  setState({ tasks });
};

// ✅ SOLUTION: Proper error handling and loading states
const loadTasks = async () => {
  set({ isLoading: true, error: null });
  try {
    const tasks = await invoke("get_tasks");
    set({ tasks, isLoading: false });
  } catch (error) {
    set({ error: error.message, isLoading: false });
  }
};
```

### Database Query Optimization

```sql
-- ❌ PITFALL: N+1 queries
-- Getting projects then tasks for each separately
SELECT * FROM projects WHERE goal_id = ?;
-- Then for each project:
SELECT * FROM tasks WHERE project_id = ?;

-- ✅ SOLUTION: Single query with JOIN
SELECT
  p.*,
  json_group_array(
    json_object(
      'id', t.id,
      'name', t.name,
      'status', t.status
    )
  ) as tasks
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
WHERE p.goal_id = ?
GROUP BY p.id;

-- ❌ PITFALL: Missing indexes for common queries
SELECT * FROM tasks WHERE due_date < ? AND status != 'completed';

-- ✅ SOLUTION: Add appropriate indexes
CREATE INDEX idx_tasks_due_status ON tasks(due_date, status);
```

### Memory Management in Tauri

```rust
// ❌ PITFALL: Loading entire dataset into memory
#[tauri::command]
pub async fn get_all_tasks(state: State<'_, AppState>) -> Result<Vec<Task>, String> {
    let tasks = sqlx::query_as!(Task, "SELECT * FROM tasks")
        .fetch_all(&state.db)
        .await?;
    Ok(tasks) // Could be 100k+ tasks!
}

// ✅ SOLUTION: Implement pagination
#[tauri::command]
pub async fn get_tasks_paginated(
    state: State<'_, AppState>,
    page: i32,
    limit: i32
) -> Result<TaskPage, String> {
    let offset = (page - 1) * limit;

    let tasks = sqlx::query_as!(
        Task,
        "SELECT * FROM tasks LIMIT ? OFFSET ?",
        limit,
        offset
    )
    .fetch_all(&state.db)
    .await?;

    let total = sqlx::query_scalar!("SELECT COUNT(*) FROM tasks")
        .fetch_one(&state.db)
        .await?;

    Ok(TaskPage {
        tasks,
        page,
        total_pages: (total as f64 / limit as f64).ceil() as i32,
    })
}
```

---

## Future Feature Considerations

### Plugin Architecture Preparation

```typescript
// Prepare extension points in current architecture
// src/app/plugins/types.ts
export interface PluginExtensionPoints {
  // Widget slots where plugins can inject UI
  widgetSlots: {
    dashboard: React.ComponentType[];
    taskDetail: React.ComponentType<{ taskId: string }>[];
    sidebar: React.ComponentType[];
  };

  // Command palette extensions
  commands: Command[];

  // Data transformers
  dataTransformers: {
    beforeTaskSave?: (task: Task) => Task;
    afterTaskLoad?: (task: Task) => Task;
  };
}

// Design plugin-friendly APIs
export const PluginAPI = {
  registerWidget(slot: keyof WidgetSlots, component: React.ComponentType) {
    // Implementation
  },

  registerCommand(command: Command) {
    // Implementation
  },

  registerHook(hook: string, handler: Function) {
    // Implementation
  },
};
```

### Mobile Companion App Considerations

```typescript
// Design sync-friendly data structures
interface SyncableEntity {
  id: string;
  localId?: string; // For offline creation
  syncVersion: number;
  lastSyncedAt?: Date;
  lastModifiedAt: Date;
  deletedAt?: Date; // Soft delete for sync
}

// Prepare for REST API
interface TaskDTO {
  id: string;
  projectId: string;
  name: string;
  // ... other fields
  _links: {
    self: string;
    project: string;
    subtasks: string;
  };
}
```

### Cloud Sync Preparation

```typescript
// Conflict resolution strategies
enum ConflictResolution {
  LOCAL_WINS = "local_wins",
  REMOTE_WINS = "remote_wins",
  MERGE = "merge",
  ASK_USER = "ask_user",
}

interface SyncConflict<T> {
  entityType: string;
  entityId: string;
  localVersion: T;
  remoteVersion: T;
  resolution?: ConflictResolution;
}

// Sync metadata tracking
interface SyncMetadata {
  lastSyncTime: Date;
  syncDirection: "push" | "pull" | "both";
  conflictStrategy: ConflictResolution;
  entityVersions: Map<string, number>;
}
```

### Data Migration Strategies

```typescript
// Version-based migrations
interface Migration {
  version: number;
  description: string;
  up: (db: Database) => Promise<void>;
  down: (db: Database) => Promise<void>;
}

const migrations: Migration[] = [
  {
    version: 1,
    description: "Add habit tracking tables",
    up: async (db) => {
      await db.execute(`
        CREATE TABLE habits (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          frequency TEXT NOT NULL
        )
      `);
    },
    down: async (db) => {
      await db.execute("DROP TABLE habits");
    },
  },
];

// Data transformation utilities
export const migrateTaskData = (oldTask: V1Task): V2Task => {
  return {
    ...oldTask,
    // New fields with defaults
    estimatedMinutes: 0,
    actualMinutes: 0,
    // Transformed fields
    priority: mapOldPriorityToNew(oldTask.priority),
  };
};
```

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run tauri dev    # Start Tauri in dev mode

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run test:watch   # Watch mode

# Building
npm run build        # Build frontend
npm run tauri build  # Build desktop app

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run typecheck    # TypeScript check
```

### File Structure Quick Guide

```
When creating a new feature:
1. Entity first (if new data type)
2. Feature slice (business logic)
3. Widget (if complex UI needed)
4. Page (if new route needed)

Example for "Notes" feature:
src/
├── entities/note/          # Note data model
├── features/notes/         # CRUD operations
├── widgets/NoteEditor/     # Rich editor widget
└── pages/notes/           # Notes page
```

### Debug Helpers

```typescript
// Quick debug logging
const debug = {
  task: (msg: string, data?: any) => console.log(`[TASK] ${msg}`, data),
  db: (msg: string, data?: any) => console.log(`[DB] ${msg}`, data),
  perf: (msg: string, duration: number) =>
    console.log(`[PERF] ${msg}: ${duration}ms`),
};

// Performance timing
const timed = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    debug.perf(name, performance.now() - start);
    return result;
  } catch (error) {
    debug.perf(`${name} (failed)`, performance.now() - start);
    throw error;
  }
};
```

---

**Remember**: This guide is a living document. Update it as the project evolves, patterns emerge, and lessons are learned. The goal is to enable any AI assistant to quickly understand and effectively contribute to the EvorBrain project.
