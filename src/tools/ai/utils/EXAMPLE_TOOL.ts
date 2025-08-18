/**
 * EXAMPLE: AI Content Analyzer Tool
 * Demonstrates how to use the AI infrastructure utilities to create a new AI tool
 * 
 * This example shows:
 * - Using the base AI tool pattern
 * - Leveraging validation utilities
 * - Custom script building
 * - Error handling integration
 * - Result processing
 */

import { z } from "zod";
import { 
  createAITool,
  AI_TOOL_SCHEMAS,
  AI_VALIDATORS,
  buildBaseAIScript,
  type AIToolConfig
} from './index.js';
import { escapeStringForJXA } from '../../../utils/escapeString.js';

// ============================================================================
// EXAMPLE 1: Simple AI Tool using convenience functions
// ============================================================================

/**
 * Simple document analyzer that extracts key themes and insights
 */
export const simpleAnalyzerTool = createAITool({
  name: "analyze_document_themes",
  operationType: "analyze",
  description: "Analyzes documents to extract key themes, topics, and insights using AI",
  
  // Use pre-built schema for analysis tools
  inputSchema: AI_TOOL_SCHEMAS.ANALYSIS.extend({
    extractionType: z.enum(['themes', 'keywords', 'summary', 'insights']).default('themes'),
    includeConfidence: z.boolean().default(false)
  }),
  
  // Use pre-built validators
  customValidators: [AI_VALIDATORS.REQUIRES_RECORDS],
  
  // Custom script builder
  scriptBuilder: (input) => {
    const {
      recordUuids = [],
      extractionType = 'themes',
      includeConfidence = false,
      engine = 'ChatGPT',
      temperature = 0.3
    } = input;

    const analysisPrompt = getAnalysisPrompt(extractionType);
    
    const scriptBody = `
      // Get records for analysis
      const recordsData = getRecordsForAI(theApp, {
        recordUuids: [${recordUuids.map((uuid: string) => `"${escapeStringForJXA(uuid)}"`).join(', ')}],
        maxRecords: 10
      });
      
      if (recordsData.count === 0) {
        const errorResult = {};
        errorResult["success"] = false;
        errorResult["error"] = "No valid records found for analysis";
        errorResult["operationType"] = "analyze";
        return JSON.stringify(errorResult);
      }
      
      // Build AI options
      const aiOptions = buildAIOptions({
        engine: "${engine}",
        temperature: ${temperature},
        outputFormat: "json"
      });
      
      // Set up records for analysis
      aiOptions["record"] = recordsData.records;
      aiOptions["mode"] = "context";
      
      // Execute analysis
      const analysisPrompt = "${escapeStringForJXA(analysisPrompt)}";
      const aiResponse = theApp.getChatResponseForMessage(analysisPrompt, aiOptions);
      
      // Process results
      const result = {};
      result["success"] = true;
      result["operationType"] = "analyze";
      result["analysis"] = aiResponse;
      result["extractionType"] = "${extractionType}";
      result["sourceRecords"] = recordsData.recordInfo;
      result["recordCount"] = recordsData.count;
      result["engine"] = "${engine}";
      
      ${includeConfidence ? `
      try {
        // Parse AI response to add confidence scores
        const parsedResponse = JSON.parse(aiResponse);
        if (parsedResponse && typeof parsedResponse === "object") {
          result["analysis"] = parsedResponse;
          result["includeConfidence"] = true;
        }
      } catch (parseError) {
        // Keep original response if parsing fails
      }
      ` : ''}
      
      return JSON.stringify(result);
    `;

    return buildBaseAIScript('analyze', scriptBody);
  },
  
  // Result processing options
  resultProcessingOptions: {
    includeTimestamp: true,
    includeExecutionTime: true,
    sanitizeContent: true,
    maxContentLength: 20000
  },
  
  supportedEngines: ['ChatGPT', 'Claude', 'Gemini'],
  
  examples: [
    'Extract main themes from research documents',
    'Identify key insights from meeting notes',
    'Analyze document collection for common topics'
  ]
});

