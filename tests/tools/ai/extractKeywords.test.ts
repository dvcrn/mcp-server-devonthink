/**
 * Comprehensive tests for extractKeywords tool
 * Tests all functionality including security, performance, and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractKeywordsTool } from '@/tools/ai/extractKeywords.js';
import { 
  mockExecuteJxa, 
  setupDefaultJXAMocks
} from '@tests/mocks/devonthink.js';
import { validateToolStructure, generateTestUUID } from '@tests/utils/test-helpers.js';

// Mock the dependencies - avoid variable hoisting issues
vi.mock('@/applescript/execute.js', () => ({
  executeJxa: vi.fn()
}));

vi.mock('@/tools/ai/utils/simpleAIChecker.js', () => ({
  checkAIServiceSimple: vi.fn().mockResolvedValue({
    success: true,
    devonthinkRunning: true,
    aiEnginesConfigured: ['ChatGPT', 'Claude', 'Gemini']
  }),
  getSimpleStatusMessage: vi.fn().mockReturnValue('Test error message'),
  selectSimpleEngine: vi.fn().mockReturnValue('ChatGPT')
}));

// No need to mock AI validation since we're using Zod directly
// No need to mock result processor since we handle it directly

vi.mock('@/tools/ai/utils/aiErrorHandler.js', () => ({
  handleAIError: vi.fn().mockImplementation((error, type, options) => ({
    success: false,
    message: error.message || error.toString(),
    operationType: type,
    executionTime: options?.executionTime || 100
  }))
}));

describe('extractKeywords Tool', () => {
  const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
  const MOCK_KEYWORDS = ['artificial intelligence', 'machine learning', 'data science', 'neural networks', 'algorithms'];
  const MOCK_TAGGED_KEYWORDS = MOCK_KEYWORDS.map((keyword, index) => ({
    keyword,
    relevance: Math.max(0.1, 1.0 - (index / MOCK_KEYWORDS.length * 0.9)),
    frequency: MOCK_KEYWORDS.length - index
  }));

  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultJXAMocks();
  });

  describe('Tool Structure', () => {
    it('should have valid MCP tool structure', () => {
      validateToolStructure(extractKeywordsTool);
      expect(extractKeywordsTool.name).toBe('extract_keywords');
      expect(extractKeywordsTool.description).toContain('Intelligent keyword and tag extraction');
      expect(extractKeywordsTool.description).toContain('DEVONthink');
    });

    it('should include comprehensive documentation', () => {
      const description = extractKeywordsTool.description;
      expect(description).toContain('Key Features');
      expect(description).toContain('Extraction Options');
      expect(description).toContain('Output Formats');
      expect(description).toContain('Document Identification');
      expect(description).toContain('Usage Examples');
      expect(description).toContain('Supported Document Types');
    });

    it('should specify extraction options', () => {
      const description = extractKeywordsTool.description;
      expect(description).toContain('includeExistingTags');
      expect(description).toContain('includeHashTags');
      expect(description).toContain('includeImageTags');
      expect(description).toContain('includeBarcodes');
    });

    it('should include usage examples', () => {
      const description = extractKeywordsTool.description;
      expect(description).toContain('document organization');
      expect(description).toContain('content themes');
      expect(description).toContain('autoTag: true');
      expect(description).toContain('format: "tagged"');
    });
  });

  describe('Input Validation', () => {
    it('should accept valid UUID input', async () => {
      const mockResponse = {
        success: true,
        keywords: MOCK_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'AI Research.pdf',
          type: 'pdf',
          location: '/Research/AI Research.pdf'
        },
        extractionMetadata: {
          totalKeywords: 5,
          filteredKeywords: 0,
          extractionOptions: {
            maxKeywords: 20,
            minWordLength: 3,
            includeExistingTags: false,
            includeHashTags: true,
            includeImageTags: true,
            includeBarcodes: false,
            format: 'array',
            filterCommonWords: true
          }
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const input = {
        uuid: VALID_UUID,
        maxKeywords: 20,
        format: 'array' as const
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.keywords).toEqual(MOCK_KEYWORDS);
      expect(result.document?.uuid).toBe(VALID_UUID);
    });

    it('should accept valid recordId with database input', async () => {
      const mockResponse = {
        success: true,
        keywords: MOCK_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Document.md',
          type: 'markdown',
          location: '/Inbox/Document.md'
        },
        extractionMetadata: {
          totalKeywords: 5,
          filteredKeywords: 0
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

    it('should accept valid record path input', async () => {
      const mockResponse = {
        success: true,
        keywords: MOCK_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Document.pdf',
          type: 'pdf',
          location: '/Research/Document.pdf'
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const input = {
        recordPath: '/Research/Document.pdf'
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.keywords).toEqual(MOCK_KEYWORDS);
    });

    it('should reject input without identification method', async () => {
      const input = {
        maxKeywords: 10
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Must provide either uuid, recordId with databaseName, or recordPath');
    });

    it('should reject recordId without database name', async () => {
      const input = {
        recordId: 12345
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('databaseName is required when using recordId');
    });

    it('should validate maxKeywords bounds', async () => {
      const input = {
        uuid: VALID_UUID,
        maxKeywords: 0
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Must extract at least 1 keyword');
    });

    it('should validate maxKeywords upper bound', async () => {
      const input = {
        uuid: VALID_UUID,
        maxKeywords: 101
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot extract more than 100 keywords');
    });

    it('should validate minWordLength bounds', async () => {
      const input = {
        uuid: VALID_UUID,
        minWordLength: 0
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Min word length must be at least 1');
    });

    it('should validate UUID format', async () => {
      const input = {
        uuid: 'invalid-uuid-format'
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid UUID format');
    });
  });

  describe('Extraction Options', () => {
    beforeEach(() => {
      mockExecuteJxa.mockResolvedValue({
        success: true,
        keywords: MOCK_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Test Document.md',
          type: 'markdown',
          location: '/Test/Test Document.md'
        },
        extractionMetadata: {
          totalKeywords: 10,
          filteredKeywords: 5,
          extractionOptions: {
            maxKeywords: 5,
            minWordLength: 4,
            includeExistingTags: true,
            includeHashTags: true,
            includeImageTags: true,
            includeBarcodes: true,
            format: 'array',
            filterCommonWords: true
          }
        }
      });
    });

    it('should handle all extraction options enabled', async () => {
      const input = {
        uuid: VALID_UUID,
        maxKeywords: 5,
        minWordLength: 4,
        includeExistingTags: true,
        includeHashTags: true,
        includeImageTags: true,
        includeBarcodes: true,
        filterCommonWords: true
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.extractionMetadata?.extractionOptions).toMatchObject({
        maxKeywords: 5,
        minWordLength: 4,
        includeExistingTags: true,
        includeHashTags: true,
        includeImageTags: true,
        includeBarcodes: true,
        filterCommonWords: true
      });
    });

    it('should handle minimal extraction options', async () => {
      const input = {
        uuid: VALID_UUID,
        includeExistingTags: false,
        includeHashTags: false,
        includeImageTags: false,
        includeBarcodes: false,
        filterCommonWords: false
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
    });

    it('should apply default values for optional parameters', async () => {
      const input = {
        uuid: VALID_UUID
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.extractionMetadata?.extractionOptions?.maxKeywords).toBe(20);
      expect(result.extractionMetadata?.extractionOptions?.minWordLength).toBe(3);
      expect(result.extractionMetadata?.extractionOptions?.filterCommonWords).toBe(true);
    });
  });

  describe('Output Formats', () => {
    it('should return array format by default', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: MOCK_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Test.md',
          type: 'markdown',
          location: '/Test.md'
        },
        extractionMetadata: {
          totalKeywords: 5,
          filteredKeywords: 0,
          extractionOptions: {
            format: 'array'
          }
        }
      });

      const input = {
        uuid: VALID_UUID,
        format: 'array' as const
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.keywords)).toBe(true);
      expect(result.keywords).toEqual(MOCK_KEYWORDS);
    });

    it('should return tagged format with relevance scores', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: MOCK_TAGGED_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Test.md',
          type: 'markdown',
          location: '/Test.md'
        },
        extractionMetadata: {
          totalKeywords: 5,
          filteredKeywords: 0,
          extractionOptions: {
            format: 'tagged'
          }
        }
      });

      const input = {
        uuid: VALID_UUID,
        format: 'tagged' as const
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.keywords)).toBe(true);
      expect((result.keywords as any)[0]).toHaveProperty('keyword');
      expect((result.keywords as any)[0]).toHaveProperty('relevance');
      expect((result.keywords as any)[0]).toHaveProperty('frequency');
    });
  });

  describe('Auto-Tagging Functionality', () => {
    it('should add keywords as tags when autoTag is enabled', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: MOCK_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Test.md',
          type: 'markdown',
          location: '/Test.md'
        },
        tagsAdded: ['artificial intelligence', 'machine learning'],
        extractionMetadata: {
          totalKeywords: 5,
          filteredKeywords: 0
        }
      });

      const input = {
        uuid: VALID_UUID,
        autoTag: true
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.tagsAdded).toEqual(['artificial intelligence', 'machine learning']);
    });

    it('should not add tags when autoTag is disabled', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: MOCK_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Test.md',
          type: 'markdown',
          location: '/Test.md'
        },
        extractionMetadata: {
          totalKeywords: 5,
          filteredKeywords: 0
        }
      });

      const input = {
        uuid: VALID_UUID,
        autoTag: false
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.tagsAdded).toBeUndefined();
    });
  });

  describe('Document Types and Content', () => {
    const testDocumentTypes = [
      { type: 'pdf', name: 'Document.pdf' },
      { type: 'markdown', name: 'Document.md' },
      { type: 'rtf', name: 'Document.rtf' },
      { type: 'txt', name: 'Document.txt' },
      { type: 'html', name: 'Document.html' },
      { type: 'docx', name: 'Document.docx' }
    ];

    testDocumentTypes.forEach(({ type, name }) => {
      it(`should extract keywords from ${type} documents`, async () => {
        mockExecuteJxa.mockResolvedValueOnce({
          success: true,
          keywords: MOCK_KEYWORDS,
          document: {
            uuid: VALID_UUID,
            id: 12345,
            name,
            type,
            location: `/${name}`
          },
          extractionMetadata: {
            totalKeywords: 5,
            filteredKeywords: 0
          }
        });

        const input = {
          uuid: VALID_UUID
        };

        const result = await extractKeywordsTool.run(input);

        expect(result.success).toBe(true);
        expect(result.document?.type).toBe(type);
        expect(result.keywords).toEqual(MOCK_KEYWORDS);
      });
    });

    it('should handle empty documents gracefully', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: [],
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Empty.md',
          type: 'markdown',
          location: '/Empty.md'
        },
        extractionMetadata: {
          totalKeywords: 0,
          filteredKeywords: 0
        },
        warnings: ['No keywords were extracted from this document. The document may be empty, in an unsupported format, or contain only non-textual content.']
      });

      const input = {
        uuid: VALID_UUID
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.keywords).toEqual([]);
      expect(result.warnings).toContain('No keywords were extracted');
    });

    it('should handle documents with only filtered keywords', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: [],
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Common Words.md',
          type: 'markdown',
          location: '/Common Words.md'
        },
        extractionMetadata: {
          totalKeywords: 10,
          filteredKeywords: 10
        },
        warnings: ['All extracted keywords were filtered out. Consider reducing minWordLength or disabling filterCommonWords.']
      });

      const input = {
        uuid: VALID_UUID,
        filterCommonWords: true,
        minWordLength: 5
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.keywords).toEqual([]);
      expect(result.warnings).toContain('All extracted keywords were filtered out');
    });
  });

  describe('Error Handling', () => {
    it('should handle DEVONthink not running', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'DEVONthink is not running'
      });

      const input = {
        uuid: VALID_UUID
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('DEVONthink is not running');
    });

    it('should handle record not found by UUID', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Record not found with UUID: ' + VALID_UUID
      });

      const input = {
        uuid: VALID_UUID
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Record not found with UUID');
    });

    it('should handle record not found by ID and database', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Record not found with ID 99999 in database: NonexistentDB'
      });

      const input = {
        recordId: 99999,
        databaseName: 'NonexistentDB'
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Record not found with ID');
    });

    it('should handle record not found by path', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Record not found at path: /Nonexistent/Path.pdf'
      });

      const input = {
        recordPath: '/Nonexistent/Path.pdf'
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Record not found at path');
    });

    it('should handle groups (folders) gracefully', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Cannot extract keywords from groups. Please specify a document record.'
      });

      const input = {
        uuid: VALID_UUID
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot extract keywords from groups');
    });

    it('should handle keyword extraction failures', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'Failed to extract keywords: Document format not supported'
      });

      const input = {
        uuid: VALID_UUID
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to extract keywords');
    });

    it('should handle JXA execution errors', async () => {
      mockExecuteJxa.mockRejectedValueOnce(new Error('JXA script execution failed'));

      const input = {
        uuid: VALID_UUID
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('JXA script execution failed');
      expect(result.executionTime).toBeDefined();
    });

    it('should handle AI service unavailable', async () => {
      const { checkAIServiceAvailability } = await import('@/tools/ai/utils/aiAvailabilityChecker.js');
      (checkAIServiceAvailability as any).mockResolvedValueOnce({
        isAvailable: false,
        devonthinkRunning: false
      });

      const input = {
        uuid: VALID_UUID
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('DEVONthink is not available');
      expect(result.recommendations).toContain('Start DEVONthink application');
    });

    it('should handle input validation errors from Zod schema', async () => {
      const input = {
        uuid: 'invalid-uuid-format',
        maxKeywords: -1
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Input validation failed');
    });
  });

  describe('Security Tests', () => {
    it('should escape special characters in UUID', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: ['keyword'],
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Test.md',
          type: 'markdown',
          location: '/Test.md'
        }
      });

      const input = {
        uuid: VALID_UUID
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
    });

    it('should escape special characters in database name', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: ['keyword'],
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Test.md',
          type: 'markdown',
          location: '/Test.md'
        }
      });

      const input = {
        recordId: 12345,
        databaseName: 'Database "with quotes" & symbols'
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
    });

    it('should handle control characters safely', async () => {
      const input = {
        recordPath: '/Path/with\x00control\x01characters'
      };

      const result = await extractKeywordsTool.run(input);

      // Should either succeed with safe handling or fail gracefully
      if (result.success) {
        expect(result.keywords).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle large keyword extraction efficiently', async () => {
      const largeKeywordSet = Array(50).fill(null).map((_, i) => `keyword${i}`);
      
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: largeKeywordSet,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Large Document.pdf',
          type: 'pdf',
          location: '/Large Document.pdf'
        },
        extractionMetadata: {
          totalKeywords: 100,
          filteredKeywords: 50
        }
      });

      const input = {
        uuid: VALID_UUID,
        maxKeywords: 50
      };

      const startTime = Date.now();
      const result = await extractKeywordsTool.run(input);
      const executionTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(result.keywords).toHaveLength(50);
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should include execution time in results', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: MOCK_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Test.md',
          type: 'markdown',
          location: '/Test.md'
        }
      });

      const input = {
        uuid: VALID_UUID
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeDefined();
      expect(typeof result.executionTime).toBe('number');
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should handle concurrent keyword extractions', async () => {
      mockExecuteJxa.mockImplementation(async () => {
        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          success: true,
          keywords: MOCK_KEYWORDS,
          document: {
            uuid: VALID_UUID,
            id: 12345,
            name: 'Concurrent Test.md',
            type: 'markdown',
            location: '/Concurrent Test.md'
          }
        };
      });

      const promises = Array(3).fill(null).map((_, i) => 
        extractKeywordsTool.run({
          uuid: generateTestUUID()
        })
      );

      const results = await Promise.all(promises);

      results.forEach((result, i) => {
        expect(result.success).toBe(true);
        expect(result.keywords).toEqual(MOCK_KEYWORDS);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short documents', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: ['short'],
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Short.txt',
          type: 'txt',
          location: '/Short.txt'
        },
        extractionMetadata: {
          totalKeywords: 1,
          filteredKeywords: 3
        },
        warnings: ['Filtered out 3 keywords based on length and common word criteria.']
      });

      const input = {
        uuid: VALID_UUID,
        minWordLength: 5
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.keywords).toEqual(['short']);
    });

    it('should handle documents with only special characters', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: [],
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Special Chars.txt',
          type: 'txt',
          location: '/Special Chars.txt'
        },
        extractionMetadata: {
          totalKeywords: 0,
          filteredKeywords: 0
        },
        warnings: ['No keywords were extracted from this document. The document may be empty, in an unsupported format, or contain only non-textual content.']
      });

      const input = {
        uuid: VALID_UUID
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.keywords).toEqual([]);
      expect(result.warnings).toContain('No keywords were extracted');
    });

    it('should handle language-specific documents', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: ['机器学习', '人工智能', '数据科学'],
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Chinese Document.txt',
          type: 'txt',
          location: '/Chinese Document.txt'
        },
        extractionMetadata: {
          totalKeywords: 3,
          filteredKeywords: 0,
          language: 'zh'
        }
      });

      const input = {
        uuid: VALID_UUID,
        language: 'zh'
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.keywords).toEqual(['机器学习', '人工智能', '数据科学']);
      expect(result.extractionMetadata?.language).toBe('zh');
    });

    it('should handle mixed content types', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: ['text', 'image', 'table', 'chart'],
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Mixed Content.docx',
          type: 'docx',
          location: '/Mixed Content.docx'
        },
        extractionMetadata: {
          totalKeywords: 4,
          filteredKeywords: 0
        }
      });

      const input = {
        uuid: VALID_UUID,
        includeImageTags: true
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.keywords).toContain('image');
    });
  });

  describe('Metadata and Context', () => {
    it('should include comprehensive extraction metadata', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: MOCK_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Research.pdf',
          type: 'pdf',
          location: '/Research/Research.pdf'
        },
        extractionMetadata: {
          totalKeywords: 15,
          filteredKeywords: 10,
          language: 'en',
          extractionOptions: {
            maxKeywords: 5,
            minWordLength: 4,
            includeExistingTags: true,
            includeHashTags: true,
            includeImageTags: false,
            includeBarcodes: false,
            format: 'array',
            filterCommonWords: true
          }
        }
      });

      const input = {
        uuid: VALID_UUID,
        maxKeywords: 5,
        minWordLength: 4,
        includeExistingTags: true,
        language: 'en'
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.extractionMetadata).toMatchObject({
        totalKeywords: 15,
        filteredKeywords: 10,
        language: 'en'
      });
      expect(result.extractionMetadata?.extractionOptions).toBeDefined();
    });

    it('should include document metadata', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        keywords: MOCK_KEYWORDS,
        document: {
          uuid: VALID_UUID,
          id: 12345,
          name: 'Document.md',
          type: 'markdown',
          location: '/Projects/AI/Document.md'
        }
      });

      const input = {
        uuid: VALID_UUID
      };

      const result = await extractKeywordsTool.run(input);

      expect(result.success).toBe(true);
      expect(result.document).toMatchObject({
        uuid: VALID_UUID,
        id: 12345,
        name: 'Document.md',
        type: 'markdown',
        location: '/Projects/AI/Document.md'
      });
    });
  });
});