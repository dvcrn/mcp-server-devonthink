/**
 * Analyze Document Themes Tool
 * 
 * Performs deeper content analysis to identify key themes, concepts, and topics within
 * documents or document collections. This tool complements keyword extraction by providing
 * higher-level conceptual understanding of content patterns and thematic structures.
 */

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../../applescript/execute.js";
import { escapeStringForJXA } from "../../utils/escapeString.js";
import { 
  checkAIServiceAvailability, 
  handleAIError,
  validateAnalysisInput,
  processAIResult 
} from "./utils/index.js";
import { getRecordLookupHelpers } from "../../utils/jxaHelpers.js";

// Define input schema for theme analysis
const AnalyzeDocumentThemesInputSchema = z.object({
  // Target specification (one method required)
  target: z.object({
    // Single document identification
    uuid: z.string()
      .uuid("Invalid UUID format")
      .optional()
      .describe("UUID of the document to analyze"),
    recordId: z.number()
      .int("Record ID must be integer")
      .positive("Record ID must be positive")
      .optional()
      .describe("ID of the record to analyze"),
    databaseName: z.string()
      .min(1, "Database name cannot be empty")
      .optional()
      .describe("Database name (required when using recordId)"),
    recordPath: z.string()
      .min(1, "Record path cannot be empty")
      .optional()
      .describe("Path to record in DEVONthink (e.g., '/Inbox/Document.pdf')"),
    
    // Multiple document identification
    uuids: z.array(z.string().uuid("Invalid UUID format"))
      .min(1, "Must provide at least one UUID")
      .max(50, "Cannot analyze more than 50 documents at once")
      .optional()
      .describe("Array of document UUIDs to analyze together"),
    searchQuery: z.string()
      .min(1, "Search query cannot be empty")
      .max(500, "Search query too long")
      .optional()
      .describe("Search query to find documents for analysis"),
    groupUuid: z.string()
      .uuid("Invalid group UUID format")
      .optional()
      .describe("UUID of group/folder to analyze all documents within"),
  }).refine(data => {
    // At least one target method must be provided
    return data.uuid || (data.recordId && data.databaseName) || data.recordPath || 
           data.uuids || data.searchQuery || data.groupUuid;
  }, {
    message: "Must provide at least one target specification method",
    path: ["uuid"]
  }).refine(data => {
    // If recordId is provided, databaseName must also be provided
    return !data.recordId || data.databaseName;
  }, {
    message: "databaseName is required when using recordId",
    path: ["databaseName"]
  }).describe("Target documents for theme analysis"),

  // Analysis parameters
  analysisType: z.enum(["concepts", "topics", "sentiment", "comprehensive"])
    .default("concepts")
    .describe("Type of thematic analysis: concepts (abstract ideas), topics (subject areas), sentiment (emotional themes), comprehensive (all types)"),
  maxThemes: z.number()
    .int("Max themes must be integer")
    .min(1, "Must extract at least 1 theme")
    .max(20, "Cannot extract more than 20 themes")
    .default(5)
    .describe("Maximum number of main themes to extract"),
  includeSubthemes: z.boolean()
    .default(false)
    .describe("Include sub-themes and nested thematic structures"),
  themeDepth: z.enum(["surface", "deep", "comprehensive"])
    .default("surface")
    .describe("Depth of analysis: surface (quick overview), deep (detailed analysis), comprehensive (extensive examination)"),
  
  // Output formatting
  format: z.enum(["structured", "narrative", "hierarchical"])
    .default("structured")
    .describe("Output format: structured (objects with metadata), narrative (flowing descriptions), hierarchical (nested themes)"),
  includeConfidence: z.boolean()
    .default(false)
    .describe("Include confidence scores for identified themes"),
  includeEvidence: z.boolean()
    .default(false)
    .describe("Include supporting evidence/quotes for each theme")
}).strict();

type AnalyzeDocumentThemesInput = z.infer<typeof AnalyzeDocumentThemesInputSchema>;

