import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { type Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { escapeStringForJXA, isJXASafeString } from "../utils/escapeString.js";
import { validateFilePath, createSecurityMessage } from "../utils/pathSecurity.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const ImportFileSchema = z
	.object({
		filePath: z.string().describe("Absolute path to the file to import"),
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

	// Security validation - check file path for security risks
	const pathValidation = validateFilePath(filePath, {
		allowUserHome: true,
		allowTempFiles: true, // Allow temp files for legitimate use cases
		allowRelativePaths: false,
	});

	if (!pathValidation.isValid) {
		return {
			success: false,
			error: createSecurityMessage(pathValidation),
		};
	}

	// Additional validation for user inputs that go into JXA scripts
	if (customName && !isJXASafeString(customName)) {
		return {
			success: false,
			error: "Security: Custom name contains patterns that could cause script execution issues",
		};
	}

	if (databaseName && !isJXASafeString(databaseName)) {
		return {
			success: false,
			error: "Security: Database name contains unsafe characters",
		};
	}

	const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;

      // Helper function to create error responses
      function createErrorResponse(errorMessage) {
        const response = {};
        response["success"] = false;
        response["error"] = errorMessage;
        return JSON.stringify(response);
      }

      try {
        const pFilePath = ${filePath ? `"${escapeStringForJXA(filePath)}"` : "null"};
        const pParentGroupUuid = ${parentGroupUuid ? `"${escapeStringForJXA(parentGroupUuid)}"` : "null"};
        const pDatabaseName = ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"};
        const pCustomName = ${customName ? `"${escapeStringForJXA(customName)}"` : "null"};

        if (!pFilePath) {
          return createErrorResponse("File path is required");
        }

        // Let DEVONthink handle file existence checking during import

        // Get target database
        let targetDatabase;
        if (pDatabaseName) {
          const databases = theApp.databases();
          targetDatabase = databases.find(db => db.name() === pDatabaseName);
          if (!targetDatabase) {
            return createErrorResponse("Database not found: " + pDatabaseName);
          }
        } else {
          targetDatabase = theApp.currentDatabase();
          if (!targetDatabase) {
            return createErrorResponse("No current database available");
          }
        }

        // Get target group
        let targetGroup;
        if (pParentGroupUuid) {
          try {
            targetGroup = theApp.getRecordWithUuid(pParentGroupUuid);
            if (!targetGroup) {
              return createErrorResponse("Parent group not found with UUID: " + pParentGroupUuid);
            }
          } catch (e) {
            return createErrorResponse("Invalid parent group UUID: " + pParentGroupUuid + " - " + e.toString());
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
          return createErrorResponse("Failed to import file: " + pFilePath);
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
        return createErrorResponse(error.toString());
      }
    })();
  `;

	return await executeJxa<ImportFileResult>(script);
};

export const importFileTool: Tool = {
	name: "import_file",
	description:
		"Import a file from the filesystem into DEVONthink, preserving file type and metadata. This tool uses DEVONthink native import functionality which handles all file types properly, including binary files, and preserves metadata unlike content-based record creation.",
	inputSchema: zodToJsonSchema(ImportFileSchema) as ToolInput,
	run: importFile,
};
