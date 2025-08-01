import { expect } from 'vitest';
import type { LifeArea, Goal, Project, Task, Note } from '../../types/models';

/**
 * Custom matchers for EvorBrain domain objects
 */

interface CustomMatchers<R = unknown> {
  toBeValidLifeArea(): R;
  toBeValidGoal(): R;
  toBeValidProject(): R;
  toBeValidTask(): R;
  toBeValidNote(): R;
  toBeArchived(): R;
  toBeCompleted(): R;
  toBeOverdue(): R;
  toHavePosition(position: number): R;
  toBeBetweenDates(startDate: string | Date, endDate: string | Date): R;
  toHaveValidTimestamps(): R;
  toHaveValidId(prefix?: string): R;
  toBeInStatus(status: string): R;
  toHavePriority(priority: string): R;
}

declare module 'vitest' {
  type Assertion<T = any> = CustomMatchers<T>;
  type AsymmetricMatchersContaining = CustomMatchers;
}

/**
 * Check if a value is a valid ISO date string
 */
const isValidISODate = (date: string): boolean => {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime()) && parsed.toISOString() === date;
};

/**
 * Check if a value is a valid hex color
 */
const isValidHexColor = (color: string): boolean => /^#[0-9A-F]{6}$/i.test(color);

/**
 * Check if a value is a valid UUID
 */
