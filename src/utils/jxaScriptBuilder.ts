/**
 * JXA Script Builder - Robust, testable JXA script generation
 * 
 * This system eliminates the fragile template literal approach by providing:
 * 1. Hierarchical script construction
 * 2. Automatic escaping and validation
 * 3. Reusable code fragments
 * 4. Pre-execution validation
 * 5. Testable components
 */

import { escapeStringForJXA, isJXASafeString } from './escapeString.js';
import { JXAValidator } from './jxaValidator.js';

// Types for script components
export interface JXAVariable {
  name: string;
  value: string | number | boolean | null | undefined;
  type?: 'string' | 'number' | 'boolean' | 'null' | 'raw';
}

export interface JXARegexPattern {
  pattern: string;
  flags?: string;
}

export interface JXAObjectProperty {
  key: string;
  value: string | number | boolean | null;
}

export interface JXAScriptFragment {
  code: string;
  variables?: JXAVariable[];
}

// Core script builder class
export class JXAScriptBuilder {
  private variables: Map<string, JXAVariable> = new Map();
  private functions: Map<string, JXAScriptFragment> = new Map();
  private mainCode: string[] = [];
  private regexPatterns: Map<string, JXARegexPattern> = new Map();

  /**
   * Add a variable with automatic type inference and safe escaping
   */
  addVariable(name: string, value: any, type?: JXAVariable['type']): this {
    // Validate variable name
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
      throw new Error(`Invalid JXA variable name: ${name}`);
    }

    // Determine type and format value
    let formattedValue: string;
    let inferredType: JXAVariable['type'] = type;

    if (value === null || value === undefined) {
      formattedValue = 'null';
      inferredType = 'null';
    } else if (type === 'raw') {
      // Raw JavaScript code (use carefully!)
      formattedValue = String(value);
      inferredType = 'raw';
    } else if (typeof value === 'string') {
      if (!isJXASafeString(value)) {
        throw new Error(`Unsafe string value for variable ${name}: contains control characters`);
      }
      formattedValue = `"${escapeStringForJXA(value)}"`;
      inferredType = 'string';
    } else if (typeof value === 'number') {
      formattedValue = String(value);
      inferredType = 'number';
    } else if (typeof value === 'boolean') {
      formattedValue = String(value);
      inferredType = 'boolean';
    } else {
      // Convert to string and escape
      formattedValue = `"${escapeStringForJXA(String(value))}"`;
      inferredType = 'string';
    }

    this.variables.set(name, {
      name,
      value: formattedValue,
      type: inferredType
    });

    return this;
  }

  /**
   * Add a regex pattern with proper escaping for JXA
   */
  addRegexPattern(name: string, pattern: string, flags?: string): this {
    // Escape the pattern for use in JXA
    const escapedPattern = pattern
      .replace(/\\/g, '\\\\')  // Escape backslashes first
      .replace(/"/g, '\\"');   // Then escape quotes

    this.regexPatterns.set(name, {
      pattern: escapedPattern,
      flags: flags || ''
    });

    return this;
  }

  /**
   * Create a JXA object using bracket notation to avoid ES6 issues
   */
  createObject(objectName: string, properties: JXAObjectProperty[]): this {
    const lines = [`const ${objectName} = {};`];
    
    for (const prop of properties) {
      if (prop.value === null || prop.value === undefined) {
        lines.push(`${objectName}["${prop.key}"] = null;`);
      } else if (typeof prop.value === 'string') {
        if (!isJXASafeString(prop.value)) {
          throw new Error(`Unsafe property value: ${prop.key}`);
        }
        lines.push(`${objectName}["${prop.key}"] = "${escapeStringForJXA(prop.value)}";`);
      } else {
        lines.push(`${objectName}["${prop.key}"] = ${prop.value};`);
      }
    }

    this.addCodeBlock(lines.join('\n'));
    return this;
  }

  /**
   * Add a reusable function/code fragment
   */
  addFunction(name: string, fragment: JXAScriptFragment): this {
    // Add variables
    if (fragment.variables) {
      fragment.variables.forEach(v => {
        this.addVariable(v.name, v.value, v.type);
      });
    }

    this.functions.set(name, fragment);
    return this;
  }

  /**
   * Add a block of code with automatic formatting
   */
  addCodeBlock(code: string): this {
    // Basic validation - no template literals or unescaped strings
    if (code.includes('${') || code.includes('`')) {
      throw new Error('Code block contains template literals - use variables instead');
    }

    this.mainCode.push(code);
    return this;
  }

  /**
   * Add conditional code block
   */
  addConditional(condition: string, thenCode: string, elseCode?: string): this {
    let conditional = `if (${condition}) {\n${this.indent(thenCode)}\n}`;
    
    if (elseCode) {
      conditional += ` else {\n${this.indent(elseCode)}\n}`;
    }

    this.addCodeBlock(conditional);
    return this;
  }

  /**
   * Add try-catch block with proper error handling
   */
  addTryCatch(tryCode: string, catchCode?: string): this {
    const defaultCatch = `
      const errorResult = {};
      errorResult["success"] = false;
      errorResult["error"] = error.toString();
      return JSON.stringify(errorResult);
    `.trim();

    const fullTryCatch = `
try {
${this.indent(tryCode)}
} catch (error) {
${this.indent(catchCode || defaultCatch)}
}
    `.trim();

    this.addCodeBlock(fullTryCatch);
    return this;
  }

  /**
   * Generate the complete JXA script
   */
  build(): string {
    const parts: string[] = [];

    // Script wrapper
    parts.push('(function() {');
    
    // DEVONthink setup
    parts.push(this.indent(`
const theApp = Application("DEVONthink");
theApp.includeStandardAdditions = true;
    `.trim()));

    // Functions are added directly, not as separate dependency blocks

    // Add variables
    if (this.variables.size > 0) {
      parts.push(this.indent('// Variables'));
      this.variables.forEach(variable => {
        parts.push(this.indent(`const ${variable.name} = ${variable.value};`));
      });
      parts.push('');
    }

    // Add regex patterns
    if (this.regexPatterns.size > 0) {
      parts.push(this.indent('// Regex patterns'));
      this.regexPatterns.forEach((pattern, name) => {
        const flags = pattern.flags ? `, "${pattern.flags}"` : '';
        parts.push(this.indent(`const ${name} = new RegExp("${pattern.pattern}"${flags});`));
      });
      parts.push('');
    }

    // Add functions
    if (this.functions.size > 0) {
      parts.push(this.indent('// Functions'));
      this.functions.forEach((fragment, name) => {
        // Add the actual function code, not just comments
        parts.push(this.indent(fragment.code));
        parts.push('');
      });
    }

    // Add main code
    if (this.mainCode.length > 0) {
      parts.push(this.indent('// Main execution'));
      this.mainCode.forEach(code => {
        parts.push(this.indent(code));
      });
    }

    // Close wrapper
    parts.push('})();');

    return parts.join('\n');
  }

  /**
   * Validate the generated script for common issues
   */
  validate() {
    const script = this.build();
    return JXAValidator.validate(script);
  }

  /**
   * Helper to indent code blocks
   */
  private indent(code: string, spaces: number = 2): string {
    const indentation = ' '.repeat(spaces);
    return code
      .split('\n')
      .map(line => line.trim() ? indentation + line : line)
      .join('\n');
  }

}

