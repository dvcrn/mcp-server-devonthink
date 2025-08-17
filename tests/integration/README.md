# Integration Tests for AI Tools

This directory contains integration tests that validate the complete workflow of AI tools from input validation through JXA script execution to result processing.

## Test Structure

### `ai-tool-integration.test.ts`
Comprehensive integration tests that cover:
- **Full AI Tool Workflows**: End-to-end testing of chat, summarization, classification, and comparison tools
- **Error Scenarios**: Testing behavior when DEVONthink is unavailable, AI services are down, or malformed responses occur
- **Performance Tests**: Validating behavior under load and with large inputs
- **Concurrent Execution**: Testing multiple simultaneous AI operations

## Test Categories

### 1. Chat Tool Integration
Tests the complete chat workflow including:
- Prompt-only interactions
- Context-aware conversations with record content
- Different AI engines and parameters
- Input validation failures

### 2. Summarization Tool Integration  
Tests document summarization including:
- Single and multiple document summarization
- Custom destination groups
- Different output formats (markdown, text, etc.)
- Handling of missing or invalid records

### 3. Classification Tool Integration
Tests AI-powered document classification:
- Category and tag suggestions
- Database-scoped classification
- Confidence scoring
- Empty result handling

### 4. Comparison Tool Integration
Tests document similarity and comparison:
- Direct document comparison
- Similarity search across databases
- Scoring and ranking of results
- No-match scenarios

## Error Scenarios Tested

- **DEVONthink Not Running**: Validates proper error messages and user guidance
- **AI Services Unavailable**: Tests fallback behavior and error reporting
- **Malformed Responses**: Ensures graceful handling of unexpected JXA results
- **Network Timeouts**: Tests timeout handling and retry logic
- **Invalid Input Data**: Validates input validation and sanitization

## Performance Testing

- **Large Input Handling**: Tests with substantial prompts and many records
- **Concurrent Operations**: Validates thread safety and resource management
- **Execution Time Tracking**: Ensures accurate performance metrics
- **Memory Usage**: Tests for memory leaks and efficient resource usage

## How to Run Integration Tests

```bash
# Run all integration tests
npm test tests/integration/

# Run specific integration test file
npm test tests/integration/ai-tool-integration.test.ts

# Run with coverage
npm run test:coverage -- tests/integration/
```

## Adding New Integration Tests

When adding AI tools, create integration tests that cover:

1. **Happy Path**: Test successful operation with typical inputs
2. **Edge Cases**: Test boundary conditions and unusual inputs  
3. **Error Handling**: Test all failure modes and error responses
4. **Performance**: Test with realistic data sizes and loads

### Template for New AI Tool Integration Test

```typescript
describe('New AI Tool Integration', () => {
  let newTool: Tool;

  beforeEach(() => {
    newTool = createSimpleAITool(
      'integration_new_tool',
      'Integration test for new tool',
      'your_operation_type',
      (input) => buildYourScript(input)
    );
  });

  it('should complete successful operation', async () => {
    const mockResponse = {
      success: true,
      operationType: 'your_operation_type',
      // ... expected response fields
    };

    mockExecuteJxa.mockResolvedValueOnce(mockResponse);

    const result = await newTool.run({
      // ... valid input parameters
    });

    expect(result.success).toBe(true);
    // ... validate specific response fields
  });

  it('should handle error scenarios', async () => {
    // Test error conditions specific to your tool
  });
});
```

## Mock Data Usage

Integration tests use comprehensive mock data from `@tests/mocks/devonthink.js`:

- **MOCK_AI_RESPONSES**: Standard AI service responses
- **MOCK_RECORDS**: Sample DEVONthink records
- **MOCK_DATABASES**: Sample database structures
- **Mock Functions**: Utilities for creating dynamic test data

## Best Practices

1. **Test Real Workflows**: Focus on complete user scenarios, not just individual functions
2. **Use Realistic Data**: Test with data that resembles actual usage patterns
3. **Validate Complete Responses**: Check all response fields, not just success/failure
4. **Test Error Recovery**: Ensure proper error messages and recovery suggestions
5. **Performance Awareness**: Set reasonable timeout expectations and validate execution times
6. **Concurrent Safety**: Test tools under concurrent execution when applicable

## Debugging Integration Tests

- Use `vi.spyOn()` to inspect function calls and parameters
- Add temporary `console.log()` statements to trace execution flow  
- Check mock function call counts with `expect(mockFn).toHaveBeenCalledTimes()`
- Validate mock parameters with `expect(mockFn).toHaveBeenCalledWith()`
- Use test timeouts appropriately for async operations

## Integration with CI/CD

These integration tests are designed to run in CI environments without requiring actual DEVONthink installation:

- All DEVONthink interactions are mocked
- No external API calls are made
- Tests run consistently across different environments
- Performance tests use reasonable timeouts for CI systems