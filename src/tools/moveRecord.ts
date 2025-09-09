import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import {
  escapeStringForJXA,
  formatValueForJXA,
  isJXASafeString,
} from "../utils/escapeString.js";
import {
  getRecordLookupHelpers,
  getDatabaseHelper,
  isGroupHelper,
} from "../utils/jxaHelpers.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const MoveRecordSchema = z
  .object({
    uuid: z.string().optional().describe("UUID of the record to move"),
    recordId: z.number().optional().describe("ID of the record to move"),
    recordName: z
      .string()
      .optional()
      .describe("Name of the record to move"),
    recordPath: z
      .string()
      .optional()
      .describe("Path of the record to move"),
    destinationGroupUuid: z
      .string()
      .optional()
      .describe("UUID of the destination group"),
    databaseName: z
      .string()
      .optional()
      .describe(
        "Database to move the record in (optional)"
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

type MoveRecordInput = z.infer<typeof MoveRecordSchema>;

const moveRecord = async (
  input: MoveRecordInput
): Promise<{ success: boolean; newLocation?: string; error?: string }> => {
  const {
    uuid,
    recordId,
    recordName,
    recordPath,
    destinationGroupUuid,
    databaseName,
  } = input;

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
  if (destinationGroupUuid && !isJXASafeString(destinationGroupUuid)) {
    return {
      success: false,
      error: "Destination UUID contains invalid characters",
    };
  }
  if (databaseName && !isJXASafeString(databaseName)) {
    return {
      success: false,
      error: "Database name contains invalid characters",
    };
  }

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Inject helper functions
      ${getRecordLookupHelpers()}
      ${getDatabaseHelper}
      ${isGroupHelper}
      
      try {
        // Get target database
        const targetDatabase = getDatabase(theApp, ${
          databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"
        });
        
        // Build lookup options for the record to move
        const lookupOptions = {
          uuid: ${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"},
          id: ${recordId !== undefined ? recordId : "null"},
          path: ${recordPath ? `"${escapeStringForJXA(recordPath)}"` : "null"},
          name: ${recordName ? `"${escapeStringForJXA(recordName)}"` : "null"},
          database: targetDatabase
        };
        
        // Find the record to move
        const lookupResult = getRecord(theApp, lookupOptions);
        
        if (!lookupResult.record) {
          let errorDetails = lookupResult.error || "Record not found";
          if (${recordId !== undefined ? recordId : "null"}) {
            errorDetails = "Record with ID " + ${recordId} + " not found in database '" + targetDatabase.name() + "'";
          }
          return JSON.stringify({
            success: false,
            error: errorDetails
          });
        }
        
        const targetRecord = lookupResult.record;
        
        // Find the destination group
        let destinationGroupRecord;
        const pDestinationGroupUuid = ${
          destinationGroupUuid
            ? `"${escapeStringForJXA(destinationGroupUuid)}"`
            : "null"
        };
        
        if (pDestinationGroupUuid) {
          try {
            destinationGroupRecord = theApp.getRecordWithUuid(pDestinationGroupUuid);
          } catch (e) {
            throw e;
          }
        }
        
        if (!destinationGroupRecord) {
          throw new Error("Destination group with UUID not found: " + (pDestinationGroupUuid || "unknown"));
        }
        
        // Verify destination is a group
        try {
          const destType = destinationGroupRecord.recordType();
          if (destType !== "group" && destType !== "smart group") {
            throw new Error("Destination is not a group. Record type: " + destType);
          }
        } catch (e) {
          throw e;
        }
        
        // Move the record
        let moveResult;
        try {
          moveResult = theApp.move({ record: targetRecord, to: destinationGroupRecord });
        } catch (e) {
          throw e;
        }
        
        if (moveResult) {
          const newLocation = moveResult.location();
          return JSON.stringify({
            success: true,
            newLocation: newLocation
          });
        } else {
          return JSON.stringify({
            success: false,
            error: "Failed to move record"
          });
        }
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<{
    success: boolean;
    newLocation?: string;
    error?: string;
  }>(script);
};

export const moveRecordTool: Tool = {
  name: "moveRecord",
  title: "Move Record",
  description: "Move a record to a different group in DEVONthink. To move to root, use database UUID as destinationGroupUuid.\n\nExample:\n{\n  \"uuid\": \"1234-5678-90AB-CDEF\",\n  \"destinationGroupUuid\": \"FEDC-BA09-8765-4321\"\n}",
  inputSchema: zodToJsonSchema(MoveRecordSchema) as ToolInput,
  run: moveRecord,
};
