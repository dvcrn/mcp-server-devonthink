#!/usr/bin/env node

/**
 * Test harness to validate JXA script generation
 * This allows us to test the script generation without actually calling the MCP server
 */

import { JXAScriptBuilder } from './src/utils/jxaScriptBuilder.js';
import { JXAValidator } from './src/utils/jxaValidator.js';
import { 
  REGEX_PATTERNS,
  DocumentCollectionTemplate,
  AIAnalysisTemplate,
  ThemeParsingTemplate,
  ResultBuildingTemplate,
  createAnalysisPrompt
} from './src/utils/jxaTemplates.js';
import { getRecordLookupHelpers } from './src/utils/jxaHelpers.js';
import * as fs from 'fs';

// Simulate the input
const input = {
  target: {
    uuid: 'C077D937-9E7A-451B-A09E-B5CA164C5BAF'
  },
  analysisType: 'topics',
  format: 'structured',
  maxThemes: 5,
  includeSubthemes: false,
  themeDepth: 'surface',
  includeConfidence: false,
  includeEvidence: false
};

console.log('🔍 Testing JXA Script Generation...\n');

try {
  // Build the script exactly as the tool does
  const builder = JXAScriptBuilder.createWithDefaults();

  // Add variables
  builder.addVariable('recordUuid', input.target.uuid);
  builder.addVariable('recordId', null);
  builder.addVariable('databaseName', null);
  builder.addVariable('recordPath', null);
  builder.addVariable('recordUuids', null);
  builder.addVariable('searchQuery', null);
  builder.addVariable('groupUuid', null);

  // Add analysis configuration
  builder.addVariable('analysisType', input.analysisType);
  builder.addVariable('maxThemes', input.maxThemes);
  builder.addVariable('includeSubthemes', input.includeSubthemes);
  builder.addVariable('themeDepth', input.themeDepth);
  builder.addVariable('format', input.format);
  builder.addVariable('includeConfidence', input.includeConfidence);
  builder.addVariable('includeEvidence', input.includeEvidence);

  // Add regex patterns
  builder.addRegexPattern('themeHeaderPattern', REGEX_PATTERNS.themeHeaders.pattern);
  builder.addRegexPattern('quotedTextPattern', REGEX_PATTERNS.quotedText.pattern, REGEX_PATTERNS.quotedText.flags);

  // Add helper functions
  builder.addFunction('getRecordHelpers', {
    dependencies: [getRecordLookupHelpers()],
    code: ''
  });

  builder.addFunction('documentCollection', DocumentCollectionTemplate);
  builder.addFunction('aiAnalysis', AIAnalysisTemplate);
  builder.addFunction('themeParsing', ThemeParsingTemplate);
  builder.addFunction('resultBuilding', ResultBuildingTemplate);

  // Generate prompt
  const analysisPrompt = createAnalysisPrompt(
    input.analysisType,
    input.themeDepth,
    input.format,
    input.includeSubthemes,
    input.includeEvidence,
    input.maxThemes
  );

  builder.addVariable('analysisPrompt', analysisPrompt);

  // Main execution
  const mainExecution = `
    // Collect target documents
    const uniqueDocuments = collectTargetDocuments();
    
    // Validate we have documents to analyze
    if (uniqueDocuments.length === 0) {
      const result = {};
      result["success"] = true;
      result["analysis"] = {
        mainThemes: [],
        documentsCovered: 0,
        analysisType: analysisType
      };
      result["documents"] = [];
      result["metadata"] = {
        processingTime: 0,
        themeCount: 0,
        documentCount: 0
      };
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

  builder.addTryCatch(mainExecution);

  // Build the script
  const script = builder.build();

  // Save script for inspection
  fs.writeFileSync('/tmp/generated-jxa-script.js', script);
  console.log('📝 Generated script saved to: /tmp/generated-jxa-script.js\n');

  // Validate the script
  const validation = JXAValidator.validate(script);

  if (!validation.valid) {
    console.log('❌ Validation FAILED\n');
    console.log('Errors:');
    validation.errors.forEach(err => {
      console.log(`  • ${err.message} (line ${err.line || 'unknown'})`);
      if (err.code) {
        console.log(`    Code: ${err.code.substring(0, 80)}...`);
      }
    });
    
    console.log('\nWarnings:');
    validation.warnings.forEach(warn => {
      console.log(`  • ${warn.message} (line ${warn.line || 'unknown'})`);
    });

    // Find the actual problematic lines
    const lines = script.split('\n');
    console.log('\n🔍 Searching for arrow functions...');
    lines.forEach((line, index) => {
      if (line.includes('=>')) {
        console.log(`  Line ${index + 1}: ${line.trim()}`);
      }
    });

    console.log('\n🔍 Searching for object literals...');
    lines.forEach((line, index) => {
      if (line.match(/return\s*\{/) || line.match(/=\s*\{[^}]*:/)) {
        console.log(`  Line ${index + 1}: ${line.trim()}`);
      }
    });

  } else {
    console.log('✅ Validation PASSED\n');
    if (validation.warnings.length > 0) {
      console.log('Warnings:');
      validation.warnings.forEach(warn => {
        console.log(`  • ${warn.message}`);
      });
    }
  }

} catch (error) {
  console.error('💥 Error during test:', error);
}