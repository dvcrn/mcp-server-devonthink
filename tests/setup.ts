/**
 * Global test setup configuration
 * Runs before all test suites
 */

import { vi } from 'vitest';

// Global test configuration
beforeEach(() => {
  // Clear all timers before each test
  vi.clearAllTimers();
});

afterEach(() => {
  // Reset all mocks after each test
  vi.clearAllMocks();
});

// Global test utilities
global.TEST_TIMEOUT = 5000;
global.MOCK_UUID = '123e4567-e89b-12d3-a456-426614174000';
global.MOCK_RECORD_ID = 12345;

// Suppress console logs during tests unless explicitly needed
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.warn = originalWarn;
  console.error = originalError;
});