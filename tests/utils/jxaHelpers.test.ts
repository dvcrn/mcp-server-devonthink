import { describe, it, expect } from "vitest";
import { formatLookupOptions, lookupByPathHelper } from "../../src/utils/jxaHelpers";

describe("formatLookupOptions", () => {
	it("creates a properly formatted options object", () => {
		const result = formatLookupOptions("uuid", 5, "/path", "name", "db");
		expect(result).toBe(
			'{ uuid: "uuid", id: 5, path: "/path", name: "name", databaseName: "db" }',
		);
	});

	it("omits undefined values", () => {
		const result = formatLookupOptions(undefined, 1);
		expect(result).toBe("{ id: 1 }");
	});
});

describe("lookupByPathHelper", () => {
	it("generates valid JavaScript syntax", () => {
		// The helper should be valid JavaScript when wrapped in a function
		expect(() => {
			// eslint-disable-next-line no-new-func
			new Function(lookupByPathHelper);
		}).not.toThrow();
	});

	it("does not use the non-existent getRecordAt method", () => {
		// Regression test: getRecordAt() doesn't exist in DEVONthink JXA API
		// The helper should navigate via database.root().children() instead
		expect(lookupByPathHelper).not.toContain("getRecordAt");
	});

	it("uses database.root() for path navigation", () => {
		// The helper should use the correct API
		expect(lookupByPathHelper).toContain("database.root()");
		expect(lookupByPathHelper).toContain(".children()");
	});

	it("accepts database parameter", () => {
		// The helper should accept a database parameter for database-relative paths
		expect(lookupByPathHelper).toMatch(/function lookupByPath\(theApp,\s*path,\s*database\)/);
	});

	it("uses double quotes for string literals to avoid shell escaping issues", () => {
		// Single quotes in the helper would be doubled by executeJxa's shell escaping,
		// breaking the JavaScript syntax. The helper must use double quotes.
		const singleQuoteRegex = /\.replace\([^)]*'[^']*'[^)]*\)|\.split\('\/'\)/;
		expect(lookupByPathHelper).not.toMatch(singleQuoteRegex);
	});
});
