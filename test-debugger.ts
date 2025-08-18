/**
 * Test Script Debugger - Demonstrate the script debugging capabilities
 */

import { JXAScriptBuilder } from './src/utils/jxaScriptBuilder.js';
import { getRecordLookupHelpers } from './src/utils/jxaHelpers.js';
import { ScriptDebugger, quickDebug } from './src/utils/scriptDebugger.js';
import { 
  DocumentCollectionTemplate,
  AIAnalysisTemplate,
  createAnalysisPrompt
} from './src/utils/jxaTemplates.js';

async function testScriptDebugger() {
  console.log("=== Testing Script Debugger ===\n");

  // Test 1: Debug a problematic script (like the original issue)
  console.log("1. Creating problematic script (original issue)...");
  const problematicBuilder = JXAScriptBuilder.createWithDefaults();
  
  problematicBuilder.addVariable('recordUuid', '123e4567-e89b-12d3-a456-426614174000');
  problematicBuilder.addVariable('analysisType', 'concepts');
  
  // This simulates the original bug - adding template without helpers
  problematicBuilder.addFunction('documentCollection', DocumentCollectionTemplate);
  
  problematicBuilder.addTryCatch(`
    const uniqueDocuments = collectTargetDocuments();
    return JSON.stringify({success: true, documents: uniqueDocuments.length});
  `);

  // Debug the problematic script
  const problematicDebug = ScriptDebugger.debug(
    'problematic_script',
    problematicBuilder,
    { 
      verbose: true,
      saveScripts: true,
      outputDir: './.debug/test-scripts'
    }
  );

  // Test 2: Debug a fixed script
  console.log("\n2. Creating fixed script...");
  const fixedBuilder = JXAScriptBuilder.createWithDefaults();
  
  fixedBuilder.addVariable('recordUuid', '123e4567-e89b-12d3-a456-426614174000');
  fixedBuilder.addVariable('analysisType', 'concepts');
  
  // Add helpers FIRST
  fixedBuilder.addFunction('helpers', {
    code: getRecordLookupHelpers()
  });
  
  // Then add templates
  fixedBuilder.addFunction('documentCollection', DocumentCollectionTemplate);
  
  fixedBuilder.addTryCatch(`
    const uniqueDocuments = collectTargetDocuments();
    const result = {};
    result["success"] = true;
    result["documentCount"] = uniqueDocuments.length;
    return JSON.stringify(result);
  `);

  // Debug the fixed script
  const fixedDebug = ScriptDebugger.debug(
    'fixed_script',
    fixedBuilder,
    { 
      verbose: true,
      saveScripts: true,
      outputDir: './.debug/test-scripts'
    }
  );

  // Test 3: Compare the scripts
  console.log("\n3. Comparing scripts...");
  const comparison = ScriptDebugger.compareScripts(
    problematicDebug.script,
    fixedDebug.script
  );
  
  console.log(`📊 Comparison Results:`);
  console.log(`  - Identical: ${comparison.identical ? 'YES' : 'NO'}`);
  console.log(`  - Size difference: ${comparison.sizeDiff} bytes`);
  console.log(`  - Line difference: ${comparison.lineDiff} lines`);
  
  if (!comparison.identical && comparison.differences.length > 0) {
    console.log(`  - Found ${comparison.differences.length} differences`);
    console.log(`  - First few differences:`);
    comparison.differences.slice(0, 10).forEach(diff => {
      console.log(`    ${diff}`);
    });
  }

  // Test 4: Analyze dependencies
  console.log("\n4. Analyzing dependencies...");
  const problematicDeps = ScriptDebugger.analyzeDependencies(problematicDebug.script);
  const fixedDeps = ScriptDebugger.analyzeDependencies(fixedDebug.script);
  
  console.log(`📋 Problematic Script Dependencies:`);
  console.log(`  - Functions defined: ${problematicDeps.functionDefinitions.length}`);
  console.log(`  - Functions called: ${problematicDeps.functionCalls.length}`);
  console.log(`  - Missing functions: ${problematicDeps.missingFunctions.length} - ${problematicDeps.missingFunctions.join(', ')}`);
  console.log(`  - Unused functions: ${problematicDeps.unusedFunctions.length}`);
  
  console.log(`\n📋 Fixed Script Dependencies:`);
  console.log(`  - Functions defined: ${fixedDeps.functionDefinitions.length}`);
  console.log(`  - Functions called: ${fixedDeps.functionCalls.length}`);
  console.log(`  - Missing functions: ${fixedDeps.missingFunctions.length} - ${fixedDeps.missingFunctions.join(', ')}`);
  console.log(`  - Unused functions: ${fixedDeps.unusedFunctions.length}`);

  // Test 5: Quick debug utility
  console.log("\n5. Testing quick debug utility...");
  const sampleScript = `
function test() {
  return {success: true};  // This will fail JXA validation
}

function unused() {
  // This function is never called
}

test();
missingFunction();  // This function doesn't exist
  `;
  
  quickDebug(sampleScript, 'sample_test_script');

  // Test 6: Generate comprehensive report
  console.log("\n6. Generating comprehensive report...");
  const report = ScriptDebugger.generateReport();
  console.log(report);

  // Test 7: History and search
  console.log("\n7. Testing history and search...");
  const history = ScriptDebugger.getHistory();
  console.log(`📚 Debug history: ${history.length} scripts`);
  
  const aiScripts = ScriptDebugger.findScripts(/script/i);
  console.log(`🔍 Found ${aiScripts.length} scripts matching 'script' pattern`);

  // Test 8: Validation summary
  console.log("\n8. Validation summary...");
  const summary = ScriptDebugger.getValidationSummary();
  console.log(`📈 Validation Summary:`);
  console.log(`  - Total: ${summary.total}`);
  console.log(`  - Valid: ${summary.valid}`);
  console.log(`  - Invalid: ${summary.invalid}`);
  console.log(`  - Error rate: ${Math.round(summary.errorRate * 100)}%`);
  
  if (Object.keys(summary.commonErrors).length > 0) {
    console.log(`  - Top errors:`);
    Object.entries(summary.commonErrors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .forEach(([error, count]) => {
        console.log(`    ${count}x: ${error.substring(0, 60)}...`);
      });
  }

  console.log("\n✅ Script Debugger test completed!");
  
  return {
    problematicDebug,
    fixedDebug,
    comparison,
    summary
  };
}

// Run the test
testScriptDebugger().catch(console.error);