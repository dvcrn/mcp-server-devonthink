import { exec } from "child_process";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

/**
 * ROBUST JXA EXECUTION - Eliminates all quote escaping issues
 * 
 * This implementation uses temporary files instead of command line quote escaping.
 * This completely eliminates the fragile quote doubling mechanism that causes
 * "Unexpected EOF" errors with complex scripts containing regex patterns and
 * multiple quote types.
 * 
 * Benefits:
 * 1. NO quote escaping issues - script is written to file as-is
 * 2. Handles any complexity of quotes, regex patterns, JSON strings
 * 3. More secure - avoids shell injection risks
 * 4. Better debugging - temporary files can be inspected if needed
 * 5. Supports larger scripts without command line length limits
 */
export const executeJxa = <T>(script: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    // Generate unique temporary file name
    const tempFileName = `jxa_script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.js`;
    const tempFilePath = join(tmpdir(), tempFileName);
    
    // Write script to temporary file and execute
    writeFile(tempFilePath, script, 'utf8')
      .then(() => {
        // Execute using file path instead of inline script
        const command = `osascript -l JavaScript "${tempFilePath}"`;
        
        exec(command, (error, stdout, stderr) => {
          // Clean up temporary file
          unlink(tempFilePath).catch(() => {
            // Ignore cleanup errors - file might not exist or be locked
          });
          
          // Handle execution errors
          if (error) {
            return reject(
              new McpError(
                ErrorCode.InternalError,
                `JXA execution failed: ${error.message}`
              )
            );
          }
          
          if (stderr) {
            return reject(
              new McpError(ErrorCode.InternalError, `JXA error: ${stderr}`)
            );
          }
          
          // Parse and return result
          try {
            const result = JSON.parse(stdout.trim());
            resolve(result as T);
          } catch (parseError) {
            reject(
              new McpError(
                ErrorCode.InternalError,
                `Failed to parse JXA output: ${parseError}. Raw output: ${stdout}`
              )
            );
          }
        });
      })
      .catch((fileError) => {
        reject(
          new McpError(
            ErrorCode.InternalError,
            `Failed to create temporary JXA script file: ${fileError}`
          )
        );
      });
  });
};
