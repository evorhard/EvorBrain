import { describe, it, expect } from 'vitest';
import { ProjectStatus } from '../../../types/models';

// Validation functions for projects
export function validateProjectTitle(title: string): string | null {
  if (!title || !title.trim()) {
    return 'Title is required';
  }
  if (title.trim().length < 2) {
    return 'Title must be at least 2 characters long';
  }
  if (title.trim().length > 100) {
    return 'Title must be less than 100 characters';
  }
  return null;
}

export function validateProjectDescription(description?: string): string | null {
  if (!description) {
    return null; // Description is optional
  }
  if (description.length > 500) {
    return 'Description must be less than 500 characters';
  }
  return null;
}

export function validateProjectGoal(goalId: string): string | null {
  if (!goalId || !goalId.trim()) {
    return 'Please select a goal';
  }
  return null;
}

export function validateProjectStatus(status: string): string | null {
  const validStatuses = Object.values(ProjectStatus);
  if (!validStatuses.includes(status as ProjectStatus)) {
    return 'Invalid project status';
  }
  return null;
}

export function validateProjectForm(data: {
  title: string;
  description?: string;
  goalId: string;
  status: string;
}): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  const titleError = validateProjectTitle(data.title);
  if (titleError) errors.title = titleError;

  const descriptionError = validateProjectDescription(data.description);
  if (descriptionError) errors.description = descriptionError;

  const goalError = validateProjectGoal(data.goalId);
  if (goalError) errors.goal = goalError;

  const statusError = validateProjectStatus(data.status);
  if (statusError) errors.status = statusError;

  return errors;
}

export function isValidStatusTransition(
  currentStatus: ProjectStatus,
  newStatus: ProjectStatus
): boolean {
  // Define valid status transitions
  const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
    [ProjectStatus.Planning]: [
      ProjectStatus.Active,
      ProjectStatus.OnHold,
      ProjectStatus.Cancelled,
    ],
    [ProjectStatus.Active]: [
      ProjectStatus.Completed,
      ProjectStatus.OnHold,
      ProjectStatus.Cancelled,
    ],
    [ProjectStatus.OnHold]: [
      ProjectStatus.Active,
      ProjectStatus.Planning,
      ProjectStatus.Cancelled,
    ],
    [ProjectStatus.Completed]: [
      ProjectStatus.Active, // Can reopen a completed project
    ],
    [ProjectStatus.Cancelled]: [
      ProjectStatus.Planning, // Can restart a cancelled project
    ],
  };

  // Same status is always valid (no change)
  if (currentStatus === newStatus) {
    return true;
  }

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

