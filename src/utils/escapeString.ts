/**
 * Escapes a string for safe interpolation into JXA (JavaScript for Automation) scripts.
 * This handles all special characters that could break the script or cause security issues.
 */
export function escapeStringForJXA(input: string | undefined | null): string {
  if (input === undefined || input === null) {
    return "";
  }

  // First, handle backslashes (must be done first to avoid double-escaping)
  let escaped = input.replace(/\\/g, "\\\\");

  // Then handle quotes
  escaped = escaped.replace(/"/g, '\\"');
  escaped = escaped.replace(/'/g, "\\'");

  // Handle newlines, tabs, and other control characters
  escaped = escaped
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/\v/g, "\\v");

  // Handle Unicode characters that might cause issues
  // Replace zero-width characters and other problematic Unicode
  escaped = escaped.replace(/\u0000/g, "");

  return escaped;
}

/**
 * Escapes a string for use in DEVONthink search queries.
 * Search queries have additional requirements beyond basic string escaping.
 */
export function escapeSearchQuery(query: string): string {
  // First apply basic escaping
  let escaped = escapeStringForJXA(query);

  // DEVONthink search has issues with certain operators
  // Escape parentheses and other special search characters
  escaped = escaped
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\*/g, "\\*")
    .replace(/\?/g, "\\?");

  return escaped;
}

/**
 * Safely formats a value for JXA script interpolation.
 * Handles different types appropriately.
 */
export function formatValueForJXA(
  value: string | number | boolean | undefined | null
): string {
  if (value === undefined || value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return `"${escapeStringForJXA(value)}"`;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  // For other types, convert to string and escape
  return `"${escapeStringForJXA(String(value))}"`;
}

/**
 * Creates a safe JXA string literal from a value.
 * This is useful when you need to pass user input as a string in JXA.
 */
export function createJXAStringLiteral(value: string): string {
  return `"${escapeStringForJXA(value)}"`;
}

/**
 * Validates if a string contains characters that might cause issues in JXA
 * even after escaping. Returns true if the string is safe to use.
 */
export function isJXASafeString(input: string): boolean {
  // Check for null bytes and other control characters that can't be properly escaped
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(input)) {
    return false;
  }

  return true;
}