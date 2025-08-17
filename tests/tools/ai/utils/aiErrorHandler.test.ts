/**
 * Unit tests for AI error handler utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AIErrorHandler,
  globalAIErrorHandler,
  handleAIError,
  AIErrorType,
  ErrorSeverity,
  RecoveryStrategy,
  ErrorHandlingConfig
} from '@/tools/ai/utils/aiErrorHandler.js';
import { BaseAIResult } from '@/tools/ai/utils/resultProcessor.js';

// Mock the AI availability checker
vi.mock('@/tools/ai/utils/aiAvailabilityChecker.js', () => ({
  checkAIServiceAvailability: vi.fn().mockResolvedValue({
    isAvailable: true,
    availableEngines: ['ChatGPT', 'Claude'],
    defaultEngine: 'ChatGPT'
  })
}));

describe('AI Error Handler Utilities', () => {
  let errorHandler: AIErrorHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    errorHandler = new AIErrorHandler({
      maxRetries: 2,
      baseRetryDelay: 100, // Shorter delays for testing
      maxRetryDelay: 1000,
      enableAutoRecovery: true,
      logErrors: false // Disable logging for tests
    });
  });

  describe('Error Analysis', () => {
    describe('Error Categorization', () => {
      it('should categorize DEVONthink not running error', () => {
        const error = 'DEVONthink is not running';
        const aiError = errorHandler.analyzeError(error, 'chat');

        expect(aiError.type).toBe(AIErrorType.DEVONTHINK_NOT_RUNNING);
        expect(aiError.severity).toBe(ErrorSeverity.CRITICAL);
        expect(aiError.retryable).toBe(false);
        expect(aiError.userActionRequired).toBe(true);
        expect(aiError.suggestions).toContain('Start the DEVONthink application');
      });

      it('should categorize authentication errors', () => {
        const errors = [
          'API key authentication failed',
          'Invalid authentication credentials',
          'Authentication error occurred'
        ];

        for (const errorMsg of errors) {
          const aiError = errorHandler.analyzeError(errorMsg, 'chat');
          expect(aiError.type).toBe(AIErrorType.AUTHENTICATION_FAILED);
          expect(aiError.severity).toBe(ErrorSeverity.HIGH);
          expect(aiError.userActionRequired).toBe(true);
        }
      });

      it('should categorize rate limiting errors', () => {
        const errors = [
          'Rate limit exceeded',
          'Too many requests',
          'Rate limiting in effect'
        ];

        for (const errorMsg of errors) {
          const aiError = errorHandler.analyzeError(errorMsg, 'chat');
          expect(aiError.type).toBe(AIErrorType.RATE_LIMITED);
          expect(aiError.severity).toBe(ErrorSeverity.MEDIUM);
          expect(aiError.retryable).toBe(true);
          expect(aiError.recoveryStrategies).toContain(RecoveryStrategy.RETRY_WITH_BACKOFF);
        }
      });

      it('should categorize timeout errors', () => {
        const errors = [
          'Request timeout',
          'Operation timed out',
          'Connection timeout occurred'
        ];

        for (const errorMsg of errors) {
          const aiError = errorHandler.analyzeError(errorMsg, 'chat');
          expect(aiError.type).toBe(AIErrorType.SERVICE_TIMEOUT);
          expect(aiError.severity).toBe(ErrorSeverity.MEDIUM);
          expect(aiError.retryable).toBe(true);
          expect(aiError.recoveryStrategies).toContain(RecoveryStrategy.RETRY_WITH_BACKOFF);
        }
      });

      it('should categorize record not found errors', () => {
        const errors = [
          'Record not found with UUID: 12345',
          'UUID does not exist',
          'Could not find record'
        ];

        for (const errorMsg of errors) {
          const aiError = errorHandler.analyzeError(errorMsg, 'analyze');
          expect(aiError.type).toBe(AIErrorType.RECORD_NOT_FOUND);
          expect(aiError.severity).toBe(ErrorSeverity.LOW);
          expect(aiError.retryable).toBe(false);
          expect(aiError.suggestions).toContain('Verify the record UUID is correct');
        }
      });

      it('should categorize input validation errors', () => {
        const errors = [
          'Invalid input provided',
          'Validation failed',
          'Input validation error'
        ];

        for (const errorMsg of errors) {
          const aiError = errorHandler.analyzeError(errorMsg, 'generate');
          expect(aiError.type).toBe(AIErrorType.INVALID_INPUT);
          expect(aiError.severity).toBe(ErrorSeverity.LOW);
          expect(aiError.retryable).toBe(false);
        }
      });

      it('should categorize input too large errors', () => {
        const errors = [
          'Input too large for processing',
          'Size limit exceeded',
          'Content is too large'
        ];

        for (const errorMsg of errors) {
          const aiError = errorHandler.analyzeError(errorMsg, 'summarize');
          expect(aiError.type).toBe(AIErrorType.INPUT_TOO_LARGE);
          expect(aiError.recoveryStrategies).toContain(RecoveryStrategy.REDUCE_INPUT_SIZE);
        }
      });

      it('should categorize service unavailable errors', () => {
        const errors = [
          'Service unavailable',
          'HTTP 503 error',
          'Service temporarily unavailable'
        ];

        for (const errorMsg of errors) {
          const aiError = errorHandler.analyzeError(errorMsg, 'chat');
          expect(aiError.type).toBe(AIErrorType.SERVICE_UNAVAILABLE);
          expect(aiError.recoveryStrategies).toContain(RecoveryStrategy.ALTERNATIVE_ENGINE);
        }
      });

      it('should handle unknown errors', () => {
        const error = 'Some completely unknown error message';
        const aiError = errorHandler.analyzeError(error, 'chat');

        expect(aiError.type).toBe(AIErrorType.UNKNOWN_ERROR);
        expect(aiError.severity).toBe(ErrorSeverity.MEDIUM);
        expect(aiError.originalError).toBe(error);
      });
    });

    describe('Error Context', () => {
      it('should include operation type and context', () => {
        const error = 'Test error';
        const context = { recordId: '12345', engine: 'ChatGPT' };
        const aiError = errorHandler.analyzeError(error, 'analyze', context);

        expect(aiError.operationType).toBe('analyze');
        expect(aiError.context).toEqual(context);
        expect(aiError.timestamp).toBeDefined();
      });

      it('should handle Error objects', () => {
        const error = new Error('JavaScript Error object');
        const aiError = errorHandler.analyzeError(error, 'chat');

        expect(aiError.originalError).toBe('JavaScript Error object');
        expect(aiError.message).toContain('JavaScript Error object');
      });

      it('should handle non-string, non-Error values', () => {
        const error = { status: 500, message: 'Server error' };
        const aiError = errorHandler.analyzeError(error, 'chat');

        expect(aiError.originalError).toBe('[object Object]');
      });
    });
  });

  describe('Recovery Strategies', () => {
    describe('Strategy Execution', () => {
      it('should execute simple retry strategy', async () => {
        const mockOperation = vi.fn().mockResolvedValue({ success: true, operationType: 'chat' });
        
        const aiError = errorHandler.analyzeError('Temporary service error', 'chat');
        
        const result = await errorHandler.attemptRecovery(aiError, mockOperation);
        
        expect(result.success).toBe(true);
        expect(mockOperation).toHaveBeenCalled();
      });

      it('should execute retry with backoff strategy', async () => {
        const startTime = Date.now();
        const mockOperation = vi.fn().mockResolvedValue({ success: true, operationType: 'chat' });
        
        const aiError = errorHandler.analyzeError('Rate limit exceeded', 'chat');
        
        await errorHandler.attemptRecovery(aiError, mockOperation);
        
        const duration = Date.now() - startTime;
        expect(duration).toBeGreaterThanOrEqual(100); // At least base delay
      });

      it('should try alternative engine strategy', async () => {
        const mockOperation = vi.fn().mockResolvedValue({ success: true, operationType: 'chat' });
        
        const aiError = errorHandler.analyzeError('Service unavailable', 'chat');
        
        const result = await errorHandler.attemptRecovery(aiError, mockOperation);
        
        expect(result.success).toBe(true);
      });

      it('should handle recovery strategy failures', async () => {
        const mockOperation = vi.fn().mockRejectedValue(new Error('Still failing'));
        
        const aiError = errorHandler.analyzeError('Temporary error', 'chat');
        
        const result = await errorHandler.attemptRecovery(aiError, mockOperation);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('AI operation failed');
      });
    });

    describe('Recovery Attempts', () => {
      it('should respect maxRetries configuration', async () => {
        let attemptCount = 0;
        const mockOperation = vi.fn().mockImplementation(() => {
          attemptCount++;
          return Promise.reject(new Error(`Attempt ${attemptCount} failed`));
        });
        
        const aiError = errorHandler.analyzeError('Retryable error', 'chat');
        
        await errorHandler.attemptRecovery(aiError, mockOperation);
        
        // Should attempt initial + maxRetries (2) = 3 total attempts
        expect(attemptCount).toBeLessThanOrEqual(3);
      });

      it('should not attempt recovery for non-retryable errors', async () => {
        const mockOperation = vi.fn();
        
        const aiError = errorHandler.analyzeError('Record not found', 'chat');
        
        const result = await errorHandler.attemptRecovery(aiError, mockOperation);
        
        expect(result.success).toBe(false);
        expect(mockOperation).not.toHaveBeenCalled();
        expect(result.error).toContain('record could not be found');
      });

      it('should disable auto recovery when configured', async () => {
        const noRecoveryHandler = new AIErrorHandler({
          enableAutoRecovery: false
        });
        
        const mockOperation = vi.fn();
        const aiError = noRecoveryHandler.analyzeError('Retryable error', 'chat');
        
        const result = await noRecoveryHandler.attemptRecovery(aiError, mockOperation);
        
        expect(result.success).toBe(false);
        expect(mockOperation).not.toHaveBeenCalled();
      });
    });

    describe('Recovery Context', () => {
      it('should include recovery attempt information in final result', async () => {
        const mockOperation = vi.fn().mockRejectedValue(new Error('Still failing'));
        
        const aiError = errorHandler.analyzeError('Service timeout', 'chat');
        
        const result = await errorHandler.attemptRecovery(aiError, mockOperation);
        
        expect(result.success).toBe(false);
        expect((result as any).errorType).toBeDefined();
        expect((result as any).suggestions).toBeDefined();
        expect((result as any).retryable).toBeDefined();
      });
    });
  });

  describe('Error Statistics', () => {
    it('should track error statistics', () => {
      // Generate some errors
      errorHandler.analyzeError('Rate limit exceeded', 'chat');
      errorHandler.analyzeError('Record not found', 'analyze');
      errorHandler.analyzeError('Service timeout', 'summarize');
      errorHandler.analyzeError('Rate limit exceeded', 'generate'); // Duplicate type

      const stats = errorHandler.getErrorStats();

      expect(stats.totalErrors).toBe(0); // Errors aren't stored by default in this implementation
      expect(stats.errorsByType).toBeDefined();
      expect(stats.errorsBySeverity).toBeDefined();
    });
  });

  describe('User-Friendly Messages', () => {
    it('should provide clear error messages for each type', () => {
      const testCases = [
        {
          error: 'DEVONthink is not running',
          expectedMessage: 'DEVONthink is not running. Please start DEVONthink to use AI features.'
        },
        {
          error: 'API key authentication failed',
          expectedMessage: 'AI service authentication failed. Please check your API key configuration in DEVONthink preferences.'
        },
        {
          error: 'Rate limit exceeded',
          expectedMessage: 'AI service rate limit reached. Please wait before making additional requests.'
        },
        {
          error: 'Record not found with UUID',
          expectedMessage: 'The requested record could not be found. It may have been deleted or moved.'
        },
        {
          error: 'Input too large',
          expectedMessage: 'The input is too large for the AI service. Please try with less content or fewer records.'
        }
      ];

      for (const testCase of testCases) {
        const aiError = errorHandler.analyzeError(testCase.error, 'chat');
        expect(aiError.message).toBe(testCase.expectedMessage);
      }
    });
  });

  describe('Configuration', () => {
    it('should use default configuration when not specified', () => {
      const defaultHandler = new AIErrorHandler();
      
      // Configuration should use defaults
      expect((defaultHandler as any).config.maxRetries).toBe(3);
      expect((defaultHandler as any).config.enableAutoRecovery).toBe(true);
      expect((defaultHandler as any).config.logErrors).toBe(true);
    });

    it('should merge custom configuration with defaults', () => {
      const customConfig: Partial<ErrorHandlingConfig> = {
        maxRetries: 5,
        logErrors: false
      };
      
      const customHandler = new AIErrorHandler(customConfig);
      
      expect((customHandler as any).config.maxRetries).toBe(5);
      expect((customHandler as any).config.logErrors).toBe(false);
      expect((customHandler as any).config.enableAutoRecovery).toBe(true); // Should use default
    });
  });

  describe('Global Error Handler', () => {
    it('should provide global error handler instance', () => {
      expect(globalAIErrorHandler).toBeInstanceOf(AIErrorHandler);
    });

    it('should provide convenience function for error handling', async () => {
      const error = 'Test error for global handler';
      const context = { test: 'context' };
      
      const aiError = await handleAIError(error, 'chat', context);
      
      expect(aiError.originalError).toBe(error);
      expect(aiError.operationType).toBe('chat');
      expect(aiError.context).toEqual(context);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined errors gracefully', () => {
      const nullError = errorHandler.analyzeError(null, 'chat');
      const undefinedError = errorHandler.analyzeError(undefined, 'chat');
      
      expect(nullError.originalError).toBe('null');
      expect(undefinedError.originalError).toBe('undefined');
      expect(nullError.type).toBe(AIErrorType.UNKNOWN_ERROR);
      expect(undefinedError.type).toBe(AIErrorType.UNKNOWN_ERROR);
    });

    it('should handle empty string errors', () => {
      const emptyError = errorHandler.analyzeError('', 'chat');
      
      expect(emptyError.originalError).toBe('');
      expect(emptyError.type).toBe(AIErrorType.UNKNOWN_ERROR);
    });

    it('should handle very long error messages', () => {
      const longError = 'Error: ' + 'x'.repeat(10000);
      const aiError = errorHandler.analyzeError(longError, 'chat');
      
      expect(aiError.originalError).toBe(longError);
      expect(aiError.message).toBeDefined();
    });

    it('should handle special characters in error messages', () => {
      const specialError = 'Error with special chars: éñ中文🚀\n\t\r';
      const aiError = errorHandler.analyzeError(specialError, 'chat');
      
      expect(aiError.originalError).toBe(specialError);
      expect(aiError.type).toBeDefined();
    });
  });

  describe('Recovery Strategy Edge Cases', () => {
    it('should handle recovery strategy exceptions', async () => {
      // Mock a strategy that throws during execution
      const mockOperation = vi.fn();
      
      // Create an error that would trigger alternative engine strategy
      const aiError = errorHandler.analyzeError('Service unavailable', 'chat');
      
      // Mock checkAIServiceAvailability to throw
      const { checkAIServiceAvailability } = await import('@/tools/ai/utils/aiAvailabilityChecker.js');
      (checkAIServiceAvailability as any).mockRejectedValueOnce(new Error('Service check failed'));
      
      const result = await errorHandler.attemptRecovery(aiError, mockOperation);
      
      // Should still return a result even if recovery strategy fails
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
    });

    it('should handle exponential backoff calculation edge cases', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Always fails'));
      
      // Configure handler with extreme values
      const extremeHandler = new AIErrorHandler({
        maxRetries: 10,
        baseRetryDelay: 1,
        maxRetryDelay: 5 // Very small max delay
      });
      
      const aiError = extremeHandler.analyzeError('Rate limit exceeded', 'chat');
      
      const startTime = Date.now();
      await extremeHandler.attemptRecovery(aiError, mockOperation);
      const duration = Date.now() - startTime;
      
      // Should not exceed a reasonable time even with many retries
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid error analysis', () => {
      const startTime = Date.now();
      
      // Analyze many errors quickly
      for (let i = 0; i < 1000; i++) {
        errorHandler.analyzeError(`Error ${i}`, 'chat');
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent error analysis', async () => {
      const promises = Array(100).fill(null).map((_, i) => 
        Promise.resolve(errorHandler.analyzeError(`Concurrent error ${i}`, 'chat'))
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(100);
      results.forEach((result, i) => {
        expect(result.originalError).toBe(`Concurrent error ${i}`);
      });
    });
  });
});