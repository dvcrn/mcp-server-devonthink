/**
 * Simplified tests for extractKeywords tool
 * Focus on core functionality only - removed brittle tests that validate
 * mock script calls and implementation details
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the JXA execution to bypass AI service checks
vi.mock('@/applescript/execute.js', () => ({
  executeJxa: vi.fn()
}));

import { extractKeywordsTool } from '@/tools/ai/extractKeywords.js';
import { executeJxa } from '@/applescript/execute.js';

describe('extractKeywords Tool', () => {
  const mockExecuteJxa = vi.mocked(executeJxa);
  const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const MOCK_KEYWORDS = ['keyword1', 'keyword2', 'keyword3'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tool Structure', () => {
    it('should have valid MCP tool structure', () => {
      expect(extractKeywordsTool.name).toBe('extract_keywords');
      expect(extractKeywordsTool.description).toBeTruthy();
      expect(extractKeywordsTool.inputSchema).toBeTruthy();
      expect(typeof extractKeywordsTool.run).toBe('function');
    });
  });

  describe('Core Functionality', () => {
    it('should work with valid UUID input', async () => {
      // First call is the AI service check - return success
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        devonthinkRunning: true,
        aiEnginesConfigured: ['ChatGPT']
      });

      // Second call is the actual keyword extraction
      const mockResponse = {
        success: true,
        keywords: MOCK_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Test.pdf',
          type: 'pdf',
          location: '/Test.pdf'
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const input = { uuid: VALID_UUID };
      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.keywords).toEqual(MOCK_KEYWORDS);
      }
    });

    it('should work with recordId and database', async () => {
      // First call is the AI service check - return success
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        devonthinkRunning: true,
        aiEnginesConfigured: ['ChatGPT']
      });

      // Second call is the actual keyword extraction
      const mockResponse = {
        success: true,
        keywords: MOCK_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Test.md',
          type: 'markdown',
          location: '/Test.md'
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const input = {
        recordId: 12345,
        databaseName: 'Test Database'
      };
      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.keywords).toEqual(MOCK_KEYWORDS);
    });

    it('should handle missing required fields', async () => {
      const result = await extractKeywordsTool.run({} as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Must provide either uuid, recordId with databaseName, or recordPath');
    });

    it('should validate input bounds', async () => {
      const result = await extractKeywordsTool.run({
        uuid: VALID_UUID,
        maxKeywords: 0
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Must extract at least 1 keyword');
    });
  });





  describe('Error Handling', () => {
    it('should handle DEVONthink not running', async () => {
      // AI service check fails
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        devonthinkRunning: false,
        aiEnginesConfigured: [],
        error: 'DEVONthink is not running'
      });

      const input = { uuid: VALID_UUID };
      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle record not found', async () => {
      // First call: AI service check succeeds
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        devonthinkRunning: true,
        aiEnginesConfigured: ['ChatGPT']
      });

      // Second call: record not found
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Record not found'
      });

      const input = { uuid: VALID_UUID };
      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle JXA execution errors', async () => {
      // AI service check fails with exception
      mockExecuteJxa.mockRejectedValueOnce(new Error('Script failed'));

      const input = { uuid: VALID_UUID };
      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Script failed');
    });
  });




});