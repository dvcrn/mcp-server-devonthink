/**
 * JXA Script Validation - Pre-execution validation and testing utilities
 * 
 * This module provides comprehensive validation for JXA scripts before execution,
 * helping catch errors early and provide meaningful feedback.
 */

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  type: 'syntax' | 'escaping' | 'compatibility' | 'security';
  message: string;
  line?: number;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  type: 'performance' | 'style' | 'compatibility';
  message: string;
  line?: number;
}

/**
 * Comprehensive JXA script validator
 */
export class JXAValidator {
  private static readonly DANGEROUS_PATTERNS = [
    /eval\s*\(/,
    /Function\s*\(/,
    /setTimeout\s*\(/,
    /setInterval\s*\(/,
    /\.innerHTML\s*=/,
    /document\.write/
  ];

  private static readonly JXA_INCOMPATIBLE_PATTERNS = [
    // ES6+ features that don't work in JXA
    { pattern: /=>\s*{/, message: 'Arrow functions are not supported in JXA, use function() {}' },
    { pattern: /\.\.\.[a-zA-Z_]/, message: 'Spread operator is not supported in JXA' },
    { pattern: /`[^`]*\$\{/, message: 'Template literals with interpolation may cause issues in JXA' },
    { pattern: /const\s+\{[^}]+\}\s*=/, message: 'Destructuring assignment is not supported in JXA' },
    { pattern: /let\s+\{[^}]+\}\s*=/, message: 'Destructuring assignment is not supported in JXA' },
    { pattern: /class\s+[a-zA-Z_]/, message: 'ES6 classes are not supported in JXA' },
    
    // Object literal patterns that cause issues - more specific patterns to avoid false positives
    // Target object literals in assignments and returns, not labeled statements
    { pattern: /(?:=\s*|return\s+|:\s*)\{\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/, message: 'Use bracket notation instead of object literal syntax for JXA compatibility' },
    { pattern: /(?:=\s*|return\s+|:\s*)\{\s*\[[^\]]+\]\s*:/, message: 'Computed property names in object literals are not supported in JXA' }
  ];

  private static readonly ESCAPING_ISSUES = [
    { pattern: /\\{3,}/, message: 'Multiple backslash escaping may indicate escaping issues' },
    { pattern: /"[^"]*\\n[^"]*"/, message: 'Newline in string literal should be properly escaped' },
    { pattern: /"[^"]*\$\{/, message: 'Template literal syntax in string may cause issues' },
    { pattern: /split\("[^"]*\\{2,}/, message: 'Complex escaping in split() call may cause issues' }
  ];

  // Built-in functions Set for O(1) lookup performance
  private static readonly BUILT_IN_FUNCTIONS = new Set([
    // JavaScript built-ins
    'Array', 'Object', 'String', 'Number', 'Boolean', 'Function', 'Date', 'RegExp',
    'Math', 'JSON', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'decodeURI',
    'encodeURI', 'decodeURIComponent', 'encodeURIComponent', 'eval',
    'console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
    
    // Array methods
    'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'join', 'concat',
    'reverse', 'sort', 'filter', 'map', 'forEach', 'reduce', 'find', 'indexOf',
    'lastIndexOf', 'includes', 'some', 'every',
    
    // String methods  
    'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match',
    'replace', 'search', 'slice', 'split', 'substr', 'substring', 'toLowerCase',
    'toUpperCase', 'trim', 'includes', 'startsWith', 'endsWith',
    
    // Object methods
    'hasOwnProperty', 'toString', 'valueOf',
    
    // DEVONthink Application methods
    'Application', 'running', 'getRecordWithUuid', 'getRecordWithId', 'getRecordAt',
    'search', 'databases', 'currentDatabase', 'getChatResponseForMessage',
    
    // DEVONthink record methods (these will be called on record objects)
    'uuid', 'name', 'type', 'recordType', 'location', 'path', 'children',
    'creationDate', 'modificationDate', 'size', 'wordCount', 'database',
    'tags', 'comment', 'rating', 'flagged', 'unread', 'locking',
    
    // Common utility functions we might define
    'Error', 'test', 'exec', 'match',
    
    // JavaScript keywords that look like function calls in regex
    'if', 'else', 'while', 'for', 'do', 'switch', 'try', 'catch', 'finally',
    'throw', 'return', 'break', 'continue', 'function', 'var', 'let', 'const',
    'new', 'this', 'typeof', 'instanceof', 'in', 'of', 'delete', 'void',
    
    // Common method names that are called on objects
    'stringify', 'parse', 'now', 'max', 'min', 'floor', 'ceil', 'round',
    'abs', 'random', 'sqrt', 'pow'
  ]);

  /**
   * Validate a JXA script for common issues
   */
  static validate(script: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    const lines = script.split('\n');

    // Check for dangerous patterns
    JXAValidator.checkDangerousPatterns(script, lines, errors);
    
    // Check for JXA incompatible features
    JXAValidator.checkJXACompatibility(script, lines, errors, warnings);
    
    // Check for escaping issues
    JXAValidator.checkEscapingIssues(script, lines, warnings);
    
    // Check for common mistakes
    JXAValidator.checkCommonMistakes(script, lines, warnings, suggestions);
    
    // Check for performance issues
    JXAValidator.checkPerformanceIssues(script, lines, warnings, suggestions);

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private static checkDangerousPatterns(script: string, lines: string[], errors: ValidationError[]): void {
    JXAValidator.DANGEROUS_PATTERNS.forEach(pattern => {
      if (pattern.test(script)) {
        errors.push({
          type: 'security',
          severity: 'error',
          message: `Potentially dangerous pattern detected: ${pattern.source}`
        });
      }
    });

    // Check for console.log which causes MCP errors
    lines.forEach((line, index) => {
      if (line.includes('console.log')) {
        errors.push({
          type: 'compatibility',
          severity: 'error',
          message: 'console.log() statements cause MCP stdio JSON-RPC errors',
          line: index + 1
        });
      }
    });
  }

  private static checkJXACompatibility(
    script: string, 
    lines: string[], 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): void {
    JXAValidator.JXA_INCOMPATIBLE_PATTERNS.forEach(({ pattern, message }) => {
      const matches = script.match(pattern);
      if (matches) {
        // Find line number
        const lineIndex = lines.findIndex(line => pattern.test(line));
        errors.push({
          type: 'compatibility',
          severity: 'error',
          message,
          line: lineIndex >= 0 ? lineIndex + 1 : undefined
        });
      }
    });

    // Check for return of object literals
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('return {') && !trimmed.includes('JSON.stringify')) {
        errors.push({
          type: 'compatibility',
          severity: 'error',
          message: 'Cannot return object literals directly in JXA - build object with bracket notation first',
          line: index + 1
        });
      }
    });
  }

  private static checkEscapingIssues(
    script: string, 
    lines: string[], 
    warnings: ValidationWarning[]
  ): void {
    JXAValidator.ESCAPING_ISSUES.forEach(({ pattern, message }) => {
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          warnings.push({
            type: 'compatibility',
            message,
            line: index + 1
          });
        }
      });
    });

