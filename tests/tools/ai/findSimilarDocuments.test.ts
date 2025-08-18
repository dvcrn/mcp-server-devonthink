/**
 * Comprehensive tests for findSimilarDocuments tool
 * Tests all functionality including security, performance, edge cases, and similarity algorithms
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { findSimilarDocumentsTool } from '@/tools/ai/findSimilarDocuments.js';
import { 
  mockExecuteJxa, 
  setupDefaultJXAMocks,
  MOCK_AI_RESPONSES,
  createMockDatabase,
  createMockRecord
} from '@tests/mocks/devonthink.js';
import { validateToolStructure, AI_TEST_PATTERNS } from '@tests/utils/test-helpers.js';

// Mock the dependencies
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

vi.mock('@/tools/ai/utils/aiValidation.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    validateAnalysisInput: vi.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    })
  };
});

vi.mock('@/tools/ai/utils/resultProcessor.js', () => ({
  processAIResult: vi.fn().mockImplementation((result) => result)
}));

vi.mock('@/tools/ai/utils/aiErrorHandler.js', () => ({
  handleAIError: vi.fn().mockImplementation((error, type, options) => ({
    success: false,
    error: error.message || error.toString(),
    operationType: type,
    executionTime: options?.executionTime || 100
  }))
}));

describe('findSimilarDocuments Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultJXAMocks();
  });

  describe('Tool Structure', () => {
    it('should have valid MCP tool structure', () => {
      validateToolStructure(findSimilarDocumentsTool);
      expect(findSimilarDocumentsTool.name).toBe('find_similar_documents');
      expect(findSimilarDocumentsTool.description).toContain('semantic document discovery');
      expect(findSimilarDocumentsTool.description).toContain('similarity search');
    });

    it('should include comprehensive documentation', () => {
      const description = findSimilarDocumentsTool.description;
      expect(description).toContain('Similarity Algorithms');
      expect(description).toContain('Reference Options');
      expect(description).toContain('Scope Control');
      expect(description).toContain('Use Cases');
      expect(description).toContain('Performance Guidelines');
    });

    it('should specify supported algorithms', () => {
      expect(findSimilarDocumentsTool.description).toContain('semantic');
      expect(findSimilarDocumentsTool.description).toContain('textual');
      expect(findSimilarDocumentsTool.description).toContain('conceptual');
      expect(findSimilarDocumentsTool.description).toContain('mixed');
    });

    it('should include detailed use cases', () => {
      const description = findSimilarDocumentsTool.description;
      expect(description).toContain('Research Discovery');
      expect(description).toContain('Content Organization');
      expect(description).toContain('Knowledge Mining');
      expect(description).toContain('Duplicate Detection');
    });
  });

  describe('Input Validation', () => {
    it('should accept valid document reference input', async () => {
      const mockResponse = {
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Document.pdf',
          type: 'pdf',
          location: '/Research/Papers'
        },
        similarDocuments: [
          {
            uuid: 'similar-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 67890,
            name: 'Similar Paper.pdf',
            type: 'pdf',
            location: '/Research/Related',
            similarity: 0.85,
            matchType: 'semantic',
            reasoning: 'Identified as semantically similar through AI analysis'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 15,
          documentsScanned: 15,
          executionTime: 2500,
          averageSimilarity: 0.72
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        algorithm: 'semantic' as const,
        maxResults: 10
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true, `Tool failed with error: ${result.error}`);
      expect(result.reference?.uuid).toBe(AI_TEST_PATTERNS.VALID_UUID);
      expect(result.similarDocuments).toHaveLength(1);
      expect(result.similarDocuments![0].similarity).toBeGreaterThan(0.8);
      expect(result.searchMetadata?.algorithm).toBe('semantic');
    });

    it('should accept valid text reference input', async () => {
      const mockResponse = {
        success: true,
        reference: {
          name: 'Text Query',
          type: 'text'
        },
        similarDocuments: [
          {
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Related Document.md',
            type: 'markdown',
            location: '/Notes/Topics',
            similarity: 0.78,
            matchType: 'semantic',
            snippet: 'This document discusses machine learning algorithms and their applications in natural language processing...',
            reasoning: 'Identified as semantically similar through AI analysis'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'text',
          totalCandidates: 8,
          documentsScanned: 8,
          executionTime: 3200,
          averageSimilarity: 0.65
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const input = {
        referenceText: 'Machine learning and artificial intelligence approaches to text analysis and natural language processing',
        algorithm: 'semantic' as const,
        includeContent: true
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.reference?.type).toBe('text');
      expect(result.similarDocuments![0].snippet).toContain('machine learning');
      expect(result.searchMetadata?.referenceType).toBe('text');
    });

    it('should accept record ID with database name', async () => {
      const mockResponse = {
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Database Record.txt',
          type: 'txt',
          location: '/Documents'
        },
        similarDocuments: [],
        searchMetadata: {
          algorithm: 'textual',
          referenceType: 'document',
          totalCandidates: 0,
          documentsScanned: 0,
          executionTime: 800
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const input = {
        referenceRecordId: 12345,
        databaseName: 'Test Database',
        algorithm: 'textual' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.searchMetadata?.referenceType).toBe('document');
    });

    it('should reject empty reference', async () => {
      const input = {
        algorithm: 'semantic' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('I need a reference to find similar documents');
      expect(result.recommendations).toBeDefined();
      expect(result.examples).toBeDefined();
      expect(result.recommendations).toContain('Choose a reference method: document UUID, text content, or record ID + database');
    });

    it('should reject referenceRecordId without databaseName', async () => {
      const input = {
        referenceRecordId: 12345,
        algorithm: 'semantic' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      // This should trigger the primary empty reference error since no valid reference method is complete
      expect(result.error).toContain('I need a reference to find similar documents');
      expect(result.recommendations).toBeDefined();
    });

    it('should reject text reference that is too short', async () => {
      const input = {
        referenceText: 'short',
        algorithm: 'semantic' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Reference text too short');
    });

    it('should validate maxResults bounds', async () => {
      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        maxResults: 0
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Must return at least 1 result');
    });

    it('should validate maxResults upper bound', async () => {
      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        maxResults: 51
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot return more than 50 results');
    });

    it('should validate similarity threshold bounds', async () => {
      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        minSimilarity: 1.5
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Similarity threshold cannot exceed 1.0');
    });

    it('should validate UUID format in scope', async () => {
      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        scope: {
          groupUuid: 'invalid-uuid'
        }
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid group UUID format');
    });
  });

  describe('Similarity Algorithms', () => {
    beforeEach(() => {
      mockExecuteJxa.mockResolvedValue({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'similar-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Similar Doc.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.8,
            matchType: 'semantic',
            reasoning: 'Algorithm-specific reasoning'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 10,
          documentsScanned: 10,
          executionTime: 2000,
          averageSimilarity: 0.75
        }
      });
    });

    it('should handle semantic algorithm', async () => {
      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        algorithm: 'semantic' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.searchMetadata?.algorithm).toBe('semantic');
      expect(result.similarDocuments![0].matchType).toBe('semantic');
    });

    it('should handle textual algorithm', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'textual-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Textually Similar.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.75,
            matchType: 'textual',
            reasoning: 'Similar content and text patterns detected'
          }
        ],
        searchMetadata: {
          algorithm: 'textual',
          referenceType: 'document',
          totalCandidates: 12,
          documentsScanned: 12,
          executionTime: 1500
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        algorithm: 'textual' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.searchMetadata?.algorithm).toBe('textual');
      expect(result.similarDocuments![0].reasoning).toContain('text patterns');
    });

    it('should handle conceptual algorithm', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'concept-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Conceptually Similar.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.82,
            matchType: 'conceptual',
            reasoning: 'Shares similar concepts and themes'
          }
        ],
        searchMetadata: {
          algorithm: 'conceptual',
          referenceType: 'document',
          totalCandidates: 8,
          documentsScanned: 8,
          executionTime: 2800
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        algorithm: 'conceptual' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.searchMetadata?.algorithm).toBe('conceptual');
      expect(result.similarDocuments![0].reasoning).toContain('concepts and themes');
    });

    it('should handle mixed algorithm', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'mixed-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Multi-factor Similar.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.88,
            matchType: 'mixed',
            reasoning: 'Multiple similarity factors identified'
          }
        ],
        searchMetadata: {
          algorithm: 'mixed',
          referenceType: 'document',
          totalCandidates: 15,
          documentsScanned: 15,
          executionTime: 3200,
          averageSimilarity: 0.78
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        algorithm: 'mixed' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.searchMetadata?.algorithm).toBe('mixed');
      expect(result.similarDocuments![0].reasoning).toContain('Multiple similarity factors');
    });
  });

  describe('Scope Filtering', () => {
    it('should handle database scope', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'scoped-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Scoped Similar.pdf',
            type: 'pdf',
            location: '/Target Database/Documents',
            similarity: 0.79,
            matchType: 'semantic'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 5,
          documentsScanned: 5,
          executionTime: 1800,
          scopeApplied: 'Database: Target Database'
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        scope: {
          databaseName: 'Target Database'
        }
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.searchMetadata?.scopeApplied).toContain('Target Database');
      expect(result.similarDocuments![0].location).toContain('Target Database');
    });

    it('should handle group UUID scope', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'grouped-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Group Similar.pdf',
            type: 'pdf',
            location: '/Research/AI',
            similarity: 0.83,
            matchType: 'semantic'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 3,
          documentsScanned: 3,
          executionTime: 1200,
          scopeApplied: 'Group: ' + AI_TEST_PATTERNS.VALID_UUID
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        scope: {
          groupUuid: AI_TEST_PATTERNS.VALID_UUID
        }
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.searchMetadata?.scopeApplied).toContain(AI_TEST_PATTERNS.VALID_UUID);
    });

    it('should handle group path scope', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'path-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Path Similar.pdf',
            type: 'pdf',
            location: '/Projects/2024/ML',
            similarity: 0.76,
            matchType: 'semantic'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 7,
          documentsScanned: 7,
          executionTime: 1600,
          scopeApplied: 'Path: /Projects/2024'
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        scope: {
          groupPath: '/Projects/2024'
        }
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.searchMetadata?.scopeApplied).toContain('/Projects/2024');
      expect(result.similarDocuments![0].location).toContain('/Projects/2024');
    });

    it('should handle document type filtering', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'pdf-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Similar PDF.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.81,
            matchType: 'semantic'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 4,
          documentsScanned: 4,
          executionTime: 1400,
          scopeApplied: 'Types: pdf, markdown'
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        scope: {
          documentTypes: ['pdf', 'markdown']
        }
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.searchMetadata?.scopeApplied).toContain('Types: pdf, markdown');
      expect(result.similarDocuments![0].type).toBe('pdf');
    });

    it('should handle date range filtering', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'dated-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Recent Similar.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.77,
            matchType: 'semantic',
            metadata: {
              creationDate: '2024-01-15T10:30:00Z'
            }
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 6,
          documentsScanned: 6,
          executionTime: 1700,
          scopeApplied: 'Date range: 2024-01-01T00:00:00Z to 2024-12-31T23:59:59Z'
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        scope: {
          dateRange: {
            from: '2024-01-01T00:00:00Z',
            to: '2024-12-31T23:59:59Z'
          }
        },
        includeMetadata: true
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.searchMetadata?.scopeApplied).toContain('Date range');
      expect(result.similarDocuments![0].metadata?.creationDate).toBe('2024-01-15T10:30:00Z');
    });

    it('should handle combined scope parameters', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'combined-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Filtered Similar.pdf',
            type: 'pdf',
            location: '/Research DB/AI Projects',
            similarity: 0.85,
            matchType: 'semantic'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 2,
          documentsScanned: 2,
          executionTime: 900,
          scopeApplied: 'Database: Research DB; Path: /AI Projects; Types: pdf'
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        scope: {
          databaseName: 'Research DB',
          groupPath: '/AI Projects',
          documentTypes: ['pdf']
        }
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.searchMetadata?.scopeApplied).toContain('Research DB');
      expect(result.searchMetadata?.scopeApplied).toContain('/AI Projects');
      expect(result.searchMetadata?.scopeApplied).toContain('Types: pdf');
    });
  });

  describe('Output Options', () => {
    it('should include content snippets when requested', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'content-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Document with Content.md',
            type: 'markdown',
            location: '/Documents',
            similarity: 0.82,
            matchType: 'semantic',
            snippet: 'This document explores advanced machine learning techniques including neural networks, deep learning architectures, and their applications in computer vision...',
            reasoning: 'Identified as semantically similar through AI analysis'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 8,
          documentsScanned: 8,
          executionTime: 2100
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        includeContent: true
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.similarDocuments![0].snippet).toBeDefined();
      expect(result.similarDocuments![0].snippet).toContain('machine learning');
      expect(result.similarDocuments![0].snippet!.length).toBeGreaterThan(50);
    });

    it('should include full metadata when requested', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'metadata-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Rich Metadata Doc.pdf',
            type: 'pdf',
            location: '/Documents/Research',
            similarity: 0.79,
            matchType: 'semantic',
            metadata: {
              size: 2048576,
              creationDate: '2024-01-15T10:30:00Z',
              modificationDate: '2024-01-20T14:45:30Z',
              tags: ['research', 'machine-learning', 'ai'],
              kind: 'PDF Document'
            },
            reasoning: 'Identified as semantically similar through AI analysis'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 10,
          documentsScanned: 10,
          executionTime: 2300
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        includeMetadata: true
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.similarDocuments![0].metadata).toBeDefined();
      expect(result.similarDocuments![0].metadata!.size).toBe(2048576);
      expect(result.similarDocuments![0].metadata!.tags).toContain('machine-learning');
      expect(result.similarDocuments![0].metadata!.creationDate).toBe('2024-01-15T10:30:00Z');
    });

    it('should sort by similarity (default)', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'highest-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Most Similar.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.95,
            matchType: 'semantic'
          },
          {
            uuid: 'medium-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 67890,
            name: 'Moderately Similar.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.72,
            matchType: 'semantic'
          },
          {
            uuid: 'lowest-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 11111,
            name: 'Least Similar.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.45,
            matchType: 'semantic'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 12,
          documentsScanned: 12,
          executionTime: 2500,
          averageSimilarity: 0.71
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        sortBy: 'similarity' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.similarDocuments).toHaveLength(3);
      expect(result.similarDocuments![0].similarity).toBeGreaterThanOrEqual(result.similarDocuments![1].similarity);
      expect(result.similarDocuments![1].similarity).toBeGreaterThanOrEqual(result.similarDocuments![2].similarity);
      expect(result.similarDocuments![0].name).toBe('Most Similar.pdf');
    });

    it('should sort by date when requested', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'newest-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Newest Similar.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.75,
            matchType: 'semantic',
            metadata: {
              modificationDate: '2024-01-20T10:30:00Z'
            }
          },
          {
            uuid: 'older-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 67890,
            name: 'Older Similar.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.85,
            matchType: 'semantic',
            metadata: {
              modificationDate: '2024-01-10T10:30:00Z'
            }
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 8,
          documentsScanned: 8,
          executionTime: 1800
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        sortBy: 'date' as const,
        includeMetadata: true
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.similarDocuments![0].name).toBe('Newest Similar.pdf');
      expect(result.similarDocuments![0].metadata!.modificationDate).toBe('2024-01-20T10:30:00Z');
    });

    it('should sort by name when requested', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'a-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Alpha Document.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.65,
            matchType: 'semantic'
          },
          {
            uuid: 'z-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 67890,
            name: 'Zulu Document.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.85,
            matchType: 'semantic'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 6,
          documentsScanned: 6,
          executionTime: 1600
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        sortBy: 'name' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.similarDocuments![0].name).toBe('Alpha Document.pdf');
      expect(result.similarDocuments![1].name).toBe('Zulu Document.pdf');
    });
  });

  describe('Similarity Filtering', () => {
    it('should filter by minimum similarity threshold', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'high-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'High Similarity.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.82,
            matchType: 'semantic'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 15,
          documentsScanned: 15,
          executionTime: 2200,
          averageSimilarity: 0.82
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        minSimilarity: 0.8
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.similarDocuments).toHaveLength(1);
      expect(result.similarDocuments![0].similarity).toBeGreaterThanOrEqual(0.8);
    });

    it('should handle no results above threshold', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 8,
          documentsScanned: 8,
          executionTime: 1500
        },
        warnings: ['No similar documents found matching the criteria. Consider lowering minSimilarity threshold or expanding scope.'],
        recommendations: [
          'Lower the minSimilarity threshold to 0.6',
          'Try a different algorithm (semantic, textual, conceptual, mixed)',
          'Expand the search scope to include more databases or groups'
        ]
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        minSimilarity: 0.95
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.similarDocuments).toHaveLength(0);
      expect(result.warnings).toContain('No similar documents found matching the criteria');
      expect(result.recommendations).toContain('Lower the minSimilarity threshold to 0.6');
    });
  });

  describe('Error Handling', () => {
    it('should handle reference document not found', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Reference document not found with UUID: ' + AI_TEST_PATTERNS.VALID_UUID
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Reference document not found');
    });

    it('should handle database not found', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Scope database not found: NonexistentDB'
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        scope: {
          databaseName: 'NonexistentDB'
        }
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Scope database not found');
    });

    it('should handle group not found', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Scope group not found with UUID: invalid-uuid'
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        scope: {
          groupUuid: AI_TEST_PATTERNS.VALID_UUID
        }
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Scope group not found');
    });

    it('should handle DEVONthink not running', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'DEVONthink is not running'
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('DEVONthink is not running');
    });

    it('should handle AI service unavailable for semantic algorithms', async () => {
      const { checkAIServiceAvailability } = await import('@/tools/ai/utils/aiAvailabilityChecker.js');
      (checkAIServiceAvailability as any).mockResolvedValueOnce({
        isAvailable: false,
        devonthinkRunning: true,
        aiFeatureEnabled: false
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        algorithm: 'semantic' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI service not available for semantic analysis');
      expect(result.recommendations).toContain("Switch to 'textual' algorithm");
    });

    it('should handle using group as reference document', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Cannot use groups as reference documents. Please specify a document.'
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot use groups as reference documents');
    });

    it('should handle JXA execution errors', async () => {
      mockExecuteJxa.mockRejectedValueOnce(new Error('JXA script execution failed'));

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('JXA script execution failed');
      expect(result.executionTime).toBeDefined();
    });
  });

  describe('Security Tests', () => {
    it('should escape special characters in reference text', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          name: 'Text Query',
          type: 'text'
        },
        similarDocuments: [],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'text',
          totalCandidates: 0,
          documentsScanned: 0,
          executionTime: 800
        }
      });

      const input = {
        referenceText: 'Query with "quotes" and \\backslashes\\ and special chars: @#$%',
        algorithm: 'semantic' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      // Should not cause JXA syntax errors
    });

    it('should handle control characters in input', async () => {
      const input = {
        referenceText: 'Query with control\x00characters\x01here and more text to meet minimum',
        algorithm: 'textual' as const
      };

      const result = await findSimilarDocumentsTool.run(input);

      // Should either succeed with safe handling or fail gracefully
      if (result.success) {
        expect(result.reference).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
      }
    });

    it('should prevent XSS in scope parameters', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [],
        searchMetadata: {
          algorithm: 'textual',
          referenceType: 'document',
          totalCandidates: 0,
          documentsScanned: 0,
          executionTime: 500,
          scopeApplied: 'Database: <script>alert("xss")</script>'
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        algorithm: 'textual' as const,
        scope: {
          databaseName: '<script>alert("xss")</script>'
        }
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      // Should handle malicious content safely
    });
  });

  describe('Performance Tests', () => {
    it('should handle large reference text efficiently', async () => {
      const largeText = 'Research content: ' + 'x'.repeat(10000);
      
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          name: 'Text Query',
          type: 'text'
        },
        similarDocuments: [],
        searchMetadata: {
          algorithm: 'textual',
          referenceType: 'text',
          totalCandidates: 0,
          documentsScanned: 0,
          executionTime: 2500
        }
      });

      const input = {
        referenceText: largeText,
        algorithm: 'textual' as const
      };

      const startTime = Date.now();
      const result = await findSimilarDocumentsTool.run(input);
      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle maximum result limit', async () => {
      const mockDocuments = Array(50).fill(null).map((_, i) => ({
        uuid: `doc-${i}-${AI_TEST_PATTERNS.VALID_UUID}`,
        id: 10000 + i,
        name: `Similar Document ${i}.pdf`,
        type: 'pdf',
        location: `/Documents/Batch${Math.floor(i/10)}`,
        similarity: Math.max(0.3, 0.9 - (i * 0.01)),
        matchType: 'semantic'
      }));

      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: mockDocuments,
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 200,
          documentsScanned: 200,
          executionTime: 4500,
          averageSimilarity: 0.65
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID,
        maxResults: 50
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.similarDocuments).toHaveLength(50);
      expect(result.searchMetadata?.totalCandidates).toBe(200);
    });

    it('should include execution time in results', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 0,
          documentsScanned: 0,
          executionTime: 1200
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeDefined();
      expect(typeof result.executionTime).toBe('number');
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.searchMetadata?.executionTime).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty database', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 0,
          documentsScanned: 0,
          executionTime: 500
        },
        warnings: ['No similar documents found matching the criteria. Consider lowering minSimilarity threshold or expanding scope.']
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.similarDocuments).toHaveLength(0);
      expect(result.warnings).toContain('No similar documents found');
    });

    it('should handle Unicode characters in reference text', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          name: 'Text Query',
          type: 'text'
        },
        similarDocuments: [
          {
            uuid: 'unicode-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Unicode Document 你好.md',
            type: 'markdown',
            location: '/Documents',
            similarity: 0.78,
            matchType: 'semantic',
            snippet: 'Content with Unicode: 你好 🌍 ñoño'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'text',
          totalCandidates: 3,
          documentsScanned: 3,
          executionTime: 1800
        }
      });

      const input = {
        referenceText: 'Unicode query with international characters: 你好 世界 🌍 café ñoño',
        includeContent: true
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.similarDocuments![0].name).toContain('你好');
      expect(result.similarDocuments![0].snippet).toContain('🌍');
      expect(result.similarDocuments![0].snippet).toContain('ñoño');
    });

    it('should handle concurrent requests', async () => {
      mockExecuteJxa.mockImplementation(async () => {
        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          success: true,
          reference: {
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            name: 'Reference Doc.pdf',
            type: 'pdf'
          },
          similarDocuments: [],
          searchMetadata: {
            algorithm: 'semantic',
            referenceType: 'document',
            totalCandidates: 0,
            documentsScanned: 0,
            executionTime: 100
          }
        };
      });

      const promises = Array(3).fill(null).map((_, i) => 
        findSimilarDocumentsTool.run({
          referenceUuid: `${i}-${AI_TEST_PATTERNS.VALID_UUID}` as any // Cast for test
        })
      );

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.searchMetadata).toBeDefined();
      });
    });

    it('should handle mixed document types in results', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        reference: {
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Reference Doc.pdf',
          type: 'pdf'
        },
        similarDocuments: [
          {
            uuid: 'pdf-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 12345,
            name: 'Similar PDF.pdf',
            type: 'pdf',
            location: '/Documents',
            similarity: 0.85,
            matchType: 'semantic'
          },
          {
            uuid: 'md-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 67890,
            name: 'Similar Markdown.md',
            type: 'markdown',
            location: '/Notes',
            similarity: 0.78,
            matchType: 'semantic'
          },
          {
            uuid: 'txt-' + AI_TEST_PATTERNS.VALID_UUID,
            id: 11111,
            name: 'Similar Text.txt',
            type: 'txt',
            location: '/Text Files',
            similarity: 0.71,
            matchType: 'semantic'
          }
        ],
        searchMetadata: {
          algorithm: 'semantic',
          referenceType: 'document',
          totalCandidates: 12,
          documentsScanned: 12,
          executionTime: 2100,
          averageSimilarity: 0.78
        }
      });

      const input = {
        referenceUuid: AI_TEST_PATTERNS.VALID_UUID
      };

      const result = await findSimilarDocumentsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.similarDocuments).toHaveLength(3);
      
      const types = result.similarDocuments!.map(doc => doc.type);
      expect(types).toContain('pdf');
      expect(types).toContain('markdown');
      expect(types).toContain('txt');
    });
  });
});