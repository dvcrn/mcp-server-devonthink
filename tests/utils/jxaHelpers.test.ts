import { describe, it, expect } from "vitest";
import { formatLookupOptions } from "../../src/utils/jxaHelpers";

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
