import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const GetRecordContentSchema = z
  .object({
    uuid: z.string().describe("The UUID of the record to get content from"),
    databaseName: z
      .string()
      .optional()
      .describe("The name of the database to get the record from (optional)"),
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
  description: "Gets the content of a specific record in DEVONthink.",
  inputSchema: zodToJsonSchema(GetRecordContentSchema) as ToolInput,
  run: getRecordContent,
};