// Helper function to get analysis prompts
function getAnalysisPrompt(extractionType: string): string {
  const prompts: Record<string, string> = {
    themes: `Analyze the provided documents and extract the main themes and topics. 
             Return a JSON object with: {"themes": [{"name": "theme name", "description": "brief description", "confidence": 0.95}]}`,
    
    keywords: `Extract important keywords and key phrases from the documents.
               Return a JSON object with: {"keywords": [{"term": "keyword", "relevance": 0.9, "frequency": 5}]}`,
    
    summary: `Provide a concise summary of the main points across all documents.
              Return a JSON object with: {"summary": "main summary text", "key_points": ["point 1", "point 2"]}`,
    
    insights: `Analyze the documents for insights, patterns, and notable findings.
               Return a JSON object with: {"insights": [{"insight": "finding description", "supporting_evidence": "evidence", "confidence": 0.8}]}`
  };
  
  return prompts[extractionType] || prompts.themes;
}

// ============================================================================
// EXAMPLE 2: Advanced AI Tool using BaseAITool class
// ============================================================================

/**
 * Advanced document comparison tool with custom logic
 */
class AdvancedDocumentComparator {
  private toolConfig: AIToolConfig;

  constructor() {
    this.toolConfig = {
      name: "advanced_document_compare",
      operationType: "compare",
      description: `Advanced document comparison with semantic analysis, similarity scoring, and relationship mapping.
      
      This tool provides:
      • Semantic similarity analysis between documents
      • Content overlap detection  
      • Thematic relationship mapping
      • Multi-dimensional similarity scoring
      • Comparative insights and recommendations`,
      
      inputSchema: z.object({
        primaryRecordUuid: z.string().uuid().describe("Primary document for comparison"),
        compareRecordUuids: z.array(z.string().uuid()).optional().describe("Specific documents to compare against"),
        databaseName: z.string().optional().describe("Database to search for similar documents"),
        analysisDepth: z.enum(['surface', 'semantic', 'deep']).default('semantic').describe("Depth of analysis"),
        maxResults: z.number().min(1).max(20).default(5).describe("Maximum similar documents to return"),
        includeRecommendations: z.boolean().default(true).describe("Include actionable recommendations"),
        engine: z.enum(['ChatGPT', 'Claude']).default('ChatGPT'),
        temperature: z.number().min(0).max(1).default(0.2)
      }),
      
      scriptBuilder: (input) => this.buildComparisonScript(input),
      
      customValidators: [
        // Custom validation for this tool
        (input: Record<string, any>): string[] => {
          const errors: string[] = [];
          
          if (!input.primaryRecordUuid) {
            errors.push('primaryRecordUuid is required');
          }
          
          if (!input.compareRecordUuids && !input.databaseName) {
            errors.push('Either compareRecordUuids or databaseName must be provided');
          }
          
          if (input.compareRecordUuids && input.compareRecordUuids.length > 10) {
            errors.push('Maximum 10 documents can be compared at once');
          }
          
          return errors;
        }
      ],
      
      resultProcessingOptions: {
        includeTimestamp: true,
        includeExecutionTime: true,
        validateStructure: true,
        sanitizeContent: true
      },
      
      supportedEngines: ['ChatGPT', 'Claude'],
      
      examples: [
        'Compare research papers for thematic overlap',
        'Find similar documents in legal database',
        'Analyze document relationships in project folder',
        'Identify content gaps between related documents'
      ]
    };
  }

