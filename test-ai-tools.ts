/**
 * Comprehensive AI Tools Test - Verify all AI tools work with the fixed system
 */

import { analyzeDocumentThemesTool } from './src/tools/ai/analyzeDocumentThemes.js';
import { extractKeywordsTool } from './src/tools/ai/extractKeywords.js';
import { findSimilarDocumentsTool } from './src/tools/ai/findSimilarDocuments.js';

async function testAITool(toolName: string, tool: any, input: any) {
  console.log(`\n=== Testing ${toolName} ===`);
  
  try {
    console.log("Input:", JSON.stringify(input, null, 2));
    console.log("Running tool...");
    
    const startTime = Date.now();
    const result = await tool.run(input);
    const duration = Date.now() - startTime;
    
    console.log(`Completed in ${duration}ms`);
    
    if (result.success) {
      console.log("✅ SUCCESS");
      console.log("Result summary:");
      
      if (result.analysis) {
        console.log(`- Analysis: ${result.analysis.analysisType}`);
        console.log(`- Themes: ${result.analysis.mainThemes?.length || 0}`);
        console.log(`- Documents: ${result.analysis.documentsCovered || 0}`);
      }
      
      if (result.keywords) {
        console.log(`- Keywords: ${result.keywords.length}`);
      }
      
      if (result.similar) {
        console.log(`- Similar documents: ${result.similar.length}`);
      }
      
      if (result.validation) {
        console.log(`- Script validation: ${result.validation.scriptValid ? '✅' : '❌'}`);
      }
      
    } else {
      console.log("❌ FAILED");
      console.log("Error:", result.error);
      
      if (result.validation) {
        console.log("Validation details:", result.validation.validationDetails);
      }
    }
    
    return result;
    
  } catch (error) {
    console.log("❌ EXCEPTION");
    console.error("Exception:", error);
    return null;
  }
}

async function testAllAITools() {
  console.log("=== Testing All AI Tools with Fixed JXA Script Builder ===");
  console.log("This test verifies that all AI tools work correctly after fixing the");
  console.log("'getRecordLookupHelpers' and dependency management issues.");
  
  const testResults: { [key: string]: any } = {};
  
  // Test 1: analyzeDocumentThemes
  testResults.analyzeDocumentThemes = await testAITool(
    "analyzeDocumentThemes",
    analyzeDocumentThemesTool,
    {
      target: {
        uuid: "123e4567-e89b-12d3-a456-426614174000"
      },
      analysisType: "concepts",
      maxThemes: 3,
      includeSubthemes: false,
      themeDepth: "surface",
      format: "structured",
      includeConfidence: true,
      includeEvidence: false
    }
  );
  
  // Test 2: extractKeywords  
  testResults.extractKeywords = await testAITool(
    "extractKeywords", 
    extractKeywordsTool,
    {
      uuid: "123e4567-e89b-12d3-a456-426614174000",
      maxKeywords: 10
    }
  );
  
  // Test 3: findSimilarDocuments
  testResults.findSimilarDocuments = await testAITool(
    "findSimilarDocuments",
    findSimilarDocumentsTool,
    {
      referenceUuid: "123e4567-e89b-12d3-a456-426614174000",
      maxResults: 5
    }
  );
  
  console.log("\n" + "=".repeat(80));
  console.log("SUMMARY");
  console.log("=".repeat(80));
  
  let totalTests = 0;
  let successfulTests = 0;
  let validationPassed = 0;
  
  Object.entries(testResults).forEach(([toolName, result]) => {
    totalTests++;
    
    const success = result?.success === true;
    const scriptValid = result?.validation?.scriptValid === true;
    
    if (success) successfulTests++;
    if (scriptValid) validationPassed++;
    
    console.log(`${toolName}: ${success ? '✅' : '❌'} ${success ? 'SUCCESS' : 'FAILED'} | Script: ${scriptValid ? '✅' : '❌'} ${scriptValid ? 'VALID' : 'INVALID'}`);
    
    if (!success && result?.error) {
      console.log(`  Error: ${result.error.substring(0, 100)}...`);
    }
  });
  
  console.log("\nOverall Results:");
  console.log(`- Tools tested: ${totalTests}`);
  console.log(`- Successful: ${successfulTests}/${totalTests} (${Math.round(successfulTests/totalTests*100)}%)`);
  console.log(`- Script validation passed: ${validationPassed}/${totalTests} (${Math.round(validationPassed/totalTests*100)}%)`);
  
  if (successfulTests === totalTests) {
    console.log("\n🎉 ALL TESTS PASSED! The JXA script generation issue has been resolved.");
  } else {
    console.log("\n⚠️  Some tests failed. The issue may not be fully resolved or there are other problems.");
  }
  
  return testResults;
}

// Run the comprehensive test
testAllAITools().catch(console.error);