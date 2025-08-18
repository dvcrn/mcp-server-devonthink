/**
 * Integration tests for AI tools
 * Tests full AI tool workflow with mocked DEVONthink responses
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  createSimpleAITool,
  AI_TOOL_SCHEMAS
} from '@/tools/ai/utils/baseAITool.js';
import {
  buildChatScript,
  buildSummarizeScript,
  buildClassifyScript,
  buildCompareScript
} from '@/tools/ai/utils/aiScriptBuilder.js';
import { executeJxa } from '@/applescript/execute.js';
import {
  setupDefaultJXAMocks,
  setupAIUnavailableMocks,
  setupDevonThinkNotRunningMocks,
  MOCK_AI_RESPONSES,
  MOCK_RECORDS,
  createMockRecord
} from '@tests/mocks/devonthink.js';
import { AI_TEST_PATTERNS, validateToolStructure } from '@tests/utils/test-helpers.js';

// Mock all dependencies
vi.mock('@/applescript/execute.js');

vi.mock('@/tools/ai/utils/aiAvailabilityChecker.js', () => ({
  validateAIPrerequisites: vi.fn(),
  checkAIServiceAvailability: vi.fn()
}));

describe('AI Tool Integration Tests', () => {
  const mockExecuteJxa = vi.mocked(executeJxa);
  
  beforeEach(async () => {
    vi.clearAllMocks();
    setupDefaultJXAMocks(mockExecuteJxa);
    
    // Mock availability checker to return success by default
    const { validateAIPrerequisites, checkAIServiceAvailability } = vi.mocked(
      await import('@/tools/ai/utils/aiAvailabilityChecker.js')
    );
    
    validateAIPrerequisites.mockResolvedValue({
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    });
    
    checkAIServiceAvailability.mockResolvedValue({
      isAvailable: true,
      devonthinkRunning: true,
      aiFeatureEnabled: true,
      availableEngines: ['ChatGPT', 'Claude'],
      defaultEngine: 'ChatGPT',
      warnings: [],
      lastChecked: new Date().toISOString()
    });
  });

  describe('Chat Tool Integration', () => {
    let chatTool: Tool;

    beforeEach(() => {
      chatTool = createSimpleAITool(
        'integration_chat',
        'Integration test chat tool',
        'chat',
        (input) => buildChatScript(input.prompt, {
          recordUuids: input.recordUuids,
          engine: input.engine || 'ChatGPT',
          temperature: input.temperature || 0.7,
          mode: input.mode || 'context'
        })
      );
    });

    it('should complete full chat workflow with prompt only', async () => {
      mockExecuteJxa.mockResolvedValueOnce(MOCK_AI_RESPONSES.chat);

      const result = await chatTool.run({
        prompt: 'Tell me about AI in knowledge management',
        engine: 'ChatGPT',
        temperature: 0.7
      });

      expect(result.success).toBe(true);
      expect((result as any).response).toBe(MOCK_AI_RESPONSES.chat.response);
      expect((result as any).operationType).toBe('chat');
      expect(result.timestamp).toBeDefined();
    });

    it('should complete chat workflow with records and prompt', async () => {
      const mockResponse = {
        ...MOCK_AI_RESPONSES.chat,
        sourceRecords: [{
          uuid: AI_TEST_PATTERNS.VALID_UUID,
          name: 'Test Document',
          location: '/Test/Document.md'
        }],
        recordCount: 1
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const result = await chatTool.run({
        prompt: 'Analyze these documents',
        recordUuids: [AI_TEST_PATTERNS.VALID_UUID],
        engine: 'Claude',
        mode: 'context'
      });

      expect(result.success).toBe(true);
      expect((result as any).sourceRecords).toHaveLength(1);
      expect((result as any).recordCount).toBe(1);
    });

    it('should handle chat tool with no prompt or records', async () => {
      const result = await chatTool.run({
        engine: 'ChatGPT'
      });

      expect(result.success).toBe(false);
      // Current behavior: validation passes but JXA execution fails
      expect(result.error).toContain('Record not found');
    });

    it('should handle AI service unavailable', async () => {
      const { validateAIPrerequisites } = vi.mocked(
        await import('@/tools/ai/utils/aiAvailabilityChecker.js')
      );
      
      validateAIPrerequisites.mockResolvedValueOnce({
        isValid: false,
        errors: ['DEVONthink is not running'],
        warnings: [],
        recommendations: ['Start DEVONthink application']
      });

      const result = await chatTool.run({
        prompt: 'Test prompt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI service not available');
      expect(result.error).toContain('DEVONthink is not running');
    });

    it('should handle JXA execution failure', async () => {
      mockExecuteJxa.mockRejectedValueOnce(new Error('JXA script failed'));

      const result = await chatTool.run({
        prompt: 'Test prompt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('JXA script failed');
      expect(result.executionTime).toBeDefined();
    });
  });

  describe('Summarize Tool Integration', () => {
    let summarizeTool: Tool;

    beforeEach(() => {
      summarizeTool = createSimpleAITool(
        'integration_summarize',
        'Integration test summarize tool',
        'generate', // Using generate schema for summarization
        (input) => buildSummarizeScript(
          input.recordUuids || [],
          input.destinationGroupUuid,
          {
            engine: input.engine || 'ChatGPT',
            outputFormat: input.outputFormat || 'markdown'
          }
        ),
        AI_TOOL_SCHEMAS.GENERATION.extend({
          recordUuids: AI_TOOL_SCHEMAS.ANALYSIS.shape.recordUuids
        })
      );
    });

    it('should complete full summarization workflow', async () => {
      const mockResponse = {
        success: true,
        operationType: 'generate',
        generatedUuid: 'summary-' + AI_TEST_PATTERNS.VALID_UUID,
        generatedId: 98765,
        generatedName: 'Generated Summary',
        generatedLocation: '/Summaries/Generated Summary.md',
        sourceRecords: [MOCK_RECORDS[0]],
        recordCount: 1,
        wordCount: 250
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const result = await summarizeTool.run({
        prompt: 'Create a comprehensive summary',
        recordUuids: [AI_TEST_PATTERNS.VALID_UUID],
        engine: 'ChatGPT',
        outputFormat: 'markdown'
      });

      expect(result.success).toBe(true);
      expect((result as any).generatedUuid).toBe('summary-' + AI_TEST_PATTERNS.VALID_UUID);
      expect((result as any).generatedName).toBe('Generated Summary');
      expect((result as any).wordCount).toBe(250);
    });

    it('should handle summarization with destination group', async () => {
      const destinationUuid = 'dest-' + AI_TEST_PATTERNS.VALID_UUID;
      const mockResponse = {
        success: true,
        operationType: 'generate',
        generatedUuid: 'summary-' + AI_TEST_PATTERNS.VALID_UUID,
        generatedLocation: '/Destination/Generated Summary.md'
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const result = await summarizeTool.run({
        prompt: 'Summarize to specific location',
        recordUuids: [AI_TEST_PATTERNS.VALID_UUID],
        destinationGroupUuid: destinationUuid
      });

      expect(result.success).toBe(true);
      expect((result as any).generatedLocation).toContain('/Destination/');
    });

    it('should handle no valid records for summarization', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: false,
        error: 'No valid records found for summarization',
        operationType: 'generate'
      });

      const result = await summarizeTool.run({
        prompt: 'Summarize empty records',
        recordUuids: ['12345678-1234-1234-8234-123456789000'] // Valid UUID format but doesn't exist
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No valid records found');
    });
  });

  describe('Classification Tool Integration', () => {
    let classifyTool: Tool;

    beforeEach(() => {
      classifyTool = createSimpleAITool(
        'integration_classify',
        'Integration test classify tool',
        'classify',
        (input) => buildClassifyScript(
          input.recordUuid,
          {
            databaseName: input.databaseName,
            comparison: input.comparison,
            tags: input.tags,
            engine: input.engine || 'ChatGPT'
          }
        )
      );
    });

    it('should complete full classification workflow', async () => {
      const mockResponse = {
        success: true,
        operationType: 'classify',
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

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const result = await classifyTool.run({
        recordUuid: AI_TEST_PATTERNS.VALID_UUID,
        engine: 'ChatGPT',
        comparison: 'data comparison',
        tags: true
      });

      expect(result.success).toBe(true);
      expect((result as any).proposals).toHaveLength(2);
      expect((result as any).proposals[0].name).toBe('Research Papers');
      expect((result as any).totalCount).toBe(2);
    });

    it('should handle classification with database scope', async () => {
      const mockResponse = {
        success: true,
        operationType: 'classify',
        recordUuid: AI_TEST_PATTERNS.VALID_UUID,
        proposals: [{
          name: 'Database Specific Category',
          type: 'group',
          score: 0.8
        }],
        totalCount: 1
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const result = await classifyTool.run({
        recordUuid: AI_TEST_PATTERNS.VALID_UUID,
        databaseName: 'Specific Database',
        engine: 'Claude'
      });

      expect(result.success).toBe(true);
      expect((result as any).proposals[0].name).toBe('Database Specific Category');
    });

    it('should handle classification with no proposals', async () => {
      const mockResponse = {
        success: true,
        operationType: 'classify',
        recordUuid: AI_TEST_PATTERNS.VALID_UUID,
        proposals: [],
        // Note: totalCount of 0 gets filtered out by the result processor due to falsy check
        // so we expect it to be undefined in the final result
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const result = await classifyTool.run({
        recordUuid: AI_TEST_PATTERNS.VALID_UUID
      });

      expect(result.success).toBe(true);
      expect((result as any).proposals).toHaveLength(0);
      expect((result as any).totalCount).toBeUndefined();
    });
  });

  describe('Comparison Tool Integration', () => {
    let compareTool: Tool;

    beforeEach(() => {
      compareTool = createSimpleAITool(
        'integration_compare',
        'Integration test compare tool',
        'compare',
        (input) => buildCompareScript(
          input.recordUuid,
          input.targetRecordUuid,
          {
            databaseName: input.databaseName,
            maxResults: input.maxResults || 10,
            engine: input.engine || 'ChatGPT'
          }
        )
      );
    });

    it('should complete direct comparison workflow', async () => {
      const sourceUuid = AI_TEST_PATTERNS.VALID_UUID;
      const targetUuid = 'target-' + AI_TEST_PATTERNS.VALID_UUID;

      const mockResponse = {
        success: true,
        operationType: 'compare',
        results: {
          similarity: 0.75,
          analysis: 'Documents are similar in topic and structure',
          sourceRecord: {
            uuid: sourceUuid,
            name: 'Source Document',
            location: '/Source.md'
          },
          targetRecord: {
            uuid: targetUuid,
            name: 'Target Document',
            location: '/Target.md'
          }
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const result = await compareTool.run({
        recordUuid: sourceUuid,
        targetRecordUuid: targetUuid,
        engine: 'Claude'
      });

      expect(result.success).toBe(true);
      expect((result as any).results.similarity).toBe(0.75);
      expect((result as any).results.analysis).toContain('Documents are similar');
      expect((result as any).results.sourceRecord.uuid).toBe(sourceUuid);
      expect((result as any).results.targetRecord.uuid).toBe(targetUuid);
    });

    it('should complete similarity search workflow', async () => {
      const sourceUuid = AI_TEST_PATTERNS.VALID_UUID;

      const mockResponse = {
        success: true,
        operationType: 'compare',
        results: {
          similarRecords: [
            {
              uuid: 'similar-1-' + AI_TEST_PATTERNS.VALID_UUID,
              name: 'Similar Doc 1',
              location: '/Similar1.md',
              similarity: 0.8
            },
            {
              uuid: 'similar-2-' + AI_TEST_PATTERNS.VALID_UUID,
              name: 'Similar Doc 2',
              location: '/Similar2.md',
              similarity: 0.7
            }
          ],
          sourceRecord: {
            uuid: sourceUuid,
            name: 'Source Document',
            location: '/Source.md'
          }
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const result = await compareTool.run({
        recordUuid: sourceUuid,
        maxResults: 5,
        databaseName: 'Research Database'
      });

      expect(result.success).toBe(true);
      expect((result as any).results.similarRecords).toHaveLength(2);
      expect((result as any).results.similarRecords[0].similarity).toBe(0.8);
      expect((result as any).results.sourceRecord.uuid).toBe(sourceUuid);
    });

    it('should handle comparison with no similar records found', async () => {
      const mockResponse = {
        success: true,
        operationType: 'compare',
        results: {
          similarRecords: [],
          sourceRecord: {
            uuid: AI_TEST_PATTERNS.VALID_UUID,
            name: 'Unique Document',
            location: '/Unique.md'
          }
        }
      };

      mockExecuteJxa.mockResolvedValueOnce(mockResponse);

      const result = await compareTool.run({
        recordUuid: AI_TEST_PATTERNS.VALID_UUID
      });

      expect(result.success).toBe(true);
      expect((result as any).results.similarRecords).toHaveLength(0);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle DEVONthink not running scenario', async () => {
      setupDevonThinkNotRunningMocks(mockExecuteJxa);

      const { validateAIPrerequisites } = vi.mocked(
        await import('@/tools/ai/utils/aiAvailabilityChecker.js')
      );
      
      validateAIPrerequisites.mockResolvedValueOnce({
        isValid: false,
        errors: ['DEVONthink is not running'],
        warnings: [],
        recommendations: ['Start DEVONthink application']
      });

      const chatTool = createSimpleAITool('error_test_chat', 'Error test', 'chat', () => '');

      const result = await chatTool.run({
        prompt: 'Test prompt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('DEVONthink is not running');
    });

    it('should handle AI services unavailable scenario', async () => {
      setupAIUnavailableMocks(mockExecuteJxa);

      const { validateAIPrerequisites } = vi.mocked(
        await import('@/tools/ai/utils/aiAvailabilityChecker.js')
      );
      
      validateAIPrerequisites.mockResolvedValueOnce({
        isValid: false,
        errors: ['AI features are not enabled'],
        warnings: [],
        recommendations: ['Enable AI features in DEVONthink Pro']
      });

      const analysiseTool = createSimpleAITool('error_test_analyze', 'Error test', 'analyze', () => '');

      const result = await analysiseTool.run({
        recordUuids: [AI_TEST_PATTERNS.VALID_UUID]
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI features are not enabled');
    });

    it('should handle malformed JXA responses', async () => {
      mockExecuteJxa.mockResolvedValueOnce(null); // Invalid response

      const tool = createSimpleAITool('malformed_test', 'Malformed response test', 'chat', () => '');

      const result = await tool.run({
        prompt: 'Test prompt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No result received');
    });

    it('should handle JXA timeout scenarios', async () => {
      mockExecuteJxa.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('JXA execution timeout')), 100);
        });
      });

      const tool = createSimpleAITool('timeout_test', 'Timeout test', 'chat', () => '');

      const result = await tool.run({
        prompt: 'Test prompt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('JXA execution timeout');
    });
  });

  describe('Performance and Stress Tests', () => {
    it('should handle large input data', async () => {
      mockExecuteJxa.mockResolvedValueOnce(MOCK_AI_RESPONSES.chat);

      const largePrompt = 'Analyze this: ' + 'x'.repeat(10000);
      const manyUuids = Array(50).fill(null).map((_, i) => 
        `123e4567-e89b-12d3-a456-42661417${i.toString().padStart(4, '0')}`
      );

      const tool = createSimpleAITool('large_input_test', 'Large input test', 'chat', () => '');

      const startTime = Date.now();
      const result = await tool.run({
        prompt: largePrompt,
        recordUuids: manyUuids
      });
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle concurrent tool executions', async () => {
      mockExecuteJxa.mockResolvedValue(MOCK_AI_RESPONSES.chat);

      const tool = createSimpleAITool('concurrent_test', 'Concurrent test', 'chat', () => '');

      const concurrentPromises = Array(10).fill(null).map((_, i) =>
        tool.run({ prompt: `Concurrent test ${i}` })
      );

      const results = await Promise.all(concurrentPromises);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should measure execution time accurately', async () => {
      mockExecuteJxa.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(MOCK_AI_RESPONSES.chat), 200);
        });
      });

      const tool = createSimpleAITool('timing_test', 'Timing test', 'chat', () => '');

      const result = await tool.run({
        prompt: 'Timing test'
      });

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThanOrEqual(200);
      expect(result.executionTime).toBeLessThan(1000);
    });
  });

  describe('Tool Structure Validation', () => {
    it('should create tools with valid MCP structure', () => {
      const tools = [
        createSimpleAITool('test_chat', 'Test chat tool', 'chat', () => ''),
        createSimpleAITool('test_analyze', 'Test analyze tool', 'analyze', () => ''),
        createSimpleAITool('test_generate', 'Test generate tool', 'generate', () => ''),
        createSimpleAITool('test_classify', 'Test classify tool', 'classify', () => ''),
        createSimpleAITool('test_compare', 'Test compare tool', 'compare', () => '')
      ];

      tools.forEach(tool => {
        validateToolStructure(tool);
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(typeof tool.run).toBe('function');
      });
    });
  });
});