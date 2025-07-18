# Copilot Instructions

- This project uses [Vitest](https://vitest.dev/) for testing.
- All changes must pass `npm test` before being considered complete.
- All changes must pass `npm run build`

## Project Structure

- **`src/index.ts`**: The main entry point for the CLI application. It sets up a `StdioServerTransport` for communication.
- **`src/sse.ts`**: An alternative entry point that uses an `SSEServerTransport` with Express, allowing the server to communicate over HTTP.
- **`src/devonthink.ts`**: The core server logic. It creates and configures the MCP server, defines request handlers for listing and calling tools, and manages the available tools.
- **`src/tools/`**: Directory containing all tool implementations
  - **`isRunning.ts`**: Defines the `is_running` tool, which checks if DEVONthink is active
  - **`createRecord.ts`**: Creates new records in DEVONthink
  - **`deleteRecord.ts`**: Deletes records from DEVONthink
  - **`moveRecord.ts`**: Moves records between groups
  - **`getRecordProperties.ts`**: Retrieves detailed properties and metadata for records
  - **`search.ts`**: Performs text-based searches across databases
  - **`lookupRecord.ts`**: Looks up records by specific attributes
  - **`createFromUrl.ts`**: Creates records from web URLs in various formats
  - **`getOpenDatabases.ts`**: Lists all currently open databases
  - **`listGroupContent.ts`**: Lists the content of a specific group
  - **`getRecordContent.ts`**: Retrieves the content of a specific record
  - **`renameRecord.ts`**: Renames a record
  - **`addTags.ts`**: Adds tags to a record
  - **`removeTags.ts`**: Removes tags from a record
- **`src/applescript/execute.ts`**: A utility module that provides the `executeJxa` function to run JXA scripts via the command line.

## Available Tools

The MCP server currently provides the following tools:

1. **`is_running`** - Check if DEVONthink is running
2. **`create_record`** - Create new records (notes, bookmarks, groups) with specified properties
3. **`delete_record`** - Delete records by ID, name, or path
4. **`move_record`** - Move records between groups
5. **`get_record_properties`** - Get detailed metadata and properties for records
6. **`search`** - Perform text-based searches with various comparison options
7. **`lookup_record`** - Look up records by filename, path, URL, tags, comment, or content hash (exact matches only, no wildcards)
8. **`create_from_url`** - Create records from web URLs in multiple formats
9. **`get_open_databases`** - Get a list of all currently open databases
10. **`list_group_content`** - Lists the content of a specific group
11. **`get_record_content`** - Gets the content of a specific record
12. **`rename_record`** - Renames a specific record
13. **`add_tags`** - Adds tags to a specific record
14. **`remove_tags`** - Removes tags from a specific record

## Adding New Tools

To add a new tool to the MCP server, follow these steps:

### 1. Create the Tool File

Create a new TypeScript file in the `src/tools/` directory following the naming convention `toolName.ts`:

```typescript
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Define the input schema using Zod
const YourToolSchema = z
  .object({
    // Define your tool's input parameters here
    parameter1: z.string().describe("Description of parameter1"),
    parameter2: z
      .number()
      .optional()
      .describe("Optional description of parameter2"),
  })
  .strict();

type YourToolInput = z.infer<typeof YourToolSchema>;

// Define the return type interface
interface YourToolResult {
  success: boolean;
  error?: string;
  // Add other return properties as needed
}

const yourTool = async (input: YourToolInput): Promise<YourToolResult> => {
  const { parameter1, parameter2 } = input;

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        // Your DEVONthink JXA code here
        // Use the parameters: ${parameter1}, ${parameter2 || "default"}
        
        return JSON.stringify({
          success: true,
          // Add your return data here
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<YourToolResult>(script);
};

export const yourToolTool: Tool = {
  name: "your_tool_name",
  description: "Description of what your tool does",
  inputSchema: zodToJsonSchema(YourToolSchema) as ToolInput,
  run: yourTool,
};
```

### 2. Update the Main Server File

Add your new tool to `src/devonthink.ts`:

1. **Add the import** at the top of the file:

```typescript
import { yourToolTool } from "./tools/yourTool.js";
```

2. **Add the tool to the tools array**:

```typescript
const tools: Tool[] = [
  isRunningTool,
  createRecordTool,
  // ... other existing tools
  yourToolTool, // Add your new tool here
];
```

### 3. Update Documentation

Update this `CLAUDE.md` file to:

- Add your new tool file to the Project Structure section
- Add your tool to the Available Tools list
- Include any special usage notes or examples

### 4. Test Your Implementation

1. **Build the project**: `npm run build`
2. **Run type checking**: `npm run type-check`
3. **Test the tool** by running the MCP server and calling your new tool

### Best Practices for Tool Development

1. **Follow the existing patterns** - Look at existing tools for consistent structure
2. **Use proper error handling** - Always wrap JXA code in try-catch blocks
3. **Validate inputs** - Use Zod schemas to validate and document input parameters
4. **Add descriptive comments** - Document what your tool does and any special considerations
5. **Test with DEVONthink** - Ensure your JXA code works correctly with DEVONthink
6. **Handle edge cases** - Consider what happens when databases are closed, records don't exist, etc.
7. **Use TypeScript types** - Define proper interfaces for your return types
8. **Keep it focused** - Each tool should do one thing well

### DEVONthink API Reference

Refer to `docs/devonthink-javascript-2.md` for comprehensive documentation of available DEVONthink JXA commands and properties.
