import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { type Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
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
            searchResults = theApp.lookupRecordsWithFile("${value}", { in: searchDatabase });
            break;
          case "path":
            searchResults = theApp.lookupRecordsWithPath("${value}", { in: searchDatabase });
            break;
          case "url":
            searchResults = theApp.lookupRecordsWithURL("${value}", { in: searchDatabase });
            break;
          case "comment":
            searchResults = theApp.lookupRecordsWithComment("${value}", { in: searchDatabase });
            break;
          case "contentHash":
            searchResults = theApp.lookupRecordsWithContentHash("${value}", { in: searchDatabase });
            break;
          case "tags":
            const tagArray = ${tags ? JSON.stringify(tags) : "[]"};
            if (tagArray.length === 0 && "${value}") {
              tagArray.push("${value}");
            }
            const tagOptions = { in: searchDatabase };
            if (${matchAnyTag}) {
              tagOptions.any = true;
            }
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
    "Look up records in DEVONthink by a specific attribute. This tool is ideal for finding records when you have an exact value to match, such as a filename, URL, or tag. It does not support wildcards or partial matches.\n\nExamples:\n- Find by filename: lookupType='filename', value='report.pdf'\n- Find by URL: lookupType='url', value='https://example.com'\n- Find by single tag: lookupType='tags', value='important' (or tags=['important'])\n- Find by multiple tags (all): lookupType='tags', tags=['work', 'project']\n- Find by multiple tags (any): lookupType='tags', tags=['work', 'project'], matchAnyTag=true\n- Find by path: lookupType='path', value='/Documents/Research'\n- Find by comment: lookupType='comment', value='Meeting notes'\n- Find by content hash: lookupType='contentHash', value='abc123...'\n\nFor tag lookups, you can either use the 'tags' parameter for an array of tags, or use the 'value' parameter for a single tag.",
  inputSchema: zodToJsonSchema(LookupRecordSchema) as ToolInput,
  run: lookupRecord,
};
