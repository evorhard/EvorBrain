import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@solidjs/testing-library';
import { GoalsPage } from './GoalsPage';
import {
  TauriMock,
  createGoal,
  createLifeArea,
  createArchivedGoal,
  batchCreate,
} from '../../../test/utils';

describe('GoalsPage Component', () => {
  let tauriMock: TauriMock;
  const mockLifeAreas = [createLifeArea({ name: 'Work' }), createLifeArea({ name: 'Personal' })];

  beforeEach(() => {
    tauriMock = new TauriMock({ delay: 10 });
    // Always mock life areas since goal components use them
    tauriMock.onCommand('get_life_areas', () => mockLifeAreas);
  });

  afterEach(() => {
    tauriMock.reset();
  });

  it('should render page title and new goal button', async () => {
    tauriMock.onCommand('get_goals', () => []);

    render(() => <GoalsPage />);

    expect(screen.getByText('Goals', { selector: 'h1' })).toBeInTheDocument();

    const newGoalButton = screen.getByText('New Goal');
    expect(newGoalButton).toBeInTheDocument();
    expect(newGoalButton.querySelector('svg')).toBeInTheDocument(); // Plus icon
  });

  it('should render GoalList component', async () => {
    const goals = [createGoal({ name: 'Test Goal 1' }), createGoal({ name: 'Test Goal 2' })];

    tauriMock.onCommand('get_goals', () => goals);

    render(() => <GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Goal 1')).toBeInTheDocument();
      expect(screen.getByText('Test Goal 2')).toBeInTheDocument();
    });
  });

  it('should open create form when new goal button is clicked', async () => {
    tauriMock.onCommand('get_goals', () => []);

    render(() => <GoalsPage />);

    fireEvent.click(screen.getByText('New Goal'));

    await waitFor(() => {
      expect(screen.getByText('Create New Goal')).toBeInTheDocument();
      expect(screen.getByLabelText('Goal Name *')).toBeInTheDocument();
    });
  });

  it('should close form when creation is complete', async () => {
    tauriMock
      .onCommand('get_goals', () => [])
      .onCommand('create_goal', () => createGoal({ name: 'New Goal' }));

    render(() => <GoalsPage />);

    fireEvent.click(screen.getByText('New Goal'));

    await waitFor(() => {
      expect(screen.getByText('Create New Goal')).toBeInTheDocument();
    });

    // Fill and submit form
    fireEvent.input(screen.getByLabelText('Goal Name *'), {
      target: { value: 'Test Goal' },
    });
    fireEvent.change(screen.getByLabelText('Life Area *'), {
      target: { value: mockLifeAreas[0].id },
    });
    fireEvent.click(screen.getByText('Create Goal'));

    await waitFor(() => {
      expect(screen.queryByText('Create New Goal')).not.toBeInTheDocument();
    });
  });

  it('should show edit button when goal is selected', async () => {
    const goals = [createGoal({ name: 'Goal 1' }), createGoal({ name: 'Goal 2' })];

    tauriMock.onCommand('get_goals', () => goals);

    render(() => <GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('Goal 1')).toBeInTheDocument();
    });

    // Initially no edit button
    expect(screen.queryByText('Edit Selected')).not.toBeInTheDocument();

    // Select a goal
    const goal1Element = screen.getByText('Goal 1').closest('div[class*="cursor-pointer"]')!;
    fireEvent.click(goal1Element);

    // Edit button should appear
    await waitFor(() => {
      expect(screen.getByText('Edit Selected')).toBeInTheDocument();
    });
  });

  it('should not show edit button for archived goals', async () => {
    const goals = [createArchivedGoal({ name: 'Archived Goal' })];

    tauriMock.onCommand('get_goals', () => goals);

    render(() => <GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('Archived Goal')).toBeInTheDocument();
    });

    // Select the archived goal
    const goalElement = screen.getByText('Archived Goal').closest('div[class*="cursor-pointer"]')!;
    fireEvent.click(goalElement);

    // Edit button should not appear
    expect(screen.queryByText('Edit Selected')).not.toBeInTheDocument();
  });

  it('should open edit form when edit button is clicked', async () => {
    const goal = createGoal({
      name: 'Editable Goal',
      description: 'Original description',
      life_area_id: mockLifeAreas[0].id,
    });

    tauriMock.onCommand('get_goals', () => [goal]);

    render(() => <GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('Editable Goal')).toBeInTheDocument();
    });

    // Select the goal
    const goalElement = screen.getByText('Editable Goal').closest('div[class*="cursor-pointer"]')!;
    fireEvent.click(goalElement);

    // Click edit button
    await waitFor(() => {
      expect(screen.getByText('Edit Selected')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Edit Selected'));

    // Edit form should open with existing data
    await waitFor(() => {
      expect(screen.getByText('Edit Goal')).toBeInTheDocument();
      expect(screen.getByLabelText('Goal Name *')).toHaveValue('Editable Goal');
      expect(screen.getByLabelText('Description')).toHaveValue('Original description');
      expect(screen.getByText('Update Goal')).toBeInTheDocument();
    });
  });

  it('should handle form cancellation', async () => {
    tauriMock.onCommand('get_goals', () => []);

    render(() => <GoalsPage />);

    fireEvent.click(screen.getByText('New Goal'));

    await waitFor(() => {
      expect(screen.getByText('Create New Goal')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.queryByText('Create New Goal')).not.toBeInTheDocument();
    });
  });

  it('should handle modal close', async () => {
    tauriMock.onCommand('get_goals', () => []);

    render(() => <GoalsPage />);

    fireEvent.click(screen.getByText('New Goal'));

    await waitFor(() => {
      expect(screen.getByText('Create New Goal')).toBeInTheDocument();
    });

    // Find and click the close button in the modal
    const modal = screen.getByRole('dialog');
    const closeButton = within(modal).getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Create New Goal')).not.toBeInTheDocument();
    });
  });

  it('should handle multiple goals selection', async () => {
    const goals = batchCreate(createGoal, 3, (index) => ({
      name: `Goal ${index + 1}`,
    }));

    tauriMock.onCommand('get_goals', () => goals);

    render(() => <GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('Goal 1')).toBeInTheDocument();
    });

    // Select first goal
    const goal1 = screen.getByText('Goal 1').closest('div[class*="cursor-pointer"]')!;
    fireEvent.click(goal1);

    await waitFor(() => {
      expect(screen.getByText('Edit Selected')).toBeInTheDocument();
    });

    // Select second goal
    const goal2 = screen.getByText('Goal 2').closest('div[class*="cursor-pointer"]')!;
    fireEvent.click(goal2);

    // Edit button should still be visible
    expect(screen.getByText('Edit Selected')).toBeInTheDocument();

    // Click edit - should edit Goal 2
    fireEvent.click(screen.getByText('Edit Selected'));

    await waitFor(() => {
      expect(screen.getByLabelText('Goal Name *')).toHaveValue('Goal 2');
    });
  });

  it('should handle goal updates', async () => {
    const goal = createGoal({ name: 'Original Name' });
    const updatedGoal = { ...goal, name: 'Updated Name' };

    tauriMock.onCommand('get_goals', () => [goal]).onCommand('update_goal', () => updatedGoal);

    render(() => <GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('Original Name')).toBeInTheDocument();
    });

    // Select and edit
    const goalElement = screen.getByText('Original Name').closest('div[class*="cursor-pointer"]')!;
    fireEvent.click(goalElement);

    await waitFor(() => {
      expect(screen.getByText('Edit Selected')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Edit Selected'));

    // Update name
    await waitFor(() => {
      expect(screen.getByLabelText('Goal Name *')).toBeInTheDocument();
    });

    fireEvent.input(screen.getByLabelText('Goal Name *'), {
      target: { value: 'Updated Name' },
    });
    fireEvent.click(screen.getByText('Update Goal'));

    // Form should close
    await waitFor(() => {
      expect(screen.queryByText('Edit Goal')).not.toBeInTheDocument();
    });
  });

  it('should reset editing state when closing form', async () => {
    const goals = [
      createGoal({ name: 'Goal 1', description: 'Desc 1' }),
      createGoal({ name: 'Goal 2', description: 'Desc 2' }),
    ];

    tauriMock.onCommand('get_goals', () => goals);

    render(() => <GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('Goal 1')).toBeInTheDocument();
    });

    // Edit Goal 1
    const goal1 = screen.getByText('Goal 1').closest('div[class*="cursor-pointer"]')!;
    fireEvent.click(goal1);
    fireEvent.click(screen.getByText('Edit Selected'));

    await waitFor(() => {
      expect(screen.getByLabelText('Goal Name *')).toHaveValue('Goal 1');
    });

    // Cancel edit
    fireEvent.click(screen.getByText('Cancel'));

    // Open create form - should be empty
    fireEvent.click(screen.getByText('New Goal'));

    await waitFor(() => {
      expect(screen.getByText('Create New Goal')).toBeInTheDocument();
      expect(screen.getByLabelText('Goal Name *')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
    });
  });
});
