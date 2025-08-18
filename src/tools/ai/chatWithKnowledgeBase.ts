/**
 * Chat with Knowledge Base Tool
 * 
 * Enables conversational queries across the user's entire DEVONthink document collection.
 * This flagship AI tool demonstrates the full power of intelligent knowledge management
 * by providing natural language access to documents and their content.
 */

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { type Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../../applescript/execute.js";
import {
  escapeSearchQuery,
  escapeStringForJXA,
} from "../../utils/escapeString.js";
import {
  getRecordLookupHelpers,
  getDatabaseHelper,
  isGroupHelper,
} from "../../utils/jxaHelpers.js";
import {
  checkAIServiceSimple,
  getSimpleStatusMessage,
  selectSimpleEngine,
} from "./utils/simpleAIChecker.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Define input schema for chat with knowledge base
const ChatWithKnowledgeBaseInputSchema = z.object({
  query: z.string()
    .min(1, "Query cannot be empty")
    .max(10000, "Query too long (max 10,000 characters)")
    .describe("The conversational query to ask about your knowledge base"),
  
  scope: z.object({
    groupUuid: z.string()
      .uuid("Invalid group UUID format")
      .optional()
      .describe("Search within specific group/folder"),
    groupPath: z.string()
      .min(1, "Group path cannot be empty")
      .optional()
      .describe("Search within specific group by path (e.g., '/Projects/2024')"),
    databaseName: z.string()
      .min(1, "Database name cannot be empty")
      .optional()
      .describe("Limit to specific database"),
  }).optional().describe("Optional search scope to limit conversation context"),
  
  maxResults: z.number()
    .int("Max results must be integer")
    .min(1, "Must include at least 1 result")
    .max(50, "Cannot exceed 50 results")
    .default(10)
    .describe("Maximum number of documents to include in conversation context"),
  
  includeMetadata: z.boolean()
    .default(true)
    .describe("Include document metadata in conversation context"),
  
  engine: z.enum(["ChatGPT", "Claude", "Gemini", "Mistral AI", "GPT4All", "LM Studio", "Ollama"] as const)
    .optional()
    .describe("AI engine to use for conversation (auto-detected if not specified)"),
  
  model: z.string()
    .optional()
    .describe("Specific AI model to use (if supported by engine)"),
  
  temperature: z.number()
    .min(0, "Temperature cannot be negative")
    .max(2, "Temperature cannot exceed 2")
    .default(0.7)
    .describe("AI response creativity (0=focused, 1=balanced, 2=creative)"),
  
  mode: z.enum(["context", "direct", "summarize"] as const)
    .default("context")
    .describe("How to use found documents: context (background info), direct (analyze specific docs), summarize (create summary)"),
  
  outputFormat: z.enum(["text", "markdown", "html"] as const)
    .default("markdown")
    .describe("Format for the AI response")
}).strict();

type ChatWithKnowledgeBaseInput = z.infer<typeof ChatWithKnowledgeBaseInputSchema>;

// Result interface
interface ChatWithKnowledgeBaseResult {
  success: boolean;
  response?: string;
  sourceDocuments?: Array<{
    uuid: string;
    id: number;
    name: string;
    location: string;
    type: string;
    relevance?: number;
  }>;
  conversationContext?: {
    query: string;
    scope?: string;
    documentsFound: number;
    documentsUsed: number;
  };
  aiMetadata?: {
    engine: string;
    model?: string;
    temperature: number;
    outputFormat: string;
    mode: string;
  };
  // Enhanced diagnostics for debugging search issues
  searchDiagnostics?: {
    searchQuery: string;
    searchScope: string;
    searchComparison: string;
    searchError?: string;
    rawSearchResults: number;
    filteredResults: number;
    scopeResolutionMethod?: string;
    targetDatabase?: string;
  };
  executionTime?: number;
  error?: string;
  warnings?: string[];
  recommendations?: string[];
}

/**
 * Core chat implementation following simple working tool pattern
 */
const chatWithKnowledgeBase = async (input: ChatWithKnowledgeBaseInput): Promise<ChatWithKnowledgeBaseResult> => {
  const {
    query,
    scope,
    maxResults = 10,
    includeMetadata = true,
    engine: requestedEngine,
    model,
    temperature = 0.7,
    mode = "context",
    outputFormat = "markdown"
  } = input;

  // Simple, reliable AI service check (FIXES false "DEVONthink not running" errors)
  const aiStatus = await checkAIServiceSimple();
  
  // Clear error messaging without JXA leakage
  if (!aiStatus.success) {
    return {
      success: false,
      error: getSimpleStatusMessage(aiStatus),
      recommendations: ["Check that DEVONthink is running and AI features are enabled"]
    };
  }
  
  if (!aiStatus.devonthinkRunning) {
    return {
      success: false,
      error: "DEVONthink is not running. Please start DEVONthink to use AI features.",
      recommendations: ["Start the DEVONthink application"]
    };
  }
  
  // Select engine using simple, reliable logic
  const engine = selectSimpleEngine(aiStatus, requestedEngine);
  
  if (!engine) {
    // Check if user requested a specific engine that's not configured
    if (requestedEngine && !aiStatus.aiEnginesConfigured.includes(requestedEngine)) {
      // Provide helpful error message with alternatives
      const alternatives = aiStatus.aiEnginesConfigured.length > 0 
        ? `Available engines: ${aiStatus.aiEnginesConfigured.join(', ')}. Try using one of these instead, or `
        : "No AI engines are currently configured. ";
      
      return {
        success: false,
        error: `${requestedEngine} is not configured. ${alternatives}Set up ${requestedEngine} in DEVONthink > Preferences > AI (takes 2-3 minutes).`,
        recommendations: [
          ...(aiStatus.aiEnginesConfigured.length > 0 ? [`Use one of the available engines: ${aiStatus.aiEnginesConfigured.join(', ')}`] : []),
          `Configure ${requestedEngine}: Get API key from the provider's website`,
          "Setup takes about 2-3 minutes"
        ]
      };
    }
    
    // No engines configured at all
    return {
      success: false,
      error: "No AI engines configured. Please set up an AI engine in DEVONthink > Preferences > AI (takes 2-3 minutes).",
      recommendations: [
        "Configure ChatGPT: Get API key from platform.openai.com",
        "Configure Claude: Get API key from console.anthropic.com",
        "Both setups take about 2-3 minutes each"
      ]
    };
  }
  
  const selectedModel = model; // Use provided model or let DEVONthink choose default

  // Escape the search query using proven working pattern
  const escapedQuery = escapeSearchQuery(query);

  // Build the JXA script for conversational knowledge base query
  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Inject helper functions - CRITICAL for proper database object handling
      ${getRecordLookupHelpers()}
      ${getDatabaseHelper}
      ${isGroupHelper}
      
      try {
        // Simple running check (SAME PATTERN AS WORKING TOOLS)
        if (!theApp.running()) {
          const errorResult = {};
          errorResult["success"] = false;
          errorResult["error"] = "DEVONthink is not running";
          return JSON.stringify(errorResult);
        }
        
        // Parse input parameters
        const pQuery = ${query ? `"${escapeStringForJXA(query)}"` : "null"};
        const pMaxResults = ${maxResults};
        const pIncludeMetadata = ${includeMetadata};
        const pEngine = "${escapeStringForJXA(engine)}";
        ${selectedModel ? `const pModel = "${escapeStringForJXA(selectedModel)}";` : 'const pModel = null;'}
        const pTemperature = ${temperature};
        const pMode = "${mode}";
        const pOutputFormat = "${outputFormat}";
        
        // Parse scope parameters
        ${scope?.groupUuid ? `const scopeGroupUuid = "${escapeStringForJXA(scope.groupUuid)}";` : 'const scopeGroupUuid = null;'}
        ${scope?.groupPath ? `const scopeGroupPath = "${escapeStringForJXA(scope.groupPath)}";` : 'const scopeGroupPath = null;'}
        ${scope?.databaseName ? `const scopeDatabaseName = "${escapeStringForJXA(scope.databaseName)}";` : 'const scopeDatabaseName = null;'}
        
        // Get target database using proven working helper (FIXES "Can't convert types" error)
        let targetDatabase;
        try {
          targetDatabase = getDatabase(theApp, scopeDatabaseName);
        } catch (dbError) {
          const errorResult = {};
          errorResult["success"] = false;
          errorResult["error"] = dbError.toString();
          return JSON.stringify(errorResult);
        }
        
        if (!targetDatabase) {
          const errorResult = {};
          errorResult["success"] = false;
          errorResult["error"] = "No database available for search";
          return JSON.stringify(errorResult);
        }
        
        // Initialize search diagnostics with enhanced detail
        const searchDiagnostics = {};
        searchDiagnostics["searchQuery"] = pQuery;
        searchDiagnostics["searchComparison"] = "default (no comparison parameter)";
        searchDiagnostics["actualQuery"] = pQuery; // Track actual query used
        
        // Get scope group using proven working pattern (FIXES object conversion issues)
        let scopeGroup = null;
        let scopeResolutionMethod = "database";
        
        if (scopeGroupUuid || scopeGroupPath) {
          // Use proven working lookup pattern from search.ts
          const lookupOptions = {};
          lookupOptions["uuid"] = scopeGroupUuid;
          lookupOptions["path"] = scopeGroupPath;
          lookupOptions["database"] = targetDatabase;
          
          const lookupResult = getRecord(theApp, lookupOptions);
          
          if (!lookupResult.record) {
            let errorDetails = lookupResult.error || "Group not found";
            if (scopeGroupUuid) {
              errorDetails = "Group with UUID not found: " + scopeGroupUuid;
              scopeResolutionMethod = "uuid";
            } else if (scopeGroupPath) {
              errorDetails = "Group at path not found: " + scopeGroupPath;
              scopeResolutionMethod = "path";
            }
            throw new Error(errorDetails);
          }
          
          scopeGroup = lookupResult.record;
          scopeResolutionMethod = lookupResult.method;
          
          // Verify it's a group
          if (!isGroup(scopeGroup)) {
            const recordType = scopeGroup.recordType();
            throw new Error("Specified record is not a group. Type: " + recordType);
          }
        }
        
        searchDiagnostics["scopeResolutionMethod"] = scopeResolutionMethod;
        searchDiagnostics["targetDatabase"] = targetDatabase.name();
        
        // Track search parameters for debugging
        const searchParameters = {};
        searchParameters["maxResults"] = pMaxResults;
        searchParameters["includeMetadata"] = pIncludeMetadata;
        searchParameters["mode"] = pMode;
        searchDiagnostics["searchParameters"] = searchParameters;
        
        // Build search scope (FIXED: only groups can be used as search scope)
        let searchScope = null;
        if (scopeGroup) {
          searchScope = scopeGroup;
          searchDiagnostics["searchScope"] = "group: " + scopeGroup.name() + " (UUID: " + scopeGroup.uuid() + ")";
        } else {
          // Search all databases when no group specified (like search.ts pattern)
          searchScope = null;
          searchDiagnostics["searchScope"] = "all databases (no group scope specified)";
        }
        
        // Build search options using exact search.ts working pattern (FIXED: removed invalid comparison)
        const searchOptions = {};
        if (searchScope) {
          searchOptions["in"] = searchScope;
        }
        // No comparison parameter - DEVONthink uses default comparison (removed "phrase" which is invalid)
        
        // Perform initial search to find relevant documents with full diagnostics
        let relevantRecords = [];
        let rawSearchResults = 0;
        let searchError = null;
        
        let searchResults;
        try {
          // Use EXACT same pattern as working search.ts - direct template literal call
          searchResults = theApp.search("${escapedQuery}", searchOptions);
        } catch (searchErr) {
          // Capture search error for diagnostics instead of silent handling
          searchError = searchErr.toString();
          rawSearchResults = 0;
          searchResults = null;
        }
        
        if (searchResults && searchResults.length > 0) {
          rawSearchResults = searchResults.length;
          
          // Limit to maxResults and filter to content-bearing documents
          for (let i = 0; i < searchResults.length && relevantRecords.length < pMaxResults; i++) {
            const record = searchResults[i];
            const recordType = record.recordType();
            if (recordType !== "group" && recordType !== "smart group") {
              relevantRecords.push(record);
            }
          }
        } else {
          rawSearchResults = 0;
        }
        
        // Update search diagnostics with comprehensive results
        searchDiagnostics["rawSearchResults"] = rawSearchResults;
        searchDiagnostics["filteredResults"] = relevantRecords.length;
        if (searchError) {
          searchDiagnostics["searchError"] = searchError;
        }
        
        // Add object type resolution details
        if (scopeGroup) {
          const scopeDetails = {};
          scopeDetails["type"] = "group";
          scopeDetails["name"] = scopeGroup.name();
          scopeDetails["uuid"] = scopeGroup.uuid();
          searchDiagnostics["scopeObject"] = scopeDetails;
        } else {
          const dbDetails = {};
          dbDetails["type"] = "database";
          dbDetails["name"] = targetDatabase.name();
          dbDetails["path"] = targetDatabase.path();
          searchDiagnostics["scopeObject"] = dbDetails;
        }
        
        // Track filtering statistics
        const filterStats = {};
        filterStats["groupsExcluded"] = rawSearchResults - relevantRecords.length;
        filterStats["documentsIncluded"] = relevantRecords.length;
        searchDiagnostics["filterStats"] = filterStats;
        
        // Build AI chat options using bracket notation (JXA requirement)
        const chatOptions = {};
        chatOptions["engine"] = pEngine;
        if (pModel) chatOptions["model"] = pModel;
        chatOptions["temperature"] = pTemperature;
        chatOptions["as"] = pOutputFormat;
        
        // Add documents to chat context if found
        let conversationPrompt = pQuery;
        const sourceDocuments = [];
        
        if (relevantRecords.length > 0) {
          // Build context information about found documents
          const documentInfo = [];
          
          for (let i = 0; i < relevantRecords.length; i++) {
            const record = relevantRecords[i];
            try {
              const docInfo = {};
              docInfo["uuid"] = record.uuid();
              docInfo["id"] = record.id();
              docInfo["name"] = record.name();
              docInfo["location"] = record.location();
              docInfo["type"] = record.recordType();
              
              sourceDocuments.push(docInfo);
              
              if (pIncludeMetadata) {
                let metaInfo = "Document: " + record.name();
                metaInfo += " (Type: " + record.recordType() + ")";
                metaInfo += " (Location: " + record.location() + ")";
                
                // Add creation date if available
                try {
                  const creationDate = record.creationDate();
                  if (creationDate) {
                    metaInfo += " (Created: " + creationDate.toISOString().split('T')[0] + ")";
                  }
                } catch (e) {
                  // Ignore date error
                }
                
                documentInfo.push(metaInfo);
              }
            } catch (recordError) {
              // Continue with other records
              // Note: Record error is handled silently to avoid stderr contamination
            }
          }
          
          // Modify conversation prompt based on mode
          if (pMode === "context") {
            if (pIncludeMetadata && documentInfo.length > 0) {
              conversationPrompt = "Context: I have found the following relevant documents in my knowledge base:\\n" +
                documentInfo.join("\\n") + "\\n\\n" +
                "Based on this context, please answer: " + pQuery;
            }
            
            // Add records for AI to access content
            chatOptions["record"] = relevantRecords;
            chatOptions["mode"] = "context";
            
          } else if (pMode === "direct") {
            chatOptions["record"] = relevantRecords;
            chatOptions["mode"] = "direct";
            
            conversationPrompt = "Please analyze the following documents and answer: " + pQuery;
            
          } else if (pMode === "summarize") {
            chatOptions["record"] = relevantRecords;
            chatOptions["mode"] = "summarize";
            
            conversationPrompt = "Please summarize the key information from these documents relevant to: " + pQuery;
          }
        } else {
          // No specific documents found, ask general question
          conversationPrompt = "From my knowledge base, " + pQuery;
          
          // Search across entire scope
          if (scopeGroup) {
            chatOptions["record"] = [scopeGroup];
            chatOptions["mode"] = "context";
          } else {
            // Use current database as context
            try {
              const dbRoot = targetDatabase.root();
              chatOptions["record"] = [dbRoot];
              chatOptions["mode"] = "context";
            } catch (rootError) {
              // Continue without specific context
            }
          }
        }
        
        // Execute AI chat request
        const aiResponse = theApp.getChatResponseForMessage(conversationPrompt, chatOptions);
        
        if (!aiResponse) {
          const errorResult = {};
          errorResult["success"] = false;
          
          // Enhanced configuration guidance using smart detection
          const configMessage = "AI service returned no response. This usually means " + pEngine + " isn't properly configured or has reached usage limits.";
          
          errorResult["error"] = configMessage;
          errorResult["recommendations"] = [
            "Check " + pEngine + " configuration in DEVONthink > Preferences > AI",
            "Verify API key is valid and has available credits/quota",
            "Test with a simpler query to isolate the issue",
            "Try a different AI engine if available"
          ];
          
          return JSON.stringify(errorResult);
        }
        
        // Build result
        const result = {};
        result["success"] = true;
        result["response"] = aiResponse;
        result["sourceDocuments"] = sourceDocuments;
        
        // Add conversation context
        const conversationContext = {};
        conversationContext["query"] = pQuery;
        if (scopeGroupUuid || scopeGroupPath || scopeDatabaseName) {
          const scopeDesc = [];
          if (scopeDatabaseName) scopeDesc.push("Database: " + scopeDatabaseName);
          if (scopeGroupPath) scopeDesc.push("Path: " + scopeGroupPath);
          if (scopeGroupUuid) scopeDesc.push("Group: " + scopeGroupUuid);
          conversationContext["scope"] = scopeDesc.join(", ");
        }
        conversationContext["documentsFound"] = relevantRecords.length;
        conversationContext["documentsUsed"] = relevantRecords.length;
        result["conversationContext"] = conversationContext;
        
        // Add AI metadata
        const aiMetadata = {};
        aiMetadata["engine"] = pEngine;
        aiMetadata["engineSelected"] = "Selected " + pEngine;
        if (pModel) aiMetadata["model"] = pModel;
        aiMetadata["temperature"] = pTemperature;
        aiMetadata["outputFormat"] = pOutputFormat;
        aiMetadata["mode"] = pMode;
        result["aiMetadata"] = aiMetadata;
        
        // Add search diagnostics for debugging
        result["searchDiagnostics"] = searchDiagnostics;
        
        return JSON.stringify(result);
        
      } catch (error) {
        const errorResult = {};
        errorResult["success"] = false;
        errorResult["error"] = error.toString();
        return JSON.stringify(errorResult);
      }
    })();
  `;

  return await executeJxa<ChatWithKnowledgeBaseResult>(script);
};

// Export the tool
export const chatWithKnowledgeBaseTool: Tool = {
  name: "chat_with_knowledge_base",
  description: `
