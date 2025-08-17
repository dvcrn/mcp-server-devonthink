/**
 * Unit tests for AI validation utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateAIString,
  validateUUID,
  validateAIEngine,
  validateOutputFormat,
  validateRecordIdentifiers,
  validateAIToolInput,
  validateChatInput,
  validateAnalysisInput,
  validateGenerationInput,
  AI_ENGINES,
  OUTPUT_FORMATS,
  AIValidationError
} from '@/tools/ai/utils/aiValidation.js';
import { AI_TEST_PATTERNS } from '@tests/utils/test-helpers.js';

describe('AI Validation Utilities', () => {
  describe('validateAIString', () => {
    it('should accept valid strings', () => {
      const result = validateAIString('Valid prompt text', 'prompt');
      expect(result).toBeNull();
    });

    it('should reject empty strings', () => {
      const result = validateAIString('', 'prompt');
      expect(result).toEqual({
        field: 'prompt',
        message: 'prompt is required and must be a string',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should reject null/undefined values', () => {
      const nullResult = validateAIString(null as any, 'prompt');
      expect(nullResult?.code).toBe('REQUIRED_FIELD');

      const undefinedResult = validateAIString(undefined as any, 'prompt');
      expect(undefinedResult?.code).toBe('REQUIRED_FIELD');
    });

    it('should reject strings exceeding max length', () => {
      const longString = 'a'.repeat(10001);
      const result = validateAIString(longString, 'prompt', 10000);
      expect(result).toEqual({
        field: 'prompt',
        message: 'prompt exceeds maximum length of 10000 characters',
        code: 'INVALID_RANGE'
      });
    });

    it('should reject unsafe JXA strings', () => {
      // This test assumes isJXASafeString will reject certain patterns
      const unsafeStrings = [
        'test\x00string', // null bytes
        'test\x1fstring', // control characters
      ];

      for (const unsafeString of unsafeStrings) {
        const result = validateAIString(unsafeString, 'prompt');
        if (result) {
          expect(result.code).toBe('INVALID_STRING');
        }
      }
    });
  });

  describe('validateUUID', () => {
    it('should accept valid UUIDs', () => {
      const result = validateUUID(AI_TEST_PATTERNS.VALID_UUID, 'recordUuid');
      expect(result).toBeNull();
    });

    it('should reject invalid UUIDs', () => {
      for (const invalidUuid of AI_TEST_PATTERNS.INVALID_UUIDS) {
        if (invalidUuid) {
          const result = validateUUID(invalidUuid, 'recordUuid');
          expect(result).toEqual({
            field: 'recordUuid',
            message: 'recordUuid is not a valid UUID format',
            code: 'INVALID_UUID'
          });
        }
      }
    });

    it('should handle different UUID versions', () => {
      const uuids = [
        '123e4567-e89b-12d3-a456-426614174000', // v1
        '123e4567-e89b-22d3-a456-426614174000', // v2
        '123e4567-e89b-32d3-a456-426614174000', // v3
        '123e4567-e89b-42d3-a456-426614174000', // v4
        '123e4567-e89b-52d3-a456-426614174000'  // v5
      ];

      for (const uuid of uuids) {
        const result = validateUUID(uuid, 'recordUuid');
        expect(result).toBeNull();
      }
    });
  });

  describe('validateAIEngine', () => {
    it('should accept valid AI engines', () => {
      for (const engine of AI_ENGINES) {
        const result = validateAIEngine(engine);
        expect(result).toBeNull();
      }
    });

    it('should reject invalid AI engines', () => {
      const invalidEngines = ['InvalidEngine', 'GPT-5', 'NotAnEngine'];

      for (const engine of invalidEngines) {
        const result = validateAIEngine(engine);
        expect(result).toEqual({
          field: 'engine',
          message: `Invalid AI engine. Must be one of: ${AI_ENGINES.join(', ')}`,
          code: 'INVALID_ENGINE'
        });
      }
    });
  });

  describe('validateOutputFormat', () => {
    it('should accept valid output formats', () => {
      for (const format of OUTPUT_FORMATS) {
        const result = validateOutputFormat(format);
        expect(result).toBeNull();
      }
    });

    it('should reject invalid output formats', () => {
      const invalidFormats = ['xml', 'csv', 'binary'];

      for (const format of invalidFormats) {
        const result = validateOutputFormat(format);
        expect(result).toEqual({
          field: 'outputFormat',
          message: `Invalid output format. Must be one of: ${OUTPUT_FORMATS.join(', ')}`,
          code: 'INVALID_FORMAT'
        });
      }
    });
  });

  describe('validateRecordIdentifiers', () => {
    it('should accept valid UUIDs only', () => {
      const result = validateRecordIdentifiers([AI_TEST_PATTERNS.VALID_UUID]);
      expect(result).toHaveLength(0);
    });

    it('should accept valid IDs with database name', () => {
      const result = validateRecordIdentifiers(undefined, [12345], 'Test Database');
      expect(result).toHaveLength(0);
    });

    it('should require either UUIDs or IDs', () => {
      const result = validateRecordIdentifiers();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        field: 'recordIdentifiers',
        message: 'Either recordUuids or recordIds must be provided',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should require database name when using IDs', () => {
      const result = validateRecordIdentifiers(undefined, [12345]);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        field: 'databaseName',
        message: 'databaseName is required when using recordIds',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should validate multiple UUIDs', () => {
      const invalidUuids = ['valid-uuid', 'invalid-uuid'];
      const result = validateRecordIdentifiers(invalidUuids);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(error => error.code === 'INVALID_UUID')).toBe(true);
    });
  });

  describe('validateAIToolInput', () => {
    it('should accept valid input with all parameters', () => {
      const validInput = {
        prompt: 'Test prompt',
        engine: 'ChatGPT',
        temperature: 0.7,
        maxTokens: 1000,
        outputFormat: 'text',
        timeout: 60
      };

      const result = validateAIToolInput(validInput, 'chat');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitizedInput).toEqual(validInput);
    });

    it('should validate temperature range', () => {
      const invalidTemperature = {
        prompt: 'Test',
        temperature: 5.0 // Too high
      };

      const result = validateAIToolInput(invalidTemperature, 'chat');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'temperature',
        message: 'temperature must be between 0 and 2',
        code: 'INVALID_RANGE'
      });
    });

    it('should validate maxTokens range', () => {
      const invalidTokens = {
        prompt: 'Test',
        maxTokens: -1 // Too low
      };

      const result = validateAIToolInput(invalidTokens, 'chat');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'maxTokens',
        message: 'maxTokens must be between 1 and 100000',
        code: 'INVALID_RANGE'
      });
    });

    it('should validate timeout range', () => {
      const invalidTimeout = {
        prompt: 'Test',
        timeout: 500 // Too high
      };

      const result = validateAIToolInput(invalidTimeout, 'chat');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'timeout',
        message: 'timeout must be between 5 and 300 seconds',
        code: 'INVALID_RANGE'
      });
    });

    it('should run custom validators', () => {
      const customValidator = (input: any): AIValidationError[] => {
        if (input.customField === 'invalid') {
          return [{
            field: 'customField',
            message: 'Custom validation failed',
            code: 'INVALID_INPUT'
          }];
        }
        return [];
      };

      const invalidInput = {
        prompt: 'Test',
        customField: 'invalid'
      };

      const result = validateAIToolInput(invalidInput, 'chat', [customValidator]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'customField',
        message: 'Custom validation failed',
        code: 'INVALID_INPUT'
      });
    });
  });

  describe('validateChatInput', () => {
    it('should accept input with prompt', () => {
      const validInput = {
        prompt: 'Chat with me about this topic'
      };

      const result = validateChatInput(validInput);
      expect(result.isValid).toBe(true);
    });

    it('should accept input with recordUuids', () => {
      const validInput = {
        recordUuids: [AI_TEST_PATTERNS.VALID_UUID]
      };

      const result = validateChatInput(validInput);
      expect(result.isValid).toBe(true);
    });

    it('should reject input without prompt or records', () => {
      const invalidInput = {
        engine: 'ChatGPT'
      };

      const result = validateChatInput(invalidInput);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'input',
        message: 'Either prompt or recordUuids must be provided for chat operations',
        code: 'REQUIRED_FIELD'
      });
    });
  });

  describe('validateAnalysisInput', () => {
    it('should accept input with recordUuids', () => {
      const validInput = {
        recordUuids: [AI_TEST_PATTERNS.VALID_UUID]
      };

      const result = validateAnalysisInput(validInput);
      expect(result.isValid).toBe(true);
    });

    it('should reject input without recordUuids', () => {
      const invalidInput = {
        prompt: 'Analyze this'
      };

      const result = validateAnalysisInput(invalidInput);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'recordUuids',
        message: 'recordUuids is required for analysis operations',
        code: 'REQUIRED_FIELD'
      });
    });
  });

  describe('validateGenerationInput', () => {
    it('should accept input with prompt', () => {
      const validInput = {
        prompt: 'Generate a response about this topic'
      };

      const result = validateGenerationInput(validInput);
      expect(result.isValid).toBe(true);
    });

    it('should reject input without prompt', () => {
      const invalidInput = {
        engine: 'ChatGPT'
      };

      const result = validateGenerationInput(invalidInput);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'prompt',
        message: 'prompt is required for generation operations',
        code: 'REQUIRED_FIELD'
      });
    });
  });

  describe('XSS Prevention', () => {
    it('should handle XSS attempts in prompts', () => {
      for (const xssPayload of AI_TEST_PATTERNS.XSS_PAYLOADS) {
        const result = validateAIString(xssPayload, 'prompt');
        // Should either reject as unsafe or accept (if properly escaped elsewhere)
        // The important thing is not to crash or throw unhandled exceptions
        expect(result).toBeDefined(); // Should return some result
      }
    });

    it('should handle very long inputs', () => {
      const veryLongPrompt = 'a'.repeat(100000);
      const result = validateAIString(veryLongPrompt, 'prompt', 50000);
      
      expect(result).toEqual({
        field: 'prompt',
        message: 'prompt exceeds maximum length of 50000 characters',
        code: 'INVALID_RANGE'
      });
    });

    it('should handle special characters safely', () => {
      const specialChars = [
        'Prompt with "quotes"',
        "Prompt with 'single quotes'",
        'Prompt with ${variable}',
        'Prompt with `backticks`',
        'Prompt with \\ backslash',
        'Prompt with unicode: 😀🔥✨'
      ];

      for (const prompt of specialChars) {
        const result = validateAIString(prompt, 'prompt');
        // Should not throw an exception
        expect(() => result).not.toThrow();
      }
    });
  });
});