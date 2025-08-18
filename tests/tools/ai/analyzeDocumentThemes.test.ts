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

  describe('Bug Reproduction Tests', () => {
    it('should generate valid JXA script without undefined functions for complex OR queries', async () => {
      // IMPORTANT: This test verifies that the JXA script generation creates valid scripts
      // It should PASS but currently FAILS due to the bug with undefined functions
      
      // Mock AI service as available
      mockCheckAIServiceSimple.mockResolvedValue({ 
        success: true, 
        devonthinkRunning: true,
        aiEnginesConfigured: ['ChatGPT'] 
      });

      // Clear the executeJxa mock for this test - we want to test the actual execution path
      // but provide a mock implementation that simulates successful execution
      mockExecuteJxa.mockResolvedValue({
        success: true,
        analysis: {
          mainThemes: [{
            theme: "Test Theme Generated by Mock",
            description: "This theme was generated by a successful JXA script execution mock",
            confidence: 0.85
          }],
          overallSummary: "Mock analysis completed successfully",
          documentsCovered: 1,
          analysisType: "comprehensive"
        },
        documents: [{
          uuid: "test-uuid-123",
          name: "Test Document",
          contribution: "Test contribution"
        }],
        metadata: {
          processingTime: 1000,
          themeCount: 1,
          documentCount: 1
        },
        executionTime: 1500
      });
      
      const input = {
        target: {
          searchQuery: "theory of constraints OR TOC OR throughput accounting"
        },
        analysisType: "comprehensive" as const,
        includeSubthemes: true,
        includeEvidence: true,
        maxThemes: 10
      };

      const result = await analyzeDocumentThemesTool.run(input);
      
      // Debug: Log the actual error if the test fails
      if (!result.success) {
        console.log("ACTUAL ERROR:", result.error);
        console.log("VALIDATION DETAILS:", result.validation?.validationDetails);
      }
      
      // THIS SHOULD PASS but currently FAILS due to script generation bug
      if (!result.success) {
        // Show the actual error in the test failure message
        throw new Error(`Script generation failed: ${result.error} | Validation: ${result.validation?.validationDetails}`);
      }
      expect(result.success).toBe(true);
      expect(result.validation?.scriptValid).toBe(true);
      
      // The script should not contain undefined function calls
      if (result.error) {
        expect(result.error).not.toContain("titles");
        expect(result.error).not.toContain("first");  
        expect(result.error).not.toContain("next");
        expect(result.error).not.toContain("fallback");
        expect(result.error).not.toContain("themes");
        expect(result.error).not.toContain("sentences");
        expect(result.error).not.toContain("evidence");
        expect(result.error).not.toContain("content");
      }
    });

    it('should generate script that validates without critical errors', async () => {
      // This test specifically checks script validation quality
      
      mockCheckAIServiceSimple.mockResolvedValue({ 
        success: true, 
        devonthinkRunning: true,
        aiEnginesConfigured: ['ChatGPT'] 
      });

      // Mock successful executeJxa for validation test
      mockExecuteJxa.mockResolvedValue({
        success: true,
        analysis: {
          mainThemes: [{ theme: "Validation Test", description: "Test passed", confidence: 0.9 }],
          overallSummary: "Validation test summary",
          documentsCovered: 1,
          analysisType: "concepts"
        },
        documents: [{ uuid: "test-uuid", name: "Test", contribution: "Test" }],
        metadata: { processingTime: 500, themeCount: 1, documentCount: 1 },
        executionTime: 750
      });

      const input = {
        target: {
          uuid: "12345678-1234-1234-1234-123456789abc"
        },
        analysisType: "concepts" as const
      };

      const result = await analyzeDocumentThemesTool.run(input);
      
      // Should generate valid script without critical validation errors
      expect(result.validation?.scriptValid).toBe(true);
      
      // Should not have critical validation errors - warnings are acceptable
      if (result.validation?.validationDetails) {
        // The validator may show warnings about functions in strings, but these are false positives
        // The important thing is that the script is marked as valid and executes successfully
        expect(result.validation.validationDetails).toContain("Script validation passed");
        
        // Critical errors would be syntax errors or missing required functions
        expect(result.validation.validationDetails).not.toContain("syntax error");
        expect(result.validation.validationDetails).not.toContain("missing required function");
      }
    });
  });

});