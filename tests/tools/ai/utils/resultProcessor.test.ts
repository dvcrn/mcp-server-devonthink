/**
 * Unit tests for AI result processor utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  processAIResult,
  processAIError,
  mergeAIResults,
  BaseAIResult,
  ChatResult,
  SummaryResult,
  ClassifyResult,
  CompareResult,
  AnalysisResult,
  GenerationResult,
  AIErrorCategory,
  ProcessedError,
  ResultProcessingOptions,
  DocumentReference,
  ClassificationProposal,
  SimilarRecord
} from '@/tools/ai/utils/resultProcessor.js';
import { AI_TEST_PATTERNS } from '@tests/utils/test-helpers.js';

describe('AI Result Processor Utilities', () => {
  const mockStartTime = Date.now() - 1000; // 1 second ago

  describe('processAIResult', () => {
    describe('Basic Processing', () => {
      it('should handle null/undefined results', () => {
        const result = processAIResult(null, 'chat');
        
        expect(result.success).toBe(false);
        expect(result.operationType).toBe('chat');
        expect(result.error).toBe('No result received from AI operation');
        expect(result.timestamp).toBeDefined();
      });

      it('should handle string results (JSON)', () => {
        const jsonResult = '{"success": true, "response": "Hello"}';
        const result = processAIResult(jsonResult, 'chat', mockStartTime) as ChatResult;
        
        expect(result.success).toBe(true);
        expect(result.operationType).toBe('chat');
        expect(result.response).toBe('Hello');
        expect(result.executionTime).toBeGreaterThan(0);
      });

      it('should handle invalid JSON strings', () => {
        const invalidJson = 'Invalid JSON string';
        const result = processAIResult(invalidJson, 'chat');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid JSON string');
      });

      it('should process successful object results', () => {
        const rawResult = {
          success: true,
          response: 'AI generated response',
          engine: 'ChatGPT',
          model: 'gpt-4',
          outputFormat: 'text'
        };
        
        const result = processAIResult(rawResult, 'chat', mockStartTime) as ChatResult;
        
        expect(result.success).toBe(true);
        expect(result.operationType).toBe('chat');
        expect(result.response).toBe('AI generated response');
        expect(result.engine).toBe('ChatGPT');
        expect(result.model).toBe('gpt-4');
        expect(result.outputFormat).toBe('text');
        expect(result.executionTime).toBeGreaterThan(0);
        expect(result.timestamp).toBeDefined();
      });

      it('should process failed results', () => {
        const rawResult = {
          success: false,
          error: 'AI service unavailable'
        };
        
        const result = processAIResult(rawResult, 'chat');
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('AI service unavailable');
      });
    });

    describe('Processing Options', () => {
      it('should respect includeTimestamp option', () => {
        const options: ResultProcessingOptions = { includeTimestamp: false };
        const result = processAIResult({ success: true }, 'chat', undefined, options);
        
        expect(result.timestamp).toBeUndefined();
      });

      it('should respect includeExecutionTime option', () => {
        const options: ResultProcessingOptions = { includeExecutionTime: false };
        const result = processAIResult({ success: true }, 'chat', mockStartTime, options);
        
        expect(result.executionTime).toBeUndefined();
      });

      it('should validate structure when requested', () => {
        const options: ResultProcessingOptions = { validateStructure: true };
        const invalidResult = { success: true }; // Missing required fields for chat
        
        const result = processAIResult(invalidResult, 'chat', undefined, options);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('Result validation failed');
      });

      it('should sanitize content when requested', () => {
        const rawResult = {
          success: true,
          response: 'Content with \x00 control \x1F characters'
        };
        
        const options: ResultProcessingOptions = { sanitizeContent: true };
        const result = processAIResult(rawResult, 'chat', undefined, options) as ChatResult;
        
        expect(result.response).not.toContain('\x00');
        expect(result.response).not.toContain('\x1F');
      });

      it('should truncate long content', () => {
        const longContent = 'a'.repeat(1000);
        const rawResult = {
          success: true,
          response: longContent
        };
        
        const options: ResultProcessingOptions = { 
          sanitizeContent: true,
          maxContentLength: 500 
        };
        const result = processAIResult(rawResult, 'chat', undefined, options) as ChatResult;
        
        expect(result.response?.length).toBeLessThan(600); // 500 + truncation message
        expect(result.response).toContain('[truncated]');
      });
    });

    describe('Operation-Specific Processing', () => {
      it('should process chat results correctly', () => {
        const rawResult = {
          success: true,
          response: 'Chat response',
          usage: {
            promptTokens: 50,
            completionTokens: 100,
            totalTokens: 150
          },
          sourceRecords: [{
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            name: 'Test Document',
            location: '/Test/Document.md'
          }],
          recordCount: 1
        };
        
        const result = processAIResult(rawResult, 'chat') as ChatResult;
        
        expect(result.response).toBe('Chat response');
        expect(result.usage?.totalTokens).toBe(150);
        expect(result.sourceRecords).toHaveLength(1);
        expect(result.recordCount).toBe(1);
      });

      it('should process summarize results correctly', () => {
        const rawResult = {
          success: true,
          summaryUuid: 'summary-' + AI_TEST_PATTERNS.VALID_UUID,
          summaryId: 54321,
          summaryName: 'Generated Summary',
          summaryLocation: '/Summaries/Summary.md',
          sourceRecords: [{
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            name: 'Source Document',
            location: '/Sources/Doc.md'
          }],
          recordCount: 1,
          wordCount: 250
        };
        
        const result = processAIResult(rawResult, 'summarize') as SummaryResult;
        
        expect(result.summaryUuid).toBe('summary-' + AI_TEST_PATTERNS.VALID_UUID);
        expect(result.summaryId).toBe(54321);
        expect(result.summaryName).toBe('Generated Summary');
        expect(result.wordCount).toBe(250);
      });

      it('should process classify results correctly', () => {
        const rawResult = {
          success: true,
          recordUuid: AI_TEST_PATTERNS.VALID_UUID,
          proposals: [
            {
              name: 'Research Papers',
              type: 'group',
              location: '/Research/Papers',
              score: 0.85,
              confidence: 0.9
            },
            {
              name: 'Academic',
              type: 'tag',
              score: 0.75
            }
          ],
          totalCount: 2
        };
        
        const result = processAIResult(rawResult, 'classify') as ClassifyResult;
        
        expect(result.recordUuid).toBe(AI_TEST_PATTERNS.VALID_UUID);
        expect(result.proposals).toHaveLength(2);
        expect(result.proposals?.[0].name).toBe('Research Papers');
        expect(result.proposals?.[0].score).toBe(0.85);
        expect(result.totalCount).toBe(2);
      });

      it('should process compare results correctly', () => {
        const rawResult = {
          success: true,
          results: {
            similarity: 0.75,
            analysis: 'Documents are similar in topic and structure',
            sourceRecord: {
              uuid: AI_TEST_PATTERNS.VALID_UUID,
              name: 'Source Doc',
              location: '/Source.md'
            },
            similarRecords: [{
              uuid: 'similar-' + AI_TEST_PATTERNS.VALID_UUID,
              name: 'Similar Doc',
              location: '/Similar.md',
              similarity: 0.8
            }]
          }
        };
        
        const result = processAIResult(rawResult, 'compare') as CompareResult;
        
        expect(result.results?.similarity).toBe(0.75);
        expect(result.results?.analysis).toContain('Documents are similar');
        expect(result.results?.similarRecords).toHaveLength(1);
        expect(result.results?.similarRecords?.[0].similarity).toBe(0.8);
      });

      it('should process analyze results correctly', () => {
        const rawResult = {
          success: true,
          analysis: 'Detailed analysis of the content',
          insights: ['Insight 1', 'Insight 2'],
          metrics: { 
            readabilityScore: 85,
            sentimentScore: 0.6 
          },
          sourceRecords: [{
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            name: 'Analyzed Document',
            location: '/Analysis/Doc.md'
          }],
          recordCount: 1
        };
        
        const result = processAIResult(rawResult, 'analyze') as AnalysisResult;
        
        expect(result.analysis).toBe('Detailed analysis of the content');
        expect(result.insights).toEqual(['Insight 1', 'Insight 2']);
        expect(result.metrics?.readabilityScore).toBe(85);
        expect(result.recordCount).toBe(1);
      });

      it('should process generate results correctly', () => {
        const rawResult = {
          success: true,
          generatedUuid: 'generated-' + AI_TEST_PATTERNS.VALID_UUID,
          generatedId: 98765,
          generatedName: 'Generated Content',
          generatedLocation: '/Generated/Content.md',
          content: 'Generated content text',
          wordCount: 150
        };
        
        const result = processAIResult(rawResult, 'generate') as GenerationResult;
        
        expect(result.generatedUuid).toBe('generated-' + AI_TEST_PATTERNS.VALID_UUID);
        expect(result.generatedId).toBe(98765);
        expect(result.content).toBe('Generated content text');
        expect(result.wordCount).toBe(150);
      });
    });

    describe('Data Processing', () => {
      it('should process document references correctly', () => {
        const rawResult = {
          success: true,
          response: 'Test',
          sourceRecords: [
            {
              uuid: AI_TEST_PATTERNS.VALID_UUID,
              id: 12345,
              name: 'Test Document',
              location: '/Test/Document.md',
              type: 'markdown',
              databaseName: 'Test DB',
              databaseUuid: 'db-' + AI_TEST_PATTERNS.VALID_UUID
            },
            null, // Should be filtered out
            {
              uuid: 'invalid-uuid', // Invalid but will be processed
              name: 'Another Doc'
            }
          ]
        };
        
        const result = processAIResult(rawResult, 'chat') as ChatResult;
        
        expect(result.sourceRecords).toHaveLength(2); // null filtered out
        expect(result.sourceRecords?.[0].uuid).toBe(AI_TEST_PATTERNS.VALID_UUID);
        expect(result.sourceRecords?.[0].id).toBe(12345);
        expect(result.sourceRecords?.[0].databaseName).toBe('Test DB');
      });

      it('should filter invalid document references', () => {
        const rawResult = {
          success: true,
          response: 'Test',
          sourceRecords: [
            { name: 'No UUID' }, // Missing UUID, should be filtered
            { uuid: AI_TEST_PATTERNS.VALID_UUID }, // Missing name, should be filtered
            null, // Null reference
            'string ref' // Invalid type
          ]
        };
        
        const result = processAIResult(rawResult, 'chat') as ChatResult;
        
        expect(result.sourceRecords).toHaveLength(0);
      });

      it('should process classification proposals with filtering', () => {
        const rawResult = {
          success: true,
          recordUuid: AI_TEST_PATTERNS.VALID_UUID,
          proposals: [
            { name: 'Valid Proposal', type: 'group', score: 0.8 },
            { name: '', type: 'group' }, // Empty name, should be filtered
            null, // Null proposal
            { type: 'tag' } // Missing name, should be filtered
          ]
        };
        
        const result = processAIResult(rawResult, 'classify') as ClassifyResult;
        
        expect(result.proposals).toHaveLength(1);
        expect(result.proposals?.[0].name).toBe('Valid Proposal');
      });
    });
  });

  describe('processAIError', () => {
    it('should categorize service unavailable errors', () => {
      const error = 'DEVONthink is not running';
      const processed = processAIError(error);
      
      expect(processed.category).toBe(AIErrorCategory.SERVICE_UNAVAILABLE);
      expect(processed.retryable).toBe(true);
      expect(processed.suggestions).toContain('Ensure DEVONthink is running');
    });

    it('should categorize record not found errors', () => {
      const error = 'Record not found with UUID: 12345';
      const processed = processAIError(error);
      
      expect(processed.category).toBe(AIErrorCategory.RECORD_NOT_FOUND);
      expect(processed.retryable).toBe(false);
      expect(processed.suggestions).toContain('Verify the record UUID is correct');
    });

    it('should categorize timeout errors', () => {
      const error = 'Request timeout after 30 seconds';
      const processed = processAIError(error);
      
      expect(processed.category).toBe(AIErrorCategory.TIMEOUT);
      expect(processed.retryable).toBe(true);
      expect(processed.suggestions).toContain('Try again with a smaller request');
    });

    it('should categorize rate limit errors', () => {
      const error = 'Rate limit exceeded. Too many requests.';
      const processed = processAIError(error);
      
      expect(processed.category).toBe(AIErrorCategory.RATE_LIMITED);
      expect(processed.retryable).toBe(true);
      expect(processed.suggestions).toContain('Wait before retrying');
    });

    it('should categorize authentication errors', () => {
      const error = 'Invalid API key authentication failed';
      const processed = processAIError(error);
      
      expect(processed.category).toBe(AIErrorCategory.AUTHENTICATION);
      expect(processed.retryable).toBe(false);
      expect(processed.suggestions).toContain('Check AI service API key configuration');
    });

    it('should categorize insufficient content errors', () => {
      const error = 'Insufficient content for AI processing';
      const processed = processAIError(error);
      
      expect(processed.category).toBe(AIErrorCategory.INSUFFICIENT_CONTENT);
      expect(processed.retryable).toBe(false);
      expect(processed.suggestions).toContain('Ensure records contain sufficient text content');
    });

    it('should categorize validation errors', () => {
      const error = 'Invalid input: validation failed';
      const processed = processAIError(error);
      
      expect(processed.category).toBe(AIErrorCategory.INVALID_INPUT);
      expect(processed.retryable).toBe(false);
      expect(processed.suggestions).toContain('Check input parameters for correct format');
    });

    it('should handle unknown errors', () => {
      const error = 'Some unexpected error occurred';
      const processed = processAIError(error);
      
      expect(processed.category).toBe(AIErrorCategory.UNKNOWN);
      expect(processed.retryable).toBe(false);
      expect(processed.suggestions).toHaveLength(0);
    });

    it('should sanitize error messages', () => {
      const error = 'Error with \x00 control \x1F characters and script: dangerous content';
      const processed = processAIError(error);
      
      expect(processed.message).not.toContain('\x00');
      expect(processed.message).not.toContain('\x1F');
      expect(processed.message).not.toContain('script:');
      expect(processed.originalError).toBe(error); // Original preserved
    });
  });

  describe('mergeAIResults', () => {
    it('should merge successful results', () => {
      const results: BaseAIResult[] = [
        { success: true, operationType: 'chat' },
        { success: true, operationType: 'chat' },
        { success: false, operationType: 'chat', error: 'Failed operation' }
      ];
      
      const merged = mergeAIResults(results, 'chat');
      
      expect(merged.success).toBe(true);
      expect(merged.operationType).toBe('chat');
      expect((merged as any).batchSize).toBe(3);
      expect((merged as any).successfulCount).toBe(2);
      expect((merged as any).failedCount).toBe(1);
    });

    it('should handle all failed results', () => {
      const results: BaseAIResult[] = [
        { success: false, operationType: 'chat', error: 'Error 1' },
        { success: false, operationType: 'chat', error: 'Error 2' }
      ];
      
      const merged = mergeAIResults(results, 'chat');
      
      expect(merged.success).toBe(false);
      expect(merged.error).toContain('Error 1');
      expect(merged.error).toContain('Error 2');
    });

    it('should handle empty results array', () => {
      const results: BaseAIResult[] = [];
      const merged = mergeAIResults(results, 'chat');
      
      expect(merged.success).toBe(false);
      expect(merged.error).toContain('All operations failed');
    });
  });

  describe('Content Sanitization', () => {
    it('should remove control characters', () => {
      const rawResult = {
        success: true,
        response: 'Content with \x00\x01\x1F control characters',
        analysis: 'Analysis with \x08\x0C dangerous chars'
      };
      
      const options: ResultProcessingOptions = { sanitizeContent: true };
      const chatResult = processAIResult(rawResult, 'chat', undefined, options) as ChatResult;
      const analysisResult = processAIResult(rawResult, 'analyze', undefined, options) as AnalysisResult;
      
      expect(chatResult.response).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/);
      expect(analysisResult.analysis).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/);
    });

    it('should handle non-string content', () => {
      const rawResult = {
        success: true,
        response: { message: 'Object response', data: [1, 2, 3] },
        content: 12345
      };
      
      const options: ResultProcessingOptions = { sanitizeContent: true };
      const chatResult = processAIResult(rawResult, 'chat', undefined, options) as ChatResult;
      const genResult = processAIResult(rawResult, 'generate', undefined, options) as GenerationResult;
      
      expect(typeof chatResult.response).toBe('string');
      expect(chatResult.response).toContain('Object response');
      expect(typeof genResult.content).toBe('string');
      expect(genResult.content).toBe('12345');
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed raw results gracefully', () => {
      const malformedResults = [
        undefined,
        null,
        'not json',
        '{"malformed": json}',
        { success: 'not boolean' },
        { operationType: 'invalid' }
      ];
      
      for (const rawResult of malformedResults) {
        expect(() => processAIResult(rawResult, 'chat')).not.toThrow();
        const result = processAIResult(rawResult, 'chat');
        expect(result.operationType).toBe('chat');
      }
    });

    it('should handle extremely large content', () => {
      const hugeContent = 'x'.repeat(100000);
      const rawResult = {
        success: true,
        response: hugeContent
      };
      
      const options: ResultProcessingOptions = {
        sanitizeContent: true,
        maxContentLength: 1000
      };
      
      const result = processAIResult(rawResult, 'chat', undefined, options) as ChatResult;
      
      expect(result.response?.length).toBeLessThan(1100);
      expect(result.response).toContain('[truncated]');
    });

    it('should preserve type safety across operations', () => {
      const chatResult = processAIResult({ success: true, response: 'test' }, 'chat') as ChatResult;
      const summaryResult = processAIResult({ success: true, summaryUuid: 'test' }, 'summarize') as SummaryResult;
      
      expect(chatResult.operationType).toBe('chat');
      expect(summaryResult.operationType).toBe('summarize');
      
      // TypeScript should enforce these types
      expect('response' in chatResult).toBe(true);
      expect('summaryUuid' in summaryResult).toBe(true);
    });
  });
});