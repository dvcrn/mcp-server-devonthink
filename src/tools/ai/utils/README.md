# AI Infrastructure Utilities for DEVONthink MCP Server

This directory contains the foundational infrastructure for all AI tools in the DEVONthink MCP server. These utilities provide standardized validation, script building, error handling, and result processing for AI operations.

## Architecture Overview

The AI infrastructure follows a layered architecture:

```
┌─────────────────────────────────────────┐
│            AI Tool Layer                │
│  (Individual AI tools using base class) │
├─────────────────────────────────────────┤
│          Base AI Tool Pattern          │
│     (Standardized tool template)       │
├─────────────────────────────────────────┤
│           Utility Layer                 │
│  Validation | Scripts | Results | Errors│
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│   JXA Execution | DEVONthink API       │
└─────────────────────────────────────────┘
```

## Core Components

### 1. aiValidation.ts - Input Validation
Provides comprehensive validation for AI tool inputs with DEVONthink-specific constraints.

**Key Features:**
- AI engine validation (ChatGPT, Claude, Gemini, etc.)
- UUID format validation
- String safety checks for JXA
- Record identifier validation
- Pre-built validation schemas

**Usage Example:**
```typescript
import { validateAIToolInput, AI_ENGINES } from './aiValidation.js';

const validation = validateAIToolInput(input, 'chat');
if (!validation.isValid) {
  return { success: false, error: validation.errors.map(e => e.message).join(', ') };
}
```

### 2. aiScriptBuilder.ts - JXA Script Templates
Provides reusable JXA script templates for common AI operations.

**Key Features:**
- Pre-built script templates for chat, summarize, classify, compare
- Safe string escaping and interpolation
- Consistent error handling patterns
- Helper function injection

**Usage Example:**
```typescript
import { buildChatScript } from './aiScriptBuilder.js';

const script = buildChatScript(prompt, {
  recordUuids: ['uuid1', 'uuid2'],
  engine: 'ChatGPT',
  temperature: 0.7
});
```

### 3. resultProcessor.ts - Result Processing
Standardizes AI operation results into consistent formats.

**Key Features:**
- Type-safe result interfaces
- Content sanitization and validation
- Error categorization and processing
- Metadata enrichment

**Usage Example:**
```typescript
import { processAIResult } from './resultProcessor.js';

const processedResult = processAIResult(rawJXAResult, 'chat', startTime);
// Returns standardized BaseAIResult with proper typing
```

### 4. aiAvailabilityChecker.ts - Service Availability
Checks DEVONthink AI service availability and configuration.

**Key Features:**
- DEVONthink running status
- AI feature availability
- Engine configuration status
- Cached availability checks

**Usage Example:**
```typescript
import { checkAIServiceAvailability } from './aiAvailabilityChecker.js';

const status = await checkAIServiceAvailability();
if (!status.isAvailable) {
  return { success: false, error: status.error };
}
```

### 5. baseAITool.ts - Tool Pattern
Base class and utilities for creating standardized AI tools.

**Key Features:**
- Consistent tool structure
- Automatic validation and error handling
- Built-in prerequisite checking
- MCP Tool format conversion

**Usage Example:**
```typescript
import { createAITool, AI_TOOL_SCHEMAS } from './baseAITool.js';

const myAITool = createAITool({
  name: 'my_ai_operation',
  operationType: 'chat',
  description: 'My custom AI operation',
  inputSchema: AI_TOOL_SCHEMAS.CHAT,
  scriptBuilder: (input) => buildMyScript(input)
});
```

### 6. aiErrorHandler.ts - Error Handling
Comprehensive error handling framework with recovery strategies.

**Key Features:**
- Error categorization and severity assessment
- Automatic recovery strategies
- User-friendly error messages
- Retry logic with exponential backoff

**Usage Example:**
```typescript
import { globalAIErrorHandler } from './aiErrorHandler.js';

try {
  // AI operation
} catch (error) {
  const aiError = globalAIErrorHandler.analyzeError(error, 'chat');
  const result = await globalAIErrorHandler.attemptRecovery(aiError, originalOperation);
}
```

## Creating New AI Tools

### Quick Start Guide

1. **Simple AI Tool** - For basic operations:
```typescript
import { createSimpleAITool } from './ai/utils/baseAITool.js';
import { buildChatScript } from './ai/utils/aiScriptBuilder.js';

export const myAITool = createSimpleAITool(
  'my_ai_tool',
  'Description of what the tool does',
  'chat',
  (input) => buildChatScript(input.prompt, input)
);
```

2. **Advanced AI Tool** - For complex operations:
```typescript
import { BaseAITool, AI_TOOL_SCHEMAS } from './ai/utils/baseAITool.js';

class MyAdvancedAITool extends BaseAITool {
  constructor() {
    super({
      name: 'advanced_ai_tool',
      operationType: 'analyze',
      description: 'Advanced AI analysis tool',
      inputSchema: AI_TOOL_SCHEMAS.ANALYSIS,
      scriptBuilder: (input) => this.buildCustomScript(input),
      customValidators: [this.customValidation]
    });
  }

  private buildCustomScript(input: any): string {
    // Custom script building logic
    return buildBaseAIScript('analyze', scriptBody);
  }

  private customValidation(input: any): string[] {
    // Custom validation logic
    return [];
  }
}

export const advancedAITool = new MyAdvancedAITool().toMCPTool();
```

