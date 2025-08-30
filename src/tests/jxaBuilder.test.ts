import { describe, it, expect } from 'vitest';
import { JXAScriptBuilder } from '../utils/jxaScriptBuilder.js';
import { JXAValidator } from '../utils/jxaValidator.js';

describe('JXAScriptBuilder', () => {
  describe('Variable Handling', () => {
    it('should escape string variables correctly', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      builder.addVariable('testString', 'Hello "World" with \'quotes\'');
      
      const script = builder.build();
      expect(script).toContain('const testString = "Hello \\"World\\" with \\\'quotes\\\'";');
    });

    it('should handle null and undefined values', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      builder
        .addVariable('nullVar', null)
        .addVariable('undefinedVar', undefined);
      
      const script = builder.build();
      expect(script).toContain('const nullVar = null;');
      expect(script).toContain('const undefinedVar = null;');
    });

    it('should handle different types correctly', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      builder
        .addVariable('stringVar', 'test')
        .addVariable('numberVar', 42)
        .addVariable('booleanVar', true);
      
      const script = builder.build();
      expect(script).toContain('const stringVar = "test";');
      expect(script).toContain('const numberVar = 42;');
      expect(script).toContain('const booleanVar = true;');
    });

    it('should reject invalid variable names', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      expect(() => {
        builder.addVariable('123invalid', 'value');
      }).toThrow('Invalid JXA variable name');
    });

    it('should reject unsafe strings', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      const unsafeString = 'test\x00null';
      expect(() => {
        builder.addVariable('test', unsafeString);
      }).toThrow('Unsafe string value');
    });
  });

  describe('Object Creation', () => {
    it('should create objects using bracket notation', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      builder.createObject('testObj', [
        { key: 'name', value: 'Test' },
        { key: 'count', value: 5 },
        { key: 'active', value: true }
      ]);
      
      const script = builder.build();
      expect(script).toContain('const testObj = {};');
      expect(script).toContain('testObj["name"] = "Test";');
      expect(script).toContain('testObj["count"] = 5;');
      expect(script).toContain('testObj["active"] = true;');
    });

    it('should handle null values in objects', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      builder.createObject('testObj', [
        { key: 'nullProp', value: null }
      ]);
      
      const script = builder.build();
      expect(script).toContain('testObj["nullProp"] = null;');
    });
  });

  describe('Error Handling', () => {
    it('should add try-catch blocks', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      builder.addTryCatch('const result = doSomething();');
      
      const script = builder.build();
      expect(script).toContain('try {');
      expect(script).toContain('catch (error)');
      expect(script).toContain('error.toString()');
    });

    it('should use custom error handlers', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      builder.addTryCatch(
        'const result = doSomething();',
        'return "Custom error: " + error;'
      );
      
      const script = builder.build();
      expect(script).toContain('return "Custom error: " + error;');
    });
  });

  describe('Script Validation', () => {
    it('should detect object literal syntax issues', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      builder.addCodeBlock('const obj = { key: "value" };');
      
      const validation = builder.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContainEqual(
        expect.objectContaining({
          type: 'compatibility',
          message: expect.stringContaining('bracket notation')
        })
      );
    });

    it('should validate safe scripts', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      builder.addCodeBlock(`
        const obj = {};
        obj["key"] = "value";
        return JSON.stringify(obj);
      `);
      
      const validation = builder.validate();
      // May have warnings but no errors
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect template literals', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      
      // addCodeBlock throws an error for template literals, it doesn't just validate
      expect(() => {
        builder.addCodeBlock('const msg = `Hello ${name}`;');
      }).toThrow('template literals');
    });
  });

  describe('Regex Patterns', () => {
    it('should add regex patterns correctly', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      builder.addRegexPattern('emailPattern', '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', 'g');
      
      const script = builder.build();
      expect(script).toContain('const emailPattern = new RegExp');
    });
  });

  describe('Conditional Blocks', () => {
    it('should add if-else blocks', () => {
      const builder = JXAScriptBuilder.createWithDefaults();
      builder.addConditional(
        'value > 10',
        'result = "large";',
        'result = "small";'
      );
      
      const script = builder.build();
      expect(script).toContain('if (value > 10)');
      expect(script).toContain('result = "large";');
      expect(script).toContain('result = "small";');
    });
  });
});

describe('JXAValidator', () => {
  it('should validate simple valid scripts', () => {
    const script = `
      const result = {};
      result["success"] = true;
      return JSON.stringify(result);
    `;
    
    const validation = JXAValidator.validate(script);
    expect(validation.valid).toBe(true);
  });

  it('should detect dangerous eval usage', () => {
    const script = 'eval("dangerous code");';
    
    const validation = JXAValidator.validate(script);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining('eval')
      })
    );
  });

  it('should provide quick validation', () => {
    const script = 'const test = "value";';
    
    const quickValidation = JXAValidator.quickValidate(script);
    expect(quickValidation.valid).toBe(true);
  });
});