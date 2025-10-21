import { promises as fs } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import os from "os";

export const DEFAULT_ZOTERO_JSON_PATH = path.join(
	os.homedir(),
	"Library",
	"CloudStorage",
	"Dropbox",
	"pkm",
	"bibliography.json",
);

export const DEFAULT_ZOTERO_BIB_PATH = path.join(
	os.homedir(),
	"Library",
	"CloudStorage",
	"Dropbox",
	"pkm",
	"bibliography.bib",
);

export interface ZoteroJsonMatch {
	success: true;
	source: "json";
	item: Record<string, unknown>;
	matchValue: string;
	propertyPath: string[];
}

export interface ZoteroBibMatch {
	success: true;
	source: "bib";
	entry: BibEntry;
	rawEntry: string;
	matchValue: string;
}

export type ZoteroMetadataMatch = ZoteroJsonMatch | ZoteroBibMatch;

export interface ZoteroLookupOptions {
	jsonPath?: string;
	bibPath?: string;
}

export interface BibEntry {
	type: string;
	key: string;
	fields: Record<string, string>;
}

interface BibParseState {
	value: string;
	index: number;
}

const CACHE = {
	json: new Map<string, unknown>(),
};

const readJsonCache = async (filePath: string): Promise<unknown | null> => {
	if (CACHE.json.has(filePath)) {
		return CACHE.json.get(filePath) ?? null;
	}

	try {
		const raw = await fs.readFile(filePath, "utf8");
		const parsed = JSON.parse(raw) as unknown;
		CACHE.json.set(filePath, parsed);
		return parsed;
	} catch {
		return null;
	}
};

const fileExists = async (filePath: string): Promise<boolean> => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};

const normalizeComparisonString = (value: string): string => {
	let normalized = value.trim();
	if (normalized.toLowerCase().startsWith("file://")) {
		try {
			normalized = fileURLToPath(normalized);
		} catch {
			// Ignore URL parse errors and fall back to raw string
		}
	}

	normalized = normalized.replace(/\\/g, "/");
	return normalized;
};

const generatePathVariants = (finderPath: string): string[] => {
	const normalized = finderPath.replace(/\\/g, "/");
	const variants = new Set<string>();
	variants.add(normalized);

	if (normalized.startsWith("/")) {
		variants.add(`:${normalized}`);
		variants.add(`:${normalized}:`);
	}

	const encoded = encodeURI(normalized);
	variants.add(encoded);
	if (encoded.startsWith("/")) {
		variants.add(`:${encoded}`);
		variants.add(`:${encoded}:`);
	}

	const fileUrl = pathToFileURL(normalized).toString();
	variants.add(fileUrl);
	variants.add(fileUrl.replace("file://", ""));

	variants.add(normalized.replace(/ /g, "\\ "));
	variants.add(normalized.replace(/ /g, "%20"));

	return Array.from(variants).map((variant) => normalizeComparisonString(variant));
};

const matchStringAgainstVariants = (value: string, variants: string[]): boolean => {
	const normalizedValue = normalizeComparisonString(value);

	return variants.some((variant) => {
		if (normalizedValue === variant) return true;
		return normalizedValue.includes(variant);
	});
};

const getJsonEntries = (data: unknown): unknown[] => {
	if (Array.isArray(data)) {
		return data;
	}

	if (data && typeof data === "object") {
		const container = data as Record<string, unknown>;
		if (Array.isArray(container.items)) {
			return container.items;
		}
		return [data];
	}

	return [];
};

const findPathInJsonValue = (
	value: unknown,
	variants: string[],
	propertyPath: string[],
): { path: string[]; matchValue: string } | null => {
	if (typeof value === "string") {
		if (matchStringAgainstVariants(value, variants)) {
			return { path: propertyPath, matchValue: value };
		}
		return null;
	}

	if (Array.isArray(value)) {
		for (let index = 0; index < value.length; index += 1) {
			const childResult = findPathInJsonValue(
				value[index],
				variants,
				propertyPath.concat(`[${index}]`),
			);
			if (childResult) {
				return childResult;
			}
		}
		return null;
	}

	if (value && typeof value === "object") {
		const obj = value as Record<string, unknown>;
		for (const key of Object.keys(obj)) {
			const childResult = findPathInJsonValue(
				obj[key],
				variants,
				propertyPath.concat(key),
			);
			if (childResult) {
				return childResult;
			}
		}
	}

	return null;
};

const lookupInJson = async (
	finderPath: string,
	filePath: string,
): Promise<ZoteroJsonMatch | null> => {
	const variants = generatePathVariants(finderPath);
	const parsed = await readJsonCache(filePath);
	if (!parsed) {
		return null;
	}

	const entries = getJsonEntries(parsed);
	for (const entry of entries) {
		if (!entry || typeof entry !== "object") continue;
		const matchResult = findPathInJsonValue(entry, variants, []);
		if (matchResult) {
			return {
				success: true,
				source: "json",
				item: entry as Record<string, unknown>,
				matchValue: matchResult.matchValue,
				propertyPath: matchResult.path,
			};
		}
	}

	return null;
};

