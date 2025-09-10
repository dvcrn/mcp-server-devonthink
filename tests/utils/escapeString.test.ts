import { describe, it, expect } from "vitest";
import { escapeStringForJXA, formatValueForJXA } from "../../src/utils/escapeString";

describe("escapeStringForJXA", () => {
	it("returns empty string for undefined or null", () => {
		expect(escapeStringForJXA(undefined)).toBe("");
		expect(escapeStringForJXA(null)).toBe("");
	});

	it("escapes quotes, backslashes and control characters", () => {
		const input = '"quote" \\ \n new\tline';
		const expected = '\\"quote\\" \\\\ \\n new\\tline';
		expect(escapeStringForJXA(input)).toBe(expected);
	});
});

describe("formatValueForJXA", () => {
	it("wraps strings in quotes and escapes them", () => {
		expect(formatValueForJXA('He said "hi"')).toBe('"He said \\"hi\\""');
	});

	it("passes numbers and booleans through", () => {
		expect(formatValueForJXA(42)).toBe("42");
		expect(formatValueForJXA(true)).toBe("true");
	});

	it("converts nullish values to null", () => {
		expect(formatValueForJXA(null)).toBe("null");
		expect(formatValueForJXA(undefined)).toBe("null");
	});
});
