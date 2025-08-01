import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { GoalForm } from './GoalForm';
import { TauriMock, createGoal, createLifeArea, createArchivedLifeArea } from '../../../test/utils';

describe('GoalForm Component', () => {
  let tauriMock: TauriMock;
  let onClose: ReturnType<typeof vi.fn>;
  const mockLifeAreas = [
    createLifeArea({ name: 'Work' }),
    createLifeArea({ name: 'Personal' }),
    createLifeArea({ name: 'Health' }),
    createArchivedLifeArea({ name: 'Archived Area' }),
  ];

  beforeEach(() => {
    tauriMock = new TauriMock({ delay: 10 });
    onClose = vi.fn();
    // Always mock life areas since GoalForm uses them
    tauriMock.onCommand('get_life_areas', () => mockLifeAreas);
  });

  afterEach(() => {
    tauriMock.reset();
  });

  describe('Create Mode', () => {
    it('should render empty form in create mode', () => {
      render(() => <GoalForm onClose={onClose} />);

      expect(screen.getByLabelText('Goal Name *')).toHaveValue('');
      expect(screen.getByLabelText('Life Area *')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
      expect(screen.getByLabelText('Priority')).toHaveValue('medium');
      expect(screen.getByLabelText('Target Date')).toHaveValue('');
      expect(screen.getByText('Create Goal')).toBeInTheDocument();
    });

    it('should show only active life areas in dropdown', () => {
      render(() => <GoalForm onClose={onClose} />);

      const select = screen.getByLabelText('Life Area *');
      const options = select.querySelectorAll('option');

      // Should have placeholder + 3 active areas (not the archived one)
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveTextContent('Select a life area');
      expect(options[1]).toHaveTextContent('Work');
      expect(options[2]).toHaveTextContent('Personal');
      expect(options[3]).toHaveTextContent('Health');
    });

    it('should validate required fields', async () => {
      render(() => <GoalForm onClose={onClose} />);

      const submitButton = screen.getByText('Create Goal');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Goal name is required')).toBeInTheDocument();
      });

      // Fill name but not life area
      fireEvent.input(screen.getByLabelText('Goal Name *'), {
        target: { value: 'Test Goal' },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a life area')).toBeInTheDocument();
      });
    });

    it('should create goal with all fields', async () => {
      const newGoal = createGoal({
        name: 'New Goal',
        description: 'Goal description',
        life_area_id: mockLifeAreas[0].id,
        priority: 'high',
        target_date: '2025-12-31T00:00:00Z',
      });

      tauriMock.onCommand('create_goal', (data) => {
        expect(data).toMatchObject({
          name: 'New Goal',
          description: 'Goal description',
          life_area_id: mockLifeAreas[0].id,
          priority: 'high',
          target_date: '2025-12-31',
        });
        return newGoal;
      });

      render(() => <GoalForm onClose={onClose} />);

      // Fill form
      fireEvent.input(screen.getByLabelText('Goal Name *'), {
        target: { value: 'New Goal' },
      });
      fireEvent.change(screen.getByLabelText('Life Area *'), {
        target: { value: mockLifeAreas[0].id },
      });
      fireEvent.input(screen.getByLabelText('Description'), {
        target: { value: 'Goal description' },
      });
      fireEvent.change(screen.getByLabelText('Priority'), {
        target: { value: 'high' },
      });
      fireEvent.input(screen.getByLabelText('Target Date'), {
        target: { value: '2025-12-31' },
      });

      // Submit
      fireEvent.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });

      tauriMock.expectCommand('create_goal').toHaveBeenCalledTimes(1);
    });

    it('should create goal with minimal fields', async () => {
      const newGoal = createGoal({
        name: 'Minimal Goal',
        life_area_id: mockLifeAreas[1].id,
      });

      tauriMock.onCommand('create_goal', (data) => {
        expect(data).toMatchObject({
          name: 'Minimal Goal',
          life_area_id: mockLifeAreas[1].id,
          priority: 'medium',
        });
        expect(data.description).toBeUndefined();
        expect(data.target_date).toBeUndefined();
        return newGoal;
      });

      render(() => <GoalForm onClose={onClose} />);

      fireEvent.input(screen.getByLabelText('Goal Name *'), {
        target: { value: 'Minimal Goal' },
      });
      fireEvent.change(screen.getByLabelText('Life Area *'), {
        target: { value: mockLifeAreas[1].id },
      });

      fireEvent.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      tauriMock.onCommand(
        'create_goal',
        () => new Promise((resolve) => setTimeout(() => resolve(createGoal()), 100)),
      );

      render(() => <GoalForm onClose={onClose} />);

      fireEvent.input(screen.getByLabelText('Goal Name *'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByLabelText('Life Area *'), {
        target: { value: mockLifeAreas[0].id },
      });

      fireEvent.click(screen.getByText('Create Goal'));

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeDisabled();
    });

    it('should handle creation errors', async () => {
      tauriMock.failCommand('create_goal', 'Database error');

      render(() => <GoalForm onClose={onClose} />);

      fireEvent.input(screen.getByLabelText('Goal Name *'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByLabelText('Life Area *'), {
        target: { value: mockLifeAreas[0].id },
      });

      fireEvent.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(screen.getByText('Database error')).toBeInTheDocument();
      });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    const existingGoal = createGoal({
      name: 'Existing Goal',
      description: 'Current description',
      life_area_id: mockLifeAreas[1].id,
      priority: 'high',
      target_date: '2025-06-15T00:00:00Z',
    });

    it('should render form with existing goal data', () => {
      render(() => <GoalForm goal={existingGoal} onClose={onClose} />);

      expect(screen.getByLabelText('Goal Name *')).toHaveValue('Existing Goal');
      expect(screen.getByLabelText('Life Area *')).toHaveValue(mockLifeAreas[1].id);
      expect(screen.getByLabelText('Description')).toHaveValue('Current description');
      expect(screen.getByLabelText('Priority')).toHaveValue('high');
      expect(screen.getByLabelText('Target Date')).toHaveValue('2025-06-15');
      expect(screen.getByText('Update Goal')).toBeInTheDocument();
    });

    it('should update goal with changes', async () => {
      const updatedGoal = {
        ...existingGoal,
        name: 'Updated Goal',
        description: 'New description',
        priority: 'low' as const,
        target_date: '2025-12-31T00:00:00Z',
      };

      tauriMock.onCommand('update_goal', ({ id, ...data }) => {
        expect(id).toBe(existingGoal.id);
        expect(data).toMatchObject({
          name: 'Updated Goal',
          description: 'New description',
          priority: 'low',
          target_date: '2025-12-31',
        });
        return updatedGoal;
      });

      render(() => <GoalForm goal={existingGoal} onClose={onClose} />);

      // Update fields
      fireEvent.input(screen.getByLabelText('Goal Name *'), {
        target: { value: 'Updated Goal' },
      });
      fireEvent.input(screen.getByLabelText('Description'), {
        target: { value: 'New description' },
      });
      fireEvent.change(screen.getByLabelText('Priority'), {
        target: { value: 'low' },
      });
      fireEvent.input(screen.getByLabelText('Target Date'), {
        target: { value: '2025-12-31' },
      });

      fireEvent.click(screen.getByText('Update Goal'));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });

      tauriMock.expectCommand('update_goal').toHaveBeenCalledTimes(1);
    });

    it('should not include life_area_id in update', async () => {
      tauriMock.onCommand('update_goal', ({ id, ...data }) => {
        expect(id).toBe(existingGoal.id);
        expect(data).not.toHaveProperty('life_area_id');
        return existingGoal;
      });

      render(() => <GoalForm goal={existingGoal} onClose={onClose} />);

      fireEvent.click(screen.getByText('Update Goal'));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should handle update errors', async () => {
      tauriMock.failCommand('update_goal', 'Update failed');

      render(() => <GoalForm goal={existingGoal} onClose={onClose} />);

      fireEvent.click(screen.getByText('Update Goal'));

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Common Functionality', () => {
    it('should trim whitespace from inputs', async () => {
      tauriMock.onCommand('create_goal', (data) => {
        expect(data.name).toBe('Trimmed Name');
        expect(data.description).toBe('Trimmed description');
        return createGoal(data);
      });

      render(() => <GoalForm onClose={onClose} />);

      fireEvent.input(screen.getByLabelText('Goal Name *'), {
        target: { value: '  Trimmed Name  ' },
      });
      fireEvent.change(screen.getByLabelText('Life Area *'), {
        target: { value: mockLifeAreas[0].id },
      });
      fireEvent.input(screen.getByLabelText('Description'), {
        target: { value: '  Trimmed description  ' },
      });

      fireEvent.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        tauriMock.expectCommand('create_goal').toHaveBeenCalled();
      });
    });

    it('should handle cancel button', () => {
      render(() => <GoalForm onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancel'));

      expect(onClose).toHaveBeenCalled();
    });

    it('should focus on name input on mount', () => {
      render(() => <GoalForm onClose={onClose} />);

      const nameInput = screen.getByLabelText('Goal Name *');
      expect(nameInput).toHaveFocus();
    });

    it('should clear empty description field', async () => {
      tauriMock.onCommand('create_goal', (data) => {
        expect(data.description).toBeUndefined();
        return createGoal(data);
      });

      render(() => <GoalForm onClose={onClose} />);

      fireEvent.input(screen.getByLabelText('Goal Name *'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByLabelText('Life Area *'), {
        target: { value: mockLifeAreas[0].id },
      });
      fireEvent.input(screen.getByLabelText('Description'), {
        target: { value: '   ' }, // Only whitespace
      });

      fireEvent.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        tauriMock.expectCommand('create_goal').toHaveBeenCalled();
      });
    });

    it('should show all priority options', () => {
      render(() => <GoalForm onClose={onClose} />);

      const prioritySelect = screen.getByLabelText('Priority');
      const options = prioritySelect.querySelectorAll('option');

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveValue('low');
      expect(options[0]).toHaveTextContent('Low');
      expect(options[1]).toHaveValue('medium');
      expect(options[1]).toHaveTextContent('Medium');
      expect(options[2]).toHaveValue('high');
      expect(options[2]).toHaveTextContent('High');
    });

    it('should handle generic errors gracefully', async () => {
      tauriMock.onCommand('create_goal', () => {
        throw new Error();
      });

      render(() => <GoalForm onClose={onClose} />);

      fireEvent.input(screen.getByLabelText('Goal Name *'), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByLabelText('Life Area *'), {
        target: { value: mockLifeAreas[0].id },
      });

      fireEvent.click(screen.getByText('Create Goal'));

      await waitFor(() => {
        expect(screen.getByText('Failed to save goal')).toBeInTheDocument();
      });
    });
  });
});
