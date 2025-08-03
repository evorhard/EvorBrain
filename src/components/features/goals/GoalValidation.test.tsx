import { describe, it, expect } from 'vitest';

// Goal validation functions to test
export const validateGoalName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Goal name is required';
  }
  if (name.trim().length < 2) {
    return 'Goal name must be at least 2 characters';
  }
  if (name.trim().length > 100) {
    return 'Goal name must be less than 100 characters';
  }
  return null;
};

export const validateGoalDescription = (description: string): string | null => {
  if (description && description.length > 500) {
    return 'Description must be less than 500 characters';
  }
  return null;
};

export const validateLifeAreaId = (lifeAreaId: string): string | null => {
  if (!lifeAreaId || lifeAreaId.trim().length === 0) {
    return 'Please select a life area';
  }
  return null;
};

export const validateTargetDate = (date: string | null): string | null => {
  if (!date) return null; // Target date is optional

  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    return 'Invalid date format';
  }

  // Allow past dates for historical goals
  return null;
};

export const validatePriority = (priority: string): string | null => {
  if (!['low', 'medium', 'high'].includes(priority)) {
    return 'Invalid priority level';
  }
  return null;
};

export const validateGoalForm = (data: {
  name: string;
  description?: string;
  life_area_id: string;
  target_date?: string;
  priority?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  const nameError = validateGoalName(data.name);
  if (nameError) errors.name = nameError;

  const descriptionError = validateGoalDescription(data.description || '');
  if (descriptionError) errors.description = descriptionError;

  const lifeAreaError = validateLifeAreaId(data.life_area_id);
  if (lifeAreaError) errors.life_area_id = lifeAreaError;

  const dateError = validateTargetDate(data.target_date || null);
  if (dateError) errors.target_date = dateError;

  const priorityError = validatePriority(data.priority || 'medium');
  if (priorityError) errors.priority = priorityError;

  return errors;
};

describe('Goal Validation', () => {
  describe('validateGoalName', () => {
    it('should reject empty names', () => {
      expect(validateGoalName('')).toBe('Goal name is required');
      expect(validateGoalName('   ')).toBe('Goal name is required');
    });

    it('should reject names that are too short', () => {
      expect(validateGoalName('A')).toBe('Goal name must be at least 2 characters');
    });

    it('should reject names that are too long', () => {
      const longName = 'A'.repeat(101);
      expect(validateGoalName(longName)).toBe('Goal name must be less than 100 characters');
    });

    it('should accept valid names', () => {
      expect(validateGoalName('Build a SaaS app')).toBeNull();
      expect(validateGoalName('Learn TypeScript')).toBeNull();
      expect(validateGoalName('  Valid Name  ')).toBeNull(); // Should trim
    });
  });

  describe('validateGoalDescription', () => {
    it('should accept empty descriptions', () => {
      expect(validateGoalDescription('')).toBeNull();
    });

    it('should reject descriptions that are too long', () => {
      const longDescription = 'A'.repeat(501);
      expect(validateGoalDescription(longDescription)).toBe(
        'Description must be less than 500 characters',
      );
    });

    it('should accept valid descriptions', () => {
      expect(
        validateGoalDescription('This is a detailed description of my goal to build something'),
      ).toBeNull();
    });
  });

  describe('validateLifeAreaId', () => {
    it('should reject empty life area IDs', () => {
      expect(validateLifeAreaId('')).toBe('Please select a life area');
      expect(validateLifeAreaId('   ')).toBe('Please select a life area');
    });

    it('should accept valid life area IDs', () => {
      expect(validateLifeAreaId('uuid-123-456')).toBeNull();
      expect(validateLifeAreaId('life-area-1')).toBeNull();
    });
  });

  describe('validateTargetDate', () => {
    it('should accept empty dates', () => {
      expect(validateTargetDate(null)).toBeNull();
      expect(validateTargetDate('')).toBeNull();
    });

    it('should reject invalid date formats', () => {
      expect(validateTargetDate('not-a-date')).toBe('Invalid date format');
      expect(validateTargetDate('2024-13-01')).toBe('Invalid date format'); // Invalid month
    });

    it('should accept valid dates', () => {
      expect(validateTargetDate('2024-12-31')).toBeNull();
      expect(validateTargetDate('2025-01-01')).toBeNull();
      expect(validateTargetDate(new Date().toISOString())).toBeNull();
    });

    it('should accept past dates for historical goals', () => {
      expect(validateTargetDate('2020-01-01')).toBeNull();
    });
  });

  describe('validatePriority', () => {
    it('should accept valid priority levels', () => {
      expect(validatePriority('low')).toBeNull();
      expect(validatePriority('medium')).toBeNull();
      expect(validatePriority('high')).toBeNull();
    });

    it('should reject invalid priority levels', () => {
      expect(validatePriority('urgent')).toBe('Invalid priority level');
      expect(validatePriority('LOW')).toBe('Invalid priority level'); // Case sensitive
      expect(validatePriority('')).toBe('Invalid priority level');
    });
  });

  describe('validateGoalForm', () => {
    it('should validate all fields', () => {
      const errors = validateGoalForm({
        name: '',
        life_area_id: '',
        description: 'A'.repeat(501),
        target_date: 'invalid-date',
        priority: 'urgent',
      });

      expect(errors).toEqual({
        name: 'Goal name is required',
        life_area_id: 'Please select a life area',
        description: 'Description must be less than 500 characters',
        target_date: 'Invalid date format',
        priority: 'Invalid priority level',
      });
    });

    it('should return empty object for valid data', () => {
      const errors = validateGoalForm({
        name: 'Learn TypeScript',
        life_area_id: 'life-area-1',
        description: 'Master TypeScript for better code',
        target_date: '2024-12-31',
        priority: 'high',
      });

      expect(errors).toEqual({});
    });

    it('should handle optional fields', () => {
      const errors = validateGoalForm({
        name: 'Valid Goal',
        life_area_id: 'life-area-1',
        // description, target_date, and priority are optional
      });

      expect(errors).toEqual({});
    });

    it('should use default priority if not provided', () => {
      const errors = validateGoalForm({
        name: 'Valid Goal',
        life_area_id: 'life-area-1',
        priority: undefined,
      });

      expect(errors).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    it('should handle unicode characters in names', () => {
      expect(validateGoalName('学习中文')).toBeNull(); // Chinese
      expect(validateGoalName('Développer une app')).toBeNull(); // French
      expect(validateGoalName('🎯 Goal with emoji')).toBeNull();
    });

    it('should handle different date formats', () => {
      expect(validateTargetDate('2024-01-01T00:00:00Z')).toBeNull(); // ISO format
      expect(validateTargetDate('2024-01-01T23:59:59.999Z')).toBeNull(); // With time
    });

    it('should trim whitespace in validation', () => {
      expect(validateGoalName('  Valid Goal  ')).toBeNull();
      expect(validateLifeAreaId('  life-area-1  ')).toBeNull();
    });
  });
});
