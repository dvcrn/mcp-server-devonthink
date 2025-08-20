import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	ErrorCode,
	ListResourcesRequestSchema,
	ListPromptsRequestSchema,
	ListResourceTemplatesRequestSchema,
	McpError,
	Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { isRunningTool } from "./tools/isRunning.js";
import { createRecordTool } from "./tools/createRecord.js";
import { deleteRecordTool } from "./tools/deleteRecord.js";
import { moveRecordTool } from "./tools/moveRecord.js";
import { getRecordPropertiesTool } from "./tools/getRecordProperties.js";
import { getRecordByIdentifierTool } from "./tools/getRecordByIdentifier.js";
import { searchTool } from "./tools/search.js";
import { lookupRecordTool } from "./tools/lookupRecord.js";
import { createFromUrlTool } from "./tools/createFromUrl.js";
import { getOpenDatabasesTool } from "./tools/getOpenDatabases.js";
import { listGroupContentTool } from "./tools/listGroupContent.js";
import { getRecordContentTool } from "./tools/getRecordContent.js";
import { renameRecordTool } from "./tools/renameRecord.js";
import { addTagsTool } from "./tools/addTags.js";
import { removeTagsTool } from "./tools/removeTags.js";
import { classifyTool } from "./tools/classify.js";
import { compareTool } from "./tools/compare.js";
import { currentDatabaseTool } from "./tools/getCurrentDatabase.js";
import { selectedRecordsTool } from "./tools/getSelectedRecords.js";
import { replicateRecordTool } from "./tools/replicateRecord.js";
import { duplicateRecordTool } from "./tools/duplicateRecord.js";
import { convertRecordTool } from "./tools/convertRecord.js";
import { updateRecordContentTool } from "./tools/updateRecordContent.js";
import { importFileTool } from "./tools/importFile.js";
import { importDirectoryTool } from "./tools/importDirectory.js";
import { importWithOptionsTool } from "./tools/importWithOptions.js";
import { setRecordPropertiesTool } from "./tools/setRecordProperties.js";
import { askAiAboutDocumentsTool } from "./tools/ai/askAiAboutDocuments.js";
import { checkAIHealthTool } from "./tools/ai/checkAIHealth.js";
import { createSummaryDocumentTool } from "./tools/ai/createSummaryDocument.js";
import { getToolDocumentationTool } from "./tools/ai/getToolDocumentation.js";

export const createServer = async () => {
	const server = new Server(
		{
			name: "devonthink-mcp",
			version: "0.1.0",
		},
		{
			capabilities: {
				tools: {},
				resources: {},
				prompts: {},
			},
		},
	);

  const tools: Tool[] = [
    isRunningTool,
    createRecordTool,
    deleteRecordTool,
    moveRecordTool,
    getRecordPropertiesTool,
    getRecordByIdentifierTool,
    searchTool,
    lookupRecordTool,
    createFromUrlTool,
    getOpenDatabasesTool,
    currentDatabaseTool,
    selectedRecordsTool,
    listGroupContentTool,
    getRecordContentTool,
    renameRecordTool,
    addTagsTool,
    removeTagsTool,
    classifyTool,
    compareTool,
    replicateRecordTool,
    duplicateRecordTool,
    convertRecordTool,
    updateRecordContentTool,
    importFileTool,
    importDirectoryTool,
    importWithOptionsTool,
    setRecordPropertiesTool,
	askAiAboutDocumentsTool,
	checkAIHealthTool,
	createSummaryDocumentTool,
    getToolDocumentationTool,
  ];


	server.setRequestHandler(ListToolsRequestSchema, async () => {
		return { tools };
	});

	server.setRequestHandler(ListResourcesRequestSchema, async () => {
		return { resources: [] };
	});

	server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
		return { resources: [] };
	});

	server.setRequestHandler(ListPromptsRequestSchema, async () => {
		return { prompts: [] };
	});

	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const { name, arguments: args = {} } = request.params;

		const tool = tools.find((t) => t.name === name);

		if (!tool) {
			throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
		}

		if (typeof tool.run !== "function") {
			throw new McpError(ErrorCode.InternalError, `Tool '${name}' has no run function.`);
		}

		try {
			const result = await tool.run(args);
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(result, null, 2),
					},
				],
			};
		} catch (error) {
			throw error instanceof McpError
				? error
				: new McpError(
						ErrorCode.InternalError,
						error instanceof Error ? error.message : String(error),
					);
		}
	});

	return { server, cleanup: async () => {} };
};
