/**
 * AI-specific validation utilities for DEVONthink AI tools
 * Provides comprehensive input validation with DEVONthink-specific constraints
 */

import { z } from "zod";
import { isJXASafeString } from "../../../utils/escapeString.js";

/**
 * Supported AI engines in DEVONthink
 */
export const AI_ENGINES = [
  "ChatGPT",
  "Claude", 
  "Mistral AI",
  "GPT4All",
  "LM Studio",
  "Ollama",
  "Gemini"
] as const;

export type AIEngine = typeof AI_ENGINES[number];

/**
 * Common AI tool output formats
 */
export const OUTPUT_FORMATS = [
  "text",
  "json", 
  "markdown",
  "html",
  "rich"
] as const;

export type OutputFormat = typeof OUTPUT_FORMATS[number];

/**
 * AI operation modes for working with records
 */
export const AI_MODES = [
  "append",     // Append record content to prompt
  "replace",    // Use only record content (ignore prompt)
  "context",    // Provide records as reference context
  "analysis",   // Analyze record content
  "synthesis"   // Synthesize multiple records
] as const;

export type AIMode = typeof AI_MODES[number];

/**
 * Common AI operation types for error handling and processing
 */
export const AI_OPERATION_TYPES = [
  "chat",
  "summarize", 
  "classify",
  "compare",
  "analyze",
  "extract",
  "generate",
  "translate"
] as const;

export type AIOperationType = typeof AI_OPERATION_TYPES[number];

/**
 * Base schema for AI tool inputs
 */
export const BaseAIInputSchema = z.object({
  engine: z.enum(AI_ENGINES).optional().default("ChatGPT"),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(100000).optional(),
  outputFormat: z.enum(OUTPUT_FORMATS).optional().default("text"),
  timeout: z.number().min(5).max(300).optional().default(60), // seconds
});

/**
 * Schema for AI tools that work with records
 */
export const RecordBasedAIInputSchema = BaseAIInputSchema.extend({
  recordUuids: z.array(z.string().uuid()).optional(),
  recordIds: z.array(z.number()).optional(), 
  databaseName: z.string().optional(),
  mode: z.enum(AI_MODES).optional().default("context"),
  maxRecords: z.number().min(1).max(100).optional().default(10),
});

/**
 * Schema for AI tools that accept text prompts
 */
export const PromptBasedAIInputSchema = BaseAIInputSchema.extend({
  prompt: z.string().min(1).max(50000),
  systemPrompt: z.string().optional(),
});

/**
 * Validation error interface
 */
export interface AIValidationError {
  field: string;
  message: string;
  code: 'INVALID_STRING' | 'INVALID_UUID' | 'INVALID_RANGE' | 'REQUIRED_FIELD' | 'INVALID_ENGINE' | 'INVALID_FORMAT' | 'INVALID_INPUT';
}

/**
 * Validation result interface
 */
export interface AIValidationResult {
  isValid: boolean;
  errors: AIValidationError[];
  sanitizedInput?: Record<string, any>;
}

/**
 * Validates a string for JXA safety with AI-specific constraints
 */
export function validateAIString(input: string, fieldName: string, maxLength: number = 50000): AIValidationError | null {
  if (!input || typeof input !== 'string') {
    return {
      field: fieldName,
      message: `${fieldName} is required and must be a string`,
      code: 'REQUIRED_FIELD'
    };
  }

  if (input.length > maxLength) {
    return {
      field: fieldName, 
      message: `${fieldName} exceeds maximum length of ${maxLength} characters`,
      code: 'INVALID_RANGE'
    };
  }

  if (!isJXASafeString(input)) {
    return {
      field: fieldName,
      message: `${fieldName} contains invalid characters that cannot be safely processed`,
      code: 'INVALID_STRING'
    };
  }

  return null;
}

/**
 * Validates UUID format
 */
export function validateUUID(uuid: string, fieldName: string): AIValidationError | null {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(uuid)) {
    return {
      field: fieldName,
      message: `${fieldName} is not a valid UUID format`,
      code: 'INVALID_UUID'
    };
  }

  return null;
}

/**
 * Validates AI engine
 */
export function validateAIEngine(engine: string): AIValidationError | null {
  if (!AI_ENGINES.includes(engine as AIEngine)) {
    return {
      field: 'engine',
      message: `Invalid AI engine. Must be one of: ${AI_ENGINES.join(', ')}`,
      code: 'INVALID_ENGINE'
    };
  }
  return null;
}

/**
 * Validates output format
 */
export function validateOutputFormat(format: string): AIValidationError | null {
  if (!OUTPUT_FORMATS.includes(format as OutputFormat)) {
    return {
      field: 'outputFormat',
      message: `Invalid output format. Must be one of: ${OUTPUT_FORMATS.join(', ')}`,
      code: 'INVALID_FORMAT'
    };
  }
  return null;
}

/**
 * Validates record identifiers (UUIDs or IDs)
 */
