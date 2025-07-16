import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Tauri API for tests
Object.defineProperty(window, "__TAURI__", {
  value: {
    invoke: vi.fn(),
    event: {
      listen: vi.fn(),
      emit: vi.fn(),
      once: vi.fn(),
    },
    window: {
      appWindow: {
        show: vi.fn(),
        hide: vi.fn(),
        close: vi.fn(),
        minimize: vi.fn(),
        maximize: vi.fn(),
        unmaximize: vi.fn(),
        isMaximized: vi.fn(() => Promise.resolve(false)),
      },
    },
  },
  writable: true,
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds: readonly number[] = [];

  disconnect(): void {
    // Mock implementation
  }
  observe(): void {
    // Mock implementation
  }
  unobserve(): void {
    // Mock implementation
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  disconnect(): void {
    // Mock implementation
  }
  observe(): void {
    // Mock implementation
  }
  unobserve(): void {
    // Mock implementation
  }
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
