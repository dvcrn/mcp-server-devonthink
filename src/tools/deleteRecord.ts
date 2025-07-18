import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const DeleteRecordSchema = z
  .object({
    recordId: z.number().optional().describe("The ID of the record to delete"),
    recordName: z
      .string()
      .optional()
      .describe("The name of the record to delete (if ID not provided)"),
    recordPath: z
      .string()
      .optional()
      .describe("The path of the record to delete (if ID not provided)"),
  })
  .strict()
  .refine(
    (data) =>
      data.recordId !== undefined ||
      data.recordName !== undefined ||
      data.recordPath !== undefined,
    { message: "Either recordId, recordName, or recordPath must be provided" }
  );

type DeleteRecordInput = z.infer<typeof DeleteRecordSchema>;

const deleteRecord = async (
  input: DeleteRecordInput
): Promise<{ success: boolean; error?: string }> => {
  const { recordId, recordName, recordPath } = input;

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        let targetRecord;
        
        if (${recordId || "null"}) {
          // Find by ID
          const allRecords = theApp.currentDatabase().contents();
          targetRecord = allRecords.find(r => r.id() === ${recordId});
        } else if ("${recordName || ""}") {
          // Find by name
          const searchResults = theApp.search("${recordName}", { in: theApp.currentDatabase() });
          targetRecord = searchResults.find(r => r.name() === "${recordName}");
        } else if ("${recordPath || ""}") {
          // Find by path
          const searchResults = theApp.lookupRecordsWithPath("${recordPath}", { in: theApp.currentDatabase() });
          if (searchResults && searchResults.length > 0) {
            targetRecord = searchResults[0];
          }
        }
        
        if (!targetRecord) {
          return JSON.stringify({
            success: false,
            error: "Record not found"
          });
        }
        
        // Delete the record
        const deleteResult = theApp.delete({ record: targetRecord });
        
        return JSON.stringify({
          success: deleteResult
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<{ success: boolean; error?: string }>(script);
};

export const deleteRecordTool: Tool = {
  name: "delete_record",
  description: "Delete a record from DEVONthink by ID, name, or path",
  inputSchema: zodToJsonSchema(DeleteRecordSchema) as ToolInput,
  run: deleteRecord,
};
