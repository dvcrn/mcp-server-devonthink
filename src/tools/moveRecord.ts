import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const MoveRecordSchema = z
  .object({
    uuid: z.string().optional().describe("The UUID of the record"),
    recordId: z.number().optional().describe("The ID of the record to move"),
    recordName: z
      .string()
      .optional()
      .describe("The name of the record to move (if ID not provided)"),
    recordPath: z
      .string()
      .optional()
      .describe("The path of the record to move (if ID not provided)"),
    destinationGroupUuid: z
      .string()
      .optional()
      .describe("The UUID of the destination group"),
    databaseName: z
      .string()
      .optional()
      .describe(
        "The name of the database to move the record in (defaults to current database)"
      ),
  })
  .strict()
  .refine(
    (data) =>
      data.uuid !== undefined ||
      data.recordId !== undefined ||
      data.recordName !== undefined ||
      data.recordPath !== undefined,
    {
      message:
        "Either uuid, recordId, recordName, or recordPath must be provided",
    }
  );

type MoveRecordInput = z.infer<typeof MoveRecordSchema>;

const moveRecord = async (
  input: MoveRecordInput
): Promise<{ success: boolean; newLocation?: string; error?: string }> => {
  const {
    uuid,
    recordId,
    recordName,
    recordPath,
    destinationGroupUuid,
    databaseName,
  } = input;

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

        // Find the record to move
        if ("${uuid || ""}") {
          targetRecord = theApp.getRecordWithUuid("${uuid}");
        } else if (${recordId || "null"}) {
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
        
        // Find the destination group
        let destinationGroupRecord;
        if ("${destinationGroupUuid || ""}") {
          destinationGroupRecord = theApp.getRecordWithUuid("${destinationGroupUuid}");
        }
        
        if (!destinationGroupRecord) {
          throw new Error("Destination group with UUID not found: ${destinationGroupUuid}");
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
