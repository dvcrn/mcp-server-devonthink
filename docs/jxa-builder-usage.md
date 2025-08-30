# JXA Script Builder Usage Guide

## Overview

The JXA Script Builder provides a robust, type-safe way to generate JavaScript for Automation (JXA) scripts for DEVONthink operations. It replaces error-prone template literal concatenation with a structured builder pattern.

## Key Features

- **Type-safe variable handling**: Automatic escaping and type inference
- **Script validation**: Pre-execution validation to catch errors early  
- **Reusable fragments**: Build complex scripts from composable parts
- **Better debugging**: Built-in debugging and error reporting
- **Test-friendly**: Easily testable script generation

## Basic Usage

```typescript
import { JXAScriptBuilder } from './utils/jxaScriptBuilder.js';

// Create a new builder instance
const builder = new JXAScriptBuilder();

// Add variables and code that uses them
builder
  .addVariable('searchQuery', 'invoice "Q4 2024"')
  .addVariable('maxResults', 100)
  .addCodeBlock(`
    const results = theApp.search(searchQuery, { limit: maxResults });
    return JSON.stringify(results.map(r => r.name()));
  `);

// Build and validate the script
const script = builder.build();
const validation = builder.validate();

if (validation.valid) {
  // Execute the script
  const result = await executeJxa(script);
}
```

## Benefits

This infrastructure is essential for the AI tools that will be added in later PRs. It provides:
1. Safe string handling for user input
2. Validated script generation
3. Testable script construction
4. Foundation for complex AI-powered operations
