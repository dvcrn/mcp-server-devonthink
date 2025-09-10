import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const GetSelectedRecordsSchema = z.object({}).strict();

interface RecordInfo {
	id: number;
	uuid: string;
	name: string;
	path: string;
	location: string;
	recordType: string;
	kind: string;
	creationDate: string;
	modificationDate: string;
	tags: string[];
	size: number;
	rating?: number;
	label?: number;
	comment?: string;
}

interface GetSelectedRecordsResult {
	success: boolean;
	error?: string;
	records?: RecordInfo[];
	totalCount?: number;
}

const getSelectedRecords = async (): Promise<GetSelectedRecordsResult> => {
	const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        const selection = theApp.selection();
        
        if (!selection || selection.length === 0) {
          return JSON.stringify({
            success: true,
            records: [],
            totalCount: 0
          });
        }
        
        const recordInfos = selection.map(record => {
          const info = {
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
          
          // Add optional properties if available
          if (record.rating && record.rating() !== undefined) {
            info.rating = record.rating();
          }
          
          if (record.label && record.label() !== undefined) {
            info.label = record.label();
          }
          
          if (record.comment && record.comment()) {
            info.comment = record.comment();
          }
          
          return info;
        });
        
        return JSON.stringify({
          success: true,
          records: recordInfos,
          totalCount: selection.length
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

	return await executeJxa<GetSelectedRecordsResult>(script);
};

export const selectedRecordsTool: Tool = {
	name: "selected_records",
	description:
		"Get information about currently selected records in DEVONthink. This tool returns detailed properties of all records that are currently selected in the DEVONthink interface, including their UUIDs, names, paths, types, and metadata. Returns an empty array if no records are selected. Useful for batch operations on user's current selection.",
	inputSchema: zodToJsonSchema(GetSelectedRecordsSchema) as ToolInput,
	run: getSelectedRecords,
};