describe('Project Validation', () => {
  describe('validateProjectTitle', () => {
    it('should reject empty title', () => {
      expect(validateProjectTitle('')).toBe('Title is required');
      expect(validateProjectTitle('   ')).toBe('Title is required');
    });

    it('should reject title that is too short', () => {
      expect(validateProjectTitle('A')).toBe('Title must be at least 2 characters long');
    });

    it('should reject title that is too long', () => {
      const longTitle = 'A'.repeat(101);
      expect(validateProjectTitle(longTitle)).toBe('Title must be less than 100 characters');
    });

    it('should accept valid titles', () => {
      expect(validateProjectTitle('My Project')).toBeNull();
      expect(validateProjectTitle('AB')).toBeNull();
      expect(validateProjectTitle('A'.repeat(100))).toBeNull();
    });

    it('should trim whitespace when validating', () => {
      expect(validateProjectTitle('  My Project  ')).toBeNull();
      expect(validateProjectTitle('  A  ')).toBe('Title must be at least 2 characters long');
    });
  });

  describe('validateProjectDescription', () => {
    it('should accept empty description', () => {
      expect(validateProjectDescription('')).toBeNull();
      expect(validateProjectDescription(undefined)).toBeNull();
    });

    it('should reject description that is too long', () => {
      const longDescription = 'A'.repeat(501);
      expect(validateProjectDescription(longDescription)).toBe(
        'Description must be less than 500 characters'
      );
    });

    it('should accept valid descriptions', () => {
      expect(validateProjectDescription('A short description')).toBeNull();
      expect(validateProjectDescription('A'.repeat(500))).toBeNull();
    });
  });

  describe('validateProjectGoal', () => {
    it('should reject empty goal', () => {
      expect(validateProjectGoal('')).toBe('Please select a goal');
      expect(validateProjectGoal('   ')).toBe('Please select a goal');
    });

    it('should accept valid goal ID', () => {
      expect(validateProjectGoal('goal-123')).toBeNull();
      expect(validateProjectGoal('uuid-v4-string')).toBeNull();
    });
  });

  describe('validateProjectStatus', () => {
    it('should accept all valid statuses', () => {
      expect(validateProjectStatus(ProjectStatus.Planning)).toBeNull();
      expect(validateProjectStatus(ProjectStatus.Active)).toBeNull();
      expect(validateProjectStatus(ProjectStatus.OnHold)).toBeNull();
      expect(validateProjectStatus(ProjectStatus.Completed)).toBeNull();
      expect(validateProjectStatus(ProjectStatus.Cancelled)).toBeNull();
    });

    it('should reject invalid statuses', () => {
      expect(validateProjectStatus('invalid')).toBe('Invalid project status');
      expect(validateProjectStatus('in_progress')).toBe('Invalid project status'); // Old status name
      expect(validateProjectStatus('')).toBe('Invalid project status');
    });
  });

  describe('validateProjectForm', () => {
    it('should validate all fields', () => {
      const errors = validateProjectForm({
        title: '',
        description: 'A'.repeat(501),
        goalId: '',
        status: 'invalid',
      });

      expect(errors.title).toBe('Title is required');
      expect(errors.description).toBe('Description must be less than 500 characters');
      expect(errors.goal).toBe('Please select a goal');
      expect(errors.status).toBe('Invalid project status');
    });

    it('should return empty object for valid data', () => {
      const errors = validateProjectForm({
        title: 'Valid Project',
        description: 'A valid description',
        goalId: 'goal-123',
        status: ProjectStatus.Planning,
      });

      expect(errors).toEqual({});
    });

    it('should handle optional description', () => {
      const errors = validateProjectForm({
        title: 'Valid Project',
        goalId: 'goal-123',
        status: ProjectStatus.Planning,
      });

      expect(errors).toEqual({});
    });
  });

  describe('isValidStatusTransition', () => {
    it('should allow same status transition', () => {
      expect(isValidStatusTransition(ProjectStatus.Planning, ProjectStatus.Planning)).toBe(true);
      expect(isValidStatusTransition(ProjectStatus.Active, ProjectStatus.Active)).toBe(true);
    });

    it('should validate Planning status transitions', () => {
      expect(isValidStatusTransition(ProjectStatus.Planning, ProjectStatus.Active)).toBe(true);
      expect(isValidStatusTransition(ProjectStatus.Planning, ProjectStatus.OnHold)).toBe(true);
      expect(isValidStatusTransition(ProjectStatus.Planning, ProjectStatus.Cancelled)).toBe(true);
      expect(isValidStatusTransition(ProjectStatus.Planning, ProjectStatus.Completed)).toBe(false);
    });

    it('should validate Active status transitions', () => {
      expect(isValidStatusTransition(ProjectStatus.Active, ProjectStatus.Completed)).toBe(true);
      expect(isValidStatusTransition(ProjectStatus.Active, ProjectStatus.OnHold)).toBe(true);
      expect(isValidStatusTransition(ProjectStatus.Active, ProjectStatus.Cancelled)).toBe(true);
      expect(isValidStatusTransition(ProjectStatus.Active, ProjectStatus.Planning)).toBe(false);
    });

    it('should validate OnHold status transitions', () => {
      expect(isValidStatusTransition(ProjectStatus.OnHold, ProjectStatus.Active)).toBe(true);
      expect(isValidStatusTransition(ProjectStatus.OnHold, ProjectStatus.Planning)).toBe(true);
      expect(isValidStatusTransition(ProjectStatus.OnHold, ProjectStatus.Cancelled)).toBe(true);
      expect(isValidStatusTransition(ProjectStatus.OnHold, ProjectStatus.Completed)).toBe(false);
    });

    it('should validate Completed status transitions', () => {
      expect(isValidStatusTransition(ProjectStatus.Completed, ProjectStatus.Active)).toBe(true);
      expect(isValidStatusTransition(ProjectStatus.Completed, ProjectStatus.Planning)).toBe(false);
      expect(isValidStatusTransition(ProjectStatus.Completed, ProjectStatus.OnHold)).toBe(false);
      expect(isValidStatusTransition(ProjectStatus.Completed, ProjectStatus.Cancelled)).toBe(false);
    });

    it('should validate Cancelled status transitions', () => {
      expect(isValidStatusTransition(ProjectStatus.Cancelled, ProjectStatus.Planning)).toBe(true);
      expect(isValidStatusTransition(ProjectStatus.Cancelled, ProjectStatus.Active)).toBe(false);
      expect(isValidStatusTransition(ProjectStatus.Cancelled, ProjectStatus.OnHold)).toBe(false);
      expect(isValidStatusTransition(ProjectStatus.Cancelled, ProjectStatus.Completed)).toBe(false);
    });
  });

  describe('Project Status Enum Values', () => {
    it('should have correct enum values', () => {
      expect(ProjectStatus.Planning).toBe('planning');
      expect(ProjectStatus.Active).toBe('active');
      expect(ProjectStatus.OnHold).toBe('onhold');
      expect(ProjectStatus.Completed).toBe('completed');
      expect(ProjectStatus.Cancelled).toBe('cancelled');
    });

    it('should have all expected status values', () => {
      const statuses = Object.values(ProjectStatus);
      expect(statuses).toHaveLength(5);
      expect(statuses).toContain('planning');
      expect(statuses).toContain('active');
      expect(statuses).toContain('onhold');
      expect(statuses).toContain('completed');
      expect(statuses).toContain('cancelled');
    });
  });
});