import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const ClassifySchema = z
  .object({
    recordUuid: z.string().describe("The UUID of the record to classify"),
    databaseName: z
      .string()
      .optional()
      .describe(
        "The name of the database to search in (defaults to current database)"
      ),
    comparison: z
      .enum(["data comparison", "tags comparison"])
      .optional()
      .describe("The comparison type for classification"),
    tags: z
      .boolean()
      .optional()
      .describe("Whether to propose tags instead of groups"),
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

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        let targetDatabase;
        if ("${databaseName || ""}") {
          try {
            targetDatabase = theApp.databases["${databaseName}"]();
          } catch (e) {
            throw new Error("Database not found: ${databaseName}");
          }
        } else {
          targetDatabase = theApp.currentDatabase();
        }

        // Get the record to classify
        const targetRecord = theApp.getRecordWithUuid("${recordUuid}");
        if (!targetRecord) {
          return JSON.stringify({
            success: false,
            error: "Record not found with UUID: ${recordUuid}"
          });
        }
        
        // Build classify options
        const classifyOptions = { record: targetRecord };
        if (targetDatabase) {
          classifyOptions.in = targetDatabase;
        }
        if ("${comparison || ""}") {
          classifyOptions.comparison = "${comparison}";
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
    "Get classification proposals for a DEVONthink record. This tool uses DEVONthink's AI to suggest appropriate groups or tags for organizing the record. Use the `recordUuid` to specify which record to classify.",
  inputSchema: zodToJsonSchema(ClassifySchema) as ToolInput,
  run: classify,
};
