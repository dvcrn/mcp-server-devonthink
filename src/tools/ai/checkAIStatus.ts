/**
 * Check AI Status Tool
 * 
 * Provides detailed information about AI service availability and configuration
 * in DEVONthink, helping users understand what engines are ready to use.
 */

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import {
  checkAIServiceAvailability,
  getAIServiceInfo,
  getEngineConfigurationGuide,
  selectBestEngine,
} from "./utils/aiAvailabilityChecker.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Define input schema for AI status check
const CheckAIStatusInputSchema = z.object({
  includeModels: z.boolean()
    .default(true)
    .describe("Include available models for each engine"),
  
  includeConfiguration: z.boolean()
    .default(true)
    .describe("Include configuration guidance for unconfigured engines"),
  
  testOperation: z.enum(["chat", "summarize", "classify", "compare"] as const)
    .optional()
    .describe("Test which engine would be selected for a specific operation type"),
    
  forceRefresh: z.boolean()
    .default(false)
    .describe("Force refresh of AI status cache")
}).strict();

type CheckAIStatusInput = z.infer<typeof CheckAIStatusInputSchema>;

// Result interface
interface CheckAIStatusResult {
  success: boolean;
  isAvailable: boolean;
  devonthinkRunning: boolean;
  aiFeatureEnabled: boolean;
  configuredEngines: Array<{
    engine: string;
    isConfigured: boolean;
    models: string[];
    capabilities?: string[];
  }>;
  unconfiguredEngines: Array<{
    engine: string;
    configurationGuide: string;
  }>;
  recommendedEngine?: {
    engine: string;
    model?: string;
    reason: string;
  };
  summary: string;
  lastChecked: string;
  error?: string;
  warnings?: string[];
}

/**
 * Check AI status and provide detailed information
 */
const checkAIStatus = async (input: CheckAIStatusInput): Promise<CheckAIStatusResult> => {
  const {
    includeModels = true,
    includeConfiguration = true,
    testOperation,
    forceRefresh = false
  } = input;

  try {
    // Get comprehensive AI service information
    const serviceInfo = await getAIServiceInfo();
    const status = serviceInfo.status;
    const engines = serviceInfo.engines;
    
    // Separate configured and unconfigured engines
    const configuredEngines = engines
      .filter(engine => engine.isConfigured)
      .map(engine => ({
        engine: engine.engine,
        isConfigured: true,
        models: includeModels ? (engine.models || []) : [],
        ...(engine.capabilities && { capabilities: engine.capabilities })
      }));
      
    const unconfiguredEngines = engines
      .filter(engine => !engine.isConfigured)
      .map(engine => ({
        engine: engine.engine,
        configurationGuide: includeConfiguration ? 
          getEngineConfigurationGuide(engine.engine) : 
          `Configure ${engine.engine} in DEVONthink > Preferences > AI`
      }));
    
    // Test engine selection for operation if requested
    let recommendedEngine;
    if (testOperation) {
      const selection = await selectBestEngine(undefined, testOperation);
      if (selection.success && selection.engine) {
        recommendedEngine = {
          engine: selection.engine,
          model: selection.model,
          reason: selection.message
        };
      }
    }
    
    // Generate summary
    let summary: string;
    if (!status.devonthinkRunning) {
      summary = "❌ DEVONthink is not running";
    } else if (!status.aiFeatureEnabled) {
      summary = "⚠️ AI features are not available (requires DEVONthink Pro)";
    } else if (configuredEngines.length === 0) {
      summary = "⚠️ No AI engines configured - setup required";
    } else {
      const engineNames = configuredEngines.map(e => e.engine).join(', ');
      summary = `✅ ${configuredEngines.length} AI engine(s) ready: ${engineNames}`;
    }

    return {
      success: true,
      isAvailable: status.isAvailable,
      devonthinkRunning: status.devonthinkRunning,
      aiFeatureEnabled: status.aiFeatureEnabled,
      configuredEngines,
      unconfiguredEngines,
      ...(recommendedEngine && { recommendedEngine }),
      summary,
      lastChecked: status.lastChecked,
      ...(status.error && { error: status.error }),
      ...(status.warnings.length > 0 && { warnings: status.warnings })
    };
    
  } catch (error) {
    return {
      success: false,
      isAvailable: false,
      devonthinkRunning: false,
      aiFeatureEnabled: false,
      configuredEngines: [],
      unconfiguredEngines: [],
      summary: "❌ Failed to check AI status",
      lastChecked: new Date().toISOString(),
      error: `Failed to check AI status: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Export the tool
export const checkAIStatusTool: Tool = {
  name: "check_ai_status",
  description: `
**Check AI Status** - Get detailed information about AI service availability and configuration.

This diagnostic tool helps you understand which AI engines are configured and ready to use in DEVONthink. It automatically detects available services and provides setup guidance for unconfigured engines.

**Key Features:**
• **Auto-Detection**: Automatically discovers configured AI engines using DEVONthink's API
• **Model Information**: Shows available models for each configured engine  
• **Setup Guidance**: Provides step-by-step configuration instructions for unconfigured engines
• **Smart Recommendations**: Suggests best engine for specific operations
• **Real-time Status**: Shows current availability and any issues

**Information Provided:**
• Which AI engines are configured and ready (ChatGPT, Claude, Gemini, etc.)
• Available models for each engine
• Configuration status and any errors
• Setup time estimates and instructions
• Recommended engines for different operations

**Use Cases:**
• **Before AI Operations**: Check what's available before running AI tasks
• **Troubleshooting**: Diagnose why AI features aren't working
• **Setup Planning**: Understand what needs to be configured
• **Engine Selection**: Find the best engine for your needs

**Test Operations:**
• \`chat\`: Test for conversational AI tasks
• \`summarize\`: Test for document summarization  
• \`classify\`: Test for document classification
• \`compare\`: Test for document comparison

**Example Output:**
\`\`\`
✅ 2 AI engines ready: ChatGPT, Claude
- ChatGPT: gpt-4, gpt-3.5-turbo (2 models)
- Claude: claude-3-sonnet, claude-3-haiku (2 models)
- Unconfigured: Gemini (2-minute setup)
\`\`\`

This tool eliminates guesswork about AI availability and provides actionable guidance for setup.`.trim(),
  inputSchema: zodToJsonSchema(CheckAIStatusInputSchema) as any,
  run: checkAIStatus,
};