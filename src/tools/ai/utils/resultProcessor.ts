/**
 * Standardized AI response processing utilities for DEVONthink AI tools
 * Handles post-processing, formatting, and validation of AI operation results
 */

import { AIOperationType, AIEngine, OutputFormat } from "./aiValidation.js";

// Re-export for other modules
export { AIOperationType };

/**
 * Standard structure for all AI tool results
 */
export interface BaseAIResult {
  success: boolean;
  operationType: AIOperationType;
  error?: string;
  engine?: AIEngine;
  model?: string;
  outputFormat?: OutputFormat;
  executionTime?: number;
  timestamp?: string;
}

/**
 * Chat/prompt response result
 */
export interface ChatResult extends BaseAIResult {
  operationType: 'chat';
  response?: string | object;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  sourceRecords?: DocumentReference[];
  recordCount?: number;
}

/**
 * Summarization result
 */
export interface SummaryResult extends BaseAIResult {
  operationType: 'summarize';
  summaryUuid?: string;
  summaryId?: number;
  summaryName?: string;
  summaryLocation?: string;
  sourceRecords?: DocumentReference[];
  recordCount?: number;
  wordCount?: number;
}

/**
 * Classification result
 */
export interface ClassifyResult extends BaseAIResult {
  operationType: 'classify';
  recordUuid?: string;
  proposals?: ClassificationProposal[];
  totalCount?: number;
}

/**
 * Comparison/similarity result
 */
export interface CompareResult extends BaseAIResult {
  operationType: 'compare';
  results?: ComparisonResults;
  sourceRecord?: DocumentReference;
  targetRecord?: DocumentReference;
  similarRecords?: SimilarRecord[];
}

/**
 * Analysis result (generic for content analysis tools)
 */
export interface AnalysisResult extends BaseAIResult {
  operationType: 'analyze';
  analysis?: string | object;
  insights?: string[];
  metrics?: Record<string, number>;
  sourceRecords?: DocumentReference[];
  recordCount?: number;
}

/**
 * Generation result (for content creation tools)
 */
export interface GenerationResult extends BaseAIResult {
  operationType: 'generate';
  generatedUuid?: string;
  generatedId?: number;
  generatedName?: string;
  generatedLocation?: string;
  content?: string;
  wordCount?: number;
}

/**
 * Document reference structure
 */
export interface DocumentReference {
  uuid: string;
  id?: number;
  name: string;
  location: string;
  type?: string;
  databaseName?: string;
  databaseUuid?: string;
}

/**
 * Classification proposal structure
 */
export interface ClassificationProposal {
  name: string;
  type: string;
  location?: string;
  score?: number;
  confidence?: number;
}

/**
 * Comparison results structure
 */
export interface ComparisonResults {
  similarity?: number;
  analysis?: string;
  sourceRecord?: DocumentReference;
  targetRecord?: DocumentReference;
  similarRecords?: SimilarRecord[];
}

/**
 * Similar record structure
 */
export interface SimilarRecord extends DocumentReference {
  similarity: number;
  confidence?: number;
}

/**
 * Processing options for AI results
 */
export interface ResultProcessingOptions {
  includeTimestamp?: boolean;
  includeExecutionTime?: boolean;
  validateStructure?: boolean;
  sanitizeContent?: boolean;
  maxContentLength?: number;
}

/**
 * Error categories for AI operations
 */
