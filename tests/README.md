# AI Support Testing Framework

This directory contains a comprehensive testing framework for the DEVONthink MCP Server AI features. The testing infrastructure ensures all AI tools are robust, secure, and production-ready.

## 📁 Directory Structure

```
tests/
├── setup.ts                    # Global test configuration
├── mocks/
│   └── devonthink.ts           # DEVONthink mocking utilities
├── utils/
│   └── test-helpers.ts         # Common test utilities and patterns
├── tools/
│   └── ai/
│       └── utils/              # Unit tests for AI infrastructure
│           ├── aiValidation.test.ts
│           ├── aiScriptBuilder.test.ts  
│           ├── resultProcessor.test.ts
│           ├── aiAvailabilityChecker.test.ts
│           ├── baseAITool.test.ts
│           └── aiErrorHandler.test.ts
├── integration/
│   ├── ai-tool-integration.test.ts  # End-to-end AI tool tests
│   └── README.md                    # Integration testing guide
└── README.md                        # This file
```

## 🚀 Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm test -- tests/tools/ai/utils/
npm test -- tests/integration/

# Run in watch mode during development
npm run test:watch

# Run tests with detailed output
npm test -- --reporter=verbose
```

### Test Configuration

The testing framework uses Vitest with the following configuration:

- **Coverage**: 80% statement, 75% branch, 80% function coverage required
- **Timeout**: 10 seconds for tests, 10 seconds for hooks
- **Environment**: Node.js with global test utilities
- **Mocking**: Automatic mock clearing between tests

## 🧪 Testing Categories

### 1. Unit Tests (`tests/tools/ai/utils/`)

**Purpose**: Test individual AI utility modules in isolation

**Coverage**:
- Input validation and sanitization
- JXA script generation and escaping  
- AI result processing and formatting
- Service availability checking
- Base tool functionality
- Error handling and categorization

**Key Features**:
- Comprehensive XSS prevention testing
- Edge case validation (null, undefined, malformed data)
- Performance testing within acceptable limits
- Mock-based isolation from external dependencies

### 2. Integration Tests (`tests/integration/`)

**Purpose**: Test complete AI tool workflows end-to-end

**Coverage**:
- Full tool execution from input to output
- Real-world usage scenarios
- Error recovery and user guidance
- Concurrent operation handling
- Performance under load

**Key Features**:
- Realistic DEVONthink interaction simulation
- Complete AI service workflow validation
- Error scenario testing with proper messaging
- Performance and stress testing

## 🛠 Testing Infrastructure

### Mock System

The testing framework provides comprehensive mocks for DEVONthink interactions:

```typescript
import { 
  mockExecuteJxa,
  setupDefaultJXAMocks,
  MOCK_AI_RESPONSES,
  MOCK_RECORDS,
  createMockRecord 
} from '@tests/mocks/devonthink.js';

// Set up standard AI responses
setupDefaultJXAMocks();

// Create custom mock responses
mockExecuteJxa.mockResolvedValueOnce(MOCK_AI_RESPONSES.chat);
```

### Test Utilities

Common testing patterns and utilities:

```typescript
import { 
  validateToolStructure,
  testToolErrorHandling,
  createAIToolTestSuite,
  AI_TEST_PATTERNS 
} from '@tests/utils/test-helpers.js';

// Validate MCP tool structure
validateToolStructure(myTool);

// Test error handling
await testToolErrorHandling(myTool, input, 'Expected error');

// Use test patterns
const validInput = { 
  recordUuid: AI_TEST_PATTERNS.VALID_UUID 
};
```

### Test Data Patterns

Standard test data for consistency:

```typescript
// Valid UUIDs
AI_TEST_PATTERNS.VALID_UUID
AI_TEST_PATTERNS.INVALID_UUIDS

// XSS test payloads
AI_TEST_PATTERNS.XSS_PAYLOADS

// Valid/invalid prompts
AI_TEST_PATTERNS.VALID_PROMPTS
AI_TEST_PATTERNS.INVALID_PROMPTS
```

## 🔒 Security Testing

### XSS Prevention

All AI tools are tested against XSS attacks:

```typescript
// Automatic XSS testing
validateXSSPrevention(processFunction);

// Manual XSS testing
for (const payload of AI_TEST_PATTERNS.XSS_PAYLOADS) {
  const result = processFunction(payload);
  expect(result).not.toContain('<script>');
}
```

### Input Sanitization

Validation of dangerous input handling:

```typescript
// Test control character removal
const maliciousInput = 'content\x00with\x1fcontrol\x7fchars';
const result = sanitizeInput(maliciousInput);
expect(result).not.toMatch(/[\x00-\x1F\x7F]/);
```

## 📊 Performance Testing

### Execution Time Validation

```typescript
await testPerformance(async () => {
  return await tool.run(input);
}, 5000); // Must complete within 5 seconds
```

### Concurrent Operations

```typescript
await testConcurrentOperations(async () => {
  return await tool.run(input);
}, 5); // Test 5 concurrent executions
```

### Memory Usage

```typescript
// Memory leak detection
const initialMemory = process.memoryUsage().heapUsed;
// ... perform operations
global.gc(); // Force garbage collection
const finalMemory = process.memoryUsage().heapUsed;
expect(finalMemory - initialMemory).toBeLessThan(50 * 1024 * 1024);
```

## 📋 Writing Tests for New AI Tools

### 1. Create Unit Tests

Test the individual components of your AI tool:

```typescript
// tests/tools/ai/myNewTool.test.ts
import { describe, it, expect } from 'vitest';
import { myNewTool } from '@/tools/ai/myNewTool.js';

