/**
 * Shared API Layer
 * 
 * Common API utilities and Tauri IPC wrappers
 */

import { apiLogger } from '../lib/logger';

// Check if we're in a Tauri environment
declare global {
  interface Window {
    __TAURI__?: {
      invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
    };
  }
}

// Development mode flag
const isDevelopment = import.meta.env.DEV;

// Types for mock data
interface MockLifeArea {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface MockData {
  life_areas: MockLifeArea[];
}

// Mock data for development
const mockData: MockData = {
  life_areas: [
    {
      id: '1',
      name: 'Health & Fitness',
      description: 'Physical and mental wellness',
      color: '#10B981',
      icon: '💪',
      orderIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Career & Work',
      description: 'Professional development and work goals',
      color: '#3B82F6',
      icon: '💼',
      orderIndex: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Relationships',
      description: 'Family, friends, and social connections',
      color: '#EF4444',
      icon: '❤️',
      orderIndex: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

// Mock command implementations for development
const mockCommands: Record<string, (args?: Record<string, unknown>) => Promise<unknown>> = {
  get_life_areas: () => {
    return Promise.resolve(mockData.life_areas);
  },
  
  create_life_area: (args) => {
    if (!args) return Promise.reject(new Error('No arguments provided'));
    const { dto } = args;
    const newLifeArea: MockLifeArea = {
      ...(dto as MockLifeArea),
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orderIndex: mockData.life_areas.length
    };
    mockData.life_areas.push(newLifeArea);
    return Promise.resolve(newLifeArea);
  },
  
  update_life_area: (args) => {
    if (!args) return Promise.reject(new Error('No arguments provided'));
    const { id, updates } = args;
    const index = mockData.life_areas.findIndex((la) => la.id === id);
    if (index !== -1) {
      mockData.life_areas[index] = {
        ...mockData.life_areas[index],
        ...(updates as Partial<MockLifeArea>),
        updatedAt: new Date().toISOString()
      } as MockLifeArea;
      return Promise.resolve(mockData.life_areas[index]);
    }
    return Promise.reject(new Error('Life area not found'));
  },
  
  delete_life_area: (args) => {
    if (!args) return Promise.reject(new Error('No arguments provided'));
    const { id } = args;
    const index = mockData.life_areas.findIndex((la) => la.id === id);
    if (index !== -1) {
      mockData.life_areas.splice(index, 1);
      return Promise.resolve();
    }
    return Promise.reject(new Error('Life area not found'));
  }
};

// Type-safe invoke wrapper
export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    // Check if Tauri is available
    if (!window.__TAURI__) {
      // In development, use mock commands
      if (isDevelopment && mockCommands[command]) {
        apiLogger.warn(`Using mock implementation for command: ${command}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return mockCommands[command](args) as Promise<T>;
      }
      
      throw new Error('Tauri API not available. Are you running in a Tauri window?');
    }
    
    // Import invoke dynamically to avoid errors during SSR/development
    const { invoke } = await import('@tauri-apps/api/core');
    
    try {
      return await invoke<T>(command, args);
    } catch (tauriError) {
      // In development, try falling back to mock if the command isn't implemented
      if (isDevelopment && mockCommands[command]) {
        if (tauriError instanceof Error && 
            (tauriError.message.includes('not found') || 
             tauriError.message.includes('command') ||
             tauriError.message.includes('Command'))) {
          apiLogger.warn(`Tauri command '${command}' not implemented, falling back to mock`);
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 100));
          return mockCommands[command](args) as Promise<T>;
        }
      }
      
      // Re-throw the error if we can't handle it
      throw tauriError;
    }
  } catch (error) {
    // Log more detailed error information
    if (error instanceof Error) {
      apiLogger.error(`Error invoking command ${command}:`, {
        message: error.message,
        command,
        args,
        error
      });
    } else {
      apiLogger.error(`Error invoking command ${command}:`, error);
    }
    throw error;
  }
}

// Export other API utilities as they are created