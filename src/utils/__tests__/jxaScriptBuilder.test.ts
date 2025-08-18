/**
 * Test suite for JXA Script Builder
 * 
 * These tests demonstrate how the new architecture prevents common JXA generation errors
 * and ensures robust, maintainable script creation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JXAScriptBuilder, JXAHelpers } from '../jxaScriptBuilder.js';
import { JXAValidator } from '../jxaValidator.js';

describe('JXAScriptBuilder', () => {
  let builder: JXAScriptBuilder;

  beforeEach(() => {
    builder = JXAScriptBuilder.createWithDefaults();
  });

  describe('Variable Handling', () => {
    it('should handle string variables with proper escaping', () => {
      const problematicString = 'Text with "quotes" and\nnewlines\tand backslashes\\';
      builder.addVariable('testVar', problematicString);
      
      const script = builder.build();
      console.log('Generated script:', script);
      
      // The issue is with the regex - Application("DEVONthink") has quotes
      // We should check for unescaped quotes in variable values, not in the entire script
      expect(script).toContain('const testVar = "Text with \\"quotes\\" and\\nnewlines\\tand backslashes\\\\";');
      
      // The variable value should be properly escaped
      const variableMatch = script.match(/const testVar = "([^"\\]*(\\.[^"\\]*)*)"/);
      expect(variableMatch).toBeTruthy();
    });

    it('should handle null and undefined values correctly', () => {
      builder.addVariable('nullVar', null);
      builder.addVariable('undefinedVar', undefined);
      
      const script = builder.build();
      console.log('Script output:', script);
      
      expect(script).toContain('const nullVar = null;');
      expect(script).toContain('const undefinedVar = null;');
      // The script should not contain the literal string "undefined" anywhere
      expect(script).not.toMatch(/\bundefined\b/);
    });

    it('should validate variable names', () => {
      expect(() => builder.addVariable('123invalid', 'value')).toThrow('Invalid JXA variable name');
      expect(() => builder.addVariable('valid_name123', 'value')).not.toThrow();
      expect(() => builder.addVariable('$validName', 'value')).not.toThrow();
    });

    it('should handle different data types correctly', () => {
      builder.addVariable('stringVar', 'hello');
      builder.addVariable('numberVar', 42);
      builder.addVariable('booleanVar', true);
      builder.addVariable('rawJsVar', 'someJavaScriptCode()', 'raw');
      
      const script = builder.build();
      
      expect(script).toContain('const stringVar = "hello";');
      expect(script).toContain('const numberVar = 42;');
      expect(script).toContain('const booleanVar = true;');
      expect(script).toContain('const rawJsVar = someJavaScriptCode();');
    });
  });

  describe('Object Creation', () => {
    it('should create objects using bracket notation (JXA compatible)', () => {
      builder.createObject('testObj', [
        { key: 'name', value: 'test' },
        { key: 'count', value: 5 },
        { key: 'active', value: true },
        { key: 'nullable', value: null }
      ]);
      
      const script = builder.build();
      
      expect(script).toContain('const testObj = {};');
      expect(script).toContain('testObj["name"] = "test";');
      expect(script).toContain('testObj["count"] = 5;');
      expect(script).toContain('testObj["active"] = true;');
      expect(script).toContain('testObj["nullable"] = null;');
      
      // Should not use ES6 object literal syntax
      expect(script).not.toMatch(/\{\s*\w+\s*:/);
    });

    it('should validate property values for safety', () => {
      expect(() => {
        builder.createObject('testObj', [
          { key: 'bad', value: 'string with \x00 null byte' }
        ]);
      }).toThrow('Unsafe property value');
    });
  });

  describe('Regex Pattern Handling', () => {
    it('should properly escape regex patterns for JXA', () => {
      // This is the exact pattern that was causing issues in the original code
      builder.addRegexPattern('themePattern', '^\\d+\\.|^[A-Z][^.]*:$|^\\*\\*.*\\*\\*$');
      
      const script = builder.build();
      
      // Pattern should be double-escaped for JXA
      expect(script).toContain('const themePattern = new RegExp("^\\\\d+\\\\.|^[A-Z][^.]*:$|^\\\\*\\\\*.*\\\\*\\\\*$");');
      
      // Should not contain the problematic escaping that was causing "Unexpected EOF"
      expect(script).not.toContain('\\\\\\\\d');
    });

    it('should handle regex flags correctly', () => {
      builder.addRegexPattern('quotedText', '"([^"]+)"', 'g');
      
      const script = builder.build();
      
      expect(script).toContain('const quotedText = new RegExp("\\"([^\\"]+)\\"", "g");');
    });
  });

  describe('Conditional and Control Flow', () => {
    it('should generate proper conditional blocks', () => {
      builder.addConditional(
        'recordUuid !== null', 
        'console.log("Found UUID");',
        'console.log("No UUID");'
      );
      
      const script = builder.build();
      
      expect(script).toContain('if (recordUuid !== null) {');
      expect(script).toContain('} else {');
      expect(script).toContain('}');
    });

    it('should generate try-catch blocks with proper error handling', () => {
      builder.addTryCatch('risky.operation();');
      
      const script = builder.build();
      
      expect(script).toContain('try {');
      expect(script).toContain('risky.operation();');
      expect(script).toContain('} catch (error) {');
      expect(script).toContain('errorResult["success"] = false;');
      expect(script).toContain('return JSON.stringify(errorResult);');
    });
  });

  describe('Script Structure', () => {
    it('should generate proper JXA wrapper structure', () => {
      builder.addVariable('test', 'value');
      builder.addCodeBlock('// Main code');
      
      const script = builder.build();
      
      expect(script).toMatch(/^\(function\(\) \{/);
      expect(script).toMatch(/\}\)\(\);$/);
      expect(script).toContain('const theApp = Application("DEVONthink");');
      expect(script).toContain('theApp.includeStandardAdditions = true;');
    });

    it('should order sections correctly', () => {
      builder.addVariable('var1', 'value1');
      builder.addRegexPattern('pattern1', 'test');
      builder.addCodeBlock('// Main code');
      
      const script = builder.build();
      const lines = script.split('\n');
      
      // Find indices of different sections
      const varIndex = lines.findIndex(line => line.includes('const var1'));
      const patternIndex = lines.findIndex(line => line.includes('const pattern1'));
      const mainIndex = lines.findIndex(line => line.includes('// Main code'));
      
      expect(varIndex).toBeLessThan(patternIndex);
      expect(patternIndex).toBeLessThan(mainIndex);
    });
  });

  describe('Validation Integration', () => {
    it('should generate scripts that pass validation', () => {
      builder.addVariable('testVar', 'safe value');
      builder.createObject('result', [
        { key: 'success', value: true },
        { key: 'data', value: 'some data' }
      ]);
      builder.addCodeBlock('return JSON.stringify(result);');
      
      const script = builder.build();
      const validation = builder.validate();
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect dangerous patterns', () => {
      builder.addCodeBlock('eval("dangerous code");');
      
      const validation = builder.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.message.includes('dangerous pattern'))).toBe(true);
    });

    it('should detect object literal syntax issues', () => {
      builder.addCodeBlock('return { name: "test", value: 123 };');
      
      const validation = builder.validate();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.message.includes('object literal syntax'))).toBe(true);
    });
  });
});

describe('JXAHelpers', () => {
  describe('String Operations', () => {
    it('should generate safe string splitting code', () => {
      const code = JXAHelpers.splitString('response', '\\n', 'lines');
      
      expect(code).toBe('const lines = response.split("\\\\n").filter(line => line.trim().length > 0);');
      
      // Validate the generated code
      const quickValidation = JXAValidator.quickValidate(code);
      expect(quickValidation.valid).toBe(true);
    });

    it('should generate safe regex matching code', () => {
      const code = JXAHelpers.regexMatch('line', 'themePattern', 'matches');
      
      expect(code).toBe('const matches = line.match(themePattern);');
    });
  });

  describe('Result Building', () => {
    it('should generate safe object building code', () => {
      const code = JXAHelpers.buildResultObject({
        'success': 'true',
        'data': 'processedData',
        'count': 'items.length'
      });
      
      expect(code).toContain('const result = {};');
      expect(code).toContain('result["success"] = true;');
      expect(code).toContain('result["data"] = processedData;');
      expect(code).toContain('result["count"] = items.length;');
      expect(code).toContain('return JSON.stringify(result);');
    });

    it('should generate proper error handling wrapper', () => {
      const mainCode = 'const result = doSomething();\nreturn result;';
      const wrapped = JXAHelpers.wrapWithErrorHandling(mainCode);
      
      expect(wrapped).toContain('try {');
      expect(wrapped).toContain('if (!theApp.running())');
      expect(wrapped).toContain('} catch (error) {');
      expect(wrapped).toContain('errorResult["success"] = false;');
    });
  });
});

describe('Error Prevention Examples', () => {
  it('should prevent the exact escaping error from the original code', () => {
    // This reproduces the exact scenario that was failing in analyzeDocumentThemes
    const builder = JXAScriptBuilder.createWithDefaults();
    
    // Add the problematic regex pattern that was causing issues
    builder.addRegexPattern('themeHeaders', '^\\d+\\.|^[A-Z][^.]*:$|^\\*\\*.*\\*\\*$');
    
    // Add string splitting that was problematic
    builder.addVariable('aiResponse', 'Some response\nwith newlines');
    builder.addCodeBlock(JXAHelpers.splitString('aiResponse', '\\n', 'responseLines'));
    
    // Add regex matching that was failing
    builder.addCodeBlock(`
      for (let i = 0; i < responseLines.length; i++) {
        const line = responseLines[i].trim();
        if (themeHeaders.test(line)) {
          // Process theme header
        }
      }
    `);
    
    const script = builder.build();
    const validation = JXAValidator.validate(script);
    
    // The new architecture should prevent all the issues
    expect(validation.valid).toBe(true);
    expect(script).toContain('\\\\d'); // Properly escaped
    expect(script).not.toContain('${'); // No unresolved template literals
  });

  it('should prevent console.log errors that cause MCP failures', () => {
    const builder = JXAScriptBuilder.createWithDefaults();
    builder.addCodeBlock('console.log("This would break MCP");');
    
    const validation = JXAValidator.validate(builder.build());
    
    expect(validation.valid).toBe(false);
    expect(validation.errors.some(e => 
      e.message.includes('console.log') && e.message.includes('MCP')
    )).toBe(true);
  });

  it('should prevent object literal return issues', () => {
    const builder = JXAScriptBuilder.createWithDefaults();
    builder.addCodeBlock('return { success: true, data: "test" };');
    
    const validation = JXAValidator.validate(builder.build());
    
    expect(validation.valid).toBe(false);
    expect(validation.errors.some(e => 
      e.message.includes('object literal') || e.message.includes('bracket notation')
    )).toBe(true);
  });

  it('should provide the correct way to handle the problematic patterns', () => {
    const builder = JXAScriptBuilder.createWithDefaults();
    
    // The CORRECT way to handle the patterns that were failing
    builder.addVariable('aiResponse', 'Theme 1: First theme\n2. Second theme\n**Third theme**');
    
    // Safe regex patterns
    builder.addRegexPattern('themeHeaders', '^\\d+\\.|^[A-Z][^.]*:$|^\\*\\*.*\\*\\*$');
    builder.addRegexPattern('quotedText', '"([^"]+)"', 'g');
    
    // Safe object creation and result building
    builder.createObject('result', [
      { key: 'success', value: true },
      { key: 'themes', value: '[]' } // Empty array as raw JS
    ]);
    
    // Safe main logic
    builder.addCodeBlock(`
      const lines = aiResponse.split("\\\\n").filter(line => line.trim().length > 0);
      const themes = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (themeHeaders.test(line)) {
          const themeObj = {};
          themeObj["name"] = line;
          themeObj["index"] = themes.length;
          themes.push(themeObj);
        }
      }
      
      result["themes"] = themes;
      return JSON.stringify(result);
    `);
    
    const script = builder.build();
    const validation = JXAValidator.validate(script);
    
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    
    // Ensure the script contains the safe patterns
    expect(script).toContain('split("\\\\n")'); // Correct escaping
    expect(script).toContain('new RegExp("^\\\\d+\\\\.|'); // Correct regex escaping  
    expect(script).toContain('themeObj["name"]'); // Bracket notation
    expect(script).toContain('return JSON.stringify(result);'); // Safe return
  });
});