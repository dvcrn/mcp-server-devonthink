import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const MoveRecordSchema = z
  .object({
    recordId: z.number().optional().describe("The ID of the record to move"),
    recordName: z
      .string()
      .optional()
      .describe("The name of the record to move (if ID not provided)"),
    recordPath: z
      .string()
      .optional()
      .describe("The path of the record to move (if ID not provided)"),
    destinationGroup: z
      .string()
      .describe("The name or path of the destination group"),
  })
  .strict()
  .refine(
    (data) =>
      data.recordId !== undefined ||
      data.recordName !== undefined ||
      data.recordPath !== undefined,
    { message: "Either recordId, recordName, or recordPath must be provided" }
  );

type MoveRecordInput = z.infer<typeof MoveRecordSchema>;

const moveRecord = async (
  input: MoveRecordInput
): Promise<{ success: boolean; newLocation?: string; error?: string }> => {
  const { recordId, recordName, recordPath, destinationGroup } = input;

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        let targetRecord;
        
        // Find the record to move
        if (${recordId || "null"}) {
          const allRecords = theApp.currentDatabase().contents();
          targetRecord = allRecords.find(r => r.id() === ${recordId});
        } else if ("${recordName || ""}") {
          const searchResults = theApp.search("${recordName}", { in: theApp.currentDatabase() });
          targetRecord = searchResults.find(r => r.name() === "${recordName}");
        } else if ("${recordPath || ""}") {
          const searchResults = theApp.lookupRecordsWithPath("${recordPath}", { in: theApp.currentDatabase() });
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
        
        // Find the destination group
        let destinationGroupRecord;
        const groupSearchResults = theApp.search("${destinationGroup}", { in: theApp.currentDatabase() });
        const groups = groupSearchResults.filter(r => r.recordType() === "group");
        
        if (groups.length > 0) {
          destinationGroupRecord = groups[0];
        } else {
          // Try to find by path
          const pathResults = theApp.lookupRecordsWithPath("${destinationGroup}", { in: theApp.currentDatabase() });
          if (pathResults && pathResults.length > 0) {
            destinationGroupRecord = pathResults[0];
          }
        }
        
        if (!destinationGroupRecord) {
          return JSON.stringify({
            success: false,
            error: "Destination group not found: ${destinationGroup}"
          });
        }
        
        // Move the record
        const moveResult = theApp.move({ record: targetRecord, to: destinationGroupRecord });
        
        if (moveResult) {
          return JSON.stringify({
            success: true,
            newLocation: moveResult.location()
          });
        } else {
          return JSON.stringify({
            success: false,
            error: "Failed to move record"
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
    newLocation?: string;
    error?: string;
  }>(script);
};

export const moveRecordTool: Tool = {
  name: "move_record",
  description: "Move a record to a different group in DEVONthink",
  inputSchema: zodToJsonSchema(MoveRecordSchema) as ToolInput,
  run: moveRecord,
};
