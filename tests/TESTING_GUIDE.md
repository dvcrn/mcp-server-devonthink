# AI Tool Testing Guide for Developers

This guide provides step-by-step instructions for testing AI tools in the DEVONthink MCP Server. Follow this guide to ensure your AI tools are robust, secure, and production-ready.

## 🎯 Testing Philosophy

Our testing approach follows these principles:

1. **Test Early, Test Often**: Write tests as you develop, not after
2. **Test Real Scenarios**: Focus on actual user workflows and edge cases
3. **Fail Fast**: Tests should quickly identify problems and provide clear guidance
4. **Comprehensive Coverage**: Test all code paths, especially error conditions
5. **Security First**: Every input is potentially malicious until proven otherwise

## 📋 Testing Checklist

Use this checklist when implementing and testing new AI tools:

### ✅ Pre-Development
- [ ] Understand the tool's purpose and expected behavior
- [ ] Identify key inputs, outputs, and error scenarios
- [ ] Plan test data and mock responses
- [ ] Set up test file structure

### ✅ During Development  
- [ ] Write failing tests first (TDD approach)
- [ ] Implement functionality to make tests pass
- [ ] Test XSS prevention and input sanitization
- [ ] Add error handling tests
- [ ] Validate performance requirements

### ✅ Post-Development
- [ ] Achieve minimum coverage requirements (80%+)
- [ ] Run full test suite without failures
- [ ] Test edge cases and boundary conditions
- [ ] Document test patterns for future developers
- [ ] Verify CI/CD integration works correctly

## 🛠 Step-by-Step Testing Guide

### Step 1: Set Up Test Environment

1. **Create test file structure**:
```bash
# For unit tests
touch tests/tools/ai/yourTool.test.ts

# For integration tests  
touch tests/integration/yourTool-integration.test.ts
```

