/**
 * Simplified tests for findSimilarDocuments tool
 * Focus on core functionality only - removed brittle tests that validate
 * implementation details rather than business logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { findSimilarDocumentsTool } from '@/tools/ai/findSimilarDocuments.js';
import { executeJxa } from '@/applescript/execute.js';

vi.mock('@/applescript/execute.js');
vi.mock('@/tools/ai/utils/aiAvailabilityChecker.js', () => ({
  checkAIServiceAvailability: vi.fn().mockResolvedValue({
    isAvailable: true,
    devonthinkRunning: true,
    aiFeatureEnabled: true,
    availableEngines: ['ChatGPT']
  })
}));

describe('findSimilarDocuments Tool', () => {
  const mockExecuteJxa = vi.mocked(executeJxa);
  const VALID_UUID = '12345678-1234-1234-1234-123456789abc';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tool Structure', () => {
    it('should have valid MCP tool structure', () => {
      expect(findSimilarDocumentsTool.name).toBe('find_similar_documents');
      expect(findSimilarDocumentsTool.description).toBeTruthy();
      expect(findSimilarDocumentsTool.inputSchema).toBeTruthy();
      expect(typeof findSimilarDocumentsTool.run).toBe('function');
    });
  });

  describe('Core Functionality', () => {
    it('should work with valid reference UUID', async () => {
      const mockResponse = {
        success: true,
        similarDocuments: [{
          uuid: 'similar-uuid-123',
          id: 12345,
          name: 'Similar Document.pdf',
          location: '/Documents/Similar Document.pdf',
          similarity: 0.85,
          type: 'pdf'
        }],
        referenceDocument: {
          uuid: VALID_UUID,
          name: 'Reference Document.md',
          location: '/Reference Document.md'
        },
        searchMetadata: {
          algorithm: 'semantic',
          totalFound: 1,
          averageSimilarity: 0.85
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const input = {
        referenceUuid: VALID_UUID,
        algorithm: 'semantic' as const,
        maxResults: 10
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.similarDocuments).toBeDefined();
      expect(result.similarDocuments).toHaveLength(1);
    });

    it('should work with custom similarity threshold', async () => {
      const mockResponse = {
        success: true,
        similarDocuments: [{
          uuid: 'similar-uuid-456',
          id: 67890,
          name: 'Multi Similar.md',
          location: '/Multi Similar.md',
          similarity: 0.75,
          type: 'markdown'
        }],
        searchMetadata: {
          algorithm: 'mixed',
          totalFound: 1,
          averageSimilarity: 0.75
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const input = {
        referenceUuid: VALID_UUID,
        algorithm: 'mixed' as const,
        minSimilarity: 0.6
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.similarDocuments).toBeDefined();
      }
    });

    it('should handle missing required fields', async () => {
      const result = await findSimilarDocumentsTool.run({} as any);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should validate input bounds', async () => {
      const result = await findSimilarDocumentsTool.run({
        referenceUuid: VALID_UUID,
        maxResults: 0 // Invalid
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle DEVONthink not running', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'DEVONthink is not running'
      });

      const input = { referenceUuid: VALID_UUID };
      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle reference document not found', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Reference document not found'
      });

      const input = { referenceUuid: VALID_UUID };
      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle JXA execution errors', async () => {
      mockExecuteJxa.mockRejectedValueOnce(new Error('Script failed'));

      const input = { referenceUuid: VALID_UUID };
      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Script failed');
    });
  });
});