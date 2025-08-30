import { z } from "zod";
import { createDevonThinkTool } from "./base/DevonThinkTool.js";

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
    parentGroupUuid: z
      .string()
      .optional()
      .describe(
        "The UUID of the parent group (defaults to the database's incoming group)"
      ),
    databaseName: z
      .string()
      .optional()
      .describe(
        "The name of the database to create the record in (defaults to current database)"
      ),
  })
  .strict();

type CreateRecordInput = z.infer<typeof CreateRecordSchema>;

interface CreateRecordResult {
  success: boolean;
  recordId?: number;
  name?: string;
  uuid?: string;
  error?: string;
}

export const createRecordTool = createDevonThinkTool<CreateRecordInput, CreateRecordResult>({
  name: "create_record",
  description:
    "Create a new record in DEVONthink. This tool can create various record types, including groups, markdown files, and bookmarks. Use the `parentGroupUuid` to specify a location, otherwise it will be created in the database's incoming group. The tool returns the `uuid` of the new record, which can be used in other tools.\n\nIMPORTANT - Database Root vs Inbox:\n- No parentGroupUuid = creates in database's Inbox (incoming group)\n- To create at database root: use parentGroupUuid with the database UUID\n- Get database UUID first using get_open_databases tool\n\nExample workflow for root creation:\n1. Use get_open_databases to get database UUID (e.g., '5E47D6F2-5E0C-4E30-A6ED-2AC92116C3E1')\n2. Use create_record with parentGroupUuid: '5E47D6F2-5E0C-4E30-A6ED-2AC92116C3E1'",
  inputSchema: CreateRecordSchema,
  buildScript: (input, helpers) => {
    const { name, type, content, url, parentGroupUuid, databaseName } = input;
    
    return helpers.wrapInTryCatch(`
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Get target database
      ${helpers.buildDatabaseLookup(databaseName)}
      
      // Get the parent group
      let destinationGroup;
      ${parentGroupUuid ? `
        destinationGroup = theApp.getRecordWithUuid(${helpers.formatValue(parentGroupUuid)});
        if (!destinationGroup) {
          throw new Error("Parent group with UUID not found: ${helpers.escapeString(parentGroupUuid)}");
        }
      ` : `
        destinationGroup = targetDatabase.incomingGroup();
      `}
      
      // Create the record properties using bracket notation
      const recordProps = {};
      recordProps["name"] = ${helpers.formatValue(name)};
      recordProps["type"] = ${helpers.formatValue(type)};
      ${content ? `recordProps["content"] = ${helpers.formatValue(content)};` : ''}
      ${url ? `recordProps["URL"] = ${helpers.formatValue(url)};` : ''}
      
      // Create the record
      const newRecord = theApp.createRecordWith(recordProps, { in: destinationGroup });
      
      if (newRecord) {
        const result = {};
        result["success"] = true;
        result["recordId"] = newRecord.id();
        result["name"] = newRecord.name();
        result["uuid"] = newRecord.uuid();
        return JSON.stringify(result);
      } else {
        const result = {};
        result["success"] = false;
        result["error"] = "Failed to create record";
        return JSON.stringify(result);
      }
    `);
  },
});