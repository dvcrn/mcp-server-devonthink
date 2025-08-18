/**
 * Test Script Generation - Debugging harness for JXA script builder issues
 * 
 * This file reproduces the exact script generation process used by analyzeDocumentThemes
 * so we can inspect what's being generated and identify the issue.
 */

import { JXAScriptBuilder } from './src/utils/jxaScriptBuilder.js';
import { 
  REGEX_PATTERNS,
  DocumentCollectionTemplate,
  AIAnalysisTemplate,
  ThemeParsingTemplate,
  ResultBuildingTemplate,
  createAnalysisPrompt
} from './src/utils/jxaTemplates.js';
import { getRecordLookupHelpers } from './src/utils/jxaHelpers.js';
import { JXAValidator, formatValidationResult } from './src/utils/jxaValidator.js';

// Test input that should trigger the error
const testInput = {
  target: {
    uuid: "123e4567-e89b-12d3-a456-426614174000"
  },
  analysisType: "concepts" as const,
  maxThemes: 5,
  includeSubthemes: false,
  themeDepth: "surface" as const,
  format: "structured" as const,
  includeConfidence: false,
  includeEvidence: false
};

async function testScriptGeneration() {
  console.log("=== Testing JXA Script Generation ===\n");

  try {
    // Reproduce the exact same builder construction as analyzeDocumentThemes
    console.log("1. Creating JXAScriptBuilder...");
    const builder = JXAScriptBuilder.createWithDefaults();

    console.log("2. Adding variables...");
    // Add variables with automatic escaping and validation - handle missing target
    const target = testInput.target || {};
    
    if (target.uuid) {
      builder.addVariable('recordUuid', target.uuid);
    } else {
      builder.addVariable('recordUuid', null);
    }

    if (target.recordId) {
      builder.addVariable('recordId', target.recordId);
    } else {
      builder.addVariable('recordId', null);
    }

    if (target.databaseName) {
      builder.addVariable('databaseName', target.databaseName);
    } else {
      builder.addVariable('databaseName', null);
    }

    if (target.recordPath) {
      builder.addVariable('recordPath', target.recordPath);
    } else {
      builder.addVariable('recordPath', null);
    }

    if (target.uuids) {
      // Create array literal using safe approach
      const uuidArray = '[' + target.uuids.map(uuid => `"${uuid}"`).join(',') + ']';
      builder.addVariable('recordUuids', uuidArray, 'raw');
    } else {
      builder.addVariable('recordUuids', null);
    }

    if (target.searchQuery) {
      builder.addVariable('searchQuery', target.searchQuery);
    } else {
      builder.addVariable('searchQuery', null);
    }

    if (target.groupUuid) {
      builder.addVariable('groupUuid', target.groupUuid);
    } else {
      builder.addVariable('groupUuid', null);
    }

    // Add analysis configuration variables
    builder.addVariable('analysisType', testInput.analysisType);
    builder.addVariable('maxThemes', testInput.maxThemes);
    builder.addVariable('includeSubthemes', testInput.includeSubthemes);
    builder.addVariable('themeDepth', testInput.themeDepth);
    builder.addVariable('format', testInput.format);
    builder.addVariable('includeConfidence', testInput.includeConfidence);
    builder.addVariable('includeEvidence', testInput.includeEvidence);

    console.log("3. Adding regex patterns...");
    // Add regex patterns using the builder's safe regex handling
    builder.addRegexPattern('themeHeaderPattern', REGEX_PATTERNS.themeHeaders.pattern);
    builder.addRegexPattern('quotedTextPattern', REGEX_PATTERNS.quotedText.pattern, REGEX_PATTERNS.quotedText.flags);

    console.log("4. Adding helper functions...");
    // Add helper functions first - they need to be defined before templates that use them
    builder.addFunction('helpers', {
      code: getRecordLookupHelpers()
    });

    console.log("5. Adding template functions...");
    builder.addFunction('documentCollection', DocumentCollectionTemplate);
    builder.addFunction('aiAnalysis', AIAnalysisTemplate);
    builder.addFunction('themeParsing', ThemeParsingTemplate);
    builder.addFunction('resultBuilding', ResultBuildingTemplate);

    console.log("6. Generating AI prompt...");
    // Generate AI prompt using template helper
    const analysisPrompt = createAnalysisPrompt(
      testInput.analysisType,
      testInput.themeDepth,
      testInput.format,
      testInput.includeSubthemes,
      testInput.includeEvidence,
      testInput.maxThemes
    );

    builder.addVariable('analysisPrompt', analysisPrompt);

    console.log("7. Adding main execution logic...");
    // Build main execution logic using safe patterns
    const mainExecution = `
      // Collect target documents
      const uniqueDocuments = collectTargetDocuments();
      
      // Validate we have documents to analyze
      if (uniqueDocuments.length === 0) {
        const result = {};
        result["success"] = true;
        
        const emptyAnalysis = {};
        emptyAnalysis["mainThemes"] = [];
        emptyAnalysis["documentsCovered"] = 0;
        emptyAnalysis["analysisType"] = analysisType;
        result["analysis"] = emptyAnalysis;
        
        result["documents"] = [];
        
        const emptyMetadata = {};
        emptyMetadata["processingTime"] = 0;
        emptyMetadata["themeCount"] = 0;
        emptyMetadata["documentCount"] = 0;
        result["metadata"] = emptyMetadata;
        
        result["warnings"] = ["No documents found matching the specified criteria"];
        return JSON.stringify(result);
      }
      
      // Execute AI analysis
      const analysisOptions = {};
      analysisOptions["engine"] = "ChatGPT";
      analysisOptions["temperature"] = 0.3;
      
      const aiResult = executeAIAnalysis(uniqueDocuments, analysisPrompt, analysisOptions);
      
      // Parse themes from AI response
      const themes = parseThemesFromResponse(
        aiResult.response,
        maxThemes,
        includeSubthemes,
        includeConfidence,
        includeEvidence
      );
      
      // Build final result
      const metadata = {};
      metadata["processingTime"] = aiResult.processingTime;
      
      const result = buildAnalysisResult(themes, uniqueDocuments, metadata, analysisType, format);
      
      return JSON.stringify(result);
    `;

    // Wrap main execution in try-catch using builder helper
    builder.addTryCatch(mainExecution);

    console.log("8. Building the complete script...");
    // Build the complete script
    const script = builder.build();

    console.log("9. Validating the script...");
    // VALIDATION: Validate the generated script before execution
    const validation = JXAValidator.validate(script);
    
    if (!validation.valid) {
      console.error("❌ Script validation failed!");
      console.error("Errors:", validation.errors.map(e => e.message).join('; '));
      console.error("Details:", formatValidationResult(validation));
      
      // Still show the script for debugging
      console.log("\n=== GENERATED SCRIPT (INVALID) ===");
      console.log(script);
      return;
    }

    // Quick validation for critical issues
    const quickValidation = JXAValidator.quickValidate(script);
    if (!quickValidation.valid) {
      console.error("❌ Quick validation failed!");
      console.error("Issues:", quickValidation.issues.join('; '));
      
      // Still show the script for debugging
      console.log("\n=== GENERATED SCRIPT (QUICK VALIDATION FAILED) ===");
      console.log(script);
      return;
    }

    console.log("✅ Script validation passed!");
    
    console.log("\n=== GENERATED SCRIPT ===");
    console.log(script);
    
    console.log("\n=== SCRIPT ANALYSIS ===");
    
    // Check for specific issues
    console.log("Checking for getRecordLookupHelpers references...");
    const hasGetRecordLookupHelpers = script.includes('getRecordLookupHelpers');
    console.log(`- Contains 'getRecordLookupHelpers': ${hasGetRecordLookupHelpers}`);
    
    console.log("Checking for helper function definitions...");
    const hasLookupByUuid = script.includes('function lookupByUuid');
    const hasLookupById = script.includes('function lookupById');
    const hasGetRecord = script.includes('function getRecord');
    console.log(`- Has lookupByUuid function: ${hasLookupByUuid}`);
    console.log(`- Has lookupById function: ${hasLookupById}`);
    console.log(`- Has getRecord function: ${hasGetRecord}`);
    
    console.log("Checking for function calls...");
    const hasGetRecordCall = script.includes('getRecord(');
    const hasCollectTargetDocuments = script.includes('collectTargetDocuments(');
    console.log(`- Contains getRecord() calls: ${hasGetRecordCall}`);
    console.log(`- Contains collectTargetDocuments() calls: ${hasCollectTargetDocuments}`);
    
  } catch (error) {
    console.error("❌ Error during script generation:");
    console.error(error);
  }
}

// Run the test
testScriptGeneration().catch(console.error);