import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import {
  escapeStringForJXA,
  formatValueForJXA,
  isJXASafeString,
} from "../utils/escapeString.js";
import { getRecordLookupHelpers } from "../utils/jxaHelpers.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const GetRecordContentSchema = z
  .object({
    uuid: z.string().describe("UUID of the record to get content from"),
    databaseName: z
      .string()
      .optional()
      .describe("Database name to get the record from (optional)"),
  })
  .strict();

type GetRecordContentInput = z.infer<typeof GetRecordContentSchema>;

interface GetRecordContentResult {
  success: boolean;
  error?: string;
  content?: string;
}

const getRecordContent = async (
  input: GetRecordContentInput
): Promise<GetRecordContentResult> => {
  const { uuid, databaseName } = input;

  // Validate string inputs
  if (!isJXASafeString(uuid)) {
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
      
      try {
        // Use the unified lookup function
        const lookupOptions = {
          uuid: ${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"}
        };
        
        const lookupResult = getRecord(theApp, lookupOptions);
        
        if (!lookupResult.record) {
          return JSON.stringify({
            success: false,
            error: "Record with UUID " + (${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"} || "unknown") + " not found"
          });
        }
        
        const record = lookupResult.record;
        
        // Verify database if specified
        const pDatabaseName = ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"};
        if (pDatabaseName && record.database().name() !== pDatabaseName) {
          return JSON.stringify({
            success: false,
            error: "Record with UUID " + (${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"} || "unknown") + " not found in database " + (pDatabaseName || "unknown")
          });
        }

        let content;
        const recordType = record.recordType();

        if (recordType === "markdown" || recordType === "txt" || recordType === "formatted note") {
            content = record.plainText();
        } else if (recordType === "rtf") {
            content = record.richText();
        } else {
            content = record.plainText();
        }
        
        return JSON.stringify({
          success: true,
          content: content
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<GetRecordContentResult>(script);
};

export const getRecordContentTool: Tool = {
  name: "get_record_content",
  description: "Gets the content of a specific record in DEVONthink.\n\nExample:\n{\n  \"uuid\": \"1234-5678-90AB-CDEF\"\n}",
  inputSchema: zodToJsonSchema(GetRecordContentSchema) as ToolInput,
  run: getRecordContent,
};
