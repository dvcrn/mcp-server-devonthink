/**
 * Simplified tests for analyzeDocumentThemes tool
 * Focus on core functionality only - removed tests that validate
 * mock script calls and implementation details
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeDocumentThemesTool } from '../../../src/tools/ai/analyzeDocumentThemes.js';
import { executeJxa } from '../../../src/applescript/execute.js';
import { checkAIServiceSimple } from '../../../src/tools/ai/utils/simpleAIChecker.js';

vi.mock('../../../src/applescript/execute.js');
vi.mock('../../../src/tools/ai/utils/simpleAIChecker.js');

const mockExecuteJxa = vi.mocked(executeJxa);
const mockCheckAIServiceSimple = vi.mocked(checkAIServiceSimple);

describe('analyzeDocumentThemes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckAIServiceSimple.mockResolvedValue({ 
      success: true, 
      devonthinkRunning: true,
      aiEnginesConfigured: ['ChatGPT'] 
    });
  });

  describe('Tool Structure', () => {
    it('should have valid MCP tool structure', () => {
      expect(analyzeDocumentThemesTool.name).toBe('analyze_document_themes');
      expect(analyzeDocumentThemesTool.description).toBeTruthy();
      expect(analyzeDocumentThemesTool.inputSchema).toBeTruthy();
      expect(typeof analyzeDocumentThemesTool.run).toBe('function');
    });
  });

  describe('Core Functionality', () => {
    it('should work with valid UUID input', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: [{
            theme: "Test Theme",
            description: "Test description",
            confidence: 0.9
          }],
          overallSummary: "Test summary",
          documentsCovered: 1,
          analysisType: "comprehensive"
        },
        documents: [{
          uuid: "12345678-1234-1234-1234-123456789abc",
          name: "Test.md",
          contribution: "Test contribution"
        }]
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { uuid: "12345678-1234-1234-1234-123456789abc" }
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(true);
      expect(result.analysis?.mainThemes).toBeDefined();
    });

    it('should work with search query input', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: [{
            theme: "Search Theme",
            description: "Theme from search",
            confidence: 0.8
          }],
          documentsCovered: 3,
          analysisType: "topics"
        }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { searchQuery: "test query" }
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(true);
      expect(result.analysis?.documentsCovered).toBe(3);
    });

    it('should handle missing required fields', async () => {
      const result = await analyzeDocumentThemesTool.run({} as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Target is required");
    });

    it('should validate input bounds', async () => {
      const result = await analyzeDocumentThemesTool.run({
        target: { uuid: "12345678-1234-1234-1234-123456789abc" },
        maxThemes: 25 // exceeds max of 20
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });




  describe('Error Handling', () => {
    it('should handle DEVONthink not running', async () => {
      mockExecuteJxa.mockResolvedValue({
        success: false,
        error: "DEVONthink is not running"
      });

      const input = {
        target: { uuid: "12345678-1234-1234-1234-123456789abc" }
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle record not found', async () => {
      mockExecuteJxa.mockResolvedValue({
        success: false,
        error: "Record not found"
      });

      const input = {
        target: { uuid: "12345678-1234-1234-1234-123456789abc" }
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle JXA execution errors', async () => {
      mockExecuteJxa.mockRejectedValue(new Error("Script failed"));

      const input = {
        target: { uuid: "12345678-1234-1234-1234-123456789abc" }
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Script failed");
    });
  });



});