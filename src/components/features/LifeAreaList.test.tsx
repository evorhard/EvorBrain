import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { LifeAreaList } from './LifeAreaList';
import { 
  TauriMock, 
  createLifeArea,
  createArchivedLifeArea,
  batchCreate
} from '../../test/utils';

describe('LifeAreaList Component', () => {
  let tauriMock: TauriMock;

  beforeEach(() => {
    tauriMock = new TauriMock({ delay: 10 });
  });

  afterEach(() => {
    tauriMock.reset();
  });

  it('should render loading state initially', async () => {
    tauriMock.onCommand('get_life_areas', () => new Promise(() => {})); // Never resolves
    
    render(() => <LifeAreaList />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should fetch and display life areas on mount', async () => {
    const lifeAreas = [
      createLifeArea({ name: 'Work', description: 'Professional life' }),
      createLifeArea({ name: 'Personal', description: 'Personal development' }),
      createLifeArea({ name: 'Health', icon: '💪', color: '#22c55e' })
    ];

    tauriMock.onCommand('get_life_areas', () => lifeAreas);

    render(() => <LifeAreaList />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    // Verify all life areas are displayed
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Professional life')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Personal development')).toBeInTheDocument();
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('💪')).toBeInTheDocument();

    // Verify API was called
    tauriMock.expectCommand('get_life_areas').toHaveBeenCalledTimes(1);
  });

  it('should display empty state when no life areas exist', async () => {
    tauriMock.onCommand('get_life_areas', () => []);

    render(() => <LifeAreaList />);

    await waitFor(() => {
      expect(screen.getByText('No life areas yet. Create your first one!')).toBeInTheDocument();
    });
  });

  it('should display error state when fetch fails', async () => {
    tauriMock.failCommand('get_life_areas', 'Database connection failed');

    render(() => <LifeAreaList />);

    await waitFor(() => {
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });

    // Error should be displayed in red background
    const errorElement = screen.getByText('Database connection failed').parentElement;
    expect(errorElement).toHaveClass('bg-red-50');
  });

  it('should handle refresh button click', async () => {
    const initialAreas = [createLifeArea({ name: 'Initial' })];
    const refreshedAreas = [
      createLifeArea({ name: 'Initial' }),
      createLifeArea({ name: 'New Area' })
    ];

    let callCount = 0;
    tauriMock.onCommand('get_life_areas', () => {
      callCount++;
      return callCount === 1 ? initialAreas : refreshedAreas;
    });

    render(() => <LifeAreaList />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Initial')).toBeInTheDocument();
    });

    // Click refresh
    fireEvent.click(screen.getByText('Refresh'));

    // Wait for new data
    await waitFor(() => {
      expect(screen.getByText('New Area')).toBeInTheDocument();
    });

    tauriMock.expectCommand('get_life_areas').toHaveBeenCalledTimes(2);
  });

  it('should disable refresh button while loading', async () => {
    tauriMock.onCommand('get_life_areas', () => 
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    render(() => <LifeAreaList />);

    const refreshButton = screen.getByText('Loading...');
    expect(refreshButton).toBeDisabled();
  });

  it('should handle area selection', async () => {
    const lifeAreas = [
      createLifeArea({ name: 'Work' }),
      createLifeArea({ name: 'Personal' })
    ];

    tauriMock.onCommand('get_life_areas', () => lifeAreas);

    const consoleSpy = vi.spyOn(console, 'log');

    render(() => <LifeAreaList />);

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    // Click on Work area
    const workArea = screen.getByText('Work').closest('div[class*="cursor-pointer"]')!;
    fireEvent.click(workArea);

    // Should have selection ring
    expect(workArea).toHaveClass('ring-2');
    expect(workArea).toHaveClass('ring-primary');

    // Console should log the selection
    expect(consoleSpy).toHaveBeenCalledWith('Selected life area:', lifeAreas[0].id);

    // Click on Personal area
    const personalArea = screen.getByText('Personal').closest('div[class*="cursor-pointer"]')!;
    fireEvent.click(personalArea);

    // Work should no longer be selected
    expect(workArea).not.toHaveClass('ring-2');
    expect(personalArea).toHaveClass('ring-2');

    consoleSpy.mockRestore();
  });

  it('should display archived areas with badge', async () => {
    const lifeAreas = [
      createLifeArea({ name: 'Active Area' }),
      createArchivedLifeArea({ name: 'Archived Area' })
    ];

    tauriMock.onCommand('get_life_areas', () => lifeAreas);

    render(() => <LifeAreaList />);

    await waitFor(() => {
      expect(screen.getByText('Active Area')).toBeInTheDocument();
    });

    // Archived area should have archived badge
    expect(screen.getByText('Archived Area')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
    
    const archivedBadge = screen.getByText('Archived');
    expect(archivedBadge).toHaveClass('bg-gray-100');
    expect(archivedBadge).toHaveClass('text-gray-600');
  });

  it('should render icons with custom colors', async () => {
    const lifeAreas = [
      createLifeArea({ 
        name: 'Health',
        icon: '🏃',
        color: '#10b981'
      })
    ];

    tauriMock.onCommand('get_life_areas', () => lifeAreas);

    render(() => <LifeAreaList />);

    await waitFor(() => {
      expect(screen.getByText('Health')).toBeInTheDocument();
    });

    const icon = screen.getByText('🏃');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({ color: '#10b981' });
  });

  it('should handle many life areas', async () => {
    const lifeAreas = batchCreate(createLifeArea, 10, (index) => ({
      name: `Life Area ${index + 1}`,
      description: `Description for area ${index + 1}`
    }));

    tauriMock.onCommand('get_life_areas', () => lifeAreas);

    render(() => <LifeAreaList />);

    await waitFor(() => {
      expect(screen.getByText('Life Area 1')).toBeInTheDocument();
    });

    // All areas should be visible
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByText(`Life Area ${i}`)).toBeInTheDocument();
      expect(screen.getByText(`Description for area ${i}`)).toBeInTheDocument();
    }
  });

  it('should have proper hover effects', async () => {
    const lifeAreas = [createLifeArea({ name: 'Test Area' })];

    tauriMock.onCommand('get_life_areas', () => lifeAreas);

    render(() => <LifeAreaList />);

    await waitFor(() => {
      expect(screen.getByText('Test Area')).toBeInTheDocument();
    });

    const area = screen.getByText('Test Area').closest('div[class*="cursor-pointer"]')!;
    
    // Should have hover shadow class when not selected
    expect(area).toHaveClass('hover:shadow-card-hover');
    
    // After selection, hover effect should be removed
    fireEvent.click(area);
    expect(area).not.toHaveClass('hover:shadow-card-hover');
  });
});