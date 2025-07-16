# Feature-Sliced Design Structure

This project follows the Feature-Sliced Design (FSD) architectural methodology for organizing frontend applications.

## Layer Hierarchy

The application is organized into layers with strict dependency rules. Each layer can only import from layers below it:

```
app → pages → widgets → features → entities → shared
```

### Layers Overview

1. **app/** - Application initialization
   - Global providers, styles, and app entry point
   - Contains the root App component

2. **pages/** - Route pages
   - Thin compositional layer for routes
   - Composes widgets to create full pages

3. **widgets/** - Complex UI blocks
   - Self-contained UI sections (Sidebar, Calendar, etc.)
   - Can use features and entities

4. **features/** - Business logic
   - User scenarios and operations (CRUD operations, etc.)
   - Contains api calls, state management, and feature-specific UI

5. **entities/** - Business entities
   - Data models and types (Task, Project, Goal, etc.)
   - Core domain objects

6. **shared/** - Shared code
   - Reusable utilities, UI components, configs
   - Can be used by any layer

## Import Rules

- ✅ `features/tasks` can import from `entities/task` and `shared/*`
- ✅ `pages/dashboard` can import from `widgets/*`, `features/*`, `entities/*`, and `shared/*`
- ❌ `entities/task` CANNOT import from `features/tasks`
- ❌ `features/tasks` CANNOT import from `features/projects` (cross-import)

## Public API Pattern

Each layer/slice exports its public API through an `index.ts` file. Internal implementation details should not be imported directly.

```typescript
// Good
import { Task } from '@/entities/task';

// Bad
import { Task } from '@/entities/task/model/types';
```