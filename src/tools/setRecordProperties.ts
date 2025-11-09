import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { escapeStringForJXA, isJXASafeString } from "../utils/escapeString.js";
import { getRecordLookupHelpers, getDatabaseHelper } from "../utils/jxaHelpers.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const SetRecordPropertiesSchema = z
	.object({
		uuid: z.string().optional().describe("UUID of the record to update"),
		recordId: z.number().optional().describe("ID of the record to update"),
		recordPath: z
			.string()
			.optional()
			.describe("DEVONthink location path of the record (e.g., '/Inbox/My Document')"),
		databaseName: z
			.string()
			.optional()
			.describe("Database containing the record (required for recordId or recordPath)"),

		// Properties to set (all optional)
		comment: z.string().optional().describe("Set comment (overwrites any existing comment)"),
		flag: z.boolean().optional().describe("Set flagged state"),
		locked: z.boolean().optional().describe("Set locked (locking) state"),
		excludeFromChat: z.boolean().optional(),
		excludeFromClassification: z.boolean().optional(),
		excludeFromSearch: z.boolean().optional(),
		excludeFromSeeAlso: z.boolean().optional(),
		excludeFromTagging: z.boolean().optional().describe("Only applicable to groups"),
		excludeFromWikiLinking: z.boolean().optional(),
	})
	.strict()
	.refine(
		(data) =>
			data.uuid !== undefined || data.recordId !== undefined || data.recordPath !== undefined,
		{ message: "Either uuid, recordId, or recordPath must be provided" },
	);

type SetRecordPropertiesInput = z.infer<typeof SetRecordPropertiesSchema>;

interface SetRecordPropertiesResult {
	success: boolean;
	error?: string;
	uuid?: string;
	name?: string;
	recordType?: string;
	updated?: string[];
	skipped?: string[];
}