export enum AIErrorCategory {
  SERVICE_UNAVAILABLE = 'service_unavailable',
  AUTHENTICATION = 'authentication', 
  RATE_LIMITED = 'rate_limited',
  INVALID_INPUT = 'invalid_input',
  RECORD_NOT_FOUND = 'record_not_found',
  INSUFFICIENT_CONTENT = 'insufficient_content',
  PROCESSING_ERROR = 'processing_error',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * Processed error information
 */
export interface ProcessedError {
  category: AIErrorCategory;
  message: string;
  originalError: string;
  suggestions?: string[];
  retryable: boolean;
}

/**
 * Processes raw JXA AI operation results into standardized format
 */
export function processAIResult(
  rawResult: any,
  operationType: AIOperationType,
  startTime?: number,
  options: ResultProcessingOptions = {}
): BaseAIResult {
  const {
    includeTimestamp = true,
    includeExecutionTime = true,
    validateStructure = true,
    sanitizeContent = true,
    maxContentLength = 50000
  } = options;

  // Handle null/undefined results
  if (!rawResult) {
    return {
      success: false,
      operationType,
      error: "No result received from AI operation",
      ...(includeTimestamp && { timestamp: new Date().toISOString() })
    };
  }

  // Handle string results (likely errors)
  if (typeof rawResult === 'string') {
    try {
      rawResult = JSON.parse(rawResult);
    } catch {
      return {
        success: false,
        operationType,
        error: rawResult,
        ...(includeTimestamp && { timestamp: new Date().toISOString() })
      };
    }
  }

  // Base result structure
  const result: BaseAIResult = {
    success: rawResult.success || false,
    operationType,
    ...(rawResult.error && { error: rawResult.error }),
    ...(rawResult.engine && { engine: rawResult.engine }),
    ...(rawResult.model && { model: rawResult.model }),
    ...(rawResult.outputFormat && { outputFormat: rawResult.outputFormat }),
    ...(includeTimestamp && { timestamp: new Date().toISOString() }),
    ...(includeExecutionTime && startTime && { 
      executionTime: Date.now() - startTime 
    })
  };

  // If not successful, process error
  if (!result.success) {
    const processedError = processAIError(rawResult.error || "Unknown error");
    result.error = processedError.message;
    // Add error metadata as needed
  }

  // Process operation-specific data
  if (result.success) {
    Object.assign(result, processOperationSpecificData(rawResult, operationType, options));
  }

  // Validate structure if requested
  if (validateStructure) {
    const validation = validateResultStructure(result, operationType);
    if (!validation.isValid) {
      return {
        success: false,
        operationType,
        error: `Result validation failed: ${validation.errors.join(', ')}`,
        ...(includeTimestamp && { timestamp: new Date().toISOString() })
      };
    }
  }

  return result;
}

/**
 * Processes operation-specific data from raw results
 */
function processOperationSpecificData(
  rawResult: any,
  operationType: AIOperationType,
  options: ResultProcessingOptions
): Partial<BaseAIResult> {
  const { sanitizeContent, maxContentLength } = options;

  switch (operationType) {
    case 'chat':
      return {
        ...(rawResult.response && { 
          response: sanitizeContent ? 
            sanitizeTextContent(rawResult.response, maxContentLength) : 
            rawResult.response 
        }),
        ...(rawResult.usage && { usage: rawResult.usage }),
        ...(rawResult.sourceRecords && { 
          sourceRecords: processDocumentReferences(rawResult.sourceRecords) 
        }),
        ...(rawResult.recordCount && { recordCount: rawResult.recordCount })
      };

    case 'summarize':
      return {
        ...(rawResult.summaryUuid && { summaryUuid: rawResult.summaryUuid }),
        ...(rawResult.summaryId && { summaryId: rawResult.summaryId }),
        ...(rawResult.summaryName && { summaryName: rawResult.summaryName }),
        ...(rawResult.summaryLocation && { summaryLocation: rawResult.summaryLocation }),
        ...(rawResult.sourceRecords && { 
          sourceRecords: processDocumentReferences(rawResult.sourceRecords) 
        }),
        ...(rawResult.recordCount && { recordCount: rawResult.recordCount }),
        ...(rawResult.wordCount && { wordCount: rawResult.wordCount })
      };

    case 'classify':
      return {
        ...(rawResult.recordUuid && { recordUuid: rawResult.recordUuid }),
        ...(rawResult.proposals && { 
          proposals: processClassificationProposals(rawResult.proposals) 
        }),
        ...(rawResult.totalCount && { totalCount: rawResult.totalCount })
      };

    case 'compare':
      return {
        ...(rawResult.results && { 
          results: processComparisonResults(rawResult.results) 
        }),
        ...(rawResult.sourceRecord && { 
          sourceRecord: processDocumentReference(rawResult.sourceRecord) 
        }),
        ...(rawResult.targetRecord && { 
          targetRecord: processDocumentReference(rawResult.targetRecord) 
        }),
        ...(rawResult.similarRecords && { 
          similarRecords: processSimilarRecords(rawResult.similarRecords) 
        })
      };

    case 'analyze':
      return {
        ...(rawResult.analysis && { 
          analysis: sanitizeContent ? 
            sanitizeTextContent(rawResult.analysis, maxContentLength) : 
            rawResult.analysis 
        }),
        ...(rawResult.insights && { insights: rawResult.insights }),
        ...(rawResult.metrics && { metrics: rawResult.metrics }),
        ...(rawResult.sourceRecords && { 
          sourceRecords: processDocumentReferences(rawResult.sourceRecords) 
        }),
        ...(rawResult.recordCount && { recordCount: rawResult.recordCount })
      };

    case 'generate':
      return {
        ...(rawResult.generatedUuid && { generatedUuid: rawResult.generatedUuid }),
        ...(rawResult.generatedId && { generatedId: rawResult.generatedId }),
        ...(rawResult.generatedName && { generatedName: rawResult.generatedName }),
        ...(rawResult.generatedLocation && { generatedLocation: rawResult.generatedLocation }),
        ...(rawResult.content && { 
          content: sanitizeContent ? 
            sanitizeTextContent(rawResult.content, maxContentLength) : 
            rawResult.content 
        }),
        ...(rawResult.wordCount && { wordCount: rawResult.wordCount })
      };

    default:
      return {};
  }
}

/**
 * Processes and validates document references
 */
function processDocumentReferences(refs: any[]): DocumentReference[] {
  if (!Array.isArray(refs)) return [];
  
  return refs.map(processDocumentReference).filter(Boolean) as DocumentReference[];
}

/**
 * Processes a single document reference
 */
function processDocumentReference(ref: any): DocumentReference | null {
  if (!ref || typeof ref !== 'object') return null;

  // Validate required fields
  if (!ref.uuid || !ref.name) return null;

  return {
    uuid: String(ref.uuid),
    ...(ref.id && { id: Number(ref.id) }),
    name: String(ref.name),
    location: String(ref.location || ''),
    ...(ref.type && { type: String(ref.type) }),
    ...(ref.databaseName && { databaseName: String(ref.databaseName) }),
    ...(ref.databaseUuid && { databaseUuid: String(ref.databaseUuid) })
  };
}

/**
 * Processes classification proposals
 */
function processClassificationProposals(proposals: any[]): ClassificationProposal[] {
  if (!Array.isArray(proposals)) return [];

  return proposals.map(proposal => ({
    name: String(proposal.name || ''),
    type: String(proposal.type || 'group'),
    ...(proposal.location && { location: String(proposal.location) }),
    ...(proposal.score !== undefined && { score: Number(proposal.score) }),
    ...(proposal.confidence !== undefined && { confidence: Number(proposal.confidence) })
  })).filter(proposal => proposal.name); // Filter out invalid proposals
}

/**
 * Processes comparison results
 */
function processComparisonResults(results: any): ComparisonResults {
  if (!results || typeof results !== 'object') return {};

  return {
    ...(results.similarity !== undefined && { similarity: Number(results.similarity) }),
    ...(results.analysis && { analysis: String(results.analysis) }),
    ...(results.sourceRecord && { 
      sourceRecord: processDocumentReference(results.sourceRecord) 
    }),
    ...(results.targetRecord && { 
      targetRecord: processDocumentReference(results.targetRecord) 
    }),
    ...(results.similarRecords && { 
      similarRecords: processSimilarRecords(results.similarRecords) 
    })
  };
}

/**
 * Processes similar records list
 */
function processSimilarRecords(records: any[]): SimilarRecord[] {
  if (!Array.isArray(records)) return [];

  return records.map(record => {
    const docRef = processDocumentReference(record);
    if (!docRef) return null;

    return {
      ...docRef,
      similarity: Number(record.similarity || 0),
      ...(record.confidence !== undefined && { confidence: Number(record.confidence) })
    };
  }).filter(Boolean) as SimilarRecord[];
}

/**
 * Sanitizes text content for safe processing
 */
function sanitizeTextContent(content: any, maxLength?: number): string {
  if (typeof content !== 'string') {
    content = String(content);
  }

  // Remove potential security issues
  content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Truncate if too long
  if (maxLength && content.length > maxLength) {
    content = content.substring(0, maxLength) + '... [truncated]';
  }

  return content;
}

/**
 * Processes AI errors into standardized format
 */
export function processAIError(error: string): ProcessedError {
  const lowerError = error.toLowerCase();

  // Categorize error
  let category = AIErrorCategory.UNKNOWN;
  let suggestions: string[] = [];
  let retryable = false;

  if (lowerError.includes('not running') || lowerError.includes('devonthink')) {
    category = AIErrorCategory.SERVICE_UNAVAILABLE;
    suggestions.push('Ensure DEVONthink is running');
    suggestions.push('Check if DEVONthink AI features are enabled');
    retryable = true;
  } else if (lowerError.includes('record not found') || lowerError.includes('uuid')) {
    category = AIErrorCategory.RECORD_NOT_FOUND;
    suggestions.push('Verify the record UUID is correct');
    suggestions.push('Check if the record still exists in the database');
    retryable = false;
  } else if (lowerError.includes('timeout') || lowerError.includes('time out')) {
    category = AIErrorCategory.TIMEOUT;
    suggestions.push('Try again with a smaller request');
    suggestions.push('Check network connectivity');
    retryable = true;
  } else if (lowerError.includes('rate limit') || lowerError.includes('too many requests')) {
    category = AIErrorCategory.RATE_LIMITED;
    suggestions.push('Wait before retrying');
    suggestions.push('Reduce request frequency');
    retryable = true;
  } else if (lowerError.includes('authentication') || lowerError.includes('api key')) {
    category = AIErrorCategory.AUTHENTICATION;
    suggestions.push('Check AI service API key configuration');
    suggestions.push('Verify AI service account status');
    retryable = false;
  } else if (lowerError.includes('insufficient content') || lowerError.includes('no content')) {
    category = AIErrorCategory.INSUFFICIENT_CONTENT;
    suggestions.push('Ensure records contain sufficient text content');
    suggestions.push('Try with different or additional records');
    retryable = false;
  } else if (lowerError.includes('invalid') || lowerError.includes('validation')) {
    category = AIErrorCategory.INVALID_INPUT;
    suggestions.push('Check input parameters for correct format');
    suggestions.push('Ensure all required fields are provided');
    retryable = false;
  }

  return {
    category,
    message: sanitizeErrorMessage(error),
    originalError: error,
    suggestions,
    retryable
  };
}

/**
 * Sanitizes error messages for safe display
 */
function sanitizeErrorMessage(error: string): string {
  // Remove potential sensitive information or script remnants
  return error.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/script\s*:\s*/gi, '')
    .trim();
}

