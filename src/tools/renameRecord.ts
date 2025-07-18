import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const RenameRecordSchema = z
  .object({
    uuid: z.string().describe("The UUID of the record to rename"),
    newName: z.string().describe("The new name for the record"),
    databaseName: z
      .string()
      .optional()
      .describe("The name of the database to rename the record in (optional)"),
  })
  .strict();

type RenameRecordInput = z.infer<typeof RenameRecordSchema>;

interface RenameRecordResult {
  success: boolean;
  error?: string;
}

const renameRecord = async (
  input: RenameRecordInput
): Promise<RenameRecordResult> => {
  const { uuid, newName, databaseName } = input;

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        const record = theApp.getRecordWithUuid("${uuid}");
        
        if (!record) {
          return JSON.stringify({
            success: false,
            error: "Record with UUID ${uuid} not found"
          });
        }

        if ("${
          databaseName || ""
        }" && record.database().name() !== "${databaseName}") {
          return JSON.stringify({
            success: false,
            error: "Record with UUID ${uuid} not found in database ${databaseName}"
          });
        }
        
        record.name = "${newName}";
        
        return JSON.stringify({
          success: true
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<RenameRecordResult>(script);
};

export const renameRecordTool: Tool = {
  name: "rename_record",
  description: "Renames a specific record in DEVONthink.",
  inputSchema: zodToJsonSchema(RenameRecordSchema) as ToolInput,
  run: renameRecord,
};
