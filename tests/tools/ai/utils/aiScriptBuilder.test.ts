/**
 * Unit tests for AI script builder utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  buildBaseAIScript,
  buildChatScript,
  buildSummarizeScript,
  buildClassifyScript,
  buildCompareScript,
  formatAIScriptValue,
  AIScriptOptions,
  RecordAIScriptOptions,
  AI_JXA_HELPERS
} from '@/tools/ai/utils/aiScriptBuilder.js';
import { AI_TEST_PATTERNS } from '@tests/utils/test-helpers.js';

describe('AI Script Builder Utilities', () => {
  describe('buildBaseAIScript', () => {
    it('should create valid JXA script structure', () => {
      const scriptBody = 'console.log("test");';
      const result = buildBaseAIScript('test', scriptBody);
      
      expect(result).toContain('const theApp = Application("DEVONthink");');
      expect(result).toContain('theApp.includeStandardAdditions = true;');
      expect(result).toContain('try {');
      expect(result).toContain('validateAIService(theApp);');
      expect(result).toContain(scriptBody);
      expect(result).toContain('} catch (error) {');
      expect(result).toContain('return JSON.stringify(errorResult);');
    });

    it('should include helper functions by default', () => {
      const result = buildBaseAIScript('test', '');
      
      expect(result).toContain('validateAIService');
      expect(result).toContain('buildAIOptions');
      expect(result).toContain('getRecordsForAI');
      expect(result).toContain('handleAIResponse');
    });

    it('should exclude helper functions when requested', () => {
      const result = buildBaseAIScript('test', '', false);
      
      expect(result).not.toContain('validateAIService(theApp);');
      expect(result).not.toContain(AI_JXA_HELPERS);
    });

    it('should escape operation type in error handling', () => {
      const operationType = 'test"operation';
      const result = buildBaseAIScript(operationType, '');
      
      expect(result).toContain('"operationType": "test"operation"');
    });
  });

  describe('buildChatScript', () => {
    const basicPrompt = 'What is the weather like today?';

    it('should build valid chat script with minimal parameters', () => {
      const result = buildChatScript(basicPrompt);
      
      expect(result).toContain('getChatResponseForMessage');
      expect(result).toContain(basicPrompt.replace(/"/g, '\\"'));
      expect(result).toContain('"operationType": "chat"');
      expect(result).toContain('engine: "ChatGPT"');
      expect(result).toContain('temperature: 0.7');
    });

    it('should handle record UUIDs', () => {
      const options: RecordAIScriptOptions = {
        recordUuids: [AI_TEST_PATTERNS.VALID_UUID],
        mode: 'context'
      };
      
      const result = buildChatScript(basicPrompt, options);
      
      expect(result).toContain(AI_TEST_PATTERNS.VALID_UUID);
      expect(result).toContain('getRecordsForAI');
      expect(result).toContain('mode: "context"');
    });

    it('should handle record IDs with database name', () => {
      const options: RecordAIScriptOptions = {
        recordIds: [12345, 67890],
        databaseName: 'Test Database'
      };
      
      const result = buildChatScript(basicPrompt, options);
      
      expect(result).toContain('recordIds: [12345, 67890]');
      expect(result).toContain('databaseName: "Test Database"');
    });

    it('should escape special characters in prompt', () => {
      const specialPrompt = 'What is "this" and \\that\\?';
      const result = buildChatScript(specialPrompt);
      
      expect(result).toContain('What is \\"this\\" and \\\\that\\\\?');
    });

    it('should handle all AI engine options', () => {
      const options: RecordAIScriptOptions = {
        engine: 'Claude',
        model: 'claude-3-sonnet',
        temperature: 0.5,
        systemPrompt: 'You are a helpful assistant'
      };
      
      const result = buildChatScript(basicPrompt, options);
      
      expect(result).toContain('engine: "Claude"');
      expect(result).toContain('model: "claude-3-sonnet"');
      expect(result).toContain('temperature: 0.5');
      expect(result).toContain('systemPrompt: "You are a helpful assistant"');
    });

    it('should handle custom options', () => {
      const options: RecordAIScriptOptions = {
        customOptions: { 
          customParam: 'customValue',
          maxRetries: 3
        }
      };
      
      const result = buildChatScript(basicPrompt, options);
      
      expect(result).toContain('"customParam":"customValue"');
      expect(result).toContain('"maxRetries":3');
    });

    it('should validate maxRecords parameter', () => {
      const options: RecordAIScriptOptions = {
        recordUuids: Array(20).fill(AI_TEST_PATTERNS.VALID_UUID),
        maxRecords: 5
      };
      
      const result = buildChatScript(basicPrompt, options);
      
      expect(result).toContain('maxRecords: 5');
    });
  });

  describe('buildSummarizeScript', () => {
    const recordUuids = [AI_TEST_PATTERNS.VALID_UUID];

    it('should build valid summarization script', () => {
      const result = buildSummarizeScript(recordUuids);
      
      expect(result).toContain('summarizeContentsOf');
      expect(result).toContain(AI_TEST_PATTERNS.VALID_UUID);
      expect(result).toContain('"operationType": "summarize"');
      expect(result).toContain('"outputFormat": "markdown"');
    });

    it('should handle destination group', () => {
      const destinationUuid = 'dest-' + AI_TEST_PATTERNS.VALID_UUID;
      const result = buildSummarizeScript(recordUuids, destinationUuid);
      
      expect(result).toContain(destinationUuid);
      expect(result).toContain('getRecordWithUuid("' + destinationUuid.replace(/"/g, '\\"') + '")');
    });

    it('should handle different output formats', () => {
      const options: AIScriptOptions = {
        outputFormat: 'text'
      };
      
      const result = buildSummarizeScript(recordUuids, undefined, options);
      
      expect(result).toContain('"text"');
    });

    it('should handle multiple records', () => {
      const multipleUuids = [
        AI_TEST_PATTERNS.VALID_UUID,
        'second-' + AI_TEST_PATTERNS.VALID_UUID,
        'third-' + AI_TEST_PATTERNS.VALID_UUID
      ];
      
      const result = buildSummarizeScript(multipleUuids);
      
      for (const uuid of multipleUuids) {
        expect(result).toContain(uuid);
      }
      expect(result).toContain('record0');
      expect(result).toContain('record1');
      expect(result).toContain('record2');
    });

    it('should handle custom engine and model', () => {
      const options: AIScriptOptions = {
        engine: 'Claude',
        model: 'claude-3-sonnet'
      };
      
      const result = buildSummarizeScript(recordUuids, undefined, options);
      
      expect(result).toContain('summaryOptions["engine"] = "Claude"');
      expect(result).toContain('summaryOptions["model"] = "claude-3-sonnet"');
    });
  });

  describe('buildClassifyScript', () => {
    const recordUuid = AI_TEST_PATTERNS.VALID_UUID;

    it('should build valid classification script', () => {
      const result = buildClassifyScript(recordUuid);
      
      expect(result).toContain('classify');
      expect(result).toContain(recordUuid);
      expect(result).toContain('"operationType": "classify"');
    });

    it('should handle database specification', () => {
      const options = {
        databaseName: 'Test Database'
      };
      
      const result = buildClassifyScript(recordUuid, options);
      
      expect(result).toContain('getDatabase(theApp, "Test Database")');
    });

    it('should handle comparison options', () => {
      const options = {
        comparison: 'tags comparison' as const,
        tags: true
      };
      
      const result = buildClassifyScript(recordUuid, options);
      
      expect(result).toContain('classifyOptions["comparison"] = "tags comparison"');
      expect(result).toContain('classifyOptions["tags"] = true');
    });

    it('should handle different AI engines', () => {
      const options = {
        engine: 'Claude' as const,
        model: 'claude-3-sonnet'
      };
      
      const result = buildClassifyScript(recordUuid, options);
      
      expect(result).toContain('classifyOptions["engine"] = "Claude"');
      expect(result).toContain('classifyOptions["model"] = "claude-3-sonnet"');
    });
  });

  describe('buildCompareScript', () => {
    const sourceUuid = AI_TEST_PATTERNS.VALID_UUID;

    it('should build valid comparison script for similar records', () => {
      const result = buildCompareScript(sourceUuid);
      
      expect(result).toContain('compareTo');
      expect(result).toContain(sourceUuid);
      expect(result).toContain('"operationType": "compare"');
      expect(result).toContain('maxResults": 10');
    });

    it('should handle specific target record comparison', () => {
      const targetUuid = 'target-' + AI_TEST_PATTERNS.VALID_UUID;
      const result = buildCompareScript(sourceUuid, targetUuid);
      
      expect(result).toContain(sourceUuid);
      expect(result).toContain(targetUuid);
      expect(result).toContain('getRecordWithUuid("' + targetUuid.replace(/"/g, '\\"') + '")');
      expect(result).toContain('compareOptions["to"] = targetRecord');
    });

    it('should handle database scoping', () => {
      const options = {
        databaseName: 'Research Database',
        maxResults: 20
      };
      
      const result = buildCompareScript(sourceUuid, undefined, options);
      
      expect(result).toContain('getDatabase(theApp, "Research Database")');
      expect(result).toContain('maxResults": 20');
    });

    it('should handle custom engine options', () => {
      const options = {
        engine: 'Claude' as const,
        model: 'claude-3-sonnet'
      };
      
      const result = buildCompareScript(sourceUuid, undefined, options);
      
      expect(result).toContain('compareOptions["engine"] = "Claude"');
      expect(result).toContain('compareOptions["model"] = "claude-3-sonnet"');
    });
  });

  describe('formatAIScriptValue', () => {
    it('should format null and undefined', () => {
      expect(formatAIScriptValue(null)).toBe('null');
      expect(formatAIScriptValue(undefined)).toBe('null');
    });

    it('should format strings with proper escaping', () => {
      expect(formatAIScriptValue('simple string')).toBe('"simple string"');
      expect(formatAIScriptValue('string with "quotes"')).toBe('"string with \\"quotes\\""');
      expect(formatAIScriptValue('string with \\backslash')).toBe('"string with \\\\backslash"');
    });

    it('should format numbers and booleans', () => {
      expect(formatAIScriptValue(42)).toBe('42');
      expect(formatAIScriptValue(3.14)).toBe('3.14');
      expect(formatAIScriptValue(true)).toBe('true');
      expect(formatAIScriptValue(false)).toBe('false');
    });

    it('should format arrays recursively', () => {
      const array = ['hello', 42, true, null];
      const result = formatAIScriptValue(array);
      
      expect(result).toBe('["hello", 42, true, null]');
    });

    it('should format objects recursively', () => {
      const object = {
        name: 'test',
        count: 5,
        active: true,
        meta: null
      };
      
      const result = formatAIScriptValue(object);
      
      expect(result).toContain('"name": "test"');
      expect(result).toContain('"count": 5');
      expect(result).toContain('"active": true');
      expect(result).toContain('"meta": null');
    });

    it('should handle nested structures', () => {
      const complex = {
        items: ['item1', 'item2'],
        metadata: {
          version: '1.0',
          stable: true
        }
      };
      
      const result = formatAIScriptValue(complex);
      
      expect(result).toContain('"items": ["item1", "item2"]');
      expect(result).toContain('"version": "1.0"');
      expect(result).toContain('"stable": true');
    });

    it('should handle special characters safely', () => {
      const specialChars = {
        quotes: 'has "quotes" inside',
        backslashes: 'has \\ backslash',
        newlines: 'has\nnewlines',
        unicode: 'has 🚀 emoji'
      };
      
      const result = formatAIScriptValue(specialChars);
      
      expect(result).toContain('\\"quotes\\"');
      expect(result).toContain('\\\\');
      expect(result).not.toContain('\n'); // Should be escaped
    });
  });

  describe('AI_JXA_HELPERS', () => {
    it('should contain required helper functions', () => {
      expect(AI_JXA_HELPERS).toContain('function validateAIService(theApp)');
      expect(AI_JXA_HELPERS).toContain('function buildAIOptions(config)');
      expect(AI_JXA_HELPERS).toContain('function getRecordsForAI(theApp, config)');
      expect(AI_JXA_HELPERS).toContain('function handleAIResponse(response, operationType, context)');
    });

    it('should properly handle JXA object creation patterns', () => {
      // The helpers should use the safe bracket notation for object creation
      expect(AI_JXA_HELPERS).toContain('options["engine"]');
      expect(AI_JXA_HELPERS).toContain('options["model"]');
      expect(AI_JXA_HELPERS).toContain('result["success"]');
    });

    it('should include error handling patterns', () => {
      expect(AI_JXA_HELPERS).toContain('throw new Error');
      expect(AI_JXA_HELPERS).toContain('try {');
      expect(AI_JXA_HELPERS).toContain('} catch');
    });
  });

  describe('XSS Prevention in Scripts', () => {
    it('should escape XSS attempts in prompts', () => {
      for (const xssPayload of AI_TEST_PATTERNS.XSS_PAYLOADS) {
        const result = buildChatScript(xssPayload);
        
        // Should not contain unescaped script tags or dangerous content
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('javascript:');
        expect(result).not.toContain('onerror=');
      }
    });

    it('should escape XSS attempts in options', () => {
      const maliciousOptions: RecordAIScriptOptions = {
        databaseName: '<script>alert("xss")</script>',
        systemPrompt: 'javascript:alert("xss")'
      };
      
      const result = buildChatScript('safe prompt', maliciousOptions);
      
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('javascript:');
    });

    it('should handle malicious UUIDs safely', () => {
      const maliciousUuid = '"; DROP TABLE records; --';
      const result = buildSummarizeScript([maliciousUuid]);
      
      expect(result).toContain('\\"');
      expect(result).not.toContain('DROP TABLE');
    });
  });

  describe('Script Validation', () => {
    it('should generate syntactically valid JXA scripts', () => {
      const scripts = [
        buildChatScript('test prompt'),
        buildSummarizeScript([AI_TEST_PATTERNS.VALID_UUID]),
        buildClassifyScript(AI_TEST_PATTERNS.VALID_UUID),
        buildCompareScript(AI_TEST_PATTERNS.VALID_UUID)
      ];
      
      for (const script of scripts) {
        // Basic syntax validation - should have balanced braces and parentheses
        const openBraces = (script.match(/\{/g) || []).length;
        const closeBraces = (script.match(/\}/g) || []).length;
        expect(openBraces).toBe(closeBraces);
        
        const openParens = (script.match(/\(/g) || []).length;
        const closeParens = (script.match(/\)/g) || []).length;
        expect(openParens).toBe(closeParens);
        
        // Should have proper IIFE structure
        expect(script.trim()).toMatch(/^\(\(\) => \{[\s\S]*\}\)\(\);?$/);
      }
    });

    it('should handle edge cases without throwing', () => {
      expect(() => buildChatScript('')).not.toThrow();
      expect(() => buildSummarizeScript([])).not.toThrow();
      expect(() => buildClassifyScript('')).not.toThrow();
      expect(() => buildCompareScript('')).not.toThrow();
    });
  });
});