import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../applescript/execute.js";
import { escapeStringForJXA, isJXASafeString } from "../utils/escapeString.js";
import { getRecordLookupHelpers, getDatabaseHelper } from "../utils/jxaHelpers.js";
import { lookupZoteroMetadataByPath } from "../utils/zoteroMetadata.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const GetZoteroMetadataSchema = z
	.object({
		uuid: z.string().optional().describe("UUID of the DEVONthink record"),
		id: z
			.number()
			.optional()
			.describe("DEVONthink record ID (requires databaseName)"),
		databaseName: z
			.string()
			.optional()
			.describe("Database name (required when using record ID)"),
		recordPath: z
			.string()
			.optional()
			.describe("DEVONthink location path, e.g. /Inbox/My File.pdf"),
		finderPath: z
			.string()
			.optional()
			.describe("Absolute Finder path to the file, e.g. /Users/me/Documents/file.pdf"),
		zoteroJsonPath: z
			.string()
			.optional()
			.describe("Path to a Zotero JSON export containing attachment metadata"),
		zoteroBibPath: z
			.string()
			.optional()
			.describe("Path to a Zotero BibTeX export containing attachment metadata"),
	})
	.strict()
	.refine(
		(data) =>
			Boolean(
				data.finderPath ||
					data.uuid ||
					data.recordPath ||
					(data.id !== undefined && data.databaseName),
			),
		{
			message:
				"Provide a finderPath or a record identifier (UUID, recordPath, or id with databaseName)",
		},
	)
	.refine((data) => !(data.id !== undefined && !data.databaseName), {
		message: "databaseName is required when using record ID",
	});

type GetZoteroMetadataInput = z.infer<typeof GetZoteroMetadataSchema>;

interface RecordLookupResult {
	success: boolean;
	error?: string;
	finderPath?: string | null;
	lookupMethod?: string | null;
	record?: {
		uuid?: string | null;
		id?: number | null;
		name?: string | null;
		location?: string | null;
		path?: string | null;
		databaseName?: string | null;
		databaseUuid?: string | null;
	};
}

interface ZoteroMetadataToolSuccess {
	success: true;
	finderPath: string;
	source: "json" | "bib";
	lookupMethod?: string | null;
	record?: RecordLookupResult["record"];
	metadata: Record<string, unknown>;
	pathsChecked: {
		json?: string | null;
		bib?: string | null;
	};
}

interface ZoteroMetadataToolFailure {
	success: false;
	error: string;
	details?: string[];
	pathsChecked: {
		json?: string | null;
		bib?: string | null;
	};
}

const buildRecordLookupScript = (input: {
	uuid?: string;
	id?: number;
	databaseName?: string;
	recordPath?: string;
}) => {
	const parts: string[] = [];
	parts.push(`(() => {`);
	parts.push(`  const theApp = Application("DEVONthink");`);
	parts.push(`  theApp.includeStandardAdditions = true;`);
	parts.push(`  ${getRecordLookupHelpers()}`);
	parts.push(`  ${getDatabaseHelper}`);
	parts.push(`  try {`);
	parts.push(`    const lookupOptions = {};`);
	parts.push(`    let resolvedDatabase = null;`);

	if (input.uuid) {
		parts.push(
			`    lookupOptions["uuid"] = "${escapeStringForJXA(input.uuid)}";`,
		);
	}

	if (input.id !== undefined) {
		parts.push(`    lookupOptions["id"] = ${input.id};`);
	}

	if (input.recordPath) {
		parts.push(
			`    lookupOptions["path"] = "${escapeStringForJXA(input.recordPath)}";`,
		);
	}

	if (input.databaseName) {
		parts.push(
			`    resolvedDatabase = getDatabase(theApp, "${escapeStringForJXA(input.databaseName)}");`,
		);
		parts.push(`    lookupOptions["database"] = resolvedDatabase;`);
	}

	parts.push(`    if (Object.keys(lookupOptions).length === 0) {`);
	parts.push(`      const response = {};`);
	parts.push(`      response["success"] = false;`);
	parts.push(`      response["error"] = "No lookup parameters provided";`);
	parts.push(`      return JSON.stringify(response);`);
	parts.push(`    }`);

	parts.push(`    const lookupResult = getRecord(theApp, lookupOptions);`);
	parts.push(`    if (!lookupResult || !lookupResult.record) {`);
	parts.push(`      const response = {};`);
	parts.push(`      response["success"] = false;`);
	parts.push(
			`      const lookupError = lookupResult && lookupResult.error ? lookupResult.error : "Record not found";`,
		);
	parts.push(`      response["error"] = lookupError;`);
	parts.push(`      return JSON.stringify(response);`);
	parts.push(`    }`);

	parts.push(`    const record = lookupResult.record;`);
	parts.push(`    let finderPath = null;`);
	parts.push(`    try {`);
	parts.push(`      finderPath = record.path();`);
	parts.push(`    } catch (e) {`);
	parts.push(`      finderPath = null;`);
	parts.push(`    }`);

	parts.push(`    const response = {};`);
	parts.push(`    response["success"] = true;`);
	parts.push(`    response["finderPath"] = finderPath;`);
	parts.push(
			`    response["lookupMethod"] = lookupResult.method ? lookupResult.method : null;`,
		);

	parts.push(`    const recordInfo = {};`);
	parts.push(`    try { recordInfo["uuid"] = record.uuid(); } catch (e) { recordInfo["uuid"] = null; }`);
	parts.push(`    try { recordInfo["id"] = record.id(); } catch (e) { recordInfo["id"] = null; }`);
	parts.push(`    try { recordInfo["name"] = record.name(); } catch (e) { recordInfo["name"] = null; }`);
	parts.push(
			`    try { recordInfo["location"] = record.location(); } catch (e) { recordInfo["location"] = null; }`,
		);
	parts.push(`    recordInfo["path"] = finderPath;`);
	parts.push(`    try {`);
	parts.push(`      const db = record.database();`);
	parts.push(`      if (db) {`);
	parts.push(`        recordInfo["databaseName"] = db.name();`);
	parts.push(`        recordInfo["databaseUuid"] = db.uuid();`);
	parts.push(`      } else if (resolvedDatabase) {`);
	parts.push(`        recordInfo["databaseName"] = resolvedDatabase.name();`);
	parts.push(`        recordInfo["databaseUuid"] = resolvedDatabase.uuid();`);
	parts.push(`      } else {`);
	parts.push(`        recordInfo["databaseName"] = null;`);
	parts.push(`        recordInfo["databaseUuid"] = null;`);
	parts.push(`      }`);
	parts.push(`    } catch (e) {`);
	parts.push(`      recordInfo["databaseName"] = null;`);
	parts.push(`      recordInfo["databaseUuid"] = null;`);
	parts.push(`    }`);

	parts.push(`    response["record"] = recordInfo;`);
	parts.push(`    return JSON.stringify(response);`);
	parts.push(`  } catch (error) {`);
	parts.push(`    const response = {};`);
	parts.push(`    response["success"] = false;`);
	parts.push(`    response["error"] = error.toString();`);
	parts.push(`    return JSON.stringify(response);`);
	parts.push(`  }`);
	parts.push(`})();`);

	return parts.join("\n");
};

