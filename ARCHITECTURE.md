# 🏗️ EvorBrain Technical Architecture

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack Details](#technology-stack-details)
- [Application Architecture](#application-architecture)
- [Data Architecture](#data-architecture)
- [Security Architecture](#security-architecture)
- [Performance Architecture](#performance-architecture)
- [Extensibility Architecture](#extensibility-architecture)
- [Deployment Architecture](#deployment-architecture)

---

## System Overview

EvorBrain is built as a local-first desktop application using a modern web-based UI with a native Rust backend. The architecture prioritizes performance, data ownership, and extensibility.

### Core Architectural Principles

1. **Local-First**: All data processing happens on the user's machine
2. **Event-Driven**: UI updates reactively based on state changes
3. **Separation of Concerns**: Clear boundaries between UI, business logic, and data
4. **Type Safety**: End-to-end type safety from database to UI
5. **Performance**: Sub-100ms response times for all user interactions

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Presentation Layer                         │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐   │
│  │   SolidJS   │  │   Kobalte    │  │  Tailwind    │  │  Icons  │   │
│  │ Components  │  │ UI Library   │  │    CSS       │  │ Lucide  │   │
│  └─────────────┘  └──────────────┘  └──────────────┘  └─────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                         Application Layer                           │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐   │
│  │   Stores    │  │   Routing    │  │   Commands   │  │  Utils  │   │
│  │(Solid Store)│  │(@solidjs/    │  │   (Tauri)    │  │         │   │
│  └─────────────┘  │   router)    │  └──────────────┘  └─────────┘   │
│                   └──────────────┘                                  │
├─────────────────────────────────────────────────────────────────────┤
│                            IPC Bridge                               │
│                         (Tauri Commands)                            │
├─────────────────────────────────────────────────────────────────────┤
│                          Backend Layer                              │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐   │
│  │  Business   │  │     Data     │  │     Git      │  │  File   │   │
│  │   Logic     │  │    Access    │  │ Integration  │  │ System  │   │
│  └─────────────┘  └──────────────┘  └──────────────┘  └─────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                          Storage Layer                              │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │   SQLite    │  │  File System │  │     Git      │                │
│  │  Database   │  │   (MD/JSON)  │  │ Repository   │                │
│  └─────────────┘  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

### Frontend Technologies

#### SolidJS (UI Framework)

- **Version**: 1.8+
- **Why**: Fine-grained reactivity without virtual DOM
- **Key Features Used**:
  - Reactive primitives (signals, memos, effects)
  - Component composition
  - Suspense for async operations
  - Error boundaries

#### Kobalte (Component Library)

- **Version**: Latest
- **Why**: Accessible, unstyled components for SolidJS
- **Components Used**:
  - Dialog/Modal
  - Dropdown Menu
  - Toast notifications
  - Form controls
  - Tooltips

#### Tailwind CSS (Styling)

- **Version**: 3.x
- **Configuration**:
  ```javascript
  // tailwind.config.js
  module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        colors: {
          // Custom color palette
          primary: {...},
          secondary: {...},
          accent: {...}
        }
      }
    },
    plugins: [
      require('@tailwindcss/typography'),
      require('@tailwindcss/forms')
    ]
  }
  ```

### Backend Technologies

#### Tauri (Desktop Framework)

- **Version**: 2.0
- **Configuration**:
  ```json
  {
    "productName": "EvorBrain",
    "version": "0.1.0",
    "identifier": "com.evorhard.evorbrain",
    "build": {
      "beforeBuildCommand": "bun run build",
      "beforeDevCommand": "bun run dev",
      "devUrl": "http://localhost:5173",
      "frontendDist": "../dist"
    },
    "app": {
      "windows": [
        {
          "title": "EvorBrain",
          "width": 1200,
          "height": 800,
          "minWidth": 800,
          "minHeight": 600
        }
      ],
      "security": {
        "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'"
      }
    }
  }
  ```

#### Rust (System Programming)

- **Version**: 1.75+
- **Key Crates**:
  - `tauri`: Desktop app framework
  - `tokio`: Async runtime
  - `sqlx`: SQL toolkit with compile-time checked queries
  - `serde`: Serialization/deserialization
  - `chrono`: Date/time handling
  - `git2`: Git operations
  - `thiserror`: Error handling

### Data Technologies

#### SQLite (Embedded Database)

- **Version**: 3.44+
- **Configuration**:
  - WAL mode for better concurrency
  - Foreign key constraints enabled
  - Full-text search (FTS5) for search functionality
  - JSON1 extension for flexible data storage

#### Storage Strategy

```
~/EvorBrain/
├── .evorbrain/
│   ├── config.json          # Application settings
│   ├── evorbrain.db        # Main SQLite database
│   ├── evorbrain.db-wal    # Write-ahead log
│   └── evorbrain.db-shm    # Shared memory file
├── content/
│   ├── areas/              # Life area content
│   ├── projects/           # Project content
│   └── archive/            # Archived content
└── .git/                   # Git repository
```

## Application Architecture

### Frontend Architecture

#### Component Structure

```typescript
// Component hierarchy
App
├── Layout
│   ├── Sidebar
│   │   ├── Navigation
│   │   └── QuickActions
│   └── MainContent
│       ├── Router
│       └── Views
│           ├── Dashboard
│           ├── AreaView
│           ├── ProjectView
│           ├── TaskView
│           └── CalendarView
└── Providers
    ├── ThemeProvider
    ├── AuthProvider
    └── DataProvider
```

#### State Management

```typescript
// Store architecture using Solid's reactive system
interface AppStore {
  // User data
  areas: () => LifeArea[];
  goals: () => Goal[];
  projects: () => Project[];
  tasks: () => Task[];

  // UI state
  selectedArea: () => string | null;
  selectedProject: () => string | null;
  viewMode: () => ViewMode;

  // Actions
  createArea: (area: CreateAreaInput) => Promise<void>;
  updateArea: (id: string, updates: Partial<LifeArea>) => Promise<void>;
  deleteArea: (id: string) => Promise<void>;
  // ... more actions
}

// Implementation using createStore
const [store, setStore] = createStore<AppStore>({
  areas: [],
  goals: [],
  projects: [],
  tasks: [],
  // ...
});
```

#### Routing Strategy

```typescript
// Route configuration
const routes = [
  { path: "/", component: Dashboard },
  { path: "/areas/:id", component: AreaView },
  { path: "/projects/:id", component: ProjectView },
  { path: "/tasks/:id", component: TaskView },
  { path: "/calendar", component: CalendarView },
  { path: "/search", component: SearchView },
  { path: "/settings", component: SettingsView },
];
```

### Backend Architecture

#### Command Structure

```rust
// Tauri command pattern
#[tauri::command]
async fn get_areas(
    db: State<'_, DbPool>,
    auth: State<'_, AuthState>,
) -> Result<Vec<Area>, AppError> {
    // Verify permissions
    auth.verify_access()?;

    // Query database
    let areas = sqlx::query_as!(
        Area,
        "SELECT * FROM areas WHERE archived = false ORDER BY priority DESC, name ASC"
    )
    .fetch_all(&**db)
    .await?;

    Ok(areas)
}
```

#### Service Layer

```rust
// Business logic organization
pub struct AreaService {
    db: Arc<DbPool>,
}

impl AreaService {
    pub async fn create(&self, input: CreateAreaInput) -> Result<Area> {
        // Validation
        input.validate()?;

        // Business logic
        let area = Area {
            id: Uuid::new_v4().to_string(),
            name: input.name,
            description: input.description,
            color: input.color.unwrap_or_else(|| generate_color()),
            icon: input.icon.unwrap_or_else(|| "folder".to_string()),
            priority: input.priority.unwrap_or(0),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            archived: false,
        };

        // Persist
        self.save(area).await?;

        // Trigger events
        EventBus::emit(Event::AreaCreated(area.clone()));

        Ok(area)
    }
}
```

### Communication Architecture

#### IPC Communication

```typescript
// Frontend command invocation
import { invoke } from "@tauri-apps/api/core";

export const api = {
  areas: {
    list: () => invoke<LifeArea[]>("get_areas"),
    create: (input: CreateAreaInput) =>
      invoke<LifeArea>("create_area", { input }),
    update: (id: string, updates: Partial<LifeArea>) =>
      invoke<LifeArea>("update_area", { id, updates }),
    delete: (id: string) => invoke<void>("delete_area", { id }),
  },
  // ... more API methods
};
```

#### Event System

```rust
// Event-driven updates
#[derive(Clone, Serialize)]
#[serde(tag = "type", content = "payload")]
pub enum AppEvent {
    AreaCreated(Area),
    AreaUpdated { id: String, area: Area },
    AreaDeleted { id: String },
    TaskCompleted { id: String, task: Task },
    SyncStarted,
    SyncCompleted { changes: usize },
    SyncFailed { error: String },
}

// Emit events to frontend
app.emit("app-event", AppEvent::AreaCreated(area))?;
```

## Data Architecture

### Database Schema Design

#### Core Tables

```sql
-- Optimized schema with indexes
CREATE TABLE areas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_areas_archived_priority ON areas(archived, priority DESC);
CREATE INDEX idx_areas_name ON areas(name);

-- Similar patterns for goals, projects, tasks tables
```

#### Full-Text Search

```sql
-- FTS5 virtual table for search
CREATE VIRTUAL TABLE search_index USING fts5(
    entity_type,
    entity_id,
    title,
    content,
    tags,
    tokenize = 'porter unicode61'
);

-- Triggers to maintain search index
CREATE TRIGGER area_search_insert AFTER INSERT ON areas
BEGIN
    INSERT INTO search_index (entity_type, entity_id, title, content)
    VALUES ('area', NEW.id, NEW.name, NEW.description);
END;
```

### Data Flow Architecture

```
User Action → UI Component → Store Action → Tauri Command →
Rust Handler → Service Layer → Database → Response →
Store Update → UI Re-render
```

### Caching Strategy

#### Frontend Caching

```typescript
// Query caching with TanStack Query
const areaQuery = createQuery(() => ({
  queryKey: ["areas"],
  queryFn: api.areas.list,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
}));
```

#### Backend Caching

```rust
// In-memory cache for frequently accessed data
pub struct Cache {
    areas: Arc<RwLock<HashMap<String, (Area, Instant)>>>,
    ttl: Duration,
}

impl Cache {
    pub async fn get_area(&self, id: &str) -> Option<Area> {
        let cache = self.areas.read().await;
        if let Some((area, timestamp)) = cache.get(id) {
            if timestamp.elapsed() < self.ttl {
                return Some(area.clone());
            }
        }
        None
    }
}
```

## Security Architecture

### Application Security

#### Data Protection

1. **Database Encryption** (Optional)

   ```rust
   // SQLCipher integration
   let db_url = format!("sqlite://{}?cipher=sqlcipher&key={}",
                       db_path.display(),
                       encrypted_key);
   ```

2. **Secure Storage**
   - Credentials stored in OS keychain
   - Sensitive data encrypted at rest
   - Memory wiped after use

#### Input Validation

```rust
// Comprehensive input validation
#[derive(Deserialize, Validate)]
pub struct CreateTaskInput {
    #[validate(length(min = 1, max = 200))]
    pub name: String,

    #[validate(length(max = 5000))]
    pub description: Option<String>,

    #[validate(range(min = 0, max = 3))]
    pub priority: Option<i32>,

    #[validate(custom = "validate_future_date")]
    pub due_date: Option<DateTime<Utc>>,
}
```

### Git Security

#### Safe Git Operations

```rust
// Secure Git integration
pub struct GitManager {
    repo: Repository,
    credentials: GitCredentials,
}

impl GitManager {
    pub async fn auto_commit(&self) -> Result<()> {
        // Only commit non-sensitive files
        let patterns = [
            "*.db",
            "*.db-wal",
            "*.db-shm",
            "config.json",
            ".env*",
        ];

        // Add .gitignore if not exists
        self.ensure_gitignore(&patterns)?;

        // Stage only content files
        self.stage_content_files()?;

        // Commit with generated message
        let message = self.generate_commit_message()?;
        self.commit(&message)?;

        Ok(())
    }
}
```

## Performance Architecture

### Frontend Performance

#### Optimization Strategies

1. **Component Lazy Loading**

   ```typescript
   const CalendarView = lazy(() => import("./views/CalendarView"));
   ```

2. **Virtual Scrolling**

   ```typescript
   // For large lists
   <VirtualList
     items={tasks()}
     itemHeight={60}
     overscan={5}
     renderItem={(task) => <TaskItem task={task} />}
   />
   ```

3. **Memoization**
   ```typescript
   const sortedTasks = createMemo(() =>
     tasks()
       .filter((t) => !t.archived)
       .sort((a, b) => b.priority - a.priority)
   );
   ```

### Backend Performance

#### Database Optimization

```sql
-- Composite indexes for common queries
CREATE INDEX idx_tasks_project_status
  ON tasks(project_id, completed, archived);

CREATE INDEX idx_tasks_due_date
  ON tasks(due_date)
  WHERE due_date IS NOT NULL AND completed = FALSE;
```

#### Query Optimization

```rust
// Batch operations
pub async fn get_dashboard_data(&self) -> Result<DashboardData> {
    // Single query with multiple CTEs
    let result = sqlx::query!(
        r#"
        WITH today_tasks AS (
            SELECT * FROM tasks
            WHERE due_date = date('now')
              AND completed = false
              AND archived = false
        ),
        active_projects AS (
            SELECT p.*, COUNT(t.id) as task_count
            FROM projects p
            LEFT JOIN tasks t ON t.project_id = p.id
            WHERE p.status = 'active'
            GROUP BY p.id
        )
        SELECT
            (SELECT json_group_array(json_object(...)) FROM today_tasks) as today_tasks,
            (SELECT json_group_array(json_object(...)) FROM active_projects) as active_projects
        "#
    )
    .fetch_one(&self.db)
    .await?;

    Ok(parse_dashboard_result(result))
}
```

### Resource Management

#### Memory Management

```rust
// Streaming large exports
pub async fn export_data(&self, writer: impl AsyncWrite) -> Result<()> {
    let mut stream = sqlx::query!("SELECT * FROM tasks")
        .fetch(&self.db);

    let mut csv_writer = csv_async::AsyncWriter::from_writer(writer);

    while let Some(record) = stream.try_next().await? {
        csv_writer.write_record(&record.into_csv_record()?).await?;
    }

    csv_writer.flush().await?;
    Ok(())
}
```

## Extensibility Architecture

### Module System

#### Plugin-like Structure (Without Actual Plugins)

```typescript
// Modular feature registration
interface Feature {
  id: string;
  name: string;
  routes?: RouteDefinition[];
  sidebarItems?: SidebarItem[];
  commands?: CommandDefinition[];
  stores?: StoreModule[];
}

// Feature registration
const features: Feature[] = [
  habitTrackerFeature,
  healthTrackerFeature,
  analyticsFeature,
  // Easy to add new features
];
```

### Data Extension Points

#### Custom Fields (Future)

```sql
-- Flexible data storage
CREATE TABLE custom_fields (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL, -- 'text', 'number', 'date', 'json'
    field_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Integration Points

#### External Service Integration

```rust
// Extensible service registry
pub trait ExternalService: Send + Sync {
    fn name(&self) -> &str;
    async fn sync(&self, data: &SyncData) -> Result<()>;
}

pub struct ServiceRegistry {
    services: Vec<Box<dyn ExternalService>>,
}

// Easy to add new services
registry.register(Box::new(GitHubIntegration::new(config)));
registry.register(Box::new(CalDavIntegration::new(config)));
```

## Deployment Architecture

### Build Configuration

#### Multi-Platform Builds

```toml
# Cargo.toml
[package]
name = "evorbrain"
version = "0.1.0"

[dependencies]
tauri = { version = "2.0", features = ["macos-private-api"] }

[target.'cfg(windows)'.dependencies]
windows = { version = "0.52", features = ["Win32_Foundation"] }

[target.'cfg(target_os = "macos")'.dependencies]
cocoa = "0.25"

[target.'cfg(target_os = "linux")'.dependencies]
gtk = "0.18"
```

### Distribution Strategy

#### Platform-Specific Packages

1. **Windows**

   - MSI installer via WiX
   - Portable ZIP
   - Microsoft Store (future)

2. **macOS**

   - DMG with code signing
   - Homebrew cask (future)
   - Mac App Store (future)

3. **Linux**
   - AppImage (universal)
   - Deb package (Debian/Ubuntu)
   - RPM package (Fedora/RHEL)
   - AUR package (Arch)

### Update Mechanism

#### Auto-Update Architecture

```rust
// Built-in updater
use tauri::updater::builder;

let updater = builder()
    .endpoints(vec![
        "https://releases.evorbrain.com/{{target}}/{{current_version}}"
    ])
    .build()?;

// Check for updates
if let Some(update) = updater.check().await? {
    update.download_and_install().await?;
}
```

---

_This architecture document provides the technical foundation for EvorBrain development and will be updated as implementation progresses._
