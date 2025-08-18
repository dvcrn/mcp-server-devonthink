import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { type Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { escapeStringForJXA } from "../utils/escapeString.js";
import {
  checkAIServiceAvailability,
  getEngineConfigurationGuide,
} from "./ai/utils/aiAvailabilityChecker.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Define the input schema using Zod
const SummarizeContentsSchema = z
  .object({
    recordUuids: z
      .array(z.string().uuid())
      .min(1)
      .describe("UUIDs of records to summarize (at least one required)"),
    destinationGroupUuid: z
      .string()
      .uuid()
      .optional()
      .describe("UUID of group to create summary in (uses current group if not specified)"),
    format: z
      .enum(["markdown", "rich", "plain"])
      .default("markdown")
      .describe("Output format: 'markdown' for Markdown, 'rich' for rich text, 'plain' for plain text"),
    style: z
      .enum([
        "list summary",
        "key points summary", 
        "table summary",
        "text summary",
        "custom summary",
      ])
      .default("text summary")
      .describe("Summary style: how the content should be organized and presented"),
    name: z
      .string()
      .optional()
      .describe("Custom name for the summary record (auto-generated if not provided)"),
    includeSourceReferences: z
      .boolean()
      .default(true)
      .describe("Include links and references to source documents"),
    maxLength: z
      .number()
      .min(50)
      .max(5000)
      .optional()
      .describe("Approximate maximum length in words (AI will attempt to stay within this limit)"),
    createDocument: z
      .boolean()
      .default(false)
      .describe("Create a summary document in DEVONthink (default: false, returns text only)"),
  })
  .strict();

type SummarizeContentsInput = z.infer<typeof SummarizeContentsSchema>;

// Define the return type interface
interface SummarizeContentsResult {
  success: boolean;
  summaryText?: string;          // Text-only result when createDocument is false
  summaryUuid?: string;          // Document result when createDocument is true
  summaryId?: number;
  summaryName?: string;
  summaryLocation?: string;
  sourceRecords?: Array<{
    uuid: string;
    name: string;
    location: string;
  }>;
  error?: string;
  wordCount?: number;
  mode?: 'text' | 'document';    // Indicates which mode was used
}

const summarizeContents = async (
  input: SummarizeContentsInput
): Promise<SummarizeContentsResult> => {
  const {
    recordUuids,
    destinationGroupUuid,
    format = "markdown",
    style = "text summary",
    name,
    includeSourceReferences = true,
    maxLength,
    createDocument = false,
  } = input;

  // Check AI service availability before attempting summarization
  const aiStatus = await checkAIServiceAvailability();
  
  if (!aiStatus.isAvailable) {
    return {
      success: false,
      error: aiStatus.error || "AI services are not available for summarization",
    };
  }
  
  if (aiStatus.availableEngines.length === 0) {
    return {
      success: false,
      error: "No AI engines are configured. Summarization requires at least one configured AI service.",
    };
  }

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        // Validate DEVONthink is running
        if (!theApp.running()) {
          const errorResult = {};
          errorResult["success"] = false;
          errorResult["error"] = "DEVONthink is not running";
          return JSON.stringify(errorResult);
        }

        // Get records to summarize
        const records = [];
        const sourceRecordInfo = [];
        let validRecordsCount = 0;
        
        ${recordUuids
          .map(
            (uuid, index) => `
        try {
          const record${index} = theApp.getRecordWithUuid("${uuid}");
          if (record${index}) {
            records.push(record${index});
            
            // Store source record information
            const recordInfo = {};
            recordInfo["uuid"] = record${index}.uuid();
            recordInfo["name"] = record${index}.name();
            recordInfo["location"] = record${index}.location();
            sourceRecordInfo.push(recordInfo);
            
            validRecordsCount++;
          }
        } catch (recordError) {
          // Continue with other records
        }
        `
          )
          .join("")}
        
        if (records.length === 0) {
          const errorResult = {};
          errorResult["success"] = false;
          errorResult["error"] = "No valid records found with provided UUIDs";
          return JSON.stringify(errorResult);
        }
        
        const createDocument = ${createDocument};
        
        // Handle text-only mode vs document creation mode
        if (!createDocument) {
          // Text-only mode: Use getChatResponseForMessage for summary
          try {
            let summaryPrompt = "Summarize the content from these documents";
            
            // Add style instruction
            if ("${style}" !== "text summary") {
              summaryPrompt += " as a ${style}";
            }
            
            // Add format instruction
            if ("${format}" === "markdown") {
              summaryPrompt += " in Markdown format";
            } else if ("${format}" === "rich") {
              summaryPrompt += " in rich text format";
            } else {
              summaryPrompt += " in plain text format";
            }
            
            // Add length constraint if specified
            ${maxLength ? `summaryPrompt += " (approximately ${maxLength} words)";` : ''}
            
            const chatOptions = {};
            chatOptions["engine"] = "ChatGPT";
            chatOptions["temperature"] = 0.3;
            chatOptions["as"] = "text";
            chatOptions["record"] = records;
            chatOptions["mode"] = "context";
            
            const summaryText = theApp.getChatResponseForMessage(summaryPrompt, chatOptions);
            
            if (!summaryText || summaryText.length === 0) {
              const errorResult = {};
              errorResult["success"] = false;
              errorResult["error"] = "Failed to generate summary text. Check if AI features are configured and available.";
              return JSON.stringify(errorResult);
            }
            
            // Add source references if requested
            let finalSummaryText = summaryText;
            ${
              includeSourceReferences
                ? `
            let references = "\\n\\n---\\n\\n## Source Documents\\n\\n";
            sourceRecordInfo.forEach((info, index) => {
              references += (index + 1) + ". **" + info.name + "** (" + info.location + ")\\n";
            });
            finalSummaryText += references;
            `
                : ""
            }
            
            // Build text-only result
            const result = {};
            result["success"] = true;
            result["mode"] = "text";
            result["summaryText"] = finalSummaryText;
            
            // Add source record information
            ${includeSourceReferences ? `result["sourceRecords"] = sourceRecordInfo;` : ""}
            
            return JSON.stringify(result);
            
          } catch (textError) {
            const errorResult = {};
            errorResult["success"] = false;
            errorResult["error"] = "Failed to generate summary text: " + textError.toString();
            return JSON.stringify(errorResult);
          }
        } else {
          // Document creation mode: Use original summarizeContentsOf approach
          
          // Get destination group (inbox for document creation)
          let destinationGroup = null;
          ${
            destinationGroupUuid
              ? `
          try {
            destinationGroup = theApp.getRecordWithUuid("${destinationGroupUuid}");
            if (!destinationGroup) {
              const errorResult = {};
              errorResult["success"] = false;
              errorResult["error"] = "Destination group not found with UUID: ${destinationGroupUuid}";
              return JSON.stringify(errorResult);
            }
          } catch (groupError) {
            const errorResult = {};
            errorResult["success"] = false;
            errorResult["error"] = "Error accessing destination group: " + groupError.toString();
            return JSON.stringify(errorResult);
          }
          `
              : `
          // Use database inbox as default for document creation
          try {
            const currentDb = theApp.currentDatabase();
            if (currentDb) {
              // Try to find inbox group
              const inboxGroup = currentDb.incomingGroup();
              if (inboxGroup) {
                destinationGroup = inboxGroup;
              } else {
                // Fallback to database root
                destinationGroup = currentDb.root();
              }
            }
          } catch (dbError) {
            destinationGroup = theApp.currentGroup();
            if (!destinationGroup) {
              destinationGroup = theApp.currentDatabase().root();
            }
          }
          `
          }
        
          // Build summarization options using bracket notation
          const summaryOptions = {};
          summaryOptions["records"] = records;
          summaryOptions["to"] = "${format}";
          
          // Add style if not default
          ${style !== "text summary" ? `summaryOptions["as"] = "${style}";` : ""}
          
          // Add destination group
          if (destinationGroup) {
            summaryOptions["in"] = destinationGroup;
          }
          
          // Execute summarization
          const summary = theApp.summarizeContentsOf(summaryOptions);
          
          if (!summary) {
            const errorResult = {};
            errorResult["success"] = false;
            errorResult["error"] = "Failed to create summary document. This usually means AI services aren't properly configured or have reached usage limits. Check DEVONthink > Preferences > AI to verify your AI service setup.";
            return JSON.stringify(errorResult);
          }
        
          // Apply custom name if provided
          ${
            name
              ? `
          try {
            summary.name = "${escapeStringForJXA(name)}";
          } catch (nameError) {
            // Continue even if naming fails
          }
          `
              : ""
          }
          
          // Add source references if requested
          ${
            includeSourceReferences
              ? `
          try {
            let currentContent = summary.plainText();
            if (!currentContent) currentContent = "";
            
            // Add source references section
            let references = "\\n\\n---\\n\\n## Source Documents\\n\\n";
            sourceRecordInfo.forEach((info, index) => {
              references += (index + 1) + ". **" + info.name + "** (" + info.location + ")\\n";
            });
            
            // Update content based on format
            ${
              format === "markdown"
                ? `
            if (summary.plainText !== undefined) {
              summary.plainText = currentContent + references;
            }
            `
                : format === "rich"
                ? `
            if (summary.richText !== undefined) {
              summary.richText = currentContent + references;
            }
            `
                : `
            if (summary.plainText !== undefined) {
              summary.plainText = currentContent + references;
            }
            `
            }
          } catch (refError) {
            // Continue even if adding references fails
          }
          `
              : ""
          }
          
          // Build document creation result
          const result = {};
          result["success"] = true;
          result["mode"] = "document";
          result["summaryUuid"] = summary.uuid();
          result["summaryId"] = summary.id();
          result["summaryName"] = summary.name();
          result["summaryLocation"] = summary.location();
          
          // Add source record information
          ${includeSourceReferences ? `result["sourceRecords"] = sourceRecordInfo;` : ""}
          
          // Add word count if available
          try {
            const wordCount = summary.wordCount();
            if (wordCount && wordCount > 0) {
              result["wordCount"] = wordCount;
            }
          } catch (wcError) {
            // Word count not critical
          }
          
          return JSON.stringify(result);
        }
      } catch (error) {
        const errorResult = {};
        errorResult["success"] = false;
        errorResult["error"] = error.toString();
        return JSON.stringify(errorResult);
      }
    })();
  `;

  return await executeJxa<SummarizeContentsResult>(script);
};

export const summarizeContentsTool: Tool = {
  name: "summarize_contents",
  description: `Create intelligent summaries of documents using DEVONthink's AI capabilities with flexible output options.

