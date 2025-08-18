/**
 * Script Debugger - Development tools for inspecting and debugging generated JXA scripts
 * 
 * This module provides utilities to help developers debug JXA script generation issues,
 * inspect generated code, and validate scripts before execution.
 */

import { JXAScriptBuilder } from './jxaScriptBuilder.js';
import { JXAValidator, formatValidationResult, ValidationResult } from './jxaValidator.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface ScriptDebugInfo {
  name: string;
  timestamp: string;
  builder: JXAScriptBuilder;
  script: string;
  validation: ValidationResult;
  size: number;
  lineCount: number;
  functionCount: number;
  variableCount: number;
}

export interface DebuggerOptions {
  saveScripts?: boolean;
  outputDir?: string;
  includeValidation?: boolean;
  includeMetrics?: boolean;
  verbose?: boolean;
}

/**
 * Script Debugger utility class
 */
export class ScriptDebugger {
  private static debugHistory: ScriptDebugInfo[] = [];
  private static defaultOptions: DebuggerOptions = {
    saveScripts: false,
    outputDir: './.debug/scripts',
    includeValidation: true,
    includeMetrics: true,
    verbose: false
  };

  /**
   * Debug a JXA script builder and its generated script
   */
  static debug(
    name: string, 
    builder: JXAScriptBuilder, 
    options: DebuggerOptions = {}
  ): ScriptDebugInfo {
    const opts = { ...this.defaultOptions, ...options };
    const timestamp = new Date().toISOString();
    
    if (opts.verbose) {
      console.log(`🔧 Debugging script: ${name}`);
    }

    // Generate the script
    const script = builder.build();
    
    // Run validation
    const validation = opts.includeValidation ? 
      JXAValidator.validate(script) : 
      { valid: true, errors: [], warnings: [], suggestions: [] };

    // Calculate metrics
    const size = script.length;
    const lineCount = script.split('\n').length;
    const functionCount = (script.match(/function\s+\w+\s*\(/g) || []).length;
    const variableCount = (script.match(/const\s+\w+\s*=/g) || []).length;

    const debugInfo: ScriptDebugInfo = {
      name,
      timestamp,
      builder,
      script,
      validation,
      size,
      lineCount,
      functionCount,
      variableCount
    };

    // Save to history
    this.debugHistory.push(debugInfo);

    // Save to file if requested
    if (opts.saveScripts) {
      this.saveScript(debugInfo, opts.outputDir!);
    }

    // Output debug information
    if (opts.verbose) {
      this.printDebugInfo(debugInfo, opts);
    }

    return debugInfo;
  }

  /**
   * Save a script to disk for inspection
   */
  private static saveScript(debugInfo: ScriptDebugInfo, outputDir: string): void {
    try {
      mkdirSync(outputDir, { recursive: true });
      
      const safeName = debugInfo.name.replace(/[^a-zA-Z0-9-_]/g, '_');
      const timestamp = debugInfo.timestamp.replace(/[:.]/g, '-');
      const filename = `${safeName}_${timestamp}.js`;
      const filepath = join(outputDir, filename);
      
      const content = [
        `// Generated JXA Script Debug Output`,
        `// Tool: ${debugInfo.name}`,
        `// Timestamp: ${debugInfo.timestamp}`,
        `// Size: ${debugInfo.size} bytes, ${debugInfo.lineCount} lines`,
        `// Functions: ${debugInfo.functionCount}, Variables: ${debugInfo.variableCount}`,
        `// Validation: ${debugInfo.validation.valid ? 'PASSED' : 'FAILED'}`,
        '',
        debugInfo.script
      ].join('\n');
      
      writeFileSync(filepath, content, 'utf8');
      console.log(`💾 Script saved to: ${filepath}`);
      
      // Also save validation report
      if (!debugInfo.validation.valid) {
        const validationFile = join(outputDir, `${safeName}_${timestamp}_validation.txt`);
        writeFileSync(validationFile, formatValidationResult(debugInfo.validation), 'utf8');
        console.log(`📋 Validation report saved to: ${validationFile}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to save script: ${error}`);
    }
  }

  /**
   * Print debug information to console
   */
  private static printDebugInfo(debugInfo: ScriptDebugInfo, options: DebuggerOptions): void {
    console.log(`\n=== Script Debug: ${debugInfo.name} ===`);
    
    if (options.includeMetrics) {
      console.log(`📊 Metrics:`);
      console.log(`  - Size: ${debugInfo.size.toLocaleString()} bytes`);
      console.log(`  - Lines: ${debugInfo.lineCount.toLocaleString()}`);
      console.log(`  - Functions: ${debugInfo.functionCount}`);
      console.log(`  - Variables: ${debugInfo.variableCount}`);
    }
    
    if (options.includeValidation) {
      console.log(`\n✅ Validation:`);
      console.log(formatValidationResult(debugInfo.validation));
    }
    
    console.log(''); // Empty line for readability
  }

  /**
   * Get debug history
   */
  static getHistory(): ScriptDebugInfo[] {
    return [...this.debugHistory];
  }

  /**
   * Clear debug history
   */
  static clearHistory(): void {
    this.debugHistory = [];
  }

  /**
   * Find scripts by name pattern
   */
  static findScripts(namePattern: string | RegExp): ScriptDebugInfo[] {
    const pattern = typeof namePattern === 'string' ? 
      new RegExp(namePattern, 'i') : 
      namePattern;
      
    return this.debugHistory.filter(info => pattern.test(info.name));
  }

  /**
   * Get validation summary for all scripts
   */
  static getValidationSummary(): {
    total: number;
    valid: number;
    invalid: number;
    errorRate: number;
    commonErrors: { [key: string]: number };
    commonWarnings: { [key: string]: number };
  } {
    const total = this.debugHistory.length;
    const valid = this.debugHistory.filter(info => info.validation.valid).length;
    const invalid = total - valid;
    const errorRate = total > 0 ? invalid / total : 0;
    
    const commonErrors: { [key: string]: number } = {};
    const commonWarnings: { [key: string]: number } = {};
    
    this.debugHistory.forEach(info => {
      info.validation.errors.forEach(error => {
        commonErrors[error.message] = (commonErrors[error.message] || 0) + 1;
      });
      
      info.validation.warnings.forEach(warning => {
        commonWarnings[warning.message] = (commonWarnings[warning.message] || 0) + 1;
      });
    });
    
    return {
      total,
      valid,
      invalid,
      errorRate,
      commonErrors,
      commonWarnings
    };
  }

  /**
   * Compare two scripts for differences
   */
  static compareScripts(script1: string, script2: string): {
    identical: boolean;
    sizeDiff: number;
    lineDiff: number;
    differences: string[];
  } {
    const lines1 = script1.split('\n');
    const lines2 = script2.split('\n');
    
    const differences: string[] = [];
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1 !== line2) {
        differences.push(`Line ${i + 1}:`);
        differences.push(`  - ${line1}`);
        differences.push(`  + ${line2}`);
      }
    }
    
    return {
      identical: differences.length === 0,
      sizeDiff: script2.length - script1.length,
      lineDiff: lines2.length - lines1.length,
      differences
    };
  }

