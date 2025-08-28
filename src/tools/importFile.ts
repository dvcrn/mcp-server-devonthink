import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { type Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { escapeStringForJXA } from "../utils/escapeString.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const ImportFileSchema = z
  .object({
    filePath: z
      .string()
      .describe("Absolute path to the file to import"),
    parentGroupUuid: z
      .string()
      .optional()
      .describe("UUID of the parent group (defaults to database inbox)"),
    databaseName: z
      .string()
      .optional()
      .describe("Name of the target database (defaults to current database)"),
    customName: z
      .string()
      .optional()
      .describe("Custom name for the imported record (defaults to filename)"),
  })
  .strict();

type ImportFileInput = z.infer<typeof ImportFileSchema>;

interface ImportFileResult {
  success: boolean;
  error?: string;
  importedRecord?: {
    uuid: string;
    name: string;
    location: string;
    recordType: string;
    size: number;
    createdDate: string;
  };
}

const importFile = async (input: ImportFileInput): Promise<ImportFileResult> => {
  const { filePath, parentGroupUuid, databaseName, customName } = input;

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        const pFilePath = ${filePath ? `"${escapeStringForJXA(filePath)}"` : "null"};
        const pParentGroupUuid = ${parentGroupUuid ? `"${escapeStringForJXA(parentGroupUuid)}"` : "null"};
        const pDatabaseName = ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"};
        const pCustomName = ${customName ? `"${escapeStringForJXA(customName)}"` : "null"};
        
        if (!pFilePath) {
          const errorResponse = {};
          errorResponse["success"] = false;
          errorResponse["error"] = "File path is required";
          return JSON.stringify(errorResponse);
        }
        
        // Let DEVONthink handle file existence checking during import
        
        // Get target database
        let targetDatabase;
        if (pDatabaseName) {
          const databases = theApp.databases();
          targetDatabase = databases.find(db => db.name() === pDatabaseName);
          if (!targetDatabase) {
            const errorResponse = {};
            errorResponse["success"] = false;
            errorResponse["error"] = "Database not found: " + pDatabaseName;
            return JSON.stringify(errorResponse);
          }
        } else {
          targetDatabase = theApp.currentDatabase();
          if (!targetDatabase) {
            const errorResponse = {};
            errorResponse["success"] = false;
            errorResponse["error"] = "No current database available";
            return JSON.stringify(errorResponse);
          }
        }
        
        // Get target group
        let targetGroup;
        if (pParentGroupUuid) {
          try {
            targetGroup = theApp.getRecordWithUuid(pParentGroupUuid);
            if (!targetGroup) {
              const errorResponse = {};
              errorResponse["success"] = false;
              errorResponse["error"] = "Parent group not found with UUID: " + pParentGroupUuid;
              return JSON.stringify(errorResponse);
            }
          } catch (e) {
            const errorResponse = {};
            errorResponse["success"] = false;
            errorResponse["error"] = "Invalid parent group UUID: " + pParentGroupUuid + " - " + e.toString();
            return JSON.stringify(errorResponse);
          }
        } else {
          targetGroup = targetDatabase.incomingGroup();
        }
        
        // Build import options for importPath
        const importJxaOptions = {};
        importJxaOptions["to"] = targetGroup;
        importJxaOptions["asIndexed"] = true; // Default to creating index entries

        // Import the file using DEVONthink's importPath method
        const importedRecord = theApp.importPath(pFilePath, importJxaOptions);
        
        // Apply custom name after import if provided (importPath doesn't support name option)
        if (importedRecord && pCustomName) {
          importedRecord.name = pCustomName;
        }
        
        if (!importedRecord) {
          const errorResponse = {};
          errorResponse["success"] = false;
          errorResponse["error"] = "Failed to import file: " + pFilePath;
          return JSON.stringify(errorResponse);
        }
        
        // Build response object
        const response = {};
        response["success"] = true;
        
        const recordInfo = {};
        recordInfo["uuid"] = importedRecord.uuid();
        recordInfo["name"] = importedRecord.name();
        recordInfo["location"] = importedRecord.location();
        recordInfo["recordType"] = importedRecord.recordType();
        recordInfo["size"] = importedRecord.size();
        recordInfo["createdDate"] = importedRecord.creationDate().toISOString();
        
        response["importedRecord"] = recordInfo;
        
        return JSON.stringify(response);
        
      } catch (error) {
        const errorResponse = {};
        errorResponse["success"] = false;
        errorResponse["error"] = error.toString();
        return JSON.stringify(errorResponse);
      }
    })();
  `;

  return await executeJxa<ImportFileResult>(script);
};

export const importFileTool: Tool = {
  name: "import_file",
  description: "Import a file from the filesystem into DEVONthink, preserving file type and metadata. This tool uses DEVONthink native import functionality which handles all file types properly, including binary files, and preserves metadata unlike content-based record creation.",
  inputSchema: zodToJsonSchema(ImportFileSchema) as ToolInput,
  run: importFile,
};