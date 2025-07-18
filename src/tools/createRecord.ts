import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const CreateRecordSchema = z
  .object({
    name: z.string().describe("The name of the record to create"),
    type: z
      .string()
      .describe(
        "The record type (e.g., 'markdown', 'formatted note', 'bookmark', 'group')"
      ),
    content: z
      .string()
      .optional()
      .describe("The content of the record (for text-based records)"),
    url: z.string().optional().describe("The URL for bookmark records"),
    parentGroup: z
      .string()
      .optional()
      .describe(
        "The name or path of the parent group (defaults to current group)"
      ),
  })
  .strict();

type CreateRecordInput = z.infer<typeof CreateRecordSchema>;

const createRecord = async (
  input: CreateRecordInput
): Promise<{
  success: boolean;
  recordId?: number;
  name?: string;
  error?: string;
}> => {
  const { name, type, content, url, parentGroup } = input;

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        // Get the parent group
        let destinationGroup;
        if ("${parentGroup || ""}") {
          // Try to find the group by name or path
          const searchResults = theApp.search("${parentGroup}", { in: theApp.currentDatabase() });
          const groups = searchResults.filter(r => r.recordType() === "group");
          if (groups.length > 0) {
            destinationGroup = groups[0];
          } else {
            throw new Error("Parent group not found: ${parentGroup}");
          }
        } else {
          destinationGroup = theApp.currentGroup();
        }
        
        // Create the record properties
        const recordProps = {
          name: "${name}",
          type: "${type}"
        };
        
        // Add content if provided
        ${
          content
            ? `recordProps.content = \`${content.replace(/`/g, "\\`")}\`;`
            : ""
        }
        
        // Add URL if provided
        ${url ? `recordProps.URL = "${url}";` : ""}
        
        // Create the record
        const newRecord = theApp.createRecordWith(recordProps, { in: destinationGroup });
        
        if (newRecord) {
          return JSON.stringify({
            success: true,
            recordId: newRecord.id(),
            name: newRecord.name()
          });
        } else {
          return JSON.stringify({
            success: false,
            error: "Failed to create record"
          });
        }
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<{
    success: boolean;
    recordId?: number;
    name?: string;
    error?: string;
  }>(script);
};

export const createRecordTool: Tool = {
  name: "create_record",
  description: "Create a new record in DEVONthink with specified properties",
  inputSchema: zodToJsonSchema(CreateRecordSchema) as ToolInput,
  run: createRecord,
};
