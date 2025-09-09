import { z } from "zod";
import { createDevonThinkTool } from "../base/DevonThinkTool.js";

const CreateSummaryDocumentSchema = z.object({
  documentUuids: z.array(z.string()).min(1).describe("UUIDs of documents to summarize"),
  summaryType: z.enum(['markdown', 'rich', 'sheet', 'simple']).default('markdown').describe("Output document format: markdown, rich text, sheet, or plain text"),
  // Note: summaryStyle parameter is documented in DEVONthink API but appears non-functional in testing
  // Keeping for future compatibility when/if it works
  summaryStyle: z.enum(['text summary', 'key points summary', 'list summary', 'table summary', 'custom summary']).optional().describe("Summary style (Note: Currently non-functional in DEVONthink API)"),
  parentGroupUuid: z.string().optional().describe("UUID of group where summary should be created"),
  customTitle: z.string().optional().describe("Custom title for the summary document"),
}).strict();

export const createSummaryDocumentTool = createDevonThinkTool({
  name: "create_summary_document", 
  description: "Create an AI-generated summary document from multiple DEVONthink documents.",

  inputSchema: CreateSummaryDocumentSchema,
  buildScript: (input, helpers) => {
    const { documentUuids, summaryType, summaryStyle, parentGroupUuid, customTitle } = input;
    
    return helpers.wrapInTryCatch(`
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      // Check if DEVONthink is running
      if (!theApp.running()) {
        ${helpers.returnError("DEVONthink is not running")}
      }
      
      ${helpers.buildRecordCollectionScript(documentUuids)}
      
      // Create summary document using native summarizeContentsOf API
      let summaryRecord;
      try {
        // Get parent group or use current database's incoming group
        let parentGroup;
        if (${helpers.formatValue(parentGroupUuid)}) {
          parentGroup = theApp.getRecordWithUuid(${helpers.formatValue(parentGroupUuid)});
          if (!parentGroup) {
            throw new Error("Parent group not found: " + ${helpers.formatValue(parentGroupUuid)});
          }
          // Verify it's actually a group
          if (parentGroup.type() !== "group") {
            throw new Error("Parent UUID is not a group: " + parentGroup.type());
          }
        } else {
          // Use incoming group (inbox) as default
          const currentDb = theApp.currentDatabase();
          parentGroup = currentDb.incomingGroup();
        }
        
        // Build summarization options using bracket notation (required for JXA)
        const summaryOptions = {};
        summaryOptions["records"] = recordObjects;  // Pass the actual record objects
        summaryOptions["to"] = ${helpers.formatValue(summaryType)};  // Format: markdown, rich, sheet, simple
        summaryOptions["in"] = parentGroup;  // Destination group
        
        // Note: summaryStyle parameter exists in API but appears non-functional
        // Keeping for future compatibility if/when it works
        ${summaryStyle ? `summaryOptions["as"] = ${helpers.formatValue(summaryStyle)};` : ''}
        
        // Create the summary using DEVONthink's native AI summarization
        summaryRecord = theApp.summarizeContentsOf(summaryOptions);
        
        if (!summaryRecord) {
          throw new Error("Failed to create summary document. Ensure AI services are configured in DEVONthink preferences.");
        }
        
        // Apply custom title if provided
        if (${helpers.formatValue(customTitle)}) {
          try {
            summaryRecord.name = ${helpers.formatValue(customTitle)};
          } catch (nameError) {
            // Continue even if renaming fails
          }
        }
        
      } catch (aiError) {
        ${helpers.returnError("Document creation failed: " + "aiError.toString()")}
      }
      
      const result = {};
      result["success"] = true;
      result["summaryUuid"] = summaryRecord.uuid();
      result["summaryName"] = summaryRecord.name();
      result["summaryLocation"] = summaryRecord.location();
      result["summaryType"] = ${helpers.formatValue(summaryType)};
      result["recordsAnalyzed"] = records.length;
      result["records"] = records;
      
      if (errors.length > 0) {
        result["warnings"] = errors;
      }
      
      return JSON.stringify(result);
    `);
  }
});