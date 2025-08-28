import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { type Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { escapeStringForJXA } from "../utils/escapeString.js";
import { validateFilePaths, createSecurityMessage } from "../utils/pathSecurity.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const ImportOptionsSchema = z.object({
  createIndex: z
    .boolean()
    .optional()
    .default(true)
    .describe("Create index entries for imported files"),
  duplicateDetection: z
    .enum(["skip", "rename", "replace"])
    .optional()
    .default("rename")
    .describe("How to handle duplicate files"),
  preserveCreationDate: z
    .boolean()
    .optional()
    .default(true)
    .describe("Preserve original file creation dates"),
  addTags: z
    .array(z.string())
    .optional()
    .describe("Tags to add to all imported records"),
  recursive: z
    .boolean()
    .optional()
    .default(true)
    .describe("Import subdirectories recursively (applies to directory sources)"),
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
    .describe("Whether to preserve directory structure"),
});

const ImportWithOptionsSchema = z
  .object({
    sourcePaths: z
      .array(z.string())
      .min(1)
      .describe("Array of file/directory paths to import"),
    parentGroupUuid: z
      .string()
      .optional()
      .describe("UUID of the parent group (defaults to database inbox)"),
    databaseName: z
      .string()
      .optional()
      .describe("Name of the target database (defaults to current database)"),
    importOptions: ImportOptionsSchema
      .optional()
      .describe("Import configuration options"),
  })
  .strict();

type ImportWithOptionsInput = z.infer<typeof ImportWithOptionsSchema>;

interface ImportWithOptionsResult {
  success: boolean;
  error?: string;
  importedRecords?: Array<{
    uuid: string;
    name: string;
    location: string;
    recordType: string;
    size: number;
    createdDate: string;
    sourcePath: string;
  }>;
  skippedFiles?: Array<{
    path: string;
    reason: string;
  }>;
  duplicateFiles?: Array<{
    path: string;
    action: string;
    existingRecord?: string;
  }>;
  totalFiles?: number;
  importedCount?: number;
  skippedCount?: number;
  duplicateCount?: number;
}

