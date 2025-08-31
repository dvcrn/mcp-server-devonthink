import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const GetToolDocumentationSchema = z.object({
  toolName: z.enum([
    "classify_document",
    "check_ai_health", 
    "ask_ai_about_documents",
    "create_summary_document",
    "find_similar"
  ]).optional().describe("Specific AI tool to get documentation for (returns all if not specified)")
}).strict();

type GetToolDocumentationInput = z.infer<typeof GetToolDocumentationSchema>;

interface ToolDocumentation {
  name: string;
  summary: string;
  description: string;
  examples?: string[];
  parameters: Record<string, {
    type: string;
    description: string;
    required: boolean;
    default?: any;
  }>;
  useCases?: string[];
  notes?: string[];
}

interface GetToolDocumentationResult {
  success: boolean;
  documentation: ToolDocumentation | ToolDocumentation[];
  error?: string;
}

const toolDocs: Record<string, ToolDocumentation> = {
  classify_document: {
    name: "classify_document",
    summary: "Get AI-powered classification suggestions for a DEVONthink document",
    description: `DEVONthink's AI analyzes the document's content and suggests appropriate groups or tags based on similar content in your database.

The AI uses semantic understanding to find the best organizational matches, providing probability scores for each suggestion. This helps maintain consistent filing systems and discover related content.`,
    examples: [
      "Where should I file this research paper?",
      "What tags would be appropriate for this meeting note?",
      "Suggest groups for organizing this financial document",
      "Find similar content to help categorize this email"
    ],
    parameters: {
      documentUuid: {
        type: "string",
        description: "UUID of the document to classify",
        required: true
      },
      databaseName: {
        type: "string", 
        description: "Name of database to search for classifications in (defaults to current database)",
        required: false
      },
      comparisonType: {
        type: "enum",
        description: "Type of comparison algorithm: 'data comparison' (analyzes content/structure) or 'tags comparison' (focuses on tag patterns)",
        required: false,
        default: "data comparison"
      },
      proposeTags: {
        type: "boolean",
        description: "Propose tags instead of groups (default: false for groups)",
        required: false,
        default: false
      },
      maxSuggestions: {
        type: "number",
        description: "Maximum number of classification suggestions to return (1-20)",
        required: false,
        default: 10
      }
    },
    useCases: [
      "Organizing incoming documents into appropriate folders",
      "Discovering existing content similar to new documents",
      "Maintaining consistent tagging across your database",
      "Finding the best location for email attachments"
    ],
    notes: [
      "Works better with databases containing diverse, well-organized content",
      "Requires DEVONthink Pro with sufficient content for comparison",
      "Suggestions include probability scores for confidence"
    ]
  },

  check_ai_health: {
    name: "check_ai_health",
    summary: "Check if DEVONthink's AI services are available and working properly",
    description: `Tests each configured AI engine to determine what's actually working versus just configured. This helps diagnose AI setup issues and verify which engines are ready for use.

The tool attempts a minimal test with each configured engine and reports back on functionality, helping identify missing API keys or configuration problems.`,
    parameters: {},
    useCases: [
      "Verifying AI setup before running AI-dependent operations",
      "Diagnosing why AI features aren't working",
      "Checking which AI engines have valid API keys",
      "Troubleshooting AI configuration issues"
    ],
    notes: [
      "Tests actual API connectivity, not just configuration presence",
      "Returns specific error messages for failed engines",
      "Provides setup instructions when engines aren't configured"
    ]
  },

  ask_ai_about_documents: {
    name: "ask_ai_about_documents",
    summary: "Ask AI questions about specific DEVONthink documents",
    description: `Enables flexible AI-powered analysis, comparison, extraction, or understanding of your documents. You can ask any question about the content, and the AI will analyze the documents to provide insights.

This is for ad-hoc analysis where you want a text response, not a new document. The AI examines the actual content of your documents to answer questions.`,
    examples: [
      "What are the main themes across these papers?",
      "Extract all action items from these meeting notes",
      "Compare the methodologies in these research documents",
      "What dates and deadlines are mentioned?",
      "Summarize the key findings",
      "What are the budget implications discussed in these reports?",
      "List all people mentioned in these documents"
    ],
    parameters: {
      documentUuids: {
        type: "array",
        description: "UUIDs of documents to analyze",
        required: true
      },
      question: {
        type: "string",
        description: "The question to ask about the records (max 10,000 characters)",
        required: true
      },
      temperature: {
        type: "number",
        description: "Response creativity (0-2, where 0 is focused/deterministic, 2 is creative)",
        required: false,
        default: 0.7
      },
      model: {
        type: "string",
        description: "Specific AI model to use (e.g., 'gpt-4', 'claude-3')",
        required: false
      },
      engine: {
        type: "enum",
        description: "AI engine to use: ChatGPT, Claude, Mistral AI, GPT4All, LM Studio, Ollama, or Gemini",
        required: false,
        default: "ChatGPT"
      }
    },
    useCases: [
      "Extracting specific information from multiple documents",
      "Comparing and contrasting document contents",
      "Finding patterns or themes across documents",
      "Creating informal summaries for quick review",
      "Answering specific questions about document content"
    ],
    notes: [
      "Returns text response only - no documents are created",
      "For creating formal summary documents, use create_summary_document instead",
      "Can analyze multiple documents simultaneously",
      "Requires configured AI engine with valid API key"
    ]
  },

  create_summary_document: {
    name: "create_summary_document",
    summary: "Create an AI-generated summary document from multiple DEVONthink documents",
    description: `Creates a formal summary document that becomes part of your DEVONthink database. The AI generates a structured summary and saves it as a new document in your specified format and location.

This tool is for creating persistent summary documents that you want to keep, reference, and potentially share. The summary becomes a real document in your database.`,
    parameters: {
      documentUuids: {
        type: "array",
        description: "UUIDs of documents to summarize",
        required: true
      },
      summaryType: {
        type: "enum",
        description: "Output format: 'markdown', 'rich' (RTF), 'sheet', or 'simple' (plain text)",
        required: false,
        default: "markdown"
      },
      summaryStyle: {
        type: "enum",
        description: "Summary style (Note: Currently non-functional in DEVONthink API but kept for future compatibility)",
        required: false
      },
      parentGroupUuid: {
        type: "string",
        description: "UUID of group where summary should be created (defaults to inbox)",
        required: false
      },
      customTitle: {
        type: "string",
        description: "Custom title for the summary document",
        required: false
      }
    },
    useCases: [
      "Creating executive summaries of multiple reports",
      "Generating meeting minutes from various notes",
      "Building documentation from scattered sources",
      "Archiving key points for future reference",
      "Creating digest documents from research materials"
    ],
    notes: [
      "Creates an actual document in your DEVONthink database",
      "For quick analysis without creating documents, use ask_ai_about_documents",
      "Summary is saved in your chosen format (markdown, RTF, etc.)",
      "Can specify custom location and title for the summary"
    ]
  },

  find_similar: {
    name: "find_similar",
    summary: "Find documents similar to a given record using AI similarity analysis",
    description: `Uses DEVONthink's AI-powered semantic analysis to identify related content even when exact words don't match. The AI understands context and meaning to find truly related documents.

This goes beyond simple keyword matching to find conceptually related content, making it excellent for research, discovery, and understanding connections in your database.`,
    parameters: {
      recordUuid: {
        type: "string",
        description: "UUID of the record to find similar documents for",
        required: true
      },
      databaseName: {
        type: "string",
        description: "Database to search in (defaults to current database)",
        required: false
      },
      maxResults: {
        type: "number",
        description: "Maximum number of similar documents to return",
        required: false,
        default: 10
      },
      minScore: {
        type: "number",
        description: "Minimum similarity score (0-1) to include in results",
        required: false,
        default: 0.5
      }
    },
    useCases: [
      "Finding related research papers on a topic",
      "Discovering similar emails or correspondence",
      "Locating documents with similar themes or concepts",
      "Building a reading list of related materials",
      "Finding duplicate or near-duplicate content"
    ],
    notes: [
      "Uses semantic understanding, not just keyword matching",
      "Returns similarity scores for each result",
      "Can search across entire database or specific database",
      "Works best with text-heavy documents"
    ]
  }
};

const getToolDocumentation = async (input: GetToolDocumentationInput): Promise<GetToolDocumentationResult> => {
  try {
    if (input.toolName) {
      const doc = toolDocs[input.toolName];
      if (!doc) {
        return {
          success: false,
          documentation: [] as any,
          error: `Documentation not found for tool: ${input.toolName}`
        };
      }
      return {
        success: true,
        documentation: doc
      };
    } else {
      // Return all tool documentation
      return {
        success: true,
        documentation: Object.values(toolDocs)
      };
    }
  } catch (error) {
    return {
      success: false,
      documentation: [] as any,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

export const getToolDocumentationTool: Tool = {
  name: "get_ai_tool_documentation",
  description: "Get detailed documentation for DEVONthink AI tools including examples and use cases.",
  inputSchema: zodToJsonSchema(GetToolDocumentationSchema) as ToolInput,
  run: getToolDocumentation,
};