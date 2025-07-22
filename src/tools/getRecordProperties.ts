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

const GetRecordPropertiesSchema = z
  .object({
    uuid: z.string().optional().describe("The UUID of the record"),
    recordId: z
      .number()
      .optional()
      .describe("The ID of the record to get properties for"),
    recordPath: z
      .string()
      .optional()
      .describe(
        "The DEVONthink location path of the record (e.g., '/Inbox/My Document'), NOT the filesystem path"
      ),
    databaseName: z
      .string()
      .optional()
      .describe(
        "The name of the database to get the record properties from (defaults to current database)"
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

type GetRecordPropertiesInput = z.infer<typeof GetRecordPropertiesSchema>;

interface RecordProperties {
  success: boolean;
  error?: string;
  id?: number;
  uuid?: string;
  name?: string;
  path?: string;
  location?: string;
  recordType?: string;
  kind?: string;
  creationDate?: string;
  modificationDate?: string;
  additionDate?: string;
  size?: number;
  tags?: string[];
  comment?: string;
  url?: string;
  rating?: number;
  label?: number;
  flag?: boolean;
  unread?: boolean;
  locked?: boolean;
  plainText?: string;
  wordCount?: number;
  characterCount?: number;
}

const getRecordProperties = async (
  input: GetRecordPropertiesInput
): Promise<RecordProperties> => {
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
        
        // Build lookup options
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
        
        // Get all properties
        const properties = {
          success: true,
          id: targetRecord.id(),
          uuid: targetRecord.uuid(),
          name: targetRecord.name(),
          path: targetRecord.path(),
          location: targetRecord.location(),
          recordType: targetRecord.recordType(),
          kind: targetRecord.kind(),
          creationDate: targetRecord.creationDate() ? targetRecord.creationDate().toString() : null,
          modificationDate: targetRecord.modificationDate() ? targetRecord.modificationDate().toString() : null,
          additionDate: targetRecord.additionDate() ? targetRecord.additionDate().toString() : null,
          size: targetRecord.size(),
          tags: targetRecord.tags(),
          comment: targetRecord.comment(),
          url: targetRecord.url(),
          rating: targetRecord.rating(),
          label: targetRecord.label(),
          flag: targetRecord.flag(),
          unread: targetRecord.unread(),
          locked: targetRecord.locking(),
          wordCount: targetRecord.wordCount(),
          characterCount: targetRecord.characterCount()
        };
        
        // Only include plain text for text-based records and limit size
        if (targetRecord.recordType() === "markdown" || 
            targetRecord.recordType() === "formatted note" || 
            targetRecord.recordType() === "txt") {
          const plainText = targetRecord.plainText();
          if (plainText && plainText.length > 0) {
            // Limit to first 1000 characters to avoid overwhelming responses
            properties.plainText = plainText.length > 1000 ? 
              plainText.substring(0, 1000) + "..." : 
              plainText;
          }
        }
        
        return JSON.stringify(properties);
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<RecordProperties>(script);
};

export const getRecordPropertiesTool: Tool = {
  name: "get_record_properties",
  description:
    "Get detailed properties and metadata for a DEVONthink record. This tool returns a comprehensive set of properties, including dates, size, tags, and more.\n\nRecord identification methods (in order of reliability):\n1. **UUID** (recommended): Globally unique identifier that works across all databases\n2. **ID + Database**: Database-specific ID requires specifying the database name\n3. **DEVONthink Path**: Internal DEVONthink location path like '/Inbox/My Document' (NOT filesystem paths like '/Users/.../')\n\n**Important Path Note**: Use DEVONthink's internal location paths (shown in the 'Path' column in DEVONthink), not filesystem paths. Example: '/Projects/2024/Report.pdf' not '/Users/david/Databases/MyDB.dtBase2/Files.noindex/...'\n\nWhen using ID, always specify the database name for accurate results. The tool will search recursively through all groups to find records by ID.\n\nReturns both UUID and ID in the result for future reference.",
  inputSchema: zodToJsonSchema(GetRecordPropertiesSchema) as ToolInput,
  run: getRecordProperties,
};
