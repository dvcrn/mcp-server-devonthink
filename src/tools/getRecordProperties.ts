import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const GetRecordPropertiesSchema = z
  .object({
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
      data.recordId !== undefined ||
      data.recordName !== undefined ||
      data.recordPath !== undefined,
    { message: "Either recordId, recordName, or recordPath must be provided" }
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
  const { recordId, recordName, recordPath, databaseName } = input;

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

        // Find the record
        if (${recordId || "null"}) {
          const allRecords = targetDatabase.contents();
          targetRecord = allRecords.find(r => r.id() === ${recordId});
        } else if ("${recordName || ""}") {
          const searchResults = theApp.search("${recordName}", { in: targetDatabase });
          targetRecord = searchResults.find(r => r.name() === "${recordName}");
        } else if ("${recordPath || ""}") {
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
  description: "Get detailed properties and metadata for a DEVONthink record",
  inputSchema: zodToJsonSchema(GetRecordPropertiesSchema) as ToolInput,
  run: getRecordProperties,
};
