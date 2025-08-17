/**
 * Base AI Tool Pattern for DEVONthink MCP Server
 * Provides a standardized template and utilities for implementing AI tools
 */

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../../../applescript/execute.js";
import {
  validateAIToolInput,
  AIOperationType,
  AIValidationResult,
  BaseAIInputSchema,
  RecordBasedAIInputSchema,
  PromptBasedAIInputSchema
} from "./aiValidation.js";
import {
  processAIResult,
  BaseAIResult,
  ResultProcessingOptions
} from "./resultProcessor.js";
import {
  validateAIPrerequisites,
  checkAIServiceAvailability
} from "./aiAvailabilityChecker.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

/**
 * Configuration for creating an AI tool
 */
export interface AIToolConfig {
  name: string;
  operationType: AIOperationType;
  description: string;
  inputSchema: z.ZodSchema;
  scriptBuilder: (input: any) => string;
  customValidators?: ((input: Record<string, any>) => string[])[];
  resultProcessingOptions?: ResultProcessingOptions;
  requiresRecords?: boolean;
  requiresPrompt?: boolean;
  supportedEngines?: string[];
  examples?: string[];
}

/**
 * Base class for AI tools - provides common functionality
 */
export class BaseAITool {
  protected config: AIToolConfig;
  
  constructor(config: AIToolConfig) {
    this.config = config;
  }

  /**
   * Validates input using AI-specific validation rules
   */
  protected validateInput(input: Record<string, any>): AIValidationResult {
    const customValidators = this.config.customValidators?.map(validator => 
      (input: Record<string, any>) => validator(input).map(msg => ({ 
        field: 'input', 
        message: msg, 
        code: 'INVALID_INPUT' as const 
      }))
    ) || [];

    return validateAIToolInput(input, this.config.operationType, customValidators);
  }

  /**
   * Checks AI service prerequisites
   */
  protected async checkPrerequisites(input: Record<string, any>): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    const requiredEngine = input.engine;
    const validation = await validateAIPrerequisites(requiredEngine, this.config.operationType);
    
