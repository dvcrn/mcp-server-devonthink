/**
 * Test Helper Utilities
 * Common functions and patterns for AI tool testing
 */

import { vi } from 'vitest';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

// Test data generators
export function generateTestUUID(): string {
  return 'test-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
}

export function generateTestRecordId(): number {
  return Math.floor(Math.random() * 900000) + 100000;
}

/**
 * Creates a spy for monitoring function calls during tests
 */
export function createTestSpy<T extends (...args: any[]) => any>(fn: T): vi.MockedFunction<T> {
  return vi.fn(fn);
}

/**
 * Validates that a tool follows the expected structure
 */
export function validateToolStructure(tool: Tool): void {
  expect(tool).toHaveProperty('name');
  expect(tool).toHaveProperty('description');
  expect(tool).toHaveProperty('inputSchema');
  expect(tool).toHaveProperty('run');
  
  expect(typeof tool.name).toBe('string');
  expect(typeof tool.description).toBe('string');
  expect(typeof tool.inputSchema).toBe('object');
  expect(typeof tool.run).toBe('function');
  
  expect(tool.name.length).toBeGreaterThan(0);
  expect(tool.description.length).toBeGreaterThan(0);
}

/**
 * Tests that a tool properly validates its input schema
 */
export async function testToolInputValidation(
  tool: Tool, 
  validInput: any, 
  invalidInputs: any[]
): Promise<void> {
  // Test valid input doesn't throw
  await expect(tool.run(validInput)).resolves.not.toThrow();
  
  // Test invalid inputs
  for (const invalidInput of invalidInputs) {
    await expect(tool.run(invalidInput)).rejects.toThrow();
  }
}

/**
 * Tests that a tool handles errors gracefully
 */
export async function testToolErrorHandling(
  tool: Tool,
  input: any,
  mockError: string
): Promise<void> {
  const result = await tool.run(input);
  
  expect(result).toHaveProperty('success', false);
  expect(result).toHaveProperty('error');
  expect(result.error).toContain(mockError);
}

/**
 * Tests that a tool returns success response with expected structure
 */
export async function testToolSuccessResponse(
  tool: Tool,
  input: any,
  expectedProperties: string[]
): Promise<void> {
  const result = await tool.run(input);
  
  expect(result).toHaveProperty('success', true);
  
  for (const prop of expectedProperties) {
    expect(result).toHaveProperty(prop);
  }
}

/**
 * Creates a timer mock for testing timeout scenarios
 */
export function createTimeoutMock(delay: number = 1000): vi.MockedFunction<any> {
  return vi.fn().mockImplementation(() => {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  });
}

/**
 * Creates a rejected promise mock for testing error scenarios
 */
export function createErrorMock(errorMessage: string): vi.MockedFunction<any> {
  return vi.fn().mockRejectedValue(new Error(errorMessage));
}

/**
 * Validates XSS prevention in input handling
 */
export function validateXSSPrevention(processFunction: (input: string) => string): void {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '"><script>alert("XSS")</script>',
    "'; DROP TABLE users; --",
    '<img src=x onerror=alert("XSS")>',
    '${alert("XSS")}'
  ];
  
  for (const payload of xssPayloads) {
    const result = processFunction(payload);
    
    // Should not contain the original script tags or dangerous content
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('javascript:');
    expect(result).not.toContain('onerror=');
    expect(result).not.toContain('DROP TABLE');
    expect(result).not.toMatch(/\$\{.*\}/);
  }
}

/**
 * Tests performance within acceptable limits
 */
export async function testPerformance(
  operation: () => Promise<any>,
  maxDurationMs: number
): Promise<void> {
  const startTime = performance.now();
  
  await operation();
  
  const duration = performance.now() - startTime;
  expect(duration).toBeLessThan(maxDurationMs);
}

/**
 * Tests that concurrent operations don't interfere with each other
 */
export async function testConcurrentOperations(
  operation: () => Promise<any>,
  concurrency: number = 5
): Promise<void> {
  const promises = Array(concurrency).fill(null).map(() => operation());
  
  const results = await Promise.all(promises);
  
  // All operations should succeed
  expect(results).toHaveLength(concurrency);
  results.forEach(result => {
    expect(result).toHaveProperty('success', true);
  });
}

/**
 * Validates that required environment variables or conditions are met
 */
export function validateTestEnvironment(): void {
  // Check Node.js environment
  expect(typeof process).toBe('object');
  expect(typeof process.env).toBe('object');
  
  // Check test globals
  expect(global.TEST_TIMEOUT).toBeDefined();
  expect(global.MOCK_UUID).toBeDefined();
  expect(global.MOCK_RECORD_ID).toBeDefined();
}

/**
 * Creates a test suite structure for AI tools
 */
export function createAIToolTestSuite(
  toolName: string,
  tool: Tool,
  testScenarios: {
    validInputs: any[];
    invalidInputs: any[];
    errorScenarios: Array<{ input: any; expectedError: string }>;
  }
) {
  return describe(`${toolName} AI Tool`, () => {
    beforeEach(() => {
      validateTestEnvironment();
    });
    
    describe('Tool Structure', () => {
      it('should have valid tool structure', () => {
        validateToolStructure(tool);
      });
      
      it('should have AI-specific naming convention', () => {
        expect(tool.name).toMatch(/^[a-z_]+$/);
        expect(tool.description).toContain('AI');
      });
    });
    
    describe('Input Validation', () => {
      it('should accept valid inputs', async () => {
        for (const validInput of testScenarios.validInputs) {
          await expect(tool.run(validInput)).resolves.not.toThrow();
        }
      });
      
      it('should reject invalid inputs', async () => {
        for (const invalidInput of testScenarios.invalidInputs) {
          await expect(tool.run(invalidInput)).rejects.toThrow();
        }
      });
    });
    
    describe('Error Handling', () => {
      it('should handle error scenarios gracefully', async () => {
        for (const scenario of testScenarios.errorScenarios) {
          await testToolErrorHandling(tool, scenario.input, scenario.expectedError);
        }
      });
    });
    
    describe('Performance', () => {
      it('should complete within reasonable time', async () => {
        const validInput = testScenarios.validInputs[0];
        await testPerformance(() => tool.run(validInput), 5000);
      });
    });
  });
}

/**
 * Common test patterns for AI validation
 */
export const AI_TEST_PATTERNS = {
  VALID_UUID: '123e4567-e89b-12d3-a456-426614174000',
  INVALID_UUIDS: [
    '', 
    'not-a-uuid', 
    '123e4567-e89b-12d3-a456', 
    null, 
    undefined
  ],
  VALID_PROMPTS: [
    'Summarize this document',
    'What is the main topic?',
    'Generate a response based on this content'
  ],
  INVALID_PROMPTS: [
    '',
    null,
    undefined,
    'a'.repeat(10000), // Too long
    '<script>alert("xss")</script>' // XSS attempt
  ],
  XSS_PAYLOADS: [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '"><script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '${alert("XSS")}'
  ]
};

export default {
  generateTestUUID,
  generateTestRecordId,
  createTestSpy,
  validateToolStructure,
  testToolInputValidation,
  testToolErrorHandling,
  testToolSuccessResponse,
  createTimeoutMock,
  createErrorMock,
  validateXSSPrevention,
  testPerformance,
  testConcurrentOperations,
  validateTestEnvironment,
  createAIToolTestSuite,
  AI_TEST_PATTERNS
};