import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { JXAScriptBuilder } from "../utils/jxaScriptBuilder.js";
import { isJXASafeString } from "../utils/escapeString.js";

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

const createRecord = async (
  input: CreateRecordInput
): Promise<{
  success: boolean;
  recordId?: number;
  name?: string;
  uuid?: string;
  error?: string;
}> => {
  const { name, type, content, url, parentGroupUuid, databaseName } = input;

  // Validate inputs
  if (!isJXASafeString(name)) {
    return {
      success: false,
      error: "Record name contains invalid characters"
    };
  }

  if (content && !isJXASafeString(content)) {
    return {
      success: false,
      error: "Content contains invalid characters"
    };
  }

  if (url && !isJXASafeString(url)) {
    return {
      success: false,
      error: "URL contains invalid characters"
    };
  }

  if (databaseName && !isJXASafeString(databaseName)) {
    return {
      success: false,
      error: "Database name contains invalid characters"
    };
  }

  // Build script using JXA Script Builder
  const builder = JXAScriptBuilder.createWithDefaults();
  
  // Add variables with automatic escaping
  builder
    .addVariable('recordName', name)
    .addVariable('recordType', type)
    .addVariable('recordContent', content || null)
    .addVariable('recordUrl', url || null)
    .addVariable('parentGroupUuid', parentGroupUuid || null)
    .addVariable('databaseName', databaseName || null);

  // Add main execution code
  builder.addTryCatch(`
    let targetDatabase;
    if (databaseName) {
      const databases = theApp.databases();
      targetDatabase = databases.find(db => db.name() === databaseName);
      if (!targetDatabase) {
        throw new Error("Database not found: " + databaseName);
      }
    } else {
      targetDatabase = theApp.currentDatabase();
    }

    // Get the parent group
    let destinationGroup;
    if (parentGroupUuid) {
      destinationGroup = theApp.getRecordWithUuid(parentGroupUuid);
      if (!destinationGroup) {
        throw new Error("Parent group with UUID not found: " + parentGroupUuid);
      }
    } else {
      destinationGroup = targetDatabase.incomingGroup();
    }
    
    // Create the record properties using bracket notation
    const recordProps = {};
    recordProps["name"] = recordName;
    recordProps["type"] = recordType;
    
    // Add content if provided
    if (recordContent !== null) {
      recordProps["content"] = recordContent;
    }
    
    // Add URL if provided
    if (recordUrl !== null) {
      recordProps["URL"] = recordUrl;
    }
    
    // Create the record (using parameter object with 'in' property)
    const createOptions = {};
    createOptions["in"] = destinationGroup;
    const newRecord = theApp.createRecordWith(recordProps, createOptions);
    
    if (newRecord) {
      const result = {};
      result["success"] = true;
      result["recordId"] = newRecord.id();
      result["name"] = newRecord.name();
      result["uuid"] = newRecord.uuid();
      return JSON.stringify(result);
    } else {
      const errorResult = {};
      errorResult["success"] = false;
      errorResult["error"] = "Failed to create record";
      return JSON.stringify(errorResult);
    }
  `);

  // Validate the script
  const validation = builder.validate();
  if (!validation.valid && validation.errors && validation.errors.length > 0) {
    return {
      success: false,
      error: `Script validation failed: ${validation.errors[0].message}`
    };
  }

  const script = builder.build();

  // Execute with enhanced error handling
  return await executeJxa<{
    success: boolean;
    recordId?: number;
    name?: string;
    uuid?: string;
    error?: string;
  }>(script, {
    timeout: 10000, // 10 second timeout for record creation
    retries: 2 // Retry twice for transient failures
  });
};

export const createRecordTool: Tool = {
  name: "create_record",
  description:
    "Create a new record in DEVONthink. This tool can create various record types, including groups, markdown files, and bookmarks. Use the `parentGroupUuid` to specify a location, otherwise it will be created in the database's incoming group. The tool returns the `uuid` of the new record, which can be used in other tools.\n\nIMPORTANT - Database Root vs Inbox:\n- No parentGroupUuid = creates in database's Inbox (incoming group)\n- To create at database root: use parentGroupUuid with the database UUID\n- Get database UUID first using get_open_databases tool\n\nExample workflow for root creation:\n1. Use get_open_databases to get database UUID (e.g., '5E47D6F2-5E0C-4E30-A6ED-2AC92116C3E1')\n2. Use create_record with parentGroupUuid: '5E47D6F2-5E0C-4E30-A6ED-2AC92116C3E1'",
  inputSchema: zodToJsonSchema(CreateRecordSchema) as ToolInput,
  run: createRecord,
};