/**
 * Check AI Status Tool
 * 
 * Provides detailed information about AI service availability and configuration
 * in DEVONthink, helping users understand what engines are ready to use.
 */

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { checkAIServiceSimple } from "./utils/simpleAIChecker.js";
import { executeJxa } from "../../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Define simplified input schema for AI status check
const CheckAIStatusInputSchema = z.object({
  engine: z.string()
    .optional()
    .describe("Test only this specific engine (e.g., 'ChatGPT', 'Claude', 'Gemini', 'Mistral AI'). If not specified, tests all engines."),
}).strict();

type CheckAIStatusInput = z.infer<typeof CheckAIStatusInputSchema>;

// Simplified result interface
interface CheckAIStatusResult {
  success: boolean;
  workingEngines: Array<{
    engine: string;
    status: "working" | "failed";
    model?: string;
    error?: string;
  }>;
  summary: string;
  devonthinkRunning: boolean;
  aiAvailable: boolean;
  setupInstructions?: string;
  lastChecked: string;
}

/**
 * Check AI status with honest testing - only report working engines
 */
const checkAIStatus = async (input: CheckAIStatusInput): Promise<CheckAIStatusResult> => {
  const { engine: specificEngine } = input;

  try {
    // First, get simple status to see what's configured
    const simpleStatus = await checkAIServiceSimple();
    
    if (!simpleStatus.success) {
      return {
        success: false,
        workingEngines: [],
        summary: "❌ Failed to check AI status",
        devonthinkRunning: false,
        aiAvailable: false,
        lastChecked: new Date().toISOString()
      };
    }
    
    if (!simpleStatus.devonthinkRunning) {
      return {
        success: true,
        workingEngines: [],
        summary: "❌ DEVONthink is not running - please start DEVONthink",
        devonthinkRunning: false,
        aiAvailable: false,
        lastChecked: new Date().toISOString()
      };
    }
    
    // Get engines to test
    const enginesToTest = specificEngine ? 
      (simpleStatus.aiEnginesConfigured.includes(specificEngine) ? [specificEngine] : []) :
      simpleStatus.aiEnginesConfigured;
      
    if (specificEngine && enginesToTest.length === 0) {
      return {
        success: false,
        workingEngines: [],
        summary: `❌ Engine '${specificEngine}' not configured. Available: ${simpleStatus.aiEnginesConfigured.join(', ') || 'none'}`,
        devonthinkRunning: true,
        aiAvailable: true,
        lastChecked: new Date().toISOString()
      };
    }
    
    // Now actually test each configured engine
    const workingEngines = [];
    
    for (const engine of enginesToTest) {
      try {
        // Use the same approach as getChatResponse - simple test query
        const testResult = await testEngine(engine);
        
        if (testResult.success) {
          workingEngines.push({
            engine,
            status: "working" as const,
            model: testResult.model
          });
        } else {
          workingEngines.push({
            engine,
            status: "failed" as const,
            error: testResult.error || "Authentication failed or not properly configured"
          });
        }
      } catch (error) {
        workingEngines.push({
          engine,
          status: "failed" as const,
          error: `Test failed: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }
    
    // Generate honest summary
    const working = workingEngines.filter(e => e.status === "working");
    const failed = workingEngines.filter(e => e.status === "failed");
    
    let summary: string;
    let setupInstructions: string | undefined;
    
    if (working.length === 0 && simpleStatus.aiEnginesConfigured.length === 0) {
      summary = "❌ No AI engines configured";
      setupInstructions = "Set up an AI engine in DEVONthink > Preferences > AI. ChatGPT is fastest to configure (~2 minutes).";
    } else if (working.length === 0) {
      summary = "❌ No working AI engines found";
      setupInstructions = "Configured engines need valid API keys. Check DEVONthink > Preferences > AI.";
    } else if (failed.length === 0) {
      const engineNames = working.map(e => e.engine).join(", ");
      summary = `✅ Working: ${engineNames}`;
    } else {
      const workingNames = working.map(e => e.engine).join(", ");
      const failedNames = failed.map(e => e.engine).join(", ");
      summary = `✅ Working: ${workingNames} | ❌ Need setup: ${failedNames}`;
      setupInstructions = "Failed engines need API keys in DEVONthink > Preferences > AI";
    }

    return {
      success: true,
      workingEngines,
      summary,
      devonthinkRunning: true,
      aiAvailable: true,
      ...(setupInstructions && { setupInstructions }),
      lastChecked: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      workingEngines: [],
      summary: "❌ Failed to check AI status",
      devonthinkRunning: false,
      aiAvailable: false,
      lastChecked: new Date().toISOString()
    };
  }
};

/**
 * Test a specific engine with minimal request using the same method as getChatResponse
 */
async function testEngine(engine: string): Promise<{ success: boolean; model?: string; error?: string }> {
  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        // Build options object using bracket notation (JXA requirement)
        const options = {};
        options["engine"] = "${engine}";
        options["temperature"] = 0;
        
        // Try a minimal chat request (using the same method as getChatResponse)
        const result = theApp.getChatResponseForMessage("Hi", options);
        
        if (result && result.length > 0) {
          // Try to get the model info if available
          let modelName = "default";
          try {
            const models = theApp.getChatModelsForEngine("${engine}");
            if (models && models.length > 0) {
              modelName = models[0];
            }
          } catch (modelError) {
            // Continue with default model name
          }
          
          return JSON.stringify({
            success: true,
            model: modelName
          });
        } else {
          return JSON.stringify({
            success: false,
            error: "No response from ${engine}"
          });
        }
        
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })()
  `;
  
  try {
    return await executeJxa<{ success: boolean; model?: string; error?: string }>(script);
  } catch (error) {
    return {
      success: false,
      error: `Script execution failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Export the tool
export const checkAIStatusTool: Tool = {
  name: "check_ai_status",
  description: `
**Check AI Status** - Find out which AI engines actually work in DEVONthink.

This tool tests each AI engine by sending a minimal request to verify it's truly working, not just configured. It shows you exactly what's ready to use.

**What it does:**
• Tests ChatGPT, Claude, Gemini, and Mistral AI with actual API calls
• Shows which engines are working vs. failed
• Provides setup instructions for non-working engines
• Uses minimal requests to avoid consuming credits

**Usage:**
• Default: \`{}\` - Tests all AI engines
• Specific engine: \`{"engine": "Claude"}\` - Test only Claude
• Supported engines: "ChatGPT", "Claude", "Gemini", "Mistral AI"

**Example outputs:**
\`\`\`
✅ Working: ChatGPT | ❌ Failed: Claude, Gemini
\`\`\`
\`\`\`
✅ All engines working: ChatGPT, Claude
\`\`\`
\`\`\`
❌ No working AI engines found
\`\`\`

**Why use this:**
• Eliminates confusion about "configured" vs. actually working engines
• Quick verification before running AI tasks  
• Clear guidance on what needs to be set up
• Tests with minimal API usage

Use this tool to get a reliable answer to "What AI engines does DEVONthink support?" - it will tell you exactly what's working right now.`.trim(),
  inputSchema: zodToJsonSchema(CheckAIStatusInputSchema) as any,
  run: checkAIStatus,
};