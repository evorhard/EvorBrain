import '@testing-library/jest-dom';

// Mock Tauri API for tests
const mockInvoke = vi.fn();

if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__TAURI__ = {
    tauri: {
      invoke: mockInvoke,
    },
  };
}

// Reset mocks before each test
beforeEach(() => {
  mockInvoke.mockReset();
});

// Export for use in tests
export { mockInvoke };