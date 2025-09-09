import { z } from "zod";
import { createDevonThinkTool } from "../base/DevonThinkTool.js";
import { AI_ENGINES } from "./constants.js";

const AskAiAboutDocumentsSchema = z.object({
  documentUuids: z.array(z.string()).min(1).describe("UUIDs of documents to analyze"),
  question: z.string().min(1).max(10000).describe("The question to ask about the records"),
  temperature: z.number().min(0).max(2).default(0.7).describe("Response creativity (0-2, default: 0.7)"),
  model: z.string().optional().describe("Specific AI model to use"),
  engine: z.enum(AI_ENGINES).optional().default("ChatGPT").describe("AI engine to use (default: ChatGPT)"),
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
        ${helpers.returnError("DEVONthink is not running")}
      }
      
      ${helpers.buildRecordCollectionScript(documentUuids)}
      
      // Build chat options - engine is REQUIRED for API to work
      const chatOptions = {};
      chatOptions["record"] = recordObjects;
      chatOptions["temperature"] = ${temperature};
      // Engine is REQUIRED for API to work (default already applied by Zod)
      chatOptions["engine"] = ${helpers.formatValue(engine)};
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
        ${helpers.returnError("AI analysis failed: " + "aiError.toString()")}
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