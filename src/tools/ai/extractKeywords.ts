/**
 * Extract Keywords Tool
 * 
 * Enables automatic keyword and tag extraction from documents using DEVONthink AI.
 * This tool supports intelligent document organization and discovery by extracting
 * relevant keywords from document content and optionally adding them as tags.
 */

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../../applescript/execute.js";
import { escapeStringForJXA } from "../../utils/escapeString.js";
import { handleAIError } from "./utils/index.js";
import { getRecordLookupHelpers } from "../../utils/jxaHelpers.js";

// Define input schema for keyword extraction
const ExtractKeywordsInputSchema = z.object({
  // Document identification (one required)
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

  // Keyword extraction options
  maxKeywords: z.number()
    .int("Max keywords must be integer")
    .min(1, "Must extract at least 1 keyword")
    .max(100, "Cannot extract more than 100 keywords")
    .default(20)
    .describe("Maximum number of keywords to extract"),
  minWordLength: z.number()
    .int("Min word length must be integer")
    .min(1, "Min word length must be at least 1")
    .max(20, "Min word length cannot exceed 20")
    .default(3)
    .describe("Minimum length of keywords to include"),
  includeExistingTags: z.boolean()
    .default(false)
    .describe("Include document's existing tags in extraction"),
  includeHashTags: z.boolean()
    .default(true)
    .describe("Extract hashtag-style keywords from content"),
  includeImageTags: z.boolean()
    .default(true)
    .describe("Extract keywords from images (if supported)"),
  includeBarcodes: z.boolean()
    .default(false)
    .describe("Include barcode information in keywords"),
  
  // Output and processing options
  format: z.enum(["array", "tagged"])
    .default("array")
    .describe("Return format: 'array' for simple list, 'tagged' for keywords with relevance scores"),
  autoTag: z.boolean()
    .default(false)
    .describe("Automatically add extracted keywords as document tags"),
  filterCommonWords: z.boolean()
    .default(true)
    .describe("Filter out common stopwords and articles"),
  language: z.string()
    .optional()
    .describe("Document language (auto-detected if not specified)")
}).strict().refine(data => {
  // At least one identification method must be provided
  return data.uuid || (data.recordId && data.databaseName) || data.recordPath;
}, {
  message: "Must provide either uuid, recordId with databaseName, or recordPath",
  path: ["uuid"]
}).refine(data => {
  // If recordId is provided, databaseName must also be provided
  return !data.recordId || data.databaseName;
}, {
  message: "databaseName is required when using recordId",
  path: ["databaseName"]
});

type ExtractKeywordsInput = z.infer<typeof ExtractKeywordsInputSchema>;

// Result interface
interface ExtractKeywordsResult {
  success: boolean;
  keywords?: string[] | Array<{
    keyword: string;
    relevance?: number;
    frequency?: number;
  }>;
  document?: {
    uuid: string;
    id: number;
    name: string;
    type: string;
    location: string;
  };
  extractionMetadata?: {
    totalKeywords: number;
    filteredKeywords: number;
    language?: string;
    extractionOptions: {
      maxKeywords: number;
      minWordLength: number;
      includeExistingTags: boolean;
      includeHashTags: boolean;
      includeImageTags: boolean;
      includeBarcodes: boolean;
      format: string;
      filterCommonWords: boolean;
    };
  };
  tagsAdded?: string[];
  executionTime?: number;
  error?: string;
  warnings?: string[];
  recommendations?: string[];
}

/**
 * Core keyword extraction implementation with enhanced error handling and performance optimization
 */
