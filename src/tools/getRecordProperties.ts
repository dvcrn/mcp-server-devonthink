import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import {
  escapeStringForJXA,
  formatValueForJXA,
  isJXASafeString,
} from "../utils/escapeString.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const GetRecordPropertiesSchema = z
  .object({
    uuid: z.string().optional().describe("The UUID of the record"),
    recordId: z
      .number()
      .optional()
      .describe("The ID of the record to get properties for"),
    recordName: z
      .string()
      .optional()
      .describe(
        "The name of the record to get properties for (if ID not provided)"
      ),
    recordPath: z
      .string()
      .optional()
      .describe(
        "The path of the record to get properties for (if ID not provided)"
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
      data.recordName !== undefined ||
      data.recordPath !== undefined,
    {
      message:
        "Either uuid, recordId, recordName, or recordPath must be provided",
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
      
      try {
        let targetRecord;
        
        let targetDatabase;
        if (${formatValueForJXA(databaseName)}) {
          const databases = theApp.databases();
          targetDatabase = databases.find(db => db.name() === ${formatValueForJXA(databaseName)});
          if (!targetDatabase) {
            throw new Error("Database not found: " + ${formatValueForJXA(databaseName)});
          }
        } else {
          targetDatabase = theApp.currentDatabase();
        }

        // Find the record - try multiple approaches
        if (${formatValueForJXA(uuid)}) {
          // UUID is the most reliable method
          targetRecord = theApp.getRecordWithUuid(${formatValueForJXA(uuid)});
        } else if (${recordId !== undefined ? recordId : "null"}) {
          // For ID lookup, search in the database
          // This is more comprehensive than just checking contents()
          const searchQuery = "id:" + ${recordId};
          const searchResults = theApp.search(searchQuery, { in: targetDatabase });
          if (searchResults && searchResults.length > 0) {
            // Verify the ID matches exactly
            targetRecord = searchResults.find(r => r.id() === ${recordId});
          }
          
          // If not found via search, try a more exhaustive approach
          if (!targetRecord) {
            // Function to recursively search all groups
            function findRecordById(group, id) {
              const children = group.children();
              for (let child of children) {
                if (child.id() === id) {
                  return child;
                }
                if (child.recordType() === "group") {
                  const found = findRecordById(child, id);
                  if (found) return found;
                }
              }
              return null;
            }
            
            targetRecord = findRecordById(targetDatabase.root(), ${recordId});
          }
        } else if (${formatValueForJXA(recordName)}) {
          const searchResults = theApp.search(${formatValueForJXA(recordName)}, { in: targetDatabase });
          targetRecord = searchResults.find(r => r.name() === ${formatValueForJXA(recordName)});
        } else if (${formatValueForJXA(recordPath)}) {
          const searchResults = theApp.lookupRecordsWithPath(${formatValueForJXA(recordPath)}, { in: targetDatabase });
          if (searchResults && searchResults.length > 0) {
            targetRecord = searchResults[0];
          }
        }
        
        if (!targetRecord) {
          let errorDetails = "Record not found";
          if (${recordId !== undefined ? recordId : "null"}) {
            errorDetails = "Record with ID " + ${recordId} + " not found in database '" + targetDatabase.name() + "'";
          } else if (${formatValueForJXA(uuid)}) {
            errorDetails = "Record with UUID " + ${formatValueForJXA(uuid)} + " not found";
          } else if (${formatValueForJXA(recordName)}) {
            errorDetails = "Record with name " + ${formatValueForJXA(recordName)} + " not found in database '" + targetDatabase.name() + "'";
          }
          return JSON.stringify({
            success: false,
            error: errorDetails
          });
        }
        
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
    "Get detailed properties and metadata for a DEVONthink record. This tool returns a comprehensive set of properties, including dates, size, tags, and more.\n\nRecord identification methods (in order of reliability):\n1. **UUID** (recommended): Globally unique identifier that works across all databases\n2. **ID + Database**: Database-specific ID requires specifying the database name\n3. **Name**: Searches for exact name match (may return wrong record if duplicates exist)\n4. **Path**: File system path for indexed records\n\nWhen using ID, always specify the database name for accurate results. The tool will search recursively through all groups to find records by ID.\n\nReturns both UUID and ID in the result for future reference.",
  inputSchema: zodToJsonSchema(GetRecordPropertiesSchema) as ToolInput,
  run: getRecordProperties,
};
