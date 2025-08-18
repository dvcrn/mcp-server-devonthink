import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { type Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { escapeStringForJXA } from "../utils/escapeString.js";
import {
  checkAIServiceSimple,
  getSimpleStatusMessage,
  selectSimpleEngine,
} from "./ai/utils/simpleAIChecker.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Define the input schema using Zod
const GetChatResponseSchema = z
  .object({
    message: z.string().min(1).describe("The chat message or prompt to send to the AI"),
    recordUuids: z
      .array(z.string().uuid())
      .optional()
      .describe("UUIDs of records to use as context documents"),
    mode: z
      .enum(["append", "replace", "context"])
      .optional()
      .default("context")
      .describe("How to use record content: 'append' adds to message, 'replace' uses only record content, 'context' provides as reference"),
    imageData: z
      .string()
      .optional()
      .describe("Base64 encoded image data for analysis"),
    url: z
      .string()
      .url()
      .optional()
      .describe("URL for the AI to analyze"),
    model: z
      .string()
      .optional()
      .describe("Specific AI model to use (e.g., 'gpt-4', 'claude-3-sonnet')"),
    role: z
      .string()
      .optional()
      .describe("Chat role or persona for the AI (e.g., 'assistant', 'researcher', 'editor')"),
    engine: z
      .enum(["ChatGPT", "Claude", "Mistral AI", "GPT4All", "LM Studio", "Ollama", "Gemini"])
      .optional()
      .default("ChatGPT")
      .describe("AI engine to use"),
    temperature: z
      .number()
      .min(0)
      .max(2)
      .optional()
      .default(0.7)
      .describe("Response creativity level: 0 = deterministic/focused, 1 = balanced, 2 = creative/random"),
    outputFormat: z
      .enum(["text", "json", "markdown"])
      .optional()
      .default("text")
      .describe("Response format preference"),
  })
  .strict();

type GetChatResponseInput = z.infer<typeof GetChatResponseSchema>;

// Define the return type interface
interface GetChatResponseResult {
  success: boolean;
  response?: string | object;
  error?: string;
  usage?: {
    model?: string;
    engine?: string;
    contextRecords?: number;
  };
}

const getChatResponse = async (
  input: GetChatResponseInput
): Promise<GetChatResponseResult> => {
  const {
    message,
    recordUuids,
    mode = "context",
    imageData,
    url,
    model,
    role,
    engine = "ChatGPT",
    temperature = 0.7,
    outputFormat = "text",
  } = input;

  // Validate that we have either a message or records for context
  if (!message && (!recordUuids || recordUuids.length === 0)) {
    return {
      success: false,
      error: "Either 'message' or 'recordUuids' must be provided",
    };
  }

  // Simple, reliable AI service check (FIXES false "DEVONthink not running" errors)
  const aiStatus = await checkAIServiceSimple();
  
  if (!aiStatus.success || !aiStatus.devonthinkRunning) {
    return {
      success: false,
      error: getSimpleStatusMessage(aiStatus),
    };
  }
  
  // Select engine using simple, reliable logic
  const selectedEngine = selectSimpleEngine(aiStatus, engine);
  
  if (!selectedEngine) {
    // Check if user requested a specific engine that's not configured
    if (engine && !aiStatus.aiEnginesConfigured.includes(engine)) {
      // Provide helpful error message with alternatives
      const alternatives = aiStatus.aiEnginesConfigured.length > 0 
        ? `Available engines: ${aiStatus.aiEnginesConfigured.join(', ')}. Try using one of these instead, or `
        : "No AI engines are currently configured. ";
      
      return {
        success: false,
        error: `${engine} is not configured. ${alternatives}Set up ${engine} in DEVONthink > Preferences > AI (takes 2-3 minutes).`,
      };
    }
    
    // No engines configured at all
    return {
      success: false,
      error: "No AI engines configured. Please set up an AI engine in DEVONthink > Preferences > AI (takes 2-3 minutes).",
    };
  }

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        // Simple running check (SAME PATTERN AS WORKING TOOLS)
        if (!theApp.running()) {
          const errorResult = {};
          errorResult["success"] = false;
          errorResult["error"] = "DEVONthink is not running";
          return JSON.stringify(errorResult);
        }

        const pMessage = ${message ? `"${escapeStringForJXA(message)}"` : "null"};
        const pEngine = "${escapeStringForJXA(selectedEngine)}";
        const pTemperature = ${temperature};
        const pMode = "${mode}";
        const pOutputFormat = "${outputFormat}";
        
        // Build options object using bracket notation (JXA requirement)
        const options = {};
        options["engine"] = pEngine;
        
        if (pTemperature != null) {
          options["temperature"] = pTemperature;
        }
        
        ${model ? `options["model"] = "${escapeStringForJXA(model)}";` : ""}
        ${role ? `options["role"] = "${escapeStringForJXA(role)}";` : ""}
        
        // Handle output format preference
        if (pOutputFormat !== "text") {
          options["as"] = pOutputFormat;
        }
        
        // Add record context if provided
        ${
          recordUuids && recordUuids.length > 0
            ? `
        const contextRecords = [];
        let validRecordsCount = 0;
        ${recordUuids
          .map(
            (uuid, index) => `
        try {
          const record${index} = theApp.getRecordWithUuid("${uuid}");
          if (record${index}) {
            contextRecords.push(record${index});
            validRecordsCount++;
          }
        } catch (recordError) {
          // Continue processing other records
        }
        `
          )
          .join("")}
        
        if (contextRecords.length > 0) {
          options["record"] = contextRecords;
          options["mode"] = pMode;
        } else {
          const errorResult = {};
          errorResult["success"] = false;
          errorResult["error"] = "No valid records found with provided UUIDs";
          return JSON.stringify(errorResult);
        }
        `
            : ""
        }
        
        // Add image data if provided
        ${imageData ? `options["image"] = "${imageData}";` : ""}
        
        // Add URL if provided
        ${url ? `options["url"] = "${escapeStringForJXA(url)}";` : ""}
        
        // Make the AI request
        let response;
        if (pMessage) {
          response = theApp.getChatResponseForMessage(pMessage, options);
        } else {
          // If no message provided, use a default prompt for context analysis
          response = theApp.getChatResponseForMessage("Please analyze the provided content.", options);
        }
        
        // Build successful result
        const result = {};
        result["success"] = true;
        result["response"] = response;
        
        // Add usage information
        const usage = {};
        usage["engine"] = pEngine;
        usage["originalRequestedEngine"] = "${escapeStringForJXA(engine)}";
        ${model ? `usage["model"] = "${escapeStringForJXA(model)}";` : ""}
        ${
          recordUuids && recordUuids.length > 0
            ? `usage["contextRecords"] = validRecordsCount;`
            : ""
        }
        result["usage"] = usage;
        
        return JSON.stringify(result);
      } catch (error) {
        const errorResult = {};
        errorResult["success"] = false;
        errorResult["error"] = error.toString();
        return JSON.stringify(errorResult);
      }
    })();
  `;

  return await executeJxa<GetChatResponseResult>(script);
};

export const getChatResponseTool: Tool = {
  name: "get_chat_response",
  description: `Get an AI chat response using DEVONthink's built-in AI integration. This powerful tool enables:

• Document Analysis: Analyze and discuss documents in your database
• Research Assistance: Get AI insights on your research materials  
• Content Generation: Create summaries, outlines, and new content
• Multi-modal Analysis: Process text, images, and web URLs
• Contextual Chat: Use your documents as context for AI conversations

The tool supports multiple AI engines (ChatGPT, Claude, Gemini, etc.) and can work with:
- Text prompts and questions
- Document context from your database
- Images for visual analysis  
- Web URLs for content analysis
- Custom AI models and parameters

Example uses:
- "Summarize the key findings from these research papers"
- "What are the main themes in my project notes?"
- "Based on this data, what questions should I investigate next?"
- "Help me write a conclusion based on these documents"

Note: Requires DEVONthink Pro with AI features enabled and configured.`,
  inputSchema: zodToJsonSchema(GetChatResponseSchema) as ToolInput,
  run: getChatResponse,
};