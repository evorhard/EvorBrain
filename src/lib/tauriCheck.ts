// Extend window type for Tauri
declare global {
  interface Window {
    __TAURI__?: unknown;
  }
}

/**
 * Check if we're running in a Tauri environment
 */
export function isTauri(): boolean {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
}

// Initialize mock store from localStorage or defaults
const MOCK_STORE_KEY = 'evorbrain_mock_data';

function loadMockStore() {
  const stored = localStorage.getItem(MOCK_STORE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored mock data:', e);
    }
  }
  
  // Return empty data if nothing stored - no pre-populated mock data
  return {
    lifeAreas: [],
    goals: [],
  };
}

function saveMockStore() {
  localStorage.setItem(MOCK_STORE_KEY, JSON.stringify(mockStore));
}

// Store for mock data persistence across calls
let mockStore = loadMockStore();

/**
 * Mock invoke function for development in browser
 */
export async function mockInvoke(cmd: string, args?: unknown): Promise<unknown> {
  // Always load fresh data from localStorage
  mockStore = loadMockStore();
  
  // Return mock data based on command
  switch (cmd) {
    case 'get_life_areas':
      return mockStore.lifeAreas;
    case 'create_life_area': {
      // Create a new mock life area with the provided data
      const createArgs = args as {
        request?: { name: string; description?: string; color?: string; icon?: string };
      };
      const request = createArgs?.request;
      const newLifeArea = {
        id: `mock-${Date.now()}`,
        name: request?.name || 'New Life Area',
        description: request?.description || null,
        color: request?.color || null,
        icon: request?.icon || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      mockStore.lifeAreas.push(newLifeArea);
      saveMockStore();
      return newLifeArea;
    }
    case 'update_life_area': {
      // Update mock life area
      const updateArgs = args as {
        request?: { id: string; name: string; description?: string; color?: string; icon?: string };
      };
      const updateRequest = updateArgs?.request;
      const lifeAreaIndex = mockStore.lifeAreas.findIndex(la => la.id === updateRequest?.id);
      if (lifeAreaIndex !== -1) {
        const lifeArea = mockStore.lifeAreas[lifeAreaIndex];
        lifeArea.name = updateRequest?.name || lifeArea.name;
        lifeArea.description = updateRequest?.description !== undefined ? updateRequest.description : lifeArea.description;
        lifeArea.color = updateRequest?.color !== undefined ? updateRequest.color : lifeArea.color;
        lifeArea.icon = updateRequest?.icon !== undefined ? updateRequest.icon : lifeArea.icon;
        lifeArea.updated_at = new Date().toISOString();
        saveMockStore();
        return lifeArea;
      }
      throw new Error('Life area not found');
    }
    case 'restore_life_area': {
      // Restore functionality removed for MVP - only permanent deletion
      throw new Error('Restore functionality not available in MVP');
    }
    case 'get_goals':
      return mockStore.goals;
    case 'get_goals_by_life_area': {
      const goalArgs = args as { life_area_id?: string };
      return mockStore.goals.filter(goal => goal.life_area_id === goalArgs?.life_area_id);
    }
    case 'create_goal': {
      const createGoalArgs = args as {
        request?: { 
          life_area_id: string;
          title: string; 
          description?: string; 
          target_date?: string; 
        };
      };
      const request = createGoalArgs?.request;
      const newGoal = {
        id: `mock-goal-${Date.now()}`,
        life_area_id: request?.life_area_id || 'mock-life-area-1',
        title: request?.title || 'New Goal',
        description: request?.description || null,
        target_date: request?.target_date || null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
      mockStore.goals.push(newGoal);
      saveMockStore();
      return newGoal;
    }
    case 'delete_goal': {
      // Permanently delete the goal
      const deleteArgs = args as { id?: string };
      const goalIndex = mockStore.goals.findIndex(g => g.id === deleteArgs?.id);
      if (goalIndex !== -1) {
        mockStore.goals.splice(goalIndex, 1);
        saveMockStore();
      }
      return undefined;
    }
    case 'get_projects':
      return [];
    case 'get_tasks':
      return [];
    case 'get_notes':
      return [];
    case 'delete_life_area': {
      // Permanently delete the life area
      const deleteArgs = args as { id?: string };
      const lifeAreaIndex = mockStore.lifeAreas.findIndex(la => la.id === deleteArgs?.id);
      if (lifeAreaIndex !== -1) {
        // Remove the life area from the array
        mockStore.lifeAreas.splice(lifeAreaIndex, 1);
        // Also delete any goals in this life area
        mockStore.goals = mockStore.goals.filter(goal => goal.life_area_id !== deleteArgs?.id);
        saveMockStore();
      }
      return undefined;
    }
    default:
      console.warn(`Mock not implemented for command: ${cmd}`);
      return null;
  }
}
