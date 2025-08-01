# Component Testing Guide

This guide explains how to write component tests for EvorBrain using Vitest and
@solidjs/testing-library.

## Setup

The testing environment is already configured with:

- **Vitest** as the test runner
- **@solidjs/testing-library** for testing SolidJS components
- **@testing-library/jest-dom** for additional DOM matchers
- **jsdom** as the DOM environment

## Writing Component Tests

### Basic Structure

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(() => <MyComponent />);
    // Test assertions
  });
});
```

### Common Testing Patterns

#### 1. Testing Rendered Content

```typescript
it('renders with text content', () => {
  render(() => <Button>Click me</Button>);
  const button = screen.getByRole('button', { name: /click me/i });
  expect(button).toBeInTheDocument();
});
```

#### 2. Testing Props and Variants

```typescript
it('applies variant classes', () => {
  render(() => <Button variant="danger">Delete</Button>);
  const button = screen.getByRole('button');
  expect(button).toHaveClass('bg-danger-500');
});
```

#### 3. Testing Event Handlers

```typescript
it('handles click events', () => {
  const handleClick = vi.fn();
  render(() => <Button onClick={handleClick}>Click</Button>);

  const button = screen.getByRole('button');
  fireEvent.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

#### 4. Testing Input Components

```typescript
it('handles input changes', () => {
  const handleInput = vi.fn();
  render(() => <Input onInput={handleInput} />);

  const input = screen.getByRole('textbox');
  fireEvent.input(input, { target: { value: 'test' } });

  expect(handleInput).toHaveBeenCalled();
});
```

#### 5. Testing Conditional Rendering

```typescript
it('conditionally renders content', () => {
  const { rerender } = render(() => <Component show={false} />);
  expect(screen.queryByText('Content')).not.toBeInTheDocument();

  rerender(() => <Component show={true} />);
  expect(screen.getByText('Content')).toBeInTheDocument();
});
```

#### 6. Testing Async Behavior

```typescript
it('loads data asynchronously', async () => {
  render(() => <DataComponent />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await screen.findByText('Data loaded');
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

## Query Methods

Use the appropriate query method based on your needs:

- `getBy*` - Throws error if element not found (use when element should exist)
- `queryBy*` - Returns null if not found (use for conditional elements)
- `findBy*` - Returns promise, waits for element (use for async rendering)

Common queries:

- `getByRole` - Preferred for accessibility
- `getByLabelText` - For form elements
- `getByText` - For specific text content
- `getByTestId` - Last resort when other queries don't work

## Mocking

### Using Test Utilities

⚠️ **Note**: The test utilities are fully implemented but have some environment setup limitations.
See the [Test Utilities Documentation](/src/test/utils/README.md) for current status and
workarounds.

We provide comprehensive test utilities for common scenarios:

```typescript
import {
  TauriMock,
  renderWithProviders,
  createLifeArea
} from '../test/utils';

it('uses enhanced mocking', async () => {
  const tauriMock = new TauriMock();
  tauriMock.onCommand('get_life_areas', () => [
    createLifeArea({ name: 'Work' })
  ]);

  const result = renderWithProviders(() => <MyComponent />, {
    mockInvoke: tauriMock.getMock()
  });

  // Test your component

  tauriMock.expectCommand('get_life_areas').toHaveBeenCalledTimes(1);
});
```

### Legacy Mocking

The setup file provides basic Tauri mocking:

```typescript
import { mockInvoke } from '../test/setup';

it('calls Tauri command', async () => {
  mockInvoke.mockResolvedValueOnce({ data: 'test' });

  // Your test code

  expect(mockInvoke).toHaveBeenCalledWith('command_name', expectedArgs);
});
```

### Mocking Modules

```typescript
vi.mock('./module-path', () => ({
  functionName: vi.fn(),
}));
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what the user sees/does
2. **Use semantic queries** - Prefer `getByRole` over `getByTestId`
3. **Keep tests focused** - One behavior per test
4. **Use descriptive test names** - Should explain what is being tested
5. **Clean up after tests** - Use `cleanup` if needed (auto-handled by testing-library)
6. **Mock external dependencies** - Don't make real API calls
7. **Test accessibility** - Use aria attributes and semantic HTML

## Running Tests

```bash
# Run tests in watch mode
bun test

# Run tests once
bun run test:run

# Run with UI
bun run test:ui

# Run with coverage
bun run test:coverage
```

## Test Coverage

The project enforces minimum test coverage thresholds to maintain code quality:

### Coverage Thresholds

- **Statements**: 80%
- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%

### Viewing Coverage Reports

```bash
# Generate and view coverage in terminal
bun run test:coverage

# Open HTML coverage report in browser
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### Coverage Configuration

Coverage is configured in `vitest.config.ts`:

- **Provider**: V8 (native Node.js coverage)
- **Reports**: Generated in `./coverage` directory
- **Formats**: text, json, html, lcov
- **All files**: Includes untested files in coverage

### Writing Tests for Coverage

To improve coverage:

1. **Test all exported functions** - Ensure each function has at least one test
2. **Cover edge cases** - Test error states, empty states, and boundaries
3. **Test conditional logic** - Cover all branches in if/else statements
4. **Test user interactions** - Click handlers, form submissions, etc.
5. **Test props variations** - Different prop combinations

Use the HTML coverage report to identify uncovered lines and branches.

## Example Test Files

See these files for examples:

- `/src/components/ui/Button.test.tsx` - Basic component testing
- `/src/components/ui/Input.test.tsx` - Form input testing with error states
- `/src/lib/api.test.ts` - API client testing with mocks

## Component Tests vs E2E Tests

Component tests focus on testing individual components in isolation, while end-to-end (E2E) tests
verify complete user workflows in the running application.

**When to use component tests:**

- Testing component behavior and state
- Verifying prop handling and event callbacks
- Testing edge cases and error states
- Fast feedback during development

**When to use E2E tests:**

- Testing complete user workflows
- Verifying integration between frontend and backend
- Testing critical business paths
- Ensuring the app works as a whole

For E2E testing documentation, see the [E2E Testing Guide](/e2e/README.md).
