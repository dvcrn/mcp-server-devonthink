import { z } from "zod";
import { createDevonThinkTool } from "../base/DevonThinkTool.js";

const AskAiAboutDocumentsSchema = z.object({
  documentUuids: z.array(z.string()).min(1).describe("UUIDs of documents to analyze"),
  question: z.string().min(1).max(10000).describe("The question to ask about the records"),
  temperature: z.number().min(0).max(2).default(0.7).describe("Response creativity (0-2, default: 0.7)"),
  model: z.string().optional().describe("Specific AI model to use"),
  engine: z.enum(["ChatGPT", "Claude", "Mistral AI", "GPT4All", "LM Studio", "Ollama", "Gemini"]).optional().default("ChatGPT").describe("AI engine to use (default: ChatGPT)"),
}).strict();

export const askAiAboutDocumentsTool = createDevonThinkTool({
  name: "ask_ai_about_documents",
  description: "Ask AI questions about specific DEVONthink documents for analysis, comparison, or extraction.",

  inputSchema: AskAiAboutDocumentsSchema,
  buildScript: (input, helpers) => {
    const { documentUuids, question, temperature, model, engine } = input;
    
    return helpers.wrapInTryCatch(`
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Check if DEVONthink is running
      if (!theApp.running()) {
        const result = {};
        result["success"] = false;
        result["error"] = "DEVONthink is not running";
        return JSON.stringify(result);
      }
      
      const records = [];
      const recordObjects = [];
      const errors = [];
      
      // Collect all records
      for (const uuid of ${helpers.formatValue(documentUuids)}) {
        try {
          const record = theApp.getRecordWithUuid(uuid);
          if (record) {
            recordObjects.push(record);
            records.push({
              uuid: record.uuid(),
              name: record.name(),
              type: record.type()
            });
          } else {
            errors.push("Record not found: " + uuid);
          }
        } catch (e) {
          errors.push("Error accessing record " + uuid + ": " + e.toString());
        }
      }
      
      if (records.length === 0) {
        const result = {};
        result["success"] = false;
        result["error"] = "No valid records found: " + errors.join(", ");
        return JSON.stringify(result);
      }
      
      // Build chat options - engine is REQUIRED for API to work
      const chatOptions = {};
      chatOptions["record"] = recordObjects;
      chatOptions["temperature"] = ${temperature};
      // Default to ChatGPT engine if not specified - API requires this
      chatOptions["engine"] = ${engine ? helpers.formatValue(engine) : '"ChatGPT"'};
      chatOptions["mode"] = "context"; // Required when passing records
      ${model ? `chatOptions["model"] = ${helpers.formatValue(model)};` : ''}
      
      // Get AI response
      let aiResponse;
      try {
        aiResponse = theApp.getChatResponseForMessage(${helpers.formatValue(question)}, chatOptions);
        
        if (!aiResponse || aiResponse.length === 0) {
          throw new Error("AI service returned empty response");
        }
        
      } catch (aiError) {
        const result = {};
        result["success"] = false;
        result["error"] = "AI analysis failed: " + aiError.toString();
        return JSON.stringify(result);
      }
      
      const result = {};
      result["success"] = true;
      result["response"] = aiResponse;
      result["recordsAnalyzed"] = records.length;
      result["records"] = records;
      
      if (errors.length > 0) {
        result["warnings"] = errors;
      }
      
      return JSON.stringify(result);
    `);
  }
});