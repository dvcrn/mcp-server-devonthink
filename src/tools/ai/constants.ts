/**
 * Shared constants for AI tools
 */

/**
 * List of supported AI engines in DEVONthink
 */
export const AI_ENGINES = [
	"ChatGPT",
	"Claude",
	"Gemini",
	"Mistral AI",
	"GPT4All",
	"LM Studio",
	"Ollama",
] as const;

/**
 * Type for AI engine names
 */
export type AIEngine = (typeof AI_ENGINES)[number];