describe('My New AI Tool', () => {
  it('should validate input correctly', () => {
    const result = myNewTool.validateInput(validInput);
    expect(result.isValid).toBe(true);
  });
  
  it('should handle XSS attempts', () => {
    validateXSSPrevention(myNewTool.processInput);
  });
});
```

### 2. Add Integration Tests

Test the complete tool workflow:

```typescript
// tests/integration/myNewTool-integration.test.ts
describe('My New Tool Integration', () => {
  let tool: Tool;
  
  beforeEach(() => {
    tool = createMyNewTool();
    setupDefaultJXAMocks();
  });
  
  it('should complete full workflow', async () => {
    mockExecuteJxa.mockResolvedValueOnce(expectedResponse);
    
    const result = await tool.run(validInput);
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual(expectedData);
  });
});
```

### 3. Test Error Scenarios

Ensure proper error handling:

```typescript
it('should handle service unavailable', async () => {
  setupAIUnavailableMocks();
  
  const result = await tool.run(input);
  
  expect(result.success).toBe(false);
  expect(result.error).toContain('AI service not available');
});
```

## 🚨 Common Testing Patterns

### Input Validation Testing

```typescript
describe('Input Validation', () => {
  const validInputs = [
    { prompt: 'Valid prompt', engine: 'ChatGPT' },
    { recordUuids: [AI_TEST_PATTERNS.VALID_UUID] }
  ];
  
  const invalidInputs = [
    {}, // Missing required fields
    { prompt: '' }, // Empty prompt
    { recordUuids: ['invalid-uuid'] } // Invalid UUID
  ];
  
  it('should accept valid inputs', () => {
    for (const input of validInputs) {
      const result = validateInput(input);
      expect(result.isValid).toBe(true);
    }
  });
  
  it('should reject invalid inputs', () => {
    for (const input of invalidInputs) {
      const result = validateInput(input);
      expect(result.isValid).toBe(false);
    }
  });
});
```

### Error Handling Testing

```typescript
describe('Error Handling', () => {
  it('should provide helpful error messages', async () => {
    const error = 'DEVONthink is not running';
    const result = await handleError(error, 'chat');
    
    expect(result.success).toBe(false);
    expect(result.error).toBe(
      'DEVONthink is not running. Please start DEVONthink to use AI features.'
    );
    expect(result.suggestions).toContain('Start DEVONthink application');
  });
});
```

### Async Operation Testing

```typescript
describe('Async Operations', () => {
  it('should handle timeouts gracefully', async () => {
    const slowOperation = () => new Promise(resolve => 
      setTimeout(resolve, 10000)
    );
    
    await expect(Promise.race([
      slowOperation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ])).rejects.toThrow('Timeout');
  });
});
```

## 📈 Coverage Requirements

The testing framework enforces minimum coverage requirements:

- **Statements**: 80%
- **Branches**: 75% 
- **Functions**: 80%
- **Lines**: 80%

### Checking Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html

# View coverage for specific files
npm run test:coverage -- --reporter=text tests/tools/ai/utils/
```

## 🐛 Debugging Tests

### Common Debugging Techniques

1. **Use test isolation**:
```typescript
it.only('should debug this specific test', () => {
  // Your test code
});
```

2. **Add debug output**:
```typescript
console.log('Debug info:', JSON.stringify(result, null, 2));
```

3. **Check mock calls**:
```typescript
expect(mockFunction).toHaveBeenCalledTimes(1);
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
```

4. **Use test timeouts**:
```typescript
it('should complete within time limit', async () => {
  // Test code
}, 10000); // 10 second timeout
```

### Troubleshooting Common Issues

**Tests timing out**:
- Check for missing `await` keywords
- Ensure mocks are properly set up
- Add appropriate timeouts for slow operations

**Inconsistent test results**:
- Clear mocks between tests with `vi.clearAllMocks()`
- Avoid test interdependencies
- Use deterministic test data

**Coverage not meeting requirements**:
- Add tests for error paths
- Test all conditional branches
- Include edge cases and boundary conditions

## 🔄 Continuous Integration

The testing framework is designed for CI/CD environments:

### GitHub Actions Example

```yaml
- name: Run Tests
  run: npm test
  
- name: Check Coverage
  run: npm run test:coverage
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Pre-commit Hooks

```bash
# Install husky for pre-commit hooks
npx husky add .husky/pre-commit "npm test"
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Mock Service Worker](https://mswjs.io/) for API mocking
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

## 🤝 Contributing to Tests

When contributing new AI tools or features:

1. **Write tests first** (TDD approach recommended)
2. **Achieve required coverage** (80% minimum)
3. **Test all error scenarios** and edge cases
4. **Include performance tests** for resource-intensive operations
5. **Document test patterns** for future contributors
6. **Update this README** if adding new testing patterns

## ✅ Test Checklist for New AI Tools

- [ ] Unit tests for all utility functions
- [ ] Integration tests for complete workflows  
- [ ] Input validation and XSS prevention
- [ ] Error handling and user messaging
- [ ] Performance and timeout testing
- [ ] Concurrent operation safety
- [ ] Mock data and realistic scenarios
- [ ] Coverage meets minimum requirements
- [ ] Documentation updates included
- [ ] CI/CD pipeline integration verified