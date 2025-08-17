# Smart AI Service Detection Implementation

## Overview

This implementation transforms the DEVONthink MCP server from a system that relies on user-provided AI configuration information to one that automatically detects and manages AI services intelligently.

## Key Problem Solved

**Before**: Users had to manually tell the system "I have ChatGPT installed!" and the system made assumptions about what was configured.

**After**: The system automatically detects which AI engines are actually configured in DEVONthink and provides intelligent guidance for setup and usage.

## Core Implementation

### 1. Enhanced AI Availability Checker (`src/tools/ai/utils/aiAvailabilityChecker.ts`)

**Key Discovery**: DEVONthink has a `getChatModelsForEngine(engine)` API method that returns:
- Array of available models if the engine is configured
- Empty array or error if the engine is not configured

**Implementation**:
```typescript
// Real API-based detection instead of assumptions
const models = theApp.getChatModelsForEngine("ChatGPT");
if (models && models.length > 0) {
  availableEngines.push("ChatGPT");
  engineDetails["ChatGPT"] = {
    models: models,
    isConfigured: true
  };
}
```

### 2. Smart Engine Selection (`selectBestEngine()`)

Automatically selects the best available AI engine based on:
- User preference (if specified and available)
- Operation type (chat, summarize, classify, compare)
- Actually configured engines (not assumptions)

**Features**:
- Operation-specific preferences (Claude for summarization, ChatGPT for classification)
- Fallback to any available engine
- User-friendly error messages with alternatives

### 3. Configuration Guidance (`getEngineConfigurationGuide()`)

Provides step-by-step setup instructions with:
- Specific instructions per engine
- Setup time estimates  
- API key sources
- Alternative suggestions

## Updated Tools

### 1. Chat with Knowledge Base (`src/tools/ai/chatWithKnowledgeBase.ts`)

**Before**:
```typescript
engine: z.enum(["ChatGPT", "Claude", "Gemini"]).default("ChatGPT")
```

**After**:
```typescript
engine: z.enum(["ChatGPT", "Claude", "Gemini", "Mistral AI", "GPT4All", "LM Studio", "Ollama"]).optional()

// Smart engine selection
const engineSelection = await selectBestEngine(requestedEngine, "chat");
if (!engineSelection.success) {
  return {
    success: false,
    error: engineSelection.message,
    recommendations: [getEngineConfigurationGuide(requestedEngine)]
  };
}
```

### 2. Summarize Contents (`src/tools/summarizeContents.ts`)

Added proactive AI availability checking:
```typescript
const aiStatus = await checkAIServiceAvailability();
if (!aiStatus.isAvailable) {
  return {
    success: false,
    error: "AI services are not available for summarization"
  };
}
```

### 3. New AI Status Tool (`src/tools/ai/checkAIStatus.ts`)

A diagnostic tool that shows:
- Which engines are configured and available
- Available models per engine
- Setup instructions for unconfigured engines
- Recommended engines for specific operations

## User Experience Improvements

### 1. Automatic Detection
```javascript
// User runs chat tool without specifying engine
{
  "query": "What are my recent documents about?",
  // No engine specified - system auto-detects and selects
}

// System response:
{
  "success": true,
  "response": "Based on your documents...",
  "aiMetadata": {
    "engine": "Claude",
    "engineSelected": "Auto-selected Claude with model claude-3-sonnet for chat."
  }
}
```

### 2. Smart Error Messages
```javascript
// When requested engine isn't configured:
{
  "success": false,
  "error": "Claude isn't configured yet. Available now: ChatGPT, Gemini. To set up Claude, go to DEVONthink > Preferences > AI.",
  "recommendations": [
    "Setup Claude: 1. Open DEVONthink > Preferences > AI\n2. Select Claude tab\n3. Enter Anthropic API key...\n⏱️ Setup time: ~2 minutes"
  ]
}
```

### 3. Configuration Guidance
```javascript
// When no engines are configured:
{
  "success": false,
  "error": "No AI engines are configured. Please set up an AI engine in DEVONthink > Preferences > AI. This usually takes 2-3 minutes and requires an API key for services like ChatGPT or Claude."
}
```

## Benefits

### 1. No More Manual Declaration
- Users don't need to tell the system what they have configured
- System discovers available engines automatically
- Reduces friction and user confusion

### 2. Intelligent Fallbacks
- If user requests unavailable engine, suggests alternatives
- Auto-selects best available engine when none specified
- Operation-specific engine preferences

### 3. Proactive Guidance
- Shows setup instructions for unconfigured engines
- Provides time estimates for configuration
- Suggests quickest setup options

### 4. Better Error Messages
- Specific, actionable error messages
- Context-aware recommendations
- Links to relevant configuration steps

## Technical Implementation Details

### 1. Real API Detection
```typescript
// Uses actual DEVONthink API instead of assumptions
const models = theApp.getChatModelsForEngine(engine);
if (models && models.length > 0) {
  // Engine is configured
} else {
  // Engine is not configured
}
```

### 2. Caching for Performance
```typescript
class AIStatusCache {
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute
  
  // Avoids repeated API calls
}
```

### 3. JXA Compatibility
- Uses bracket notation for object building (JXA requirement)
- Proper error handling without stderr contamination
- Follows established patterns from working tools

## Future Enhancements

### 1. Model-Specific Selection
- Choose best model within an engine for specific tasks
- Cost-aware model selection
- Performance-based recommendations

### 2. Usage Analytics
- Track which engines work best for different operations
- Learn from user preferences
- Adaptive engine selection

### 3. Health Monitoring
- Monitor engine performance and availability
- Automatic failover between engines
- Usage quota tracking

## Testing

### 1. Unit Tests (`tests/tools/ai/checkAIStatus.test.ts`)
- Tests tool functionality with mocked responses
- Validates error handling and edge cases
- Ensures proper configuration guidance

### 2. Demo Script (`examples/ai-detection-demo.js`)
- Live demonstration of detection capabilities
- Shows smart engine selection in action
- Validates real-world usage patterns

## Files Changed/Created

### Modified Files:
- `src/tools/ai/utils/aiAvailabilityChecker.ts` - Enhanced with real API detection
- `src/tools/ai/chatWithKnowledgeBase.ts` - Added smart engine selection
- `src/tools/summarizeContents.ts` - Added AI availability checking
- `src/devonthink.ts` - Added new AI status tool

### New Files:
- `src/tools/ai/checkAIStatus.ts` - AI diagnostic tool
- `tests/tools/ai/checkAIStatus.test.ts` - Test coverage
- `examples/ai-detection-demo.js` - Live demonstration
- `AI_DETECTION_IMPLEMENTATION.md` - This documentation

## Conclusion

This implementation eliminates the friction of AI service setup and usage by:

1. **Automatic Discovery**: Using DEVONthink's actual API to detect configured engines
2. **Smart Selection**: Choosing the best available engine for each operation
3. **Proactive Guidance**: Providing step-by-step setup instructions
4. **Better UX**: Clear, actionable error messages and recommendations

The result is a system that "just works" - users can start using AI features immediately without needing to understand the technical configuration details, while still getting helpful guidance when setup is needed.