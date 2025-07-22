import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import {
  escapeStringForJXA,
  formatValueForJXA,
  isJXASafeString,
} from "../utils/escapeString.js";
import { getRecordLookupHelpers, getDatabaseHelper } from "../utils/jxaHelpers.js";

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

  // Validate string inputs
  if (uuid && !isJXASafeString(uuid)) {
    return { success: false, error: "UUID contains invalid characters" };
  }
  if (recordName && !isJXASafeString(recordName)) {
    return { success: false, error: "Record name contains invalid characters" };
  }
  if (recordPath && !isJXASafeString(recordPath)) {
    return { success: false, error: "Record path contains invalid characters" };
  }
  if (databaseName && !isJXASafeString(databaseName)) {
    return { success: false, error: "Database name contains invalid characters" };
  }

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Inject helper functions
      ${getRecordLookupHelpers()}
      ${getDatabaseHelper}
      
      try {
        // Get target database
        const targetDatabase = getDatabase(theApp, ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"});
        
        // Build lookup options for the record to delete
        const lookupOptions = {
          uuid: ${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"},
          id: ${recordId !== undefined ? recordId : "null"},
          path: ${recordPath ? `"${escapeStringForJXA(recordPath)}"` : "null"},
          name: ${recordName ? `"${escapeStringForJXA(recordName)}"` : "null"},
          database: targetDatabase
        };
        
        // Use the unified lookup function
        const lookupResult = getRecord(theApp, lookupOptions);
        
        if (!lookupResult.record) {
          // Build detailed error message
          let errorDetails = lookupResult.error || "Record not found";
          if (${recordId !== undefined ? recordId : "null"}) {
            errorDetails = "Record with ID " + ${recordId} + " not found in database '" + targetDatabase.name() + "'";
          } else if (${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"}) {
            errorDetails = "Record with UUID " + (${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"} || "unknown") + " not found";
          } else if (${recordName ? `"${escapeStringForJXA(recordName)}"` : "null"}) {
            errorDetails = "Record with name " + (${recordName ? `"${escapeStringForJXA(recordName)}"` : "null"} || "unknown") + " not found in database '" + targetDatabase.name() + "'";
          } else if (${recordPath ? `"${escapeStringForJXA(recordPath)}"` : "null"}) {
            errorDetails = "Record at path " + (${recordPath ? `"${escapeStringForJXA(recordPath)}"` : "null"} || "unknown") + " not found";
          }
          
          return JSON.stringify({
            success: false,
            error: errorDetails
          });
        }
        
        const targetRecord = lookupResult.record;
        
        // Delete the record
        let deleteResult;
        try {
          deleteResult = theApp.delete({ record: targetRecord });
        } catch (e) {
          throw e;
        }
        
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
  description:
    "Delete a record from DEVONthink. It's highly recommended to use the `uuid` for accurate record identification. The tool will permanently delete the record and its contents if it's a group.",
  inputSchema: zodToJsonSchema(DeleteRecordSchema) as ToolInput,
  run: deleteRecord,
};
