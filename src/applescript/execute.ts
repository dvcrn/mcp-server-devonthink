import { exec } from "child_process";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
export const executeJxa = <T>(script: string): Promise<T> => {
	return new Promise((resolve, reject) => {
		const command = `osascript -l JavaScript -e '${script.replace(/'/g, "''")}'`;
		exec(command, (error, stdout, stderr) => {
			if (error) {
				return reject(
					new McpError(ErrorCode.InternalError, `JXA execution failed: ${error.message}`),
				);
			}
			if (stderr) {
				return reject(new McpError(ErrorCode.InternalError, `JXA error: ${stderr}`));
			}
			try {
				const result = JSON.parse(stdout.trim());
				resolve(result as T);
			} catch (parseError) {
				reject(
					new McpError(
						ErrorCode.InternalError,
						`Failed to parse JXA output: ${parseError}`,
					),
				);
			}
		});
	});
};
