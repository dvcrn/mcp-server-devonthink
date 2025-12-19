import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { type Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { escapeStringForJXA } from "../utils/escapeString.js";
import { validateFilePath, createSecurityMessage } from "../utils/pathSecurity.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const ImportDirectorySchema = z
	.object({
		directoryPath: z.string().describe("Absolute path to the directory to import"),
		parentGroupUuid: z
			.string()
			.optional()
			.describe("UUID of the parent group (defaults to database inbox)"),
		databaseName: z
			.string()
			.optional()
			.describe("Name of the target database (defaults to current database)"),
		recursive: z
			.boolean()
			.optional()
			.default(true)
			.describe("Whether to import subdirectories recursively"),
		fileFilter: z
			.string()
			.optional()
			.describe("Glob pattern to filter files (e.g., *.md, *.{txt,md})"),
		excludeHidden: z
			.boolean()
			.optional()
			.default(true)
			.describe("Whether to exclude hidden files and directories"),
		preservePath: z
			.boolean()
			.optional()
			.default(true)
			.describe("Whether to preserve the directory structure in DEVONthink"),
	})
	.strict();

type ImportDirectoryInput = z.infer<typeof ImportDirectorySchema>;

interface ImportDirectoryResult {
	success: boolean;
	error?: string;
	importedRecords?: Array<{
		uuid: string;
		name: string;
		location: string;
		recordType: string;
		size: number;
		createdDate: string;
	}>;
	skippedFiles?: Array<{
		path: string;
		reason: string;
	}>;
	totalFiles?: number;
	importedCount?: number;
	skippedCount?: number;
}

const importDirectory = async (input: ImportDirectoryInput): Promise<ImportDirectoryResult> => {
	const {
		directoryPath,
		parentGroupUuid,
		databaseName,
		recursive,
		fileFilter,
		excludeHidden,
		preservePath,
	} = input;

	// Security validation - check directory path for security risks
	const pathValidation = validateFilePath(directoryPath, {
		allowUserHome: true,
		allowTempFiles: true,
		allowRelativePaths: false,
	});

	if (!pathValidation.isValid) {
		return {
			success: false,
			error: createSecurityMessage(pathValidation),
		};
	}

	const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      const sysEvents = Application("System Events");

      // Helper function to create error responses
      function createErrorResponse(errorMessage) {
        const response = {};
        response["success"] = false;
        response["error"] = errorMessage;
        return JSON.stringify(response);
      }

      try {
        const pDirectoryPath = ${directoryPath ? `"${escapeStringForJXA(directoryPath)}"` : "null"};
        const pParentGroupUuid = ${parentGroupUuid ? `"${escapeStringForJXA(parentGroupUuid)}"` : "null"};
        const pDatabaseName = ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"};
        const pRecursive = ${recursive};
        const pFileFilter = ${fileFilter ? `"${escapeStringForJXA(fileFilter)}"` : "null"};
        const pExcludeHidden = ${excludeHidden};
        const pPreservePath = ${preservePath};

        if (!pDirectoryPath) {
          return createErrorResponse("Directory path is required");
        }

        // Let DEVONthink handle directory existence checking during import

        // Determine which database to import into
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

        // Determine which group to import into
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
        
        // Helper function to check if filename matches filter
        function matchesFilter(filename, filter) {
          if (!filter) return true;
          
          // Simple wildcard matching - avoid complex regex in JXA
          if (filter === "*") return true;
          
          // Handle brace expansion patterns like *.{txt,md,js}
          if (filter.includes("{") && filter.includes("}")) {
            const parts = filter.split("{");
            if (parts.length === 2) {
              const prefix = parts[0]; // e.g., "*."
              const suffixPart = parts[1];
              const closeBraceIndex = suffixPart.indexOf("}");
              
              if (closeBraceIndex !== -1) {
                const extensions = suffixPart.substring(0, closeBraceIndex).split(",");
                const postfix = suffixPart.substring(closeBraceIndex + 1); // anything after }
                
                for (let i = 0; i < extensions.length; i++) {
                  const ext = extensions[i].trim();
                  const fullPattern = prefix + ext + postfix;
                  
                  if (matchesSimplePattern(filename, fullPattern)) {
                    return true;
                  }
                }
                return false;
              }
            }
          }
          
          return matchesSimplePattern(filename, filter);
        }
        
        // Helper function for simple pattern matching
        function matchesSimplePattern(filename, pattern) {
          // Basic extension matching
          if (pattern.startsWith("*.")) {
            const ext = pattern.substring(2);
            return filename.toLowerCase().endsWith("." + ext.toLowerCase());
          }
          
          // Exact match
          return filename.toLowerCase() === pattern.toLowerCase();
        }
        
        // Helper function to get files recursively
        function getFilesRecursively(folderPath, isRoot) {
          const files = [];
          
          // Check if folder exists first
          if (!sysEvents.folders[folderPath].exists()) {
            return files;
          }
          
          const folder = sysEvents.folders[folderPath];
          
          try {
            // Get files in current folder
            const folderFiles = folder.files();
            for (let i = 0; i < folderFiles.length; i++) {
              const file = folderFiles[i];
              const filePath = file.toString();
              const fileName = file.name();
              
              // Skip hidden files if requested
              if (pExcludeHidden && fileName.startsWith(".")) {
                continue;
              }
              
              // Check file filter
              if (matchesFilter(fileName, pFileFilter)) {
                files.push({
                  path: filePath,
                  name: fileName,
                  isDirectory: false,
                  relativePath: isRoot ? fileName : filePath.substring(pDirectoryPath.length + 1)
                });
              }
            }
            
            // Get subdirectories if recursive
            if (pRecursive) {
              const subFolders = folder.folders();
              for (let i = 0; i < subFolders.length; i++) {
                const subFolder = subFolders[i];
                const subFolderPath = subFolder.toString();
                const subFolderName = subFolder.name();
                
                // Skip hidden folders if requested
                if (pExcludeHidden && subFolderName.startsWith(".")) {
                  continue;
                }
                
                const subFiles = getFilesRecursively(subFolderPath, false);
                files.push(...subFiles);
              }
            }
          } catch (e) {
            // Skip folders that cannot be accessed
          }
          
          return files;
        }
        
        // Get all files to import
        const filesToImport = getFilesRecursively(pDirectoryPath, true);
        
        if (filesToImport.length === 0) {
          const response = {};
          response["success"] = true;
          response["importedRecords"] = [];
          response["skippedFiles"] = [];
          response["totalFiles"] = 0;
          response["importedCount"] = 0;
          response["skippedCount"] = 0;
          return JSON.stringify(response);
        }
        
        const importedRecords = [];
        const skippedFiles = [];
        
        // Import files
        for (let i = 0; i < filesToImport.length; i++) {
          const fileInfo = filesToImport[i];
          
          try {
            let importGroup = targetGroup;
            
            // Create subdirectory structure if preserving path
            if (pPreservePath && fileInfo.relativePath.includes("/")) {
              const pathParts = fileInfo.relativePath.split("/");
              pathParts.pop(); // Remove filename
              
              let currentGroup = targetGroup;
              for (let j = 0; j < pathParts.length; j++) {
                const folderName = pathParts[j];
                
                // Check if group already exists
                const children = currentGroup.children();
                const existingGroup = children.find(child =>
                  child.recordType() === "group" && child.name() === folderName
                );
                
                if (existingGroup) {
                  currentGroup = existingGroup;
                } else {
                  // Create new group
                  currentGroup = theApp.createRecordWith({
                    name: folderName,
                    type: "group"
                  }, { in: currentGroup });
                }
              }
              importGroup = currentGroup;
            }
            
            // Build import options
            const importJxaOptions = {};
            importJxaOptions["to"] = importGroup;
            importJxaOptions["asIndexed"] = true; // Default to creating index entries

            // Import the file using DEVONthink's importPath method
            const importedRecord = theApp.importPath(fileInfo.path, importJxaOptions);
            
            if (importedRecord) {
              const recordInfo = {};
              recordInfo["uuid"] = importedRecord.uuid();
              recordInfo["name"] = importedRecord.name();
              recordInfo["location"] = importedRecord.location();
              recordInfo["recordType"] = importedRecord.recordType();
              recordInfo["size"] = importedRecord.size();
              recordInfo["createdDate"] = importedRecord.creationDate().toISOString();
              
              importedRecords.push(recordInfo);
            } else {
              const skipInfo = {};
              skipInfo["path"] = fileInfo.path;
              skipInfo["reason"] = "Import failed";
              skippedFiles.push(skipInfo);
            }
          } catch (e) {
            const skipInfo = {};
            skipInfo["path"] = fileInfo.path;
            skipInfo["reason"] = "Error: " + e.toString();
            skippedFiles.push(skipInfo);
          }
        }
        
        // Build response
        const response = {};
        response["success"] = true;
        response["importedRecords"] = importedRecords;
        response["skippedFiles"] = skippedFiles;
        response["totalFiles"] = filesToImport.length;
        response["importedCount"] = importedRecords.length;
        response["skippedCount"] = skippedFiles.length;
        
        return JSON.stringify(response);
        
      } catch (error) {
        return createErrorResponse(error.toString());
      }
    })();
  `;

	return await executeJxa<ImportDirectoryResult>(script);
};

export const importDirectoryTool: Tool = {
	name: "import_directory",
	description:
		"Import a directory and its contents into DEVONthink, preserving structure. This tool recursively imports all files from a directory, optionally filtering by file patterns and preserving the folder hierarchy. Ideal for importing entire project structures or documentation folders.",
	inputSchema: zodToJsonSchema(ImportDirectorySchema) as ToolInput,
	run: importDirectory,
};
