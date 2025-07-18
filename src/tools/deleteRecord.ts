import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const DeleteRecordSchema = z
  .object({
    uuid: z.string().optional().describe("The UUID of the record"),
    recordId: z.number().optional().describe("The ID of the record to delete"),
    recordName: z
      .string()
      .optional()
      .describe("The name of the record to delete (if ID not provided)"),
    recordPath: z
      .string()
      .optional()
      .describe("The path of the record to delete (if ID not provided)"),
    databaseName: z
      .string()
      .optional()
      .describe(
        "The name of the database to delete the record from (defaults to current database)"
      ),
  })
  .strict()
  .refine(
    (data) =>
      data.uuid !== undefined ||
      data.recordId !== undefined ||
      data.recordName !== undefined ||
      data.recordPath !== undefined,
    {
      message:
        "Either uuid, recordId, recordName, or recordPath must be provided",
    }
  );

type DeleteRecordInput = z.infer<typeof DeleteRecordSchema>;

const deleteRecord = async (
  input: DeleteRecordInput
): Promise<{ success: boolean; error?: string }> => {
  const { uuid, recordId, recordName, recordPath, databaseName } = input;

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        let targetRecord;
        
        let targetDatabase;
        if ("${databaseName || ""}") {
          const databases = theApp.databases();
          targetDatabase = databases.find(db => db.name() === "${databaseName}");
          if (!targetDatabase) {
            throw new Error("Database not found: ${databaseName}");
          }
        } else {
          targetDatabase = theApp.currentDatabase();
        }

        if ("${uuid || ""}") {
          targetRecord = theApp.getRecordWithUuid("${uuid}");
        } else if (${recordId || "null"}) {
          // Find by ID
          const allRecords = targetDatabase.contents();
          targetRecord = allRecords.find(r => r.id() === ${recordId});
        } else if ("${recordName || ""}") {
          // Find by name
          const searchResults = theApp.search("${recordName}", { in: targetDatabase });
          targetRecord = searchResults.find(r => r.name() === "${recordName}");
        } else if ("${recordPath || ""}") {
          // Find by path
          const searchResults = theApp.lookupRecordsWithPath("${recordPath}", { in: targetDatabase });
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