  /**
   * Extract and analyze function dependencies
   */
  static analyzeDependencies(script: string): {
    functionDefinitions: string[];
    functionCalls: string[];
    missingFunctions: string[];
    unusedFunctions: string[];
  } {
    // Extract function definitions
    const functionDefinitions: string[] = [];
    const functionDefPattern = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
    let match;
    while ((match = functionDefPattern.exec(script)) !== null) {
      functionDefinitions.push(match[1]);
    }

    // Extract function calls
    const functionCalls: string[] = [];
    const functionCallPattern = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
    while ((match = functionCallPattern.exec(script)) !== null) {
      const funcName = match[1];
      if (!this.isBuiltInFunction(funcName)) {
        functionCalls.push(funcName);
      }
    }

    // Find missing and unused functions
    const uniqueCalls = Array.from(new Set(functionCalls));
    const uniqueDefs = Array.from(new Set(functionDefinitions));
    
    const missingFunctions = uniqueCalls.filter(call => !uniqueDefs.includes(call));
    const unusedFunctions = uniqueDefs.filter(def => !uniqueCalls.includes(def));

    return {
      functionDefinitions: uniqueDefs,
      functionCalls: uniqueCalls,
      missingFunctions,
      unusedFunctions
    };
  }

  /**
   * Check if function name is built-in (reuse logic from validator)
   */
  private static isBuiltInFunction(funcName: string): boolean {
    const builtInFunctions = [
      'Array', 'Object', 'String', 'Number', 'Boolean', 'Function', 'Date', 'RegExp',
      'Math', 'JSON', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
      'push', 'pop', 'slice', 'join', 'filter', 'map', 'forEach', 'indexOf',
      'charAt', 'split', 'replace', 'match', 'toLowerCase', 'toUpperCase',
      'Application', 'running', 'getRecordWithUuid', 'search', 'databases',
      'if', 'else', 'while', 'for', 'try', 'catch', 'throw', 'return',
      'function', 'var', 'let', 'const', 'new', 'this',
      'stringify', 'parse', 'test', 'exec'
    ];
    
    return builtInFunctions.includes(funcName);
  }

