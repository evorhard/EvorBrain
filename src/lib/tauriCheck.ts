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
export async function mockInvoke(cmd: string, _args?: unknown): Promise<unknown> {
  // Return mock data based on command
  switch (cmd) {
    case 'get_life_areas':
      return [];
    case 'get_goals':
      return [];
    case 'get_projects':
      return [];
    case 'get_tasks':
      return [];
    case 'get_notes':
      return [];
    default:
      return null;
  }
}