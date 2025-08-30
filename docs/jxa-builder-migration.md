# JXA Script Builder Migration Guide

## Overview

This guide demonstrates how existing tools can be migrated to use the JXA Script Builder for safer, more maintainable code.

## Benefits of Migration

1. **Automatic escaping** - No more manual string escaping
2. **Type safety** - Variables are properly typed and validated
3. **Pre-execution validation** - Catch errors before running scripts
4. **Cleaner code** - No more template literal concatenation
5. **Reusable patterns** - Common operations become simple method calls

## Example Migration: isRunning Tool

### Before (Template Literals)
```typescript
const script = `
  const app = Application("DEVONthink");
  const isRunning = app.running();
  JSON.stringify({ isRunning });
`;
```

### After (JXA Builder)
```typescript
import { JXAScriptBuilder } from '../utils/jxaScriptBuilder.js';

const builder = JXAScriptBuilder.createWithDefaults();
builder
  .addCodeBlock(`
    const isRunning = theApp.running();
    const result = {};
    result["isRunning"] = isRunning;
    return JSON.stringify(result);
  `);

const script = builder.build();
```

## Example Migration: Complex Tool with Variables

### Before (Manual Escaping)
```typescript
const escapedName = escapeStringForJXA(name);
const escapedContent = escapeStringForJXA(content);

const script = `
  const theApp = Application("DEVONthink");
  const name = "${escapedName}";
  const content = "${escapedContent}";
  const tags = ${tags ? `["${tags.map(t => escapeStringForJXA(t)).join('", "')}"]` : '[]'};
  // ... complex logic
`;
```

### After (Automatic Escaping)
```typescript
const builder = JXAScriptBuilder.createWithDefaults();
builder
  .addVariable('name', name)
  .addVariable('content', content)
  .addVariable('tags', tags || [], 'raw')
  .addCodeBlock(`
    // Use variables directly - they're already escaped
    const record = theApp.createRecord({
      name: name,
      plainText: content,
      tags: tags
    });
  `);

const script = builder.build();
```

## Migration Strategy

### Phase 1: Critical Tools (PR 2-3)
- Tools with complex string handling
- Tools that handle user input
- Tools with known escaping issues

### Phase 2: Common Tools (PR 4-5)
- Frequently used tools
- Tools with moderate complexity
- Tools that would benefit from validation

### Phase 3: Remaining Tools (PR 6+)
- Simple tools
- Rarely used tools
- Tools with minimal string handling

## Testing Migration

Each migrated tool should:
1. Pass all existing functionality tests
2. Handle edge cases (quotes, special characters, null values)
3. Validate inputs before execution
4. Return consistent error formats

## Future Enhancements

Once all tools are migrated, we can:
- Add centralized error handling
- Implement script caching
- Add performance monitoring
- Create reusable script fragments
- Enable debug mode with script logging