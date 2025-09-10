import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { escapeStringForJXA, formatValueForJXA, isJXASafeString } from "../utils/escapeString.js";
import { getRecordLookupHelpers, getDatabaseHelper } from "../utils/jxaHelpers.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const ClassifySchema = z
	.object({
		recordUuid: z.string().describe("UUID of the record to classify"),
		databaseName: z.string().optional().describe("Database name to search in (optional)"),
		comparison: z
			.enum(["data comparison", "tags comparison"])
			.optional()
			.describe("Comparison type for classification (optional)"),
		tags: z.boolean().optional().describe("Propose tags instead of groups (optional)"),
	})
	.strict();

type ClassifyInput = z.infer<typeof ClassifySchema>;

interface ClassifyResult {
	success: boolean;
	error?: string;
	proposals?: Array<{
		name: string;
		type: string;
		location?: string;
		score?: number;
	}>;
	totalCount?: number;
}

const classify = async (input: ClassifyInput): Promise<ClassifyResult> => {
	const { recordUuid, databaseName, comparison, tags } = input;

	// Validate string inputs
	if (!isJXASafeString(recordUuid)) {
		return { success: false, error: "Record UUID contains invalid characters" };
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

        // Use the unified lookup function
        const lookupOptions = {
          uuid: ${recordUuid ? `"${escapeStringForJXA(recordUuid)}"` : "null"}
        };
        
        const lookupResult = getRecord(theApp, lookupOptions);
        
        if (!lookupResult.record) {
          return JSON.stringify({
            success: false,
            error: "Record not found with UUID: " + (${recordUuid ? `"${escapeStringForJXA(recordUuid)}"` : "null"} || "unknown")
          });
        }
        
        const targetRecord = lookupResult.record;
        
        // Build classify options
        const classifyOptions = { record: targetRecord };
        if (targetDatabase) {
          classifyOptions.in = targetDatabase;
        }
        if (${comparison ? `"${escapeStringForJXA(comparison)}"` : "null"}) {
          classifyOptions.comparison = ${comparison ? `"${escapeStringForJXA(comparison)}"` : "null"};
        }
        if (${tags || false}) {
          classifyOptions.tags = ${tags};
        }
        
        // Perform classification
        const classifyResults = theApp.classify(classifyOptions);
        
        if (!classifyResults || classifyResults.length === 0) {
          return JSON.stringify({
            success: true,
            proposals: [],
            totalCount: 0
          });
        }
        
        // Extract proposal information
        const proposals = classifyResults.map(proposal => {
          const result = {
            name: proposal.name(),
            type: proposal.recordType ? proposal.recordType() : "group"
          };
          
          // Add location if available
          try {
            if (proposal.location) {
              result.location = proposal.location();
            }
          } catch (e) {
            // Location might not be available for all proposals
          }
          
          // Add score if available
          try {
            if (proposal.score && proposal.score() !== undefined) {
              result.score = proposal.score();
            }
          } catch (e) {
            // Score might not be available for all proposals
          }
          
          return result;
        });
        
        return JSON.stringify({
          success: true,
          proposals: proposals,
          totalCount: classifyResults.length
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

	return await executeJxa<ClassifyResult>(script);
};

export const classifyTool: Tool = {
	name: "classify",
	description:
		'Get classification proposals for a DEVONthink record.\n\nExample:\n{\n  "recordUuid": "1234-5678-90AB-CDEF"\n}',
	inputSchema: zodToJsonSchema(ClassifySchema) as ToolInput,
	run: classify,
};