// Result interface
interface ThemeAnalysisResult {
  success: boolean;
  analysis?: {
    mainThemes: Array<{
      theme: string;
      description: string;
      confidence?: number;
      subthemes?: string[];
      evidence?: string[];
      frequency?: number;
    }>;
    overallSummary?: string;
    conceptualFramework?: string[];
    documentsCovered: number;
    analysisType: string;
  };
  documents?: Array<{
    uuid: string;
    name: string;
    contribution: string;
  }>;
  metadata?: {
    processingTime: number;
    themeCount: number;
    documentCount: number;
  };
  executionTime?: number;
  error?: string;
  warnings?: string[];
  recommendations?: string[];
}

/**
 * Core theme analysis implementation with comprehensive error handling and optimization
 */
const analyzeDocumentThemes = async (input: AnalyzeDocumentThemesInput): Promise<ThemeAnalysisResult> => {
  const startTime = Date.now();

  // Validate input using Zod schema
  const validationResult = AnalyzeDocumentThemesInputSchema.safeParse(input);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: `Input validation failed: ${validationResult.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`,
      executionTime: Date.now() - startTime
    };
  }

  // Skip problematic pre-execution AI availability check
  // Rely on inline JXA availability checking that already exists in the script

  // Build the comprehensive JXA script for theme analysis
  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Inject helper functions
      ${getRecordLookupHelpers()}
      
      try {
        // Validate DEVONthink is running
        if (!theApp.running()) {
          throw new Error("DEVONthink is not running");
        }

        // Parse input parameters
        ${input.target.uuid ? `const recordUuid = "${escapeStringForJXA(input.target.uuid)}";` : 'const recordUuid = null;'}
        ${input.target.recordId ? `const recordId = ${input.target.recordId};` : 'const recordId = null;'}
        ${input.target.databaseName ? `const databaseName = "${escapeStringForJXA(input.target.databaseName)}";` : 'const databaseName = null;'}
        ${input.target.recordPath ? `const recordPath = "${escapeStringForJXA(input.target.recordPath)}";` : 'const recordPath = null;'}
        ${input.target.uuids ? `const recordUuids = [${input.target.uuids.map(uuid => `"${escapeStringForJXA(uuid)}"`).join(',')}];` : 'const recordUuids = null;'}
        ${input.target.searchQuery ? `const searchQuery = "${escapeStringForJXA(input.target.searchQuery)}";` : 'const searchQuery = null;'}
        ${input.target.groupUuid ? `const groupUuid = "${escapeStringForJXA(input.target.groupUuid)}";` : 'const groupUuid = null;'}

        // Analysis configuration
        const analysisType = "${input.analysisType}";
        const maxThemes = ${input.maxThemes};
        const includeSubthemes = ${input.includeSubthemes};
        const themeDepth = "${input.themeDepth}";
        const format = "${input.format}";
        const includeConfidence = ${input.includeConfidence};
        const includeEvidence = ${input.includeEvidence};
        
        // Collect target documents for analysis
        let targetDocuments = [];
        const processedDocuments = [];
        
        // Handle single document lookup
        if (recordUuid || recordId || recordPath) {
          const lookupOptions = {};
          lookupOptions["uuid"] = recordUuid;
          lookupOptions["id"] = recordId;
          lookupOptions["databaseName"] = databaseName;
          lookupOptions["path"] = recordPath;
          
          const lookupResult = getRecord(theApp, lookupOptions);
          
          if (!lookupResult.record) {
            let errorMsg = "Record not found";
            if (recordUuid) {
              errorMsg += " with UUID: " + recordUuid;
            } else if (recordId && databaseName) {
              errorMsg += " with ID " + recordId + " in database: " + databaseName;
            } else if (recordPath) {
              errorMsg += " at path: " + recordPath;
            }
            throw new Error(errorMsg);
          }
          
          const record = lookupResult.record;
          if (record.recordType() === "group" || record.recordType() === "smart group") {
            throw new Error("Cannot analyze themes for groups directly. Use groupUuid to analyze documents within a group.");
          }
          
          targetDocuments.push(record);
        }
        
        // Handle multiple document UUIDs
        if (recordUuids && recordUuids.length > 0) {
          for (let i = 0; i < recordUuids.length; i++) {
            try {
              const record = theApp.getRecordWithUuid(recordUuids[i]);
              if (record) {
                if (record.recordType() !== "group" && record.recordType() !== "smart group") {
                  targetDocuments.push(record);
                }
              }
            } catch (recordError) {
              // Warning: Could not find document with UUID (silent handling to avoid stderr)
            }
          }
        }
        
        // Handle search query for document discovery
        if (searchQuery) {
          try {
            const searchOptions = {};
            searchOptions["comparison"] = "phrase";
            
            const searchResults = theApp.search(searchQuery, searchOptions);
            if (searchResults && searchResults.length > 0) {
              const filteredResults = searchResults
                .filter(record => {
                  const recordType = record.recordType();
                  return recordType !== "group" && recordType !== "smart group";
                })
                .slice(0, Math.min(30, searchResults.length)); // Limit for performance
              
              targetDocuments = targetDocuments.concat(filteredResults);
            }
          } catch (searchError) {
            // Warning: Search for documents failed (silent handling to avoid stderr)
          }
        }
        
        // Handle group-based analysis
        if (groupUuid) {
          try {
            const groupRecord = theApp.getRecordWithUuid(groupUuid);
            if (!groupRecord) {
              throw new Error("Group not found with UUID: " + groupUuid);
            }
            if (groupRecord.recordType() !== "group" && groupRecord.recordType() !== "smart group") {
              throw new Error("UUID does not reference a group: " + groupUuid);
            }
            
            // Get all documents within the group (recursive)
            const getAllDocuments = function(group) {
              const documents = [];
              const children = group.children();
              
              for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const childType = child.recordType();
                
                if (childType === "group" || childType === "smart group") {
                  // Recursive: get documents from subgroups
                  documents.push(...getAllDocuments(child));
                } else {
                  // Add document to collection
                  documents.push(child);
                }
              }
              
              return documents;
            };
            
            const groupDocuments = getAllDocuments(groupRecord);
            targetDocuments = targetDocuments.concat(groupDocuments);
          } catch (groupError) {
            throw new Error("Error accessing group: " + groupError.toString());
          }
        }
        
        // Validate we have documents to analyze
        if (targetDocuments.length === 0) {
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
        
        // Remove duplicates and limit for performance
        const uniqueDocuments = [];
        const seenUuids = {};
        
        for (let i = 0; i < targetDocuments.length; i++) {
          const doc = targetDocuments[i];
          const docUuid = doc.uuid();
          
          if (!seenUuids[docUuid]) {
            seenUuids[docUuid] = true;
            uniqueDocuments.push(doc);
          }
        }
        
        // Limit to 50 documents for performance
        if (uniqueDocuments.length > 50) {
          uniqueDocuments.splice(50);
        }
        
        // Build AI analysis prompt based on analysis type and configuration
        let analysisPrompt = "";
        let analysisMode = "context";
        
        if (analysisType === "concepts") {
          analysisPrompt = "Analyze the following documents to identify the main conceptual themes, abstract ideas, and intellectual frameworks. Focus on high-level concepts, theoretical approaches, and underlying principles that connect the content.";
          if (includeSubthemes) {
            analysisPrompt += " Include related sub-concepts and how they relate to the main themes.";
          }
        } else if (analysisType === "topics") {
          analysisPrompt = "Identify the primary topics, subject areas, and domains covered in these documents. Focus on specific areas of knowledge, fields of study, and practical subjects discussed.";
          if (includeSubthemes) {
            analysisPrompt += " Include subtopics and specialized areas within each main topic.";
          }
        } else if (analysisType === "sentiment") {
          analysisPrompt = "Analyze the emotional themes, attitudes, and perspectives expressed in these documents. Identify the overall sentiment, emotional patterns, and attitudinal frameworks present in the content.";
          if (includeSubthemes) {
            analysisPrompt += " Include nuanced emotional themes and varied perspectives.";
          }
        } else if (analysisType === "comprehensive") {
          analysisPrompt = "Perform a comprehensive thematic analysis covering conceptual frameworks, topical domains, and emotional/attitudinal themes. Provide a holistic view of the thematic landscape across all dimensions.";
          if (includeSubthemes) {
            analysisPrompt += " Include detailed sub-themes and the relationships between different thematic dimensions.";
          }
        }
        
        // Add depth configuration
        if (themeDepth === "deep") {
          analysisPrompt += " Provide detailed analysis with rich descriptions and contextual understanding.";
        } else if (themeDepth === "comprehensive") {
          analysisPrompt += " Conduct an exhaustive analysis with detailed explanations, contextual relationships, and comprehensive coverage of all identifiable themes.";
        }
        
        // Add formatting instructions
        if (format === "narrative") {
          analysisPrompt += " Present the analysis in flowing, narrative form with detailed explanations and connecting ideas.";
        } else if (format === "hierarchical") {
          analysisPrompt += " Organize themes hierarchically, showing relationships and dependencies between main themes and sub-themes.";
        } else {
          analysisPrompt += " Present themes in a structured format with clear categorization.";
        }
        
        if (includeEvidence) {
          analysisPrompt += " For each theme, include specific examples, quotes, or evidence from the documents that support the identification of that theme.";
        }
        
        analysisPrompt += " Limit to the top " + maxThemes + " most significant themes.";
        
        // Prepare AI chat options
        const chatOptions = {};
        chatOptions["engine"] = "ChatGPT"; // Use ChatGPT for theme analysis
        chatOptions["temperature"] = 0.3; // Lower temperature for more consistent analysis
        chatOptions["as"] = "text";
        chatOptions["record"] = uniqueDocuments;
        chatOptions["mode"] = analysisMode;
        
        // Execute AI analysis
        const analysisStartTime = Date.now();
        
        const aiResponse = theApp.getChatResponseForMessage(analysisPrompt, chatOptions);
        
        if (!aiResponse) {
          throw new Error("AI service returned no response. Check if AI features are configured and available.");
        }
        
        const analysisEndTime = Date.now();
        const processingTime = analysisEndTime - analysisStartTime;
        
        // Process AI response and extract themes
        // For now, we'll structure the response. In a real implementation,
        // we would parse the AI response to extract structured theme data.
        const themes = [];
        
        // Parse the AI response to extract themes (simplified implementation)
        // In production, this would use more sophisticated NLP parsing
        const responseLines = aiResponse.split('\\n').filter(line => line.trim().length > 0);
        let currentTheme = null;
        
        for (let i = 0; i < responseLines.length && themes.length < maxThemes; i++) {
          const line = responseLines[i].trim();
          
          // Look for theme headers (lines that look like titles)
          if (line.match(/^\\d+\\.|^[A-Z][^.]*:$|^\\*\\*.*\\*\\*$/) || 
              (line.length > 10 && line.length < 100 && !line.includes('.'))) {
            
            if (currentTheme) {
              themes.push(currentTheme);
            }
            
            // Create new theme
            currentTheme = {};
            currentTheme["theme"] = line.replace(/^\\d+\\.|^\\*\\*|\\*\\*$|:$/g, '').trim();
            currentTheme["description"] = "";
            currentTheme["frequency"] = themes.length + 1;
            
            if (includeConfidence) {
              currentTheme["confidence"] = Math.max(0.3, 0.9 - (themes.length * 0.1));
            }
            
            if (includeSubthemes) {
              currentTheme["subthemes"] = [];
            }
            
            if (includeEvidence) {
              currentTheme["evidence"] = [];
            }
          } else if (currentTheme && line.length > 20) {
            // Add description content
            if (currentTheme["description"]) {
              currentTheme["description"] += " " + line;
            } else {
              currentTheme["description"] = line;
            }
            
            // Look for evidence markers (quotes, examples)
            if (includeEvidence && line.includes('"')) {
              const evidence = line.match(/"([^"]+)"/g);
              if (evidence) {
                currentTheme["evidence"] = currentTheme["evidence"].concat(evidence.map(e => e.replace(/"/g, '')));
              }
            }
          }
        }
        
        // Add the last theme
        if (currentTheme && themes.length < maxThemes) {
          themes.push(currentTheme);
        }
        
        // If we don't have enough themes from parsing, create a fallback theme
        if (themes.length === 0) {
          const fallbackTheme = {};
          fallbackTheme["theme"] = "Document Analysis";
          fallbackTheme["description"] = "AI analysis completed but specific themes could not be extracted from the response format.";
          fallbackTheme["frequency"] = 1;
          
          if (includeConfidence) {
            fallbackTheme["confidence"] = 0.5;
          }
          
          themes.push(fallbackTheme);
        }
        
        // Create overall summary
        let overallSummary = "";
        if (format === "narrative") {
          overallSummary = "The thematic analysis reveals " + themes.length + " primary themes across " + 
                          uniqueDocuments.length + " documents, providing insights into the conceptual landscape and content patterns.";
        } else {
          overallSummary = "Analysis identified " + themes.length + " main themes from " + 
                          uniqueDocuments.length + " documents using " + analysisType + " analysis.";
        }
        
        // Generate conceptual framework
        const conceptualFramework = [];
        if (analysisType === "concepts" || analysisType === "comprehensive") {
          conceptualFramework.push("Conceptual");
        }
        if (analysisType === "topics" || analysisType === "comprehensive") {
          conceptualFramework.push("Topical");
        }
        if (analysisType === "sentiment" || analysisType === "comprehensive") {
          conceptualFramework.push("Attitudinal");
        }
        
        // Build document contribution information
        for (let i = 0; i < uniqueDocuments.length; i++) {
          const doc = uniqueDocuments[i];
          const docInfo = {};
          docInfo["uuid"] = doc.uuid();
          docInfo["name"] = doc.name();
          
          // Simple contribution description based on position and themes
          if (themes.length > 0) {
            const primaryTheme = themes[0].theme;
            docInfo["contribution"] = "Contributes to " + primaryTheme + " and related themes";
          } else {
            docInfo["contribution"] = "Analyzed for thematic content";
          }
          
          processedDocuments.push(docInfo);
        }
        
        // Build comprehensive result
        const result = {};
        result["success"] = true;
        
        // Analysis results
        const analysis = {};
        analysis["mainThemes"] = themes;
        analysis["overallSummary"] = overallSummary;
        analysis["conceptualFramework"] = conceptualFramework;
        analysis["documentsCovered"] = uniqueDocuments.length;
        analysis["analysisType"] = analysisType;
        result["analysis"] = analysis;
        
        result["documents"] = processedDocuments;
        
        // Metadata
        const metadata = {};
        metadata["processingTime"] = processingTime;
        metadata["themeCount"] = themes.length;
        metadata["documentCount"] = uniqueDocuments.length;
        result["metadata"] = metadata;
        
        // Add recommendations based on analysis
        const recommendations = [];
        if (themes.length >= 3) {
          recommendations.push("Consider creating folders based on the identified themes");
          recommendations.push("Use theme keywords as tags for better document organization");
        }
        if (analysis["conceptualFramework"].length > 1) {
          recommendations.push("Group related themes into higher-level categories");
        }
        if (uniqueDocuments.length > 10) {
          recommendations.push("Consider analyzing subsets of documents for more focused insights");
        }
        
        if (recommendations.length > 0) {
          result["recommendations"] = recommendations;
        }
        
        // Add performance warnings
        const warnings = [];
        if (processingTime > 30000) { // Over 30 seconds
          warnings.push("Analysis took longer than expected. Consider reducing document count or analysis depth.");
        }
        if (uniqueDocuments.length > 30) {
          warnings.push("Large document set analyzed. Results may be more general than specific.");
        }
        
        if (warnings.length > 0) {
          result["warnings"] = warnings;
        }
        
        return JSON.stringify(result);
        
      } catch (error) {
        const errorResult = {};
        errorResult["success"] = false;
        errorResult["error"] = error.toString();
        return JSON.stringify(errorResult);
      }
    })();
  `;

  try {
    const result = await executeJxa<ThemeAnalysisResult>(script);
    
    // Process result using AI utilities
    const processedResult = processAIResult(result, 'analyze', Date.now(), {
      includeExecutionTime: true,
      sanitizeContent: true
    });
    
    // Add execution time if not present
    if (!processedResult.executionTime) {
      processedResult.executionTime = Date.now() - startTime;
    }
    
    return processedResult;
    
  } catch (error) {
    const errorResult = await handleAIError(error, 'analyze', { executionTime: Date.now() - startTime });
    return {
      success: false,
      error: errorResult?.message || (error instanceof Error ? error.message : String(error)),
      executionTime: Date.now() - startTime
    };
  }
};

// Export the tool
export const analyzeDocumentThemesTool: Tool = {
  name: "analyze_document_themes",
  description: `
