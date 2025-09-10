import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { escapeStringForJXA, formatValueForJXA, isJXASafeString } from "../utils/escapeString.js";
import { getRecordLookupHelpers } from "../utils/jxaHelpers.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const RemoveTagsSchema = z
	.object({
		uuid: z.string().describe("The UUID of the record to remove tags from"),
		tags: z.array(z.string()).describe("An array of tags to remove"),
		databaseName: z
			.string()
			.optional()
			.describe("The name of the database to remove tags from the record in (optional)"),
	})
	.strict();

type RemoveTagsInput = z.infer<typeof RemoveTagsSchema>;

interface RemoveTagsResult {
	success: boolean;
	error?: string;
}

const removeTags = async (input: RemoveTagsInput): Promise<RemoveTagsResult> => {
	const { uuid, tags, databaseName } = input;

	// Validate string inputs
	if (!isJXASafeString(uuid)) {
		return { success: false, error: "UUID contains invalid characters" };
	}
	for (const tag of tags) {
		if (!isJXASafeString(tag)) {
			return { success: false, error: `Tag "${tag}" contains invalid characters` };
		}
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
        
        const existingTags = record.tags();
        const tagsToRemove = new Set(${JSON.stringify(tags)});
        const newTags = existingTags.filter(tag => !tagsToRemove.has(tag));
        record.tags = newTags;
        
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

	return await executeJxa<RemoveTagsResult>(script);
};

export const removeTagsTool: Tool = {
	name: "remove_tags",
	description: "Removes tags from a specific record in DEVONthink.",
	inputSchema: zodToJsonSchema(RemoveTagsSchema) as ToolInput,
	run: removeTags,
};
