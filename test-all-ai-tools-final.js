/**
 * Final comprehensive test of all AI tools after systematic fixes
 */
import { extractKeywordsTool } from "./dist/tools/ai/extractKeywords.js";
import { findSimilarDocumentsTool } from "./dist/tools/ai/findSimilarDocuments.js";
import { analyzeDocumentThemesTool } from "./dist/tools/ai/analyzeDocumentThemes.js";

const TEST_DOCUMENT_UUID = "35BCE968-5071-481B-AAE6-39094C3F7EE6";
const TEST_DOCUMENT_NAME = "Investing in Internal Documentation: A Brick-by-Brick Guide for Startups Summary (AI)";

async function testTool(toolName, tool, params, validateResult) {
  console.log(`\n🔍 Testing ${toolName}...`);
  const startTime = Date.now();
  
  try {
    const result = await tool.run(params);
    const endTime = Date.now();
    
    console.log(`${toolName} execution time: ${endTime - startTime}ms`);
    
    const isValid = validateResult(result);
    if (isValid) {
      console.log(`✅ ${toolName} WORKING`);
      return { success: true, executionTime: endTime - startTime, result };
    } else {
      console.log(`❌ ${toolName} FAILED validation`);
      console.log("Result:", JSON.stringify(result, null, 2));
      return { success: false, executionTime: endTime - startTime, result };
    }
  } catch (error) {
    const endTime = Date.now();
    console.log(`❌ ${toolName} ERROR: ${error.message}`);
    return { success: false, executionTime: endTime - startTime, error: error.message };
  }
}

async function runComprehensiveTests() {
  console.log("🚀 COMPREHENSIVE AI TOOLS TEST");
  console.log("========================================");
  console.log(`Test Document: ${TEST_DOCUMENT_NAME}`);
  console.log(`UUID: ${TEST_DOCUMENT_UUID}`);
  console.log("========================================");
  
  const results = {};
  
  // Test 1: Extract Keywords
  results.keywords = await testTool(
    "Extract Keywords",
    extractKeywordsTool,
    {
      uuid: TEST_DOCUMENT_UUID,
      maxKeywords: 10,
      minWordLength: 4,
      format: "tagged", // Test advanced format
      filterCommonWords: true,
      includeConfidence: true
    },
    (result) => {
      return result.success && 
             result.keywords && 
             result.keywords.length > 0 && 
             typeof result.keywords[0] === 'object' && // tagged format
             result.keywords[0].keyword &&
             result.document &&
             result.extractionMetadata;
    }
  );
  
  if (results.keywords.success) {
    console.log(`  → Found ${results.keywords.result.keywords.length} keywords`);
    results.keywords.result.keywords.slice(0, 3).forEach((kw, i) => {
      console.log(`    ${i+1}. ${kw.keyword} (relevance: ${kw.relevance?.toFixed(3) || 'N/A'})`);
    });
  }
  
  // Test 2: Find Similar Documents (multiple algorithms)
  for (const algorithm of ["textual", "semantic", "mixed"]) {
    results[`similarity_${algorithm}`] = await testTool(
      `Similar Documents (${algorithm})`,
      findSimilarDocumentsTool,
      {
        referenceUuid: TEST_DOCUMENT_UUID,
        maxResults: 5,
        minSimilarity: 0.2,
        algorithm: algorithm,
        includeMetadata: true,
        includeContent: false,
        sortBy: "similarity"
      },
      (result) => {
        return result.success && 
               result.similarDocuments && 
               result.similarDocuments.length > 0 &&
               result.reference &&
               result.searchMetadata &&
               result.searchMetadata.algorithm === algorithm;
      }
    );
    
    if (results[`similarity_${algorithm}`].success) {
      const docs = results[`similarity_${algorithm}`].result.similarDocuments;
      console.log(`  → Found ${docs.length} similar documents`);
      docs.slice(0, 2).forEach((doc, i) => {
        console.log(`    ${i+1}. ${doc.name} (similarity: ${doc.similarity.toFixed(3)})`);
      });
    }
  }
  
  // Test 3: Analyze Document Themes
  results.themes = await testTool(
    "Document Themes",
    analyzeDocumentThemesTool,
    {
      target: {
        uuid: TEST_DOCUMENT_UUID
      },
      analysisType: "comprehensive",
      maxThemes: 5,
      includeSubthemes: true,
      themeDepth: "deep",
      format: "structured",
      includeConfidence: true,
      includeEvidence: true
    },
    (result) => {
      return result.success && 
             result.analysis && 
             result.analysis.mainThemes && 
             result.analysis.mainThemes.length > 0 &&
             result.documents &&
             result.metadata &&
             result.validation &&
             result.validation.scriptValid;
    }
  );
  
  if (results.themes.success) {
    const themes = results.themes.result.analysis.mainThemes;
    console.log(`  → Identified ${themes.length} themes`);
    themes.slice(0, 3).forEach((theme, i) => {
      console.log(`    ${i+1}. ${theme.theme}`);
    });
  }
  
  // Summary
  console.log("\n📊 FINAL RESULTS SUMMARY");
  console.log("========================================");
  
  const allTools = [
    { name: "Extract Keywords", key: "keywords" },
    { name: "Similar Docs (textual)", key: "similarity_textual" },
    { name: "Similar Docs (semantic)", key: "similarity_semantic" },
    { name: "Similar Docs (mixed)", key: "similarity_mixed" },
    { name: "Document Themes", key: "themes" }
  ];
  
  let successCount = 0;
  let totalExecutionTime = 0;
  
  allTools.forEach(tool => {
    const result = results[tool.key];
    const status = result?.success ? "✅ WORKING" : "❌ FAILED";
    const time = result?.executionTime || 0;
    totalExecutionTime += time;
    
    console.log(`${tool.name}: ${status} (${time}ms)`);
    if (result?.success) successCount++;
  });
  
  console.log("========================================");
  console.log(`Success Rate: ${successCount}/${allTools.length} (${Math.round(successCount/allTools.length*100)}%)`);
  console.log(`Total Execution Time: ${totalExecutionTime}ms (${(totalExecutionTime/1000).toFixed(1)}s)`);
  console.log(`Average Per Tool: ${Math.round(totalExecutionTime/allTools.length)}ms`);
  
  if (successCount === allTools.length) {
    console.log("\n🎉 ALL AI TOOLS ARE NOW WORKING PERFECTLY!");
    console.log("✅ Systematic diagnosis and fixes successful");
    console.log("✅ Performance optimized");
    console.log("✅ Ready for production use");
  } else {
    console.log(`\n⚠️  ${allTools.length - successCount} tool(s) still need attention`);
  }
  
  return { successCount, totalTools: allTools.length, results };
}

runComprehensiveTests().catch(console.error);