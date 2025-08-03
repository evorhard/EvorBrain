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
    projects: [],
    tasks: [],
  };
}

function saveMockStore() {
  localStorage.setItem(MOCK_STORE_KEY, JSON.stringify(mockStore));
}

// Store for mock data persistence across calls
let mockStore = loadMockStore();

/**
 * Clear all mock data in development environment
 * Can be called from browser console: window.clearAllData()
 */
export function clearAllData() {
  if (!isTauri()) {
    localStorage.removeItem(MOCK_STORE_KEY);
    mockStore = {
      lifeAreas: [],
      goals: [],
      projects: [],
      tasks: [],
    };
    console.info('✅ All development data cleared!');
    console.info('Reload the page to see the changes.');
    return true;
  } else {
    console.warn('This command only works in development mode (browser).');
    console.info('For Tauri app, use the reset_database command.');
    return false;
  }
}

// Make it available globally in development
if (typeof window !== 'undefined' && !isTauri()) {
  (window as unknown as { clearAllData: typeof clearAllData }).clearAllData = clearAllData;
}

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
      return mockStore.projects || [];
    case 'get_projects_by_goal': {
      const goalArgs = args as { goal_id: string };
      return (mockStore.projects || []).filter(p => p.goal_id === goalArgs.goal_id);
    }
    case 'create_project': {
      const createArgs = args as { request: { title: string; goal_id: string; description?: string; status?: string } };
      const newProject = {
        id: `proj_${Date.now()}`,
        title: createArgs.request.title,
        goal_id: createArgs.request.goal_id,
        description: createArgs.request.description,
        status: createArgs.request.status || 'planning',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (!mockStore.projects) {
        mockStore.projects = [];
      }
      mockStore.projects.push(newProject);
      saveMockStore();
      return newProject;
    }
    case 'update_project': {
      const updateArgs = args as { request: { id: string; title: string; goal_id: string; description?: string; status: string } };
      if (mockStore.projects) {
        const projectIndex = mockStore.projects.findIndex(p => p.id === updateArgs.request.id);
        if (projectIndex !== -1) {
          mockStore.projects[projectIndex] = {
            ...mockStore.projects[projectIndex],
            ...updateArgs.request,
            updated_at: new Date().toISOString(),
          };
          saveMockStore();
          return mockStore.projects[projectIndex];
        }
      }
      throw new Error('Project not found');
    }
    case 'update_project_status': {
      const statusArgs = args as { id: string; status: string };
      if (mockStore.projects) {
        const projectIndex = mockStore.projects.findIndex(p => p.id === statusArgs.id);
        if (projectIndex !== -1) {
          mockStore.projects[projectIndex] = {
            ...mockStore.projects[projectIndex],
            status: statusArgs.status,
            updated_at: new Date().toISOString(),
            completed_at: statusArgs.status === 'completed' ? new Date().toISOString() : undefined,
          };
          saveMockStore();
          return mockStore.projects[projectIndex];
        }
      }
      throw new Error('Project not found');
    }
    case 'delete_project': {
      const deleteArgs = args as { id: string };
      if (mockStore.projects) {
        const projectIndex = mockStore.projects.findIndex(p => p.id === deleteArgs.id);
        if (projectIndex !== -1) {
          mockStore.projects.splice(projectIndex, 1);
          saveMockStore();
        }
      }
      return undefined;
    }
    case 'get_tasks':
      return mockStore.tasks || [];
    case 'get_tasks_by_project': {
      const projectArgs = args as { project_id: string };
      return (mockStore.tasks || []).filter(t => t.project_id === projectArgs.project_id);
    }
    case 'get_todays_tasks':
      // Return tasks due today or overdue
      const today = new Date().toISOString().split('T')[0];
      return (mockStore.tasks || []).filter(t => {
        if (!t.due_date) return false;
        const taskDate = t.due_date.split('T')[0];
        return taskDate <= today && !t.completed_at;
      });
    case 'get_subtasks': {
      const subtaskArgs = args as { parent_task_id: string };
      return (mockStore.tasks || []).filter(t => t.parent_task_id === subtaskArgs.parent_task_id);
    }
    case 'create_task_with_subtasks': {
      const createArgs = args as { 
        request: {
          parent_task: Record<string, unknown>;
          subtasks: Array<Record<string, unknown>>;
        }
      };
      // For now, just create the parent task
      const parentTask = {
        id: `task_${Date.now()}`,
        ...createArgs.request.parent_task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (!mockStore.tasks) {
        mockStore.tasks = [];
      }
      mockStore.tasks.push(parentTask);
      
      // Create subtasks if any
      if (createArgs.request.subtasks && createArgs.request.subtasks.length > 0) {
        createArgs.request.subtasks.forEach((subtask, index) => {
          const newSubtask = {
            id: `task_${Date.now()}_${index}`,
            ...subtask,
            parent_task_id: parentTask.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          mockStore.tasks.push(newSubtask);
        });
      }
      
      saveMockStore();
      return parentTask;
    }
    case 'create_task': {
      const createArgs = args as { 
        title: string; 
        project_id?: string; 
        parent_task_id?: string;
        description?: string; 
        priority?: string;
        due_date?: string;
      };
      const newTask = {
        id: `task_${Date.now()}`,
        title: createArgs.title,
        project_id: createArgs.project_id,
        parent_task_id: createArgs.parent_task_id,
        description: createArgs.description,
        priority: createArgs.priority || 'medium',
        due_date: createArgs.due_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (!mockStore.tasks) {
        mockStore.tasks = [];
      }
      mockStore.tasks.push(newTask);
      saveMockStore();
      return newTask;
    }
    case 'update_task': {
      const updateArgs = args as { 
        id: string; 
        title: string; 
        description?: string; 
        priority: string;
        due_date?: string;
      };
      if (mockStore.tasks) {
        const taskIndex = mockStore.tasks.findIndex(t => t.id === updateArgs.id);
        if (taskIndex !== -1) {
          mockStore.tasks[taskIndex] = {
            ...mockStore.tasks[taskIndex],
            ...updateArgs,
            updated_at: new Date().toISOString(),
          };
          saveMockStore();
          return mockStore.tasks[taskIndex];
        }
      }
      throw new Error('Task not found');
    }
    case 'complete_task': {
      const completeArgs = args as { id: string };
      if (mockStore.tasks) {
        const taskIndex = mockStore.tasks.findIndex(t => t.id === completeArgs.id);
        if (taskIndex !== -1) {
          mockStore.tasks[taskIndex] = {
            ...mockStore.tasks[taskIndex],
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          saveMockStore();
          return mockStore.tasks[taskIndex];
        }
      }
      throw new Error('Task not found');
    }
    case 'uncomplete_task': {
      const uncompleteArgs = args as { id: string };
      if (mockStore.tasks) {
        const taskIndex = mockStore.tasks.findIndex(t => t.id === uncompleteArgs.id);
        if (taskIndex !== -1) {
          mockStore.tasks[taskIndex] = {
            ...mockStore.tasks[taskIndex],
            completed_at: undefined,
            updated_at: new Date().toISOString(),
          };
          saveMockStore();
          return mockStore.tasks[taskIndex];
        }
      }
      throw new Error('Task not found');
    }
    case 'delete_task': {
      const deleteArgs = args as { id: string };
      if (mockStore.tasks) {
        const taskIndex = mockStore.tasks.findIndex(t => t.id === deleteArgs.id);
        if (taskIndex !== -1) {
          mockStore.tasks.splice(taskIndex, 1);
          saveMockStore();
        }
      }
      return undefined;
    }
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
