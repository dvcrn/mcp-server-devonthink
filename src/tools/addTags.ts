import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const AddTagsSchema = z
  .object({
    uuid: z.string().describe("The UUID of the record to add tags to"),
    tags: z.array(z.string()).describe("An array of tags to add"),
    databaseName: z
      .string()
      .optional()
      .describe(
        "The name of the database to add tags to the record in (optional)"
      ),
  })
  .strict();

type AddTagsInput = z.infer<typeof AddTagsSchema>;

interface AddTagsResult {
  success: boolean;
  error?: string;
}

const addTags = async (input: AddTagsInput): Promise<AddTagsResult> => {
  const { uuid, tags, databaseName } = input;

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        const record = theApp.getRecordWithUuid("${uuid}");
        
        if (!record) {
          return JSON.stringify({
            success: false,
            error: "Record with UUID ${uuid} not found"
          });
        }

        if ("${
          databaseName || ""
        }" && record.database().name() !== "${databaseName}") {
          return JSON.stringify({
            success: false,
            error: "Record with UUID ${uuid} not found in database ${databaseName}"
          });
        }
        
        const existingTags = record.tags();
        const newTags = [...new Set([...existingTags, ...${JSON.stringify(
          tags
        )}])];
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

  return await executeJxa<AddTagsResult>(script);
};

export const addTagsTool: Tool = {
  name: "add_tags",
  description: "Adds tags to a specific record in DEVONthink.",
  inputSchema: zodToJsonSchema(AddTagsSchema) as ToolInput,
  run: addTags,
};
