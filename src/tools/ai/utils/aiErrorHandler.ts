/**
 * Comprehensive error handling framework for AI operations in DEVONthink
 * Provides categorization, recovery strategies, and user-friendly error messages
 */

import type { BaseAIResult, AIOperationType } from "./resultProcessor.js";
import { checkAIServiceAvailability, AIServiceStatus } from "./aiAvailabilityChecker.js";

/**
 * Detailed error categories for AI operations
 */
export enum AIErrorType {
  // Service-level errors
  SERVICE_UNAVAILABLE = 'service_unavailable',
  SERVICE_TIMEOUT = 'service_timeout',
  SERVICE_OVERLOADED = 'service_overloaded',
  
  // Authentication & Authorization
  AUTHENTICATION_FAILED = 'authentication_failed',
  API_KEY_INVALID = 'api_key_invalid',
  QUOTA_EXCEEDED = 'quota_exceeded',
  RATE_LIMITED = 'rate_limited',
  
  // Input validation errors
  INVALID_INPUT = 'invalid_input',
  MISSING_REQUIRED_FIELD = 'missing_required_field',
  INPUT_TOO_LARGE = 'input_too_large',
  UNSUPPORTED_FORMAT = 'unsupported_format',
  
  // Data errors
  RECORD_NOT_FOUND = 'record_not_found',
  DATABASE_NOT_FOUND = 'database_not_found',
  INSUFFICIENT_CONTENT = 'insufficient_content',
  CORRUPTED_DATA = 'corrupted_data',
  
  // Processing errors
  AI_PROCESSING_FAILED = 'ai_processing_failed',
  CONTENT_GENERATION_FAILED = 'content_generation_failed',
  ANALYSIS_FAILED = 'analysis_failed',
  CLASSIFICATION_FAILED = 'classification_failed',
  
  // System errors
  DEVONTHINK_NOT_RUNNING = 'devonthink_not_running',
  SCRIPT_EXECUTION_FAILED = 'script_execution_failed',
  MEMORY_ERROR = 'memory_error',
  DISK_SPACE_ERROR = 'disk_space_error',
  
  // Unknown errors
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',         // Minor issues, operation can continue
  MEDIUM = 'medium',   // Significant issues, alternative approaches may work
  HIGH = 'high',       // Major issues, operation cannot complete
  CRITICAL = 'critical' // System-level issues, immediate attention required
}

/**
 * Recovery strategy types
 */
export enum RecoveryStrategy {
  RETRY = 'retry',                    // Simple retry after delay
  RETRY_WITH_BACKOFF = 'retry_with_backoff',  // Exponential backoff retry
  ALTERNATIVE_ENGINE = 'alternative_engine',   // Try different AI engine
  REDUCE_INPUT_SIZE = 'reduce_input_size',     // Split or reduce input
  FALLBACK_METHOD = 'fallback_method',         // Use alternative approach
  USER_INTERVENTION = 'user_intervention',     // Requires user action
  NO_RECOVERY = 'no_recovery'         // Cannot be automatically recovered
}

/**
 * Structured error information
 */
export interface AIError {
  type: AIErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError: string;
  operationType: AIOperationType;
  context?: Record<string, any>;
  suggestions: string[];
  recoveryStrategies: RecoveryStrategy[];
  retryable: boolean;
  userActionRequired: boolean;
  timestamp: string;
}

/**
 * Recovery attempt result
 */
export interface RecoveryAttempt {
  strategy: RecoveryStrategy;
  success: boolean;
  error?: string;
  duration: number;
  timestamp: string;
}

/**
 * Error handling configuration
 */
export interface ErrorHandlingConfig {
  maxRetries: number;
  baseRetryDelay: number; // milliseconds
  maxRetryDelay: number;  // milliseconds
  enableAutoRecovery: boolean;
  logErrors: boolean;
  includeStackTrace: boolean;
}

const DEFAULT_ERROR_CONFIG: ErrorHandlingConfig = {
  maxRetries: 3,
  baseRetryDelay: 1000,
  maxRetryDelay: 30000,
  enableAutoRecovery: true,
  logErrors: true,
  includeStackTrace: false
};

/**
 * Main error handler class
 */
export class AIErrorHandler {
  private config: ErrorHandlingConfig;
  private errorHistory: Map<string, AIError[]> = new Map();

  constructor(config: Partial<ErrorHandlingConfig> = {}) {
    this.config = { ...DEFAULT_ERROR_CONFIG, ...config };
  }

