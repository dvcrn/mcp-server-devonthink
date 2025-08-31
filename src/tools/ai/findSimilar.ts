import { z } from "zod";
import { createDevonThinkTool } from "../base/DevonThinkTool.js";

const FindSimilarSchema = z.object({
  recordUuid: z.string().describe("UUID of the record to find similar documents for"),
  databaseName: z.string().optional().describe("Database to search in (defaults to current database)"),
  maxResults: z.number().optional().default(10).describe("Maximum number of similar documents to return"),
  minScore: z.number().min(0).max(1).optional().default(0.5).describe("Minimum similarity score (0-1) to include in results"),
}).strict();

export const findSimilarTool = createDevonThinkTool({
  name: "find_similar",
  description: "Find documents similar to a given record using AI similarity analysis.",
  inputSchema: FindSimilarSchema,
  buildScript: (input, helpers) => {
    const { recordUuid, databaseName, maxResults, minScore } = input;
    
    return helpers.wrapInTryCatch(`
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Get the source record
      const sourceRecord = theApp.getRecordWithUuid(${helpers.formatValue(recordUuid)});
      if (!sourceRecord) {
        const result = {};
        result["success"] = false;
        result["error"] = "Record not found: " + ${helpers.formatValue(recordUuid)};
        return JSON.stringify(result);
      }
      
      // Get target database
      ${helpers.buildDatabaseLookup(databaseName)}
      
      // Use DEVONthink's native compare function for AI-powered similarity
      let similarRecords = [];
      
      try {
        // Get similar records using DEVONthink's built-in AI
        const compareResults = theApp.compare({
          record: sourceRecord,
          to: targetDatabase
        });
        
        if (compareResults && compareResults.length > 0) {
          // Process and score the results
          // DEVONthink returns them in order of relevance
          for (let i = 0; i < Math.min(compareResults.length, ${maxResults} * 2); i++) {
            const item = compareResults[i];
            
            // Calculate a normalized score based on position (first = highest score)
            // DEVONthink returns best matches first
            const score = 1.0 - (i / compareResults.length);
            
            if (score >= ${minScore} && item.uuid() !== sourceRecord.uuid()) {
              similarRecords.push({
                uuid: item.uuid(),
                name: item.name(),
                path: item.location ? item.location() : "",
                type: item.type(),
                score: Math.round(score * 100) / 100, // Round to 2 decimal places
                tags: item.tags ? item.tags().map(t => t.name ? t.name() : t) : [],
                comment: item.comment ? item.comment() : "",
                wordCount: item.wordCount ? item.wordCount() : 0
              });
              
              if (similarRecords.length >= ${maxResults}) {
                break;
              }
            }
          }
        }
      } catch (compareError) {
        // If compare fails, return empty results with error info
        const result = {};
        result["success"] = false;
        result["error"] = "Compare failed: " + compareError.toString();
        return JSON.stringify(result);
      }
      
      const result = {};
      result["success"] = true;
      result["source"] = {
        uuid: sourceRecord.uuid(),
        name: sourceRecord.name(),
        type: sourceRecord.type()
      };
      result["similarRecords"] = similarRecords;
      result["resultCount"] = similarRecords.length;
      result["searchDatabase"] = targetDatabase.name();
      
      return JSON.stringify(result);
    `);
  }
});