/**
 * Test the theme analysis tool
 */
import { analyzeDocumentThemesTool } from "./dist/tools/ai/analyzeDocumentThemes.js";

async function testThemeAnalysis() {
  console.log("🎯 Testing Theme Analysis...");
  
  try {
    const result = await analyzeDocumentThemesTool.run({
      target: {
        uuid: "35BCE968-5071-481B-AAE6-39094C3F7EE6"
      },
      analysisType: "concepts",
      maxThemes: 4,
      includeSubthemes: false,
      themeDepth: "surface",
      format: "structured",
      includeConfidence: false,
      includeEvidence: false
    });
    
    console.log("Theme Analysis Result:", JSON.stringify(result, null, 2));
    
    if (result.success && result.analysis && result.analysis.mainThemes && result.analysis.mainThemes.length > 0) {
      console.log("✅ Theme analysis WORKING - found", result.analysis.mainThemes.length, "themes");
      result.analysis.mainThemes.forEach((theme, i) => {
        console.log(`  ${i+1}. ${theme.theme}: ${theme.description}`);
      });
      return true;
    } else {
      console.log("❌ Theme analysis FAILED");
      if (result.error) {
        console.log("Error:", result.error);
      }
      if (result.warnings) {
        result.warnings.forEach(w => console.log("Warning:", w));
      }
      return false;
    }
  } catch (error) {
    console.log("❌ Theme analysis ERROR:", error.message);
    return false;
  }
}

testThemeAnalysis().catch(console.error);