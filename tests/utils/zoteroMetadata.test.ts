import { describe, it, expect, beforeEach } from "vitest";
import path from "path";
import { fileURLToPath } from "url";
import {
	lookupZoteroMetadataByPath,
	clearZoteroMetadataCache,
	ZoteroMetadataMatch,
} from "../../src/utils/zoteroMetadata.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(currentDir, "../fixtures/zotero");
const jsonFixturePath = path.join(fixturesDir, "bibliography.json");
const bibFixturePath = path.join(fixturesDir, "bibliography.bib");

describe("lookupZoteroMetadataByPath", () => {
	beforeEach(() => {
		clearZoteroMetadataCache();
	});

	it("finds metadata from the JSON export when the attachment path matches directly", async () => {
		const finderPath =
			"/Users/alex/Documents/Zotero/storage/ABC12345/Smith2024.pdf";

		const result = await lookupZoteroMetadataByPath(finderPath, {
			jsonPath: jsonFixturePath,
			bibPath: bibFixturePath,
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.source).toBe("json");
		const match = result as Extract<ZoteroMetadataMatch, { source: "json" }>;
		expect(match.item.id).toBe("smith2024deep");
		expect(match.propertyPath).toEqual(["attachments", "[0]", "localPath"]);
		expect(match.matchValue).toContain("Smith2024.pdf");
	});

	it("finds metadata from the JSON export when the attachment stores a file URL", async () => {
		const finderPath =
			"/Users/alex/Documents/Zotero/storage/ABC12345/Smith2024-supplement.pdf";

		const result = await lookupZoteroMetadataByPath(finderPath, {
			jsonPath: jsonFixturePath,
			bibPath: bibFixturePath,
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.source).toBe("json");
		const match = result as Extract<ZoteroMetadataMatch, { source: "json" }>;
		expect(match.item.id).toBe("smith2024deep");
		expect(match.propertyPath).toEqual(["attachments", "[1]", "localPath"]);
	});

	it("falls back to the BibTeX export when JSON is missing the attachment", async () => {
		const finderPath =
			"/Users/alex/Documents/Zotero/storage/GAR5566/Garcia2021.pdf";

		const result = await lookupZoteroMetadataByPath(finderPath, {
			jsonPath: jsonFixturePath,
			bibPath: bibFixturePath,
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.source).toBe("bib");
		const match = result as Extract<ZoteroMetadataMatch, { source: "bib" }>;
		expect(match.entry.key).toBe("garcia2021context");
		expect(match.entry.fields.file).toContain("Garcia2021.pdf");
		expect(match.rawEntry).toContain("@inproceedings");
	});

	it("returns detailed errors when the attachment cannot be found", async () => {
		const finderPath = "/Users/alex/Documents/Zotero/storage/UNKNOWN/item.pdf";

		const result = await lookupZoteroMetadataByPath(finderPath, {
			jsonPath: jsonFixturePath,
			bibPath: bibFixturePath,
		});

		expect(result.success).toBe(false);
		if (result.success) return;

		expect(result.errors).toHaveLength(2);
		expect(result.errors[0]).toContain("No matching entry");
		expect(result.errors[1]).toContain("No matching entry");
	});
});