  private buildComparisonScript(input: any): string {
    const {
      primaryRecordUuid,
      compareRecordUuids = [],
      databaseName,
      analysisDepth = 'semantic',
      maxResults = 5,
      includeRecommendations = true,
      engine = 'ChatGPT',
      temperature = 0.2
    } = input;

    const analysisPrompt = this.getAnalysisPrompt(analysisDepth, includeRecommendations);

    const scriptBody = `
      // Get primary record
      const primaryRecord = theApp.getRecordWithUuid("${escapeStringForJXA(primaryRecordUuid)}");
      if (!primaryRecord) {
        const errorResult = {};
        errorResult["success"] = false;
        errorResult["error"] = "Primary record not found: ${escapeStringForJXA(primaryRecordUuid)}";
        errorResult["operationType"] = "compare";
        return JSON.stringify(errorResult);
      }
      
      // Build comparison context
      const comparisonRecords = [primaryRecord];
      const recordInfo = [];
      
      // Add primary record info
      const primaryInfo = {};
      primaryInfo["uuid"] = primaryRecord.uuid();
      primaryInfo["name"] = primaryRecord.name();
      primaryInfo["location"] = primaryRecord.location();
      primaryInfo["type"] = "primary";
      recordInfo.push(primaryInfo);
      
      ${compareRecordUuids.length > 0 ? `
      // Add specific comparison records
      ${compareRecordUuids.map((uuid: string, index: number) => `
      try {
        const compareRecord${index} = theApp.getRecordWithUuid("${escapeStringForJXA(uuid)}");
        if (compareRecord${index}) {
          comparisonRecords.push(compareRecord${index});
          
          const compareInfo = {};
          compareInfo["uuid"] = compareRecord${index}.uuid();
          compareInfo["name"] = compareRecord${index}.name();
          compareInfo["location"] = compareRecord${index}.location();
          compareInfo["type"] = "comparison";
          recordInfo.push(compareInfo);
        }
      } catch (error) {
        // Continue with other records
      }
      `).join('')}
      ` : `
      // Find similar records in database
      ${databaseName ? `
      const targetDatabase = getDatabase(theApp, "${escapeStringForJXA(databaseName)}");
      if (targetDatabase) {
        // Use DEVONthink's compare function to find similar records
        const compareOptions = {};
        compareOptions["record"] = primaryRecord;
        compareOptions["in"] = targetDatabase;
        compareOptions["maxResults"] = ${maxResults};
        
        const similarRecords = theApp.compareTo(compareOptions);
        if (similarRecords && similarRecords.length > 0) {
          similarRecords.slice(0, ${maxResults}).forEach(record => {
            comparisonRecords.push(record);
            
            const similarInfo = {};
            similarInfo["uuid"] = record.uuid();
            similarInfo["name"] = record.name();
            similarInfo["location"] = record.location();
            similarInfo["type"] = "similar";
            similarInfo["similarity"] = record.similarity || 0;
            recordInfo.push(similarInfo);
          });
        }
      }
      ` : ''}`}
      
      if (comparisonRecords.length < 2) {
        const warningResult = {};
        warningResult["success"] = true;
        warningResult["operationType"] = "compare";
        warningResult["results"] = {
          primaryRecord: recordInfo[0],
          comparisons: [],
          message: "No comparison documents found"
        };
        return JSON.stringify(warningResult);
      }
      
      // Execute AI comparison
      const aiOptions = buildAIOptions({
        engine: "${engine}",
        temperature: ${temperature},
        outputFormat: "json"
      });
      
      aiOptions["record"] = comparisonRecords;
      aiOptions["mode"] = "analysis";
      
      const prompt = "${escapeStringForJXA(analysisPrompt)}";
      const aiResponse = theApp.getChatResponseForMessage(prompt, aiOptions);
      
      // Build result
      const result = {};
      result["success"] = true;
      result["operationType"] = "compare";
      result["analysisDepth"] = "${analysisDepth}";
      result["primaryRecord"] = recordInfo[0];
      result["comparedRecords"] = recordInfo.slice(1);
      result["engine"] = "${engine}";
      
      // Process AI response
      try {
        const parsedAnalysis = JSON.parse(aiResponse);
        result["results"] = parsedAnalysis;
      } catch (parseError) {
        result["results"] = {
          rawAnalysis: aiResponse,
          parseError: "Could not parse AI response as JSON"
        };
      }
      
      return JSON.stringify(result);
    `;

    return buildBaseAIScript('compare', scriptBody);
  }