const importWithOptions = async (input: ImportWithOptionsInput): Promise<ImportWithOptionsResult> => {
  const { sourcePaths, parentGroupUuid, databaseName, importOptions } = input;
  
  // Security validation - check all source paths for security risks
  const pathValidation = validateFilePaths(sourcePaths, {
    allowUserHome: true,
    allowTempFiles: true,
    allowRelativePaths: false
  });

  if (pathValidation.invalid.length > 0) {
    const blockedPaths = pathValidation.invalid.map(item =>
      `${item.path}: ${createSecurityMessage(item.result)}`
    ).join('; ');

    return {
      success: false,
      error: `Security validation failed for paths - ${blockedPaths}`
    };
  }

  // Extract import options with defaults
  const createIndex = importOptions?.createIndex ?? true;
  const duplicateDetection = importOptions?.duplicateDetection ?? "rename";
  const preserveCreationDate = importOptions?.preserveCreationDate ?? true;
  const addTags = importOptions?.addTags ?? [];
  const recursive = importOptions?.recursive ?? true;
  const fileFilter = importOptions?.fileFilter;
  const excludeHidden = importOptions?.excludeHidden ?? true;
  const preservePath = importOptions?.preservePath ?? true;

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      const sysEvents = Application("System Events");
      
      try {
        const pSourcePaths = [${sourcePaths.map(path => `"${escapeStringForJXA(path)}"`).join(', ')}];
        const pParentGroupUuid = ${parentGroupUuid ? `"${escapeStringForJXA(parentGroupUuid)}"` : "null"};
        const pDatabaseName = ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"};
        
        // Import options
        const pCreateIndex = ${createIndex};
        const pDuplicateDetection = ${duplicateDetection ? `"${escapeStringForJXA(duplicateDetection)}"` : `"rename"`};
        const pPreserveCreationDate = ${preserveCreationDate};
        const pAddTags = [${addTags.map(tag => `"${escapeStringForJXA(tag)}"`).join(', ')}];
        const pRecursive = ${recursive};
        const pFileFilter = ${fileFilter ? `"${escapeStringForJXA(fileFilter)}"` : "null"};
        const pExcludeHidden = ${excludeHidden};
        const pPreservePath = ${preservePath};
        
        if (!pSourcePaths || pSourcePaths.length === 0) {
          const errorResponse = {};
          errorResponse["success"] = false;
          errorResponse["error"] = "Source paths array is required and cannot be empty";
          return JSON.stringify(errorResponse);
        }
        
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
        
        // Helper function to check for duplicates
        function findDuplicateRecord(filename, parentGroup) {
          try {
            const children = parentGroup.children();
            return children.find(record => record.name() === filename) || null;
          } catch (e) {
            return null;
          }
        }
        
        // Helper function to generate unique name
        function generateUniqueName(baseName, parentGroup) {
          let counter = 1;
          let testName = baseName;
          
          while (findDuplicateRecord(testName, parentGroup)) {
            const nameparts = baseName.split(".");
            if (nameparts.length > 1) {
              const extension = nameparts.pop();
              const name = nameparts.join(".");
              testName = name + " " + counter + "." + extension;
            } else {
              testName = baseName + " " + counter;
            }
            counter++;
          }
          
          return testName;
        }
        
        // Helper function to get files recursively
        function getFilesFromPath(sourcePath, basePath) {
          const files = [];
          
          // Safer existence check using try-catch
          let isFile = false;
          let isFolder = false;
          
          try {
            isFile = sysEvents.files[sourcePath].exists();
          } catch (e) {
            isFile = false;
          }
          
          try {
            isFolder = sysEvents.folders[sourcePath].exists();
          } catch (e) {
            isFolder = false;
          }
          
          if (!isFile && !isFolder) {
            return files;
          }
          
          // Check if it is a file
          if (isFile) {
            const fileName = sysEvents.files[sourcePath].name();
            
            // Skip hidden files if requested
            if (pExcludeHidden && fileName.startsWith(".")) {
              return files;
            }
            
            // Check file filter
            if (matchesFilter(fileName, pFileFilter)) {
              files.push({
                path: sourcePath,
                name: fileName,
                isDirectory: false,
                relativePath: basePath ? sourcePath.substring(basePath.length + 1) : fileName
              });
            }
            return files;
          }
          
          // It is a directory
          const folder = sysEvents.folders[sourcePath];
          if (!folder.exists()) return files;
          
          try {
            // Get files in current folder
            const folderFiles = folder.files();
            for (let i = 0; i < folderFiles.length; i++) {
              const file = folderFiles[i];
              const fileName = file.name();
              const filePath = file.toString();
              
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
                  relativePath: basePath ? filePath.substring(basePath.length + 1) : fileName
                });
              }
            }
            
            // Get subdirectories if recursive
            if (pRecursive) {
              const subFolders = folder.folders();
              for (let i = 0; i < subFolders.length; i++) {
                const subFolder = subFolders[i];
                const subFolderName = subFolder.name();
                
                // Skip hidden folders if requested
                if (pExcludeHidden && subFolderName.startsWith(".")) {
                  continue;
                }
                
                const subFiles = getFilesFromPath(subFolder.toString(), basePath || sourcePath);
                files.push(...subFiles);
              }
            }
          } catch (e) {
            // Skip folders that cannot be accessed
          }
          
          return files;
        }
        
        // Collect all files from all source paths
        let allFiles = [];
        for (let i = 0; i < pSourcePaths.length; i++) {
          const sourcePath = pSourcePaths[i];
          
          // Safer check for folder existence
          let isSourceFolder = false;
          try {
            isSourceFolder = sysEvents.folders[sourcePath].exists();
          } catch (e) {
            isSourceFolder = false;
          }
          
          const files = getFilesFromPath(sourcePath, isSourceFolder ? sourcePath : null);
          allFiles.push(...files);
        }
        
        if (allFiles.length === 0) {
          const response = {};
          response["success"] = true;
          response["importedRecords"] = [];
          response["skippedFiles"] = [];
          response["duplicateFiles"] = [];
          response["totalFiles"] = 0;
          response["importedCount"] = 0;
          response["skippedCount"] = 0;
          response["duplicateCount"] = 0;
          return JSON.stringify(response);
        }
        
        const importedRecords = [];
        const skippedFiles = [];
        const duplicateFiles = [];
        
        // Process files
        for (let i = 0; i < allFiles.length; i++) {
          const fileInfo = allFiles[i];
          
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
            
            // Check for duplicates and build import options
            const duplicateRecord = findDuplicateRecord(fileInfo.name, importGroup);

            const importJxaOptions = {};
            importJxaOptions["to"] = importGroup;
            importJxaOptions["asIndexed"] = pCreateIndex;
            importJxaOptions["preserveCreationDate"] = pPreserveCreationDate;

            if (duplicateRecord) {
              const dupInfo = {};
              dupInfo["path"] = fileInfo.path;
              
              if (pDuplicateDetection === "skip") {
                dupInfo["action"] = "skipped";
                dupInfo["existingRecord"] = duplicateRecord.uuid();
                duplicateFiles.push(dupInfo);
                continue;
              } else if (pDuplicateDetection === "replace") {
                theApp.delete({ record: duplicateRecord });
                dupInfo["action"] = "replaced";
                dupInfo["existingRecord"] = duplicateRecord.uuid();
                duplicateFiles.push(dupInfo);
              } else { // rename
                const uniqueName = generateUniqueName(fileInfo.name, importGroup);
                importJxaOptions["name"] = uniqueName;
                dupInfo["action"] = "renamed to " + uniqueName;
                dupInfo["existingRecord"] = duplicateRecord.uuid();
                duplicateFiles.push(dupInfo);
              }
            }
            
            // Import the file using DEVONthink's importPath method
            const importedRecord = theApp.importPath(fileInfo.path, importJxaOptions);
            
            if (importedRecord) {
              // Apply tags if specified
              if (pAddTags.length > 0) {
                importedRecord.tags = pAddTags;
              }
              
              const recordInfo = {};
              recordInfo["uuid"] = importedRecord.uuid();
              recordInfo["name"] = importedRecord.name();
              recordInfo["location"] = importedRecord.location();
              recordInfo["recordType"] = importedRecord.recordType();
              recordInfo["size"] = importedRecord.size();
              recordInfo["createdDate"] = importedRecord.creationDate().toISOString();
              recordInfo["sourcePath"] = fileInfo.path;
              
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
        response["duplicateFiles"] = duplicateFiles;
        response["totalFiles"] = allFiles.length;
        response["importedCount"] = importedRecords.length;
        response["skippedCount"] = skippedFiles.length;
        response["duplicateCount"] = duplicateFiles.length;
        
        return JSON.stringify(response);
        
      } catch (error) {
        const errorResponse = {};
        errorResponse["success"] = false;
        errorResponse["error"] = error.toString();
        return JSON.stringify(errorResponse);
      }
    })();
  `;

  return await executeJxa<ImportWithOptionsResult>(script);
};

export const importWithOptionsTool: Tool = {
  name: "import_with_options",
  description: "Import files with advanced options and transformations. This tool provides comprehensive import functionality with batch processing, duplicate handling, filtering, tagging, and directory structure preservation. Ideal for complex import operations with specific requirements.",
  inputSchema: zodToJsonSchema(ImportWithOptionsSchema) as ToolInput,
  run: importWithOptions,
};