# Copilot Instructions

- This project uses [Vitest](https://vitest.dev/) for testing.
- This project uses [Biome](https://biomejs.dev/) for code formatting and linting.
- **CRITICAL**: All changes must pass `npm run format:check` before being considered complete.
- All changes must pass `npm test` before being considered complete.
- All changes must pass `npm run build` before being considered complete.
- If formatting issues are found, run `npm run format` to auto-fix them.

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration. The CI pipeline runs on every push and pull request to the `main` branch.

### CI Pipeline Steps (in order)

1. **Install dependencies**: `npm ci`
2. **Check formatting**: `npm run format:check` ⚠️ **This will fail if code is not properly formatted**
3. **Run tests**: `npm test`
4. **Build**: `npm run build`

### Common CI Failures

**Formatting Errors**: The most common CI failure is code formatting issues. If your PR fails CI with formatting errors:
1. Run `npm run format` locally to auto-fix all formatting issues
2. Commit the formatting changes
3. Push to trigger CI again

**Why CI fails on formatting**: The project uses Biome for consistent code formatting. All code must be formatted according to the project's Biome configuration before it can be merged.

### Pre-commit Checklist

Before pushing any changes or creating a PR, always run:
```bash
npm run format:check  # Check formatting (or npm run format to auto-fix)
npm test              # Run all tests
npm run build         # Verify the build works
```

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
  - **`getRecordByIdentifier.ts`**: Gets a record using either UUID or ID+Database combination
  - **`search.ts`**: Performs text-based searches across databases
  - **`lookupRecord.ts`**: Looks up records by specific attributes
  - **`createFromUrl.ts`**: Creates records from web URLs in various formats
  - **`getOpenDatabases.ts`**: Lists all currently open databases
  - **`getCurrentDatabase.ts`**: Gets information about the currently active database
  - **`getSelectedRecords.ts`**: Gets information about currently selected records
  - **`listGroupContent.ts`**: Lists the content of a specific group
  - **`getRecordContent.ts`**: Retrieves the content of a specific record
  - **`renameRecord.ts`**: Renames a record
  - **`addTags.ts`**: Adds tags to a record
  - **`removeTags.ts`**: Removes tags from a record
  - **`classify.ts`**: Gets AI-powered classification suggestions
  - **`compare.ts`**: Finds similar records or compares specific records
  - **`replicateRecord.ts`**: Replicates records within the same database (creates linked references)
  - **`duplicateRecord.ts`**: Duplicates records to any database (creates independent copies)
  - **`convertRecord.ts`**: Converts records to different formats
  - **`updateRecordContent.ts`**: Updates the content of existing records while preserving UUID
  - **`importFile.ts`**: Imports individual files from the filesystem using DEVONthink's native import functionality
  - **`importDirectory.ts`**: Imports entire directory structures with filtering and recursive options
  - **`importWithOptions.ts`**: Advanced import tool with comprehensive configuration options and batch processing
  - **`ai/`**: AI-powered tools leveraging DEVONthink's native AI capabilities
    - **`askAiAboutDocuments.ts`**: Ask AI questions about specific documents for analysis
    - **`checkAIHealth.ts`**: Check AI service availability and configuration
    - **`createSummaryDocument.ts`**: Create AI-generated document summaries
    - **`getToolDocumentation.ts`**: Get detailed documentation for AI tools
    - **`constants.ts`**: Shared AI constants and type definitions
  - **`base/`**: Base classes and utilities for tool development
    - **`DevonThinkTool.ts`**: Base class providing standardized tool creation with helper functions
- **`src/utils/`**: Utility functions
  - **`escapeString.ts`**: Provides safe string escaping for JXA script interpolation
  - **`jxaHelpers.ts`**: JXA helper functions including version detection
- **`src/applescript/execute.ts`**: A utility module that provides the `executeJxa` function to run JXA scripts via the command line.

## Available Tools

The MCP server currently provides the following tools:

1. **`is_running`** - Check if DEVONthink is running
2. **`create_record`** - Create new records (notes, bookmarks, groups) with specified properties
3. **`delete_record`** - Delete records by ID, name, or path
4. **`move_record`** - Move records between groups
5. **`get_record_properties`** - Get detailed metadata and properties for records
6. **`get_record_by_identifier`** - Get a record using either UUID or ID+Database combination (recommended for specific record lookup)
7. **`search`** - Perform text-based searches with various comparison options (now returns both ID and UUID)
8. **`lookup_record`** - Look up records by filename, path, URL, tags, comment, or content hash (exact matches only, no wildcards)
9. **`create_from_url`** - Create records from web URLs in multiple formats
10. **`get_open_databases`** - Get a list of all currently open databases
11. **`current_database`** - Get information about the currently active database
12. **`selected_records`** - Get information about currently selected records in DEVONthink
13. **`list_group_content`** - Lists the content of a specific group
14. **`get_record_content`** - Gets the content of a specific record
15. **`rename_record`** - Renames a specific record
16. **`add_tags`** - Adds tags to a specific record
17. **`remove_tags`** - Removes tags from a specific record
18. **`classify`** - Get AI-powered suggestions for organizing records
19. **`compare`** - Find similar records or compare two specific records
20. **`replicate_record`** - Replicate records within the same database (creates linked references)
21. **`duplicate_record`** - Duplicate records to any database (creates independent copies)
22. **`convert_record`** - Convert records to different formats (plain text, rich text, markdown, HTML, PDF, etc.)
23. **`update_record_content`** - Update the content of existing records while preserving UUID and metadata
24. **`import_file`** - Import individual files from the filesystem, preserving file type and metadata using DEVONthink's native import
25. **`import_directory`** - Import entire directory structures with recursive processing, file filtering, and path preservation options
26. **`import_with_options`** - Advanced batch import with comprehensive options including duplicate handling, tagging, and custom configurations
24. **`ask_ai_about_documents`** - Ask AI questions about specific documents for analysis, comparison, or extraction
25. **`check_ai_health`** - Check if DEVONthink's AI services are available and working properly
26. **`create_summary_document`** - Create AI-generated summaries from multiple documents
27. **`get_ai_tool_documentation`** - Get detailed documentation for AI tools including examples and use cases

## Adding New Tools

To add a new tool to the MCP server, you have two approaches:

1. **Traditional Approach**: Manual tool definition with full control
2. **DevonThinkTool Base Class**: Simplified tool creation with built-in helpers (recommended for most cases)

### Approach 1: Traditional Tool Definition

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

### Approach 2: DevonThinkTool Base Class (Recommended)

The `DevonThinkTool` base class provides a simplified, standardized approach with built-in helpers. This is the recommended approach for most tools as it reduces boilerplate and provides useful utilities.

Create a new TypeScript file in the `src/tools/` directory:

```typescript
import { z } from "zod";
import { createDevonThinkTool } from "../base/DevonThinkTool.js";

// Define your input schema
const YourToolSchema = z.object({
  parameter1: z.string().describe("Description of parameter1"),
  parameter2: z.number().optional().describe("Optional parameter2"),
}).strict();

// Create the tool using the factory function
export const yourToolTool = createDevonThinkTool({
  name: "your_tool_name",
  description: "Description of what your tool does",

  inputSchema: YourToolSchema,

  buildScript: (input, helpers) => {
    const { parameter1, parameter2 } = input;

    // Use helper functions for safe script building
    return helpers.wrapInTryCatch(`
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;

      // Use helpers.formatValue() for safe value interpolation
      const param1 = ${helpers.formatValue(parameter1)};
      const param2 = ${parameter2 !== undefined ? parameter2 : 'null'};

      // Your DEVONthink operations here...

      // Always build result objects using bracket notation
      const result = {};
      result["success"] = true;
      result["data"] = "your data here";

      return JSON.stringify(result);
    `);
  }
});
```

**Key Benefits of DevonThinkTool Base Class**:

1. **Built-in Helpers**: Automatic access to:
   - `helpers.escapeString()`: Safe string escaping for JXA
   - `helpers.formatValue()`: Automatically formats any value for JXA
   - `helpers.wrapInTryCatch()`: Adds proper error handling
   - `helpers.buildDatabaseLookup()`: Standard database lookup code
   - `helpers.buildRecordLookup()`: Standard record lookup code

2. **Automatic Error Handling**: The base class handles validation and execution errors

3. **Type Safety**: Full TypeScript support with inferred types

4. **Consistency**: Ensures all tools follow the same patterns

5. **Less Boilerplate**: No need to manually create Tool objects or handle executeJxa

**Example: AI Tool Pattern**

See `src/tools/ai/askAiAboutDocuments.ts` for a real-world example of using the DevonThinkTool base class with complex AI interactions.

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

## Recent Improvements

### AI-Powered Tools (2025-08)
- Added comprehensive AI integration leveraging DEVONthink's native AI capabilities
- New `ask_ai_about_documents` tool for AI-powered document analysis and Q&A
- New `check_ai_health` tool to verify AI service availability and configuration
- New `create_summary_document` tool for generating AI summaries from multiple documents
- New `get_ai_tool_documentation` tool providing comprehensive AI tool documentation
- Introduced `DevonThinkTool` base class for simplified, standardized tool creation
- Built-in helper functions for safe JXA script generation and common patterns
- Supports multiple AI engines: ChatGPT, Claude, Gemini, Mistral AI, GPT4All, LM Studio, Ollama
- Comprehensive error handling and user-friendly setup guidance

### Content Update Capability (2025-07)
- Added `update_record_content` tool to modify existing records without changing UUID
- Supports updating markdown, text, RTF, formatted notes, and HTML documents
- Preserves all metadata including creation date, tags, and references
- Uses `plainText` property for text-based formats and `source` property for HTML

### String Escaping and Safety
- Added `src/utils/escapeString.ts` utility for proper JXA string escaping
- All user inputs are now properly escaped to prevent script injection
- Special characters in search queries, names, and paths are handled correctly
- Added validation to reject inputs with problematic control characters

### Enhanced Record Lookup
- **ID Lookup Improvements**: Tools now use DEVONthink's direct `getRecordWithId()` method for fast, reliable ID lookups
- **Path Lookup**: Discovered and implemented `getRecordAt()` for direct path-based lookups
- **UUID vs ID Clarification**: All tools now clearly document when to use UUID (globally unique) vs ID+Database (database-specific)
- **New Tool**: Added `get_record_by_identifier` for unified record lookup

### Search Tool Enhancements
- Now returns both `id` and `uuid` for all search results
- Added multiple search scope options:
  - `groupUuid` - Direct UUID lookup (fastest)
  - `groupId` + `databaseName` - Direct ID lookup (fast)
  - `groupPath` - Direct path lookup (fast)
  - `groupName` - Search by name (fallback)
- Improved query escaping to handle complex searches with quotes and special characters
- Added examples of search syntax in tool description
- Better error messages for invalid queries

### Error Message Improvements
- More specific error messages that include context (e.g., "Record with ID 12345 not found in database '1 - Documents'")
- Validation errors now clearly state what's wrong with the input
- Tools provide hints about alternative approaches when operations fail

## Troubleshooting Common Issues

### Search Query Syntax Errors
**Problem**: Search queries with quotes or special characters fail with syntax errors

**Solution**: The search tool now automatically escapes special characters. You can use:
- Simple text: `invoice 2024`
- Quotes for exact phrases: `"exact phrase here"`
- Boolean operators: `travel AND (berlin OR munich)`

### Record Not Found by ID
**Problem**: `get_record_properties` or other tools can't find a record by its ID

**Solution**: 
- Always specify the database name when using record IDs
- Use the new `get_record_by_identifier` tool for more reliable lookup
- Prefer UUIDs over IDs when possible (UUIDs work across all databases)

### Groups Not Found by Path
**Problem**: `lookup_record` with path doesn't find groups/folders

**Solution**: 
- Use `list_group_content` to navigate the hierarchy
- Use search to find groups by name
- Get the UUID from search results or list operations

### Searching Within Specific Groups
**Problem**: Need to search within a specific folder/group

**Solution**: Use the enhanced search tool with one of these methods:
1. **By UUID** (fastest): `search(query: "invoice", groupUuid: "5557A251-0062-4DD9-9DA5-4CFE9DEE627B")`
2. **By Path** (fast): `search(query: "invoice", groupPath: "/Trips/2025")`
3. **By ID** (fast): `search(query: "invoice", groupId: 121910, databaseName: "1 - Documents")`
4. **By Name** (slower): `search(query: "invoice", groupName: "2025")`

### Moving to Database Root
**Problem**: Can't move a record to the database root level

**Solution**: 
1. Use `get_open_databases` to get the database UUID
2. Use the database UUID as the `destinationGroupUuid` in `move_record`

## Best Practices

### Record Identification
1. **Always prefer UUID** when available - it's globally unique and doesn't require database context
2. **When using ID**, always specify the database name for accurate results
3. **Save both ID and UUID** from search/create operations for future reference

### Error Handling
1. Check tool responses for `success: false` before proceeding
2. Read error messages carefully - they now include specific details about what went wrong
3. Use the validation built into tools to catch issues early

### Performance Tips
1. Use `get_record_by_identifier` for single record lookup instead of searching
2. When searching, use specific queries to reduce result sets
3. Use appropriate tools for the task (e.g., `lookup_record` for exact matches, `search` for text queries)

## JXA Interpreter Limitations and Best Practices

### Important Discovery (2025-07)

During debugging, we discovered that the JXA (JavaScript for Automation) interpreter has specific limitations when it comes to object literal syntax, particularly when used within template literals. This section documents these limitations and the best practices to avoid common errors.

### Object Literal Syntax Issues

**Problem**: When creating objects in JXA scripts generated via template literals, using ES6 object literal syntax can cause "ReferenceError: Can't find variable" errors.

**Example of problematic code**:
```javascript
// This FAILS in JXA when generated via template literals
const lookupOptions = {
  uuid: pGroupUuid,    // JXA may interpret 'uuid' as a variable name
  id: pGroupId,
  path: pGroupPath
};
```

**Solution**: Use bracket notation for object property assignment:
```javascript
// This WORKS reliably in JXA
const lookupOptions = {};
lookupOptions["uuid"] = pGroupUuid;
lookupOptions["id"] = pGroupId;
lookupOptions["path"] = pGroupPath;
```

### Direct Object Return Limitation

**CRITICAL**: JXA cannot return object literals directly. This is a separate issue from the property assignment problem above.

**Problem**: Returning object literals directly causes errors in JXA:
```javascript
// This FAILS in JXA
return { record: record, method: 'uuid' };

// This also FAILS
return { success: true, data: someData };
```

**Solution**: Always build objects using bracket notation before returning:
```javascript
// This WORKS in JXA
const result = {};
result["record"] = record;
result["method"] = "uuid";
return result;

// For simple success/error returns
const response = {};
response["success"] = true;
response["data"] = someData;
return response;
```

**Important**: This applies to ALL object returns in JXA scripts, not just those with computed property names.

### String Interpolation Best Practices

When building JXA scripts with template literals, follow these guidelines:

1. **Avoid formatValueForJXA for object properties**:
   ```javascript
   // DON'T do this:
   const options = {
     uuid: ${formatValueForJXA(uuid)}  // Can cause issues
   };
   
   // DO this instead:
   const options = {};
   options["uuid"] = ${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"};
   ```

2. **Use intermediate variables for complex expressions**:
   ```javascript
   // DON'T do this:
   error = "UUID not found: " + options.uuid;  // May fail if options.uuid is undefined
   
   // DO this instead:
   const uuidValue = options.uuid || "undefined";
   error = "UUID not found: " + uuidValue;
   ```

3. **Always use bracket notation when building objects dynamically**:
   ```javascript
   // Building search options
   const searchOptions = {};
   if (searchScope) {
     searchOptions["in"] = searchScope;
   }
   if (comparison) {
     searchOptions["comparison"] = comparison;
   }
   ```

### Error Message Construction

Be careful when constructing error messages that reference object properties:

```javascript
// Problematic - may cause reference errors
if (!record) {
  error = "Record not found: " + options.name;
}

// Better - use intermediate variable
if (!record) {
  const nameValue = options.name || "unknown";
  error = "Record not found: " + nameValue;
}
```

### Template Literal Variable Definition

When defining variables in JXA scripts via template literals:

```javascript
// Define with proper null handling
const pGroupUuid = ${groupUuid ? `"${escapeStringForJXA(groupUuid)}"` : "null"};
const pGroupId = ${groupId !== undefined ? groupId : "null"};

// Then use bracket notation for objects
const options = {};
options["uuid"] = pGroupUuid;
options["id"] = pGroupId;
```

### Error Handling in JXA Scripts

**CRITICAL**: `console.log` statements in JXA scripts will cause stdio JSON-RPC errors because they output to stderr, which the MCP server interprets as an error condition.

**Problem**: Using console.log for debugging or in error handlers:
```javascript
// This FAILS - causes MCP error even if the operation succeeds
try {
  const result = someOperation();
} catch (e) {
  console.log("[DEBUG] Error:", e.toString());  // DON'T DO THIS
  throw e;
}
```

**Solution**: Always return a properly formatted error object without console.log:
```javascript
// This WORKS - proper error handling
try {
  const result = someOperation();
  // ... process result ...
} catch (e) {
  const errorResponse = {};
  errorResponse["success"] = false;
  errorResponse["error"] = e.toString();
  return JSON.stringify(errorResponse);
}
```

**Important Notes**:
1. Never use `console.log` in production JXA scripts
2. Always return valid JSON with `success: false` for errors
3. Build error objects using bracket notation (not inline object literals)
4. For debugging, temporarily return error details in the JSON response instead of logging

### JSON.stringify and DEVONthink Objects

**Problem**: DEVONthink objects (records, databases, etc.) cannot be directly JSON.stringify'd. Attempting to do so returns `undefined` or causes errors.

```javascript
// This FAILS - returns undefined or errors
const record = theApp.getRecordWithUuid("some-uuid");
console.log("Record:", JSON.stringify(record));  // Outputs: Record: undefined
```

**Solution**: Convert DEVONthink objects to plain JavaScript objects before stringifying:

```javascript
// Extract properties first
const record = theApp.getRecordWithUuid("some-uuid");
const recordData = {};
recordData["id"] = record.id();
recordData["uuid"] = record.uuid();
recordData["name"] = record.name();
recordData["type"] = record.type();
// ... other properties as needed

console.log("Record:", JSON.stringify(recordData));  // Works correctly
```

### Common Patterns to Avoid

1. **Direct object literal with computed property names**
2. **Complex property access in string concatenation**
3. **Assuming ES6+ features work the same as in Node.js**
4. **Using shorthand property syntax**
5. **JSON.stringify on DEVONthink objects without conversion**
6. **Returning object literals directly**

### Recommended Pattern for Tool Development

When creating new tools, follow this pattern for building JXA scripts:

```typescript
const script = `
  (() => {
    const theApp = Application("DEVONthink");
    theApp.includeStandardAdditions = true;
    
    try {
      // Define variables with proper escaping
      const param1 = ${param1 ? `"${escapeStringForJXA(param1)}"` : "null"};
      
      // Build objects using bracket notation
      const options = {};
      options["property1"] = param1;
      options["property2"] = "value";
      
      // Use intermediate variables for property access
      const value = options.property1 || "default";
      
      // Perform operations...
      
      return JSON.stringify({ success: true });
    } catch (error) {
      return JSON.stringify({ 
        success: false, 
        error: error.toString() 
      });
    }
  })();
`;
```

This pattern ensures compatibility with the JXA interpreter and avoids common pitfalls that can cause runtime errors.

## DEVONthink Path vs Filesystem Path Distinction

**CRITICAL**: When working with DEVONthink paths, there are two distinct types of paths:

### DEVONthink Location Paths (Correct)
- **What it is**: Internal DEVONthink path showing location within the database hierarchy
- **Format**: `/Inbox/My Document.md`, `/Projects/2024/Report.pdf`
- **Where to find**: The "Path" column in DEVONthink's interface, or the `location()` property of records
- **Usage**: This is what the `recordPath` parameter expects in tools like `get_record_properties` and `delete_record`

### Filesystem Paths (Incorrect for DEVONthink tools)
- **What it is**: Physical file system path where DEVONthink stores files
- **Format**: `/Users/david/Databases/MyDB.dtBase2/Files.noindex/md/2/My Document.md`
- **Why wrong**: This is an internal implementation detail that can change and is not recognized by DEVONthink's API

### Tool Usage Examples

**Correct usage:**
```javascript
// Using DEVONthink location path
get_record_properties({ recordPath: "/Inbox/My Document.md" })
delete_record({ recordPath: "/Projects/2024/Report.pdf" })
```

**Incorrect usage:**
```javascript
// DON'T use filesystem paths
get_record_properties({ recordPath: "/Users/david/Databases/Test.dtBase2/Files.noindex/md/2/My Document.md" })
```

## DEVONthink Search Query Syntax

Based on testing and user feedback, here are the correct search query patterns:

### Working Date Syntax
- **Recent dates**: `created:Yesterday`, `created:#3days`, `created:#1week`
- **Specific dates**: `created>=2025-07-14`, `created<=2025-07-21`
- **Combined**: `kind:document created>=2025-07-14 created<=2025-07-21`

### Working Content Filters
- **Kind filters**: `kind:pdf`, `kind:group`, `kind:markdown`, `kind:!group` (exclude groups)
- **Name searches**: `name:foo kind:pdf`, `name:~thailand` (contains thailand)
- **Combined filters**: `kind:pdf created:#3days name:invoice`

### Non-Working Patterns (Avoid)
- **ISO date ranges**: `created:2024-01-01..2024-12-31` (doesn't work)
- **Wildcard dates**: `created:2024-*` (unreliable)

### Recommended Query Patterns
```javascript
// Recent PDFs containing "invoice"
search({ query: "kind:pdf created:#3days name:~invoice" })

// Documents from specific date range
search({ query: "kind:document created>=2025-07-14 created<=2025-07-21" })

// Everything except groups, created yesterday
search({ query: "kind:!group created:Yesterday" })

// PDFs with specific name
search({ query: "name:foo kind:pdf" })
```

## Tool Parameter Best Practices

### Record Identification Priority
1. **UUID** (most reliable): Works across all databases, globally unique
2. **ID + Database**: Fast and reliable within a specific database
3. **DEVONthink Path**: Internal location path (NOT filesystem path)

### Deprecated Parameters
- **recordName**: Removed from `get_record_properties` and `delete_record` due to ambiguity
- **groupName**: Removed from `search` due to ambiguity and unreliable matching

### Error Prevention
- Always validate that paths are DEVONthink location paths, not filesystem paths
- Use proper date syntax for search queries
- Prefer UUID or ID+Database over path-based lookups when possible

## Native File Import Tools (2025-08)

### Enhanced File Import Capabilities

The MCP server now includes three powerful import tools that use DEVONthink's native import functionality, solving previous encoding and file type issues:

### `import_file` - Single File Import
- **Purpose**: Import individual files with proper metadata preservation
- **Benefits**: Handles all file types (text, binary, scripts, images), preserves file metadata
- **Parameters**:
  - `filePath`: Absolute filesystem path to the file
  - `parentGroupUuid`: Target group UUID (optional, defaults to inbox)
  - `databaseName`: Target database name (optional, defaults to current)
  - `customName`: Override the imported record name (optional)

**Example Usage:**
```javascript
// Import a shell script
mcp_client.call("import_file", {
  "filePath": "/path/to/script.sh",
  "parentGroupUuid": "scripts-folder-uuid",
  "customName": "Deployment Script"
})
```

### `import_directory` - Directory Structure Import
- **Purpose**: Import entire directory hierarchies with filtering
- **Benefits**: Batch processing, file filtering, structure preservation
- **Parameters**:
  - `directoryPath`: Absolute path to directory
  - `parentGroupUuid`: Target group UUID (optional)
  - `databaseName`: Target database name (optional)
  - `recursive`: Import subdirectories (default: true)
  - `fileFilter`: Glob pattern (e.g., "*.{md,txt}")
  - `excludeHidden`: Skip hidden files (default: true)
  - `preservePath`: Maintain directory structure (default: true)

**Example Usage:**
```javascript
// Import project documentation
mcp_client.call("import_directory", {
  "directoryPath": "/path/to/project/docs",
  "fileFilter": "*.{md,txt,pdf}",
  "preservePath": true
})
```

### `import_with_options` - Advanced Batch Import
- **Purpose**: Comprehensive import with advanced configuration
- **Benefits**: Duplicate handling, batch tagging, multiple sources
- **Parameters**:
  - `sourcePaths`: Array of file/directory paths
  - `parentGroupUuid`: Target group UUID (optional)
  - `databaseName`: Target database name (optional)
  - `importOptions`: Comprehensive configuration object
    - `createIndex`: Boolean (default: true) - Create index entries for imported files
    - `duplicateDetection`: "skip", "rename", or "replace" - How to handle duplicate files
    - `preserveCreationDate`: Boolean (default: true) - Maintain original file dates
    - `addTags`: Array of tags to apply to all imported records
    - `recursive`: Boolean (default: true) - Import subdirectories recursively (applies to directory sources)
    - `fileFilter`: Glob pattern to filter files (e.g., "*.md", "*.{txt,md}")
    - `excludeHidden`: Boolean (default: true) - Whether to exclude hidden files and directories
    - `preservePath`: Boolean (default: true) - Whether to preserve directory structure

**Example Usage:**
```javascript
// Import with comprehensive options
mcp_client.call("import_with_options", {
  "sourcePaths": ["/archive/project1", "/archive/project2"],
  "importOptions": {
    "createIndex": true,
    "duplicateDetection": "rename",
    "preserveCreationDate": true,
    "addTags": ["archived", "legacy"],
    "fileFilter": "*.{md,txt,js,sh}",
    "preservePath": true
  }
})
```

### Import Options Behavior Details

**`duplicateDetection` modes**:
- `"skip"`: If a file with the same name exists in the target group, the import is skipped entirely
- `"rename"`: Creates a unique name by appending a counter (e.g., "file 1.txt", "file 2.txt") when duplicates are detected
- `"replace"`: Deletes the existing record before importing the new file

**`createIndex` (asIndexed)**:
- When `true`, creates indexed entries that reference the original file location
- When `false`, imports files into the DEVONthink database (copies the file)

**`preserveCreationDate`**:
- Passes the original file's creation date to DEVONthink's import function
- DEVONthink preserves this metadata on the imported record

### Key Advantages Over Content-Based Creation

1. **Encoding Safety**: DEVONthink handles all character encodings internally
2. **File Type Preservation**: Maintains proper file types and associations
3. **Metadata Preservation**: Keeps creation dates, file sizes, and other metadata
4. **Binary File Support**: Handles images, PDFs, executables, and other binary formats
5. **Batch Processing**: Efficiently imports multiple files and directories
6. **Error Recovery**: Graceful handling of problematic files with detailed reporting

### Import Tool Selection Guide

- **Single File**: Use `import_file` for importing individual files with optional renaming
- **Directory Structure**: Use `import_directory` for importing folder hierarchies with filtering
- **Complex Batch**: Use `import_with_options` for advanced scenarios with duplicate handling and tagging

### Response Format

All import tools return detailed responses including:
- `importedRecords`: Array of successfully imported records with UUIDs and metadata
- `skippedFiles`: Files that couldn't be imported with reasons
- `duplicateFiles`: Duplicate handling results (for `import_with_options`)
- `totalFiles`, `importedCount`, `skippedCount`: Summary statistics