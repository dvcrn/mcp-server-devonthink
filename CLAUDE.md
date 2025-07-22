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
- **`src/utils/`**: Utility functions
  - **`escapeString.ts`**: Provides safe string escaping for JXA script interpolation
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

## Recent Improvements (2025-07)

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
