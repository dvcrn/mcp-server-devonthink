import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { createDevonThinkTool, DevonThinkTool } from "./DevonThinkTool.js";
import * as executeModule from "../../applescript/execute.js";

// Mock the executeJxa function
vi.mock("../../applescript/execute.js");

describe("DevonThinkTool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDevonThinkTool", () => {
    it("should create a tool with correct properties", () => {
      const TestSchema = z.object({
        testParam: z.string(),
      }).strict();

      const tool = createDevonThinkTool({
        name: "test_tool",
        description: "A test tool",
        inputSchema: TestSchema,
        buildScript: (_input, helpers) => {
          return helpers.wrapInTryCatch("return JSON.stringify({success: true});");
        },
      });

      expect(tool.name).toBe("test_tool");
      expect(tool.description).toBe("A test tool");
      expect(tool.inputSchema).toBeDefined();
      expect(tool.run).toBeTypeOf("function");
    });

    it("should execute tool and return result", async () => {
      const TestSchema = z.object({
        value: z.string(),
      }).strict();

      vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({
        success: true,
        result: "test",
      });

      const tool = createDevonThinkTool({
        name: "test_tool",
        description: "A test tool",
        inputSchema: TestSchema,
        buildScript: (input, helpers) => {
          return helpers.wrapInTryCatch(`
            const value = ${helpers.formatValue(input.value)};
            const result = {};
            result["success"] = true;
            result["result"] = value;
            return JSON.stringify(result);
          `);
        },
      });

      const result = await tool.run({ value: "test" });

      expect(result).toEqual({
        success: true,
        result: "test",
      });
      expect(executeModule.executeJxa).toHaveBeenCalledTimes(1);
    });

    it("should validate input schema", async () => {
      const TestSchema = z.object({
        required: z.string(),
      }).strict();

      const tool = createDevonThinkTool({
        name: "test_tool",
        description: "A test tool",
        inputSchema: TestSchema,
        buildScript: (_input, helpers) => {
          return helpers.wrapInTryCatch("return JSON.stringify({success: true});");
        },
      });

      await expect(tool.run({ invalid: "field" })).rejects.toThrow();
    });
  });

  describe("ScriptHelpers", () => {
    describe("formatValue", () => {
      it("should format different value types correctly", async () => {
        const TestSchema = z.object({}).strict();

        let capturedHelpers: any;
        const tool = createDevonThinkTool({
          name: "test_tool",
          description: "Test",
          inputSchema: TestSchema,
          buildScript: (_input, helpers) => {
            capturedHelpers = helpers;
            return 'return JSON.stringify({success: true});';
          },
        });

        vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ success: true });
        await tool.run({});

        // Test null and undefined
        expect(capturedHelpers.formatValue(null)).toBe("null");
        expect(capturedHelpers.formatValue(undefined)).toBe("null");

        // Test strings
        expect(capturedHelpers.formatValue("test")).toBe('"test"');
        expect(capturedHelpers.formatValue('test"quote')).toBe('"test\\"quote"');

        // Test numbers and booleans
        expect(capturedHelpers.formatValue(42)).toBe("42");
        expect(capturedHelpers.formatValue(true)).toBe("true");
        expect(capturedHelpers.formatValue(false)).toBe("false");

        // Test arrays
        expect(capturedHelpers.formatValue([1, "two", true])).toBe('[1, "two", true]');

        // Test objects - should use bracket notation to avoid JXA issues
        const testObject = { name: "test", count: 42, active: true };
        const formattedObject = capturedHelpers.formatValue(testObject);
        expect(formattedObject).toContain('const obj = {};');
        expect(formattedObject).toContain('obj["name"] = "test";');
        expect(formattedObject).toContain('obj["count"] = 42;');
        expect(formattedObject).toContain('obj["active"] = true;');
        expect(formattedObject).toContain('return obj;');
        expect(formattedObject).toMatch(/^\(function\(\) \{.*\}\)\(\)$/);

        // Test nested object with special characters
        const nestedObject = { 
          "key with spaces": "value with 'quotes'", 
          nested: { inner: true } 
        };
        const formattedNested = capturedHelpers.formatValue(nestedObject);
        expect(formattedNested).toContain('obj["key with spaces"] = "value with \\\'quotes\\\'";');
        expect(formattedNested).toContain('obj["nested"] = (function() {');
      });

      it("should handle edge cases in object formatting", async () => {
        const TestSchema = z.object({}).strict();

        let capturedHelpers: any;
        const tool = createDevonThinkTool({
          name: "test_tool",
          description: "Test",
          inputSchema: TestSchema,
          buildScript: (_input, helpers) => {
            capturedHelpers = helpers;
            return 'return JSON.stringify({success: true});';
          },
        });

        vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ success: true });
        await tool.run({});

        // Empty object
        const emptyObj = capturedHelpers.formatValue({});
        expect(emptyObj).toContain('const obj = {};');
        expect(emptyObj).toContain('return obj;');

        // Object with null/undefined values
        const objWithNulls = capturedHelpers.formatValue({ a: null, b: undefined });
        expect(objWithNulls).toContain('obj["a"] = null;');
        expect(objWithNulls).toContain('obj["b"] = null;');

        // Object with array values
        const objWithArray = capturedHelpers.formatValue({ items: [1, 2, "three"] });
        expect(objWithArray).toContain('obj["items"] = [1, 2, "three"];');

        // Object with problematic key names
        const problematicKeys = capturedHelpers.formatValue({ 
          "key-with-dashes": "value1",
          "key with spaces": "value2",
          "key\"with\"quotes": "value3"
        });
        expect(problematicKeys).toContain('obj["key-with-dashes"] = "value1";');
        expect(problematicKeys).toContain('obj["key with spaces"] = "value2";');
        expect(problematicKeys).toContain('obj["key\\"with\\"quotes"] = "value3";');
      });
    });

    describe("wrapInTryCatch", () => {
      it("should wrap code in try-catch block", async () => {
        const TestSchema = z.object({}).strict();

        let capturedHelpers: any;
        const tool = createDevonThinkTool({
          name: "test_tool",
          description: "Test",
          inputSchema: TestSchema,
          buildScript: (_input, helpers) => {
            capturedHelpers = helpers;
            return 'return JSON.stringify({success: true});';
          },
        });

        vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ success: true });
        await tool.run({});

        const wrapped = capturedHelpers.wrapInTryCatch("const x = 1;");
        expect(wrapped).toContain("try {");
        expect(wrapped).toContain("const x = 1;");
        expect(wrapped).toContain("} catch (error) {");
        expect(wrapped).toContain('errorResponse["success"] = false');
      });

      it("should use custom error handler if provided", async () => {
        const TestSchema = z.object({}).strict();

        let capturedHelpers: any;
        const tool = createDevonThinkTool({
          name: "test_tool",
          description: "Test",
          inputSchema: TestSchema,
          buildScript: (_input, helpers) => {
            capturedHelpers = helpers;
            return 'return JSON.stringify({success: true});';
          },
        });

        vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ success: true });
        await tool.run({});

        const wrapped = capturedHelpers.wrapInTryCatch(
          "const x = 1;",
          "return 'custom error';"
        );
        expect(wrapped).toContain("return 'custom error';");
        expect(wrapped).not.toContain('errorResponse["success"] = false');
      });
    });

    describe("buildDatabaseLookup", () => {
      it("should return current database lookup when no name provided", async () => {
        const TestSchema = z.object({}).strict();

        let capturedHelpers: any;
        const tool = createDevonThinkTool({
          name: "test_tool",
          description: "Test",
          inputSchema: TestSchema,
          buildScript: (_input, helpers) => {
            capturedHelpers = helpers;
            return 'return JSON.stringify({success: true});';
          },
        });

        vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ success: true });
        await tool.run({});

        const lookup = capturedHelpers.buildDatabaseLookup();
        expect(lookup).toBe("const targetDatabase = theApp.currentDatabase();");
      });

      it("should build database lookup with name", async () => {
        const TestSchema = z.object({}).strict();

        let capturedHelpers: any;
        const tool = createDevonThinkTool({
          name: "test_tool",
          description: "Test",
          inputSchema: TestSchema,
          buildScript: (_input, helpers) => {
            capturedHelpers = helpers;
            return 'return JSON.stringify({success: true});';
          },
        });

        vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ success: true });
        await tool.run({});

        const lookup = capturedHelpers.buildDatabaseLookup("Test DB");
        expect(lookup).toContain("const databases = theApp.databases();");
        expect(lookup).toContain('db.name() === "Test DB"');
        expect(lookup).toContain("Database not found: Test DB");
      });
    });

    describe("buildRecordLookup", () => {
      it("should build UUID lookup", async () => {
        const TestSchema = z.object({}).strict();

        let capturedHelpers: any;
        const tool = createDevonThinkTool({
          name: "test_tool",
          description: "Test",
          inputSchema: TestSchema,
          buildScript: (_input, helpers) => {
            capturedHelpers = helpers;
            return 'return JSON.stringify({success: true});';
          },
        });

        vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ success: true });
        await tool.run({});

        const lookup = capturedHelpers.buildRecordLookup("uuid-123");
        expect(lookup).toContain('theApp.getRecordWithUuid("uuid-123")');
        expect(lookup).toContain("Record not found with UUID: uuid-123");
      });

      it("should build ID lookup with database", async () => {
        const TestSchema = z.object({}).strict();

        let capturedHelpers: any;
        const tool = createDevonThinkTool({
          name: "test_tool",
          description: "Test",
          inputSchema: TestSchema,
          buildScript: (_input, helpers) => {
            capturedHelpers = helpers;
            return 'return JSON.stringify({success: true});';
          },
        });

        vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ success: true });
        await tool.run({});

        const lookup = capturedHelpers.buildRecordLookup(undefined, 123, undefined, "Test DB");
        expect(lookup).toContain("const databases = theApp.databases();");
        expect(lookup).toContain("targetDatabase.getRecordWithId(123)");
        expect(lookup).toContain("Record not found with ID: 123");
      });

      it("should build path lookup", async () => {
        const TestSchema = z.object({}).strict();

        let capturedHelpers: any;
        const tool = createDevonThinkTool({
          name: "test_tool",
          description: "Test",
          inputSchema: TestSchema,
          buildScript: (_input, helpers) => {
            capturedHelpers = helpers;
            return 'return JSON.stringify({success: true});';
          },
        });

        vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ success: true });
        await tool.run({});

        const lookup = capturedHelpers.buildRecordLookup(undefined, undefined, "/test/path");
        expect(lookup).toContain('targetDatabase.getRecordAt("/test/path")');
        expect(lookup).toContain("Record not found at path: /test/path");
      });

      it("should throw error when no identifier provided", async () => {
        const TestSchema = z.object({}).strict();

        let capturedHelpers: any;
        const tool = createDevonThinkTool({
          name: "test_tool",
          description: "Test",
          inputSchema: TestSchema,
          buildScript: (_input, helpers) => {
            capturedHelpers = helpers;
            return 'return JSON.stringify({success: true});';
          },
        });

        vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ success: true });
        await tool.run({});

        const lookup = capturedHelpers.buildRecordLookup();
        expect(lookup).toContain("No record identifier provided");
      });
    });
  });

  describe("String escaping", () => {
    it("should escape strings properly in formatValue", async () => {
      const TestSchema = z.object({}).strict();

      let capturedHelpers: any;
      const tool = createDevonThinkTool({
        name: "test_tool",
        description: "Test",
        inputSchema: TestSchema,
        buildScript: (_input, helpers) => {
          capturedHelpers = helpers;
          return 'return JSON.stringify({success: true});';
        },
      });

      vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ success: true });
      await tool.run({});

      // Test escaping quotes
      expect(capturedHelpers.formatValue('test"with"quotes')).toBe('"test\\"with\\"quotes"');
      expect(capturedHelpers.formatValue("test'with'quotes")).toBe('"test\\\'with\\\'quotes"');
      
      // Test escaping newlines and tabs
      expect(capturedHelpers.formatValue("test\nwith\nnewlines")).toBe('"test\\nwith\\nnewlines"');
      expect(capturedHelpers.formatValue("test\twith\ttabs")).toBe('"test\\twith\\ttabs"');
    });

    it("should use escapeString helper directly", async () => {
      const TestSchema = z.object({}).strict();

      let capturedHelpers: any;
      const tool = createDevonThinkTool({
        name: "test_tool",
        description: "Test",
        inputSchema: TestSchema,
        buildScript: (_input, helpers) => {
          capturedHelpers = helpers;
          return 'return JSON.stringify({success: true});';
        },
      });

      vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ success: true });
      await tool.run({});

      // Test the escapeString helper
      expect(capturedHelpers.escapeString('test"string')).toBe('test\\"string');
      expect(capturedHelpers.escapeString("test\nstring")).toBe("test\\nstring");
      expect(capturedHelpers.escapeString("test\\string")).toBe("test\\\\string");
    });

    it("should prevent executeJxa fragility with single quotes", async () => {
      const TestSchema = z.object({
        problematicString: z.string(),
      }).strict();

      const tool = createDevonThinkTool({
        name: "fragility_test",
        description: "Test single quote handling",
        inputSchema: TestSchema,
        buildScript: (input, helpers) => {
          // This would be problematic if not using helpers:
          // const badScript = `const str = "${input.problematicString}";` // DON'T DO THIS
          
          // This is safe because formatValue properly escapes:
          return helpers.wrapInTryCatch(`
            const str = ${helpers.formatValue(input.problematicString)};
            const result = {};
            result["success"] = true;
            result["processedString"] = str;
            return JSON.stringify(result);
          `);
        },
      });

      vi.mocked(executeModule.executeJxa).mockResolvedValueOnce({ 
        success: true, 
        processedString: "it's working properly" 
      });

      const result = await tool.run({ 
        problematicString: "it's working properly" 
      });

      expect(result.success).toBe(true);
      expect(result.processedString).toBe("it's working properly");
      expect(executeModule.executeJxa).toHaveBeenCalledTimes(1);
      
      // Verify the generated script doesn't have unescaped single quotes
      const calledScript = vi.mocked(executeModule.executeJxa).mock.calls[0][0];
      expect(calledScript).toContain(`"it\\'s working properly"`);
      expect(calledScript).not.toMatch(/[^\\]'[^']/); // No unescaped single quotes
    });
  });
});