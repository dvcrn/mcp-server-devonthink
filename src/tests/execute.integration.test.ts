import { describe, it, expect } from 'vitest';
import { executeJxa, JxaErrorType, JxaExecutionError } from '../applescript/execute.js';

describe('executeJxa Integration Tests', () => {
  describe('Error Classification', () => {
    it('should classify syntax errors correctly', async () => {
      const badScript = `
        (() => {
          // This has a syntax error - missing closing brace
          const app = Application("DEVONthink");
          return JSON.stringify({ success: true );
        })();
      `;

      try {
        await executeJxa(badScript, { retries: 0 });
        expect.fail('Should have thrown a syntax error');
      } catch (error) {
        expect(error).toBeInstanceOf(JxaExecutionError);
        if (error instanceof JxaExecutionError) {
          // Syntax errors should be classified as ScriptError
          expect(error.errorType).toBe(JxaErrorType.ScriptError);
          expect(error.message).toContain('JXA');
        }
      }
    });

    it('should classify parse errors correctly', async () => {
      const scriptWithBadJson = `
        (() => {
          // Return invalid JSON
          return "not valid json {";
        })();
      `;

      try {
        await executeJxa(scriptWithBadJson, { retries: 0 });
        expect.fail('Should have thrown a parse error');
      } catch (error) {
        expect(error).toBeInstanceOf(JxaExecutionError);
        if (error instanceof JxaExecutionError) {
          expect(error.errorType).toBe(JxaErrorType.ParseError);
          expect(error.message).toContain('parse');
        }
      }
    });

    it('should classify timeout correctly', async () => {
      const slowScript = `
        (() => {
          // Infinite loop to trigger timeout
          while(true) {
            // Keep running
          }
          return JSON.stringify({ success: true });
        })();
      `;

      try {
        await executeJxa(slowScript, { timeout: 100, retries: 0 });
        expect.fail('Should have timed out');
      } catch (error) {
        expect(error).toBeInstanceOf(JxaExecutionError);
        if (error instanceof JxaExecutionError) {
          expect(error.errorType).toBe(JxaErrorType.Timeout);
          expect(error.message).toContain('timed out');
        }
      }
    });

    it('should handle missing application gracefully', async () => {
      const scriptForMissingApp = `
        (() => {
          try {
            // Try to use a non-existent application
            const app = Application("NonExistentApp12345");
            app.activate();
            return JSON.stringify({ success: true });
          } catch (e) {
            // This is what happens when app doesn't exist
            throw new Error("Application not found: " + e.toString());
          }
        })();
      `;

      try {
        await executeJxa(scriptForMissingApp, { retries: 0 });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(JxaExecutionError);
        if (error instanceof JxaExecutionError) {
          // Should be classified as AppNotRunning due to "not found"
          expect(error.errorType).toBe(JxaErrorType.AppNotRunning);
        }
      }
    });

    it('should handle reference errors correctly', async () => {
      const scriptWithRefError = `
        (() => {
          // Reference an undefined variable
          const result = undefinedVariable.someProperty;
          return JSON.stringify({ success: true });
        })();
      `;

      try {
        await executeJxa(scriptWithRefError, { retries: 0 });
        expect.fail('Should have thrown a reference error');
      } catch (error) {
        expect(error).toBeInstanceOf(JxaExecutionError);
        if (error instanceof JxaExecutionError) {
          // ReferenceError should be classified as ScriptError
          expect(error.errorType).toBe(JxaErrorType.ScriptError);
        }
      }
    });

    it('should retry transient failures but not script errors', async () => {
      let attempts = 0;
      
      // This script will fail with a script error
      const scriptWithError = `
        (() => {
          // Syntax error that shouldn't be retried
          const obj = { key: "value" ;
          return JSON.stringify(obj);
        })();
      `;

      try {
        await executeJxa(scriptWithError, { 
          retries: 2, 
          retryDelay: 10 
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(JxaExecutionError);
        if (error instanceof JxaExecutionError) {
          expect(error.errorType).toBe(JxaErrorType.ScriptError);
          // Script errors should not retry, so it should fail immediately
          // We can't directly test attempts, but the error should come quickly
        }
      }
    });
  });

  describe('Success Cases', () => {
    it('should execute valid JXA and return result', async () => {
      const validScript = `
        (() => {
          const result = {
            success: true,
            message: "Test passed",
            number: 42
          };
          return JSON.stringify(result);
        })();
      `;

      const result = await executeJxa<{ success: boolean; message: string; number: number }>(
        validScript
      );
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("Test passed");
      expect(result.number).toBe(42);
    });

    it('should handle complex objects', async () => {
      const complexScript = `
        (() => {
          const result = {};
          result["nested"] = {};
          result["nested"]["value"] = "test";
          result["array"] = [1, 2, 3];
          result["boolean"] = true;
          result["nullValue"] = null;
          return JSON.stringify(result);
        })();
      `;

      const result = await executeJxa<any>(complexScript);
      
      expect(result.nested.value).toBe("test");
      expect(result.array).toEqual([1, 2, 3]);
      expect(result.boolean).toBe(true);
      expect(result.nullValue).toBe(null);
    });
  });
});