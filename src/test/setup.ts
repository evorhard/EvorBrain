import { vi } from 'vitest';
import '@testing-library/jest-dom';
import './utils/custom-matchers';

// Ensure we're in a DOM environment
if (typeof window === 'undefined') {
  throw new Error('Test environment is not configured correctly. Please ensure jsdom is set up.');
}

// Mock Tauri API for tests
const mockInvoke = vi.fn();

// @ts-ignore
window.__TAURI__ = {
  tauri: {
    invoke: mockInvoke,
  },
};

// Reset mocks before each test
beforeEach(() => {
  mockInvoke.mockReset();
});

// Export for use in tests
export { mockInvoke };