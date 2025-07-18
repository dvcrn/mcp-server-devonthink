import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

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

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        let searchScope;
        
        // Determine search scope
        if ("${groupName || ""}") {
          const groupSearchResults = theApp.search("${groupName}", { in: theApp.currentDatabase() });
          const groups = groupSearchResults.filter(r => r.recordType() === "group");
          if (groups.length > 0) {
            searchScope = groups[0];
          } else {
            return JSON.stringify({
              success: false,
              error: "Group not found: ${groupName}"
            });
          }
        } else {
          searchScope = theApp.currentDatabase();
        }
        
        // Build search options
        const searchOptions = { in: searchScope };
        ${comparison ? `searchOptions.comparison = "${comparison}";` : ""}
        ${
          excludeSubgroups
            ? `searchOptions.excludeSubgroups = ${excludeSubgroups};`
            : ""
        }
        
        // Perform the search
        const searchResults = theApp.search("${query}", searchOptions);
        
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
    "Search for records in DEVONthink with various options and filters",
  inputSchema: zodToJsonSchema(SearchSchema) as ToolInput,
  run: search,
};