2. **Import required testing utilities**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  mockExecuteJxa,
  setupDefaultJXAMocks,
  MOCK_AI_RESPONSES 
} from '@tests/mocks/devonthink.js';
import { 
  validateToolStructure,
  AI_TEST_PATTERNS,
  createAIToolTestSuite 
} from '@tests/utils/test-helpers.js';
```

### Step 2: Write Unit Tests

Start with testing individual components:

```typescript
describe('Your AI Tool Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should accept valid input', () => {
      const input = {
        prompt: 'Valid prompt',
        engine: 'ChatGPT'
      };
      
      const result = validateYourToolInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid input', () => {
      const input = {
        // Missing required fields
      };
      
      const result = validateYourToolInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize malicious input', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitized = sanitizeYourToolInput(maliciousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should handle all XSS patterns', () => {
      for (const payload of AI_TEST_PATTERNS.XSS_PAYLOADS) {
        const result = processYourToolInput(payload);
        expect(result).not.toContain('<script>');
      }
    });
  });
});
```

### Step 3: Write Integration Tests

Test the complete tool workflow:

```typescript
describe('Your AI Tool Integration', () => {
  let tool: Tool;

  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultJXAMocks();
    
    tool = createYourAITool();
  });

  it('should complete successful operation', async () => {
    // Set up mock response
    const expectedResponse = {
      success: true,
      operationType: 'your_operation',
      result: 'Expected result data'
    };
    
    mockExecuteJxa.mockResolvedValueOnce(expectedResponse);

    // Execute tool
    const result = await tool.run({
      prompt: 'Test prompt',
      engine: 'ChatGPT'
    });

    // Validate results
    expect(result.success).toBe(true);
    expect(result.result).toBe('Expected result data');
    expect(result.timestamp).toBeDefined();
    expect(result.executionTime).toBeGreaterThan(0);
  });

  it('should handle error scenarios', async () => {
    // Test various error conditions
    const errorScenarios = [
      {
        name: 'DEVONthink not running',
        mockResponse: { success: false, error: 'DEVONthink is not running' },
        expectedError: 'DEVONthink is not running'
      },
      {
        name: 'AI service unavailable', 
        mockResponse: { success: false, error: 'AI service unavailable' },
        expectedError: 'AI service unavailable'
      }
    ];

    for (const scenario of errorScenarios) {
      mockExecuteJxa.mockResolvedValueOnce(scenario.mockResponse);
      
      const result = await tool.run({ prompt: 'Test' });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain(scenario.expectedError);
    }
  });
});
```

### Step 4: Test Performance

Ensure your tool performs within acceptable limits:

```typescript
describe('Performance Tests', () => {
  it('should complete within time limit', async () => {
    const startTime = Date.now();
    
    await tool.run({ prompt: 'Performance test' });
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5 second limit
  });

  it('should handle large inputs', async () => {
    const largePrompt = 'a'.repeat(10000);
    
    const result = await tool.run({ 
      prompt: largePrompt 
    });
    
    expect(result.success).toBe(true);
  });

  it('should handle concurrent requests', async () => {
    const promises = Array(5).fill(null).map(() =>
      tool.run({ prompt: 'Concurrent test' })
    );
    
    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(5);
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
  });
});
```

### Step 5: Test Error Handling

Comprehensive error scenario testing:

```typescript
describe('Error Handling', () => {
  it('should provide helpful error messages', async () => {
    const errorCases = [
      {
        input: {},
        expectedError: 'prompt is required',
        expectedSuggestion: 'Provide a valid prompt'
      },
      {
        input: { prompt: 'test', recordUuid: 'invalid' },
        expectedError: 'Invalid UUID format',
        expectedSuggestion: 'Use a valid UUID'
      }
    ];

    for (const testCase of errorCases) {
      const result = await tool.run(testCase.input);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain(testCase.expectedError);
      if (testCase.expectedSuggestion) {
        expect(result.suggestions).toContain(testCase.expectedSuggestion);
      }
    }
  });

  it('should handle JXA execution failures', async () => {
    mockExecuteJxa.mockRejectedValueOnce(new Error('JXA failed'));
    
    const result = await tool.run({ prompt: 'Test' });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('JXA failed');
  });
});
```

## 🎛 Testing Patterns by Tool Type

### Chat Tools
```typescript
describe('Chat Tool Testing', () => {
  it('should handle prompt-only chat', async () => {
    const result = await chatTool.run({
      prompt: 'Hello, how are you?'
    });
    
    expect(result.success).toBe(true);
    expect(result.response).toBeDefined();
  });

  it('should handle context-aware chat', async () => {
    const result = await chatTool.run({
      prompt: 'Summarize these documents',
      recordUuids: [AI_TEST_PATTERNS.VALID_UUID],
      mode: 'context'
    });
    
    expect(result.success).toBe(true);
    expect(result.sourceRecords).toBeDefined();
  });
});
```

### Analysis Tools
```typescript
describe('Analysis Tool Testing', () => {
  it('should require records for analysis', async () => {
    const result = await analysisTool.run({
      analysisType: 'content'
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('recordUuids is required');
  });

  it('should analyze multiple records', async () => {
    const result = await analysisTool.run({
      recordUuids: [
        AI_TEST_PATTERNS.VALID_UUID,
        'second-' + AI_TEST_PATTERNS.VALID_UUID
      ],
      analysisType: 'sentiment'
    });
    
    expect(result.success).toBe(true);
    expect(result.analysis).toBeDefined();
  });
});
```

### Generation Tools
```typescript
describe('Generation Tool Testing', () => {
  it('should generate content from prompt', async () => {
    const result = await generationTool.run({
      prompt: 'Generate a research paper outline about AI',
      outputFormat: 'markdown'
    });
    
    expect(result.success).toBe(true);
    expect(result.generatedContent).toBeDefined();
    expect(result.outputFormat).toBe('markdown');
  });

  it('should save to specified location', async () => {
    const result = await generationTool.run({
      prompt: 'Generate content',
      destinationGroupUuid: AI_TEST_PATTERNS.VALID_UUID,
      fileName: 'generated-content.md'
    });
    
    expect(result.success).toBe(true);
    expect(result.generatedLocation).toContain('generated-content.md');
  });
});
```

## 🚨 Common Testing Mistakes to Avoid

### 1. Not Testing Error Paths
```typescript
// ❌ BAD: Only testing happy path
it('should work correctly', async () => {
  const result = await tool.run(validInput);
  expect(result.success).toBe(true);
});

// ✅ GOOD: Testing both success and failure
it('should handle both success and failure', async () => {
  // Test success
  let result = await tool.run(validInput);
  expect(result.success).toBe(true);
  
  // Test failure
  result = await tool.run(invalidInput);
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});
```

### 2. Ignoring XSS Testing
```typescript
// ❌ BAD: No XSS testing
it('should process input', () => {
  const result = processInput('<script>alert("xss")</script>');
  expect(result).toBeDefined();
});

// ✅ GOOD: Explicit XSS prevention testing
it('should prevent XSS attacks', () => {
  const maliciousInput = '<script>alert("xss")</script>';
  const result = processInput(maliciousInput);
  
  expect(result).not.toContain('<script>');
  expect(result).not.toContain('alert');
});
```

### 3. Not Using Proper Mocks
```typescript
// ❌ BAD: No mock setup
it('should call external service', async () => {
  const result = await tool.run(input);
  expect(result.success).toBe(true);
});

// ✅ GOOD: Proper mock setup
it('should call external service', async () => {
  mockExecuteJxa.mockResolvedValueOnce(expectedResponse);
  
  const result = await tool.run(input);
  
  expect(result.success).toBe(true);
  expect(mockExecuteJxa).toHaveBeenCalledWith(expect.any(String));
});
```

### 4. Not Testing Edge Cases
```typescript
// ❌ BAD: Only testing normal cases
it('should handle input', () => {
  const result = processInput('normal input');
  expect(result).toBeDefined();
});

// ✅ GOOD: Testing edge cases
it('should handle edge cases', () => {
  const edgeCases = [
    null,
    undefined,
    '',
    'a'.repeat(10000), // Very long input
    '\x00\x01\x02',   // Control characters
    '🚀🔥✨'          // Unicode/emoji
  ];
  
  for (const edgeCase of edgeCases) {
    expect(() => processInput(edgeCase)).not.toThrow();
  }
});
```

## 📊 Debugging Failed Tests

### 1. Use Test Isolation
```typescript
// Debug specific test
it.only('debug this test', async () => {
  console.log('Debug info:', mockExecuteJxa.mock.calls);
  
  const result = await tool.run(input);
  
  console.log('Result:', JSON.stringify(result, null, 2));
  expect(result.success).toBe(true);
});
```

### 2. Inspect Mock Calls
```typescript
it('should debug mock interactions', async () => {
  await tool.run(input);
  
  // Check if mock was called
  expect(mockExecuteJxa).toHaveBeenCalled();
  
  // Check call count
  expect(mockExecuteJxa).toHaveBeenCalledTimes(1);
  
  // Check call arguments
  expect(mockExecuteJxa).toHaveBeenCalledWith(
    expect.stringContaining('expected script content')
  );
  
  // Log all calls for debugging
  console.log('Mock calls:', mockExecuteJxa.mock.calls);
});
```

### 3. Add Timeouts for Slow Tests
```typescript
it('should handle slow operation', async () => {
  // Set longer timeout for this specific test
  const result = await tool.run(complexInput);
  expect(result.success).toBe(true);
}, 30000); // 30 second timeout
```

## 📈 Coverage Best Practices

### Achieving High Coverage
1. **Test all branches**: Use conditional logic testing
2. **Test error paths**: Don't just test happy paths
3. **Test edge cases**: Null, undefined, empty values
4. **Test async operations**: Promises, timeouts, errors

### Viewing Coverage Reports
```bash
# Generate detailed coverage
npm run test:coverage

# View in browser
open coverage/index.html

# Check specific files
npm run test:coverage -- tests/tools/ai/yourTool.test.ts
```

### Interpreting Coverage Metrics
- **Statements**: Every line of code executed
- **Branches**: Every conditional path taken
- **Functions**: Every function called
- **Lines**: Every line with executable code run

## 🚀 Advanced Testing Techniques

### Property-Based Testing
```typescript
import { fc } from 'fast-check';

it('should handle any valid string input', () => {
  fc.assert(fc.property(fc.string(), (input) => {
    const result = sanitizeInput(input);
    expect(typeof result).toBe('string');
    expect(result).not.toMatch(/[<>]/); // No HTML tags
  }));
});
```

### Snapshot Testing
```typescript
it('should generate consistent script output', () => {
  const script = buildYourScript(standardInput);
  expect(script).toMatchSnapshot();
});
```

### Memory Leak Detection
```typescript
it('should not leak memory', async () => {
  const initialMemory = process.memoryUsage().heapUsed;
  
  // Perform many operations
  for (let i = 0; i < 1000; i++) {
    await tool.run(input);
  }
  
  global.gc(); // Force garbage collection
  const finalMemory = process.memoryUsage().heapUsed;
  
  expect(finalMemory - initialMemory).toBeLessThan(50 * 1024 * 1024);
});
```

## ✅ Final Testing Checklist

Before considering your AI tool complete:

- [ ] **Unit tests** cover all individual functions
- [ ] **Integration tests** cover complete workflows
- [ ] **XSS prevention** is tested and working
- [ ] **Error handling** provides helpful messages
- [ ] **Performance** meets requirements (<5s typical operations)
- [ ] **Edge cases** are handled gracefully
- [ ] **Coverage** meets minimum requirements (80%+)
- [ ] **Documentation** includes testing examples
- [ ] **CI/CD** pipeline runs tests successfully
- [ ] **Manual testing** with realistic data completed

Remember: Good tests are an investment in code quality and maintainability. They catch bugs early, enable confident refactoring, and serve as documentation for future developers.