export function validateRecordIdentifiers(
  uuids?: string[],
  ids?: number[], 
  databaseName?: string
): AIValidationError[] {
  const errors: AIValidationError[] = [];

  if (!uuids && !ids) {
    errors.push({
      field: 'recordIdentifiers',
      message: 'Either recordUuids or recordIds must be provided',
      code: 'REQUIRED_FIELD'
    });
    return errors;
  }

  // Validate UUIDs
  if (uuids) {
    for (let i = 0; i < uuids.length; i++) {
      const error = validateUUID(uuids[i], `recordUuids[${i}]`);
      if (error) errors.push(error);
    }
  }

  // Validate IDs - if provided, database name is required
  if (ids && ids.length > 0 && !databaseName) {
    errors.push({
      field: 'databaseName',
      message: 'databaseName is required when using recordIds',
      code: 'REQUIRED_FIELD'
    });
  }

  // Validate database name if provided
  if (databaseName) {
    const error = validateAIString(databaseName, 'databaseName', 255);
    if (error) errors.push(error);
  }

  return errors;
}

/**
 * Comprehensive validation for AI tool inputs
 */
export function validateAIToolInput(
  input: Record<string, any>,
  operationType: AIOperationType,
  customValidators: ((input: Record<string, any>) => AIValidationError[])[] = []
): AIValidationResult {
  const errors: AIValidationError[] = [];

  // Basic string validations
  if (input.prompt !== undefined) {
    const error = validateAIString(input.prompt, 'prompt', 50000);
    if (error) errors.push(error);
  }

  if (input.systemPrompt !== undefined) {
    const error = validateAIString(input.systemPrompt, 'systemPrompt', 10000);
    if (error) errors.push(error);
  }

  if (input.model !== undefined) {
    const error = validateAIString(input.model, 'model', 100);
    if (error) errors.push(error);
  }

  // Engine validation
  if (input.engine !== undefined) {
    const error = validateAIEngine(input.engine);
    if (error) errors.push(error);
  }

  // Output format validation
  if (input.outputFormat !== undefined) {
    const error = validateOutputFormat(input.outputFormat);
    if (error) errors.push(error);
  }

  // Record identifier validation
  if (input.recordUuids !== undefined || input.recordIds !== undefined) {
    const recordErrors = validateRecordIdentifiers(
      input.recordUuids, 
      input.recordIds, 
      input.databaseName
    );
    errors.push(...recordErrors);
  }

  // Temperature validation
  if (input.temperature !== undefined && (input.temperature < 0 || input.temperature > 2)) {
    errors.push({
      field: 'temperature',
      message: 'temperature must be between 0 and 2',
      code: 'INVALID_RANGE'
    });
  }

  // Max tokens validation
  if (input.maxTokens !== undefined && (input.maxTokens < 1 || input.maxTokens > 100000)) {
    errors.push({
      field: 'maxTokens', 
      message: 'maxTokens must be between 1 and 100000',
      code: 'INVALID_RANGE'
    });
  }

  // Timeout validation 
  if (input.timeout !== undefined && (input.timeout < 5 || input.timeout > 300)) {
    errors.push({
      field: 'timeout',
      message: 'timeout must be between 5 and 300 seconds',
      code: 'INVALID_RANGE'
    });
  }

  // Run custom validators
  for (const validator of customValidators) {
    const customErrors = validator(input);
    errors.push(...customErrors);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedInput: errors.length === 0 ? input : undefined
  };
}

/**
 * Pre-built validator for chat-style AI tools
 */
export function validateChatInput(input: Record<string, any>): AIValidationResult {
  const customValidators = [
    (input: Record<string, any>): AIValidationError[] => {
      // Chat tools require either a prompt or records
      if (!input.prompt && (!input.recordUuids || input.recordUuids.length === 0)) {
        return [{
          field: 'input',
          message: 'Either prompt or recordUuids must be provided for chat operations',
          code: 'REQUIRED_FIELD'
        }];
      }
      return [];
    }
  ];

  return validateAIToolInput(input, 'chat', customValidators);
}

/**
 * Pre-built validator for content analysis AI tools  
 */
export function validateAnalysisInput(input: Record<string, any>): AIValidationResult {
  const customValidators = [
    (input: Record<string, any>): AIValidationError[] => {
      // Analysis tools require records to analyze
      if (!input.recordUuids || input.recordUuids.length === 0) {
        return [{
          field: 'recordUuids',
          message: 'recordUuids is required for analysis operations',
          code: 'REQUIRED_FIELD'
        }];
      }
      return [];
    }
  ];

  return validateAIToolInput(input, 'analyze', customValidators);
}

/**
 * Pre-built validator for content generation AI tools
 */
export function validateGenerationInput(input: Record<string, any>): AIValidationResult {
  const customValidators = [
    (input: Record<string, any>): AIValidationError[] => {
      // Generation tools require a prompt
      if (!input.prompt) {
        return [{
          field: 'prompt',
          message: 'prompt is required for generation operations',
          code: 'REQUIRED_FIELD'
        }];
      }
      return [];
    }
  ];

  return validateAIToolInput(input, 'generate', customValidators);
}