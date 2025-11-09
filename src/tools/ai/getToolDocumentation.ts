import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const GetToolDocumentationSchema = z
	.object({
		toolName: z
			.enum([
				"get_ai_tool_documentation",
				"check_ai_health",
				"ask_ai_about_documents",
				"create_summary_document",
			])
			.optional()
			.describe("Specific AI tool to get documentation for (returns all if not specified)"),
	})
	.strict();

type GetToolDocumentationInput = z.infer<typeof GetToolDocumentationSchema>;

interface ToolDocumentation {
	name: string;
	summary: string;
	description: string;
	examples: string[];
	parameters: Record<
		string,
		{
			type: string;
			description: string;
			required: boolean;
			default?: any;
		}
	>;
	useCases?: string[];
	notes?: string[];
}

interface GetToolDocumentationResult {
	success: boolean;
	documentation?: ToolDocumentation[];
	error?: string;
}

const toolDocs: Record<string, ToolDocumentation> = {
	get_ai_tool_documentation: {
		name: "get_ai_tool_documentation",
		summary:
			"Get detailed documentation for DEVONthink AI tools including examples and use cases",
		description: `Provides comprehensive documentation for all AI-powered tools available in the DEVONthink MCP server. Returns detailed information about parameters, examples, use cases, and implementation notes for each tool.`,
		examples: [
			"What AI tools are available?",
			"How do I use the ask_ai_about_documents tool?",
			"List all AI tool documentation",
		],
		parameters: {
			toolName: {
				type: "enum",
				description:
					"Specific AI tool to get documentation for (returns all if not specified)",
				required: false,
			},
		},
		useCases: [
			"Learning how to use specific AI tools",
			"Understanding tool parameters and options",
			"Discovering available AI capabilities",
			"Getting implementation examples",
		],
		notes: [
			"Returns all tool documentation if no specific tool is requested",
			"Documentation includes parameter details, examples, and use cases",
		],
	},

	check_ai_health: {
		name: "check_ai_health",
		summary: "Check the AI configuration and health status in DEVONthink",
		description: `Verifies that DEVONthink's AI features are properly configured and working. Tests available AI engines, validates API keys, and reports which AI capabilities are functional.

This tool helps diagnose AI setup issues and confirms which models are available for use.`,
		examples: [
			"Is AI configured in DEVONthink?",
			"Check if my OpenAI API key is working",
			"What AI engines are available?",
			"Test the AI setup",
		],
		parameters: {},
		useCases: [
			"Initial AI setup verification",
			"Troubleshooting AI feature issues",
			"Checking available AI models",
			"Validating API key configuration",
		],
		notes: [
			"Tests all configured AI engines automatically",
			"Reports which engines have valid API keys",
			"Shows available models for each engine",
			"Helps identify configuration problems",
		],
	},

	ask_ai_about_documents: {
		name: "ask_ai_about_documents",
		summary: "Ask AI questions about one or more DEVONthink documents",
		description: `Sends document content to AI for analysis, questions, or insights. Can process single or multiple documents, maintaining context across them for comprehensive answers.

The AI can summarize, analyze, answer questions, extract information, or provide insights based on document content.`,
		examples: [
			"What are the key points in this meeting transcript?",
			"Compare these three research papers",
			"Extract action items from this project document",
			"What insights can you provide about these financial reports?",
		],
		parameters: {
			prompt: {
				type: "string",
				description: "The question or request for the AI about the document(s)",
				required: true,
			},
			documentUuids: {
				type: "array",
				description: "Array of document UUIDs to analyze",
				required: true,
			},
			engine: {
				type: "enum",
				description: "AI engine to use (OpenAI, Claude, local models, etc.)",
				required: false,
				default: "Uses configured default",
			},
			temperature: {
				type: "number",
				description: "AI response creativity (0=focused, 1=creative)",
				required: false,
				default: 0.7,
			},
		},
		useCases: [
			"Document summarization and key point extraction",
			"Multi-document comparison and analysis",
			"Question answering based on document content",
			"Information extraction and data mining",
			"Content insights and pattern recognition",
		],
		notes: [
			"Can process multiple documents in a single request",
			"Maintains context across all provided documents",
			"Temperature affects response creativity vs accuracy",
			"Requires configured AI engine with valid API key",
		],
	},

	create_summary_document: {
		name: "create_summary_document",
		summary: "Create an AI-generated summary document from one or more sources",
		description: `Generates a new document containing an AI-created summary of selected documents. The summary can be customized in style, length, and format, then saved as a new record in DEVONthink.

Perfect for creating executive summaries, research digests, or condensed versions of lengthy documents.`,
		examples: [
			"Create an executive summary of this report",
			"Generate a one-page digest of these research papers",
			"Summarize this week's meeting notes",
			"Create a brief overview of this project documentation",
		],
		parameters: {
			documentUuids: {
				type: "array",
				description: "UUIDs of documents to summarize",
				required: true,
			},
			summaryType: {
				type: "enum",
				description:
					"Type of summary: 'brief', 'detailed', 'executive', 'bullets', 'academic'",
				required: false,
				default: "detailed",
			},
			maxLength: {
				type: "number",
				description: "Maximum length in words for the summary",
				required: false,
				default: 500,
			},
			parentGroupUuid: {
				type: "string",
				description: "UUID of group to save the summary in",
				required: false,
				default: "Saves to inbox",
			},
			summaryName: {
				type: "string",
				description: "Name for the generated summary document",
				required: false,
				default: "AI Summary - [timestamp]",
			},
		},
		useCases: [
			"Creating executive summaries for reports",
			"Generating research digests from multiple papers",
			"Condensing meeting notes into action items",
			"Building knowledge bases from document collections",
			"Creating briefing documents from various sources",
		],
		notes: [
			"Creates a new document in DEVONthink with the summary",
			"Can summarize multiple documents into one cohesive summary",
			"Different summary types provide different formats and focus",
			"Summary length can be controlled for specific needs",
		],
	},
};

const getToolDocumentation = async (
	input: GetToolDocumentationInput,
): Promise<GetToolDocumentationResult> => {
	try {
		if (input.toolName) {
			const doc = toolDocs[input.toolName];
			if (!doc) {
				return {
					success: false,
					error: `Documentation not found for tool: ${input.toolName}`,
				};
			}
			return {
				success: true,
				documentation: [doc],
			};
		} else {
			// Return all tool documentation
			return {
				success: true,
				documentation: Object.values(toolDocs),
			};
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

export const getToolDocumentationTool: Tool = {
	name: "get_ai_tool_documentation",
	description:
		"Get detailed documentation for DEVONthink AI tools including examples and use cases.",
	inputSchema: zodToJsonSchema(GetToolDocumentationSchema) as ToolInput,
	run: getToolDocumentation,
};
