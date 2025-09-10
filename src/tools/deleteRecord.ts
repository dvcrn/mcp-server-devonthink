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
    uuid: z.string().optional().describe("UUID of the record to delete"),
    recordId: z.number().optional().describe("ID of the record to delete"),
    recordPath: z
      .string()
      .optional()
      .describe("DEVONthink location path of the record (e.g., '/Inbox/My Document')"),
    databaseName: z
      .string()
      .optional()
      .describe(
        "Database to delete the record from (optional, defaults to current)"
      ),
  })
  .strict()
  .refine(
    (data) =>
      data.uuid !== undefined ||
      data.recordId !== undefined ||
      data.recordPath !== undefined,
    {
      message:
        "Either uuid, recordId, or recordPath must be provided",
    }
  );

type DeleteRecordInput = z.infer<typeof DeleteRecordSchema>;

const deleteRecord = async (
  input: DeleteRecordInput
): Promise<{ success: boolean; error?: string }> => {
  const { uuid, recordId, recordPath, databaseName } = input;

  // Validate string inputs
  if (uuid && !isJXASafeString(uuid)) {
    return { success: false, error: "UUID contains invalid characters" };
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
          name: null,
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
          } else if (${recordPath ? `"${escapeStringForJXA(recordPath)}"` : "null"}) {
            errorDetails = "Record at DEVONthink location path " + (${recordPath ? `"${escapeStringForJXA(recordPath)}"` : "null"} || "unknown") + " not found";
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
  description: "Delete a record from DEVONthink.\n\nExample:\n{\n  \"uuid\": \"1234-5678-90AB-CDEF\"\n}",
  inputSchema: zodToJsonSchema(DeleteRecordSchema) as ToolInput,
  run: deleteRecord,
};