const parseBibValue = (state: BibParseState): string => {
	const { value } = state;
	let { index } = state;

	while (index < value.length && /\s|,/.test(value[index])) {
		index += 1;
	}

	if (index >= value.length) {
		state.index = index;
		return "";
	}

	let result = "";
	const startChar = value[index];
	if (startChar === "{") {
		index += 1;
		let depth = 1;
		while (index < value.length && depth > 0) {
			const currentChar = value[index];
			if (currentChar === "{") depth += 1;
			else if (currentChar === "}") depth -= 1;

			if (depth > 0) {
				result += currentChar;
			}
			index += 1;
		}
		state.index = index;
		return result.trim();
	}

	if (startChar === '"') {
		index += 1;
		while (index < value.length) {
			const currentChar = value[index];
			if (currentChar === '"' && value[index - 1] !== "\\") {
				index += 1;
				break;
			}
			result += currentChar;
			index += 1;
		}
		state.index = index;
		return result.trim();
	}

	while (index < value.length && value[index] !== "," && value[index] !== "\n") {
		result += value[index];
		index += 1;
	}
	state.index = index;
	return result.trim();
};

const parseBibFields = (body: string): Record<string, string> => {
	const fields: Record<string, string> = {};
	const state: BibParseState = { value: body, index: 0 };

	while (state.index < body.length) {
		while (state.index < body.length && /\s|,/.test(body[state.index])) {
			state.index += 1;
		}
		if (state.index >= body.length) break;

		let key = "";
		while (state.index < body.length && /[A-Za-z0-9_\-]/.test(body[state.index])) {
			key += body[state.index];
			state.index += 1;
		}

		key = key.trim();
		if (!key) {
			state.index += 1;
			continue;
		}

		while (state.index < body.length && /\s/.test(body[state.index])) {
			state.index += 1;
		}

		if (body[state.index] !== "=") {
			state.index += 1;
			continue;
		}
		state.index += 1;

		const value = parseBibValue(state);
		fields[key.toLowerCase()] = value;
	}

	return fields;
};

const parseBibEntry = (entryText: string): BibEntry | null => {
	const headerMatch = entryText.match(/^@(\w+)\s*\{\s*([^,]+),/);
	if (!headerMatch) {
		return null;
	}

	const [, type, key] = headerMatch;
	const bodyStart = headerMatch[0].length;
	const body = entryText.slice(bodyStart, entryText.lastIndexOf("}"));
	const fields = parseBibFields(body);

	return {
		type,
		key: key.trim(),
		fields,
	};
};

const findBibEntries = (content: string): string[] => {
	const entries: string[] = [];
	let index = 0;

	while (index < content.length) {
		const start = content.indexOf("@", index);
		if (start === -1) break;

		let braceIndex = content.indexOf("{", start);
		if (braceIndex === -1) break;

		let depth = 1;
		let currentIndex = braceIndex + 1;

		while (currentIndex < content.length && depth > 0) {
			const char = content[currentIndex];
			if (char === "{") depth += 1;
			if (char === "}") depth -= 1;
			currentIndex += 1;
		}

		if (depth === 0) {
			const entryText = content.slice(start, currentIndex);
			entries.push(entryText);
			index = currentIndex;
		} else {
			break;
		}
	}

	return entries;
};

const lookupInBib = async (
	finderPath: string,
	filePath: string,
): Promise<ZoteroBibMatch | null> => {
	const variants = generatePathVariants(finderPath);

	let content: string;
	try {
		content = await fs.readFile(filePath, "utf8");
	} catch {
		return null;
	}

	const entries = findBibEntries(content);

	for (const entryText of entries) {
		const parsed = parseBibEntry(entryText);
		if (!parsed) continue;

		for (const fieldValue of Object.values(parsed.fields)) {
			if (typeof fieldValue !== "string") continue;
			if (matchStringAgainstVariants(fieldValue, variants)) {
				return {
					success: true,
					source: "bib",
					entry: parsed,
					rawEntry: entryText.trim(),
					matchValue: fieldValue,
				};
			}
		}
	}

	return null;
};

export const lookupZoteroMetadataByPath = async (
	finderPath: string,
	options: ZoteroLookupOptions = {},
): Promise<ZoteroMetadataMatch | { success: false; errors: string[] }> => {
	const errors: string[] = [];
	const jsonPath =
		options.jsonPath ??
		process.env.ZOTERO_BIBLIOGRAPHY_JSON ??
		DEFAULT_ZOTERO_JSON_PATH;

	const bibPath =
		options.bibPath ?? process.env.ZOTERO_BIBLIOGRAPHY_BIB ?? DEFAULT_ZOTERO_BIB_PATH;

	if (await fileExists(jsonPath)) {
		const jsonMatch = await lookupInJson(finderPath, jsonPath);
		if (jsonMatch) {
			return jsonMatch;
		}
		errors.push(`No matching entry found in JSON metadata at ${jsonPath}`);
	} else {
		errors.push(`JSON metadata file not found at ${jsonPath}`);
	}

	if (await fileExists(bibPath)) {
		const bibMatch = await lookupInBib(finderPath, bibPath);
		if (bibMatch) {
			return bibMatch;
		}
		errors.push(`No matching entry found in BibTeX metadata at ${bibPath}`);
	} else {
		errors.push(`BibTeX metadata file not found at ${bibPath}`);
	}

	return { success: false, errors };
};

export const clearZoteroMetadataCache = (): void => {
	CACHE.json.clear();
};