  /**
   * Generate a comprehensive debug report
   */
  static generateReport(): string {
    const summary = this.getValidationSummary();
    const lines = [
      '='.repeat(80),
      'JXA SCRIPT DEBUGGER REPORT',
      '='.repeat(80),
      '',
      `📊 SUMMARY:`,
      `  Total scripts analyzed: ${summary.total}`,
      `  Valid scripts: ${summary.valid} (${Math.round((summary.valid / summary.total) * 100)}%)`,
      `  Invalid scripts: ${summary.invalid} (${Math.round(summary.errorRate * 100)}%)`,
      '',
    ];

    if (Object.keys(summary.commonErrors).length > 0) {
      lines.push('❌ MOST COMMON ERRORS:');
      Object.entries(summary.commonErrors)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([error, count]) => {
          lines.push(`  ${count}x: ${error}`);
        });
      lines.push('');
    }

    if (Object.keys(summary.commonWarnings).length > 0) {
      lines.push('⚠️  MOST COMMON WARNINGS:');
      Object.entries(summary.commonWarnings)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([warning, count]) => {
          lines.push(`  ${count}x: ${warning}`);
        });
      lines.push('');
    }

    lines.push('📋 RECENT SCRIPTS:');
    this.debugHistory.slice(-10).forEach(info => {
      const status = info.validation.valid ? '✅' : '❌';
      lines.push(`  ${status} ${info.name} (${info.size} bytes, ${info.lineCount} lines)`);
    });

    return lines.join('\n');
  }
}

/**
 * Decorator function to automatically debug JXA script builders
 */
export function debugScript(name?: string, options: DebuggerOptions = {}) {
  return function<T extends JXAScriptBuilder>(builder: T): T {
    const scriptName = name || 'unnamed_script';
    ScriptDebugger.debug(scriptName, builder, options);
    return builder;
  };
}

/**
 * Utility function for quick script debugging
 */
export function quickDebug(script: string, name: string = 'quick_debug'): void {
  const validation = JXAValidator.validate(script);
  const deps = ScriptDebugger.analyzeDependencies(script);
  
  console.log(`\n🔧 Quick Debug: ${name}`);
  console.log(`📏 Size: ${script.length} bytes, ${script.split('\n').length} lines`);
  console.log(`✅ Valid: ${validation.valid ? 'YES' : 'NO'}`);
  
  if (deps.missingFunctions.length > 0) {
    console.log(`❌ Missing functions: ${deps.missingFunctions.join(', ')}`);
  }
  
  if (deps.unusedFunctions.length > 0) {
    console.log(`⚠️  Unused functions: ${deps.unusedFunctions.join(', ')}`);
  }
  
  if (!validation.valid) {
    console.log('\n' + formatValidationResult(validation));
  }
}