import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'solid-js';
import { TestApiClient } from './test-double';
import { createLifeAreaStoreFactory } from '../../stores/lifeAreaStore.factory';
import { createLifeArea } from '../../test/utils';

describe('API Abstraction Layer Integration', () => {
  let testApi: TestApiClient;
  let dispose: () => void;

  beforeEach(() => {
    testApi = new TestApiClient();
    testApi.testHelpers.clear();
  });

  afterEach(() => {
    dispose?.();
  });

  it('should work with store factory pattern', async () => {
    // Add test data
    const lifeAreas = [
      createLifeArea({ name: 'Work', description: 'Professional life' }),
      createLifeArea({ name: 'Personal', description: 'Personal development' }),
    ];
    
    for (const area of lifeAreas) {
      testApi.testHelpers.addLifeArea(area);
    }

    // Create store with test API
    const store = createRoot((d) => {
      dispose = d;
      return createLifeAreaStoreFactory(testApi);
    });

    // Fetch data
    await store.actions.fetchAll();

    // Verify store has the data
    expect(store.state.items).toHaveLength(2);
    expect(store.state.items[0].name).toBe('Work');
    expect(store.state.items[1].name).toBe('Personal');
  });

  it('should handle create operations', async () => {
    const store = createRoot((d) => {
      dispose = d;
      return createLifeAreaStoreFactory(testApi);
    });

    // Create a new life area
    const created = await store.actions.create({
      name: 'Health',
      description: 'Physical and mental health',
      icon: '💪',
      color: '#22c55e',
    });

    // Verify it was created
    expect(created.name).toBe('Health');
    expect(created.icon).toBe('💪');
    expect(created.color).toBe('#22c55e');
    expect(store.state.items).toContainEqual(created);

    // Verify it's in the test API data
    const allAreas = await testApi.lifeArea.getAll();
    expect(allAreas).toHaveLength(1);
    expect(allAreas[0]).toEqual(created);
  });

  it('should handle update operations', async () => {
    // Add initial data
    const initial = createLifeArea({ id: 'test-id', name: 'Work' });
    testApi.testHelpers.addLifeArea(initial);

    const store = createRoot((d) => {
      dispose = d;
      return createLifeAreaStoreFactory(testApi);
    });

    await store.actions.fetchAll();

    // Update the life area
    const updated = await store.actions.update('test-id', {
      name: 'Career',
      description: 'Professional development',
    });

    // Verify update
    expect(updated.name).toBe('Career');
    expect(updated.description).toBe('Professional development');
    expect(store.state.items[0]).toEqual(updated);
  });

  it('should handle cascading archives', async () => {
    // Set up hierarchy: Life Area -> Goal -> Project -> Task
    const lifeArea = createLifeArea({ id: 'la-1', name: 'Work' });
    const goal = {
      id: 'goal-1',
      life_area_id: 'la-1',
      title: 'Complete Project',
      description: null,
      target_date: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived_at: null,
    };
    const project = {
      id: 'proj-1',
      goal_id: 'goal-1',
      name: 'Q1 Deliverables',
      description: null,
      status: 'in_progress' as const,
      due_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived_at: null,
    };

    testApi.testHelpers.addLifeArea(lifeArea);
    testApi.testHelpers.addGoal(goal);
    testApi.testHelpers.addProject(project);

    // Delete (archive) the life area
    await testApi.lifeArea.delete('la-1');

    // Verify cascading archives
    const goals = await testApi.goal.getAll();
    const projects = await testApi.project.getAll();

    expect(goals[0].archived_at).toBeTruthy();
    expect(projects[0].archived_at).toBeTruthy();
  });

  it('should handle search operations', async () => {
    // Add notes with searchable content
    const notes = [
      {
        id: 'note-1',
        title: 'Meeting Notes',
        content: 'Discussed new project requirements',
        task_id: null,
        project_id: null,
        goal_id: null,
        life_area_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      },
      {
        id: 'note-2',
        title: 'Ideas',
        content: 'Brainstorming session outcomes',
        task_id: null,
        project_id: null,
        goal_id: null,
        life_area_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      },
    ];

    for (const note of notes) {
      testApi.testHelpers.addNote(note);
    }

    // Search for notes
    const results = await testApi.note.search('project');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Meeting Notes');
  });

  it('should maintain separate data for different API instances', async () => {
    const api1 = new TestApiClient();
    const api2 = new TestApiClient();

    // Add data to first API
    await api1.lifeArea.create({ name: 'API1 Area' });

    // Add data to second API
    await api2.lifeArea.create({ name: 'API2 Area' });

    // Verify data is separate
    const api1Areas = await api1.lifeArea.getAll();
    const api2Areas = await api2.lifeArea.getAll();

    expect(api1Areas).toHaveLength(1);
    expect(api1Areas[0].name).toBe('API1 Area');

    expect(api2Areas).toHaveLength(1);
    expect(api2Areas[0].name).toBe('API2 Area');
  });
});