/**
 * Test Enhanced Validation - Test the improved validation system
 */

import { JXAValidator, formatValidationResult } from './src/utils/jxaValidator.js';

// Test script with the original problem - function call without definition
const problematicScript = `
(function() {
  const theApp = Application("DEVONthink");
  theApp.includeStandardAdditions = true;
  
  // Dependencies - this was the issue!
  getRecordLookupHelpers()  // Function call without definition!
  
  // Variables
  const recordUuid = "123e4567-e89b-12d3-a456-426614174000";
  
  // Main execution
  try {
    // This calls getRecord() which isn't defined either
    const lookupResult = getRecord(theApp, {uuid: recordUuid});
    return JSON.stringify({success: true});
  } catch (error) {
    return JSON.stringify({success: false, error: error.toString()});
  }
})();
`;

// Test script with the problem fixed
const fixedScript = `
(function() {
  const theApp = Application("DEVONthink");
  theApp.includeStandardAdditions = true;
  
  // Variables
  const recordUuid = "123e4567-e89b-12d3-a456-426614174000";
  
  // Helper functions - properly defined
  function lookupByUuid(theApp, uuid) {
    if (!uuid) return null;
    try {
      return theApp.getRecordWithUuid(uuid);
    } catch (e) {
      return null;
    }
  }
  
  function getRecord(theApp, options) {
    if (!options) return null;
    if (options.uuid) {
      const record = lookupByUuid(theApp, options.uuid);
      if (record) {
        const result = {};
        result["record"] = record;
        return result;
      }
    }
    return {record: null, error: "Not found"};
  }
  
  // Main execution
  try {
    const lookupResult = getRecord(theApp, {uuid: recordUuid});
    return JSON.stringify({success: true});
  } catch (error) {
    return JSON.stringify({success: false, error: error.toString()});
  }
})();
`;

async function testValidation() {
  console.log("=== Testing Enhanced JXA Validation ===\n");

  console.log("1. Testing problematic script (original issue)...");
  const problematicResult = JXAValidator.validate(problematicScript);
  console.log("Validation result:", problematicResult.valid ? "✅ PASSED" : "❌ FAILED");
  console.log("Details:");
  console.log(formatValidationResult(problematicResult));

  console.log("\n" + "=".repeat(60) + "\n");

  console.log("2. Testing quick validation on problematic script...");
  const quickResult = JXAValidator.quickValidate(problematicScript);
  console.log("Quick validation result:", quickResult.valid ? "✅ PASSED" : "❌ FAILED");
  if (!quickResult.valid) {
    console.log("Issues found:");
    quickResult.issues.forEach(issue => {
      console.log(`  • ${issue}`);
    });
  }

  console.log("\n" + "=".repeat(60) + "\n");

  console.log("3. Testing fixed script...");
  const fixedResult = JXAValidator.validate(fixedScript);
  console.log("Validation result:", fixedResult.valid ? "✅ PASSED" : "❌ FAILED");
  console.log("Details:");
  console.log(formatValidationResult(fixedResult));

  console.log("\n" + "=".repeat(60) + "\n");

  console.log("4. Testing quick validation on fixed script...");
  const fixedQuickResult = JXAValidator.quickValidate(fixedScript);
  console.log("Quick validation result:", fixedQuickResult.valid ? "✅ PASSED" : "❌ FAILED");
  if (!fixedQuickResult.valid) {
    console.log("Issues found:");
    fixedQuickResult.issues.forEach(issue => {
      console.log(`  • ${issue}`);
    });
  }
}

testValidation().catch(console.error);