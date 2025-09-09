import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const GetCurrentDatabaseSchema = z.object({}).strict();

interface DatabaseInfo {
  id: number;
  uuid: string;
  name: string;
  path: string;
  filename: string;
  encrypted: boolean;
  revisionProof?: boolean; // DEVONthink 4.1 and later
  auditProof?: boolean;    // DEVONthink before 4.1
  readOnly: boolean;
  spotlightIndexing: boolean;
  versioning: boolean;
  comment?: string;
}

interface GetCurrentDatabaseResult {
  success: boolean;
  error?: string;
  database?: DatabaseInfo;
}

const getCurrentDatabase = async (): Promise<GetCurrentDatabaseResult> => {
  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        const currentDb = theApp.currentDatabase();
        
        if (!currentDb) {
          return JSON.stringify({
            success: false,
            error: "No current database selected"
          });
        }
        
        const databaseInfo = {
          id: currentDb.id(),
          uuid: currentDb.uuid(),
          name: currentDb.name(),
          path: currentDb.path(),
          filename: currentDb.filename(),
          encrypted: currentDb.encrypted(),
          readOnly: currentDb.readOnly(),
          spotlightIndexing: currentDb.spotlightIndexing(),
          versioning: currentDb.versioning()
        };
        
        // Handle audit/revision proof compatibility: before 4.1 vs 4.1 and later
        try {
          databaseInfo["revisionProof"] = currentDb.revisionProof(); // 4.1 and later
        } catch (e) {
          try {
            databaseInfo["auditProof"] = currentDb.auditProof(); // before 4.1
          } catch (e2) {
            // fallback if neither works - don't add any property
          }
        }
        
        // Add comment if available
        if (currentDb.comment && currentDb.comment()) {
          databaseInfo.comment = currentDb.comment();
        }
        
        return JSON.stringify({
          success: true,
          database: databaseInfo
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<GetCurrentDatabaseResult>(script);
};

export const currentDatabaseTool: Tool = {
  name: "current_database",
  description:
    "Get information about the currently selected/active database in DEVONthink. This tool returns detailed properties of the database that is currently in focus, including its UUID, name, path, and various settings. Useful for determining which database operations will target by default.",
  inputSchema: zodToJsonSchema(GetCurrentDatabaseSchema) as ToolInput,
  run: getCurrentDatabase,
};
