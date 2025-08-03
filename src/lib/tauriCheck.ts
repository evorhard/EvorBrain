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

/**
 * Mock invoke function for development in browser
 */
export async function mockInvoke(cmd: string, args?: unknown): Promise<unknown> {
  // Return mock data based on command
  switch (cmd) {
    case 'get_life_areas':
      return [
        {
          id: 'mock-life-area-1',
          name: 'Mock Life Area',
          description: 'A mock life area for testing',
          color: '#3B82F6',
          icon: '🏠',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          archived_at: null,
        },
      ];
    case 'create_life_area': {
      // Create a new mock life area with the provided data
      const createArgs = args as {
        request?: { name: string; description?: string; color?: string; icon?: string };
      };
      const request = createArgs?.request;
      return {
        id: `mock-${Date.now()}`,
        name: request?.name || 'New Life Area',
        description: request?.description || null,
        color: request?.color || null,
        icon: request?.icon || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
    }
    case 'update_life_area': {
      // Update mock life area
      const updateArgs = args as {
        request?: { id: string; name: string; description?: string; color?: string; icon?: string };
      };
      const updateRequest = updateArgs?.request;
      return {
        id: updateRequest?.id || 'mock-id',
        name: updateRequest?.name || 'Updated Life Area',
        description: updateRequest?.description || null,
        color: updateRequest?.color || null,
        icon: updateRequest?.icon || null,
        created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        updated_at: new Date().toISOString(),
        archived_at: null,
      };
    }
    case 'restore_life_area': {
      // Restore mock life area
      const restoreArgs = args as { id?: string };
      return {
        id: restoreArgs?.id || 'mock-id',
        name: 'Restored Life Area',
        description: 'This life area was restored',
        color: '#10B981',
        icon: '♻️',
        created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        updated_at: new Date().toISOString(),
        archived_at: null, // No longer archived
      };
    }
    case 'get_goals':
      return [];
    case 'get_projects':
      return [];
    case 'get_tasks':
      return [];
    case 'get_notes':
      return [];
    case 'delete_life_area':
      // Delete doesn't return anything
      return undefined;
    default:
      console.warn(`Mock not implemented for command: ${cmd}`);
      return null;
  }
}
