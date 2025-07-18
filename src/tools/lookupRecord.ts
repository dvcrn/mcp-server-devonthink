import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const LookupRecordSchema = z
  .object({
    lookupType: z
      .enum(["filename", "path", "url", "tags", "comment", "contentHash"])
      .describe("The type of lookup to perform"),
    value: z.string().describe("The value to search for"),
    tags: z
      .array(z.string())
      .optional()
      .describe(
        "Array of tags to search for (only used when lookupType is 'tags')"
      ),
    matchAnyTag: z
      .boolean()
      .optional()
      .describe(
        "Whether to match any tag instead of all tags (only used when lookupType is 'tags')"
      ),
    databaseName: z
      .string()
      .optional()
      .describe(
        "The name of the database to search in (searches current database if not provided)"
      ),
    limit: z
      .number()
      .optional()
      .describe("Maximum number of results to return (default: 50)"),
  })
  .strict();

type LookupRecordInput = z.infer<typeof LookupRecordSchema>;

interface LookupResult {
  success: boolean;
  error?: string;
  results?: Array<{
    id: number;
    name: string;
    path: string;
    location: string;
    recordType: string;
    kind: string;
    creationDate?: string;
    modificationDate?: string;
    tags?: string[];
    size?: number;
    url?: string;
    comment?: string;
  }>;
  totalCount?: number;
}

const lookupRecord = async (
  input: LookupRecordInput
): Promise<LookupResult> => {
  const {
    lookupType,
    value,
    tags,
    matchAnyTag,
    databaseName,
    limit = 50,
  } = input;

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        let searchDatabase;
        
        // Determine search database
        if ("${databaseName || ""}") {
          const databases = theApp.databases();
          searchDatabase = databases.find(db => db.name() === "${databaseName}");
          if (!searchDatabase) {
            return JSON.stringify({
              success: false,
              error: "Database not found: ${databaseName}"
            });
          }
        } else {
          searchDatabase = theApp.currentDatabase();
        }
        
        let searchResults;
        const searchOptions = { in: searchDatabase };
        
        // Perform the appropriate lookup
        switch ("${lookupType}") {
          case "filename":
            searchResults = theApp.lookupRecordsWithFile("${value}", searchOptions);
            break;
          case "path":
            searchResults = theApp.lookupRecordsWithPath("${value}", searchOptions);
            break;
          case "url":
            searchResults = theApp.lookupRecordsWithURL("${value}", searchOptions);
            break;
          case "comment":
            searchResults = theApp.lookupRecordsWithComment("${value}", searchOptions);
            break;
          case "contentHash":
            searchResults = theApp.lookupRecordsWithContentHash("${value}", searchOptions);
            break;
          case "tags":
            const tagArray = ${
              tags ? JSON.stringify(tags) : '["' + value + '"]'
            };
            const tagOptions = { in: searchDatabase };
            ${matchAnyTag ? "tagOptions.any = true;" : ""}
            searchResults = theApp.lookupRecordsWithTags(tagArray, tagOptions);
            break;
          default:
            return JSON.stringify({
              success: false,
              error: "Invalid lookup type: ${lookupType}"
            });
        }
        
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
          
          // Include URL if available
          if (record.url && record.url()) {
            result.url = record.url();
          }
          
          // Include comment if available
          if (record.comment && record.comment()) {
            result.comment = record.comment();
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

  return await executeJxa<LookupResult>(script);
};

export const lookupRecordTool: Tool = {
  name: "lookup_record",
  description:
    "Look up records in DEVONthink by specific attributes like filename, path, URL, tags, comment, or content hash. Note: filename lookups require exact matches (no wildcards), tags can be arrays for multiple tag matching, paths and URLs must be exact matches.",
  inputSchema: zodToJsonSchema(LookupRecordSchema) as ToolInput,
  run: lookupRecord,
};
