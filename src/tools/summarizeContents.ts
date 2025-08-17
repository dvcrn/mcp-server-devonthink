import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
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
  })
  .strict();

type SummarizeContentsInput = z.infer<typeof SummarizeContentsSchema>;

// Define the return type interface
interface SummarizeContentsResult {
  success: boolean;
  summaryUuid?: string;
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
        
        // Get destination group
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
        // Use current group as default
        destinationGroup = theApp.currentGroup();
        if (!destinationGroup) {
          destinationGroup = theApp.currentDatabase().root();
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
          errorResult["error"] = "Failed to create summary. This usually means AI services aren't properly configured or have reached usage limits. Check DEVONthink > Preferences > AI to verify your AI service setup.";
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
        
        // Build successful result
        const result = {};
        result["success"] = true;
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
  description: `Create an intelligent summary of one or more documents using DEVONthink's AI capabilities.

This tool uses DEVONthink's built-in AI to analyze and synthesize content from multiple documents, creating coherent summaries that capture key information, themes, and insights.

Key Features:
• Multi-document analysis: Summarize content from multiple records
• Flexible output formats: Markdown, rich text, or plain text
• Multiple summary styles: Lists, key points, tables, or narrative text
• Source tracking: Automatically includes references to source documents
• Smart organization: Places summaries in appropriate groups

Summary Styles:
- "list summary": Bullet-point format highlighting key items
- "key points summary": Structured key takeaways and insights  
- "table summary": Organized in table format for easy scanning
- "text summary": Narrative paragraph format (default)
- "custom summary": AI determines best format for content

Use Cases:
• Research synthesis: "Summarize findings from these research papers"
• Meeting consolidation: "Create summary of meeting notes from this week"
• Project overview: "Summarize all documents in this project folder"
• Literature review: "Synthesize key points from these articles"
• Report generation: "Create executive summary from quarterly reports"

The tool automatically creates a new record containing the summary and can include references back to source documents for easy navigation.

Note: Requires DEVONthink Pro with AI features enabled and configured. Large document sets may take time to process.`,
  inputSchema: zodToJsonSchema(SummarizeContentsSchema) as ToolInput,
  run: summarizeContents,
};