  private getAnalysisPrompt(depth: string, includeRecommendations: boolean): string {
    const basePrompt = `Analyze the provided documents for similarities, differences, and relationships.`;
    
    const depthInstructions: Record<string, string> = {
      surface: `Focus on basic content overlap, shared keywords, and structural similarities.`,
      semantic: `Analyze semantic meaning, thematic connections, and conceptual relationships.`,
      deep: `Provide comprehensive analysis including semantic meaning, argumentation patterns, methodological approaches, and deeper conceptual frameworks.`
    };
    
    const outputStructure = `
    Return a JSON object with:
    {
      "overall_similarity": 0.85,
      "key_similarities": [{"aspect": "theme", "description": "Both discuss...", "confidence": 0.9}],
      "key_differences": [{"aspect": "approach", "description": "Document A uses...", "confidence": 0.8}],
      "thematic_overlap": ["theme1", "theme2"],
      "relationship_type": "complementary|contradictory|supplementary|independent",
      "insights": ["insight about the relationship"],
      ${includeRecommendations ? `"recommendations": ["actionable recommendation"],` : ''}
      "confidence_score": 0.87
    }
    `;
    
    return `${basePrompt} ${depthInstructions[depth]} ${outputStructure}`;
  }

  // Convert to MCP Tool
  toTool() {
    return createAITool(this.toolConfig);
  }
}

// Export the advanced tool
export const advancedDocumentComparatorTool = new AdvancedDocumentComparator().toTool();

// ============================================================================
// EXAMPLE 3: Using the convenience functions for quick tool creation
// ============================================================================

/**
 * Quick document summarizer using convenience functions
 */
export const quickSummarizerTool = (() => {
  // Import convenience utilities locally
  const { quickSetupAITool } = require('./index.js');
  const { buildSummarizeScript } = require('./aiScriptBuilder.js');
  
  return quickSetupAITool(
    'quick_summarize',
    'summarize',
    'Quickly summarize one or more documents with customizable output format',
    (input: any) => buildSummarizeScript(
      input.recordUuids || [],
      input.destinationGroupUuid,
      {
        engine: input.engine || 'ChatGPT',
        outputFormat: input.outputFormat || 'markdown',
        customOptions: {
          style: input.style || 'text summary',
          includeSourceReferences: input.includeSourceReferences !== false
        }
      }
    )
  );
})();

// ============================================================================
// Usage Examples and Integration Guide
// ============================================================================

/**
 * INTEGRATION EXAMPLE: Adding these tools to the main server
 * 
 * In src/devonthink.ts, you would add:
 * 
 * ```typescript
 * import { simpleAnalyzerTool, advancedDocumentComparatorTool, quickSummarizerTool } from './tools/ai/utils/EXAMPLE_TOOL.js';
 * 
 * const tools: Tool[] = [
 *   // ... existing tools
 *   simpleAnalyzerTool,
 *   advancedDocumentComparatorTool,
 *   quickSummarizerTool,
 * ];
 * ```
 */

/**
 * ERROR HANDLING EXAMPLE: How the infrastructure handles errors automatically
 * 
 * When a tool runs, the infrastructure automatically:
 * 1. Validates inputs using the schema and custom validators
 * 2. Checks AI service availability
 * 3. Executes the operation with proper error handling
 * 4. Processes results into standardized format
 * 5. Attempts recovery for retryable errors
 * 
 * Example error flow:
 * ```typescript
 * // User calls tool with invalid input
 * const result = await simpleAnalyzerTool.run({ invalidInput: true });
 * // Returns: { success: false, error: "Input validation failed: recordUuids is required for this operation" }
 * 
 * // User calls tool but DEVONthink not running  
 * const result = await simpleAnalyzerTool.run({ recordUuids: ['valid-uuid'] });
 * // Returns: { success: false, error: "DEVONthink is not running. Please start DEVONthink to use AI features." }
 * ```
 */

/**
 * TESTING EXAMPLE: How to test AI tools with the infrastructure
 * 
 * ```typescript
 * import { checkAIServiceAvailability, validateAIToolInput } from './ai/utils/index.js';
 * 
 * describe('AI Tool Testing', () => {
 *   beforeAll(async () => {
 *     const status = await checkAIServiceAvailability();
 *     if (!status.isAvailable) {
 *       console.warn('AI services not available for testing');
 *     }
 *   });
 *   
 *   it('should validate inputs correctly', () => {
 *     const validation = validateAIToolInput({ recordUuids: ['invalid'] }, 'analyze');
 *     expect(validation.isValid).toBe(false);
 *     expect(validation.errors[0].code).toBe('INVALID_UUID');
 *   });
 * });
 * ```
 */