/**
 * Direct test of the AI tools to verify they work after fixes
 */
import { extractKeywordsTool } from "./dist/tools/ai/extractKeywords.js";
import { findSimilarDocumentsTool } from "./dist/tools/ai/findSimilarDocuments.js";

async function testKeywordExtraction() {
  console.log("Testing Keyword Extraction...");
  
  try {
    const result = await extractKeywordsTool.run({
      uuid: "35BCE968-5071-481B-AAE6-39094C3F7EE6", // Document we tested earlier
      maxKeywords: 8,
      minWordLength: 4,
      format: "array",
      filterCommonWords: true
    });
    
    console.log("Keywords Result:", JSON.stringify(result, null, 2));
    
    if (result.success && result.keywords && result.keywords.length > 0) {
      console.log("✅ Keyword extraction WORKING - found", result.keywords.length, "keywords");
      return true;
    } else {
      console.log("❌ Keyword extraction FAILED - no keywords found");
      console.log("Error:", result.error);
      return false;
    }
  } catch (error) {
    console.log("❌ Keyword extraction ERROR:", error.message);
    return false;
  }
}

async function testSimilarDocuments() {
  console.log("\nTesting Similar Documents...");
  
  try {
    const result = await findSimilarDocumentsTool.run({
      referenceUuid: "35BCE968-5071-481B-AAE6-39094C3F7EE6",
      maxResults: 5,
      minSimilarity: 0.3,
      algorithm: "semantic",
      includeMetadata: false,
      includeContent: false
    });
    
    console.log("Similar Documents Result:", JSON.stringify(result, null, 2));
    
    if (result.success && result.similarDocuments && result.similarDocuments.length > 0) {
      console.log("✅ Similar documents WORKING - found", result.similarDocuments.length, "documents");
      return true;
    } else {
      console.log("❌ Similar documents FAILED - no documents found");
      console.log("Error:", result.error);
      return false;
    }
  } catch (error) {
    console.log("❌ Similar documents ERROR:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Testing AI Tools After Fixes\n");
  
  const keywordsWork = await testKeywordExtraction();
  const similarityWork = await testSimilarDocuments();
  
  console.log("\n📊 RESULTS SUMMARY:");
  console.log("Keywords:", keywordsWork ? "✅ WORKING" : "❌ FAILED");
  console.log("Similarity:", similarityWork ? "✅ WORKING" : "❌ FAILED");
  
  if (keywordsWork && similarityWork) {
    console.log("\n🎉 All AI tools are now WORKING!");
  } else {
    console.log("\n⚠️  Some AI tools still need fixes");
  }
}

runTests().catch(console.error);