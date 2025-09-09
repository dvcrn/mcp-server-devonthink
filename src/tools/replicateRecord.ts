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

const ReplicateRecordSchema = z
  .object({
    uuid: z.string().optional().describe("UUID of the record to replicate"),
    recordId: z.number().optional().describe("ID of the record to replicate"),
    recordPath: z
      .string()
      .optional()
      .describe("DEVONthink location path of the record (e.g., '/Inbox/My Document'), NOT the filesystem path"),
    destinationGroupUuid: z
      .string()
      .describe("UUID of the destination group (must be in the same database)"),
    databaseName: z
      .string()
      .optional()
      .describe(
        "Database containing the record (optional)"
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

type ReplicateRecordInput = z.infer<typeof ReplicateRecordSchema>;

interface ReplicateRecordResult {
  success: boolean;
  error?: string;
  replicatedRecord?: {
    id: number;
    uuid: string;
    name: string;
    path: string;
    location: string;
    recordType: string;
  };
}

const replicateRecord = async (
  input: ReplicateRecordInput
): Promise<ReplicateRecordResult> => {
  const uuid = input.uuid;
  const recordId = input.recordId;
  const recordPath = input.recordPath;
  const destinationGroupUuid = input.destinationGroupUuid;
  const databaseName = input.databaseName;

  // Validate string inputs
  if (uuid && !isJXASafeString(uuid)) {
    const errorResult: ReplicateRecordResult = {} as ReplicateRecordResult;
    errorResult["success"] = false;
    errorResult["error"] = "UUID contains invalid characters";
    return errorResult;
  }
  if (recordPath && !isJXASafeString(recordPath)) {
    const errorResult: ReplicateRecordResult = {} as ReplicateRecordResult;
    errorResult["success"] = false;
    errorResult["error"] = "Record path contains invalid characters";
    return errorResult;
  }
  if (destinationGroupUuid && !isJXASafeString(destinationGroupUuid)) {
    const errorResult: ReplicateRecordResult = {} as ReplicateRecordResult;
    errorResult["success"] = false;
    errorResult["error"] = "Destination group UUID contains invalid characters";
    return errorResult;
  }
  if (databaseName && !isJXASafeString(databaseName)) {
    const errorResult: ReplicateRecordResult = {} as ReplicateRecordResult;
    errorResult["success"] = false;
    errorResult["error"] = "Database name contains invalid characters";
    return errorResult;
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
        const targetDatabase = getDatabase(theApp, ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"});
        
        // Build lookup options for the record to replicate
        const lookupOptions = {};
        lookupOptions["uuid"] = ${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"};
        lookupOptions["id"] = ${recordId !== undefined ? recordId : "null"};
        lookupOptions["path"] = ${recordPath ? `"${escapeStringForJXA(recordPath)}"` : "null"};
        lookupOptions["name"] = null;
        lookupOptions["database"] = targetDatabase;
        
        // Find the source record
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
        
        const sourceRecord = lookupResult.record;
        
        // Get destination group
        const destinationGroup = theApp.getRecordWithUuid("${escapeStringForJXA(destinationGroupUuid)}");
        if (!destinationGroup) {
          return JSON.stringify({
            success: false,
            error: "Destination group with UUID ${escapeStringForJXA(destinationGroupUuid)} not found"
          });
        }
        
        // Verify destination is a group
        if (!isGroup(destinationGroup)) {
          return JSON.stringify({
            success: false,
            error: "Destination UUID does not refer to a group. Type: " + destinationGroup.recordType()
          });
        }
        
        // Verify both records are in the same database (replicate requirement)
        const sourceDb = sourceRecord.database();
        const destDb = destinationGroup.database();
        if (sourceDb.uuid() !== destDb.uuid()) {
          return JSON.stringify({
            success: false,
            error: "Source and destination must be in the same database for replication. Source: '" + sourceDb.name() + "', Destination: '" + destDb.name() + "'"
          });
        }
        
        // Perform the replication
        let replicatedRecord;
        try {
          const replicateOptions = {};
          replicateOptions["record"] = sourceRecord;
          replicateOptions["to"] = destinationGroup;
          replicatedRecord = theApp.replicate(replicateOptions);
        } catch (e) {
          return JSON.stringify({
            success: false,
            error: "Failed to replicate record: " + e.toString()
          });
        }
        
        if (!replicatedRecord) {
          return JSON.stringify({
            success: false,
            error: "Replication returned no result"
          });
        }
        
        // Return details of the replicated record
        const result = {};
        result["success"] = true;
        result["replicatedRecord"] = {};
        result["replicatedRecord"]["id"] = replicatedRecord.id();
        result["replicatedRecord"]["uuid"] = replicatedRecord.uuid();
        result["replicatedRecord"]["name"] = replicatedRecord.name();
        result["replicatedRecord"]["path"] = replicatedRecord.path();
        result["replicatedRecord"]["location"] = replicatedRecord.location();
        result["replicatedRecord"]["recordType"] = replicatedRecord.recordType();
        
        return JSON.stringify(result);
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<ReplicateRecordResult>(script);
};

export const replicateRecordTool: Tool = {
  name: "replicateRecord",
  title: "Replicate Record",
  description: "Replicate a record within the same database to a destination group. This creates a linked reference, not an independent copy.\n\nExample:\n{\n  \"uuid\": \"1234-5678-90AB-CDEF\",\n  \"destinationGroupUuid\": \"FEDC-BA09-8765-4321\"\n}",
  inputSchema: zodToJsonSchema(ReplicateRecordSchema) as ToolInput,
  run: replicateRecord,
};