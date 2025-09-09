import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const ListGroupContentSchema = z
  .object({
    uuid: z
      .string()
      .optional()
      .describe(
        "UUID of the group to list content from (optional, defaults to root)"
      ),
    databaseName: z
      .string()
      .optional()
      .describe(
        "Database to get the record properties from (optional)"
      ),
  })
  .strict();

type ListGroupContentInput = z.infer<typeof ListGroupContentSchema>;

interface RecordInfo {
  uuid: string;
  name: string;
  recordType: string;
}

interface ListGroupContentResult {
  success: boolean;
  error?: string;
  records?: RecordInfo[];
}

const listGroupContent = async (
  input: ListGroupContentInput
): Promise<ListGroupContentResult> => {
  const { uuid, databaseName } = input;

  const getDatabaseJxa = `
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
  `;

  const getGroupJxa =
    uuid && uuid !== "/"
      ? `const group = theApp.getRecordWithUuid("${uuid}");`
      : `const group = targetDatabase.root();`;

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        ${getDatabaseJxa}
        ${getGroupJxa}
        
        if (!group) {
          return JSON.stringify({
            success: false,
            error: "Group not found"
          });
        }
        
        const type = group.recordType();
        if (type !== "group" && type !== "smart group") {
            return JSON.stringify({
                success: false,
                error: "Record is not a group or smart group. Type is: " + type
            });
        }
        
        const children = group.children();
        const records = children.map(record => ({
          uuid: record.uuid(),
          name: record.name(),
          recordType: record.recordType()
        }));
        
        return JSON.stringify({
          success: true,
          records: records
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<ListGroupContentResult>(script);
};

export const listGroupContentTool: Tool = {
  name: "listGroupContent",
  title: "List Group Content",
  description: "Lists the content of a specific group in DEVONthink.\n\nExample:\n{\n  \"uuid\": \"1234-5678-90AB-CDEF\"\n}",
  inputSchema: zodToJsonSchema(ListGroupContentSchema) as ToolInput,
  run: listGroupContent,
};
