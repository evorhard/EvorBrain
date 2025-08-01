# Test Utilities Documentation

This directory contains reusable test utilities to help write consistent and maintainable tests for
EvorBrain.

## ⚠️ Current Status

**Important:** These test utilities are fully implemented but have some limitations due to the
current test environment setup:

- **Render Helpers**: Router integration is not yet implemented (commented out to avoid SSR issues)
- **DOM Environment**: Some tests may fail with "document is not defined" errors when running
  outside of the proper test environment
- **Component Tests**: The existing Button and Input tests need to be updated to work with the
  current environment setup

The utilities themselves are working correctly as demonstrated by the passing `example.test.tsx`
file, but full integration with all component tests is still in progress.

## Overview

The test utilities are organized into four main categories:

1. **Tauri Mocks** - Enhanced mocking for Tauri IPC commands
2. **Render Helpers** - Utilities for rendering SolidJS components in tests
3. **Data Factories** - Functions for creating test data
4. **Custom Matchers** - Domain-specific assertions

## Usage

Import all utilities from the main index:

```typescript
import {
  TauriMock,
  renderWithProviders,
  createLifeArea,
  // ... other utilities
} from '../test/utils';
```

## Tauri Mocks

### TauriMock Class

A powerful mock system for Tauri commands with type safety and flexible configuration.

```typescript
import { TauriMock } from '../test/utils';

describe('MyComponent', () => {
  let tauriMock: TauriMock;

  beforeEach(() => {
    tauriMock = new TauriMock({ delay: 50 }); // 50ms delay
  });

  afterEach(() => {
    tauriMock.reset();
  });

  it('should handle Tauri commands', async () => {
    // Set up command response
    tauriMock.onCommand('get_life_areas', () => [
      createLifeArea({ name: 'Work' }),
      createLifeArea({ name: 'Personal' })
    ]);

    // Use in component
    const result = renderWithProviders(() => <MyComponent />, {
      mockInvoke: tauriMock.getMock()
    });

    // Assert command was called
    tauriMock.expectCommand('get_life_areas').toHaveBeenCalledTimes(1);
  });

  it('should handle errors', () => {
    tauriMock.failCommand('create_life_area', 'Database error');

    // Test error handling...
  });
});
```

### Pre-configured CRUD Mocks

```typescript
import { createCrudMocks } from '../test/utils';

const mock = createCrudMocks();
// Automatically mocks all CRUD operations with sensible defaults
```

## Render Helpers

### renderWithProviders

Enhanced render function with common wrappers:

```typescript
import { renderWithProviders } from '../test/utils';

// Basic usage
const { getByText } = renderWithProviders(() => <MyComponent />);

// With router (⚠️ Not yet implemented - will log warning)
const result = renderWithProviders(() => <MyComponent />, {
  withRouter: true,
  initialRoute: '/life-areas'
});

// With mock Tauri
const result = renderWithProviders(() => <MyComponent />, {
  mockInvoke: tauriMock.getMock()
});
```

**Note:** Router support is currently disabled to avoid SSR issues with @solidjs/router.

### renderWithTheme

Test components with theme support:

```typescript
import { renderWithTheme } from '../test/utils';

// Light theme (default)
renderWithTheme(() => <ThemedComponent />);

// Dark theme
renderWithTheme(() => <ThemedComponent />, 'dark');
```

### renderWithLoadingState

Test components with loading states:

```typescript
import { renderWithLoadingState } from '../test/utils';

const result = await renderWithLoadingState(() => <AsyncComponent />, {
  loadingDelay: 200,
  onLoad: async () => {
    // Perform actions after loading
  }
});
```

### renderWithMockData

Provide mock data context:

```typescript
import { renderWithMockData } from '../test/utils';

const { updateMockData } = renderWithMockData(
  () => <DataComponent />,
  {
    users: [],
    settings: { theme: 'light' }
  }
);

// Update mock data during test
updateMockData({ users: [{ id: '1', name: 'Test' }] });
```

## Data Factories

### Basic Factories

Create test data with sensible defaults:

```typescript
import { createLifeArea, createGoal, createProject, createTask, createNote } from '../test/utils';

// Basic usage
const lifeArea = createLifeArea();
const goal = createGoal({ life_area_id: lifeArea.id });

// With overrides
const task = createTask({
  title: 'Custom Task',
  priority: 'high',
  due_date: createTimestamp(7), // 7 days from now
});
```

### Hierarchical Data

Create complete data hierarchies:

```typescript
import { createTestHierarchy } from '../test/utils';

const hierarchy = createTestHierarchy({
  lifeArea: { name: 'Work' },
  goal: { title: 'Get Promotion' },
  project: { name: 'Skill Development' },
});

// Access all related data
console.log(hierarchy.lifeArea.id);
console.log(hierarchy.goal.life_area_id); // Same as lifeArea.id
```