const isValidUUID = (id: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/**
 * Define custom matchers
 */
expect.extend({
  toBeValidLifeArea(received: any) {
    const errors: string[] = [];

    if (!received || typeof received !== 'object') {
      errors.push('Value is not an object');
    } else {
      const lifeArea = received as LifeArea;

      if (!lifeArea.id || typeof lifeArea.id !== 'string') {
        errors.push('Missing or invalid id');
      }
      if (!lifeArea.name || typeof lifeArea.name !== 'string') {
        errors.push('Missing or invalid name');
      }
      if (lifeArea.color && !isValidHexColor(lifeArea.color)) {
        errors.push(`Invalid color format: ${lifeArea.color}`);
      }
      if (typeof lifeArea.position !== 'number' || lifeArea.position < 0) {
        errors.push('Invalid position');
      }
      if (!isValidISODate(lifeArea.created_at)) {
        errors.push('Invalid created_at timestamp');
      }
      if (!isValidISODate(lifeArea.updated_at)) {
        errors.push('Invalid updated_at timestamp');
      }
    }

    return {
      pass: errors.length === 0,
      message: () =>
        errors.length > 0
          ? `Expected valid LifeArea but found errors:\n${errors.join('\n')}`
          : 'Expected invalid LifeArea but it was valid',
    };
  },

  toBeValidGoal(received: any) {
    const errors: string[] = [];

    if (!received || typeof received !== 'object') {
      errors.push('Value is not an object');
    } else {
      const goal = received as Goal;

      if (!goal.id || typeof goal.id !== 'string') {
        errors.push('Missing or invalid id');
      }
      if (!goal.life_area_id || typeof goal.life_area_id !== 'string') {
        errors.push('Missing or invalid life_area_id');
      }
      if (!goal.title || typeof goal.title !== 'string') {
        errors.push('Missing or invalid title');
      }
      if (goal.target_date && !isValidISODate(goal.target_date)) {
        errors.push('Invalid target_date');
      }
      if (goal.completed_at && !isValidISODate(goal.completed_at)) {
        errors.push('Invalid completed_at timestamp');
      }
    }

    return {
      pass: errors.length === 0,
      message: () =>
        errors.length > 0
          ? `Expected valid Goal but found errors:\n${errors.join('\n')}`
          : 'Expected invalid Goal but it was valid',
    };
  },

  toBeValidTask(received: any) {
    const errors: string[] = [];

    if (!received || typeof received !== 'object') {
      errors.push('Value is not an object');
    } else {
      const task = received as Task;

      if (!task.id || typeof task.id !== 'string') {
        errors.push('Missing or invalid id');
      }
      if (!task.title || typeof task.title !== 'string') {
        errors.push('Missing or invalid title');
      }
      if (!['low', 'medium', 'high', 'critical'].includes(task.priority)) {
        errors.push(`Invalid priority: ${task.priority}`);
      }
      if (task.due_date && !isValidISODate(task.due_date)) {
        errors.push('Invalid due_date');
      }
    }

    return {
      pass: errors.length === 0,
      message: () =>
        errors.length > 0
          ? `Expected valid Task but found errors:\n${errors.join('\n')}`
          : 'Expected invalid Task but it was valid',
    };
  },

  toBeArchived(received: any) {
    const isArchived = received?.archived_at != null;
    return {
      pass: isArchived,
      message: () =>
        isArchived ? 'Expected item not to be archived' : 'Expected item to be archived',
    };
  },

  toBeCompleted(received: any) {
    const isCompleted = received?.completed_at != null;
    return {
      pass: isCompleted,
      message: () =>
        isCompleted ? 'Expected item not to be completed' : 'Expected item to be completed',
    };
  },

  toBeOverdue(received: any) {
    const task = received as Task;
    const now = new Date();
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const isOverdue = dueDate != null && dueDate < now && !task.completed_at;

    return {
      pass: isOverdue,
      message: () =>
        isOverdue ? 'Expected task not to be overdue' : 'Expected task to be overdue',
    };
  },

  toHavePosition(received: any, expectedPosition: number) {
    const actualPosition = received?.position;
    const matches = actualPosition === expectedPosition;

    return {
      pass: matches,
      message: () =>
        matches
          ? `Expected position not to be ${expectedPosition}`
          : `Expected position ${expectedPosition} but got ${actualPosition}`,
    };
  },

  toBeBetweenDates(received: string, startDate: string | Date, endDate: string | Date) {
    const date = new Date(received);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const isBetween = date >= start && date <= end;

    return {
      pass: isBetween,
      message: () =>
        isBetween
          ? `Expected ${received} not to be between ${startDate} and ${endDate}`
          : `Expected ${received} to be between ${startDate} and ${endDate}`,
    };
  },

  toHaveValidTimestamps(received: any) {
    const errors: string[] = [];

    if (!received?.created_at || !isValidISODate(received.created_at)) {
      errors.push('Invalid or missing created_at');
    }
    if (!received?.updated_at || !isValidISODate(received.updated_at)) {
      errors.push('Invalid or missing updated_at');
    }
    if (received?.created_at && received?.updated_at) {
      const created = new Date(received.created_at);
      const updated = new Date(received.updated_at);
      if (updated < created) {
        errors.push('updated_at is before created_at');
      }
    }

    return {
      pass: errors.length === 0,
      message: () =>
        errors.length > 0
          ? `Invalid timestamps:\n${errors.join('\n')}`
          : 'Expected invalid timestamps',
    };
  },

  toHaveValidId(received: any, prefix?: string) {
    const id = received?.id || received;
    let isValid = typeof id === 'string' && id.length > 0;

    if (prefix) {
      isValid = isValid && id.startsWith(prefix);
    }

    // Check if it's a valid UUID or test ID format
    const isUUID = isValidUUID(id);
    const isTestId = /^test-[\w-]+$/.test(id);
    isValid = isValid && (isUUID || isTestId);

    return {
      pass: isValid,
      message: () =>
        isValid
          ? `Expected invalid ID${prefix ? ` with prefix "${prefix}"` : ''}`
          : `Expected valid ID${prefix ? ` with prefix "${prefix}"` : ''} but got "${id}"`,
    };
  },

  toBeInStatus(received: any, expectedStatus: string) {
    const actualStatus = received?.status;
    const matches = actualStatus === expectedStatus;

    return {
      pass: matches,
      message: () =>
        matches
          ? `Expected status not to be "${expectedStatus}"`
          : `Expected status "${expectedStatus}" but got "${actualStatus}"`,
    };
  },

  toHavePriority(received: any, expectedPriority: string) {
    const actualPriority = received?.priority;
    const matches = actualPriority === expectedPriority;

    return {
      pass: matches,
      message: () =>
        matches
          ? `Expected priority not to be "${expectedPriority}"`
          : `Expected priority "${expectedPriority}" but got "${actualPriority}"`,
    };
  },
});

/**
 * Additional assertion helpers
 */
export const assertValidHierarchy = (hierarchy: {
  lifeArea?: LifeArea;
  goal?: Goal;
  project?: Project;
  task?: Task;
}) => {
  if (hierarchy.goal && hierarchy.lifeArea) {
    expect(hierarchy.goal.life_area_id).toBe(hierarchy.lifeArea.id);
  }
  if (hierarchy.project && hierarchy.goal) {
    expect(hierarchy.project.goal_id).toBe(hierarchy.goal.id);
  }
  if (hierarchy.task && hierarchy.project) {
    expect(hierarchy.task.project_id).toBe(hierarchy.project.id);
  }
};

export const assertValidDates = (...dates: (string | null | undefined)[]) => {
  dates.filter(Boolean).forEach((date) => {
    expect(date).toBeTruthy();
    expect(() => new Date(date!)).not.toThrow();
  });
};
