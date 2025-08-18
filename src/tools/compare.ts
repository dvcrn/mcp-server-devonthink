import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { type Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import {
  escapeStringForJXA,
  formatValueForJXA,
  isJXASafeString,
} from "../utils/escapeString.js";
import { getRecordLookupHelpers, getDatabaseHelper } from "../utils/jxaHelpers.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const CompareSchema = z
  .object({
    recordUuid: z
      .string()
      .describe("The UUID of the primary record to compare"),
    compareWithUuid: z
      .string()
      .optional()
      .describe(
        "The UUID of the second record for direct comparison (optional)"
      ),
    databaseName: z
      .string()
      .optional()
      .describe(
        "The name of the database to search in (defaults to current database)"
      ),
    comparison: z
      .enum(["data comparison", "tags comparison"])
      .optional()
      .describe("The comparison type"),
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(20)
      .optional()
      .describe("Maximum number of similar records to return (default: 20, max: 100)"),
  })
  .strict();

type CompareInput = z.infer<typeof CompareSchema>;

interface CompareResult {
  success: boolean;
  error?: string;
  mode?: "single_record" | "two_record";
  similarRecords?: Array<{
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
  comparison?: {
    record1: {
      uuid: string;
      name: string;
      recordType: string;
      tags: string[];
      size: number;
    };
    record2: {
      uuid: string;
      name: string;
      recordType: string;
      tags: string[];
      size: number;
    };
    similarities: {
      sameType: boolean;
      commonTags: string[];
      sizeDifference: number;
      tagSimilarity: number;
    };
  };
  totalCount?: number;
  returnedCount?: number;
  limited?: boolean;
}

const compare = async (input: CompareInput): Promise<CompareResult> => {
  const { recordUuid, compareWithUuid, databaseName, comparison, limit = 20 } = input;

  // Validate string inputs
  if (!isJXASafeString(recordUuid)) {
    return { success: false, error: "Record UUID contains invalid characters" };
  }
  if (compareWithUuid && !isJXASafeString(compareWithUuid)) {
    return { success: false, error: "Compare with UUID contains invalid characters" };
  }
  if (databaseName && !isJXASafeString(databaseName)) {
    return { success: false, error: "Database name contains invalid characters" };
  }
  if (comparison && !isJXASafeString(comparison)) {
    return { success: false, error: "Comparison type contains invalid characters" };
  }

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Inject helper functions
      ${getRecordLookupHelpers()}
      ${getDatabaseHelper}
      
      try {
        // Get target database
        const targetDatabase = getDatabase(theApp, ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"});

        // Get the primary record using unified lookup
        const primaryLookupOptions = {
          uuid: ${recordUuid ? `"${escapeStringForJXA(recordUuid)}"` : "null"}
        };
        
        const primaryLookupResult = getRecord(theApp, primaryLookupOptions);
        
        if (!primaryLookupResult.record) {
          return JSON.stringify({
            success: false,
            error: "Primary record not found with UUID: " + (${recordUuid ? `"${escapeStringForJXA(recordUuid)}"` : "null"} || "unknown")
          });
        }
        
        const primaryRecord = primaryLookupResult.record;
        
        // Check if this is a two-record comparison
        const isDirectComparison = ${compareWithUuid ? `"${escapeStringForJXA(compareWithUuid)}"` : "null"};
        
        if (isDirectComparison) {
          // Two-record comparison mode
          const secondLookupOptions = {
            uuid: ${compareWithUuid ? `"${escapeStringForJXA(compareWithUuid)}"` : "null"}
          };
          
          const secondLookupResult = getRecord(theApp, secondLookupOptions);
          
          if (!secondLookupResult.record) {
            return JSON.stringify({
              success: false,
              error: "Second record not found with UUID: " + (${compareWithUuid ? `"${escapeStringForJXA(compareWithUuid)}"` : "null"} || "unknown")
            });
          }
          
          const secondRecord = secondLookupResult.record;
          
          // Get properties of both records
          const record1 = {
            uuid: primaryRecord.uuid(),
            name: primaryRecord.name(),
            recordType: primaryRecord.recordType(),
            tags: primaryRecord.tags(),
            size: primaryRecord.size()
          };
          
          const record2 = {
            uuid: secondRecord.uuid(),
            name: secondRecord.name(),
            recordType: secondRecord.recordType(),
            tags: secondRecord.tags(),
            size: secondRecord.size()
          };
          
          // Calculate similarities
          const sameType = record1.recordType === record2.recordType;
          const commonTags = record1.tags.filter(tag => record2.tags.includes(tag));
          const sizeDifference = Math.abs(record1.size - record2.size);
          const tagSimilarity = commonTags.length / Math.max(record1.tags.length, record2.tags.length, 1);
          
          return JSON.stringify({
            success: true,
            mode: "two_record",
            comparison: {
              record1: record1,
              record2: record2,
              similarities: {
                sameType: sameType,
                commonTags: commonTags,
                sizeDifference: sizeDifference,
                tagSimilarity: tagSimilarity
              }
            }
          });
        } else {
          // Single record comparison mode - find similar records
          const compareOptions = { record: primaryRecord };
          if (targetDatabase) {
            compareOptions.to = targetDatabase;
          }
          if (${comparison ? `"${escapeStringForJXA(comparison)}"` : "null"}) {
            compareOptions.comparison = ${comparison ? `"${escapeStringForJXA(comparison)}"` : "null"};
          }
          
          // Perform comparison using DEVONthink's compare method
          const compareResults = theApp.compare(compareOptions);
          
          if (!compareResults || compareResults.length === 0) {
            return JSON.stringify({
              success: true,
              mode: "single_record",
              similarRecords: [],
              totalCount: 0
            });
          }
          
          // Extract similar record information (with limit to prevent stdout overflow)
          const maxResults = ${limit};
          const totalCount = compareResults.length;
          const limitedResults = compareResults.slice(0, maxResults);
          
          const similarRecords = limitedResults.map(record => {
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
              // Score might not be available for all comparison types
            }
            
            return result;
          });
          
          return JSON.stringify({
            success: true,
            mode: "single_record",
            similarRecords: similarRecords,
            totalCount: totalCount,
            returnedCount: similarRecords.length,
            limited: totalCount > maxResults
          });
        }
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<CompareResult>(script);
};

export const compareTool: Tool = {
  name: "compare",
  description:
    "Compare DEVONthink records to find similarities. Use with just `recordUuid` to find similar records in the database (returns up to 20 by default, max 100), or add `compareWithUuid` to directly compare two specific records. The tool returns either a list of similar records or a detailed comparison between two records. When many similar records exist, results are limited to prevent performance issues.",
  inputSchema: zodToJsonSchema(CompareSchema) as ToolInput,
  run: compare,
};
