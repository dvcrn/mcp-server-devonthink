import { z } from "zod";
import { createDevonThinkTool } from "../base/DevonThinkTool.js";

const ClassifyDocumentSchema = z.object({
  documentUuid: z.string().describe("UUID of the document to classify"),
  databaseName: z.string().optional().describe("Name of database to search for classifications in (defaults to current database)"),
  comparisonType: z.enum(['data comparison', 'tags comparison']).optional().describe("Type of comparison algorithm to use"),
  proposeTags: z.boolean().default(false).describe("Propose tags instead of groups (default: false for groups)"),
  maxSuggestions: z.number().min(1).max(20).default(10).describe("Maximum number of classification suggestions to return")
}).strict();

export const classifyDocumentTool = createDevonThinkTool({
  name: "classify_document",
  description: "Get AI-powered classification suggestions for a DEVONthink document. Suggests appropriate groups or tags based on similar content in your database.",
  inputSchema: ClassifyDocumentSchema,
  buildScript: (input, helpers) => {
    const { 
      documentUuid, 
      databaseName, 
      comparisonType = 'data comparison', 
      proposeTags = false, 
      maxSuggestions = 10 
    } = input;

    return helpers.wrapInTryCatch(`
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Check if DEVONthink is running
      if (!theApp.running()) {
        const result = {};
        result["success"] = false;
        result["error"] = "DEVONthink is not running";
        return JSON.stringify(result);
      }
      
      // Get the record to classify
      const targetRecord = theApp.getRecordWithUuid(${helpers.formatValue(documentUuid)});
      if (!targetRecord) {
        const result = {};
        result["success"] = false;
        result["error"] = "Document not found: " + ${helpers.formatValue(documentUuid)};
        return JSON.stringify(result);
      }
      
      // Determine database scope
      ${helpers.buildDatabaseLookup(databaseName)}
      
      // Build classification options using bracket notation (JXA requirement)
      const classifyOptions = {};
      classifyOptions["record"] = targetRecord;
      classifyOptions["in"] = targetDatabase;
      classifyOptions["comparison"] = ${helpers.formatValue(comparisonType)};
      classifyOptions["tags"] = ${proposeTags};
      
      // Get classification suggestions
      const proposals = theApp.classify(classifyOptions);
      
      if (!proposals || proposals.length === 0) {
        const result = {};
        result["success"] = true;
        result["document"] = {
          uuid: targetRecord.uuid(),
          name: targetRecord.name(),
          type: targetRecord.type()
        };
        result["suggestions"] = [];
        result["message"] = "No classification suggestions found. The database may not have enough similar content.";
        return JSON.stringify(result);
      }
      
      // Format suggestions
      const suggestions = [];
      const limit = Math.min(proposals.length, ${maxSuggestions});
      
      for (let i = 0; i < limit; i++) {
        const proposal = proposals[i];
        const suggestion = {};
        
        if (${proposeTags}) {
          // Tag suggestions
          suggestion["tag"] = proposal.name();
          suggestion["score"] = proposal.score ? proposal.score() : 0;
        } else {
          // Group suggestions
          suggestion["group"] = proposal.name();
          suggestion["location"] = proposal.location();
          suggestion["uuid"] = proposal.uuid();
          suggestion["score"] = proposal.score ? proposal.score() : 0;
        }
        
        suggestions.push(suggestion);
      }
      
      const result = {};
      result["success"] = true;
      result["document"] = {
        uuid: targetRecord.uuid(),
        name: targetRecord.name(),
        type: targetRecord.type()
      };
      result["suggestions"] = suggestions;
      result["database"] = targetDatabase.name();
      result["comparisonType"] = ${helpers.formatValue(comparisonType)};
      result["proposedType"] = ${proposeTags} ? "tags" : "groups";
      
      return JSON.stringify(result);
    `);
  }
});