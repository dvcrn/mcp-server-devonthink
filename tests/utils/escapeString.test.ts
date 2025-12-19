import { describe, it, expect } from "vitest";
import {
	escapeStringForJXA,
	formatValueForJXA,
	isJXASafeString,
} from "../../src/utils/escapeString";

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

describe("isJXASafeString", () => {
	it("allows strings with single quotes (apostrophes)", () => {
		expect(isJXASafeString("it's a file")).toBe(true);
		expect(isJXASafeString("John's document")).toBe(true);
		expect(isJXASafeString("don't do this")).toBe(true);
	});

	it("allows strings with single double quotes", () => {
		expect(isJXASafeString('He said "hello"')).toBe(true);
		expect(isJXASafeString('The "quoted" text')).toBe(true);
	});

	it("blocks multiple consecutive quotes", () => {
		expect(isJXASafeString('test""value')).toBe(false);
		expect(isJXASafeString("test''value")).toBe(false);
		expect(isJXASafeString('test"""value')).toBe(false);
	});

	it("blocks dangerous JXA injection patterns", () => {
		expect(isJXASafeString('"Application("Finder")')).toBe(false);
		expect(isJXASafeString("'doScript")).toBe(false);
		expect(isJXASafeString('"theApp.quit()')).toBe(false);
	});

	it("blocks control characters", () => {
		expect(isJXASafeString("test\x00value")).toBe(false);
		expect(isJXASafeString("test\x1Fvalue")).toBe(false);
	});

	it("allows normal strings", () => {
		expect(isJXASafeString("normal string")).toBe(true);
		expect(isJXASafeString("file-name_2024.pdf")).toBe(true);
		expect(isJXASafeString("Project: Phase 1")).toBe(true);
	});
});
