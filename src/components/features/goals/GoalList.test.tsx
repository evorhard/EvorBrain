import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { GoalList } from './GoalList';
import { 
  TauriMock, 
  createGoal,
  createLifeArea,
  createCompletedGoal,
  createArchivedGoal,
  createTimestamp,
  batchCreate
} from '../../../test/utils';

describe('GoalList Component', () => {
  let tauriMock: TauriMock;
  const mockLifeAreas = [
    createLifeArea({ name: 'Work' }),
    createLifeArea({ name: 'Personal' }),
    createLifeArea({ name: 'Health' })
  ];

  beforeEach(() => {
    tauriMock = new TauriMock({ delay: 10 });
    // Always mock life areas since GoalList uses them
    tauriMock.onCommand('get_life_areas', () => mockLifeAreas);
  });

  afterEach(() => {
    tauriMock.reset();
  });

  it('should render loading state initially', async () => {
    tauriMock.onCommand('get_goals', () => new Promise(() => {})); // Never resolves
    
    render(() => <GoalList />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should fetch and display goals on mount', async () => {
    const goals = [
      createGoal({ 
        name: 'Learn TypeScript',
        description: 'Master TypeScript for better code',
        life_area_id: mockLifeAreas[0].id,
        priority: 'high'
      }),
      createGoal({ 
        name: 'Exercise Daily',
        life_area_id: mockLifeAreas[2].id,
        priority: 'medium',
        target_date: createTimestamp(30)
      })
    ];

    tauriMock.onCommand('get_goals', () => goals);

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Learn TypeScript')).toBeInTheDocument();
    });

    // Verify goals are displayed
    expect(screen.getByText('Learn TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Master TypeScript for better code')).toBeInTheDocument();
    expect(screen.getByText('Exercise Daily')).toBeInTheDocument();
    
    // Verify life area names
    expect(screen.getByText('Life Area: Work')).toBeInTheDocument();
    expect(screen.getByText('Life Area: Health')).toBeInTheDocument();
    
    // Verify priority badges
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('High')).toHaveClass('text-red-600');
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toHaveClass('text-yellow-600');
    
    // Verify target date
    expect(screen.getByText(/Target:/)).toBeInTheDocument();

    // Verify API calls
    tauriMock.expectCommand('get_life_areas').toHaveBeenCalledTimes(1);
    tauriMock.expectCommand('get_goals').toHaveBeenCalledTimes(1);
  });

  it('should display empty state when no goals exist', async () => {
    tauriMock.onCommand('get_goals', () => []);

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('No goals yet. Create your first one!')).toBeInTheDocument();
    });
  });

  it('should display error state when fetch fails', async () => {
    tauriMock.failCommand('get_goals', 'Network error occurred');

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });

    const errorElement = screen.getByText('Network error occurred').parentElement;
    expect(errorElement).toHaveClass('bg-red-50');
  });

  it('should handle refresh button click', async () => {
    const initialGoals = [createGoal({ name: 'Initial Goal' })];
    const refreshedGoals = [
      createGoal({ name: 'Initial Goal' }),
      createGoal({ name: 'New Goal' })
    ];

    let callCount = 0;
    tauriMock.onCommand('get_goals', () => {
      callCount++;
      return callCount === 1 ? initialGoals : refreshedGoals;
    });

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Initial Goal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Refresh'));

    await waitFor(() => {
      expect(screen.getByText('New Goal')).toBeInTheDocument();
    });

    tauriMock.expectCommand('get_goals').toHaveBeenCalledTimes(2);
  });

  it('should handle goal selection', async () => {
    const goals = [
      createGoal({ name: 'Goal 1' }),
      createGoal({ name: 'Goal 2' })
    ];

    tauriMock.onCommand('get_goals', () => goals);
    const consoleSpy = vi.spyOn(console, 'log');

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Goal 1')).toBeInTheDocument();
    });

    const goal1 = screen.getByText('Goal 1').closest('div[class*="cursor-pointer"]')!;
    fireEvent.click(goal1);

    expect(goal1).toHaveClass('ring-2');
    expect(goal1).toHaveClass('ring-primary');
    expect(consoleSpy).toHaveBeenCalledWith('Selected goal:', goals[0].id);

    const goal2 = screen.getByText('Goal 2').closest('div[class*="cursor-pointer"]')!;
    fireEvent.click(goal2);

    expect(goal1).not.toHaveClass('ring-2');
    expect(goal2).toHaveClass('ring-2');

    consoleSpy.mockRestore();
  });

  it('should handle goal completion', async () => {
    const goal = createGoal({ name: 'Complete Me' });
    const completedGoal = { ...goal, completed_at: createTimestamp() };

    tauriMock
      .onCommand('get_goals', () => [goal])
      .onCommand('complete_goal', ({ id }) => {
        expect(id).toBe(goal.id);
        return completedGoal;
      });

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Complete Me')).toBeInTheDocument();
    });

    const completeButton = screen.getByTitle('Mark as completed');
    fireEvent.click(completeButton);

    await waitFor(() => {
      tauriMock.expectCommand('complete_goal').toHaveBeenCalledWith({ id: goal.id });
    });
  });

  it('should handle goal uncompletion', async () => {
    const completedGoal = createCompletedGoal({ name: 'Uncomplete Me' });
    const uncompletedGoal = { ...completedGoal, completed_at: null };

    tauriMock
      .onCommand('get_goals', () => [completedGoal])
      .onCommand('uncomplete_goal', ({ id }) => {
        expect(id).toBe(completedGoal.id);
        return uncompletedGoal;
      });

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Uncomplete Me')).toBeInTheDocument();
    });

    expect(screen.getByText(/Completed/)).toBeInTheDocument();
    
    const uncompleteButton = screen.getByTitle('Mark as incomplete');
    fireEvent.click(uncompleteButton);

    await waitFor(() => {
      tauriMock.expectCommand('uncomplete_goal').toHaveBeenCalledWith({ id: completedGoal.id });
    });
  });

  it('should handle goal deletion with confirmation', async () => {
    const goal = createGoal({ name: 'Delete Me' });

    tauriMock
      .onCommand('get_goals', () => [goal])
      .onCommand('delete_goal', ({ id }) => {
        expect(id).toBe(goal.id);
        return null;
      });

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Delete Me')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTitle('Delete goal');
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete "Delete Me"?');

    await waitFor(() => {
      tauriMock.expectCommand('delete_goal').toHaveBeenCalledWith({ id: goal.id });
    });

    confirmSpy.mockRestore();
  });

  it('should not delete goal when confirmation is cancelled', async () => {
    const goal = createGoal({ name: 'Keep Me' });

    tauriMock.onCommand('get_goals', () => [goal]);

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Keep Me')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTitle('Delete goal');
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    tauriMock.expectCommand('delete_goal').toHaveBeenCalledTimes(0);

    confirmSpy.mockRestore();
  });

  it('should handle goal restoration', async () => {
    const archivedGoal = createArchivedGoal({ name: 'Restore Me' });
    const restoredGoal = { ...archivedGoal, archived_at: null };

    tauriMock
      .onCommand('get_goals', () => [archivedGoal])
      .onCommand('restore_goal', ({ id }) => {
        expect(id).toBe(archivedGoal.id);
        return restoredGoal;
      });

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Restore Me')).toBeInTheDocument();
    });

    expect(screen.getByText('Archived')).toBeInTheDocument();
    
    const restoreButton = screen.getByTitle('Restore goal');
    fireEvent.click(restoreButton);

    await waitFor(() => {
      tauriMock.expectCommand('restore_goal').toHaveBeenCalledWith({ id: archivedGoal.id });
    });
  });

  it('should display completed goals with reduced opacity', async () => {
    const completedGoal = createCompletedGoal({ name: 'Completed Goal' });

    tauriMock.onCommand('get_goals', () => [completedGoal]);

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Completed Goal')).toBeInTheDocument();
    });

    const goalElement = screen.getByText('Completed Goal').closest('div[class*="cursor-pointer"]')!;
    expect(goalElement).toHaveClass('opacity-60');
  });

  it('should show appropriate buttons based on goal state', async () => {
    const activeGoal = createGoal({ name: 'Active' });
    const completedGoal = createCompletedGoal({ name: 'Completed' });
    const archivedGoal = createArchivedGoal({ name: 'Archived' });

    tauriMock.onCommand('get_goals', () => [activeGoal, completedGoal, archivedGoal]);

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    // Active goal should have complete and delete buttons
    const activeElement = screen.getByText('Active').closest('div[class*="cursor-pointer"]')!;
    expect(activeElement.querySelector('[title="Mark as completed"]')).toBeInTheDocument();
    expect(activeElement.querySelector('[title="Delete goal"]')).toBeInTheDocument();
    expect(activeElement.querySelector('[title="Mark as incomplete"]')).not.toBeInTheDocument();
    expect(activeElement.querySelector('[title="Restore goal"]')).not.toBeInTheDocument();

    // Completed goal should have uncomplete and delete buttons
    const completedElement = screen.getByText('Completed').closest('div[class*="cursor-pointer"]')!;
    expect(completedElement.querySelector('[title="Mark as incomplete"]')).toBeInTheDocument();
    expect(completedElement.querySelector('[title="Delete goal"]')).toBeInTheDocument();
    expect(completedElement.querySelector('[title="Mark as completed"]')).not.toBeInTheDocument();

    // Archived goal should only have restore button
    const archivedElement = screen.getByText('Archived').closest('div[class*="cursor-pointer"]')!;
    expect(archivedElement.querySelector('[title="Restore goal"]')).toBeInTheDocument();
    expect(archivedElement.querySelector('[title="Delete goal"]')).not.toBeInTheDocument();
    expect(archivedElement.querySelector('[title="Mark as completed"]')).not.toBeInTheDocument();
  });

  it('should display all priority levels correctly', async () => {
    const goals = [
      createGoal({ name: 'High Priority', priority: 'high' }),
      createGoal({ name: 'Medium Priority', priority: 'medium' }),
      createGoal({ name: 'Low Priority', priority: 'low' })
    ];

    tauriMock.onCommand('get_goals', () => goals);

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('High Priority')).toBeInTheDocument();
    });

    const highBadge = screen.getAllByText('High')[0];
    expect(highBadge).toHaveClass('text-red-600');

    const mediumBadge = screen.getByText('Medium');
    expect(mediumBadge).toHaveClass('text-yellow-600');

    const lowBadge = screen.getByText('Low');
    expect(lowBadge).toHaveClass('text-green-600');
  });

  it('should handle unknown life area gracefully', async () => {
    const goal = createGoal({ 
      name: 'Orphan Goal',
      life_area_id: 'non-existent-id'
    });

    tauriMock.onCommand('get_goals', () => [goal]);

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Orphan Goal')).toBeInTheDocument();
    });

    expect(screen.getByText('Life Area: Unknown')).toBeInTheDocument();
  });

  it('should stop event propagation on button clicks', async () => {
    const goal = createGoal({ name: 'Test Goal' });
    
    tauriMock
      .onCommand('get_goals', () => [goal])
      .onCommand('complete_goal', () => ({ ...goal, completed_at: createTimestamp() }));

    const consoleSpy = vi.spyOn(console, 'log');

    render(() => <GoalList />);

    await waitFor(() => {
      expect(screen.getByText('Test Goal')).toBeInTheDocument();
    });

    // Click complete button - should not trigger selection
    const completeButton = screen.getByTitle('Mark as completed');
    fireEvent.click(completeButton);

    // Should not log selection
    expect(consoleSpy).not.toHaveBeenCalledWith('Selected goal:', goal.id);

    consoleSpy.mockRestore();
  });
});