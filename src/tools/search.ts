import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import {
  escapeSearchQuery,
  formatValueForJXA,
  isJXASafeString,
} from "../utils/escapeString.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const SearchSchema = z
  .object({
    query: z.string().describe("The search query string"),
    groupName: z
      .string()
      .optional()
      .describe(
        "The name of the group to search in (searches entire database if not provided)"
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
  .strict();

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
  const { query, groupName, comparison, excludeSubgroups, limit = 50 } = input;

  // Validate inputs
  if (!isJXASafeString(query)) {
    return {
      success: false,
      error: "Search query contains invalid characters",
    };
  }

  if (groupName && !isJXASafeString(groupName)) {
    return {
      success: false,
      error: "Group name contains invalid characters",
    };
  }

  // Escape the search query
  const escapedQuery = escapeSearchQuery(query);
  const escapedGroupName = groupName ? escapeSearchQuery(groupName) : "";

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        let searchScope;
        
        // Determine search scope
        if (${formatValueForJXA(groupName)}) {
          const groupSearchResults = theApp.search(${formatValueForJXA(
            groupName
          )}, { in: theApp.currentDatabase() });
          if (!groupSearchResults) {
            return JSON.stringify({
              success: false,
              error: "Group not found: " + ${formatValueForJXA(groupName)}
            });
          }
          const groups = groupSearchResults.filter(r => r.recordType() === "group");
          if (groups.length > 0) {
            searchScope = groups[0];
          } else {
            return JSON.stringify({
              success: false,
              error: "Group not found: " + ${formatValueForJXA(groupName)}
            });
          }
        } else {
          searchScope = null; // Search all databases
        }
        
        // Build search options
        const searchOptions = {};
        if (searchScope) {
          searchOptions.in = searchScope;
        }
        ${
          comparison
            ? `searchOptions.comparison = ${formatValueForJXA(comparison)};`
            : ""
        }
        ${
          excludeSubgroups !== undefined
            ? `searchOptions.excludeSubgroups = ${excludeSubgroups};`
            : ""
        }
        
        // Perform the search
        const searchResults = theApp.search("${escapedQuery}", searchOptions);
        
        if (!searchResults || searchResults.length === 0) {
          return JSON.stringify({
            success: true,
            results: [],
            totalCount: 0
          });
        }
        
        // Limit results and extract properties
        const limitedResults = searchResults.slice(0, ${limit});
        const results = limitedResults.map(record => {
          const result = {
            id: record.id(),
            uuid: record.uuid(),
            name: record.name(),
            path: record.path(),
            location: record.location(),
            recordType: record.recordType(),
            kind: record.kind(),
            creationDate: record.creationDate() ? record.creationDate().toString() : null,
            modificationDate: record.modificationDate() ? record.modificationDate().toString() : null,
            tags: record.tags(),
            size: record.size()
          };
          
          // Include score if available
          try {
            if (record.score && record.score() !== undefined) {
              result.score = record.score();
            }
          } catch (e) {
            // Score might not be available for all search types
          }
          
          return result;
        });
        
        return JSON.stringify({
          success: true,
          results: results,
          totalCount: searchResults.length
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<SearchResult>(script);
};

export const searchTool: Tool = {
  name: "search",
  description:
    "Search for records in DEVONthink. This tool is useful for general text-based queries and can be scoped to a specific group. It supports various comparison options and returns a list of matching records with their properties including both ID and UUID.\n\nSearch query examples:\n- Simple text: 'invoice 2024'\n- With operators: 'travel AND (berlin OR munich)'\n- Exact phrase: '\"exact phrase here\"'\n\nNote: Special characters in queries are automatically escaped. The tool returns both the record ID (database-specific) and UUID (globally unique) for each result.\n\nComparison options:\n- 'no case': Case insensitive\n- 'no umlauts': Diacritics insensitive\n- 'fuzzy': Fuzzy matching\n- 'related': Find related content",
  inputSchema: zodToJsonSchema(SearchSchema) as ToolInput,
  run: search,
};
