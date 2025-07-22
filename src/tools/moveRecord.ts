import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import {
  escapeStringForJXA,
  formatValueForJXA,
  isJXASafeString,
} from "../utils/escapeString.js";

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

  // Validate string inputs
  if (uuid && !isJXASafeString(uuid)) {
    return { success: false, error: "UUID contains invalid characters" };
  }
  if (recordName && !isJXASafeString(recordName)) {
    return { success: false, error: "Record name contains invalid characters" };
  }
  if (recordPath && !isJXASafeString(recordPath)) {
    return { success: false, error: "Record path contains invalid characters" };
  }
  if (destinationGroupUuid && !isJXASafeString(destinationGroupUuid)) {
    return { success: false, error: "Destination UUID contains invalid characters" };
  }
  if (databaseName && !isJXASafeString(databaseName)) {
    return { success: false, error: "Database name contains invalid characters" };
  }

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        let targetRecord;
        
        let targetDatabase;
        if (${formatValueForJXA(databaseName)}) {
          const databases = theApp.databases();
          targetDatabase = databases.find(db => db.name() === ${formatValueForJXA(databaseName)});
          if (!targetDatabase) {
            throw new Error("Database not found: " + ${formatValueForJXA(databaseName)});
          }
        } else {
          targetDatabase = theApp.currentDatabase();
        }

        // Find the record to move - improved lookup
        if (${formatValueForJXA(uuid)}) {
          targetRecord = theApp.getRecordWithUuid(${formatValueForJXA(uuid)});
        } else if (${recordId !== undefined ? recordId : "null"}) {
          // Improved ID lookup using search
          const searchQuery = "id:" + ${recordId};
          const searchResults = theApp.search(searchQuery, { in: targetDatabase });
          if (searchResults && searchResults.length > 0) {
            targetRecord = searchResults.find(r => r.id() === ${recordId});
          }
          
          // Fallback to recursive search
          if (!targetRecord) {
            function findRecordById(group, id) {
              const children = group.children();
              for (let child of children) {
                if (child.id() === id) {
                  return child;
                }
                if (child.recordType() === "group") {
                  const found = findRecordById(child, id);
                  if (found) return found;
                }
              }
              return null;
            }
            targetRecord = findRecordById(targetDatabase.root(), ${recordId});
          }
        } else if (${formatValueForJXA(recordName)}) {
          const searchResults = theApp.search(${formatValueForJXA(recordName)}, { in: targetDatabase });
          targetRecord = searchResults.find(r => r.name() === ${formatValueForJXA(recordName)});
        } else if (${formatValueForJXA(recordPath)}) {
          const searchResults = theApp.lookupRecordsWithPath(${formatValueForJXA(recordPath)}, { in: targetDatabase });
          if (searchResults && searchResults.length > 0) {
            targetRecord = searchResults[0];
          }
        }
        
        if (!targetRecord) {
          let errorDetails = "Record not found";
          if (${recordId !== undefined ? recordId : "null"}) {
            errorDetails = "Record with ID " + ${recordId} + " not found in database '" + targetDatabase.name() + "'";
          }
          return JSON.stringify({
            success: false,
            error: errorDetails
          });
        }
        
        // Find the destination group
        let destinationGroupRecord;
        if (${formatValueForJXA(destinationGroupUuid)}) {
          destinationGroupRecord = theApp.getRecordWithUuid(${formatValueForJXA(destinationGroupUuid)});
        }
        
        if (!destinationGroupRecord) {
          throw new Error("Destination group with UUID not found: " + ${formatValueForJXA(destinationGroupUuid)});
        }
        
        // Verify destination is a group
        if (destinationGroupRecord.recordType() !== "group" && destinationGroupRecord.recordType() !== "smart group") {
          throw new Error("Destination is not a group. Record type: " + destinationGroupRecord.recordType());
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
  description:
    "Move a record to a different group in DEVONthink. It's highly recommended to use the `uuid` for the record and `destinationGroupUuid` for the destination to ensure accurate moving.\n\nIMPORTANT - Moving to Database Root:\n- Cannot use '/' as destinationGroupUuid (tool limitation)\n- To move to database root: use destinationGroupUuid with the database UUID\n- Get database UUID first using get_open_databases tool\n\nExample workflow for root move:\n1. Use get_open_databases to get database UUID (e.g., '5E47D6F2-5E0C-4E30-A6ED-2AC92116C3E1')\n2. Use move_record with destinationGroupUuid: '5E47D6F2-5E0C-4E30-A6ED-2AC92116C3E1'",
  inputSchema: zodToJsonSchema(MoveRecordSchema) as ToolInput,
  run: moveRecord,
};