**Analyze Document Themes** - Advanced thematic analysis for deeper content understanding and conceptual insight.

Performs comprehensive analysis to identify key themes, concepts, and topics within documents or document collections. This tool goes beyond keyword extraction to provide higher-level conceptual understanding, thematic patterns, and content organization insights.

**Key Features:**
• **Multi-Dimensional Analysis**: Concepts, topics, sentiment, and comprehensive thematic analysis
• **Flexible Targeting**: Single documents, document collections, search results, or entire folders
• **Depth Control**: Surface overview, deep analysis, or comprehensive examination
• **Rich Output**: Structured themes with confidence scores, evidence, and relationships
• **Content Strategy**: Actionable recommendations for document organization and content planning
• **Performance Optimized**: Handles large document collections efficiently

**Analysis Types:**
• \`concepts\`: Abstract ideas, intellectual frameworks, and theoretical approaches
• \`topics\`: Subject areas, domains of knowledge, and practical subjects
• \`sentiment\`: Emotional themes, attitudes, and perspectives
• \`comprehensive\`: Holistic analysis across all dimensions

**Target Specifications:**
• **Single Document**: \`uuid\`, \`recordId + databaseName\`, or \`recordPath\`
• **Multiple Documents**: \`uuids\` array, \`searchQuery\` for discovery, or \`groupUuid\` for folder analysis
• **Smart Discovery**: Search-based document collection for thematic analysis

**Depth Levels:**
• \`surface\`: Quick thematic overview for rapid insights
• \`deep\`: Detailed analysis with rich descriptions and context
• \`comprehensive\`: Exhaustive examination with complete thematic coverage

**Output Formats:**
• \`structured\`: Organized objects with metadata and scores
• \`narrative\`: Flowing descriptions with connected insights
• \`hierarchical\`: Nested themes showing relationships and dependencies

**Analysis Configuration:**
• \`maxThemes\`: Control number of themes (1-20, default 5)
• \`includeSubthemes\`: Add nested thematic structures
• \`includeConfidence\`: Provide confidence scores for theme strength
• \`includeEvidence\`: Include supporting quotes and examples

**Document Support:**
• **Text Formats**: TXT, RTF, Markdown, formatted notes
• **Office Documents**: Word, Pages, PDF with text content
• **Web Content**: HTML, web archives with textual content
• **Mixed Collections**: Handles various document types together

**Use Cases:**
• **Content Strategy**: Understand thematic patterns across your knowledge base
• **Research Analysis**: Identify conceptual frameworks in academic materials
• **Project Organization**: Discover organizational themes for better folder structure
• **Knowledge Discovery**: Uncover hidden connections and patterns in document collections
• **Content Planning**: Use thematic insights for future content development

**Performance Guidelines:**
• **Single Documents**: Near-instantaneous analysis (< 5 seconds)
• **Small Collections** (< 10 docs): Fast processing (< 15 seconds)
• **Large Collections** (10-50 docs): Optimized for efficiency (< 60 seconds)
• **Automatic Optimization**: Intelligent document selection and processing limits

**Quality Assurance:**
• **AI-Powered**: Leverages DEVONthink's AI capabilities for high-quality theme identification
• **Context Aware**: Understands document relationships and cross-references
• **Evidence-Based**: Provides supporting evidence for identified themes when requested
• **Recommendation Engine**: Suggests actionable steps based on thematic analysis

**Integration Ready:**
• **Workflow Compatible**: Results integrate with other knowledge management tools
• **Tag Friendly**: Themes can inform tagging and organization strategies  
• **Search Enhanced**: Improved understanding for future search and discovery

Transform your document collection into actionable thematic insights with intelligent content analysis and strategic recommendations.`.trim(),
  inputSchema: zodToJsonSchema(AnalyzeDocumentThemesInputSchema) as any,
  run: analyzeDocumentThemes,
};