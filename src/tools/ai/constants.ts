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

