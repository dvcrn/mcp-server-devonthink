/**
 * Unit tests for base AI tool functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  BaseAITool,
  createAITool,
  createSimpleAITool,
  TemplateAITool,
  type AIToolConfig,
  AI_TOOL_SCHEMAS,
  AI_VALIDATORS
} from '@/tools/ai/utils/baseAITool.js';
import { executeJxa } from '@/applescript/execute.js';
import { 
  setupDefaultJXAMocks,
  MOCK_AI_RESPONSES 
} from '@tests/mocks/devonthink.js';
import { validateToolStructure, AI_TEST_PATTERNS } from '@tests/utils/test-helpers.js';

// Mock the dependencies
vi.mock('@/applescript/execute.js');

vi.mock('@/tools/ai/utils/aiAvailabilityChecker.js', () => ({
  validateAIPrerequisites: vi.fn().mockResolvedValue({
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: []
  }),
  checkAIServiceAvailability: vi.fn().mockResolvedValue({
    isAvailable: true,
    devonthinkRunning: true,
    aiFeatureEnabled: true,
    availableEngines: ['ChatGPT', 'Claude'],
    defaultEngine: 'ChatGPT'
  })
}));

describe('Base AI Tool Utilities', () => {
  const mockExecuteJxa = vi.mocked(executeJxa);
  
  // Get references to the mocked functions
  let mockValidateAIPrerequisites: any;
  let mockCheckAIServiceAvailability: any;
  
  beforeAll(async () => {
    const module = await import('@/tools/ai/utils/aiAvailabilityChecker.js');
    mockValidateAIPrerequisites = vi.mocked(module.validateAIPrerequisites);
    mockCheckAIServiceAvailability = vi.mocked(module.checkAIServiceAvailability);
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultJXAMocks(mockExecuteJxa);
    
    // Reset AI prerequisites mock to default success state
    mockValidateAIPrerequisites?.mockResolvedValue({
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    });
    
    mockCheckAIServiceAvailability?.mockResolvedValue({
      isAvailable: true,
      devonthinkRunning: true,
      aiFeatureEnabled: true,
      availableEngines: ['ChatGPT', 'Claude'],
      defaultEngine: 'ChatGPT'
    });
  });

  describe('BaseAITool', () => {
    let toolConfig: AIToolConfig;
    let baseAITool: BaseAITool;

    beforeEach(() => {
      toolConfig = {
        name: 'test_ai_tool',
        operationType: 'chat',
        description: 'Test AI tool for unit testing',
        inputSchema: AI_TOOL_SCHEMAS.CHAT,
        scriptBuilder: (input) => `return JSON.stringify(${JSON.stringify(MOCK_AI_RESPONSES.chat)});`,
        customValidators: [AI_VALIDATORS.PROMPT_OR_RECORDS],
        resultProcessingOptions: {
          includeTimestamp: true,
          includeExecutionTime: true,
          sanitizeContent: true
        },
        supportedEngines: ['ChatGPT', 'Claude'],
        examples: ['Test example 1', 'Test example 2']
      };

      baseAITool = new BaseAITool(toolConfig);
    });

    describe('Input Validation', () => {
      it('should validate correct input', () => {
        const input = {
          prompt: 'Test prompt',
          engine: 'ChatGPT',
          temperature: 0.7
        };

        const result = (baseAITool as any).validateInput(input);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject invalid input', () => {
        const input = {
          // Missing prompt and recordUuids
          engine: 'ChatGPT'
        };

        const result = (baseAITool as any).validateInput(input);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it('should apply custom validators', () => {
        const input = {
          // Missing both prompt and recordUuids - should fail PROMPT_OR_RECORDS validator
          engine: 'ChatGPT'
        };

        const result = (baseAITool as any).validateInput(input);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('prompt or recordUuids'))).toBe(true);
      });
    });

    describe('Prerequisites Check', () => {
      it('should pass prerequisites when AI is available', async () => {
        const input = { engine: 'ChatGPT' };
        
        const result = await (baseAITool as any).checkPrerequisites(input);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should fail prerequisites when AI is not available', async () => {
        mockValidateAIPrerequisites.mockResolvedValueOnce({
          isValid: false,
          errors: ['DEVONthink is not running'],
          recommendations: ['Start DEVONthink application']
        });

        const input = { engine: 'ChatGPT' };
        const result = await (baseAITool as any).checkPrerequisites(input);
        
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('DEVONthink is not running');
      });
    });

    describe('Operation Execution', () => {
      it('should execute operation successfully', async () => {
        mockExecuteJxa.mockResolvedValueOnce(MOCK_AI_RESPONSES.chat);

        const input = { prompt: 'Test prompt' };
        const result = await (baseAITool as any).executeOperation(input);

        expect(result.success).toBe(true);
        expect(result.operationType).toBe('chat');
        expect(result.response).toBe(MOCK_AI_RESPONSES.chat.response);
        expect(result.executionTime).toBeDefined();
      });

      it('should handle JXA execution errors', async () => {
        mockExecuteJxa.mockRejectedValueOnce(new Error('JXA execution failed'));

        const input = { prompt: 'Test prompt' };
        const result = await (baseAITool as any).executeOperation(input);

        expect(result.success).toBe(false);
        expect(result.error).toBe('JXA execution failed');
        expect(result.executionTime).toBeDefined();
      });
    });

    describe('Main Run Method', () => {
      it('should complete full execution flow successfully', async () => {
        mockExecuteJxa.mockResolvedValueOnce(MOCK_AI_RESPONSES.chat);

        const input = {
          prompt: 'Test prompt',
          engine: 'ChatGPT'
        };

        const result = await baseAITool.run(input);

        expect(result.success).toBe(true);
        expect(result.operationType).toBe('chat');
        expect(result.timestamp).toBeDefined();
      });

      it('should fail on input validation', async () => {
        const input = {
          // Invalid input - missing prompt and recordUuids
          engine: 'ChatGPT'
        };

        const result = await baseAITool.run(input);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Input validation failed');
      });

      it('should fail on prerequisites check', async () => {
        mockValidateAIPrerequisites.mockResolvedValueOnce({
          isValid: false,
          errors: ['AI features not available'],
          recommendations: []
        });

        const input = {
          prompt: 'Test prompt',
          engine: 'ChatGPT'
        };

        const result = await baseAITool.run(input);

        expect(result.success).toBe(false);
        expect(result.error).toContain('AI service not available');
      });
    });

    describe('MCP Tool Conversion', () => {
      it('should convert to valid MCP tool format', () => {
        const mcpTool = baseAITool.toMCPTool();

        validateToolStructure(mcpTool);
        expect(mcpTool.name).toBe('test_ai_tool');
        expect(mcpTool.description).toContain('Test AI tool for unit testing');
        expect(mcpTool.description).toContain('Supported AI Engines: ChatGPT, Claude');
        expect(mcpTool.description).toContain('Test example 1');
        expect(mcpTool.description).toContain('DEVONthink Pro');
      });

      it('should handle missing optional fields', () => {
        const minimalConfig: AIToolConfig = {
          name: 'minimal_tool',
          operationType: 'chat',
          description: 'Minimal AI tool',
          inputSchema: AI_TOOL_SCHEMAS.CHAT,
          scriptBuilder: () => 'test script'
        };

        const minimalTool = new BaseAITool(minimalConfig);
        const mcpTool = minimalTool.toMCPTool();

        expect(mcpTool.description).toContain('Minimal AI tool');
        expect(mcpTool.description).not.toContain('Supported AI Engines:');
        expect(mcpTool.description).not.toContain('Examples:');
        expect(mcpTool.description).toContain('DEVONthink Pro');
      });
    });
  });

  describe('AI Tool Factory Functions', () => {
    describe('createAITool', () => {
      it('should create a valid AI tool', () => {
        const config: AIToolConfig = {
          name: 'factory_test_tool',
          operationType: 'analyze',
          description: 'Factory created AI tool',
          inputSchema: AI_TOOL_SCHEMAS.ANALYSIS,
          scriptBuilder: () => 'factory test script'
        };

        const tool = createAITool(config);

        validateToolStructure(tool);
        expect(tool.name).toBe('factory_test_tool');
        expect(typeof tool.run).toBe('function');
      });

      it('should create functional tool that can be executed', async () => {
        mockExecuteJxa.mockResolvedValueOnce({
          success: true,
          operationType: 'analyze',
          analysis: 'Factory tool analysis result'
        });

        const config: AIToolConfig = {
          name: 'functional_test_tool',
          operationType: 'analyze',
          description: 'Functional test AI tool',
          inputSchema: AI_TOOL_SCHEMAS.ANALYSIS,
          scriptBuilder: () => 'return JSON.stringify({success: true, analysis: "test"});'
        };

        const tool = createAITool(config);
        const result = await tool.run({
          recordUuids: [AI_TEST_PATTERNS.VALID_UUID]
        });

        expect(result.success).toBe(true);
        expect((result as any).analysis).toBe('Factory tool analysis result');
      });
    });

    describe('createSimpleAITool', () => {
      it('should create simple chat tool with defaults', () => {
        const tool = createSimpleAITool(
          'simple_chat',
          'Simple chat tool',
          'chat',
          () => 'simple script'
        );

        validateToolStructure(tool);
        expect(tool.name).toBe('simple_chat');
        expect(tool.description).toContain('Simple chat tool');
      });

      it('should create analysis tool with appropriate schema', () => {
        const tool = createSimpleAITool(
          'simple_analysis',
          'Simple analysis tool',
          'analyze',
          () => 'analysis script'
        );

        expect(tool.name).toBe('simple_analysis');
        // The input schema should be the analysis schema
        expect(tool.inputSchema).toBeDefined();
      });

      it('should create generation tool with appropriate schema', () => {
        const tool = createSimpleAITool(
          'simple_generation',
          'Simple generation tool',
          'generate',
          () => 'generation script'
        );

        expect(tool.name).toBe('simple_generation');
        expect(tool.inputSchema).toBeDefined();
      });

      it('should accept custom input schema', () => {
        const customSchema = AI_TOOL_SCHEMAS.COMPARISON;
        const tool = createSimpleAITool(
          'custom_schema',
          'Tool with custom schema',
          'compare',
          () => 'custom script',
          customSchema
        );

        expect(tool.name).toBe('custom_schema');
        expect(tool.inputSchema).toBeDefined();
      });

      it('should create functional simple tools', async () => {
        mockExecuteJxa.mockResolvedValueOnce({
          success: true,
          operationType: 'generate',
          content: 'Simple tool generated content'
        });

        const tool = createSimpleAITool(
          'functional_simple',
          'Functional simple tool',
          'generate',
          (input) => `return JSON.stringify({success: true, content: "Generated for: ${input.prompt}"});`
        );

        const result = await tool.run({
          prompt: 'Generate something interesting'
        });

        expect(result.success).toBe(true);
        expect((result as any).content).toBe('Simple tool generated content');
      });
    });
  });

  describe('AI Tool Schemas', () => {
    it('should provide CHAT schema', () => {
      const schema = AI_TOOL_SCHEMAS.CHAT;
      expect(schema).toBeDefined();
      
      // Should accept valid chat input
      const validInput = {
        prompt: 'Test prompt',
        engine: 'ChatGPT',
        recordUuids: [AI_TEST_PATTERNS.VALID_UUID],
        mode: 'context'
      };
      
      const parseResult = schema.safeParse(validInput);
      expect(parseResult.success).toBe(true);
    });

    it('should provide ANALYSIS schema', () => {
      const schema = AI_TOOL_SCHEMAS.ANALYSIS;
      expect(schema).toBeDefined();
      
      const validInput = {
        recordUuids: [AI_TEST_PATTERNS.VALID_UUID],
        engine: 'ChatGPT',
        analysisType: 'content-analysis',
        includeMetadata: true
      };
      
      const parseResult = schema.safeParse(validInput);
      expect(parseResult.success).toBe(true);
    });

    it('should provide GENERATION schema', () => {
      const schema = AI_TOOL_SCHEMAS.GENERATION;
      expect(schema).toBeDefined();
      
      const validInput = {
        prompt: 'Generate a document',
        engine: 'ChatGPT',
        destinationGroupUuid: AI_TEST_PATTERNS.VALID_UUID,
        fileName: 'generated-doc.md'
      };
      
      const parseResult = schema.safeParse(validInput);
      expect(parseResult.success).toBe(true);
    });

    it('should provide CLASSIFICATION schema', () => {
      const schema = AI_TOOL_SCHEMAS.CLASSIFICATION;
      expect(schema).toBeDefined();
      
      const validInput = {
        recordUuid: AI_TEST_PATTERNS.VALID_UUID,
        engine: 'ChatGPT',
        comparison: 'data comparison',
        tags: true
      };
      
      const parseResult = schema.safeParse(validInput);
      expect(parseResult.success).toBe(true);
    });

    it('should provide COMPARISON schema', () => {
      const schema = AI_TOOL_SCHEMAS.COMPARISON;
      expect(schema).toBeDefined();
      
      const validInput = {
        recordUuid: AI_TEST_PATTERNS.VALID_UUID,
        targetRecordUuid: '223e4567-e89b-12d3-a456-426614174000', // Another valid UUID
        engine: 'ChatGPT',
        maxResults: 10
      };
      
      const parseResult = schema.safeParse(validInput);
      expect(parseResult.success).toBe(true);
    });
  });

  describe('AI Validators', () => {
    describe('PROMPT_OR_RECORDS', () => {
      it('should pass when prompt is provided', () => {
        const input = { prompt: 'Test prompt' };
        const errors = AI_VALIDATORS.PROMPT_OR_RECORDS(input);
        expect(errors).toHaveLength(0);
      });

      it('should pass when recordUuids are provided', () => {
        const input = { recordUuids: [AI_TEST_PATTERNS.VALID_UUID] };
        const errors = AI_VALIDATORS.PROMPT_OR_RECORDS(input);
        expect(errors).toHaveLength(0);
      });

      it('should fail when neither prompt nor recordUuids are provided', () => {
        const input = { engine: 'ChatGPT' };
        const errors = AI_VALIDATORS.PROMPT_OR_RECORDS(input);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('prompt or recordUuids');
      });
    });

    describe('REQUIRES_RECORDS', () => {
      it('should pass when recordUuids are provided', () => {
        const input = { recordUuids: [AI_TEST_PATTERNS.VALID_UUID] };
        const errors = AI_VALIDATORS.REQUIRES_RECORDS(input);
        expect(errors).toHaveLength(0);
      });

      it('should fail when recordUuids are missing', () => {
        const input = { prompt: 'Test prompt' };
        const errors = AI_VALIDATORS.REQUIRES_RECORDS(input);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('recordUuids is required');
      });

      it('should fail when recordUuids array is empty', () => {
        const input = { recordUuids: [] };
        const errors = AI_VALIDATORS.REQUIRES_RECORDS(input);
        expect(errors).toHaveLength(1);
      });
    });

    describe('REQUIRES_PROMPT', () => {
      it('should pass when prompt is provided', () => {
        const input = { prompt: 'Valid prompt' };
        const errors = AI_VALIDATORS.REQUIRES_PROMPT(input);
        expect(errors).toHaveLength(0);
      });

      it('should fail when prompt is missing', () => {
        const input = { recordUuids: [AI_TEST_PATTERNS.VALID_UUID] };
        const errors = AI_VALIDATORS.REQUIRES_PROMPT(input);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('prompt is required');
      });

      it('should fail when prompt is empty string', () => {
        const input = { prompt: '' };
        const errors = AI_VALIDATORS.REQUIRES_PROMPT(input);
        expect(errors).toHaveLength(1);
      });

      it('should fail when prompt is only whitespace', () => {
        const input = { prompt: '   \t\n   ' };
        const errors = AI_VALIDATORS.REQUIRES_PROMPT(input);
        expect(errors).toHaveLength(1);
      });
    });

    describe('VALID_RECORD_UUID', () => {
      it('should pass with valid UUIDs', () => {
        const input = {
          recordUuid: AI_TEST_PATTERNS.VALID_UUID,
          targetRecordUuid: '223e4567-e89b-12d3-a456-426614174000' // Another valid UUID
        };
        const errors = AI_VALIDATORS.VALID_RECORD_UUID(input);
        expect(errors).toHaveLength(0);
      });

      it('should fail with invalid recordUuid', () => {
        const input = { recordUuid: 'invalid-uuid' };
        const errors = AI_VALIDATORS.VALID_RECORD_UUID(input);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('recordUuid must be a valid UUID');
      });

      it('should fail with invalid targetRecordUuid', () => {
        const input = { 
          recordUuid: AI_TEST_PATTERNS.VALID_UUID,
          targetRecordUuid: 'invalid-target-uuid'
        };
        const errors = AI_VALIDATORS.VALID_RECORD_UUID(input);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain('targetRecordUuid must be a valid UUID');
      });

      it('should report multiple UUID errors', () => {
        const input = {
          recordUuid: 'invalid-uuid-1',
          targetRecordUuid: 'invalid-uuid-2'
        };
        const errors = AI_VALIDATORS.VALID_RECORD_UUID(input);
        expect(errors).toHaveLength(2);
      });
    });
  });

  describe('TemplateAITool', () => {
    it('should create valid template tool', () => {
      const templateTool = new TemplateAITool();
      const mcpTool = templateTool.toMCPTool();

      validateToolStructure(mcpTool);
      expect(mcpTool.name).toBe('template_ai_operation');
      expect(mcpTool.description).toContain('Template for creating new AI tools');
      expect(mcpTool.description).toContain('ChatGPT, Claude, Gemini');
    });

    it('should execute template operation', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        success: true,
        operationType: 'chat',
        response: 'Template response'
      });

      const templateTool = new TemplateAITool();
      const result = await templateTool.run({
        prompt: 'Test template execution'
      });

      expect(result.success).toBe(true);
      expect((result as any).response).toBe('Template response');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed tool configurations', () => {
      const invalidConfig = {
        name: '', // Invalid empty name
        operationType: 'invalid-op' as any,
        description: '',
        inputSchema: AI_TOOL_SCHEMAS.CHAT,
        scriptBuilder: () => ''
      };

      expect(() => new BaseAITool(invalidConfig)).not.toThrow();
      // Should still create tool, validation happens at runtime
    });

    it('should handle script builder that throws', async () => {
      const faultyConfig: AIToolConfig = {
        name: 'faulty_tool',
        operationType: 'chat',
        description: 'Tool with faulty script builder',
        inputSchema: AI_TOOL_SCHEMAS.CHAT,
        scriptBuilder: () => {
          throw new Error('Script builder error');
        }
      };

      const faultyTool = new BaseAITool(faultyConfig);
      const result = await faultyTool.run({
        prompt: 'Test prompt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Script builder error');
    });

    it('should handle unexpected JXA responses', async () => {
      mockExecuteJxa.mockResolvedValueOnce(null); // Unexpected null response

      const tool = createSimpleAITool(
        'null_response_test',
        'Test null response handling',
        'chat',
        () => 'test script'
      );

      const result = await tool.run({
        prompt: 'Test prompt'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No result received');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle very large inputs', async () => {
      mockExecuteJxa.mockResolvedValueOnce(MOCK_AI_RESPONSES.chat);

      const largePrompt = 'x'.repeat(10000);
      const tool = createSimpleAITool(
        'large_input_test',
        'Test large input handling',
        'chat',
        () => 'test script'
      );

      const result = await tool.run({
        prompt: largePrompt
      });

      expect(result.executionTime).toBeDefined();
      // Should not crash or timeout
    });

    it('should handle concurrent tool executions', async () => {
      mockExecuteJxa.mockResolvedValue(MOCK_AI_RESPONSES.chat);

      const tool = createSimpleAITool(
        'concurrent_test',
        'Test concurrent execution',
        'chat',
        () => 'test script'
      );

      const promises = Array(5).fill(null).map((_, i) => 
        tool.run({ prompt: `Concurrent test ${i}` })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });
});