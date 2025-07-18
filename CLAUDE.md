# Copilot Instructions

- This project uses [Vitest](https://vitest.dev/) for testing.
- All changes must pass `npm test` before being considered complete.
- All changes must pass `npm run build`

## Project Structure

- **`src/index.ts`**: The main entry point for the CLI application. It sets up a `StdioServerTransport` for communication.
- **`src/sse.ts`**: An alternative entry point that uses an `SSEServerTransport` with Express, allowing the server to communicate over HTTP.
- **`src/devonthink.ts`**: The core server logic. It creates and configures the MCP server, defines request handlers for listing and calling tools, and manages the available tools.
- **`src/tools/isRunning.ts`**: Defines the `is_running` tool, which checks if DEVONthink is active. It uses JXA for this check.
- **`src/applescript/execute.ts`**: A utility module that provides the `executeJxa` function to run JXA scripts via the command line.
