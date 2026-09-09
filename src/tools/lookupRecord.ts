import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { escapeStringForJXA, formatValueForJXA, isJXASafeString } from "../utils/escapeString.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const LookupRecordSchema = z
	.object({
		lookupType: z
			.enum(["filename", "path", "url", "tags", "comment", "contentHash"])
			.describe("Type of lookup to perform"),
		value: z.string().describe("Value to search for"),
		tags: z.array(z.string()).optional().describe("Tags to search for (for lookupType 'tags')"),
		matchAnyTag: z
			.boolean()
			.optional()
			.describe("Match any tag instead of all (for lookupType 'tags')"),
		databaseName: z
			.string()
			.optional()
			.describe(
				"Database to scope the lookup to. If omitted, every open database is searched.",
			),
		limit: z.number().optional().describe("Maximum results to return (optional)"),
	})
	.strict();

type LookupRecordInput = z.infer<typeof LookupRecordSchema>;

interface LookupResult {
	success: boolean;
	error?: string;
	results?: Array<{
		id: number;
		name: string;
		path: string;
		location: string;
		recordType: string;
		kind: string;
		creationDate?: string;
		modificationDate?: string;
		tags?: string[];
		size?: number;
		url?: string;
		comment?: string;
	}>;
	totalCount?: number;
}

