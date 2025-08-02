import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { renderWithProviders } from '../../test/utils';
import { createSignal, For, Show, type Component } from 'solid-js';
import type { LifeArea } from '../../types/models';

// UI-focused component for testing without store dependencies
const LifeAreaUI: Component<{
  items: LifeArea[];
  isLoading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
}> = (props) => (
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold">Life Areas</h2>
      <button
        onClick={props.onRefresh}
        class="bg-primary hover:bg-primary-600 rounded px-3 py-1 text-sm text-white transition-colors"
        disabled={props.isLoading}
      >
        {props.isLoading ? 'Loading...' : 'Refresh'}
      </button>
    </div>

    <Show when={props.error}>
      <div class="rounded bg-red-50 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        {props.error}
      </div>
    </Show>

    <Show when={!props.isLoading && props.items.length === 0}>
      <p class="text-content-secondary">No life areas yet. Create your first one!</p>
    </Show>

    <div class="grid gap-3">
      <For each={props.items}>
        {(area) => (
          <div
            class="bg-surface shadow-card cursor-pointer rounded-lg p-4 transition-all"
            classList={{
              'ring-2 ring-primary': props.selectedId === area.id,
              'hover:shadow-card-hover': props.selectedId !== area.id,
            }}
            onClick={() => props.onSelect(area.id)}
            data-testid={`life-area-${area.id}`}
          >
            <div class="flex items-start gap-3">
              {area.icon && (
                <span class="text-2xl" style={{ color: area.color || undefined }}>
                  {area.icon}
                </span>
              )}
              <div class="flex-1">
                <h3 class="text-content font-semibold">{area.name}</h3>
                {area.description && (
                  <p class="text-content-secondary mt-1 text-sm">{area.description}</p>
                )}
                <Show when={area.archived_at}>
                  <span class="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    Archived
                  </span>
                </Show>
              </div>
            </div>
          </div>
        )}
      </For>
    </div>
  </div>
);

