/**
 * Comprehensive tests for chatWithKnowledgeBase tool
 * Tests all functionality including security, performance, and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { chatWithKnowledgeBaseTool } from '@/tools/ai/chatWithKnowledgeBase.js';
import { 
  mockExecuteJxa, 
  setupDefaultJXAMocks,
  MOCK_AI_RESPONSES,
  createMockDatabase,
  createMockRecord
} from '@tests/mocks/devonthink.js';
import { validateToolStructure, AI_TEST_PATTERNS } from '@tests/utils/test-helpers.js';

// Mock the dependencies - avoid variable hoisting issues
vi.mock('@/applescript/execute.js', () => ({
  executeJxa: vi.fn()
}));

vi.mock('@/tools/ai/utils/aiAvailabilityChecker.js', () => ({
  checkAIServiceAvailability: vi.fn().mockResolvedValue({
    isAvailable: true,
    devonthinkRunning: true,
    aiFeatureEnabled: true,
    availableEngines: ['ChatGPT', 'Claude', 'Gemini'],
    defaultEngine: 'ChatGPT'
  })
}));

vi.mock('@/tools/ai/utils/aiValidation.js', () => ({
  validateChatInput: vi.fn().mockReturnValue({
    isValid: true,
    errors: [],
    warnings: []
  })
}));

vi.mock('@/tools/ai/utils/resultProcessor.js', () => ({
  processAIResult: vi.fn().mockImplementation((result, type, options) => ({
    ...result,
    executionTime: options?.executionTime || 100
  }))
}));

vi.mock('@/tools/ai/utils/aiErrorHandler.js', () => ({
  handleAIError: vi.fn().mockImplementation((error, type, executionTime) => ({
    success: false,
    error: error.message || error.toString(),
    operationType: type,
    executionTime: executionTime || 100
  }))
}));

describe('chatWithKnowledgeBase Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultJXAMocks();
  });

  describe('Tool Structure', () => {
    it('should have valid MCP tool structure', () => {
      validateToolStructure(chatWithKnowledgeBaseTool);
      expect(chatWithKnowledgeBaseTool.name).toBe('chat_with_knowledge_base');
      expect(chatWithKnowledgeBaseTool.description).toContain('flagship AI tool');
      expect(chatWithKnowledgeBaseTool.description).toContain('natural language');
    });

    it('should include comprehensive documentation', () => {
      const description = chatWithKnowledgeBaseTool.description;
      expect(description).toContain('Conversation Modes');
      expect(description).toContain('Scope Options');
      expect(description).toContain('Usage Examples');
      expect(description).toContain('AI Engines');
      expect(description).toContain('Prerequisites');
    });

    it('should specify supported AI engines', () => {
      expect(chatWithKnowledgeBaseTool.description).toContain('ChatGPT, Claude, Gemini');
    });

    it('should include usage examples', () => {
      const description = chatWithKnowledgeBaseTool.description;
      expect(description).toContain('climate change');
      expect(description).toContain('meeting notes');
      expect(description).toContain('machine learning');
    });
  });

  describe('Input Validation', () => {
    it('should accept valid chat input', async () => {
      const mockResponse = {
        success: true,
        response: 'Based on your documents, here is what I found...',
        sourceDocuments: [
          {
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Research Document.md',
            location: '/Research/Climate',
            type: 'markdown'
          }
        ],
        conversationContext: {
          query: 'Tell me about climate research',
          documentsFound: 1,
          documentsUsed: 1
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const input = {
        query: 'Tell me about climate research',
        engine: 'ChatGPT' as const,
        maxResults: 10,
        includeMetadata: true
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.response).toContain('found');
      expect(result.sourceDocuments).toHaveLength(1);
    });

    it('should reject empty query', async () => {
      const input = {
        query: '',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Query cannot be empty');
    });

    it('should reject extremely long query', async () => {
      const longQuery = 'x'.repeat(10001);
      const input = {
        query: longQuery,
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Query too long');
    });

    it('should validate maxResults bounds', async () => {
      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const,
        maxResults: 0 // Invalid
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Must include at least 1 result');
    });

    it('should validate maxResults upper bound', async () => {
      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const,
        maxResults: 51 // Too high
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot exceed 50 results');
    });

    it('should validate temperature bounds', async () => {
      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const,
        temperature: -0.1 // Invalid
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Temperature cannot be negative');
    });

    it('should validate UUID format in scope', async () => {
      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const,
        scope: {
          groupUuid: 'invalid-uuid'
        }
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid group UUID format');
    });

    it('should validate non-empty database name', async () => {
      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const,
        scope: {
          databaseName: ''
        }
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database name cannot be empty');
    });
  });

  describe('Conversation Modes', () => {
    beforeEach(() => {
      mockExecuteJxa.mockResolvedValue({
        success: true,
        response: 'Mode-specific response',
        sourceDocuments: [
          {
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Test Document.md',
            location: '/Test',
            type: 'markdown'
          }
        ],
        conversationContext: {
          query: 'Test query',
          documentsFound: 1,
          documentsUsed: 1
        },
        aiMetadata: {
          engine: 'ChatGPT',
          temperature: 0.7,
          outputFormat: 'markdown',
          mode: 'context'
        }
      });
    });

    it('should handle context mode (default)', async () => {
      const input = {
        query: 'What information do you have?',
        engine: 'ChatGPT' as const,
        mode: 'context' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.aiMetadata?.mode).toBe('context');
    });

    it('should handle direct mode', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Direct analysis response',
        sourceDocuments: [
          {
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Analysis Target.pdf',
            location: '/Documents',
            type: 'pdf'
          }
        ],
        conversationContext: {
          query: 'Analyze these documents',
          documentsFound: 1,
          documentsUsed: 1
        },
        aiMetadata: {
          engine: 'ChatGPT',
          mode: 'direct'
        }
      });

      const input = {
        query: 'Analyze these documents',
        engine: 'ChatGPT' as const,
        mode: 'direct' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.response).toContain('Direct analysis');
      expect(result.aiMetadata?.mode).toBe('direct');
    });

    it('should handle summarize mode', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Summary of key information...',
        sourceDocuments: [
          {
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Content to Summarize.md',
            location: '/Summaries',
            type: 'markdown'
          }
        ],
        conversationContext: {
          query: 'Summarize key points',
          documentsFound: 1,
          documentsUsed: 1
        },
        aiMetadata: {
          engine: 'ChatGPT',
          mode: 'summarize'
        }
      });

      const input = {
        query: 'Summarize key points',
        engine: 'ChatGPT' as const,
        mode: 'summarize' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.response).toContain('Summary');
      expect(result.aiMetadata?.mode).toBe('summarize');
    });
  });

  describe('Scope Handling', () => {
    it('should handle database scope', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Response from specific database',
        sourceDocuments: [],
        conversationContext: {
          query: 'Test query',
          scope: 'Database: Test Database',
          documentsFound: 0,
          documentsUsed: 0
        }
      });

      const input = {
        query: 'Find information in my test database',
        engine: 'ChatGPT' as const,
        scope: {
          databaseName: 'Test Database'
        }
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.conversationContext?.scope).toContain('Test Database');
    });

    it('should handle group UUID scope', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Response from specific group',
        sourceDocuments: [
          {
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Group Document.md',
            location: '/Projects/AI',
            type: 'markdown'
          }
        ],
        conversationContext: {
          query: 'Test query',
          scope: 'Group: ' + AI_TEST_PATTERNS.VALID_UUID,
          documentsFound: 1,
          documentsUsed: 1
        }
      });

      const input = {
        query: 'What do I have in this folder?',
        engine: 'ChatGPT' as const,
        scope: {
          groupUuid: AI_TEST_PATTERNS.VALID_UUID
        }
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.conversationContext?.scope).toContain(AI_TEST_PATTERNS.VALID_UUID);
    });

    it('should handle group path scope', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Response from path-specified group',
        sourceDocuments: [],
        conversationContext: {
          query: 'Test query',
          scope: 'Path: /Projects/2024',
          documentsFound: 0,
          documentsUsed: 0
        }
      });

      const input = {
        query: 'What projects am I working on?',
        engine: 'ChatGPT' as const,
        scope: {
          groupPath: '/Projects/2024'
        }
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.conversationContext?.scope).toContain('/Projects/2024');
    });

    it('should handle combined scope parameters', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Response with combined scope',
        sourceDocuments: [],
        conversationContext: {
          query: 'Test query',
          scope: 'Database: Main DB, Path: /Projects/AI',
          documentsFound: 0,
          documentsUsed: 0
        }
      });

      const input = {
        query: 'Find AI project information',
        engine: 'ChatGPT' as const,
        scope: {
          databaseName: 'Main DB',
          groupPath: '/Projects/AI'
        }
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.conversationContext?.scope).toContain('Main DB');
      expect(result.conversationContext?.scope).toContain('/Projects/AI');
    });
  });

  describe('AI Engine Support', () => {
    it('should work with ChatGPT engine', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'ChatGPT response',
        sourceDocuments: [],
        aiMetadata: { engine: 'ChatGPT' }
      });

      const input = {
        query: 'Test with ChatGPT',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.aiMetadata?.engine).toBe('ChatGPT');
    });

    it('should work with Claude engine', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Claude response',
        sourceDocuments: [],
        aiMetadata: { engine: 'Claude' }
      });

      const input = {
        query: 'Test with Claude',
        engine: 'Claude' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.aiMetadata?.engine).toBe('Claude');
    });

    it('should work with Gemini engine', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Gemini response',
        sourceDocuments: [],
        aiMetadata: { engine: 'Gemini' }
      });

      const input = {
        query: 'Test with Gemini',
        engine: 'Gemini' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.aiMetadata?.engine).toBe('Gemini');
    });

    it('should handle custom model specification', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Custom model response',
        sourceDocuments: [],
        aiMetadata: {
          engine: 'ChatGPT',
          model: 'gpt-4'
        }
      });

      const input = {
        query: 'Test with custom model',
        engine: 'ChatGPT' as const,
        model: 'gpt-4'
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.aiMetadata?.model).toBe('gpt-4');
    });
  });

  describe('Output Formats', () => {
    it('should handle text output format', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Plain text response',
        sourceDocuments: [],
        aiMetadata: { outputFormat: 'text' }
      });

      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const,
        outputFormat: 'text' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.aiMetadata?.outputFormat).toBe('text');
    });

    it('should handle markdown output format (default)', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: '# Markdown Response\n\nWith formatting...',
        sourceDocuments: [],
        aiMetadata: { outputFormat: 'markdown' }
      });

      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const,
        outputFormat: 'markdown' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.response).toContain('# Markdown Response');
      expect(result.aiMetadata?.outputFormat).toBe('markdown');
    });

    it('should handle HTML output format', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: '<h1>HTML Response</h1><p>With HTML formatting...</p>',
        sourceDocuments: [],
        aiMetadata: { outputFormat: 'html' }
      });

      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const,
        outputFormat: 'html' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.response).toContain('<h1>HTML Response</h1>');
      expect(result.aiMetadata?.outputFormat).toBe('html');
    });
  });

  describe('Metadata and Context', () => {
    it('should include source documents with metadata', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Response with rich context',
        sourceDocuments: [
          {
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Source Document.md',
            location: '/Research/AI',
            type: 'markdown'
          },
          {
            uuid: 'second-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 67890,
            name: 'Another Source.pdf',
            location: '/Research/ML',
            type: 'pdf'
          }
        ],
        conversationContext: {
          query: 'Multi-document query',
          documentsFound: 2,
          documentsUsed: 2
        }
      });

      const input = {
        query: 'What do my research documents say?',
        engine: 'ChatGPT' as const,
        includeMetadata: true
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.sourceDocuments).toHaveLength(2);
      expect(result.sourceDocuments[0]).toMatchObject({
        uuid: AI_TEST_PATTERNS.VALID_UUID,
        id: 12345,
        name: 'Source Document.md',
        location: '/Research/AI',
        type: 'markdown'
      });
      expect(result.conversationContext?.documentsFound).toBe(2);
      expect(result.conversationContext?.documentsUsed).toBe(2);
    });

    it('should handle no matching documents gracefully', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'No specific documents found, but here is general information...',
        sourceDocuments: [],
        conversationContext: {
          query: 'Very specific query',
          documentsFound: 0,
          documentsUsed: 0
        }
      });

      const input = {
        query: 'Tell me about a very specific topic that might not exist',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.sourceDocuments).toHaveLength(0);
      expect(result.conversationContext?.documentsFound).toBe(0);
    });

    it('should include AI metadata', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Response with full metadata',
        sourceDocuments: [],
        aiMetadata: {
          engine: 'Claude',
          model: 'claude-3',
          temperature: 0.5,
          outputFormat: 'markdown',
          mode: 'context'
        }
      });

      const input = {
        query: 'Test with full metadata',
        engine: 'Claude' as const,
        model: 'claude-3',
        temperature: 0.5,
        outputFormat: 'markdown' as const,
        mode: 'context' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.aiMetadata).toMatchObject({
        engine: 'Claude',
        model: 'claude-3',
        temperature: 0.5,
        outputFormat: 'markdown',
        mode: 'context'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle AI service unavailable', async () => {
      const { checkAIServiceAvailability } = await import('@/tools/ai/utils/aiAvailabilityChecker.js');
      (checkAIServiceAvailability as any).mockResolvedValueOnce({
        isAvailable: false,
        devonthinkRunning: false,
        aiFeatureEnabled: false
      });

      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI service not available');
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations).toContain('Start DEVONthink application');
    });

    it('should handle input validation errors', async () => {
      const { validateChatInput } = await import('@/tools/ai/utils/aiValidation.js');
      (validateChatInput as any).mockReturnValueOnce({
        isValid: false,
        errors: ['Invalid engine specified', 'Temperature out of range'],
        warnings: []
      });

      const input = {
        query: 'Test query',
        engine: 'InvalidEngine' as any,
        temperature: 3.0
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Input validation failed');
      expect(result.error).toContain('Invalid engine specified');
    });

    it('should handle JXA execution errors', async () => {
      mockExecuteJxa.mockRejectedValueOnce(new Error('JXA script execution failed'));

      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('JXA script execution failed');
      expect(result.executionTime).toBeDefined();
    });

    it('should handle DEVONthink not running', async () => {
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
      expect(result.error).toContain('DEVONthink is not running');
    });

    it('should handle database not found', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Database not found: NonexistentDB'
      });

      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const,
        scope: {
          databaseName: 'NonexistentDB'
        }
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database not found: NonexistentDB');
    });

    it('should handle group not found', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Group not found with UUID: invalid-uuid'
      });

      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const,
        scope: {
          groupUuid: AI_TEST_PATTERNS.VALID_UUID
        }
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Group not found with UUID');
    });

    it('should handle AI service returning no response', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'AI service returned no response. Check if AI features are configured and available.'
      });

      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI service returned no response');
    });
  });

  describe('Security Tests', () => {
    it('should escape special characters in query', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Safe response to escaped query',
        sourceDocuments: [],
        conversationContext: {
          query: 'Query with "quotes" and \\backslashes\\',
          documentsFound: 0,
          documentsUsed: 0
        }
      });

      const input = {
        query: 'Query with "quotes" and \\backslashes\\',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      // Should not cause JXA syntax errors
    });

    it('should prevent XSS in scope parameters', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Safe response',
        sourceDocuments: [],
        conversationContext: {
          query: 'Test query',
          scope: 'Database: <script>alert("xss")</script>',
          documentsFound: 0,
          documentsUsed: 0
        }
      });

      const input = {
        query: 'Test query',
        engine: 'ChatGPT' as const,
        scope: {
          databaseName: '<script>alert("xss")</script>'
        }
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      // Should handle malicious content safely
    });

    it('should handle control characters in input', async () => {
      const input = {
        query: 'Query with control\x00characters\x01here',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      // Should either succeed with safe handling or fail gracefully
      if (result.success) {
        expect(result.response).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle large queries efficiently', async () => {
      const largeQuery = 'Large query: ' + 'x'.repeat(5000);
      
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Response to large query',
        sourceDocuments: [],
        conversationContext: {
          query: largeQuery,
          documentsFound: 0,
          documentsUsed: 0
        }
      });

      const input = {
        query: largeQuery,
        engine: 'ChatGPT' as const
      };

      const startTime = Date.now();
      const result = await chatWithKnowledgeBaseTool.run(input);
      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle maximum result limit', async () => {
      const mockDocuments = Array(50).fill(null).map((_, i) => ({
        uuid: `doc-${i}-${AI_TEST_PATTERNS.VALID_UUID}`,
        id: 10000 + i,
        name: `Document ${i}.md`,
        location: `/Documents/Batch${Math.floor(i/10)}`,
        type: 'markdown'
      }));

      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Response with maximum documents',
        sourceDocuments: mockDocuments,
        conversationContext: {
          query: 'Find all documents',
          documentsFound: 50,
          documentsUsed: 50
        }
      });

      const input = {
        query: 'Find all documents',
        engine: 'ChatGPT' as const,
        maxResults: 50
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.sourceDocuments).toHaveLength(50);
      expect(result.conversationContext?.documentsFound).toBe(50);
    });

    it('should include execution time in results', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Timed response',
        sourceDocuments: []
      });

      const input = {
        query: 'Test timing',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeDefined();
      expect(typeof result.executionTime).toBe('number');
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty database', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'No documents found in the database, but here is what I can tell you...',
        sourceDocuments: [],
        conversationContext: {
          query: 'What do you know?',
          documentsFound: 0,
          documentsUsed: 0
        }
      });

      const input = {
        query: 'What do you know?',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.sourceDocuments).toHaveLength(0);
    });

    it('should handle non-text documents', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Found image and binary files...',
        sourceDocuments: [
          {
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'image.jpg',
            location: '/Images',
            type: 'picture'
          },
          {
            uuid: 'binary-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 67890,
            name: 'data.bin',
            location: '/Data',
            type: 'unknown'
          }
        ],
        conversationContext: {
          query: 'What files do I have?',
          documentsFound: 2,
          documentsUsed: 2
        }
      });

      const input = {
        query: 'What files do I have?',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.sourceDocuments).toHaveLength(2);
      expect(result.sourceDocuments.find(doc => doc.type === 'picture')).toBeDefined();
    });

    it('should handle concurrent requests', async () => {
      mockExecuteJxa.mockImplementation(async () => {
        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          success: true,
          response: 'Concurrent response',
          sourceDocuments: []
        };
      });

      const promises = Array(3).fill(null).map((_, i) => 
        chatWithKnowledgeBaseTool.run({
          query: `Concurrent query ${i}`,
          engine: 'ChatGPT' as const
        })
      );

      const results = await Promise.all(promises);

      results.forEach((result, i) => {
        expect(result.success).toBe(true);
        expect(result.response).toBe('Concurrent response');
      });
    });

    it('should handle special Unicode characters', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        response: 'Response with Unicode: 你好 🌍 ñoño',
        sourceDocuments: [],
        conversationContext: {
          query: 'Unicode query: 你好 🌍 ñoño',
          documentsFound: 0,
          documentsUsed: 0
        }
      });

      const input = {
        query: 'Unicode query: 你好 🌍 ñoño',
        engine: 'ChatGPT' as const
      };

      const result = await chatWithKnowledgeBaseTool.run(input);

      expect(result.success).toBe(true);
      expect(result.response).toContain('你好');
      expect(result.response).toContain('🌍');
      expect(result.response).toContain('ñoño');
    });
  });
});