This tool analyzes and synthesizes content from multiple documents using DEVONthink's built-in AI, with two distinct modes:

**Text Mode (Default)**: Returns summary text directly without creating documents
**Document Mode**: Creates summary documents in DEVONthink with full metadata

**Core Features:**
• **Dual Output Modes**: Text-only results or document creation with explicit control
• **Multi-document Analysis**: Synthesize content from multiple source documents  
• **Flexible Formats**: Markdown, rich text, or plain text output
• **Multiple Styles**: Lists, key points, tables, or narrative summaries
• **Source Tracking**: Automatic references to source documents
• **Smart Placement**: Document mode creates summaries in database inbox

**Output Modes:**
• **createDocument: false** (default): Returns summary text only, no document created
• **createDocument: true**: Creates summary document in DEVONthink's inbox with full metadata

**Summary Styles:**
• "list summary": Bullet-point format highlighting key items
• "key points summary": Structured takeaways and insights  
• "table summary": Organized tabular format for easy scanning
• "text summary": Narrative paragraph format (default)
• "custom summary": AI determines optimal format for content

**Use Cases:**
• **Quick Analysis**: Get summary text without cluttering database (createDocument: false)
• **Research Synthesis**: Create permanent summary documents for reference (createDocument: true)
• **Meeting Notes**: Consolidate meeting documentation with source links
• **Project Overview**: Generate comprehensive project summaries
• **Literature Review**: Synthesize key points from research articles
• **Report Generation**: Create executive summaries from source materials

**Document Placement:**
When createDocument is true, summaries are created in the database inbox for organized storage and easy retrieval.

**Performance Notes:**
• Text mode is faster and doesn't affect database organization
• Document mode provides persistent storage and better integration
• Large document sets may take time to process regardless of mode

Requires DEVONthink Pro with AI features enabled and configured.`,
  inputSchema: zodToJsonSchema(SummarizeContentsSchema) as ToolInput,
  run: summarizeContents,
};