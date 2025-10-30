import { z, ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { executeJxa } from "../../applescript/execute.js";
import { escapeStringForJXA } from "../../utils/escapeString.js";

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

/**
 * Standard result type for all DEVONthink tools
 */
export interface DevonThinkResult {
	success: boolean;
	error?: string;
	[key: string]: any;
}

/**
 * Configuration for a DEVONthink tool
 */
export interface DevonThinkToolConfig<TInput, TResult extends DevonThinkResult> {
	name: string;
	description: string;
	inputSchema: ZodSchema<TInput>;
	buildScript: (input: TInput, helpers: ScriptHelpers) => string;
}

/**
 * Helper functions for building JXA scripts
 */
export interface ScriptHelpers {
	escapeString: typeof escapeStringForJXA;
	formatValue: (value: any) => string;
	wrapInTryCatch: (code: string, errorHandler?: string) => string;
	buildDatabaseLookup: (databaseName?: string) => string;
	buildRecordLookup: (uuid?: string, id?: number, path?: string, databaseName?: string) => string;
}

/**
 * Base class for all DEVONthink tools
 */
export abstract class DevonThinkTool<
	TInput = any,
	TResult extends DevonThinkResult = DevonThinkResult,
> {
	protected readonly name: string;
	protected readonly description: string;
	protected readonly inputSchema: ZodSchema<TInput>;
	protected readonly buildScript: (input: TInput, helpers: ScriptHelpers) => string;

	constructor(config: DevonThinkToolConfig<TInput, TResult>) {
		this.name = config.name;
		this.description = config.description;
		this.inputSchema = config.inputSchema;
		this.buildScript = config.buildScript;
	}

	/**
	 * Get the MCP tool definition
	 */
	public getTool(): Tool {
		return {
			name: this.name,
			description: this.description,
			inputSchema: zodToJsonSchema(this.inputSchema) as ToolInput,
			run: this.execute.bind(this),
		};
	}

	/**
	 * Execute the tool
	 */
	protected async execute(input: unknown): Promise<TResult> {
		// Validate input
		const validatedInput = this.inputSchema.parse(input) as TInput;

		// Build the script with helpers
		const script = this.buildScript(validatedInput, this.getHelpers());

		// Wrap in IIFE if not already wrapped
		const wrappedScript = script.trim().startsWith("(") ? script : `(() => { ${script} })();`;

		// Execute and return result
		return await executeJxa<TResult>(wrappedScript);
	}

	/**
	 * Get helper functions for script building
	 */
	protected getHelpers(): ScriptHelpers {
		return {
			escapeString: escapeStringForJXA,
			formatValue: this.formatValue.bind(this),
			wrapInTryCatch: this.wrapInTryCatch.bind(this),
			buildDatabaseLookup: this.buildDatabaseLookup.bind(this),
			buildRecordLookup: this.buildRecordLookup.bind(this),
		};
	}

	/**
	 * Format a value for use in JXA script
	 */
	protected formatValue(value: any): string {
		if (value === null || value === undefined) {
			return "null";
		}
		if (typeof value === "string") {
			return `"${escapeStringForJXA(value)}"`;
		}
		if (typeof value === "number" || typeof value === "boolean") {
			return String(value);
		}
		if (Array.isArray(value)) {
			return `[${value.map((v) => this.formatValue(v)).join(", ")}]`;
		}
		// For objects, build using bracket notation to avoid JXA issues
		if (typeof value === "object") {
			const lines = ["const obj = {};"];
			for (const [key, val] of Object.entries(value)) {
				lines.push(`obj["${escapeStringForJXA(key)}"] = ${this.formatValue(val)};`);
			}
			return `(function() { ${lines.join(" ")} return obj; })()`;
		}
		return JSON.stringify(value);
	}

	/**
	 * Wrap code in try-catch block
	 */
	protected wrapInTryCatch(code: string, errorHandler?: string): string {
		const defaultErrorHandler = `
      const errorResponse = {};
      errorResponse["success"] = false;
      errorResponse["error"] = error.toString();
      return JSON.stringify(errorResponse);
    `;

		return `
      try {
        ${code}
      } catch (error) {
        ${errorHandler || defaultErrorHandler}
      }
    `;
	}

	/**
	 * Build database lookup code
	 */
	protected buildDatabaseLookup(databaseName?: string): string {
		if (!databaseName) {
			return "const targetDatabase = theApp.currentDatabase();";
		}

		return `
      const databases = theApp.databases();
      const targetDatabase = databases.find(db => db.name() === "${escapeStringForJXA(databaseName)}");
      if (!targetDatabase) {
        throw new Error("Database not found: ${escapeStringForJXA(databaseName)}");
      }
    `;
	}

	/**
	 * Build record lookup code
	 */
	protected buildRecordLookup(
		uuid?: string,
		id?: number,
		path?: string,
		databaseName?: string,
	): string {
		const lines: string[] = [];

		if (uuid) {
			lines.push(`const record = theApp.getRecordWithUuid("${escapeStringForJXA(uuid)}");`);
			lines.push(
				`if (!record) throw new Error("Record not found with UUID: ${escapeStringForJXA(uuid)}");`,
			);
		} else if (id !== undefined && id !== null) {
			// Need database for ID lookup
			if (databaseName) {
				lines.push(this.buildDatabaseLookup(databaseName));
			} else {
				lines.push("const targetDatabase = theApp.currentDatabase();");
			}
			lines.push(`const record = targetDatabase.getRecordWithId(${id});`);
			lines.push(`if (!record) throw new Error("Record not found with ID: ${id}");`);
		} else if (path) {
			// Need database for path lookup
			if (databaseName) {
				lines.push(this.buildDatabaseLookup(databaseName));
			} else {
				lines.push("const targetDatabase = theApp.currentDatabase();");
			}
			lines.push(`const record = targetDatabase.getRecordAt("${escapeStringForJXA(path)}");`);
			lines.push(
				`if (!record) throw new Error("Record not found at path: ${escapeStringForJXA(path)}");`,
			);
		} else {
			lines.push('throw new Error("No record identifier provided");');
		}

		return lines.join("\n");
	}
}

/**
 * Factory function to create a tool from configuration
 */
export function createDevonThinkTool<TInput, TResult extends DevonThinkResult>(
	config: DevonThinkToolConfig<TInput, TResult>,
): Tool {
	class ConcreteDevonThinkTool extends DevonThinkTool<TInput, TResult> {
		constructor() {
			super(config);
		}
	}

	const toolInstance = new ConcreteDevonThinkTool();
	return toolInstance.getTool();
}