/**
 * Validates the structure of processed AI results
 */
function validateResultStructure(result: BaseAIResult, operationType: AIOperationType): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check base structure
  if (typeof result.success !== 'boolean') {
    errors.push('success field must be boolean');
  }

  if (result.operationType !== operationType) {
    errors.push(`operationType mismatch: expected ${operationType}, got ${result.operationType}`);
  }

  // Operation-specific validation
  switch (operationType) {
    case 'chat':
      const chatResult = result as ChatResult;
      if (chatResult.success && !chatResult.response) {
        errors.push('Chat result missing response');
      }
      break;

    case 'summarize':
      const summaryResult = result as SummaryResult;
      if (summaryResult.success && !summaryResult.summaryUuid) {
        errors.push('Summary result missing summaryUuid');
      }
      break;

    case 'classify':
      const classifyResult = result as ClassifyResult;
      if (classifyResult.success && !classifyResult.proposals) {
        errors.push('Classify result missing proposals');
      }
      break;

    case 'compare':
      const compareResult = result as CompareResult;
      if (compareResult.success && !compareResult.results) {
        errors.push('Compare result missing results');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Utility function to merge multiple AI results (useful for batch operations)
 */
export function mergeAIResults(results: BaseAIResult[], operationType: AIOperationType): BaseAIResult {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  if (successful.length === 0) {
    return {
      success: false,
      operationType,
      error: `All operations failed. Errors: ${failed.map(r => r.error).join('; ')}`,
      timestamp: new Date().toISOString()
    };
  }

  // For now, return the first successful result with metadata about the batch
  const primaryResult = successful[0];
  return {
    ...primaryResult,
    // Add batch metadata
    batchSize: results.length,
    successfulCount: successful.length,
    failedCount: failed.length
  } as BaseAIResult & { batchSize: number; successfulCount: number; failedCount: number };
}