const setRecordProperties = async (
	input: SetRecordPropertiesInput,
): Promise<SetRecordPropertiesResult> => {
	const {
		uuid,
		recordId,
		recordPath,
		databaseName,
		comment,
		flag,
		locked,
		excludeFromChat,
		excludeFromClassification,
		excludeFromSearch,
		excludeFromSeeAlso,
		excludeFromTagging,
		excludeFromWikiLinking,
	} = input;

	// Validate string inputs
	if (uuid && !isJXASafeString(uuid)) {
		return { success: false, error: "UUID contains invalid characters" };
	}
	if (recordPath && !isJXASafeString(recordPath)) {
		return { success: false, error: "Record path contains invalid characters" };
	}
	if (databaseName && !isJXASafeString(databaseName)) {
		return { success: false, error: "Database name contains invalid characters" };
	}
	if (comment !== undefined && !isJXASafeString(comment)) {
		return { success: false, error: "Comment contains invalid characters" };
	}

	const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;

      // Inject helper functions
      ${getRecordLookupHelpers()}
      ${getDatabaseHelper}

      try {
        // Resolve target database (required when using id/path)
        const targetDatabase = getDatabase(theApp, ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"});

        // Build lookup options
        const lookupOptions = {};
        lookupOptions["uuid"] = ${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"};
        lookupOptions["id"] = ${recordId !== undefined ? recordId : "null"};
        lookupOptions["path"] = ${recordPath ? `"${escapeStringForJXA(recordPath)}"` : "null"};
        lookupOptions["name"] = null;
        lookupOptions["database"] = targetDatabase;

        // Find the record
        const lookupResult = getRecord(theApp, lookupOptions);
        if (!lookupResult || !lookupResult.record) {
          let errorDetails = lookupResult && lookupResult.error ? lookupResult.error : "Record not found";
          if (${recordId !== undefined ? recordId : "null"}) {
            errorDetails = "Record with ID " + ${recordId !== undefined ? recordId : "null"} + " not found in database '" + targetDatabase.name() + "'";
          } else if (${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"}) {
            errorDetails = "Record with UUID " + (${uuid ? `"${escapeStringForJXA(uuid)}"` : "null"} || "unknown") + " not found";
          } else if (${recordPath ? `"${escapeStringForJXA(recordPath)}"` : "null"}) {
            errorDetails = "Record at DEVONthink location path " + (${recordPath ? `"${escapeStringForJXA(recordPath)}"` : "null"} || "unknown") + " not found";
          }
          const err = {};
          err["success"] = false;
          err["error"] = errorDetails;
          return JSON.stringify(err);
        }

        const rec = lookupResult.record;

        // Track updates and skips
        const updated = [];
        const skipped = [];

        // Apply properties if provided
        const setIfProvided = (propName, providedValue) => {
          if (providedValue === null || providedValue === undefined) return false;
          try {
            rec[propName] = providedValue;
            updated.push(propName);
            return true;
          } catch (e) {
            // Mark as skipped with reason in name
            skipped.push(propName + ": " + e.toString());
            return false;
          }
        };

        // comment
        ${comment !== undefined ? `setIfProvided("comment", "${escapeStringForJXA(comment)}");` : ""}
        // flag
        ${flag !== undefined ? `setIfProvided("flag", ${flag});` : ""}
        // locking
        ${locked !== undefined ? `setIfProvided("locking", ${locked});` : ""}
        // exclusion flags (guard by availability)
        ${excludeFromChat !== undefined ? `if (rec.excludeFromChat !== undefined) { setIfProvided("excludeFromChat", ${excludeFromChat}); } else { skipped.push("excludeFromChat: not available"); }` : ""}
        ${excludeFromClassification !== undefined ? `if (rec.excludeFromClassification !== undefined) { setIfProvided("excludeFromClassification", ${excludeFromClassification}); } else { skipped.push("excludeFromClassification: not available"); }` : ""}
        ${excludeFromSearch !== undefined ? `if (rec.excludeFromSearch !== undefined) { setIfProvided("excludeFromSearch", ${excludeFromSearch}); } else { skipped.push("excludeFromSearch: not available"); }` : ""}
        ${excludeFromSeeAlso !== undefined ? `if (rec.excludeFromSeeAlso !== undefined) { setIfProvided("excludeFromSeeAlso", ${excludeFromSeeAlso}); } else { skipped.push("excludeFromSeeAlso: not available"); }` : ""}
        ${
			excludeFromTagging !== undefined
				? `
          (function(){
            try {
              const rt = rec.recordType ? rec.recordType() : null;
              if (rt === "group" || rt === "smart group") {
                if (rec.excludeFromTagging !== undefined) { setIfProvided("excludeFromTagging", ${excludeFromTagging}); }
                else { skipped.push("excludeFromTagging: not available"); }
              } else {
                skipped.push("excludeFromTagging: not a group");
              }
            } catch (e) { skipped.push("excludeFromTagging: " + e.toString()); }
          })();
        `
				: ""
		}
        ${excludeFromWikiLinking !== undefined ? `if (rec.excludeFromWikiLinking !== undefined) { setIfProvided("excludeFromWikiLinking", ${excludeFromWikiLinking}); } else { skipped.push("excludeFromWikiLinking: not available"); }` : ""}

        // Build response
        const res = {};
        res["success"] = true;
        try { res["uuid"] = rec.uuid(); } catch (e) {}
        try { res["name"] = rec.name(); } catch (e) {}
        try { res["recordType"] = rec.recordType(); } catch (e) {}
        res["updated"] = updated;
        res["skipped"] = skipped;
        return JSON.stringify(res);
      } catch (error) {
        const err = {};
        err["success"] = false;
        err["error"] = error.toString();
        return JSON.stringify(err);
      }
    })();
  `;

	return await executeJxa<SetRecordPropertiesResult>(script);
};

export const setRecordPropertiesTool: Tool = {
	name: "set_record_properties",
	description:
		'Set properties on a DEVONthink record (comment, flag, locked, exclude* flags).\n\nExample:\n{\n  "uuid": "1234-5678-90AB-CDEF",\n  "comment": "Updated by tool",\n  "flag": true,\n  "locked": true,\n  "excludeFromChat": true\n}',
	inputSchema: zodToJsonSchema(SetRecordPropertiesSchema) as ToolInput,
	run: setRecordProperties,
};