### Tool Development Checklist

- [ ] Choose appropriate operation type (chat, analyze, generate, classify, compare)
- [ ] Select or create appropriate input schema
- [ ] Implement script builder using aiScriptBuilder utilities
- [ ] Add custom validation if needed
- [ ] Test with various inputs and error conditions
- [ ] Add to main server tools array
- [ ] Update documentation

## Integration with Existing Tools

### Upgrading Existing AI Tools

To upgrade existing AI tools to use the new infrastructure:

1. **Replace manual validation** with `validateAIToolInput()`
2. **Use script builders** instead of manual JXA construction
3. **Process results** with `processAIResult()`
4. **Add error handling** using the error handler framework

Example migration:
```typescript
// Before (manual approach)
const classify = async (input: ClassifyInput): Promise<ClassifyResult> => {
  // Manual validation
  if (!isJXASafeString(recordUuid)) {
    return { success: false, error: "Invalid UUID" };
  }
  
  // Manual script building
  const script = `/* complex JXA script */`;
  
  // Execute and return
  return await executeJxa<ClassifyResult>(script);
};

// After (using infrastructure)
const classify = async (input: ClassifyInput): Promise<ClassifyResult> => {
  const tool = createAITool({
    name: 'classify',
    operationType: 'classify',
    description: 'Classify records using AI',
    inputSchema: AI_TOOL_SCHEMAS.CLASSIFICATION,
    scriptBuilder: (input) => buildClassifyScript(input.recordUuid, input)
  });
  
  return await tool.run(input);
};
```

## Performance Optimization

### Caching Strategy
- AI availability status is cached for 1 minute
- Error patterns are analyzed to prevent repeated failures
- Script templates are reused to reduce compilation overhead

### Resource Management
- Input size validation prevents oversized requests
- Timeout management prevents hanging operations
- Memory usage monitoring for large document processing

### Retry Logic
- Exponential backoff for transient failures
- Circuit breaker pattern for persistent issues
- Alternative engine fallback for service-specific problems

## Security Considerations

### Input Sanitization
All inputs are validated using `isJXASafeString()` to prevent script injection:
```typescript
// Automatic in validation utilities
const validation = validateAIToolInput(input, operationType);
```

### Error Information Disclosure
Error messages are sanitized to prevent information leakage:
```typescript
// User-friendly messages without sensitive details
const userMessage = generateUserFriendlyMessage(errorType, originalError);
```

### API Key Protection
- API keys are handled entirely within DEVONthink
- No API credentials are exposed in MCP server
- All AI service communication goes through DEVONthink's proxy

## Testing Strategy

### Unit Testing
- Each utility module should have comprehensive unit tests
- Mock JXA execution for isolated testing
- Test error conditions and edge cases

### Integration Testing
- Test full AI operation workflows
- Validate with actual DEVONthink instances
- Test error recovery scenarios

### Performance Testing
- Measure response times for different input sizes
- Test concurrent operation limits
- Validate memory usage patterns

## Monitoring and Observability

### Error Tracking
```typescript
const errorStats = globalAIErrorHandler.getErrorStats();
// Monitor error patterns and recovery success rates
```

### Performance Metrics
- Operation execution times
- Success/failure rates by operation type
- Resource utilization patterns

### Health Checks
```typescript
const healthStatus = await getAIStatusSummary();
// Regular health monitoring of AI services
```

## Future Extensibility

The infrastructure is designed for easy extension:

### Adding New Operation Types
1. Add to `AIOperationType` enum in validation
2. Create new schema in `AI_TOOL_SCHEMAS`
3. Add script builder template
4. Update result processor for new result types

### Supporting New AI Engines
1. Add to `AI_ENGINES` constant
2. Update availability checker
3. Add engine-specific capabilities
4. Test integration patterns

### Custom Validation Rules
```typescript
const customValidation = (input: Record<string, any>) => {
  // Custom business logic
  return errors;
};
```

## Troubleshooting

### Common Issues

1. **"AI service not available"**
   - Check DEVONthink is running
   - Verify AI features are enabled
   - Check internet connectivity

2. **"Input validation failed"**
   - Review input schema requirements
   - Check for invalid characters in strings
   - Verify UUID formats

3. **"Script execution failed"**
   - Check DEVONthink accessibility
   - Verify record UUIDs exist
   - Check for JXA syntax issues

### Debug Mode
Enable detailed logging:
```typescript
const errorHandler = new AIErrorHandler({
  logErrors: true,
  includeStackTrace: true
});
```

## Contributing

When contributing new AI tools or infrastructure improvements:

1. Follow the established patterns and interfaces
2. Add comprehensive tests for new functionality
3. Update documentation for API changes
4. Consider backward compatibility
5. Test with multiple AI engines when possible

## API Reference

See individual module documentation for detailed API references:
- [Validation API](./aiValidation.ts)
- [Script Builder API](./aiScriptBuilder.ts)
- [Result Processor API](./resultProcessor.ts)
- [Availability Checker API](./aiAvailabilityChecker.ts)
- [Base Tool API](./baseAITool.ts)
- [Error Handler API](./aiErrorHandler.ts)