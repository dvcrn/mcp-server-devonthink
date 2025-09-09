import { z } from "zod";
import { createDevonThinkTool } from "../base/DevonThinkTool.js";
import { AI_ENGINES } from "./constants.js";

/**
 * Input schema for the AI health check tool
 */
const CheckAIHealthSchema = z.object({}).strict();

interface AIHealthResult {
  success: boolean;
  devonthinkRunning: boolean;
  aiAvailable: boolean;
  chatCapable: boolean;
  configuredEngines: string[];
  workingEngines: Array<{
    engine: string;
    status: "working" | "failed";
    model?: string;
    error?: string;
  }>;
  summary: string;
  setupInstructions?: string;
  timestamp: string;
}

/**
 * Check if DEVONthink's AI services are available and working
 * Performs a simple test to verify AI functionality
 */
export const checkAIHealthTool = createDevonThinkTool({
  name: "check_ai_health",
  description: "Check if DEVONthink's AI services are available and working properly.",
  inputSchema: CheckAIHealthSchema,
  buildScript: (input, helpers) => {
    return helpers.wrapInTryCatch(`
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      const result = {};
      result["success"] = true;
      result["timestamp"] = new Date().toISOString();
      
      // Check if DEVONthink is running (following proven isRunning.ts pattern)
      if (!theApp.running()) {
        result["devonthinkRunning"] = false;
        result["aiAvailable"] = false;
        result["summary"] = "❌ DEVONthink is not running";
        result["workingEngines"] = [];
        return JSON.stringify(result);
      }
      
      result["devonthinkRunning"] = true;
      
      // Test engines using DEVONthink's actual API (following ai-support pattern)
      const testEngines = ${helpers.formatValue(AI_ENGINES)};
      const configuredEngines = [];
      const workingEngines = [];
      
      // First pass: Check which engines have models configured
      for (const engine of testEngines) {
        try {
          const models = theApp.getChatModelsForEngine(engine);
          if (models && models.length > 0) {
            configuredEngines.push(engine);
            
            // Second pass: Actually test the engine with minimal request
            try {
              // Build options object using bracket notation (JXA requirement)
              const testOptions = {};
              testOptions["engine"] = engine;
              testOptions["temperature"] = 0;
              
              // Try minimal chat request - this will fail if API key is invalid
              const testResponse = theApp.getChatResponseForMessage("Hi", testOptions);
              
              if (testResponse && testResponse.length > 0) {
                const engineResult = {};
                engineResult["engine"] = engine;
                engineResult["status"] = "working";
                engineResult["model"] = models[0];
                workingEngines.push(engineResult);
              } else {
                // Handle empty AI service responses as failures
                const engineResult = {};
                engineResult["engine"] = engine;
                engineResult["status"] = "failed";
                engineResult["error"] = "AI service returned empty response";
                workingEngines.push(engineResult);
              }
            } catch (testErr) {
              const engineResult = {};
              engineResult["engine"] = engine;
              engineResult["status"] = "failed";
              engineResult["error"] = testErr.toString();
              workingEngines.push(engineResult);
            }
          }
        } catch (configError) {
          // Engine not configured - this is expected, not an error
        }
      }
      
      result["configuredEngines"] = configuredEngines;
      result["workingEngines"] = workingEngines;
      
      // Generate user-friendly summary
      const working = workingEngines.filter(e => e.status === "working");
      const failed = workingEngines.filter(e => e.status === "failed");
      
      let summary;
      let setupInstructions;
      
      if (configuredEngines.length === 0) {
        summary = "❌ No AI engines configured";
        setupInstructions = "Set up an AI engine in DEVONthink > Preferences > AI. ChatGPT is fastest to configure (~2 minutes).";
      } else if (working.length === 0) {
        summary = "❌ No working AI engines found";
        setupInstructions = "Configured engines need valid API keys. Check DEVONthink > Preferences > AI.";
      } else if (failed.length === 0) {
        const workingNames = working.map(e => e.engine).join(", ");
        summary = "✅ Working: " + workingNames;
      } else {
        const workingNames = working.map(e => e.engine).join(", ");
        const failedNames = failed.map(e => e.engine).join(", ");
        summary = "✅ Working: " + workingNames + " | ❌ Need setup: " + failedNames;
        setupInstructions = "Failed engines need API keys in DEVONthink > Preferences > AI";
      }
      
      result["summary"] = summary;
      if (setupInstructions) {
        result["setupInstructions"] = setupInstructions;
      }
      
      result["aiAvailable"] = configuredEngines.length > 0;
      result["chatCapable"] = working.length > 0;
      
      return JSON.stringify(result);
    `);
  }
});