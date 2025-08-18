/**
 * Simplified tests for checkAIStatus tool
 * Focus on core functionality only - removed brittle tests that validate
 * implementation details rather than business logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock modules BEFORE importing the tool
vi.mock('../../../src/applescript/execute.js');
vi.mock('../../../src/tools/ai/utils/simpleAIChecker.js', () => ({
  checkAIServiceSimple: vi.fn().mockResolvedValue({
    success: true,
    devonthinkRunning: true,
    aiEnginesConfigured: ['ChatGPT', 'Claude'],
    recommendedEngine: 'ChatGPT'
  })
}));

import { checkAIStatusTool } from '../../../src/tools/ai/checkAIStatus.js';
import { executeJxa } from '../../../src/applescript/execute.js';

describe('checkAIStatus Tool', () => {
  const mockExecuteJxa = vi.mocked(executeJxa);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Tool Structure', () => {
    it('should have valid MCP tool structure', () => {
      expect(checkAIStatusTool.name).toBe('check_ai_status');
      expect(checkAIStatusTool.description).toBeTruthy();
      expect(checkAIStatusTool.inputSchema).toBeTruthy();
      expect(typeof checkAIStatusTool.run).toBe('function');
    });
  });

  describe('Core Functionality', () => {
    it('should handle basic input validation', async () => {
      // Test with empty input (new simplified interface)
      const input = {};

      // Mock executeJxa for engine testing (return working engines)
      mockExecuteJxa.mockResolvedValue({
        success: true,
        model: 'gpt-4'
      });

      // The test should at least not crash on valid inputs
      const result = await checkAIStatusTool.run(input);
      
      // We expect either success or a reasonable result structure
      expect(typeof result.success).toBe('boolean');
      expect(Array.isArray(result.workingEngines)).toBe(true);
      expect(typeof result.summary).toBe('string');
      expect(typeof result.devonthinkRunning).toBe('boolean');
      expect(typeof result.aiAvailable).toBe('boolean');
      expect(typeof result.lastChecked).toBe('string');
    });
  });

  describe('Error Handling', () => {
    it('should handle DEVONthink not running', async () => {
      // Mock checkAIServiceSimple to return DEVONthink not running
      const { checkAIServiceSimple } = await import('../../../src/tools/ai/utils/simpleAIChecker.js');
      vi.mocked(checkAIServiceSimple).mockResolvedValueOnce({
        success: true,
        devonthinkRunning: false,
        aiEnginesConfigured: [],
        recommendedEngine: null
      });

      const input = {};
      const result = await checkAIStatusTool.run(input);

      expect(result.success).toBe(true); // Tool runs successfully even if DEVONthink not running
      expect(result.devonthinkRunning).toBe(false);
      expect(result.summary).toContain('DEVONthink is not running');
    });

    it('should handle JXA execution errors', async () => {
      // Mock checkAIServiceSimple to return failure
      const { checkAIServiceSimple } = await import('../../../src/tools/ai/utils/simpleAIChecker.js');
      vi.mocked(checkAIServiceSimple).mockResolvedValueOnce({
        success: false,
        devonthinkRunning: false,
        aiEnginesConfigured: [],
        recommendedEngine: null,
        error: 'Script failed'
      });

      const input = {};
      const result = await checkAIStatusTool.run(input);

      expect(result.success).toBe(false);
      expect(result.summary).toContain('Failed to check AI status');
    });
  });
});