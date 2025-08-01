/**
 * Test utilities for EvorBrain
 *
 * This module provides a comprehensive set of testing utilities to make
 * writing tests easier and more consistent across the codebase.
 */

// Re-export all utilities
export * from './tauri-mocks';
export * from './render-helpers';
export * from './data-factories';
export * from './custom-matchers';

// Import custom matchers to register them
import './custom-matchers';
