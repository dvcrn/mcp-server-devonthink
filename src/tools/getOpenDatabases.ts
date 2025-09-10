import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const GetOpenDatabasesSchema = z.object({}).strict();

interface DatabaseInfo {
	id: number;
	uuid: string;
	name: string;
	path: string;
	filename: string;
	encrypted: boolean;
	auditProof: boolean;
	readOnly: boolean;
	spotlightIndexing: boolean;
	versioning: boolean;
	comment?: string;
}

interface GetOpenDatabasesResult {
	success: boolean;
	error?: string;
	databases?: DatabaseInfo[];
	totalCount?: number;
}

const getOpenDatabases = async (): Promise<GetOpenDatabasesResult> => {
	const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        const databases = theApp.databases();
        
        if (!databases || databases.length === 0) {
          return JSON.stringify({
            success: true,
            databases: [],
            totalCount: 0
          });
        }
        
        const databaseInfos = databases.map(db => {
          const info = {
            id: db.id(),
            uuid: db.uuid(),
            name: db.name(),
            path: db.path(),
            filename: db.filename(),
            encrypted: db.encrypted(),
            auditProof: db.auditProof(),
            readOnly: db.readOnly(),
            spotlightIndexing: db.spotlightIndexing(),
            versioning: db.versioning()
          };
          
          // Add comment if available
          if (db.comment && db.comment()) {
            info.comment = db.comment();
          }
          
          return info;
        });
        
        return JSON.stringify({
          success: true,
          databases: databaseInfos,
          totalCount: databases.length
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

	return await executeJxa<GetOpenDatabasesResult>(script);
};

export const getOpenDatabasesTool: Tool = {
	name: "get_open_databases",
	description:
		"Get a list of all currently open databases in DEVONthink. This tool is useful for discovering available databases and their properties, such as name, path, and encryption status. The returned database names can be used in other tools.\n\nIMPORTANT - Database UUIDs for Claude Code Operations:\nThe UUID field in the results is ESSENTIAL for database root operations:\n- Use the database UUID as parentGroupUuid in create_record to create at database root\n- Use the database UUID as destinationGroupUuid in move_record to move to database root\n- Use the database UUID as parentGroupUuid in create_from_url to create at database root\n\nExample: Database UUID '5E47D6F2-5E0C-4E30-A6ED-2AC92116C3E1' represents the true root level of that database.",
	inputSchema: zodToJsonSchema(GetOpenDatabasesSchema) as ToolInput,
	run: getOpenDatabases,
};