    // Check for unescaped quotes in regex patterns
    lines.forEach((line, index) => {
      if (line.includes('new RegExp') && line.includes('"')) {
        const regexMatch = line.match(/new RegExp\("([^"]+)"/);
        if (regexMatch) {
          const pattern = regexMatch[1];
          // Check if pattern has unescaped special regex characters
          if (/[.+*?^${}()|[\]\\]/.test(pattern) && !pattern.includes('\\\\')) {
            warnings.push({
              type: 'compatibility',
              message: 'Regex pattern may need additional escaping for JXA',
              line: index + 1
            });
          }
        }
      }
    });
  }

  private static checkCommonMistakes(
    script: string, 
    lines: string[], 
    warnings: ValidationWarning[], 
    suggestions: string[]
  ): void {
    // Check for undefined values
    if (script.includes('undefined')) {
      warnings.push({
        type: 'compatibility',
        message: 'Script contains undefined values - ensure all variables are properly initialized'
      });
    }

    // Check for missing function definitions - this was the core issue
    JXAValidator.checkFunctionDependencies(script, lines, warnings);

    // Check for missing error handling
    const hasTryCatch = /try\s*\{/.test(script);
    if (!hasTryCatch) {
      suggestions.push('Consider adding try-catch blocks for better error handling');
    }

    // Check for DEVONthink app validation
    const hasAppValidation = script.includes('theApp.running()');
    if (!hasAppValidation) {
      suggestions.push('Add DEVONthink running validation for robustness');
    }

    // Check for JSON.stringify usage
    lines.forEach((line, index) => {
      if (line.includes('JSON.stringify') && line.includes('record')) {
        warnings.push({
          type: 'compatibility',
          message: 'Cannot JSON.stringify DEVONthink objects directly - extract properties first',
          line: index + 1
        });
      }
    });
  }

  /**
   * Check for function calls without corresponding definitions
   */
  private static checkFunctionDependencies(
    script: string,
    lines: string[],
    warnings: ValidationWarning[]
  ): void {
    // Extract all function calls - IMPROVED to exclude calls inside string literals
    const functionCalls = new Set<string>();
    
    // Split script into code and string parts to avoid false positives from string content
    const codeWithoutStrings = JXAValidator.removeStringLiterals(script);
    
    const functionCallPattern = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
    let match;
    while ((match = functionCallPattern.exec(codeWithoutStrings)) !== null) {
      const funcName = match[1];
      // Skip built-in JavaScript functions and DEVONthink methods
      if (!JXAValidator.isBuiltInFunction(funcName)) {
        functionCalls.add(funcName);
      }
    }

    // Extract all function definitions
    const functionDefinitions = new Set<string>();
    const functionDefPattern = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
    while ((match = functionDefPattern.exec(script)) !== null) {
      functionDefinitions.add(match[1]);
    }

    // Also check for const function assignments
    const constFunctionPattern = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function/g;
    while ((match = constFunctionPattern.exec(script)) !== null) {
      functionDefinitions.add(match[1]);
    }

    // Find missing function definitions
    functionCalls.forEach(funcName => {
      if (!functionDefinitions.has(funcName)) {
        // Find the line where this function is called
        const lineIndex = lines.findIndex(line => 
          new RegExp(`\\b${funcName}\\s*\\(`).test(line)
        );

        warnings.push({
          type: 'compatibility',
          message: `Function '${funcName}' is called but not defined in the script`,
          line: lineIndex >= 0 ? lineIndex + 1 : undefined
        });
      }
    });
  }

  /**
   * Remove string literals from script to avoid false positive function call detection
   * This prevents the validator from detecting words inside strings as function calls
   */
  private static removeStringLiterals(script: string): string {
    // Remove double-quoted strings while preserving structure
    let result = script.replace(/"(?:[^"\\]|\\.)*"/g, '""');
    
    // Remove single-quoted strings while preserving structure  
    result = result.replace(/'(?:[^'\\]|\\.)*'/g, "''");
    
    // Remove template literals while preserving structure
    result = result.replace(/`(?:[^`\\]|\\.)*`/g, '``');
    
    return result;
  }

  /**
   * Check if a function name is a built-in JavaScript or DEVONthink function
   * Uses a Set for O(1) lookup performance instead of Array.includes O(n)
   */
  private static isBuiltInFunction(funcName: string): boolean {
    return JXAValidator.BUILT_IN_FUNCTIONS.has(funcName);
  }

  private static checkPerformanceIssues(
    script: string, 
    lines: string[], 
    warnings: ValidationWarning[], 
    suggestions: string[]
  ): void {
    // Remove string literals to avoid false positives
    const scriptWithoutStrings = JXAValidator.removeStringLiterals(script);
    const linesWithoutStrings = lines.map(line => JXAValidator.removeStringLiterals(line));
    
    // Check for nested loops (using cleaned lines to avoid strings)
    let nestedLoopDepth = 0;
    linesWithoutStrings.forEach((line, index) => {
      if (/for\s*\(/.test(line)) {
        nestedLoopDepth++;
        if (nestedLoopDepth > 2) {
          warnings.push({
            type: 'performance',
            message: 'Deeply nested loops may cause performance issues',
            line: index + 1
          });
        }
      }
      if (line.includes('}')) {
        // Simplified check - in real implementation would track scope properly
        nestedLoopDepth = Math.max(0, nestedLoopDepth - 1);
      }
    });

    // Check for large document processing (using cleaned script)
    if (scriptWithoutStrings.includes('searchResults') || scriptWithoutStrings.includes('children()')) {
      suggestions.push('Consider limiting document collection size for better performance');
    }

    // Check for string concatenation in loops (using cleaned lines)
    linesWithoutStrings.forEach((line, index) => {
      // Only flag if += is present and we're actually dealing with strings
      // Check the original line for quotes to confirm it's string concatenation
      if (line.includes('+=') && lines[index].includes('"')) {
        // But only if the += is not inside a string literal itself
        if (line.includes('+=')) {
          warnings.push({
            type: 'performance',
            message: 'String concatenation in loops can be slow - consider using array.join()',
            line: index + 1
          });
        }
      }
    });
  }

  /**
   * Quick validation for specific common issues
   */
  static quickValidate(script: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Critical issues that will definitely cause failure
    if (script.includes('${')) {
      issues.push('Unresolved template literals found');
    }

    if (script.includes('console.log')) {
      issues.push('console.log statements will cause MCP errors');
    }

    if (/return\s*\{[^}]*\}/.test(script) && !script.includes('JSON.stringify')) {
      issues.push('Direct object literal returns are not supported in JXA');
    }

    if (/\{\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/.test(script)) {
      issues.push('Object literal syntax detected - use bracket notation for JXA');
    }

    // Check for the specific error that was causing issues
    if (script.includes('getRecordLookupHelpers()') && 
        !script.includes('function getRecordLookupHelpers')) {
      issues.push('getRecordLookupHelpers() called but function not defined');
    }

    // Quick check for common missing functions
    const commonMissingFunctions = ['getRecord', 'lookupByUuid', 'lookupById'];
    commonMissingFunctions.forEach(funcName => {
      const hasCall = new RegExp(`\\b${funcName}\\s*\\(`).test(script);
      const hasDefinition = new RegExp(`function\\s+${funcName}\\s*\\(`).test(script);
      if (hasCall && !hasDefinition) {
        issues.push(`Function '${funcName}' is called but not defined`);
      }
    });

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Extract regex patterns from script for separate testing
   */
  static extractRegexPatterns(script: string): { name: string; pattern: string; flags?: string }[] {
    const patterns: { name: string; pattern: string; flags?: string }[] = [];
    const regexMatches = script.match(/const\s+(\w+)\s*=\s*new\s+RegExp\("((?:[^"\\]|\\.)*)"(?:,\s*"([^"]*)")?\)/g);
    
    if (regexMatches) {
      regexMatches.forEach(match => {
        const parsed = match.match(/const\s+(\w+)\s*=\s*new\s+RegExp\("([^"]+)"(?:,\s*"([^"]*)")?\)/);
        if (parsed) {
          patterns.push({
            name: parsed[1],
            pattern: parsed[2],
            flags: parsed[3]
          });
        }
      });
    }

    return patterns;
  }

  /**
   * Test regex patterns in isolation
   */
  static testRegexPattern(pattern: string, testStrings: string[]): {
    pattern: string;
    valid: boolean;
    errors: string[];
    testResults: { input: string; matches: boolean; captures?: string[] }[]
  } {
    const errors: string[] = [];
    const testResults: { input: string; matches: boolean; captures?: string[] }[] = [];
    
    try {
      // Create the regex with double escaping for testing
      const regex = new RegExp(pattern.replace(/\\\\/g, '\\'));
      
      testStrings.forEach(testString => {
        try {
          const matches = regex.exec(testString);
          testResults.push({
            input: testString,
            matches: matches !== null,
            captures: matches ? Array.from(matches) : undefined
          });
        } catch (testError) {
          testResults.push({
            input: testString,
            matches: false
          });
        }
      });
      
    } catch (regexError) {
      errors.push(`Invalid regex pattern: ${regexError}`);
    }

    return {
      pattern,
      valid: errors.length === 0,
      errors,
      testResults
    };
  }
}

/**
 * Helper function to format validation results for display
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];
  
  if (result.valid) {
    lines.push('✅ Script validation passed');
  } else {
    lines.push('❌ Script validation failed');
  }
  
  if (result.errors.length > 0) {
    lines.push('\nErrors:');
    result.errors.forEach(error => {
      const location = error.line ? ` (line ${error.line})` : '';
      lines.push(`  • ${error.message}${location}`);
    });
  }
  
  if (result.warnings.length > 0) {
    lines.push('\nWarnings:');
    result.warnings.forEach(warning => {
      const location = warning.line ? ` (line ${warning.line})` : '';
      lines.push(`  • ${warning.message}${location}`);
    });
  }
  
  if (result.suggestions.length > 0) {
    lines.push('\nSuggestions:');
    result.suggestions.forEach(suggestion => {
      lines.push(`  • ${suggestion}`);
    });
  }
  
  return lines.join('\n');
}