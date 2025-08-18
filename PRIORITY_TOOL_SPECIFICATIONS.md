# Priority Tool Specifications: Phase 1 Implementation

## Overview

This document provides detailed implementation specifications for the **15 highest-priority missing tools** that would transform the DEVONthink MCP server from a basic CRUD interface into a comprehensive intelligent document platform.

These tools are prioritized based on:
- **Strategic value** (AI capabilities are DEVONthink's key differentiator)
- **User demand** (most common automation scenarios)  
- **Implementation complexity** (achievable in reasonable timeframe)
- **Foundational impact** (enables other advanced workflows)

## 🚀 Tier 1: AI Intelligence Suite

### 1. `getChatResponseForMessage` - Core AI Chat Integration

**Strategic Importance**: ⭐⭐⭐⭐⭐ (Critical - enables all AI workflows)

#### Tool Specification
```typescript
const GetChatResponseSchema = z.object({
  message: z.string().describe("The chat message or prompt to send to the AI"),
  recordUuids: z.array(z.string().uuid()).optional().describe("UUIDs of records to use as context"),
  mode: z.enum(['append', 'replace', 'context']).optional().default('context').describe("How to use record content"),
  imageData: z.string().optional().describe("Base64 encoded image data for analysis"),
  url: z.string().url().optional().describe("URL for the AI to analyze"),
  model: z.string().optional().describe("Specific AI model to use"),
  role: z.string().optional().describe("Chat role or persona for the AI"),
  engine: z.enum(['ChatGPT', 'Claude', 'Mistral AI', 'GPT4All', 'LM Studio', 'Ollama', 'Gemini'])
    .optional().default('ChatGPT').describe("AI engine to use"),
  temperature: z.number().min(0).max(2).optional().default(0.7).describe("Response creativity (0=deterministic, 2=creative)"),
  outputFormat: z.enum(['text', 'json', 'markdown']).optional().default('text').describe("Response format")
}).strict();
```

#### JXA Implementation Pattern
```javascript
const script = `
  (() => {
    const theApp = Application("DEVONthink");
    theApp.includeStandardAdditions = true;
    
    try {
      const pMessage = ${message ? `"${escapeStringForJXA(message)}"` : "null"};
      const pEngine = ${engine ? `"${escapeStringForJXA(engine)}"` : '"ChatGPT"'};
      const pTemperature = ${temperature || 0.7};
      const pModel = ${model ? `"${escapeStringForJXA(model)}"` : "null"};
      
      // Build options object
      const options = {};
      if (pModel) options["model"] = pModel;
      if (pTemperature !== null) options["temperature"] = pTemperature;
      options["engine"] = pEngine;
      
      // Add record context if provided
      ${recordUuids ? `
      const contextRecords = [];
      ${recordUuids.map(uuid => `
        const record${uuid.replace(/-/g, '')} = theApp.getRecordWithUuid("${uuid}");
        if (record${uuid.replace(/-/g, '')}) contextRecords.push(record${uuid.replace(/-/g, '')});
      `).join('')}
      if (contextRecords.length > 0) {
        options["record"] = contextRecords;
        options["mode"] = "${mode || 'context'}";
      }
      ` : ''}
      
      // Add image or URL if provided
      ${imageData ? `options["image"] = "${imageData}";` : ''}
      ${url ? `options["url"] = "${url}";` : ''}
      
      const response = theApp.getChatResponseForMessage(pMessage, options);
      
      const result = {};
      result["success"] = true;
      result["response"] = response;
      return JSON.stringify(result);
    } catch (error) {
      const errorResult = {};
      errorResult["success"] = false;
      errorResult["error"] = error.toString();
      return JSON.stringify(errorResult);
    }
  })();
`;
```

**Key Features**:
- Multi-model support (ChatGPT, Claude, etc.)
- Document context integration
- Image analysis capability
- URL content analysis
- Configurable creativity levels

**Use Cases**:
- Document Q&A: "Summarize the key findings in these research papers"
- Content analysis: "What are the main themes in my notes from last week?"
- Research assistance: "Based on these documents, what questions should I investigate?"
- Writing support: "Help me write a conclusion based on this data"

---

### 2. `summarizeContentsOf` - Intelligent Document Summarization

**Strategic Importance**: ⭐⭐⭐⭐⭐ (Critical - core knowledge synthesis)

#### Tool Specification
```typescript
const SummarizeContentsSchema = z.object({
  recordUuids: z.array(z.string().uuid()).min(1).describe("UUIDs of records to summarize"),
  destinationGroupUuid: z.string().uuid().optional().describe("Group to create summary in"),
  format: z.enum(['markdown', 'rich', 'plain']).default('markdown').describe("Output format"),
  style: z.enum(['list summary', 'key points summary', 'table summary', 'text summary', 'custom summary'])
    .default('text summary').describe("Summary style"),
  customPrompt: z.string().optional().describe("Custom summarization instructions"),
  maxLength: z.number().optional().describe("Maximum summary length in words"),
  includeSourceReferences: z.boolean().default(true).describe("Include links to source documents")
}).strict();
```

#### JXA Implementation Pattern
```javascript
const script = `
  (() => {
    const theApp = Application("DEVONthink");
    theApp.includeStandardAdditions = true;
    
    try {
      // Get records to summarize
      const records = [];
      ${recordUuids.map(uuid => `
        const record${uuid.replace(/-/g, '')} = theApp.getRecordWithUuid("${uuid}");
        if (record${uuid.replace(/-/g, '')}) records.push(record${uuid.replace(/-/g, '')});
      `).join('')}
      
      if (records.length === 0) {
        const errorResult = {};
        errorResult["success"] = false;
        errorResult["error"] = "No valid records found";
        return JSON.stringify(errorResult);
      }
      
      // Get destination group
      let destinationGroup = null;
      ${destinationGroupUuid ? `
      destinationGroup = theApp.getRecordWithUuid("${destinationGroupUuid}");
      ` : 'destinationGroup = theApp.currentGroup();'}
      
      const summary = theApp.summarizeContentsOf({
        "records": records,
        "to": "${format}",
        ${style !== 'text summary' ? `"as": "${style}",` : ''}
        ${destinationGroupUuid ? '"in": destinationGroup' : ''}
      });
      
      const result = {};
      result["success"] = true;
      if (summary) {
        result["summaryUuid"] = summary.uuid();
        result["summaryId"] = summary.id();
        result["summaryName"] = summary.name();
        ${includeSourceReferences ? `
        // Add source references
        result["sourceRecords"] = records.map(r => ({
          uuid: r.uuid(),
          name: r.name(),
          location: r.location()
        }));
        ` : ''}
      }
      return JSON.stringify(result);
    } catch (error) {
      const errorResult = {};
      errorResult["success"] = false;
      errorResult["error"] = error.toString();
      return JSON.stringify(errorResult);
    }
  })();
`;
```

**Key Features**:
- Multiple summary styles (bullet lists, key points, tables)
- Format flexibility (Markdown, rich text, plain text)
- Source reference tracking
- Custom summarization prompts
- Batch processing of multiple documents

---

### 3. `extractKeywordsFrom` - Intelligent Keyword Extraction

**Strategic Importance**: ⭐⭐⭐⭐ (High - enables auto-tagging and content discovery)

#### Tool Specification
```typescript
const ExtractKeywordsSchema = z.object({
  recordUuid: z.string().uuid().describe("UUID of record to analyze"),
  includeBarcodes: z.boolean().default(false).describe("Extract barcode data"),
  includeExistingTags: z.boolean().default(false).describe("Include current tags"),
  includeHashTags: z.boolean().default(true).describe("Extract hashtag-style keywords"),
  includeImageTags: z.boolean().default(true).describe("Extract keywords from images"),
  maxKeywords: z.number().min(1).max(100).default(20).describe("Maximum keywords to extract"),
  minRelevanceScore: z.number().min(0).max(1).default(0.1).describe("Minimum relevance threshold"),
  autoTag: z.boolean().default(false).describe("Automatically add keywords as tags")
}).strict();
```

**Use Cases**:
- Automatic tagging: "Extract keywords and add as tags"
- Content discovery: "Find related documents by keywords"
- Archive organization: "Analyze and categorize old documents"
- Research support: "Identify key concepts in literature"

---

## 🌐 Tier 2: Web Integration Suite

### 4. `createMarkdownFrom` - Web-to-Markdown Conversion

**Strategic Importance**: ⭐⭐⭐⭐ (High - modern research workflows)

#### Tool Specification
```typescript
const CreateMarkdownFromSchema = z.object({
  url: z.string().url().describe("URL to convert to Markdown"),
  destinationGroupUuid: z.string().uuid().optional().describe("Destination group UUID"),
  name: z.string().optional().describe("Name for the new record"),
  readability: z.boolean().default(true).describe("Clean up and simplify page content"),
  includeImages: z.boolean().default(true).describe("Download and embed images"),
  includeMetadata: z.boolean().default(true).describe("Include page metadata (title, author, date)"),
  userAgent: z.string().optional().describe("Custom user agent string"),
  waitForLoad: z.number().min(0).max(30).default(3).describe("Seconds to wait for page load")
}).strict();
```

#### Key Features
- Clean, readable Markdown output
- Image downloading and embedding
- Metadata extraction (title, author, publication date)
- JavaScript-rendered page support
- Custom user agent for restricted sites

**Use Cases**:
- Research capture: "Save this article as searchable Markdown"
- Documentation: "Convert web docs to local Markdown files"
- Article archival: "Preserve blog posts in readable format"
- Content migration: "Convert web content for offline access"

---

### 5. `downloadJSONFrom` - API Data Integration

**Strategic Importance**: ⭐⭐⭐⭐ (High - enables modern data workflows)

#### Tool Specification
```typescript
const DownloadJSONSchema = z.object({
  url: z.string().url().describe("API endpoint URL"),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET').describe("HTTP method"),
  headers: z.record(z.string()).optional().describe("Custom headers"),
  body: z.string().optional().describe("Request body for POST/PUT"),
  authentication: z.object({
    type: z.enum(['bearer', 'basic', 'apikey']),
    token: z.string(),
    headerName: z.string().optional()
  }).optional().describe("Authentication configuration"),
  timeout: z.number().min(1).max(300).default(30).describe("Request timeout in seconds"),
  createRecord: z.boolean().default(true).describe("Create DEVONthink record from response"),
  destinationGroupUuid: z.string().uuid().optional().describe("Where to save the record")
}).strict();
```

**Use Cases**:
- API integration: "Fetch data from REST APIs"
- Automated reporting: "Download daily metrics from dashboards"
- Data archival: "Preserve API responses for analysis"
- Webhook processing: "Handle incoming data from external systems"

---

## 📥 Tier 3: Import/Export Foundation

### 6. `importPath` - File System Integration

**Strategic Importance**: ⭐⭐⭐⭐ (High - essential for batch workflows)

#### Tool Specification
```typescript
const ImportPathSchema = z.object({
  path: z.string().describe("File or folder path to import"),
  destinationGroupUuid: z.string().uuid().optional().describe("Destination group"),
  recursive: z.boolean().default(true).describe("Import folder contents recursively"),
  preserveStructure: z.boolean().default(true).describe("Maintain folder hierarchy"),
  fileFilter: z.array(z.string()).optional().describe("File extensions to include (e.g., ['.pdf', '.md'])"),
  excludeFilter: z.array(z.string()).optional().describe("Patterns to exclude"),
  nameTemplate: z.string().optional().describe("Template for record names"),
  addTags: z.array(z.string()).optional().describe("Tags to add to imported records"),
  waitForCompletion: z.boolean().default(true).describe("Wait for import to complete")
}).strict();
```

#### Key Features
- Batch file/folder import
- Smart file filtering
- Preserve directory structure
- Template-based naming
- Progress tracking for large imports

**Use Cases**:
- Document migration: "Import entire document libraries"
- Project setup: "Import project files and maintain structure"
- Archive processing: "Batch import scanned documents"
- Automated workflows: "Process dropped files automatically"

---

### 7. `export` - Universal Export System

**Strategic Importance**: ⭐⭐⭐⭐ (High - workflow integration)

#### Tool Specification
```typescript
const ExportSchema = z.object({
  recordUuids: z.array(z.string().uuid()).min(1).describe("Records to export"),
  destinationPath: z.string().describe("Export destination directory"),
  format: z.enum(['original', 'pdf', 'markdown', 'html', 'plaintext', 'rich']).default('original')
    .describe("Export format"),
  preserveStructure: z.boolean().default(true).describe("Maintain group hierarchy"),
  includeMetadata: z.boolean().default(true).describe("Export metadata files"),
  filenameTemplate: z.string().optional().describe("Template for exported filenames"),
  overwrite: z.boolean().default(false).describe("Overwrite existing files")
}).strict();
```

**Use Cases**:
- Publishing: "Export documents for website publication"
- Backup: "Create portable backups of important records"
- Sharing: "Export project files for collaboration"
- Migration: "Move content to other systems"

---

## 🤖 Tier 4: Advanced AI Features

### 8. `summarizeText` - Direct Text Processing

**Strategic Importance**: ⭐⭐⭐ (Medium-High - utility for any text)

#### Tool Specification
```typescript
const SummarizeTextSchema = z.object({
  text: z.string().min(1).describe("Text content to summarize"),
  style: z.enum(['list summary', 'key points summary', 'table summary', 'text summary', 'custom summary'])
    .default('text summary').describe("Summary style"),
  maxLength: z.number().min(10).max(1000).optional().describe("Maximum words in summary"),
  customPrompt: z.string().optional().describe("Custom summarization instructions"),
  language: z.string().optional().describe("Source language (auto-detected if not specified)")
}).strict();
```

**Use Cases**:
- Email processing: "Summarize long email threads"
- Meeting notes: "Extract key points from transcripts"
- Research synthesis: "Condense multiple sources"
- Quick analysis: "Get main points from any text"

---

### 9. `downloadImageForPrompt` - AI Image Generation

**Strategic Importance**: ⭐⭐⭐ (Medium-High - creative workflows)

#### Tool Specification
```typescript
const DownloadImageForPromptSchema = z.object({
  prompt: z.string().min(1).describe("Image generation prompt"),
  engine: z.enum(['DallE2', 'DallE3', 'FluxSchnell', 'FluxPro', 'FluxProUltra', 'Recraft3', 'StableDiffusion'])
    .default('DallE3').describe("AI image engine"),
  size: z.enum(['256x256', '512x512', '1024x1024', '1024x1792', '1792x1024']).default('1024x1024')
    .describe("Image dimensions"),
  style: z.string().optional().describe("Art style specification"),
  quality: z.enum(['standard', 'high']).default('standard').describe("Image quality"),
  destinationGroupUuid: z.string().uuid().optional().describe("Where to save generated image")
}).strict();
```

**Use Cases**:
- Creative projects: "Generate illustrations for documents"
- Presentation materials: "Create visual aids and diagrams"
- Concept visualization: "Turn ideas into visual representations"
- Content creation: "Generate images for blogs and articles"

---

## ⚙️ Tier 5: Automation Foundation

### 10. `performSmartRule` - Rule Automation

**Strategic Importance**: ⭐⭐⭐⭐ (High - enables complex automation)

#### Tool Specification
```typescript
const PerformSmartRuleSchema = z.object({
  ruleName: z.string().optional().describe("Name of specific rule to run"),
  recordUuid: z.string().uuid().optional().describe("Target record for rule execution"),
  trigger: z.enum([
    'no event', 'open event', 'creation event', 'import event',
    'move event', 'rename event', 'tagging event', 'flagging event'
  ]).optional().describe("Event trigger type"),
  waitForCompletion: z.boolean().default(true).describe("Wait for rule completion"),
  dryRun: z.boolean().default(false).describe("Preview rule effects without executing")
}).strict();
```

**Use Cases**:
- Automated organization: "Run filing rules on imported documents"
- Batch processing: "Apply consistent formatting to document sets"
- Workflow triggers: "Execute rules based on external events"
- Maintenance tasks: "Run cleanup and optimization rules"

---

### 11. `addReminder` - Task Management Integration

**Strategic Importance**: ⭐⭐⭐ (Medium-High - productivity workflows)

#### Tool Specification
```typescript
const AddReminderSchema = z.object({
  recordUuid: z.string().uuid().describe("Record to attach reminder to"),
  dueDate: z.string().describe("Due date (ISO 8601 format)"),
  schedule: z.enum(['never', 'once', 'hourly', 'daily', 'weekly', 'monthly', 'yearly'])
    .default('once').describe("Reminder frequency"),
  alarm: z.enum([
    'no alarm', 'dock', 'sound', 'speak', 'notification', 'alert',
    'open internally', 'open externally', 'launch', 'mail with item link',
    'mail with attachment', 'add to reading list', 'embedded script'
  ]).default('notification').describe("Alarm type"),
  message: z.string().optional().describe("Custom reminder message"),
  alarmSound: z.string().optional().describe("Custom sound file for alarm")
}).strict();
```

**Use Cases**:
- Document review: "Remind me to review this contract next week"
- Project deadlines: "Set up milestone reminders"
- Follow-up tasks: "Remind me to follow up on this email"
- Recurring reviews: "Monthly reminder to update this document"

---

## 🔧 Tier 6: Utility & Enhancement

### 12. `createLocation` - Hierarchy Management

**Strategic Importance**: ⭐⭐⭐ (Medium - organizational workflows)

#### Tool Specification
```typescript
const CreateLocationSchema = z.object({
  path: z.string().describe("Group hierarchy path (e.g., '/Projects/2024/Research')"),
  databaseUuid: z.string().uuid().optional().describe("Target database (current if not specified)"),
  createMissing: z.boolean().default(true).describe("Create missing intermediate groups"),
  template: z.string().optional().describe("Template to apply to created groups")
}).strict();
```

### 13. `ocr` - Optical Character Recognition

**Strategic Importance**: ⭐⭐⭐ (Medium - document processing)

#### Tool Specification
```typescript
const OCRSchema = z.object({
  filePath: z.string().describe("Path to image file for OCR"),
  outputFormat: z.enum(['pdf', 'markdown', 'plaintext', 'rich']).default('pdf')
    .describe("Output format for OCR results"),
  language: z.string().default('en').describe("OCR language code"),
  destinationGroupUuid: z.string().uuid().optional().describe("Where to save OCR result"),
  preserveOriginal: z.boolean().default(true).describe("Keep original image file"),
  waitForCompletion: z.boolean().default(true).describe("Wait for OCR to complete")
}).strict();
```

### 14. `addCustomMetaData` - Custom Field Management

**Strategic Importance**: ⭐⭐⭐ (Medium - data management workflows)

#### Tool Specification
```typescript
const AddCustomMetaDataSchema = z.object({
  recordUuid: z.string().uuid().describe("Record to add metadata to"),
  key: z.string().min(1).describe("Metadata key/field name"),
  value: z.union([z.string(), z.number(), z.boolean(), z.string().datetime()])
    .describe("Metadata value"),
  dataType: z.enum(['text', 'number', 'boolean', 'date']).optional()
    .describe("Value data type (auto-detected if not specified)"),
  overwrite: z.boolean().default(true).describe("Overwrite existing value")
}).strict();
```

### 15. `merge` - Document Consolidation

**Strategic Importance**: ⭐⭐⭐ (Medium - document management)

#### Tool Specification
```typescript
const MergeSchema = z.object({
  recordUuids: z.array(z.string().uuid()).min(2).describe("Records to merge"),
  destinationGroupUuid: z.string().uuid().optional().describe("Group for merged result"),
  mergeStrategy: z.enum(['concatenate', 'interleave', 'smart']).default('smart')
    .describe("How to combine content"),
  separator: z.string().default('\n---\n').describe("Content separator"),
  preserveMetadata: z.boolean().default(true).describe("Combine metadata from all sources"),
  deleteOriginals: z.boolean().default(false).describe("Delete source records after merge")
}).strict();
```

## Implementation Priority Matrix

| Tool | Strategic Value | User Demand | Implementation Complexity | Phase |
|------|----------------|-------------|---------------------------|--------|
| `getChatResponseForMessage` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🔧🔧🔧 | 1 |
| `summarizeContentsOf` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🔧🔧 | 1 |
| `extractKeywordsFrom` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🔧🔧 | 1 |
| `createMarkdownFrom` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🔧🔧🔧 | 2 |
| `importPath` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🔧🔧🔧 | 2 |
| `export` | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 🔧🔧 | 2 |
| `downloadJSONFrom` | ⭐⭐⭐⭐ | ⭐⭐⭐ | 🔧🔧 | 2 |
| `performSmartRule` | ⭐⭐⭐⭐ | ⭐⭐⭐ | 🔧🔧🔧🔧 | 3 |
| `addReminder` | ⭐⭐⭐ | ⭐⭐⭐⭐ | 🔧🔧 | 3 |
| `summarizeText` | ⭐⭐⭐ | ⭐⭐⭐ | 🔧 | 1 |
| `downloadImageForPrompt` | ⭐⭐⭐ | ⭐⭐ | 🔧🔧 | 3 |
| `ocr` | ⭐⭐⭐ | ⭐⭐⭐ | 🔧🔧 | 3 |
| `addCustomMetaData` | ⭐⭐⭐ | ⭐⭐⭐ | 🔧 | 3 |
| `createLocation` | ⭐⭐⭐ | ⭐⭐ | 🔧 | 3 |
| `merge` | ⭐⭐⭐ | ⭐⭐ | 🔧🔧 | 3 |

**Legend**: 
- Strategic Value: ⭐ = Low, ⭐⭐⭐⭐⭐ = Critical
- Implementation Complexity: 🔧 = Simple, 🔧🔧🔧🔧 = Complex

## Next Steps

1. **Start with Phase 1 AI tools** (`getChatResponseForMessage`, `summarizeContentsOf`, `extractKeywordsFrom`)
2. **Create comprehensive test suites** for each tool
3. **Document usage patterns** and provide examples
4. **Gather user feedback** early and iterate
5. **Build toward Phase 2** web integration capabilities

This specification provides the foundation for transforming the DEVONthink MCP server into a world-class intelligent document platform.