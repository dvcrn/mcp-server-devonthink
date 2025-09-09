import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import {
  escapeStringForJXA,
  isJXASafeString,
} from "../utils/escapeString.js";
import { getRecordLookupHelpers } from "../utils/jxaHelpers.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const UpdateRecordContentSchema = z
  .object({
    uuid: z.string().describe("UUID of the record to update"),
    content: z.string().describe("New content for the record"),
  })
  .strict();

type UpdateRecordContentInput = z.infer<typeof UpdateRecordContentSchema>;

interface UpdateRecordContentResult {
  success: boolean;
  error?: string;
  uuid?: string;
  name?: string;
  recordType?: string;
  updatedProperty?: string;
}

const updateRecordContent = async (
  input: UpdateRecordContentInput
): Promise<UpdateRecordContentResult> => {
  const { uuid, content } = input;

  // Validate string inputs
  if (!isJXASafeString(uuid)) {
    return { success: false, error: "UUID contains invalid characters" };
  }
  if (!isJXASafeString(content)) {
    return { success: false, error: "Content contains invalid characters" };
  }

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Inject helper functions
      ${getRecordLookupHelpers()}
      
      try {
        // Use the unified lookup function
        const lookupOptions = {};
        lookupOptions["uuid"] = ${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"};
        
        const lookupResult = getRecord(theApp, lookupOptions);
        
        if (!lookupResult.record) {
          const errorResponse = {};
          errorResponse["success"] = false;
          errorResponse["error"] = "Record with UUID " + (${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"} || "unknown") + " not found";
          return JSON.stringify(errorResponse);
        }
        
        const record = lookupResult.record;
        
        // Get record type to determine which property to update
        const recordType = record.recordType();
        const newContent = ${content ? `"${escapeStringForJXA(content)}"` : '""'};
        let updatedProperty = "";
        
        // Update content based on record type
        if (recordType === "HTML" || recordType === "webarchive") {
          // For HTML documents, update the source property
          record.source = newContent;
          updatedProperty = "source";
        } else {
          // For all other text-based formats (markdown, txt, rtf, formatted note),
          // use plainText which works consistently based on our testing
          record.plainText = newContent;
          updatedProperty = "plainText";
        }
        
        // Build success response
        const response = {};
        response["success"] = true;
        response["uuid"] = record.uuid();
        response["name"] = record.name();
        response["recordType"] = recordType;
        response["updatedProperty"] = updatedProperty;
        
        return JSON.stringify(response);
      } catch (error) {
        const errorResponse = {};
        errorResponse["success"] = false;
        errorResponse["error"] = error.toString();
        return JSON.stringify(errorResponse);
      }
    })();
  `;

  return await executeJxa<UpdateRecordContentResult>(script);
};

export const updateRecordContentTool: Tool = {
  name: "updateRecordContent",
  title: "Update Record Content",
  description: "Updates the content of an existing record in DEVONthink.\n\nExample:\n{\n  \"uuid\": \"1234-5678-90AB-CDEF\",\n  \"content\": \"# New Content\"\n}",
  inputSchema: zodToJsonSchema(UpdateRecordContentSchema) as ToolInput,
  run: updateRecordContent,
};