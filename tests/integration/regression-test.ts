#!/usr/bin/env tsx
/**
 * Comprehensive regression test for DEVONthink MCP server
 * Tests all tools against the current DEVONthink installation
 */

import { executeJxa } from "../../src/applescript/execute.js";

interface TestResult {
  tool: string;
  status: "pass" | "fail" | "skip";
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

async function testIsRunning(): Promise<TestResult> {
  try {
    const script = `
      (() => {
        const theApp = Application("DEVONthink");
        return JSON.stringify({ success: true, running: theApp.running() });
      })();
    `;
    const result = await executeJxa<{ success: boolean; running: boolean }>(script);
    if (result.success && result.running) {
      return { tool: "is_running", status: "pass", details: "DEVONthink is running" };
    }
    return { tool: "is_running", status: "fail", error: "DEVONthink not running" };
  } catch (error) {
    return { tool: "is_running", status: "fail", error: String(error) };
  }
}

async function testGetOpenDatabases(): Promise<TestResult> {
  try {
    const script = `
      (() => {
        const theApp = Application("DEVONthink");
        theApp.includeStandardAdditions = true;

        try {
          const databases = theApp.databases();
          const dbList = [];

          for (let i = 0; i < databases.length; i++) {
            const db = databases[i];
            const dbInfo = {};
            dbInfo["name"] = db.name();
            dbInfo["uuid"] = db.uuid();
            dbInfo["path"] = db.path();
            dbList.push(dbInfo);
          }

          const response = {};
          response["success"] = true;
          response["databases"] = dbList;
          return JSON.stringify(response);
        } catch (error) {
          const response = {};
          response["success"] = false;
          response["error"] = error.toString();
          return JSON.stringify(response);
        }
      })();
    `;
    const result = await executeJxa<{ success: boolean; databases?: any[]; error?: string }>(script);
    if (result.success && result.databases && result.databases.length > 0) {
      return { tool: "get_open_databases", status: "pass", details: `Found ${result.databases.length} databases` };
    }
    return { tool: "get_open_databases", status: "fail", error: result.error || "No databases found" };
  } catch (error) {
    return { tool: "get_open_databases", status: "fail", error: String(error) };
  }
}

async function testGetCurrentDatabase(): Promise<TestResult> {
  try {
    const script = `
      (() => {
        const theApp = Application("DEVONthink");
        theApp.includeStandardAdditions = true;

        try {
          const db = theApp.currentDatabase();
          if (!db || !db.exists()) {
            const response = {};
            response["success"] = false;
            response["error"] = "No current database";
            return JSON.stringify(response);
          }

          const dbInfo = {};
          dbInfo["name"] = db.name();
          dbInfo["uuid"] = db.uuid();
          dbInfo["path"] = db.path();

          const response = {};
          response["success"] = true;
          response["database"] = dbInfo;
          return JSON.stringify(response);
        } catch (error) {
          const response = {};
          response["success"] = false;
          response["error"] = error.toString();
          return JSON.stringify(response);
        }
      })();
    `;
    const result = await executeJxa<{ success: boolean; database?: any; error?: string }>(script);
    if (result.success && result.database) {
      return { tool: "get_current_database", status: "pass", details: `Current DB: ${result.database.name}` };
    }
    return { tool: "get_current_database", status: "fail", error: result.error || "No current database" };
  } catch (error) {
    return { tool: "get_current_database", status: "fail", error: String(error) };
  }
}

async function testCreateAndDeleteRecord(): Promise<TestResult> {
  try {
    // Get current database first
    const getDbScript = `
      (() => {
        const theApp = Application("DEVONthink");
        const db = theApp.currentDatabase();
        if (!db || !db.exists()) {
          return JSON.stringify({ success: false, error: "No current database" });
        }
        const response = {};
        response["success"] = true;
        response["uuid"] = db.uuid();
        return JSON.stringify(response);
      })();
    `;

    const dbResult = await executeJxa<{ success: boolean; uuid?: string; error?: string }>(getDbScript);
    if (!dbResult.success || !dbResult.uuid) {
      return { tool: "create_record", status: "skip", error: "No current database" };
    }

    // Create a test record
    const createScript = `
      (() => {
        const theApp = Application("DEVONthink");
        theApp.includeStandardAdditions = true;

        try {
          const db = theApp.getDatabaseWithUuid("${dbResult.uuid}");
          if (!db || !db.exists()) {
            const response = {};
            response["success"] = false;
            response["error"] = "Database not found";
            return JSON.stringify(response);
          }

          const record = theApp.createRecordWith({
            name: "MCP Regression Test",
            type: "markdown",
            content: "# Test Record\\nThis is a test record for regression testing."
          }, { in: db });

          const response = {};
          response["success"] = true;
          response["uuid"] = record.uuid();
          response["id"] = record.id();
          return JSON.stringify(response);
        } catch (error) {
          const response = {};
          response["success"] = false;
          response["error"] = error.toString();
          return JSON.stringify(response);
        }
      })();
    `;

    const createResult = await executeJxa<{ success: boolean; uuid?: string; id?: number; error?: string }>(createScript);
    if (!createResult.success || !createResult.uuid) {
      return { tool: "create_record", status: "fail", error: createResult.error || "Failed to create record" };
    }

    // Try to get the record properties
    const getPropsScript = `
      (() => {
        const theApp = Application("DEVONthink");
        theApp.includeStandardAdditions = true;

        try {
          const record = theApp.getRecordWithUuid("${createResult.uuid}");
          if (!record || !record.exists()) {
            const response = {};
            response["success"] = false;
            response["error"] = "Record not found";
            return JSON.stringify(response);
          }

          const props = {};
          props["name"] = record.name();
          props["type"] = record.type();
          props["uuid"] = record.uuid();

          const response = {};
          response["success"] = true;
          response["record"] = props;
          return JSON.stringify(response);
        } catch (error) {
          const response = {};
          response["success"] = false;
          response["error"] = error.toString();
          return JSON.stringify(response);
        }
      })();
    `;

    const propsResult = await executeJxa<{ success: boolean; record?: any; error?: string }>(getPropsScript);
    if (!propsResult.success) {
      return { tool: "get_record_properties", status: "fail", error: propsResult.error };
    }

    // Delete the test record
    const deleteScript = `
      (() => {
        const theApp = Application("DEVONthink");
        theApp.includeStandardAdditions = true;

        try {
          const record = theApp.getRecordWithUuid("${createResult.uuid}");
          if (!record || !record.exists()) {
            const response = {};
            response["success"] = false;
            response["error"] = "Record not found for deletion";
            return JSON.stringify(response);
          }

          theApp.delete({record: record});

          const response = {};
          response["success"] = true;
          return JSON.stringify(response);
        } catch (error) {
          const response = {};
          response["success"] = false;
          response["error"] = error.toString();
          return JSON.stringify(response);
        }
      })();
    `;

    const deleteResult = await executeJxa<{ success: boolean; error?: string }>(deleteScript);
    if (!deleteResult.success) {
      return { tool: "delete_record", status: "fail", error: deleteResult.error };
    }

    return { tool: "create_delete_cycle", status: "pass", details: "Created, read, and deleted test record" };
  } catch (error) {
    return { tool: "create_delete_cycle", status: "fail", error: String(error) };
  }
}

async function testSearch(): Promise<TestResult> {
  try {
    const script = `
      (() => {
        const theApp = Application("DEVONthink");
        theApp.includeStandardAdditions = true;

        try {
          const results = theApp.search("kind:markdown");

          const resultList = [];
          for (let i = 0; i < Math.min(results.length, 5); i++) {
            const record = results[i];
            const recordInfo = {};
            recordInfo["name"] = record.name();
            recordInfo["uuid"] = record.uuid();
            recordInfo["type"] = record.type();
            resultList.push(recordInfo);
          }

          const response = {};
          response["success"] = true;
          response["count"] = results.length;
          response["sample"] = resultList;
          return JSON.stringify(response);
        } catch (error) {
          const response = {};
          response["success"] = false;
          response["error"] = error.toString();
          return JSON.stringify(response);
        }
      })();
    `;

    const result = await executeJxa<{ success: boolean; count?: number; sample?: any[]; error?: string }>(script);
    if (result.success) {
      return { tool: "search", status: "pass", details: `Found ${result.count} markdown files` };
    }
    return { tool: "search", status: "fail", error: result.error };
  } catch (error) {
    return { tool: "search", status: "fail", error: String(error) };
  }
}

async function testListGroupContent(): Promise<TestResult> {
  try {
    // Get root group of current database
    const script = `
      (() => {
        const theApp = Application("DEVONthink");
        theApp.includeStandardAdditions = true;

        try {
          const db = theApp.currentDatabase();
          if (!db || !db.exists()) {
            const response = {};
            response["success"] = false;
            response["error"] = "No current database";
            return JSON.stringify(response);
          }

          const root = db.root();
          const children = root.children();

          const childList = [];
          for (let i = 0; i < Math.min(children.length, 10); i++) {
            const child = children[i];
            const childInfo = {};
            childInfo["name"] = child.name();
            childInfo["type"] = child.type();
            childInfo["uuid"] = child.uuid();
            childList.push(childInfo);
          }

          const response = {};
          response["success"] = true;
          response["count"] = children.length;
          response["children"] = childList;
          return JSON.stringify(response);
        } catch (error) {
          const response = {};
          response["success"] = false;
          response["error"] = error.toString();
          return JSON.stringify(response);
        }
      })();
    `;

    const result = await executeJxa<{ success: boolean; count?: number; children?: any[]; error?: string }>(script);
    if (result.success) {
      return { tool: "list_group_content", status: "pass", details: `Found ${result.count} items in root` };
    }
    return { tool: "list_group_content", status: "fail", error: result.error };
  } catch (error) {
    return { tool: "list_group_content", status: "fail", error: String(error) };
  }
}

async function testVersionSpecificAPIs(): Promise<TestResult> {
  try {
    const script = `
      (() => {
        const theApp = Application("DEVONthink");
        theApp.includeStandardAdditions = true;

        try {
          const version = theApp.version();
          const db = theApp.currentDatabase();

          // Test various API methods
          const tests = {};
          tests["version"] = version;

          // Test if basic methods work
          tests["databases_method"] = typeof theApp.databases === "function";
          tests["current_database_method"] = typeof theApp.currentDatabase === "function";
          tests["search_method"] = typeof theApp.search === "function";

          // Test record creation methods
          tests["create_record_with_method"] = typeof theApp.createRecordWith === "function";

          // Test record access methods
          tests["get_record_with_uuid"] = typeof theApp.getRecordWithUuid === "function";
          tests["get_record_with_id"] = typeof theApp.getRecordWithId === "function";

          // Test database object methods
          if (db && db.exists()) {
            tests["database_root"] = typeof db.root === "function";
            tests["database_uuid"] = typeof db.uuid === "function";
            tests["database_name"] = typeof db.name === "function";
          }

          const response = {};
          response["success"] = true;
          response["tests"] = tests;
          return JSON.stringify(response);
        } catch (error) {
          const response = {};
          response["success"] = false;
          response["error"] = error.toString();
          return JSON.stringify(response);
        }
      })();
    `;

    const result = await executeJxa<{ success: boolean; tests?: any; error?: string }>(script);
    if (result.success && result.tests) {
      const failedTests = Object.entries(result.tests).filter(([key, value]) =>
        key !== "version" && value === false
      );

      if (failedTests.length > 0) {
        return {
          tool: "api_compatibility",
          status: "fail",
          error: `Failed API checks: ${failedTests.map(([k]) => k).join(", ")}`,
          details: JSON.stringify(result.tests, null, 2)
        };
      }

      return {
        tool: "api_compatibility",
        status: "pass",
        details: `All API methods available for version ${result.tests.version}`
      };
    }
    return { tool: "api_compatibility", status: "fail", error: result.error };
  } catch (error) {
    return { tool: "api_compatibility", status: "fail", error: String(error) };
  }
}

async function runAllTests() {
  console.log("🔍 Running DEVONthink MCP Server Regression Tests\n");
  console.log("=" .repeat(60));

  const tests = [
    { name: "Version & API Compatibility", fn: testVersionSpecificAPIs },
    { name: "Is Running", fn: testIsRunning },
    { name: "Get Open Databases", fn: testGetOpenDatabases },
    { name: "Get Current Database", fn: testGetCurrentDatabase },
    { name: "Create/Read/Delete Cycle", fn: testCreateAndDeleteRecord },
    { name: "Search", fn: testSearch },
    { name: "List Group Content", fn: testListGroupContent },
  ];

  for (const test of tests) {
    process.stdout.write(`\n📝 Testing: ${test.name}... `);
    const result = await test.fn();
    results.push(result);

    if (result.status === "pass") {
      console.log("✅ PASS");
      if (result.details) {
        console.log(`   ${result.details}`);
      }
    } else if (result.status === "skip") {
      console.log("⏭️  SKIP");
      if (result.error) {
        console.log(`   ${result.error}`);
      }
    } else {
      console.log("❌ FAIL");
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n📊 Summary:");
  const passed = results.filter(r => r.status === "pass").length;
  const failed = results.filter(r => r.status === "fail").length;
  const skipped = results.filter(r => r.status === "skip").length;

  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📝 Total: ${results.length}`);

  if (failed > 0) {
    console.log("\n⚠️  Failed Tests:");
    results.filter(r => r.status === "fail").forEach(r => {
      console.log(`   - ${r.tool}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log("\n✨ All tests passed!");
    process.exit(0);
  }
}

runAllTests().catch(error => {
  console.error("\n💥 Test runner failed:", error);
  process.exit(1);
});