const getRecordFinderPath = async (
	input: GetZoteroMetadataInput,
): Promise<RecordLookupResult> => {
	try {
		const script = buildRecordLookupScript(input);
		return await executeJxa<RecordLookupResult>(script);
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
};

const getZoteroMetadata = async (
	input: GetZoteroMetadataInput,
): Promise<ZoteroMetadataToolSuccess | ZoteroMetadataToolFailure> => {
	const {
		uuid,
		id,
		databaseName,
		recordPath,
		finderPath,
		zoteroJsonPath,
		zoteroBibPath,
	} = input;

	const metadataJsonPath = zoteroJsonPath ?? process.env.ZOTERO_BIBLIOGRAPHY_JSON ?? null;
	const metadataBibPath = zoteroBibPath ?? process.env.ZOTERO_BIBLIOGRAPHY_BIB ?? null;
	const pathsChecked = {
		json: metadataJsonPath,
		bib: metadataBibPath,
	} as const;

	if (uuid && !isJXASafeString(uuid)) {
		return {
			success: false,
			error: "UUID contains invalid characters for JXA execution",
			pathsChecked,
		};
	}

	if (databaseName && !isJXASafeString(databaseName)) {
		return {
			success: false,
			error: "Database name contains invalid characters for JXA execution",
			pathsChecked,
		};
	}

	if (recordPath && !isJXASafeString(recordPath)) {
		return {
			success: false,
			error: "recordPath contains invalid characters for JXA execution",
			pathsChecked,
		};
	}

	let resolvedFinderPath = finderPath ?? null;
	let recordContext: RecordLookupResult["record"] = undefined;
	let lookupMethod: string | null = null;

	if (uuid || recordPath || id !== undefined) {
		const recordLookup = await getRecordFinderPath({
			uuid,
			id,
			databaseName,
			recordPath,
		});

		if (!recordLookup.success) {
			return {
				success: false,
				error:
					recordLookup.error ||
					"Failed to locate record in DEVONthink for metadata lookup",
				pathsChecked,
			};
		}

		recordContext = recordLookup.record;
		if (recordLookup.lookupMethod) {
			lookupMethod = recordLookup.lookupMethod;
		}
		if (!resolvedFinderPath && recordLookup.finderPath) {
			resolvedFinderPath = recordLookup.finderPath;
		}
	}

	if (!resolvedFinderPath) {
		return {
			success: false,
			error: "Unable to determine Finder path for metadata lookup",
			pathsChecked,
		};
	}

	const lookupResult = await lookupZoteroMetadataByPath(resolvedFinderPath, {
		jsonPath: metadataJsonPath ?? undefined,
		bibPath: metadataBibPath ?? undefined,
	});

	if (!lookupResult.success) {
		return {
			success: false,
			error: "No Zotero metadata entry found for the provided Finder path",
			details: lookupResult.errors,
			pathsChecked,
		};
	}

	if (lookupResult.source === "json") {
		return {
			success: true,
			finderPath: resolvedFinderPath,
			source: "json",
			lookupMethod,
			record: recordContext,
			metadata: {
				item: lookupResult.item,
				matchValue: lookupResult.matchValue,
				propertyPath: lookupResult.propertyPath,
			},
			pathsChecked,
		};
	}

	return {
		success: true,
		finderPath: resolvedFinderPath,
		source: "bib",
		lookupMethod,
		record: recordContext,
		metadata: {
			entryType: lookupResult.entry.type,
			citationKey: lookupResult.entry.key,
			fields: lookupResult.entry.fields,
			matchValue: lookupResult.matchValue,
			rawEntry: lookupResult.rawEntry,
		},
		pathsChecked,
	};
};

export const getZoteroMetadataTool: Tool = {
	name: "get_zotero_metadata",
	description:
		"Look up Zotero metadata for a DEVONthink record. Provide a Finder path directly or identify the record by UUID, record ID (with database name), or DEVONthink location path. Optional `zoteroJsonPath` / `zoteroBibPath` inputs override the metadata export locations for a single call.",
	inputSchema: zodToJsonSchema(GetZoteroMetadataSchema) as ToolInput,
	run: getZoteroMetadata,
};