### Batch Creation

Create multiple items:

```typescript
import { batchCreate, createTask } from '../test/utils';

const tasks = batchCreate(createTask, 5, (index) => ({
  title: `Task ${index + 1}`,
  position: index,
}));
```

### State-specific Factories

```typescript
import {
  createCompletedGoal,
  createArchivedLifeArea,
  createOverdueTask,
  createInProgressProject,
} from '../test/utils';

const completed = createCompletedGoal();
const archived = createArchivedLifeArea();
const overdue = createOverdueTask();
```

## Custom Matchers

### Domain Object Validation

```typescript
// These matchers are automatically available
expect(lifeArea).toBeValidLifeArea();
expect(goal).toBeValidGoal();
expect(task).toBeValidTask();
```

### State Matchers

```typescript
expect(item).toBeArchived();
expect(item).toBeCompleted();
expect(task).toBeOverdue();
expect(project).toBeInStatus('in_progress');
expect(task).toHavePriority('high');
```

### Utility Matchers

```typescript
expect(item).toHavePosition(0);
expect(date).toBeBetweenDates('2025-01-01', '2025-12-31');
expect(item).toHaveValidTimestamps();
expect(id).toHaveValidId('life-area');
```

## Complete Example

Here's a complete test example using all utilities:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  TauriMock,
  renderWithProviders,
  createLifeAreaWithGoals,
  createCrudMocks
} from '../test/utils';
import { LifeAreaManager } from './LifeAreaManager';

describe('LifeAreaManager', () => {
  let tauriMock: TauriMock;

  beforeEach(() => {
    tauriMock = createCrudMocks();
  });

  afterEach(() => {
    tauriMock.reset();
  });

  it('should display life areas with goals', async () => {
    // Create test data
    const { lifeArea, goals } = createLifeAreaWithGoals(3);

    // Mock API responses
    tauriMock
      .onCommand('get_life_areas', () => [lifeArea])
      .onCommand('get_goals_by_life_area', ({ life_area_id }) =>
        life_area_id === lifeArea.id ? goals : []
      );

    // Render component
    const result = renderWithProviders(() => <LifeAreaManager />, {
      withRouter: true,
      mockInvoke: tauriMock.getMock()
    });

    // Wait for data to load
    await result.findByText(lifeArea.name);

    // Verify display
    expect(result.getByText(lifeArea.name)).toBeInTheDocument();
    goals.forEach(goal => {
      expect(result.getByText(goal.title)).toBeInTheDocument();
    });

    // Verify API calls
    tauriMock.expectCommand('get_life_areas').toHaveBeenCalledTimes(1);
    tauriMock.expectCommand('get_goals_by_life_area')
      .toHaveBeenCalledWith({ life_area_id: lifeArea.id });

    // Verify data validity
    expect(lifeArea).toBeValidLifeArea();
    goals.forEach(goal => {
      expect(goal).toBeValidGoal();
      expect(goal.life_area_id).toBe(lifeArea.id);
    });
  });

  it('should handle errors gracefully', async () => {
    // Mock error
    tauriMock.failCommand('get_life_areas', 'Network error');

    // Render and verify error handling
    const result = renderWithProviders(() => <LifeAreaManager />, {
      mockInvoke: tauriMock.getMock()
    });

    await result.findByText(/error|failed/i);
  });
});
```

## Best Practices

1. **Always reset mocks** between tests to avoid state leakage
2. **Use data factories** instead of hardcoding test data
3. **Prefer custom matchers** for domain-specific assertions
4. **Mock at the right level** - usually at the Tauri command level
5. **Test both success and error paths**
6. **Use meaningful test data** that reflects real usage

## Tips

- Use `generateId()` for unique test IDs
- Call `resetIdCounter()` in `beforeEach` if ID uniqueness matters
- Combine utilities for complex test scenarios
- Keep test data realistic but minimal
- Use TypeScript for better IDE support and type safety

## Known Issues & Workarounds

### Document is not defined

If you encounter "document is not defined" errors:

1. Ensure your test file is running with the proper Vitest configuration
2. Check that jsdom is properly configured in vitest.config.ts
3. Run tests specifically with: `bun test src/test/utils/example.test.tsx`

### Router Integration

Router support in render helpers is currently disabled. If you need to test components with routing:

1. Mock the router context manually
2. Use the base `render` function with custom providers
3. Wait for full router integration support

### Running Tests

For best results, run test utilities separately:

```bash
# Run only the test utilities examples
bun test src/test/utils/example.test.tsx

# Run specific test files
bun test src/components/ui/Button.test.tsx
```