const lookupRecord = async (input: LookupRecordInput): Promise<LookupResult> => {
	const { lookupType, value, tags, matchAnyTag, databaseName, limit = 50 } = input;

	// Validate every string that gets interpolated into the JXA script. Control
	// characters can't be safely escaped, so we reject them at the boundary.
	if (!isJXASafeString(value)) {
		return { success: false, error: "Value contains invalid characters" };
	}
	if (databaseName !== undefined && !isJXASafeString(databaseName)) {
		return { success: false, error: "Database name contains invalid characters" };
	}
	if (tags) {
		for (const tag of tags) {
			if (!isJXASafeString(tag)) {
				return { success: false, error: "Tag contains invalid characters" };
			}
		}
	}

	// Build safely-escaped JXA literals up front. The script template references
	// these `p*` constants and never re-interpolates raw user input.
	const pValue = formatValueForJXA(value);
	const pDatabaseName = formatValueForJXA(databaseName);
	const pLookupType = formatValueForJXA(lookupType);
	const pTagsLiteral = tags
		? `[${tags.map((t) => `"${escapeStringForJXA(t)}"`).join(", ")}]`
		: "[]";
	const pMatchAnyTag = matchAnyTag === true;
	const pLimit = typeof limit === "number" ? limit : 50;

	const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;

      const pValue = ${pValue};
      const pDatabaseName = ${pDatabaseName};
      const pLookupType = ${pLookupType};
      const pTags = ${pTagsLiteral};
      const pMatchAnyTag = ${pMatchAnyTag};
      const pLimit = ${pLimit};

      try {
        // Determine the set of databases to search.
        // If a databaseName is supplied, scope to that one database.
        // Otherwise, iterate every open database — DEVONthink's lookupRecordsWith*
        // APIs do not natively support "all databases" the way search() does, so we
        // must call them once per database and union the results.
        let searchDatabases;
        if (pDatabaseName) {
          const databases = theApp.databases();
          const targetDb = databases.find(db => db.name() === pDatabaseName);
          if (!targetDb) {
            return JSON.stringify({
              success: false,
              error: "Database not found: " + pDatabaseName
            });
          }
          searchDatabases = [targetDb];
        } else {
          searchDatabases = theApp.databases();
        }

        // lookupRecordsWith* returns AppleScript reference arrays; collect into
        // a plain array as we go so we can dedupe by UUID across databases.
        const seen = {};
        let searchResults = [];

        // x-devonthink-item:// URLs resolve globally via UUID — this is not a
        // per-database concept, so handle it once here, before the per-database
        // loop, rather than inside it. If the identifier doesn't resolve to an
        // existing record, the correct result is an empty set: searching every
        // other database for the same x-devonthink-item URL makes no sense.
        let resolvedGlobally = false;
        const dtPrefix = "x-devonthink-item://";
        if (pLookupType === "url" && pValue.startsWith(dtPrefix)) {
          resolvedGlobally = true;
          const identifier = decodeURIComponent(pValue.substring(dtPrefix.length));
          const record = theApp.getRecordWithUuid(identifier);
          if (record && record.exists()) {
            const uuid = record.uuid();
            seen[uuid] = true;
            searchResults.push(record);
          }
        }

        // Only run the per-database loop when we haven't already resolved the
        // lookup globally above.
        if (!resolvedGlobally) {
          for (let dbIdx = 0; dbIdx < searchDatabases.length; dbIdx++) {
            const searchDatabase = searchDatabases[dbIdx];
            let dbResults;

            switch (pLookupType) {
              case "filename": {
                const fileOptions = {};
                fileOptions["in"] = searchDatabase;
                dbResults = theApp.lookupRecordsWithFile(pValue, fileOptions);
                break;
              }
              case "path": {
                const pathOptions = {};
                pathOptions["in"] = searchDatabase;
                dbResults = theApp.lookupRecordsWithPath(pValue, pathOptions);
                break;
              }
              case "url": {
                // Non-DEVONthink URLs are looked up per-database via the url
                // property; x-devonthink-item:// URLs are already handled above.
                const urlOptions = {};
                urlOptions["in"] = searchDatabase;
                dbResults = theApp.lookupRecordsWithURL(decodeURIComponent(pValue), urlOptions);
                break;
              }
              case "comment": {
                const commentOptions = {};
                commentOptions["in"] = searchDatabase;
                dbResults = theApp.lookupRecordsWithComment(pValue, commentOptions);
                break;
              }
              case "contentHash": {
                const hashOptions = {};
                hashOptions["in"] = searchDatabase;
                dbResults = theApp.lookupRecordsWithContentHash(pValue, hashOptions);
                break;
              }
              case "tags": {
                const tagArray = pTags.slice();
                if (tagArray.length === 0 && pValue) {
                  tagArray.push(pValue);
                }
                const tagOptions = {};
                tagOptions["in"] = searchDatabase;
                if (pMatchAnyTag) {
                  tagOptions["any"] = true;
                }
                dbResults = theApp.lookupRecordsWithTags(tagArray, tagOptions);
                break;
              }
              default:
                return JSON.stringify({
                  success: false,
                  error: "Invalid lookup type: " + pLookupType
                });
            }

            if (dbResults && dbResults.length > 0) {
              for (let i = 0; i < dbResults.length; i++) {
                const rec = dbResults[i];
                const uuid = rec.uuid();
                if (!seen[uuid]) {
                  seen[uuid] = true;
                  searchResults.push(rec);
                }
              }
            }
          }
        }

        if (!searchResults || searchResults.length === 0) {
          return JSON.stringify({
            success: true,
            results: [],
            totalCount: 0
          });
        }

        // Limit results and extract properties
        const limitedResults = searchResults.slice(0, pLimit);
        const results = limitedResults.map(record => {
          const result = {
            id: record.id(),
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

          // Include URL if available
          if (record.url && record.url()) {
            result.url = record.url();
          }

          // Include comment if available
          if (record.comment && record.comment()) {
            result.comment = record.comment();
          }

          return result;
        });

        return JSON.stringify({
          success: true,
          results: results,
          totalCount: searchResults.length
        });
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error.toString()
        });
      }
    })();
  `;

	return await executeJxa<LookupResult>(script);
};

export const lookupRecordTool: Tool = {
	name: "lookup_record",
	description:
		'Look up records in DEVONthink by a specific attribute.\n\nBy default the lookup spans every open database; pass "databaseName" to scope to a single database.\n\nExample:\n{\n  "lookupType": "filename",\n  "value": "report.pdf"\n}',
	inputSchema: zodToJsonSchema(LookupRecordSchema) as ToolInput,
	run: lookupRecord,
};
