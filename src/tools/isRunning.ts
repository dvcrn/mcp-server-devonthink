import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const IsRunningSchema = z.object({}).strict();

const isRunning = async (): Promise<{ isRunning: boolean }> => {
  const script = `
    const app = Application("DEVONthink");
    const isRunning = app.running();
    JSON.stringify({ isRunning });
  `;
  return await executeJxa<{ isRunning: boolean }>(script);
};

export const isRunningTool: Tool = {
  name: "is_running",
  description: "Check if the DEVONthink application is currently running.\n\nExample:\n{}",
  inputSchema: zodToJsonSchema(IsRunningSchema) as ToolInput,
  run: isRunning,
};
