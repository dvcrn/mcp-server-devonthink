/**
 * Test just the similarity tool with different algorithms
 */
import { findSimilarDocumentsTool } from "./dist/tools/ai/findSimilarDocuments.js";

async function testAlgorithm(algorithm) {
  console.log(`\n🔍 Testing ${algorithm} algorithm...`);
  
  try {
    const result = await findSimilarDocumentsTool.run({
      referenceUuid: "35BCE968-5071-481B-AAE6-39094C3F7EE6",
      maxResults: 3,
      minSimilarity: 0.1,  // Lower threshold
      algorithm: algorithm,
      includeMetadata: false,
      includeContent: false
    });
    
    console.log(`${algorithm} execution time:`, result.executionTime, "ms");
    
    if (result.success && result.similarDocuments && result.similarDocuments.length > 0) {
      console.log(`✅ ${algorithm} WORKING - found`, result.similarDocuments.length, "documents");
      result.similarDocuments.forEach((doc, i) => {
        console.log(`  ${i+1}. ${doc.name} (similarity: ${doc.similarity.toFixed(3)})`);
      });
      return true;
    } else {
      console.log(`❌ ${algorithm} FAILED - no documents found`);
      if (result.warnings) {
        result.warnings.forEach(w => console.log(`  Warning: ${w}`));
      }
      return false;
    }
  } catch (error) {
    console.log(`❌ ${algorithm} ERROR:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log("🚀 Testing Similarity Tool After Fixes");
  
  const algorithms = ["textual", "semantic", "mixed"];
  const results = {};
  
  for (const algorithm of algorithms) {
    results[algorithm] = await testAlgorithm(algorithm);
  }
  
  console.log("\n📊 ALGORITHM RESULTS:");
  algorithms.forEach(alg => {
    console.log(`${alg}: ${results[alg] ? "✅ WORKING" : "❌ FAILED"}`);
  });
}

runTests().catch(console.error);