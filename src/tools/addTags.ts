import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { escapeStringForJXA, formatValueForJXA, isJXASafeString } from "../utils/escapeString.js";
import { getRecordLookupHelpers } from "../utils/jxaHelpers.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const AddTagsSchema = z
	.object({
		uuid: z.string().describe("Record UUID to add tags to"),
		tags: z.array(z.string()).describe("Tags to add"),
	})
	.strict();

type AddTagsInput = z.infer<typeof AddTagsSchema>;

interface AddTagsResult {
	success: boolean;
	error?: string;
}

const addTags = async (input: AddTagsInput): Promise<AddTagsResult> => {
	const { uuid, tags } = input;

	// Validate string inputs
	if (!isJXASafeString(uuid)) {
		return { success: false, error: "UUID contains invalid characters" };
	}
	for (const tag of tags) {
		if (!isJXASafeString(tag)) {
			return { success: false, error: `Tag "${tag}" contains invalid characters` };
		}
	}

	const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Inject helper functions
      ${getRecordLookupHelpers()}
      
      try {
        // Use the unified lookup function for consistency
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
        const existingTags = record.tags();
        record.tags = existingTags.concat(${JSON.stringify(tags)});
        
        return JSON.stringify({
          success: true
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

	return await executeJxa<AddTagsResult>(script);
};

export const addTagsTool: Tool = {
	name: "add_tags",
	description:
		'Adds tags to a DEVONthink record.\n\nExample:\n{\n  "uuid": "1234-5678-90AB-CDEF",\n  "tags": ["important", "work"]\n}',
	inputSchema: zodToJsonSchema(AddTagsSchema) as ToolInput,
	run: addTags,
};
