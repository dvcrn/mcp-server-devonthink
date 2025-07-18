import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const CreateFromUrlSchema = z
  .object({
    url: z.string().url().describe("The URL to create a record from"),
    format: z
      .enum(["formatted_note", "markdown", "pdf", "web_document"])
      .describe("The format to create the record in"),
    name: z
      .string()
      .optional()
      .describe("Custom name for the record (auto-generated if not provided)"),
    parentGroupUuid: z
      .string()
      .optional()
      .describe(
        "The UUID of the parent group (defaults to the database's incoming group)"
      ),
    readability: z
      .boolean()
      .optional()
      .describe(
        "Whether to use readability mode to declutter the page (default: false)"
      ),
    userAgent: z
      .string()
      .optional()
      .describe("Custom user agent string to use for the request"),
    referrer: z
      .string()
      .optional()
      .describe("HTTP referrer to use for the request"),
    pdfOptions: z
      .object({
        pagination: z
          .boolean()
          .optional()
          .describe("Whether to paginate the PDF"),
        width: z.number().optional().describe("Width for PDF in points"),
      })
      .optional()
      .describe("PDF-specific options (only used when format is 'pdf')"),
    databaseName: z
      .string()
      .optional()
      .describe(
        "The name of the database to create the record in (defaults to current database)"
      ),
  })
  .strict();

type CreateFromUrlInput = z.infer<typeof CreateFromUrlSchema>;

interface CreateFromUrlResult {
  success: boolean;
  error?: string;
  recordId?: number;
  name?: string;
  path?: string;
  location?: string;
  uuid?: string;
}

const createFromUrl = async (
  input: CreateFromUrlInput
): Promise<CreateFromUrlResult> => {
  const {
    url,
    format,
    name,
    parentGroupUuid,
    readability,
    userAgent,
    referrer,
    pdfOptions,
    databaseName,
  } = input;

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      try {
        let targetDatabase;
        if ("${databaseName || ""}") {
          const databases = theApp.databases();
          targetDatabase = databases.find(db => db.name() === "${databaseName}");
          if (!targetDatabase) {
            throw new Error("Database not found: ${databaseName}");
          }
        } else {
          targetDatabase = theApp.currentDatabase();
        }

        // Get the parent group
        let destinationGroup;
        if ("${parentGroupUuid || ""}") {
          destinationGroup = theApp.getRecordWithUuid("${parentGroupUuid}");
          if (!destinationGroup) {
            throw new Error("Parent group with UUID not found: ${parentGroupUuid}");
          }
        } else {
          destinationGroup = targetDatabase.incomingGroup();
        }
        
        // Build options object
        const options = { in: destinationGroup };
        
        ${name ? `options.name = "${name}";` : ""}
        ${readability ? `options.readability = ${readability};` : ""}
        ${userAgent ? `options.agent = "${userAgent}";` : ""}
        ${referrer ? `options.referrer = "${referrer}";` : ""}
        
        // Add PDF-specific options if provided
        ${
          pdfOptions && format === "pdf"
            ? `
          ${
            pdfOptions.pagination
              ? `options.pagination = ${pdfOptions.pagination};`
              : ""
          }
          ${pdfOptions.width ? `options.width = ${pdfOptions.width};` : ""}
        `
            : ""
        }
        
        let newRecord;
        
        // Create record based on format
        switch ("${format}") {
          case "formatted_note":
            newRecord = theApp.createFormattedNoteFrom("${url}", options);
            break;
          case "markdown":
            newRecord = theApp.createMarkdownFrom("${url}", options);
            break;
          case "pdf":
            newRecord = theApp.createPDFDocumentFrom("${url}", options);
            break;
          case "web_document":
            newRecord = theApp.createWebDocumentFrom("${url}", options);
            break;
          default:
            return JSON.stringify({
              success: false,
              error: "Invalid format: ${format}"
            });
        }
        
        if (newRecord) {
          return JSON.stringify({
            success: true,
            recordId: newRecord.id(),
            name: newRecord.name(),
            path: newRecord.path(),
            location: newRecord.location(),
            uuid: newRecord.uuid()
          });
        } else {
          return JSON.stringify({
            success: false,
            error: "Failed to create record from URL"
          });
        }
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

  return await executeJxa<CreateFromUrlResult>(script);
};

export const createFromUrlTool: Tool = {
  name: "create_from_url",
  description:
    "Create a record in DEVONthink from a web URL. This tool supports creating formatted notes, markdown, PDFs, and web documents. Use `parentGroupUuid` to specify a location, otherwise it will be created in the database's incoming group. The tool returns the `uuid` of the new record.\n\nIMPORTANT - Database Root vs Inbox:\n- No parentGroupUuid = creates in database's Inbox (incoming group)\n- To create at database root: use parentGroupUuid with the database UUID\n- Get database UUID first using get_open_databases tool\n\nExample workflow for root creation:\n1. Use get_open_databases to get database UUID (e.g., '5E47D6F2-5E0C-4E30-A6ED-2AC92116C3E1')\n2. Use create_from_url with parentGroupUuid: '5E47D6F2-5E0C-4E30-A6ED-2AC92116C3E1'",
  inputSchema: zodToJsonSchema(CreateFromUrlSchema) as ToolInput,
  run: createFromUrl,
};
