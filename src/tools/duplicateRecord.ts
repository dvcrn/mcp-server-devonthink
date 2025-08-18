import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { type Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
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

const DuplicateRecordSchema = z
  .object({
    uuid: z.string().optional().describe("The UUID of the record to duplicate"),
    recordId: z.number().optional().describe("The ID of the record to duplicate"),
    recordPath: z
      .string()
      .optional()
      .describe("The DEVONthink location path of the record (e.g., '/Inbox/My Document'), NOT the filesystem path"),
    destinationGroupUuid: z
      .string()
      .describe("The UUID of the destination group (can be in any database)"),
    databaseName: z
      .string()
      .optional()
      .describe(
        "The name of the database containing the source record (defaults to current database)"
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

type DuplicateRecordInput = z.infer<typeof DuplicateRecordSchema>;

interface DuplicateRecordResult {
  success: boolean;
  error?: string;
  duplicatedRecord?: {
    id: number;
    uuid: string;
    name: string;
    path: string;
    location: string;
    recordType: string;
    databaseName: string;
  };
}

const duplicateRecord = async (
  input: DuplicateRecordInput
): Promise<DuplicateRecordResult> => {
  const uuid = input.uuid;
  const recordId = input.recordId;
  const recordPath = input.recordPath;
  const destinationGroupUuid = input.destinationGroupUuid;
  const databaseName = input.databaseName;

  // Validate string inputs
  if (uuid && !isJXASafeString(uuid)) {
    const errorResult: DuplicateRecordResult = {} as DuplicateRecordResult;
    errorResult["success"] = false;
    errorResult["error"] = "UUID contains invalid characters";
    return errorResult;
  }
  if (recordPath && !isJXASafeString(recordPath)) {
    const errorResult: DuplicateRecordResult = {} as DuplicateRecordResult;
    errorResult["success"] = false;
    errorResult["error"] = "Record path contains invalid characters";
    return errorResult;
  }
  if (destinationGroupUuid && !isJXASafeString(destinationGroupUuid)) {
    const errorResult: DuplicateRecordResult = {} as DuplicateRecordResult;
    errorResult["success"] = false;
    errorResult["error"] = "Destination group UUID contains invalid characters";
    return errorResult;
  }
  if (databaseName && !isJXASafeString(databaseName)) {
    const errorResult: DuplicateRecordResult = {} as DuplicateRecordResult;
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
        // Get source database
        const sourceDatabase = getDatabase(theApp, ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"});
        
        // Build lookup options for the record to duplicate
        const lookupOptions = {};
        lookupOptions["uuid"] = ${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"};
        lookupOptions["id"] = ${recordId !== undefined ? recordId : "null"};
        lookupOptions["path"] = ${recordPath ? `"${escapeStringForJXA(recordPath)}"` : "null"};
        lookupOptions["name"] = null;
        lookupOptions["database"] = sourceDatabase;
        
        // Find the source record
        const lookupResult = getRecord(theApp, lookupOptions);
        
        if (!lookupResult.record) {
          // Build detailed error message
          let errorDetails = lookupResult.error || "Record not found";
          if (${recordId !== undefined ? recordId : "null"}) {
            errorDetails = "Record with ID " + ${recordId} + " not found in database '" + sourceDatabase.name() + "'";
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
        
        // Perform the duplication
        let duplicatedRecord;
        try {
          const duplicateOptions = {};
          duplicateOptions["record"] = sourceRecord;
          duplicateOptions["to"] = destinationGroup;
          duplicatedRecord = theApp.duplicate(duplicateOptions);
        } catch (e) {
          return JSON.stringify({
            success: false,
            error: "Failed to duplicate record: " + e.toString()
          });
        }
        
        if (!duplicatedRecord) {
          return JSON.stringify({
            success: false,
            error: "Duplication returned no result"
          });
        }
        
        // Return details of the duplicated record
        const result = {};
        result["success"] = true;
        result["duplicatedRecord"] = {};
        result["duplicatedRecord"]["id"] = duplicatedRecord.id();
        result["duplicatedRecord"]["uuid"] = duplicatedRecord.uuid();
        result["duplicatedRecord"]["name"] = duplicatedRecord.name();
        result["duplicatedRecord"]["path"] = duplicatedRecord.path();
        result["duplicatedRecord"]["location"] = duplicatedRecord.location();
        result["duplicatedRecord"]["recordType"] = duplicatedRecord.recordType();
        result["duplicatedRecord"]["databaseName"] = duplicatedRecord.database().name();
        
        return JSON.stringify(result);
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<DuplicateRecordResult>(script);
};

export const duplicateRecordTool: Tool = {
  name: "duplicate_record",
  description:
    "Duplicate a record to any destination group, creating an independent copy. Unlike replication, duplication can cross databases and creates a completely separate record. Indexed items are not supported by audit-proof databases.\n\nRecord identification methods (in order of reliability):\n1. **UUID** (recommended): Globally unique identifier that works across all databases\n2. **ID + Database**: Database-specific ID requires specifying the database name\n3. **DEVONthink Path**: Internal DEVONthink location path like '/Inbox/My Document' (NOT filesystem paths like '/Users/.../')\n\n**Important Path Note**: Use DEVONthink's internal location paths (shown in the 'Path' column in DEVONthink), not filesystem paths. Example: '/Projects/2024/Report.pdf' not '/Users/david/Databases/MyDB.dtBase2/Files.noindex/...'\n\n**Replicate vs Duplicate**:\n- **Replicate**: Creates linked reference within same database (use replicate_record tool)\n- **Duplicate**: Creates independent copy, can cross databases (this tool)\n\nReturns the duplicated record's UUID, ID, location, and destination database information.",
  inputSchema: zodToJsonSchema(DuplicateRecordSchema) as ToolInput,
  run: duplicateRecord,
};