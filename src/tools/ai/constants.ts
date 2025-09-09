/**
 * Shared constants for AI tools
 */

/**
 * List of supported AI engines in DEVONthink
 */
export const AI_ENGINES = [
  "ChatGPT",
  "Claude",
  "Mistral AI",
  "GPT4All",
  "LM Studio",
  "Ollama",
  "Gemini"
] as const;

/**
 * Type for AI engine names
 */
export type AIEngine = typeof AI_ENGINES[number];

/**
 * Test engines for health check (alias for AI_ENGINES for compatibility)
 */
export const TEST_AI_ENGINES = AI_ENGINES;

