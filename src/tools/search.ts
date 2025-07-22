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
    query: z.string().describe("The search query string"),
    groupUuid: z
      .string()
      .optional()
      .describe("The UUID of the group to search in (most reliable method)"),
    groupId: z
      .number()
      .optional()
      .describe("The ID of the group to search in (requires databaseName)"),
    groupPath: z
      .string()
      .optional()
      .describe("The path of the group to search in (e.g., '/Trips/2025')"),
    databaseName: z
      .string()
      .optional()
      .describe("The database name (required when using groupId)"),
    useCurrentGroup: z
      .boolean()
      .optional()
      .describe(
        "Search in the currently selected group in DEVONthink (ignores other group parameters)"
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
        "Filter results by record type (e.g., 'PDF' for PDF files, 'group' for folders)"
      ),
    comparison: z
      .enum(["no case", "no umlauts", "fuzzy", "related"])
      .optional()
      .describe("The comparison type for the search"),
    excludeSubgroups: z
      .boolean()
      .optional()
      .describe("Whether to exclude subgroups from the search"),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of results to return (default: 50)"),
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
  description:
    "Search for records in DEVONthink. This tool is useful for general text-based queries and can be scoped to a specific group. It supports various comparison options and returns a list of matching records with their properties including both ID and UUID.\n\n**Search query syntax examples:**\n- Simple text: `invoice 2024`\n- Boolean operators: `travel AND (berlin OR munich)`, `invoice NOT paid`\n- Exact phrase: `\"exact phrase here\"`\n- Wildcards: `doc*` (matches document, documentation, etc.)\n- Field searches: `name:\"meeting notes\"`, `comment:important`\n- Type filtering: `kind:pdf`, `kind:group`, `kind:markdown`, `kind:!group` (exclude groups)\n- Name searches: `name:foo kind:pdf`, `name:~thailand` (contains thailand)\n- Date searches: `kind:pdf created:Yesterday`, `kind:pdf created:#3days`, `created>=2025-07-14 created<=2025-07-21`\n- Tag searches: `tags:urgent`, `tags:(urgent OR important)`\n\n**Correct date syntax:**\n- Recent: `created:Yesterday`, `created:#3days`, `created:#1week`\n- Specific dates: `created>=2025-07-14`, `created<=2025-07-21`\n- Combined: `kind:document created>=2025-07-14 created<=2025-07-21`\n\n**Search scope options (in order of efficiency):**\n1. **useCurrentGroup** - Search in currently selected group (instant)\n2. **groupUuid** - Direct UUID lookup (fastest)\n3. **groupId + databaseName** - Direct ID lookup (fast)\n4. **groupPath** - Direct DEVONthink location path, e.g., '/Trips/2025' (NOT filesystem paths)\n\n**Examples:**\n- Search in current group: `useCurrentGroup: true`\n- Search PDFs only: `recordType: 'PDF'`\n- Search in specific folder by UUID: `groupUuid: '5557A251-0062-4DD9-9DA5-4CFE9DEE627B'`\n- Search in folder by path: `groupPath: '/Trips/2025'`\n- Recent PDFs: `query: 'kind:pdf created:#3days'`\n- Complex query: `query: 'name:foo kind:pdf created>=2025-07-14'`\n\n**Record type filters:** group, markdown, PDF, bookmark, formatted note, txt, rtf, rtfd, webarchive, quicktime, picture, smart group\n\n**Comparison options:**\n- 'no case': Case insensitive\n- 'no umlauts': Diacritics insensitive\n- 'fuzzy': Fuzzy matching\n- 'related': Find related content\n\nNote: Special characters in queries are automatically escaped. The tool returns both the record ID (database-specific) and UUID (globally unique) for each result.",
  inputSchema: zodToJsonSchema(SearchSchema) as ToolInput,
  run: search,
};
