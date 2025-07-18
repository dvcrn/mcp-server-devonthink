import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
  McpError,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { isRunningTool } from "./tools/isRunning.js";
import { createRecordTool } from "./tools/createRecord.js";
import { deleteRecordTool } from "./tools/deleteRecord.js";
import { moveRecordTool } from "./tools/moveRecord.js";
import { getRecordPropertiesTool } from "./tools/getRecordProperties.js";
import { searchTool } from "./tools/search.js";
import { lookupRecordTool } from "./tools/lookupRecord.js";
import { createFromUrlTool } from "./tools/createFromUrl.js";
import { getOpenDatabasesTool } from "./tools/getOpenDatabases.js";
import { listGroupContentTool } from "./tools/listGroupContent.js";
import { getRecordContentTool } from "./tools/getRecordContent.js";
import { renameRecordTool } from "./tools/renameRecord.js";
import { addTagsTool } from "./tools/addTags.js";
import { removeTagsTool } from "./tools/removeTags.js";

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
    }
  );

  const tools: Tool[] = [
    isRunningTool,
    createRecordTool,
    deleteRecordTool,
    moveRecordTool,
    getRecordPropertiesTool,
    searchTool,
    lookupRecordTool,
    createFromUrlTool,
    getOpenDatabasesTool,
    listGroupContentTool,
    getRecordContentTool,
    renameRecordTool,
    addTagsTool,
    removeTagsTool,
  ];

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
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
      throw new McpError(
        ErrorCode.InternalError,
        `Tool '${name}' has no run function.`
      );
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
            error instanceof Error ? error.message : String(error)
          );
    }
  });

  return { server, cleanup: async () => {} };
};
