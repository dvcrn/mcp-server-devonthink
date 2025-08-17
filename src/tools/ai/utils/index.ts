/**
 * AI Infrastructure Utilities - Main Export Index
 * Provides centralized access to all AI utility modules
 */

// Re-export all utilities from individual modules
export * from './aiValidation.js';
export * from './aiScriptBuilder.js'; 
export * from './resultProcessor.js';
export * from './aiAvailabilityChecker.js';
export * from './baseAITool.js';
export * from './aiErrorHandler.js';

// Import specific items for convenience functions
import {
  validateAIToolInput,
  validateChatInput, 
  validateAnalysisInput,
  validateGenerationInput,
  AIOperationType
} from './aiValidation.js';

import {
  buildChatScript,
  buildSummarizeScript,
  buildClassifyScript,
  buildCompareScript
} from './aiScriptBuilder.js';

import {
  processAIResult,
  processAIError
} from './resultProcessor.js';

import {
  checkAIServiceAvailability,
  getAIStatusSummary
} from './aiAvailabilityChecker.js';

import {
  createAITool,
  createSimpleAITool,
  AI_TOOL_SCHEMAS,
  AI_VALIDATORS
} from './baseAITool.js';

import {
  globalAIErrorHandler,
  handleAIError
} from './aiErrorHandler.js';

/**
 * Convenience function to get all AI utilities in one import
 * Useful for tools that need access to multiple utility modules
 */
export function getAllAIUtilities() {
  return {
    // Validation
    validateInput: validateAIToolInput,
    validateChat: validateChatInput,
    validateAnalysis: validateAnalysisInput,
    validateGeneration: validateGenerationInput,
    
    // Script building
    buildChatScript: buildChatScript,
    buildSummarizeScript: buildSummarizeScript,
    buildClassifyScript: buildClassifyScript,
    buildCompareScript: buildCompareScript,
    
    // Result processing
    processResult: processAIResult,
    processError: processAIError,
    
    // Availability checking
    checkAvailability: checkAIServiceAvailability,
    getStatusSummary: getAIStatusSummary,
    
    // Tool creation
    createTool: createAITool,
    createSimpleTool: createSimpleAITool,
    
    // Error handling
    errorHandler: globalAIErrorHandler,
    handleError: handleAIError
  };
}

/**
 * Quick setup function for new AI tools
 * Provides a streamlined way to create AI tools with sensible defaults
 */
export function quickSetupAITool(
  name: string,
  operationType: AIOperationType,
  description: string,
  scriptBuilder: (input: any) => string
) {
  return createSimpleAITool(name, description, operationType, scriptBuilder);
}

/**
 * Common AI tool configurations
 * Pre-configured setups for typical AI tool patterns
 */
export const AI_TOOL_PRESETS = {
  /**
   * Chat-style tool that works with prompts and optional context
   */
  CHAT_TOOL: {
    operationType: 'chat' as const,
    inputSchema: AI_TOOL_SCHEMAS.CHAT,
    validators: [AI_VALIDATORS.PROMPT_OR_RECORDS],
    supportedEngines: ['ChatGPT', 'Claude', 'Gemini']
  },
  
  /**
   * Analysis tool that processes document content
   */
  ANALYSIS_TOOL: {
    operationType: 'analyze' as const,
    inputSchema: AI_TOOL_SCHEMAS.ANALYSIS,
    validators: [AI_VALIDATORS.REQUIRES_RECORDS],
    supportedEngines: ['ChatGPT', 'Claude']
  },
  
  /**
   * Generation tool that creates new content
   */
  GENERATION_TOOL: {
    operationType: 'generate' as const,
    inputSchema: AI_TOOL_SCHEMAS.GENERATION,
    validators: [AI_VALIDATORS.REQUIRES_PROMPT],
    supportedEngines: ['ChatGPT', 'Claude', 'Gemini']
  },
  
  /**
   * Classification tool for organizing content
   */
  CLASSIFICATION_TOOL: {
    operationType: 'classify' as const,
    inputSchema: AI_TOOL_SCHEMAS.CLASSIFICATION,
    validators: [AI_VALIDATORS.VALID_RECORD_UUID],
    supportedEngines: ['ChatGPT', 'Claude']
  },
  
  /**
   * Comparison tool for finding similarities
   */
  COMPARISON_TOOL: {
    operationType: 'compare' as const,
    inputSchema: AI_TOOL_SCHEMAS.COMPARISON,
    validators: [AI_VALIDATORS.VALID_RECORD_UUID],
    supportedEngines: ['ChatGPT', 'Claude']
  }
} as const;