  /**
   * Analyzes and categorizes an error from AI operations
   */
  analyzeError(
    error: any,
    operationType: AIOperationType,
    context?: Record<string, any>
  ): AIError {
    const errorString = error instanceof Error ? error.message : String(error);
    const lowerError = errorString.toLowerCase();

    // Determine error type through pattern matching
    const type = this.categorizeError(lowerError);
    const severity = this.determineSeverity(type, lowerError);
    const recoveryStrategies = this.getRecoveryStrategies(type);
    const suggestions = this.generateSuggestions(type, lowerError);

    return {
      type,
      severity,
      message: this.generateUserFriendlyMessage(type, errorString),
      originalError: errorString,
      operationType,
      context: context ? { ...context } : undefined,
      suggestions,
      recoveryStrategies,
      retryable: this.isRetryable(type),
      userActionRequired: this.requiresUserAction(type),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Attempts to recover from an error using appropriate strategies
   */
  async attemptRecovery(
    aiError: AIError,
    originalOperation: () => Promise<BaseAIResult>,
    context?: Record<string, any>
  ): Promise<BaseAIResult> {
    if (!this.config.enableAutoRecovery || !aiError.retryable) {
      return this.createErrorResult(aiError);
    }

    const recoveryAttempts: RecoveryAttempt[] = [];

    for (const strategy of aiError.recoveryStrategies) {
      const attempt = await this.executeRecoveryStrategy(
        strategy,
        originalOperation,
        aiError,
        context,
        recoveryAttempts.length
      );
      
      recoveryAttempts.push(attempt);

      if (attempt.success) {
        // Log successful recovery
        this.logRecovery(aiError, strategy, recoveryAttempts);
        
        // Execute the original operation with recovery context
        try {
          return await originalOperation();
        } catch (retryError) {
          // Recovery strategy worked but operation still failed
          continue;
        }
      }

      // Stop if we've exceeded max retries
      if (recoveryAttempts.length >= this.config.maxRetries) {
        break;
      }
    }

    // All recovery attempts failed
    const finalError = aiError;
    finalError.context = {
      ...finalError.context,
      recoveryAttempts: recoveryAttempts.length,
      lastRecoveryStrategy: recoveryAttempts[recoveryAttempts.length - 1]?.strategy
    };

    return this.createErrorResult(finalError);
  }

  /**
   * Executes a specific recovery strategy
   */
  private async executeRecoveryStrategy(
    strategy: RecoveryStrategy,
    originalOperation: () => Promise<BaseAIResult>,
    error: AIError,
    context?: Record<string, any>,
    attemptNumber: number = 0
  ): Promise<RecoveryAttempt> {
    const startTime = Date.now();

    try {
      switch (strategy) {
        case RecoveryStrategy.RETRY:
          await this.delay(this.config.baseRetryDelay);
          return {
            strategy,
            success: true,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString()
          };

        case RecoveryStrategy.RETRY_WITH_BACKOFF: {
          const delay = Math.min(
            this.config.baseRetryDelay * 2 ** attemptNumber,
            this.config.maxRetryDelay
          );
          await this.delay(delay);
          return {
            strategy,
            success: true,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString()
          };
        }

        case RecoveryStrategy.ALTERNATIVE_ENGINE: {
          // Check if alternative engines are available
          const serviceStatus = await checkAIServiceAvailability();
          if (serviceStatus.availableEngines.length > 1) {
            // Success - alternative engines available
            return {
              strategy,
              success: true,
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString()
            };
          }
          break;
        }

        case RecoveryStrategy.REDUCE_INPUT_SIZE:
          // This would require modifying the input, which needs to be handled by the caller
          return {
            strategy,
            success: true,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString()
          };

        default:
          // Strategy not implemented for automatic recovery
          break;
      }

      return {
        strategy,
        success: false,
        error: "Recovery strategy not applicable or failed",
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (recoveryError) {
      return {
        strategy,
        success: false,
        error: recoveryError instanceof Error ? recoveryError.message : String(recoveryError),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Categorizes error based on error message patterns
   */
  private categorizeError(lowerError: string): AIErrorType {
    // Service availability
    if (lowerError.includes('not running') || lowerError.includes('devonthink')) {
      return AIErrorType.DEVONTHINK_NOT_RUNNING;
    }
    
    if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
      return AIErrorType.SERVICE_TIMEOUT;
    }

    if (lowerError.includes('service unavailable') || lowerError.includes('503')) {
      return AIErrorType.SERVICE_UNAVAILABLE;
    }

    // Authentication and configuration
    if (lowerError.includes('not yet configured') || lowerError.includes('not configured')) {
      return AIErrorType.AUTHENTICATION_FAILED;
    }

    if (lowerError.includes('api key') || lowerError.includes('authentication')) {
      return AIErrorType.AUTHENTICATION_FAILED;
    }

    if (lowerError.includes('rate limit') || lowerError.includes('too many requests')) {
      return AIErrorType.RATE_LIMITED;
    }

    if (lowerError.includes('quota') || lowerError.includes('limit exceeded')) {
      return AIErrorType.QUOTA_EXCEEDED;
    }

    // Data errors
    if (lowerError.includes('record not found') || lowerError.includes('uuid')) {
      return AIErrorType.RECORD_NOT_FOUND;
    }

    if (lowerError.includes('database not found')) {
      return AIErrorType.DATABASE_NOT_FOUND;
    }

    if (lowerError.includes('insufficient content') || lowerError.includes('no content')) {
      return AIErrorType.INSUFFICIENT_CONTENT;
    }

    // Input validation
    if (lowerError.includes('invalid input') || lowerError.includes('validation')) {
      return AIErrorType.INVALID_INPUT;
    }

    if (lowerError.includes('required') || lowerError.includes('missing')) {
      return AIErrorType.MISSING_REQUIRED_FIELD;
    }

    if (lowerError.includes('too large') || lowerError.includes('size limit')) {
      return AIErrorType.INPUT_TOO_LARGE;
    }

    // Processing errors
    if (lowerError.includes('ai') || lowerError.includes('processing failed')) {
      return AIErrorType.AI_PROCESSING_FAILED;
    }

    if (lowerError.includes('generation failed') || lowerError.includes('could not generate')) {
      return AIErrorType.CONTENT_GENERATION_FAILED;
    }

    // System errors
    if (lowerError.includes('memory') || lowerError.includes('out of memory')) {
      return AIErrorType.MEMORY_ERROR;
    }

    if (lowerError.includes('disk space') || lowerError.includes('no space')) {
      return AIErrorType.DISK_SPACE_ERROR;
    }

    return AIErrorType.UNKNOWN_ERROR;
  }

  /**
   * Determines error severity based on type and content
   */
  private determineSeverity(type: AIErrorType, errorMessage: string): ErrorSeverity {
    switch (type) {
      case AIErrorType.DEVONTHINK_NOT_RUNNING:
      case AIErrorType.MEMORY_ERROR:
      case AIErrorType.DISK_SPACE_ERROR:
        return ErrorSeverity.CRITICAL;

      case AIErrorType.SERVICE_UNAVAILABLE:
      case AIErrorType.AUTHENTICATION_FAILED:
      case AIErrorType.API_KEY_INVALID:
        return ErrorSeverity.HIGH;

      case AIErrorType.RATE_LIMITED:
      case AIErrorType.QUOTA_EXCEEDED:
      case AIErrorType.SERVICE_TIMEOUT:
      case AIErrorType.AI_PROCESSING_FAILED:
        return ErrorSeverity.MEDIUM;

      case AIErrorType.RECORD_NOT_FOUND:
      case AIErrorType.INVALID_INPUT:
      case AIErrorType.INSUFFICIENT_CONTENT:
        return ErrorSeverity.LOW;

      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  /**
   * Gets appropriate recovery strategies for error type
   */
  private getRecoveryStrategies(type: AIErrorType): RecoveryStrategy[] {
    switch (type) {
      case AIErrorType.SERVICE_TIMEOUT:
        return [RecoveryStrategy.RETRY_WITH_BACKOFF, RecoveryStrategy.ALTERNATIVE_ENGINE];

      case AIErrorType.RATE_LIMITED:
        return [RecoveryStrategy.RETRY_WITH_BACKOFF];

      case AIErrorType.SERVICE_UNAVAILABLE:
        return [RecoveryStrategy.RETRY, RecoveryStrategy.ALTERNATIVE_ENGINE];

      case AIErrorType.INPUT_TOO_LARGE:
        return [RecoveryStrategy.REDUCE_INPUT_SIZE];

      case AIErrorType.AI_PROCESSING_FAILED:
        return [RecoveryStrategy.RETRY, RecoveryStrategy.ALTERNATIVE_ENGINE];

      case AIErrorType.DEVONTHINK_NOT_RUNNING:
      case AIErrorType.AUTHENTICATION_FAILED:
      case AIErrorType.RECORD_NOT_FOUND:
        return [RecoveryStrategy.USER_INTERVENTION];

      default:
        return [RecoveryStrategy.RETRY];
    }
  }

  /**
   * Generates user-friendly suggestions based on error type
   */
  private generateSuggestions(type: AIErrorType, errorMessage: string): string[] {
    const suggestions: string[] = [];

    switch (type) {
      case AIErrorType.DEVONTHINK_NOT_RUNNING:
        suggestions.push('Start the DEVONthink application');
        suggestions.push('Ensure DEVONthink is properly installed');
        break;

      case AIErrorType.AUTHENTICATION_FAILED:
        if (errorMessage.includes('not yet configured') || errorMessage.includes('not configured')) {
          // Enhanced contextual guidance for unconfigured services
          suggestions.push('ChatGPT is ready to use now, or set up Claude in DEVONthink > Preferences > AI (takes ~3 minutes)');
          suggestions.push('For immediate use: Switch to ChatGPT engine which is already configured');
          suggestions.push('To enable Claude: Go to DEVONthink > Preferences > AI > Configure Claude API');
          suggestions.push('Alternative: Try Gemini if configured, or use local models like GPT4All');
        } else {
          suggestions.push('Check AI service API key configuration in DEVONthink preferences');
          suggestions.push('Verify your AI service account is active');
          suggestions.push('Ensure AI features are enabled in DEVONthink Pro');
        }
        break;

      case AIErrorType.RATE_LIMITED:
        suggestions.push('Wait a few minutes before retrying');
        suggestions.push('Consider upgrading your AI service plan for higher limits');
        break;

      case AIErrorType.RECORD_NOT_FOUND:
        suggestions.push('Verify the record UUID is correct');
        suggestions.push('Check if the record still exists in the database');
        suggestions.push('Refresh the database view in DEVONthink');
        break;

      case AIErrorType.INPUT_TOO_LARGE:
        suggestions.push('Try with fewer records or smaller content');
        suggestions.push('Split the operation into smaller batches');
        break;

      case AIErrorType.INSUFFICIENT_CONTENT:
        suggestions.push('Ensure the selected records contain sufficient text content');
        suggestions.push('Try including additional related documents');
        break;

      case AIErrorType.SERVICE_TIMEOUT:
        suggestions.push('Check your internet connection');
        suggestions.push('Try again with a simpler request');
        suggestions.push('Consider using a different AI engine');
        break;

      default:
        suggestions.push('Check DEVONthink AI configuration');
        suggestions.push('Verify all required fields are provided');
        suggestions.push('Try the operation again in a few minutes');
    }

    return suggestions;
  }

  /**
   * Sanitizes JXA technical details from error messages
   */
  private sanitizeJXAError(errorMessage: string): string {
    // Remove JXA-specific technical details that shouldn't be exposed to users
    const jxaPatterns = [
      /AppleScript Error/gi,
      /JavaScript for Automation Error/gi,
      /osascript:/gi,
      /System Events got an error:/gi,
      /Can't convert types\./gi,
      /Application "DEVONthink" got an error:/gi,
      /Script Editor:/gi,
      /JSON\.stringify/gi,
      /theApp\./gi,
      /const [a-zA-Z_]+\s*=/gi,
      /function\s*\(/gi,
      /return\s+/gi,
      /bracket notation/gi,
      /JXA script/gi,
      /template literal/gi,
      /object literal/gi
    ];
    
    let sanitized = errorMessage;
    
    // Replace JXA patterns with user-friendly equivalents
    jxaPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, "");
    });
    
    // Clean up multiple spaces and trim
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    // If the error is now empty or too short, provide a generic message
    if (sanitized.length < 10) {
      return 'An internal processing error occurred';
    }
    
    return sanitized;
  }

  /**
   * Generates user-friendly error message
   */
  private generateUserFriendlyMessage(type: AIErrorType, originalError: string): string {
    // First sanitize any JXA technical details
    const sanitizedError = this.sanitizeJXAError(originalError);
    
    switch (type) {
      case AIErrorType.DEVONTHINK_NOT_RUNNING:
        return 'DEVONthink is not running. Please start DEVONthink to use AI features.';

      case AIErrorType.AUTHENTICATION_FAILED:
        if (sanitizedError.includes('not yet configured') || sanitizedError.includes('not configured')) {
          return 'AI service not configured. Please set up an AI engine in DEVONthink > Preferences > AI (takes 2-3 minutes).';
        }
        return 'AI service authentication failed. Please check your API key configuration in DEVONthink preferences.';

      case AIErrorType.RATE_LIMITED:
        return 'AI service rate limit reached. Please wait before making additional requests.';

      case AIErrorType.RECORD_NOT_FOUND:
        return 'The requested record could not be found. It may have been deleted or moved.';

      case AIErrorType.INPUT_TOO_LARGE:
        return 'The input is too large for the AI service. Please try with less content or fewer records.';

      case AIErrorType.INSUFFICIENT_CONTENT:
        return 'The selected records do not contain enough content for AI processing.';

      case AIErrorType.SERVICE_TIMEOUT:
        return 'The AI service request timed out. Please check your connection and try again.';

      case AIErrorType.AI_PROCESSING_FAILED:
        return 'The AI service encountered an error while processing your request.';

      default:
        // Always sanitize the original error before including it
        return `AI operation failed: ${sanitizedError}`;
    }
  }

  /**
   * Determines if error type is retryable
   */
  private isRetryable(type: AIErrorType): boolean {
    const nonRetryableTypes = [
      AIErrorType.DEVONTHINK_NOT_RUNNING,
      AIErrorType.AUTHENTICATION_FAILED,
      AIErrorType.API_KEY_INVALID,
      AIErrorType.RECORD_NOT_FOUND,
      AIErrorType.DATABASE_NOT_FOUND,
      AIErrorType.INVALID_INPUT,
      AIErrorType.MISSING_REQUIRED_FIELD,
      AIErrorType.UNSUPPORTED_FORMAT
    ];

    return !nonRetryableTypes.includes(type);
  }

  /**
   * Determines if error requires user intervention
   */
  private requiresUserAction(type: AIErrorType): boolean {
    const userActionTypes = [
      AIErrorType.DEVONTHINK_NOT_RUNNING,
      AIErrorType.AUTHENTICATION_FAILED,
      AIErrorType.API_KEY_INVALID,
      AIErrorType.QUOTA_EXCEEDED,
      AIErrorType.DISK_SPACE_ERROR,
      AIErrorType.RECORD_NOT_FOUND,
      AIErrorType.INVALID_INPUT
    ];

    return userActionTypes.includes(type);
  }

  /**
   * Creates error result from AIError with additional sanitization
   */
  private createErrorResult(aiError: AIError): BaseAIResult {
    return {
      success: false,
      operationType: aiError.operationType,
      error: this.sanitizeJXAError(aiError.message), // Extra sanitization layer
      timestamp: aiError.timestamp,
      // Include additional error context
      errorType: aiError.type,
      severity: aiError.severity,
      suggestions: aiError.suggestions,
      retryable: aiError.retryable,
      userActionRequired: aiError.userActionRequired
    } as BaseAIResult & {
      errorType: AIErrorType;
      severity: ErrorSeverity;
      suggestions: string[];
      retryable: boolean;
      userActionRequired: boolean;
    };
  }

  /**
   * Logs successful recovery for monitoring
   */
  private logRecovery(error: AIError, strategy: RecoveryStrategy, attempts: RecoveryAttempt[]): void {
    if (this.config.logErrors) {
      // AI Error Recovery Success logged (silent handling to avoid stderr)
    }
  }

  /**
   * Utility method to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets error statistics for monitoring
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<AIErrorType, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    retryableErrors: number;
  } {
    const stats = {
      totalErrors: 0,
      errorsByType: {} as Record<AIErrorType, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      retryableErrors: 0
    };

    this.errorHistory.forEach(errors => {
      errors.forEach(error => {
        stats.totalErrors++;
        stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
        stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
        if (error.retryable) {
          stats.retryableErrors++;
        }
      });
    });

    return stats;
  }
}

/**
 * Global error handler instance
 */
export const globalAIErrorHandler = new AIErrorHandler();

/**
 * Convenience function for handling AI errors
 */
export async function handleAIError(
  error: any,
  operationType: AIOperationType,
  context?: Record<string, any>
): Promise<AIError> {
  return globalAIErrorHandler.analyzeError(error, operationType, context);
}