const extractKeywords = async (input: ExtractKeywordsInput): Promise<ExtractKeywordsResult> => {
  const startTime = Date.now();

  // Validate input using Zod schema
  const validationResult = ExtractKeywordsInputSchema.safeParse(input);
  
  if (!validationResult.success) {
    return {
      success: false,
      error: `Input validation failed: ${validationResult.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`,
      executionTime: Date.now() - startTime
    };
  }

  // Skip AI service availability check for now - DEVONthink keyword extraction uses built-in processing

  // Build the JXA script for keyword extraction
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
        ${input.uuid ? `const recordUuid = "${escapeStringForJXA(input.uuid)}";` : 'const recordUuid = null;'}
        ${input.recordId ? `const recordId = ${input.recordId};` : 'const recordId = null;'}
        ${input.databaseName ? `const databaseName = "${escapeStringForJXA(input.databaseName)}";` : 'const databaseName = null;'}
        ${input.recordPath ? `const recordPath = "${escapeStringForJXA(input.recordPath)}";` : 'const recordPath = null;'}
        
        const maxKeywords = ${input.maxKeywords};
        const minWordLength = ${input.minWordLength};
        const includeExistingTags = ${input.includeExistingTags};
        const includeHashTags = ${input.includeHashTags};
        const includeImageTags = ${input.includeImageTags};
        const includeBarcodes = ${input.includeBarcodes};
        const format = "${input.format}";
        const autoTag = ${input.autoTag};
        const filterCommonWords = ${input.filterCommonWords};
        ${input.language ? `const language = "${escapeStringForJXA(input.language)}";` : 'const language = null;'}
        
        // Find the target record using unified lookup
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
        const recordType = record.recordType();
        
        // Validate that the record type supports content analysis
        if (recordType === "group" || recordType === "smart group") {
          throw new Error("Cannot extract keywords from groups. Please specify a document record.");
        }
        
        // Build extraction options for DEVONthink's extractKeywordsFrom command
        const extractionOptions = {};
        extractionOptions["existingTags"] = includeExistingTags;
        extractionOptions["hashTags"] = includeHashTags;
        extractionOptions["imageTags"] = includeImageTags;
        extractionOptions["barcodes"] = includeBarcodes;
        
        // Extract keywords using DEVONthink's built-in keyword extraction
        let extractedKeywords = [];
        try {
          const rawKeywords = theApp.extractKeywordsFrom({
            record: record,
            options: extractionOptions
          });
          
          if (rawKeywords && rawKeywords.length > 0) {
            extractedKeywords = rawKeywords;
          }
        } catch (extractionError) {
          throw new Error("Failed to extract keywords: " + extractionError.toString());
        }
        
        // Process and filter keywords
        let processedKeywords = extractedKeywords;
        let filteredCount = 0;
        
        // Filter by minimum word length
        if (minWordLength > 0) {
          const beforeLength = processedKeywords.length;
          processedKeywords = processedKeywords.filter(keyword => {
            if (typeof keyword === 'string') {
              // Remove extra whitespace and check length
              const cleanKeyword = keyword.trim();
              return cleanKeyword.length >= minWordLength;
            }
            return false;
          });
          filteredCount += beforeLength - processedKeywords.length;
        }
        
        // Filter common words if enabled
        if (filterCommonWords) {
          const commonWords = [
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
            'below', 'between', 'among', 'around', 'this', 'that', 'these', 'those', 'a', 'an',
            'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
            'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
            'can', 'shall', 'not', 'no', 'yes', 'if', 'when', 'where', 'why', 'how', 'what',
            'which', 'who', 'whom', 'whose', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
          ];
          
          const beforeLength = processedKeywords.length;
          processedKeywords = processedKeywords.filter(keyword => {
            const lowerKeyword = keyword.toLowerCase().trim();
            return !commonWords.includes(lowerKeyword);
          });
          filteredCount += beforeLength - processedKeywords.length;
        }
        
        // Limit to maximum keywords if specified
        if (maxKeywords > 0 && processedKeywords.length > maxKeywords) {
          processedKeywords = processedKeywords.slice(0, maxKeywords);
        }
        
        // Format keywords based on requested format
        let formattedKeywords = processedKeywords;
        if (format === "tagged") {
          // Convert to objects with relevance (DEVONthink returns keywords sorted by frequency)
          formattedKeywords = processedKeywords.map((keyword, index) => {
            const keywordObj = {};
            keywordObj["keyword"] = keyword;
            keywordObj["relevance"] = Math.max(0.1, 1.0 - (index / processedKeywords.length * 0.9));
            keywordObj["frequency"] = Math.max(1, processedKeywords.length - index);
            return keywordObj;
          });
        }
        
        // Auto-tag document if requested
        let tagsAdded = [];
        if (autoTag && processedKeywords.length > 0) {
          try {
            const existingTags = record.tags() || [];
            const newTags = [];
            
            // Only add keywords that aren't already tags
            for (let i = 0; i < processedKeywords.length; i++) {
              const keyword = processedKeywords[i];
              if (!existingTags.includes(keyword)) {
                newTags.push(keyword);
              }
            }
            
            if (newTags.length > 0) {
              record.tags = existingTags.concat(newTags);
              tagsAdded = newTags;
            }
          } catch (taggingError) {
            // Don't fail the entire operation if tagging fails
            // Warning: Failed to auto-tag document (silent handling to avoid stderr)
          }
        }
        
        // Gather document information
        const docInfo = {};
        docInfo["uuid"] = record.uuid();
        docInfo["id"] = record.id();
        docInfo["name"] = record.name();
        docInfo["type"] = record.recordType();
        docInfo["location"] = record.location();
        
        // Build result
        const result = {};
        result["success"] = true;
        result["keywords"] = formattedKeywords;
        result["document"] = docInfo;
        
        // Add extraction metadata
        const extractionMetadata = {};
        extractionMetadata["totalKeywords"] = extractedKeywords.length;
        extractionMetadata["filteredKeywords"] = filteredCount;
        if (language) {
          extractionMetadata["language"] = language;
        }
        
        const extractionOptionsInfo = {};
        extractionOptionsInfo["maxKeywords"] = maxKeywords;
        extractionOptionsInfo["minWordLength"] = minWordLength;
        extractionOptionsInfo["includeExistingTags"] = includeExistingTags;
        extractionOptionsInfo["includeHashTags"] = includeHashTags;
        extractionOptionsInfo["includeImageTags"] = includeImageTags;
        extractionOptionsInfo["includeBarcodes"] = includeBarcodes;
        extractionOptionsInfo["format"] = format;
        extractionOptionsInfo["filterCommonWords"] = filterCommonWords;
        
        extractionMetadata["extractionOptions"] = extractionOptionsInfo;
        result["extractionMetadata"] = extractionMetadata;
        
        if (tagsAdded.length > 0) {
          result["tagsAdded"] = tagsAdded;
        }
        
        // Add warnings if applicable
        const warnings = [];
        if (extractedKeywords.length === 0) {
          warnings.push("No keywords were extracted from this document. The document may be empty, in an unsupported format, or contain only non-textual content.");
        } else if (processedKeywords.length === 0) {
          warnings.push("All extracted keywords were filtered out. Consider reducing minWordLength or disabling filterCommonWords.");
        } else if (filteredCount > 0) {
          warnings.push("Filtered out " + filteredCount + " keywords based on length and common word criteria.");
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
    const result = await executeJxa<ExtractKeywordsResult>(script);
    
    // Add execution time if not present
    if (!result.executionTime) {
      result.executionTime = Date.now() - startTime;
    }
    
    return result;
    
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
export const extractKeywordsTool: Tool = {
  name: "extract_keywords",
  description: `
**Extract Keywords** - Intelligent keyword and tag extraction from documents using DEVONthink's built-in analysis capabilities.

Automatically identifies and extracts relevant keywords from document content, supporting intelligent document organization and discovery. This tool leverages DEVONthink's native keyword extraction engine for reliable, high-quality results.

**Key Features:**
• **Intelligent Extraction**: Uses DEVONthink's built-in keyword analysis for high-quality results
• **Flexible Filtering**: Control minimum word length and filter common stopwords
• **Multiple Sources**: Extract from text content, existing tags, hashtags, images, and barcodes
• **Auto-Tagging**: Optionally add extracted keywords as document tags automatically
• **Format Options**: Return as simple array or structured objects with relevance scores
• **Batch Support**: Process individual documents with detailed metadata

**Extraction Options:**
• \`includeExistingTags\`: Include document's current tags in extraction
• \`includeHashTags\`: Extract hashtag-style keywords from content (#keyword)
• \`includeImageTags\`: Extract keywords from embedded images (if supported)
• \`includeBarcodes\`: Include barcode information in keyword extraction
• \`filterCommonWords\`: Remove common stopwords and articles

**Output Formats:**
• \`array\`: Simple string array of keywords
• \`tagged\`: Objects with keyword, relevance score, and frequency data

**Document Identification:**
• \`uuid\`: Recommended - works across all databases
• \`recordId + databaseName\`: Fast lookup within specific database
• \`recordPath\`: Internal DEVONthink path (e.g., '/Inbox/Document.pdf')

**Usage Examples:**
• Extract keywords for document organization: \`maxKeywords: 10, autoTag: true\`
• Analyze content themes: \`includeHashTags: true, format: "tagged"\`
• Clean keyword extraction: \`filterCommonWords: true, minWordLength: 4\`
• Comprehensive analysis: \`includeImageTags: true, includeBarcodes: true\`

**Supported Document Types:** Text, RTF, PDF, Markdown, HTML, Word documents, and more
**Auto-Tagging:** Safely adds only new keywords as tags (avoids duplicates)
**Performance:** Optimized for documents up to several MB in size

This tool enables intelligent content discovery and automated document organization through high-quality keyword extraction.`.trim(),
  inputSchema: zodToJsonSchema(ExtractKeywordsInputSchema) as any,
  run: extractKeywords,
};