describe('Life Area UI Component', () => {
  const createMockLifeArea = (overrides?: Partial<LifeArea>): LifeArea => ({
    id: 'test-id',
    name: 'Test Area',
    description: null,
    color: null,
    icon: null,
    position: 0,
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  });

  it('should render life areas correctly', () => {
    const mockAreas = [
      createMockLifeArea({ id: '1', name: 'Work', description: 'Professional life' }),
      createMockLifeArea({ id: '2', name: 'Personal', description: 'Personal development' }),
    ];

    const onSelect = vi.fn();
    const onRefresh = vi.fn();

    renderWithProviders(() => (
      <LifeAreaUI
        items={mockAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={onSelect}
        onRefresh={onRefresh}
      />
    ));

    expect(screen.getByText('Life Areas')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Professional life')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Personal development')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    renderWithProviders(() => (
      <LifeAreaUI
        items={[]}
        isLoading={true}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onRefresh={() => {}}
      />
    ));

    const refreshButton = screen.getByText('Loading...');
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toBeDisabled();
  });

  it('should show empty state', () => {
    renderWithProviders(() => (
      <LifeAreaUI
        items={[]}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onRefresh={() => {}}
      />
    ));

    expect(screen.getByText('No life areas yet. Create your first one!')).toBeInTheDocument();
  });

  it('should show error state', () => {
    renderWithProviders(() => (
      <LifeAreaUI
        items={[]}
        isLoading={false}
        error="Failed to load life areas"
        selectedId={null}
        onSelect={() => {}}
        onRefresh={() => {}}
      />
    ));

    const errorText = screen.getByText('Failed to load life areas');
    expect(errorText).toBeInTheDocument();
    // Check that the error is within an element with the error styling
    const errorContainer = errorText.closest('.bg-red-50');
    expect(errorContainer).toBeInTheDocument();
  });

  it('should handle area selection', () => {
    const mockAreas = [
      createMockLifeArea({ id: '1', name: 'Work' }),
      createMockLifeArea({ id: '2', name: 'Personal' }),
    ];

    const onSelect = vi.fn();
    const [selectedId, setSelectedId] = createSignal<string | null>(null);

    renderWithProviders(() => (
      <LifeAreaUI
        items={mockAreas}
        isLoading={false}
        error={null}
        selectedId={selectedId()}
        onSelect={(id) => {
          onSelect(id);
          setSelectedId(id);
        }}
        onRefresh={() => {}}
      />
    ));

    // Click on Work area
    const workArea = screen.getByTestId('life-area-1');
    fireEvent.click(workArea);

    expect(onSelect).toHaveBeenCalledWith('1');
    expect(onSelect).toHaveBeenCalledTimes(1);

    // Work area should have selection ring after reactive update
    waitFor(() => {
      expect(workArea).toHaveClass('ring-2');
      expect(workArea).toHaveClass('ring-primary');
    });
  });

  it('should handle refresh button click', () => {
    const onRefresh = vi.fn();

    renderWithProviders(() => (
      <LifeAreaUI
        items={[]}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onRefresh={onRefresh}
      />
    ));

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should display archived areas with badge', () => {
    const mockAreas = [
      createMockLifeArea({ id: '1', name: 'Active Area' }),
      createMockLifeArea({
        id: '2',
        name: 'Archived Area',
        archived_at: new Date().toISOString(),
      }),
    ];

    renderWithProviders(() => (
      <LifeAreaUI
        items={mockAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onRefresh={() => {}}
      />
    ));

    expect(screen.getByText('Active Area')).toBeInTheDocument();
    expect(screen.getByText('Archived Area')).toBeInTheDocument();

    const archivedBadges = screen.getAllByText('Archived');
    expect(archivedBadges).toHaveLength(1);
    expect(archivedBadges[0]).toHaveClass('bg-gray-100');
  });

  it('should render icons with custom colors', () => {
    const mockAreas = [
      createMockLifeArea({
        id: '1',
        name: 'Health',
        icon: '🏃',
        color: '#10b981',
      }),
    ];

    renderWithProviders(() => (
      <LifeAreaUI
        items={mockAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onRefresh={() => {}}
      />
    ));

    const icon = screen.getByText('🏃');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({ color: '#10b981' });
  });

  it('should handle multiple life areas', () => {
    const mockAreas = Array.from({ length: 10 }, (_, i) =>
      createMockLifeArea({
        id: `${i + 1}`,
        name: `Life Area ${i + 1}`,
        description: `Description for area ${i + 1}`,
      }),
    );

    renderWithProviders(() => (
      <LifeAreaUI
        items={mockAreas}
        isLoading={false}
        error={null}
        selectedId={null}
        onSelect={() => {}}
        onRefresh={() => {}}
      />
    ));

    // All areas should be visible
    mockAreas.forEach((area, i) => {
      expect(screen.getByText(`Life Area ${i + 1}`)).toBeInTheDocument();
      expect(screen.getByText(`Description for area ${i + 1}`)).toBeInTheDocument();
    });
  });

  it('should apply hover effects correctly', () => {
    const mockAreas = [createMockLifeArea({ id: '1', name: 'Test Area' })];

    const [selectedId, setSelectedId] = createSignal<string | null>(null);

    renderWithProviders(() => (
      <LifeAreaUI
        items={mockAreas}
        isLoading={false}
        error={null}
        selectedId={selectedId()}
        onSelect={setSelectedId}
        onRefresh={() => {}}
      />
    ));

    const area = screen.getByTestId('life-area-1');

    // Should have hover effect when not selected
    expect(area).toHaveClass('hover:shadow-card-hover');
    expect(area).not.toHaveClass('ring-2');

    // Select the area
    fireEvent.click(area);

    // After selection, hover effect should be removed
    waitFor(() => {
      expect(area).not.toHaveClass('hover:shadow-card-hover');
      expect(area).toHaveClass('ring-2');
    });
  });
});
