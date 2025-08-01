import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  TauriMock,
  createCrudMocks,
  renderWithProviders,
  renderWithTheme,
  createLifeArea,
  createGoal,
  createTask,
  createTestHierarchy,
  createLifeAreaWithGoals,
  batchCreate
} from './index';

/**
 * Example tests demonstrating the use of test utilities
 */

describe('Test Utilities Examples', () => {
  describe('TauriMock Examples', () => {
    let tauriMock: TauriMock;

    beforeEach(() => {
      tauriMock = new TauriMock({ delay: 10 });
    });

    afterEach(() => {
      tauriMock.reset();
    });

    it('should mock simple commands', async () => {
      // Setup
      tauriMock.onCommand('get_life_areas', () => [
        createLifeArea({ name: 'Work' }),
        createLifeArea({ name: 'Personal' })
      ]);

      // Execute
      const mock = tauriMock.getMock();
      const result = await mock('get_life_areas');

      // Assert
      expect(result).toHaveLength(2);
      tauriMock.expectCommand('get_life_areas').toHaveBeenCalledTimes(1);
    });

    it('should handle command failures', async () => {
      // Setup
      tauriMock.failCommand('create_life_area', 'Database locked');

      // Execute & Assert
      const mock = tauriMock.getMock();
      await expect(mock('create_life_area')).rejects.toThrow('Database locked');
    });

    it('should use pre-configured CRUD mocks', async () => {
      const crudMock = createCrudMocks();
      const mock = crudMock.getMock();

      // All CRUD operations are pre-mocked
      const areas = await mock('get_life_areas');
      expect(areas).toEqual([]);

      const created = await mock('create_life_area', { 
        request: { name: 'Test', color: '#000000' } 
      });
      expect(created).toHaveProperty('id');
      expect(created.name).toBe('Test');
    });
  });

  describe('Data Factory Examples', () => {
    it('should create valid test data', () => {
      const lifeArea = createLifeArea({ name: 'Health' });
      
      expect(lifeArea).toBeValidLifeArea();
      expect(lifeArea.name).toBe('Health');
      expect(lifeArea).toHaveValidTimestamps();
    });

    it('should create hierarchical data', () => {
      const hierarchy = createTestHierarchy({
        lifeArea: { name: 'Career' },
        goal: { title: 'Get Promotion' },
        project: { name: 'Skill Development' }
      });

      // All relationships are correctly set
      expect(hierarchy.goal.life_area_id).toBe(hierarchy.lifeArea.id);
      expect(hierarchy.project.goal_id).toBe(hierarchy.goal.id);
      expect(hierarchy.task.project_id).toBe(hierarchy.project.id);
      expect(hierarchy.subtask.parent_task_id).toBe(hierarchy.task.id);
    });

    it('should batch create items', () => {
      const goals = batchCreate(createGoal, 5, (index) => ({
        title: `Goal ${index + 1}`,
        position: index
      }));

      expect(goals).toHaveLength(5);
      goals.forEach((goal, index) => {
        expect(goal.title).toBe(`Goal ${index + 1}`);
        expect(goal).toHavePosition(index);
      });
    });

    it('should create items with specific states', () => {
      const { lifeArea, goals } = createLifeAreaWithGoals(3, 
        { name: 'Archived Area', archived_at: new Date().toISOString() },
        { completed_at: new Date().toISOString() }
      );

      expect(lifeArea).toBeArchived();
      goals.forEach(goal => {
        expect(goal).toBeCompleted();
        expect(goal.life_area_id).toBe(lifeArea.id);
      });
    });
  });

  describe('Custom Matcher Examples', () => {
    it('should validate domain objects', () => {
      const validLifeArea = createLifeArea();
      const invalidLifeArea = { name: '', id: null };

      expect(validLifeArea).toBeValidLifeArea();
      expect(invalidLifeArea).not.toBeValidLifeArea();
    });

    it('should check item states', () => {
      const task = createTask({ 
        due_date: new Date(Date.now() - 86400000).toISOString() // Yesterday
      });
      const completedTask = createTask({ 
        completed_at: new Date().toISOString() 
      });

      expect(task).toBeOverdue();
      expect(completedTask).toBeCompleted();
      expect(completedTask).not.toBeOverdue();
    });

    it('should validate dates and IDs', () => {
      const now = new Date().toISOString();
      const id = 'test-123-456';

      expect(now).toBeBetweenDates(
        new Date(Date.now() - 1000).toISOString(),
        new Date(Date.now() + 1000).toISOString()
      );
      
      expect({ id }).toHaveValidId('test');
      expect('invalid-id').not.toHaveValidId('test');
    });
  });

  describe('Render Helper Examples', () => {
    // Note: These tests demonstrate the API but skip actual rendering
    // For real component tests, see Button.test.tsx and Input.test.tsx
    
    it('demonstrates render helper APIs', () => {
      // The render helpers are meant to be used in actual component tests
      // where the DOM environment is properly set up
      
      // Basic API examples:
      expect(renderWithProviders).toBeDefined();
      expect(renderWithTheme).toBeDefined();
      expect(typeof renderWithProviders).toBe('function');
      expect(typeof renderWithTheme).toBe('function');
      
      // These functions would be used like this in real tests:
      // const result = renderWithProviders(() => <MyComponent />);
      // const themed = renderWithTheme(() => <ThemedComponent />, 'dark');
    });
  });

  describe('Integration Example', () => {
    it('demonstrates combining utilities for complex scenarios', async () => {
      // Setup mock
      const tauriMock = new TauriMock();
      
      // Create test data
      const { lifeArea, goals } = createLifeAreaWithGoals(3);
      
      // Configure mock responses
      tauriMock
        .onCommand('get_life_areas', () => [lifeArea])
        .onCommand('get_goals_by_life_area', ({ life_area_id }) => 
          life_area_id === lifeArea.id ? goals : []
        );

      // Simulate API calls
      const mock = tauriMock.getMock();
      const areas = await mock('get_life_areas');
      const areaGoals = await mock('get_goals_by_life_area', { 
        life_area_id: lifeArea.id 
      });

      // Assertions
      expect(areas[0]).toBeValidLifeArea();
      expect(areaGoals).toHaveLength(3);
      areaGoals.forEach(goal => {
        expect(goal).toBeValidGoal();
        expect(goal.life_area_id).toBe(lifeArea.id);
      });

      // Verify mock calls
      tauriMock.expectCommand('get_life_areas').toHaveBeenCalledTimes(1);
      tauriMock.expectCommand('get_goals_by_life_area')
        .toHaveBeenCalledWith({ life_area_id: lifeArea.id });
    });
  });
});