**Chat with Knowledge Base** - The flagship AI tool for conversational access to your entire document collection.

Ask natural language questions and get intelligent responses based on your DEVONthink documents. This tool searches your knowledge base, finds relevant documents, and uses them as context for AI-powered conversations.

**Key Features:**
• **Natural Conversations**: Ask questions in plain language about any topic in your documents
• **Smart Context**: Automatically finds and uses relevant documents to inform responses
• **Flexible Scope**: Search across entire database, specific folders, or document collections
• **Multiple Modes**: Context-aware responses, direct document analysis, or summarization
• **Rich Metadata**: Includes source documents and conversation context in results

**Conversation Modes:**
• \`context\`: Uses documents as background knowledge (default)
• \`direct\`: Directly analyzes specific documents
• \`summarize\`: Creates summaries of relevant information

**Scope Options:**
• No scope: Search entire current database
• \`groupUuid\`: Limit to specific folder by UUID
• \`groupPath\`: Limit to folder by path (e.g., '/Projects/2024')
• \`databaseName\`: Limit to specific database

**Usage Examples:**
• "What are the key findings from my research on climate change?"
• "Summarize the main points from my meeting notes this month"
• "What projects am I working on that involve machine learning?"
• "Find information about budget allocations in my financial documents"

**AI Engines:** Auto-detected (ChatGPT, Claude, Gemini, Mistral AI, GPT4All, LM Studio, Ollama)
**Response Formats:** Text, Markdown, HTML
**Prerequisites:** DEVONthink Pro with AI features enabled

This tool transforms your document collection into an intelligent, conversational knowledge assistant.`.trim(),
  inputSchema: zodToJsonSchema(ChatWithKnowledgeBaseInputSchema) as any,
  run: chatWithKnowledgeBase,
};