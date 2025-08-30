import { z } from "zod";
import { createDevonThinkTool } from "./base/DevonThinkTool.js";

const IsRunningSchema = z.object({}).strict();

interface IsRunningResult {
  success: boolean;
  isRunning?: boolean;
  error?: string;
}

export const isRunningTool = createDevonThinkTool<
  z.infer<typeof IsRunningSchema>,
  IsRunningResult
>({
  name: "is_running",
  description:
    "Check if the DEVONthink application is currently running. This is a simple check that returns a boolean value and is useful for verifying that the application is available before attempting other operations.",
  inputSchema: IsRunningSchema,
  buildScript: (_input, helpers) => {
    return helpers.wrapInTryCatch(`
      const theApp = Application("DEVONthink");
      const isRunning = theApp.running();
      
      const result = {};
      result["success"] = true;
      result["isRunning"] = isRunning;
      return JSON.stringify(result);
    `);
  },
});