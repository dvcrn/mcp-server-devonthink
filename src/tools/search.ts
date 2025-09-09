import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import {
  escapeSearchQuery,
  formatValueForJXA,
  isJXASafeString,
  escapeStringForJXA,
} from "../utils/escapeString.js";
import {
  getRecordLookupHelpers,
  getDatabaseHelper,
  isGroupHelper,
} from "../utils/jxaHelpers.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const SearchSchema = z
  .object({
    query: z.string().describe("Search query string"),
    groupUuid: z
      .string()
      .optional()
      .describe("UUID of the group to search in (optional)"),
    groupId: z
      .number()
      .optional()
      .describe("ID of the group to search in (optional, requires databaseName)"),
    groupPath: z
      .string()
      .optional()
      .describe("Path of the group to search in (e.g., '/Trips/2025') (optional)"),
    databaseName: z
      .string()
      .optional()
      .describe("Database name (optional, required with groupId)"),
    useCurrentGroup: z
      .boolean()
      .optional()
      .describe(
        "Search in the currently selected group (optional)"
      ),
    recordType: z
      .enum([
        "group",
        "markdown",
        "PDF",
        "bookmark",
        "formatted note",
        "txt",
        "rtf",
        "rtfd",
        "webarchive",
        "quicktime",
        "picture",
        "smart group",
      ])
      .optional()
      .describe(
        "Filter results by record type (optional)"
      ),
    comparison: z
      .enum(["no case", "no umlauts", "fuzzy", "related"])
      .optional()
      .describe("Comparison type for the search (optional)"),
    excludeSubgroups: z
      .boolean()
      .optional()
      .describe("Exclude subgroups from the search (optional)"),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of results to return (optional)"),
  })
  .strict()
  .refine(
    (data) => {
      // If groupId is provided, databaseName must also be provided
      if (data.groupId !== undefined && !data.databaseName) {
        return false;
      }
      // If useCurrentGroup is true, other group parameters should not be provided
      if (
        data.useCurrentGroup &&
        (data.groupUuid || data.groupId || data.groupPath)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "databaseName is required when using groupId; when useCurrentGroup is true, other group parameters should not be provided",
    }
  );

type SearchInput = z.infer<typeof SearchSchema>;

interface SearchResult {
  success: boolean;
  error?: string;
  results?: Array<{
    id: number;
    uuid: string;
    name: string;
    path: string;
    location: string;
    recordType: string;
    kind: string;
    score?: number;
    creationDate?: string;
    modificationDate?: string;
    tags?: string[];
    size?: number;
  }>;
  totalCount?: number;
}

const search = async (input: SearchInput): Promise<SearchResult> => {
  const {
    query,
    groupUuid,
    groupId,
    groupPath,
    databaseName,
    useCurrentGroup,
    recordType,
    comparison,
    excludeSubgroups,
    limit = 50,
  } = input;

  // Validate inputs
  if (!isJXASafeString(query)) {
    return {
      success: false,
      error: "Search query contains invalid characters",
    };
  }

  if (groupUuid && !isJXASafeString(groupUuid)) {
    return {
      success: false,
      error: "Group UUID contains invalid characters",
    };
  }

  if (groupPath && !isJXASafeString(groupPath)) {
    return {
      success: false,
      error: "Group path contains invalid characters",
    };
  }

  if (databaseName && !isJXASafeString(databaseName)) {
    return {
      success: false,
      error: "Database name contains invalid characters",
    };
  }

  // Escape the search query
  const escapedQuery = escapeSearchQuery(query);

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Inject helper functions
      ${getRecordLookupHelpers()}
      ${getDatabaseHelper}
      ${isGroupHelper}
      
      try {
        // Define variables for lookup
        const pGroupUuid = ${
          groupUuid ? `"${escapeStringForJXA(groupUuid)}"` : "null"
        };
        const pGroupId = ${groupId !== undefined ? groupId : "null"};
        const pGroupPath = ${
          groupPath ? `"${escapeStringForJXA(groupPath)}"` : "null"
        };
        const pDatabaseName = ${
          databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"
        };
        const pUseCurrentGroup = ${useCurrentGroup === true};
        const pRecordType = ${formatValueForJXA(recordType)};
        const pComparison = ${formatValueForJXA(comparison)};
        const pExcludeSubgroups = ${
          excludeSubgroups !== undefined ? excludeSubgroups : "null"
        };
        const pLimit = ${limit};


        let searchScope;
        let targetDatabase;
        
        // Get target database
        targetDatabase = getDatabase(theApp, pDatabaseName);
        
        // Determine search scope
        if (pUseCurrentGroup) {
          searchScope = theApp.currentGroup();
          if (!searchScope) {
            return JSON.stringify({ success: false, error: "No group is currently selected in DEVONthink" });
          }
          if (!isGroup(searchScope)) {
            return JSON.stringify({ success: false, error: "Current selection is not a group. Type: " + searchScope.recordType() });
          }
        } else if (pGroupUuid || pGroupId || pGroupPath) {
          
          let lookupOptions;
          try {
            lookupOptions = {};
            lookupOptions["uuid"] = pGroupUuid;
            lookupOptions["id"] = pGroupId;
            lookupOptions["path"] = pGroupPath;
            lookupOptions["database"] = targetDatabase;
            // Don't stringify if it contains database object
            const safeOptions = {};
            safeOptions["uuid"] = lookupOptions["uuid"];
            safeOptions["id"] = lookupOptions["id"];
            safeOptions["path"] = lookupOptions["path"];
            safeOptions["hasDatabase"] = lookupOptions["database"] ? true : false;
          } catch (e) {
            return JSON.stringify({ success: false, error: "Error creating lookup options: " + e.toString() });
          }
          
          const lookupResult = getRecord(theApp, lookupOptions);
          
          // Don't try to stringify the record object
          
          if (!lookupResult.record) {
            let errorDetails = lookupResult.error || "Group not found";
            if (pGroupUuid) {
              errorDetails = "Group with UUID not found: " + pGroupUuid;
            } else if (pGroupId) {
              errorDetails = "Group with ID " + pGroupId + " not found in database '" + (targetDatabase ? targetDatabase.name() : 'Unknown') + "'";
            } else if (pGroupPath) {
              errorDetails = "Group at path not found: " + pGroupPath;
            }
            return JSON.stringify({ success: false, error: errorDetails });
          }
          
          searchScope = lookupResult.record;
          
          try {
            const isGroupResult = isGroup(searchScope);
            if (!isGroupResult) {
              const recordType = searchScope.recordType();
              return JSON.stringify({ success: false, error: "Specified record is not a group. Type: " + recordType });
            }
          } catch (e) {
            return JSON.stringify({ success: false, error: "Error checking if record is a group: " + e.toString() });
          }
        } else {
          searchScope = null; // Search all databases
        }
        
        const searchOptions = {};
        if (searchScope) {
          searchOptions["in"] = searchScope;
        }
        if (pComparison) {
          searchOptions["comparison"] = pComparison;
        }
        if (pExcludeSubgroups !== null) {
          searchOptions["excludeSubgroups"] = pExcludeSubgroups;
        }
        
        
        let searchResults;
        try {
          searchResults = theApp.search("${escapedQuery}", searchOptions);
        } catch (e) {
          return JSON.stringify({ success: false, error: "Error executing search: " + e.toString() });
        }
        
        if (!searchResults || searchResults.length === 0) {
          return JSON.stringify({ success: true, results: [], totalCount: 0 });
        }
        
        let filteredResults = searchResults;
        if (pRecordType) {
          filteredResults = searchResults.filter(record => {
            try {
              return record.recordType() === pRecordType;
            } catch (e) {
              return false;
            }
          });
        }
        
        const limitedResults = filteredResults.slice(0, pLimit);
        
        const results = limitedResults.map((record, index) => {
          try {
            const result = {};
            result["id"] = record.id();
            result["uuid"] = record.uuid();
            result["name"] = record.name();
            result["path"] = record.path();
            result["location"] = record.location();
            result["recordType"] = record.recordType();
            result["kind"] = record.kind();
            result["creationDate"] = record.creationDate() ? record.creationDate().toString() : null;
            result["modificationDate"] = record.modificationDate() ? record.modificationDate().toString() : null;
            result["tags"] = record.tags();
            result["size"] = record.size();
            
            try {
              if (record.score && record.score() !== undefined) {
                result["score"] = record.score();
              }
            } catch (e) {}
            
            return result;
          } catch (e) {
            throw e;
          }
        });
        
        return JSON.stringify({ success: true, results: results, totalCount: filteredResults.length });
      } catch (error) {
        return JSON.stringify({ success: false, error: error.toString() });
      }
    })();
  `;


  return await executeJxa<SearchResult>(script);
};

export const searchTool: Tool = {
  name: "search",
  title: "Search Records",
  description: "Search for records in DEVONthink.\n\nExample:\n{\n  \"query\": \"invoice 2024\"\n}",
  inputSchema: zodToJsonSchema(SearchSchema) as ToolInput,
  run: search,
};
