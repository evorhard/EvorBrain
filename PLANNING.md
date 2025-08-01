# 🧠 EvorBrain Planning Document

## Table of Contents

- [Project Vision](#project-vision)
- [Target Users](#target-users)
- [Core Requirements](#core-requirements)
- [Tech Stack Selection](#tech-stack-selection)
- [Architecture Overview](#architecture-overview)
- [Data Models](#data-models)
- [Development Phases](#development-phases)
- [Extensibility Strategy](#extensibility-strategy)
- [Security Considerations](#security-considerations)
- [Performance Targets](#performance-targets)
- [Coding Standards](#coding-standards)

---

## Project Vision

EvorBrain is a local-first, hierarchical task management system that combines the organizational
power of Notion with the data ownership philosophy of Obsidian. The goal is to create a blazing-fast
desktop application that helps users organize their entire life through a structured hierarchy while
maintaining complete control over their data.

### Core Philosophy

- **Local-First**: All data lives on the user's machine with optional sync
- **Hierarchical Organization**: Clear structure from life areas down to subtasks
- **Speed**: Native performance with instant interactions
- **Extensibility**: Built for personal customization without plugin complexity
- **Privacy**: Your data never leaves your control unless you choose to sync

## Target Users

### Primary User

I am building this application primarily for my own use as a developer who needs:

- Complete control over my task management system
- The ability to extend functionality as needed
- Local storage with Git-based backup
- A fast, responsive interface that doesn't rely on internet connectivity

### Secondary Users

Power users who:

- Value data ownership and privacy
- Want Notion-like organization with Obsidian-like control
- Need offline-first functionality
- Appreciate open-source software they can modify

## Core Requirements

### MVP Features

1. **Hierarchical Structure**
   - Life Areas (e.g., Career, Health, Personal)
   - Goals linked to life areas
   - Projects linked to goals
   - Tasks linked to projects
   - Subtasks for granular breakdown
   - Standalone tasks/chores not linked to projects

2. **Views & Navigation**
   - Dashboard/Homepage with at-a-glance overview
   - Calendar view (day/week/month)
   - List views with filtering and sorting
   - Quick search across all content

3. **Task Management**
   - Priority levels (Critical/High/Medium/Low)
   - Due dates (optional)
   - Status tracking
   - Notes/descriptions with markdown support

4. **Data Storage**
   - Local SQLite database
   - Markdown files for content
   - Automatic Git commits for backup
   - Human-readable file structure

### Post-MVP Features

1. **AI Integration**
   - Claude-powered priority suggestions
   - Smart task scheduling
   - Natural language task creation

2. **Tracking Systems**
   - Habit tracker with streaks
   - Health metrics (weight, sleep, etc.)
   - Progress visualization and analytics

3. **Cross-Platform**
   - macOS support
   - Linux support
   - Mobile companion app
   - Web access (read-only)

## Tech Stack Selection

Based on research of local-first applications and modern desktop development in 2025, I've selected
the following technologies:

### Core Stack

| Component              | Technology                                                 | Justification                                                                                                              |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Desktop Framework**  | [Tauri 2.0](https://tauri.app)                             | - 50MB apps vs Electron's 150MB+<br>- Rust backend for performance<br>- Better security model<br>- Native OS integration   |
| **Frontend Framework** | [SolidJS](https://solidjs.com)                             | - No virtual DOM (blazing fast)<br>- Fine-grained reactivity<br>- 7KB runtime<br>- Similar to React but better performance |
| **UI Library**         | [Kobalte](https://kobalte.dev)                             | - Accessible by default<br>- Unstyled components<br>- SolidJS native<br>- Flexible styling                                 |
| **Styling**            | [Tailwind CSS](https://tailwindcss.com)                    | - Rapid development<br>- Consistent design system<br>- Small production builds<br>- Great DX                               |
| **Database**           | [SQLite](https://sqlite.org)                               | - Zero configuration<br>- Embedded database<br>- Fast performance<br>- Reliable                                            |
| **State Management**   | [Solid Stores](https://www.solidjs.com/docs/latest#stores) | - Built into SolidJS<br>- Reactive by design<br>- Simple API                                                               |
| **Data Sync**          | Custom Git Integration                                     | - Version control built-in<br>- Works with any Git provider<br>- Conflict resolution<br>- History tracking                 |
| **Build Tool**         | [Bun](https://bun.sh)                                      | - Fast package management<br>- Built-in bundler<br>- TypeScript support<br>- Better DX than npm                            |

### Additional Libraries

- **Markdown**: [markdown-it](https://github.com/markdown-it/markdown-it) with plugins
- **Icons**: [Lucide](https://lucide.dev) (successor to Feather icons)
- **Date Handling**: [date-fns](https://date-fns.org)
- **Charts**: [Chart.js](https://www.chartjs.org) or [D3.js](https://d3js.org) for analytics
- **Testing**: [Vitest](https://vitest.dev) for unit tests, [Playwright](https://playwright.dev) for
  E2E

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                       │
│                      (SolidJS + Kobalte)                    │
├─────────────────────────────────────────────────────────────┤
│                      Frontend Logic                         │
│              (Stores, Routing, State Management)            │
├─────────────────────────────────────────────────────────────┤
│                       Tauri IPC Bridge                      │
│                    (Command Invocation)                     │
├─────────────────────────────────────────────────────────────┤
│                      Rust Backend                           │
│        (Business Logic, Data Access, Git Operations)        │
├─────────────────────────────────────────────────────────────┤
│                     Data Storage Layer                      │
│                 SQLite │ File System │ Git                  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action** → UI Component → Store Action → Tauri Command
2. **Tauri Command** → Rust Handler → Database/File Operation
3. **Response** → Store Update → UI Re-render

### File Structure Strategy

```
~/EvorBrain/
├── .evorbrain/
│   ├── config.json         # User preferences
│   ├── evorbrain.db       # SQLite database
│   └── cache/             # Temporary files
├── areas/
│   ├── career/
│   │   ├── _meta.json     # Area metadata
│   │   └── notes.md       # Area notes
│   └── health/
│       ├── _meta.json
│       └── notes.md
├── projects/
│   ├── evorbrain-dev/
│   │   ├── _meta.json     # Project metadata
│   │   ├── tasks.json     # Task list
│   │   └── notes.md       # Project notes
│   └── fitness-routine/
│       ├── _meta.json
│       ├── tasks.json
│       └── notes.md
└── archive/               # Completed items
```

## Data Models

### Database Schema

```sql
-- Life Areas
CREATE TABLE areas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    icon TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN DEFAULT FALSE
);

-- Goals
CREATE TABLE goals (
    id TEXT PRIMARY KEY,
    area_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (area_id) REFERENCES areas(id)
);

-- Projects
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    goal_id TEXT,
    area_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (goal_id) REFERENCES goals(id),
    FOREIGN KEY (area_id) REFERENCES areas(id)
);

-- Tasks
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    project_id TEXT,
    parent_task_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id)
);

-- Notes (Markdown content)
CREATE TABLE notes (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL, -- 'area', 'goal', 'project', 'task'
    entity_id TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags (for future extensibility)
CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT
);

-- Entity Tags (many-to-many)
CREATE TABLE entity_tags (
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (entity_type, entity_id, tag_id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);
```

### TypeScript Interfaces

```typescript
interface LifeArea {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

interface Goal {
  id: string;
  areaId?: string;
  name: string;
  description?: string;
  targetDate?: Date;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

interface Project {
  id: string;
  goalId?: string;
  areaId?: string;
  name: string;
  description?: string;
  priority: Priority;
  status: 'planning' | 'active' | 'completed' | 'paused';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

interface Task {
  id: string;
  projectId?: string;
  parentTaskId?: string;
  name: string;
  description?: string;
  priority: Priority;
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}

type Priority = 0 | 1 | 2 | 3; // 0: Low, 1: Medium, 2: High, 3: Critical
```

## Development Phases

### Phase 1: Foundation (Difficulty: Medium)

- [ ] Project setup with Tauri + SolidJS
- [ ] Basic UI component library
- [ ] SQLite database integration
- [ ] Core data models implementation
- [ ] Basic CRUD operations

### Phase 2: Core Features (Difficulty: High)

- [ ] Hierarchical navigation
- [ ] Dashboard/Homepage
- [ ] Task management UI
- [ ] Calendar view
- [ ] Search functionality
- [ ] Markdown editor integration

### Phase 3: Data Persistence (Difficulty: Medium)

- [ ] File system structure
- [ ] Git integration
- [ ] Automatic backup system
- [ ] Import/Export functionality
- [ ] Settings management

### Phase 4: Polish & Performance (Difficulty: Medium)

- [ ] Keyboard shortcuts
- [ ] UI animations
- [ ] Performance optimization
- [ ] Error handling
- [ ] User onboarding

### Phase 5: Advanced Features (Difficulty: High)

- [ ] AI integration with Claude
- [ ] Habit tracker
- [ ] Analytics dashboard
- [ ] Template system
- [ ] Advanced filtering

### Phase 6: Platform Expansion (Difficulty: Very High)

- [ ] macOS support
- [ ] Linux support
- [ ] Mobile companion app
- [ ] Sync server (optional)
- [ ] Web viewer

## Extensibility Strategy

### Personal Extensibility Approach

Since this is a personal project without a plugin system, extensibility is achieved through:

1. **Modular Architecture**
   - Clear separation of concerns
   - Well-defined interfaces
   - Easy to add new modules

2. **Configuration Options**
   - Extensive settings
   - Custom themes
   - Workflow customization

3. **Open Source**
   - MIT license
   - Well-documented code
   - Fork-friendly structure

### Extension Points

1. **Custom Views**: Add new ways to visualize data
2. **Integrations**: Connect with external services
3. **Automation**: Add rules and triggers
4. **Data Sources**: Import from other tools
5. **Export Formats**: Support more output types

## Security Considerations

### Local Security

1. **Data Encryption**
   - Optional database encryption
   - Secure credential storage
   - Protected configuration files

2. **Access Control**
   - OS-level file permissions
   - Application-level authentication (optional)

3. **Safe File Operations**
   - Sandboxed file access
   - Validation of all inputs
   - Safe path handling

### Sync Security

1. **Git Operations**
   - SSH key authentication
   - HTTPS with tokens
   - No sensitive data in commits

2. **Data Privacy**
   - All processing local
   - No telemetry
   - No external API calls without consent

## Performance Targets

### Metrics

| Metric         | Target      | Measurement            |
| -------------- | ----------- | ---------------------- |
| Startup Time   | < 2 seconds | Time to interactive UI |
| Task Creation  | < 100ms     | Click to saved         |
| Search Results | < 50ms      | Keystroke to results   |
| Memory Usage   | < 200MB     | Typical session        |
| Database Size  | < 100MB     | 10,000 tasks           |
| Bundle Size    | < 10MB      | Installer size         |

### Optimization Strategies

1. **Frontend**
   - Lazy loading of views
   - Virtual scrolling for lists
   - Debounced search
   - Optimistic updates

2. **Backend**
   - Indexed database queries
   - Cached frequent operations
   - Batch updates
   - Background sync

## Coding Standards

### General Principles

1. **Clarity over Cleverness**: Write code that's easy to understand
2. **Consistency**: Follow established patterns throughout
3. **Documentation**: Comment the why, not the what
4. **Testing**: Aim for 80% coverage on critical paths

### TypeScript/JavaScript

```typescript
// Use functional components with TypeScript
interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
}

// Prefer function declarations for components
function TaskItem(props: TaskItemProps) {
  // Use destructuring
  const { task, onComplete } = props;

  // Early returns for clarity
  if (task.archived) return null;

  // Clear event handlers
  const handleComplete = () => {
    onComplete(task.id);
  };

  return <div class="task-item">{/* Component implementation */}</div>;
}
```

### Rust

```rust
// Use descriptive names and proper error handling
#[tauri::command]
async fn create_task(
    task_data: CreateTaskRequest,
    db: State<'_, Database>,
) -> Result<Task, AppError> {
    // Validate input
    task_data.validate()?;

    // Perform operation with proper error handling
    let task = db
        .create_task(task_data)
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

    Ok(task)
}
```

### File Organization

```
src/
├── components/       # UI components
│   ├── common/      # Shared components
│   ├── tasks/       # Task-related components
│   └── layout/      # Layout components
├── stores/          # State management
├── utils/           # Helper functions
├── types/           # TypeScript types
└── api/             # Tauri command wrappers
```

---

_This planning document is a living document and will be updated as the project evolves._

_Last updated: 2025-07-29_