    if (!validation.isValid) {
      return {
        isValid: false,
        error: `AI service not available: ${validation.errors.join(', ')}. ${validation.recommendations.join(' ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Executes the AI operation
   */
  protected async executeOperation(input: Record<string, any>): Promise<BaseAIResult> {
    const startTime = Date.now();

    try {
      // Build and execute the JXA script
      const script = this.config.scriptBuilder(input);
      const rawResult = await executeJxa<any>(script);

      // Process the result
      return processAIResult(
        rawResult, 
        this.config.operationType, 
        startTime,
        this.config.resultProcessingOptions
      );
    } catch (error) {
      return {
        success: false,
        operationType: this.config.operationType,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Main tool execution method
   */
  async run(input: Record<string, any>): Promise<BaseAIResult> {
    // Input validation
    const inputValidation = this.validateInput(input);
    if (!inputValidation.isValid) {
      return {
        success: false,
        operationType: this.config.operationType,
        error: `Input validation failed: ${inputValidation.errors.map(e => e.message).join(', ')}`,
        timestamp: new Date().toISOString()
      };
    }

    // Prerequisites check
    const prerequisitesCheck = await this.checkPrerequisites(input);
    if (!prerequisitesCheck.isValid) {
      return {
        success: false,
        operationType: this.config.operationType,
        error: prerequisitesCheck.error,
        timestamp: new Date().toISOString()
      };
    }

    // Execute the operation
    return await this.executeOperation(inputValidation.sanitizedInput!);
  }

  /**
   * Converts the tool to MCP Tool format
   */
  toMCPTool(): Tool {
    return {
      name: this.config.name,
      description: this.buildFullDescription(),
      inputSchema: zodToJsonSchema(this.config.inputSchema) as ToolInput,
      run: this.run.bind(this)
    };
  }

  /**
   * Builds full description with examples and usage notes
   */
  private buildFullDescription(): string {
    let description = this.config.description;

    if (this.config.supportedEngines && this.config.supportedEngines.length > 0) {
      description += `\n\nSupported AI Engines: ${this.config.supportedEngines.join(', ')}`;
    }

    if (this.config.examples && this.config.examples.length > 0) {
      description += `\n\nExamples:\n${this.config.examples.map(ex => `• ${ex}`).join('\n')}`;
    }

    description += `\n\nNote: Requires DEVONthink Pro with AI features enabled and configured.`;

    return description;
  }
}

/**
 * Factory function for creating AI tools with common patterns
 */
export function createAITool(config: AIToolConfig): Tool {
  const tool = new BaseAITool(config);
  return tool.toMCPTool();
}

/**
 * Pre-built schema combinations for common AI tool types
 */
export const AI_TOOL_SCHEMAS = {
  /**
   * For chat-style tools that work with prompts and optional records
   */
  CHAT: PromptBasedAIInputSchema.extend({
    recordUuids: z.array(z.string().uuid()).optional(),
    mode: z.enum(['append', 'replace', 'context']).optional().default('context')
  }),

  /**
   * For analysis tools that require records
   */
  ANALYSIS: RecordBasedAIInputSchema.extend({
    analysisType: z.string().optional(),
    includeMetadata: z.boolean().optional().default(true)
  }),

  /**
   * For generation tools that create new content
   */
  GENERATION: PromptBasedAIInputSchema.extend({
    destinationGroupUuid: z.string().uuid().optional(),
    fileName: z.string().optional(),
    includeSourceRefs: z.boolean().optional().default(true)
  }),

  /**
   * For classification tools
   */
  CLASSIFICATION: z.object({
    recordUuid: z.string().uuid(),
    databaseName: z.string().optional(),
    comparison: z.enum(['data comparison', 'tags comparison']).optional(),
    tags: z.boolean().optional().default(false)
  }).merge(BaseAIInputSchema),

  /**
   * For comparison/similarity tools
   */
  COMPARISON: z.object({
    recordUuid: z.string().uuid(),
    targetRecordUuid: z.string().uuid().optional(),
    databaseName: z.string().optional(),
    maxResults: z.number().min(1).max(50).optional().default(10)
  }).merge(BaseAIInputSchema)
};

/**
 * Common validation patterns for AI tools
 */
export const AI_VALIDATORS = {
  /**
   * Validates that at least one of prompt or records is provided
   */
  PROMPT_OR_RECORDS: (input: Record<string, any>): string[] => {
    if (!input.prompt && (!input.recordUuids || input.recordUuids.length === 0)) {
      return ['Either prompt or recordUuids must be provided'];
    }
    return [];
  },

  /**
   * Validates that records are provided for analysis
   */
  REQUIRES_RECORDS: (input: Record<string, any>): string[] => {
    if (!input.recordUuids || input.recordUuids.length === 0) {
      return ['recordUuids is required for this operation'];
    }
    return [];
  },

  /**
   * Validates that a prompt is provided
   */
  REQUIRES_PROMPT: (input: Record<string, any>): string[] => {
    if (!input.prompt || input.prompt.trim() === '') {
      return ['prompt is required for this operation'];
    }
    return [];
  },

  /**
   * Validates record UUID format
   */
  VALID_RECORD_UUID: (input: Record<string, any>): string[] => {
    const errors: string[] = [];
    if (input.recordUuid && !z.string().uuid().safeParse(input.recordUuid).success) {
      errors.push('recordUuid must be a valid UUID');
    }
    if (input.targetRecordUuid && !z.string().uuid().safeParse(input.targetRecordUuid).success) {
      errors.push('targetRecordUuid must be a valid UUID');
    }
    return errors;
  }
};

/**
 * Template AI tool implementation example
 * This serves as a reference for creating new AI tools
 */
export class TemplateAITool extends BaseAITool {
  constructor() {
    super({
      name: "template_ai_operation",
      operationType: "chat",
      description: "Template for creating new AI tools",
      inputSchema: AI_TOOL_SCHEMAS.CHAT,
      scriptBuilder: (input) => this.buildScript(input),
      customValidators: [AI_VALIDATORS.PROMPT_OR_RECORDS],
      resultProcessingOptions: {
        includeTimestamp: true,
        includeExecutionTime: true,
        sanitizeContent: true,
        maxContentLength: 10000
      },
      supportedEngines: ["ChatGPT", "Claude", "Gemini"],
      examples: [
        "Analyze the content of these documents and provide insights",
        "Summarize the key points from the selected records",
        "Generate a report based on the provided prompt and context"
      ]
    });
  }

  private buildScript(input: any): string {
    // This would use the aiScriptBuilder utilities
    // Implementation specific to the tool's requirements
    return `
      (() => {
        // Template JXA script
        const theApp = Application("DEVONthink");
        try {
          // Tool-specific implementation
          return JSON.stringify({ 
            success: true, 
            operationType: "chat",
            response: "Template response" 
          });
        } catch (error) {
          return JSON.stringify({ 
            success: false, 
            error: error.toString(),
            operationType: "chat"
          });
        }
      })();
    `;
  }
}

/**
 * Utility function to create a simple AI tool with minimal configuration
 */
export function createSimpleAITool(
  name: string,
  description: string,
  operationType: AIOperationType,
  scriptBuilder: (input: any) => string,
  inputSchema?: z.ZodSchema
): Tool {
  // Use appropriate default schema based on operation type
  let schema = inputSchema;
  if (!schema) {
    switch (operationType) {
      case 'chat':
        schema = AI_TOOL_SCHEMAS.CHAT;
        break;
      case 'analyze':
        schema = AI_TOOL_SCHEMAS.ANALYSIS;
        break;
      case 'generate':
        schema = AI_TOOL_SCHEMAS.GENERATION;
        break;
      case 'classify':
        schema = AI_TOOL_SCHEMAS.CLASSIFICATION;
        break;
      case 'compare':
        schema = AI_TOOL_SCHEMAS.COMPARISON;
        break;
      default:
        schema = BaseAIInputSchema;
    }
  }

  return createAITool({
    name,
    description,
    operationType,
    inputSchema: schema,
    scriptBuilder
  });
}