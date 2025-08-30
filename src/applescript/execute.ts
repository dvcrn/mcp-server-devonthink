import { exec } from "child_process";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Configuration for JXA execution
 */
export interface ExecuteJxaOptions {
  /** Maximum execution time in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retry attempts for transient failures (default: 2) */
  retries?: number;
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Enable debug mode to preserve temp files (default: false) */
  debug?: boolean;
}

/**
 * Error types for better error handling
 */
export enum JxaErrorType {
  /** Script syntax or runtime error */
  ScriptError = "SCRIPT_ERROR",
  /** DEVONthink is not running */
  AppNotRunning = "APP_NOT_RUNNING",
  /** Operation timed out */
  Timeout = "TIMEOUT",
  /** Failed to parse output */
  ParseError = "PARSE_ERROR",
  /** File system error */
  FileSystemError = "FILE_SYSTEM_ERROR",
  /** Unknown error */
  Unknown = "UNKNOWN"
}

/**
 * Enhanced error class with additional context
 */
export class JxaExecutionError extends McpError {
  constructor(
    public readonly errorType: JxaErrorType,
    message: string,
    public readonly details?: {
      script?: string;
      stdout?: string;
      stderr?: string;
      originalError?: Error;
    }
  ) {
    super(ErrorCode.InternalError, message);
  }
}

/**
 * Classify error based on error message
 */
function classifyError(error: Error | string, stderr?: string): JxaErrorType {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const combinedError = `${errorMessage} ${stderr || ''}`.toLowerCase();

  if (combinedError.includes('not running') || combinedError.includes('not found')) {
    return JxaErrorType.AppNotRunning;
  }
  if (combinedError.includes('timeout') || combinedError.includes('timed out')) {
    return JxaErrorType.Timeout;
  }
  if (combinedError.includes('syntaxerror') || combinedError.includes('referenceerror')) {
    return JxaErrorType.ScriptError;
  }
  if (combinedError.includes('parse') || combinedError.includes('json')) {
    return JxaErrorType.ParseError;
  }
  if (combinedError.includes('enoent') || combinedError.includes('permission')) {
    return JxaErrorType.FileSystemError;
  }
  
  return JxaErrorType.Unknown;
}

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute JXA script with enhanced error handling and retry logic
 * 
 * This implementation uses temporary files instead of command line quote escaping,
 * which completely eliminates quote escaping issues and supports scripts of any complexity.
 * 
 * Features:
 * - No quote escaping issues - script is written to file as-is
 * - Automatic retry for transient failures
 * - Configurable timeout
 * - Better error classification
 * - Debug mode to preserve temp files
 */
export const executeJxa = async <T>(
  script: string, 
  options: ExecuteJxaOptions = {}
): Promise<T> => {
  const {
    timeout = 30000,
    retries = 2,
    retryDelay = 1000,
    debug = false
  } = options;

  let lastError: JxaExecutionError | undefined;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      // Wait before retry
      await sleep(retryDelay);
    }

    try {
      return await executeJxaOnce<T>(script, { timeout, debug });
    } catch (error) {
      if (error instanceof JxaExecutionError) {
        lastError = error;
        
        // Don't retry certain error types
        if ([
          JxaErrorType.ScriptError,
          JxaErrorType.ParseError,
          JxaErrorType.AppNotRunning
        ].includes(error.errorType)) {
          throw error;
        }
        
        // Log retry attempt
        if (attempt < retries) {
          console.error(`JXA execution failed (attempt ${attempt + 1}/${retries + 1}), retrying...`);
        }
      } else {
        throw error;
      }
    }
  }
  
  // All retries exhausted
  throw lastError || new JxaExecutionError(
    JxaErrorType.Unknown,
    'JXA execution failed after all retries'
  );
};

/**
 * Single execution attempt
 */
async function executeJxaOnce<T>(
  script: string,
  options: { timeout: number; debug: boolean }
): Promise<T> {
  // Generate unique temporary file name
  const tempFileName = `jxa_script_${Date.now()}_${Math.random().toString(36).substring(2, 11)}.js`;
  const tempFilePath = join(tmpdir(), tempFileName);
  
  // Write script to temporary file - only this should throw FileSystemError
  try {
    await writeFile(tempFilePath, script, 'utf8');
  } catch (fileError) {
    const message = fileError instanceof Error ? fileError.message : String(fileError);
    throw new JxaExecutionError(
      JxaErrorType.FileSystemError,
      `Failed to create temporary JXA script file: ${message}`,
      { script, originalError: fileError instanceof Error ? fileError : undefined }
    );
  }
  
  // Execute using file path with timeout - errors here should be properly classified
  const command = `osascript -l JavaScript "${tempFilePath}"`;
  
  return new Promise<T>((resolve, reject) => {
    const proc = exec(command, (error, stdout, stderr) => {
      // Clean up temporary file (unless in debug mode)
      if (!options.debug) {
        unlink(tempFilePath).catch(() => {
          // Ignore cleanup errors
        });
      } else {
        console.log(`Debug mode: Script preserved at ${tempFilePath}`);
      }
      
      // Handle execution errors
      if (error) {
        const errorType = classifyError(error, stderr);
        return reject(new JxaExecutionError(
          errorType,
          `JXA execution failed: ${error.message}`,
          { script, stdout, stderr, originalError: error }
        ));
      }
      
      if (stderr && !stdout) {
        const errorType = classifyError(stderr);
        return reject(new JxaExecutionError(
          errorType,
          `JXA error: ${stderr}`,
          { script, stdout, stderr }
        ));
      }
      
      // Parse and return result
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result as T);
      } catch (parseError) {
        reject(new JxaExecutionError(
          JxaErrorType.ParseError,
          `Failed to parse JXA output: ${parseError}`,
          { script, stdout, stderr }
        ));
      }
    });
    
    // Set up timeout
    const timeoutHandle = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new JxaExecutionError(
        JxaErrorType.Timeout,
        `JXA execution timed out after ${options.timeout}ms`,
        { script }
      ));
    }, options.timeout);
    
    // Clear timeout if process completes
    proc.on('exit', () => clearTimeout(timeoutHandle));
  });
}

/**
 * Legacy function signature for backward compatibility
 */
export const executeJxaLegacy = <T>(script: string): Promise<T> => {
  return executeJxa<T>(script, {});
};