/**
 * Simplified tests for chatWithKnowledgeBase tool
 * Focus on core functionality only - removed brittle tests that validate
 * implementation details rather than business logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the JXA execution to bypass AI service checks
vi.mock('@/applescript/execute.js', () => ({
  executeJxa: vi.fn()
}));

import { chatWithKnowledgeBaseTool } from '@/tools/ai/chatWithKnowledgeBase.js';
import { executeJxa } from '@/applescript/execute.js';

describe('chatWithKnowledgeBase Tool', () => {
  const mockExecuteJxa = vi.mocked(executeJxa);
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tool Structure', () => {
    it('should have valid MCP tool structure', () => {
      expect(chatWithKnowledgeBaseTool.name).toBe('chat_with_knowledge_base');
      expect(chatWithKnowledgeBaseTool.description).toBeTruthy();
      expect(chatWithKnowledgeBaseTool.inputSchema).toBeTruthy();
      expect(typeof chatWithKnowledgeBaseTool.run).toBe('function');
    });
  });

  describe('Core Functionality', () => {
    it('should work with valid input', async () => {
      // First call is the AI service check - return success
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        devonthinkRunning: true,
        aiEnginesConfigured: ['ChatGPT']
      });

      // Second call is the actual chat query
      const mockResponse = {
        success: true,
        response: 'AI response based on documents',
        sourceDocuments: [{
          uuid: '12345678-1234-1234-1234-123456789abc',
          id: 12345,
          name: 'Test.md',
          location: '/Test.md',
          type: 'markdown'
        }]
      };
      
      mockExecuteJxa.mockResolvedValueOnce(mockResponse);
      
      const input = {
        query: 'What do you know?',
        engine: 'ChatGPT' as const
      };
      
      const result = await chatWithKnowledgeBaseTool.run(input);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.response).toBeTruthy();
        expect(result.sourceDocuments).toBeDefined();
      }
    });

    it('should handle missing required fields', async () => {
      const result = await chatWithKnowledgeBaseTool.run({} as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should validate input bounds', async () => {
      const result = await chatWithKnowledgeBaseTool.run({
        query: '',
        engine: 'ChatGPT' as const
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });






  describe('Error Handling', () => {
    it('should handle service unavailable', async () => {
      // AI service check fails
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        devonthinkRunning: false,
        aiEnginesConfigured: [],
        error: 'DEVONthink is not running'
      });

      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle JXA execution errors', async () => {
      // AI service check fails with exception
      mockExecuteJxa.mockRejectedValueOnce(new Error('Script failed'));

      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Script failed');
    });

    it('should handle DEVONthink errors', async () => {
      // First call: AI service check succeeds
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        devonthinkRunning: true,
        aiEnginesConfigured: ['ChatGPT']
      });

      // Second call: chat query fails
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'DEVONthink is not running'
      });

      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });



});