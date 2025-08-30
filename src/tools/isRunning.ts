import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { JXAScriptBuilder } from "../utils/jxaScriptBuilder.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const IsRunningSchema = z.object({}).strict();

const isRunning = async (): Promise<{ isRunning: boolean }> => {
  // Use JXA Script Builder for clean, validated script generation
  const builder = new JXAScriptBuilder();
  
  builder.addCodeBlock(`
    // Check if DEVONthink is running
    const isRunning = theApp.running();
    
    // Build result using safe bracket notation
    const result = {};
    result["isRunning"] = isRunning;
    
    return JSON.stringify(result);
  `);

  // Validate the script before execution
  const validation = builder.validate();
  if (!validation.valid) {
    // In production, we might want to log this
    console.warn("Script validation warnings:", validation.warnings);
  }

  const script = builder.build();
  
  // Execute with enhanced error handling
  return await executeJxa<{ isRunning: boolean }>(script, {
    timeout: 5000, // 5 second timeout for simple check
    retries: 1 // One retry for network/temp issues
  });
};

export const isRunningTool: Tool = {
  name: "is_running",
  description:
    "Check if the DEVONthink application is currently running. This is a simple check that returns a boolean value and is useful for verifying that the application is available before attempting other operations.",
  inputSchema: zodToJsonSchema(IsRunningSchema) as ToolInput,
  run: isRunning,
};