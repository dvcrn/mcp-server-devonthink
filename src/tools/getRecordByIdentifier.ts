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

const GetRecordByIdentifierSchema = z
  .object({
    uuid: z
      .string()
      .optional()
      .describe("UUID of the record"),
    id: z
      .number()
      .optional()
      .describe("ID of the record (requires databaseName)"),
    databaseName: z
      .string()
      .optional()
      .describe("Database name (required with id)"),
  })
  .strict()
  .refine(
    (data) => data.uuid !== undefined || (data.id !== undefined && data.databaseName !== undefined),
    {
      message: "Either UUID alone, or ID with databaseName must be provided",
    }
  );

type GetRecordByIdentifierInput = z.infer<typeof GetRecordByIdentifierSchema>;

interface RecordResult {
  success: boolean;
  error?: string;
  record?: {
    id: number;
    uuid: string;
    name: string;
    path: string;
    location: string;
    recordType: string;
    kind: string;
    database: string;
    creationDate?: string;
    modificationDate?: string;
    tags?: string[];
    size?: number;
    url?: string;
    comment?: string;
  };
}

const getRecordByIdentifier = async (
  input: GetRecordByIdentifierInput
): Promise<RecordResult> => {
  const { uuid, id, databaseName } = input;

  // Validate string inputs
  if (uuid && !isJXASafeString(uuid)) {
    return { success: false, error: "UUID contains invalid characters" };
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
        let targetRecord;
        let targetDatabase;
        let lookupResult;
        
        if (${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"}) {
          // UUID lookup - globally unique
          const lookupOptions = {
            uuid: ${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"}
          };
          
          lookupResult = getRecord(theApp, lookupOptions);
          
          if (!lookupResult.record) {
            return JSON.stringify({
              success: false,
              error: "Record with UUID " + (${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"} || "unknown") + " not found"
            });
          }
          
          targetRecord = lookupResult.record;
          // Get the database of the record
          targetDatabase = targetRecord.database();
          
        } else if (${id !== undefined ? id : "null"} && ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"}) {
          // ID + Database lookup
          targetDatabase = getDatabase(theApp, ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"});
          
          const lookupOptions = {
            id: ${id},
            database: targetDatabase
          };
          
          lookupResult = getRecord(theApp, lookupOptions);
          
          if (!lookupResult.record) {
            return JSON.stringify({
              success: false,
              error: "Record with ID " + ${id} + " not found in database '" + (${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"} || "unknown") + "'"
            });
          }
          
          targetRecord = lookupResult.record;
        }
        
        // Extract record properties
        const record = {
          id: targetRecord.id(),
          uuid: targetRecord.uuid(),
          name: targetRecord.name(),
          path: targetRecord.path(),
          location: targetRecord.location(),
          recordType: targetRecord.recordType(),
          kind: targetRecord.kind(),
          database: targetDatabase.name(),
          creationDate: targetRecord.creationDate() ? targetRecord.creationDate().toString() : null,
          modificationDate: targetRecord.modificationDate() ? targetRecord.modificationDate().toString() : null,
          tags: targetRecord.tags(),
          size: targetRecord.size()
        };
        
        // Add optional properties if available
        if (targetRecord.url && targetRecord.url()) {
          record.url = targetRecord.url();
        }
        if (targetRecord.comment && targetRecord.comment()) {
          record.comment = targetRecord.comment();
        }
        
        return JSON.stringify({
          success: true,
          record: record
        });
        
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<RecordResult>(script);
};

export const getRecordByIdentifierTool: Tool = {
  name: "getRecordByIdentifier",
  title: "Get Record by Identifier",
  description: "Get a DEVONthink record using its UUID or ID.\n\nExample (UUID):\n{\n  \"uuid\": \"1234-5678-90AB-CDEF\"\n}\n\nExample (ID):\n{\n  \"id\": 12345,\n  \"databaseName\": \"MyDatabase\"\n}",
  inputSchema: zodToJsonSchema(GetRecordByIdentifierSchema) as ToolInput,
  run: getRecordByIdentifier,
};