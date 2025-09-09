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

const ConvertRecordSchema = z
  .object({
    uuid: z.string().optional().describe("UUID of the record to convert"),
    recordId: z.number().optional().describe("ID of the record to convert"),
    recordPath: z
      .string()
      .optional()
      .describe("DEVONthink location path of the record (e.g., '/Inbox/My Document')"),
    format: z
      .enum([
        "bookmark",
        "simple",
        "rich",
        "note",
        "markdown",
        "HTML",
        "webarchive",
        "PDF document",
        "single page PDF document",
        "PDF without annotations",
        "PDF with annotations burnt in"
      ])
      .describe("The desired format for conversion"),
    destinationGroupUuid: z
      .string()
      .optional()
      .describe("UUID of the destination group (optional)"),
    databaseName: z
      .string()
      .optional()
      .describe(
        "Database name containing the source record (optional)"
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

type ConvertRecordInput = z.infer<typeof ConvertRecordSchema>;

interface ConvertRecordResult {
  success: boolean;
  error?: string;
  convertedRecord?: {
    id: number;
    uuid: string;
    name: string;
    path: string;
    location: string;
    recordType: string;
    format: string;
  };
}

const convertRecord = async (
  input: ConvertRecordInput
): Promise<ConvertRecordResult> => {
  const uuid = input.uuid;
  const recordId = input.recordId;
  const recordPath = input.recordPath;
  const format = input.format;
  const destinationGroupUuid = input.destinationGroupUuid;
  const databaseName = input.databaseName;

  // Validate string inputs
  if (uuid && !isJXASafeString(uuid)) {
    const errorResult: ConvertRecordResult = {} as ConvertRecordResult;
    errorResult["success"] = false;
    errorResult["error"] = "UUID contains invalid characters";
    return errorResult;
  }
  if (recordPath && !isJXASafeString(recordPath)) {
    const errorResult: ConvertRecordResult = {} as ConvertRecordResult;
    errorResult["success"] = false;
    errorResult["error"] = "Record path contains invalid characters";
    return errorResult;
  }
  if (destinationGroupUuid && !isJXASafeString(destinationGroupUuid)) {
    const errorResult: ConvertRecordResult = {} as ConvertRecordResult;
    errorResult["success"] = false;
    errorResult["error"] = "Destination group UUID contains invalid characters";
    return errorResult;
  }
  if (databaseName && !isJXASafeString(databaseName)) {
    const errorResult: ConvertRecordResult = {} as ConvertRecordResult;
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
        
        // Build lookup options for the record to convert
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
        
        // Get destination group if specified
        let destinationGroup = null;
        if (${destinationGroupUuid ? `"${escapeStringForJXA(destinationGroupUuid)}"` : "null"}) {
          destinationGroup = theApp.getRecordWithUuid("${destinationGroupUuid ? escapeStringForJXA(destinationGroupUuid) : ''}");
          if (!destinationGroup) {
            return JSON.stringify({
              success: false,
              error: "Destination group with UUID ${destinationGroupUuid ? escapeStringForJXA(destinationGroupUuid) : 'unknown'} not found"
            });
          }
          
          // Verify destination is a group
          if (!isGroup(destinationGroup)) {
            return JSON.stringify({
              success: false,
              error: "Destination UUID does not refer to a group. Type: " + destinationGroup.recordType()
            });
          }
        }
        
        // Perform the conversion
        let convertedRecord;
        try {
          const convertOptions = {};
          convertOptions["record"] = sourceRecord;
          convertOptions["to"] = "${escapeStringForJXA(format)}";
          if (destinationGroup) {
            convertOptions["in"] = destinationGroup;
          }
          convertedRecord = theApp.convert(convertOptions);
        } catch (e) {
          return JSON.stringify({
            success: false,
            error: "Failed to convert record: " + e.toString()
          });
        }
        
        if (!convertedRecord) {
          return JSON.stringify({
            success: false,
            error: "Conversion returned no result"
          });
        }
        
        // Return details of the converted record
        const result = {};
        result["success"] = true;
        result["convertedRecord"] = {};
        result["convertedRecord"]["id"] = convertedRecord.id();
        result["convertedRecord"]["uuid"] = convertedRecord.uuid();
        result["convertedRecord"]["name"] = convertedRecord.name();
        result["convertedRecord"]["path"] = convertedRecord.path();
        result["convertedRecord"]["location"] = convertedRecord.location();
        result["convertedRecord"]["recordType"] = convertedRecord.recordType();
        result["convertedRecord"]["format"] = "${escapeStringForJXA(format)}";
        
        return JSON.stringify(result);
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<ConvertRecordResult>(script);
};

export const convertRecordTool: Tool = {
  name: "convertRecord",
  title: "Convert Record",
  description: "Convert a record to a different format, creating a new record.\n\nExample:\n{\n  \"uuid\": \"1234-5678-90AB-CDEF\",\n  \"format\": \"markdown\"\n}",
  inputSchema: zodToJsonSchema(ConvertRecordSchema) as ToolInput,
  run: convertRecord,
};