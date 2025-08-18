/**
 * JXA script builder for AI operations in DEVONthink
 * Provides reusable templates and builders for common AI operations
 */

import { escapeStringForJXA, formatValueForJXA } from "../../../utils/escapeString.js";
import { getRecordLookupHelpers, getDatabaseHelper } from "../../../utils/jxaHelpers.js";
import type { AIEngine, OutputFormat, AIMode } from "./aiValidation.js";

/**
 * Options for building AI operation scripts
 */
export interface AIScriptOptions {
  engine?: AIEngine;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  outputFormat?: OutputFormat;
  timeout?: number;
  systemPrompt?: string;
  customOptions?: Record<string, any>;
}

/**
 * Options for record-based AI operations
 */
export interface RecordAIScriptOptions extends AIScriptOptions {
  recordUuids?: string[];
  recordIds?: number[];
  databaseName?: string;
  mode?: AIMode;
  maxRecords?: number;
}

/**
 * Common JXA helper functions specific to AI operations
 */
export const AI_JXA_HELPERS = `
// AI-specific helper functions
function validateAIService(theApp) {
  // Check if DEVONthink is running
  if (!theApp.running()) {
    throw new Error("DEVONthink is not running");
  }
  
  // Additional AI service checks can be added here
  return true;
}

function buildAIOptions(config) {
  const options = {};
  
  if (config.engine) options["engine"] = config.engine;
  if (config.model) options["model"] = config.model;
  if (config.temperature !== undefined && config.temperature !== null) {
    options["temperature"] = config.temperature;
  }
  if (config.maxTokens) options["maxTokens"] = config.maxTokens;
  if (config.outputFormat && config.outputFormat !== "text") {
    options["as"] = config.outputFormat;
  }
  if (config.systemPrompt) options["systemPrompt"] = config.systemPrompt;
  
  // Add any custom options
  if (config.customOptions) {
    Object.keys(config.customOptions).forEach(key => {
      options[key] = config.customOptions[key];
    });
  }
  
  return options;
}

function getRecordsForAI(theApp, config) {
  const records = [];
  const recordInfo = [];
  let validRecordsCount = 0;
  
  // Get records by UUID (preferred method)
  if (config.recordUuids && config.recordUuids.length > 0) {
    config.recordUuids.forEach((uuid, index) => {
      try {
        const record = theApp.getRecordWithUuid(uuid);
        if (record) {
          records.push(record);
          
          // Store record information for result processing
          const info = {};
          info["uuid"] = record.uuid();
          info["id"] = record.id();
          info["name"] = record.name();
          info["location"] = record.location();
          info["type"] = record.recordType();
          recordInfo.push(info);
          
          validRecordsCount++;
          
          // Respect max records limit
          if (config.maxRecords && validRecordsCount >= config.maxRecords) {
            return;
          }
        }
      } catch (error) {
        // Continue with other records
      }
    });
  }
  
  // Get records by ID if UUIDs not provided
  if (records.length === 0 && config.recordIds && config.recordIds.length > 0) {
    // Need database for ID lookups
    const database = config.databaseName ? 
      getDatabase(theApp, config.databaseName) : 
      theApp.currentDatabase();
      
    if (!database) {
      throw new Error("Database not found or no current database available");
    }
    
    config.recordIds.forEach((id, index) => {
      try {
        const record = theApp.getRecordWithId(id);
        if (record && record.database().uuid() === database.uuid()) {
          records.push(record);
          
          const info = {};
          info["uuid"] = record.uuid();
          info["id"] = record.id();
          info["name"] = record.name();
          info["location"] = record.location();
          info["type"] = record.recordType();
          recordInfo.push(info);
          
          validRecordsCount++;
          
          if (config.maxRecords && validRecordsCount >= config.maxRecords) {
            return;
          }
        }
      } catch (error) {
        // Continue with other records
      }
    });
  }
  
  return {
    records: records,
    recordInfo: recordInfo,
    count: validRecordsCount
  };
}

function handleAIResponse(response, operationType, context) {
  const result = {};
  
  if (!response) {
    result["success"] = false;
    result["error"] = "AI service returned no response. Check if AI features are configured and available.";
    return result;
  }
  
  result["success"] = true;
  result["response"] = response;
  result["operationType"] = operationType;
  
  // Add context information
  if (context) {
    if (context.recordInfo && context.recordInfo.length > 0) {
      result["sourceRecords"] = context.recordInfo;
      result["recordCount"] = context.recordInfo.length;
    }
    
    if (context.engine) result["engine"] = context.engine;
    if (context.model) result["model"] = context.model;
    if (context.outputFormat) result["outputFormat"] = context.outputFormat;
  }
  
  return result;
}
`;

/**
 * Builds the base JXA script structure for AI operations
 */
export function buildBaseAIScript(
  operationType: string,
  scriptBody: string,
  includeHelpers: boolean = true
): string {
  return `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      ${includeHelpers ? `
      // Inject helper functions
      ${getRecordLookupHelpers()}
      ${getDatabaseHelper}
      ${AI_JXA_HELPERS}
      ` : ''}
      
      try {
        // Validate AI service availability
        validateAIService(theApp);
        
        ${scriptBody}
        
      } catch (error) {
        const errorResult = {};
        errorResult["success"] = false;
        errorResult["error"] = error.toString();
        errorResult["operationType"] = "${escapeStringForJXA(operationType)}";
        return JSON.stringify(errorResult);
      }
    })();
  `;
}

/**
 * Builds a chat/prompt-based AI script
 */
export function buildChatScript(
  prompt: string,
  options: RecordAIScriptOptions = {}
): string {
  const {
    recordUuids = [],
    recordIds = [],
    databaseName,
    mode = 'context',
    engine = 'ChatGPT',
    model,
    temperature = 0.7,
    outputFormat = 'text',
    systemPrompt,
    maxRecords = 10,
    customOptions = {}
  } = options;

  const scriptBody = `
    // Define configuration
    const config = {
      engine: "${engine}",
      ${model ? `model: "${escapeStringForJXA(model)}",` : ''}
      temperature: ${temperature},
      outputFormat: "${outputFormat}",
      ${systemPrompt ? `systemPrompt: "${escapeStringForJXA(systemPrompt)}",` : ''}
      recordUuids: [${recordUuids.map(uuid => `"${escapeStringForJXA(uuid)}"`).join(', ')}],
      recordIds: [${recordIds.join(', ')}],
      ${databaseName ? `databaseName: "${escapeStringForJXA(databaseName)}",` : ''}
      mode: "${mode}",
      maxRecords: ${maxRecords},
      customOptions: ${JSON.stringify(customOptions)}
    };
    
    // Build AI options
    const aiOptions = buildAIOptions(config);
    
    // Get records if specified
    let recordsData = null;
    if (config.recordUuids.length > 0 || config.recordIds.length > 0) {
      recordsData = getRecordsForAI(theApp, config);
      
      if (recordsData.count === 0) {
        const errorResult = {};
        errorResult["success"] = false;
        errorResult["error"] = "No valid records found with provided identifiers";
        errorResult["operationType"] = "chat";
        return JSON.stringify(errorResult);
      }
      
      // Add records to AI options based on mode
      aiOptions["record"] = recordsData.records;
      aiOptions["mode"] = config.mode;
    }
    
    // Execute AI request
    const prompt = "${escapeStringForJXA(prompt)}";
    const aiResponse = theApp.getChatResponseForMessage(prompt, aiOptions);
    
    // Process and return result
    const context = {
      recordInfo: recordsData ? recordsData.recordInfo : null,
      engine: config.engine,
      model: config.model,
      outputFormat: config.outputFormat
    };
    
    const result = handleAIResponse(aiResponse, "chat", context);
    return JSON.stringify(result);
  `;

  return buildBaseAIScript('chat', scriptBody);
}

/**
 * Builds a summarization AI script
 */
export function buildSummarizeScript(
  recordUuids: string[],
  destinationGroupUuid?: string,
  options: AIScriptOptions = {}
): string {
  const {
    engine = 'ChatGPT',
    model,
    outputFormat = 'markdown',
    customOptions = {}
  } = options;

  const scriptBody = `
    // Get records to summarize
    const recordsToSummarize = [];
    const sourceRecordInfo = [];
    let validRecordsCount = 0;
    
    ${recordUuids.map((uuid, index) => `
    try {
      const record${index} = theApp.getRecordWithUuid("${escapeStringForJXA(uuid)}");
      if (record${index}) {
        recordsToSummarize.push(record${index});
        
        const recordInfo = {};
        recordInfo["uuid"] = record${index}.uuid();
        recordInfo["id"] = record${index}.id();
        recordInfo["name"] = record${index}.name();
        recordInfo["location"] = record${index}.location();
        recordInfo["type"] = record${index}.recordType();
        sourceRecordInfo.push(recordInfo);
        
        validRecordsCount++;
      }
    } catch (recordError) {
      // Continue with other records
    }
    `).join('')}
    
    if (recordsToSummarize.length === 0) {
      const errorResult = {};
      errorResult["success"] = false;
      errorResult["error"] = "No valid records found for summarization";
      errorResult["operationType"] = "summarize";
      return JSON.stringify(errorResult);
    }
    
    // Get destination group
    let destinationGroup = null;
    ${destinationGroupUuid ? `
    try {
      destinationGroup = theApp.getRecordWithUuid("${escapeStringForJXA(destinationGroupUuid)}");
      if (!destinationGroup) {
        const errorResult = {};
        errorResult["success"] = false;
        errorResult["error"] = "Destination group not found with UUID: ${escapeStringForJXA(destinationGroupUuid)}";
        errorResult["operationType"] = "summarize";
        return JSON.stringify(errorResult);
      }
    } catch (groupError) {
      const errorResult = {};
      errorResult["success"] = false;
      errorResult["error"] = "Error accessing destination group: " + groupError.toString();
      errorResult["operationType"] = "summarize";
      return JSON.stringify(errorResult);
    }
    ` : `
    // Use current group as default
    destinationGroup = theApp.currentGroup();
    if (!destinationGroup) {
      destinationGroup = theApp.currentDatabase().root();
    }
    `}
    
    // Build summarization options
    const summaryOptions = {};
    summaryOptions["records"] = recordsToSummarize;
    summaryOptions["to"] = "${outputFormat}";
    ${engine !== 'ChatGPT' ? `summaryOptions["engine"] = "${engine}";` : ''}
    ${model ? `summaryOptions["model"] = "${escapeStringForJXA(model)}";` : ''}
    
    if (destinationGroup) {
      summaryOptions["in"] = destinationGroup;
    }
    
    // Add custom options
    const customOpts = ${JSON.stringify(customOptions)};
    Object.keys(customOpts).forEach(key => {
      summaryOptions[key] = customOpts[key];
    });
    
    // Execute summarization
    const summary = theApp.summarizeContentsOf(summaryOptions);
    
    if (!summary) {
      const errorResult = {};
      errorResult["success"] = false;
      errorResult["error"] = "Failed to create summary. Check if AI features are configured and available.";
      errorResult["operationType"] = "summarize";
      return JSON.stringify(errorResult);
    }
    
    // Build result
    const result = {};
    result["success"] = true;
    result["operationType"] = "summarize";
    result["summaryUuid"] = summary.uuid();
    result["summaryId"] = summary.id();
    result["summaryName"] = summary.name();
    result["summaryLocation"] = summary.location();
    result["sourceRecords"] = sourceRecordInfo;
    result["recordCount"] = validRecordsCount;
    result["engine"] = "${engine}";
    result["outputFormat"] = "${outputFormat}";
    
    // Add word count if available
    try {
      const wordCount = summary.wordCount();
      if (wordCount && wordCount > 0) {
        result["wordCount"] = wordCount;
      }
    } catch (wcError) {
      // Word count not critical
    }
    
    return JSON.stringify(result);
  `;

  return buildBaseAIScript('summarize', scriptBody);
}

/**
 * Builds a classification AI script
 */
export function buildClassifyScript(
  recordUuid: string,
  options: AIScriptOptions & {
    databaseName?: string;
    comparison?: 'data comparison' | 'tags comparison';
    tags?: boolean;
  } = {}
): string {
  const {
    databaseName,
    comparison,
    tags = false,
    engine = 'ChatGPT',
    model
  } = options;

  const scriptBody = `
    // Get target database
    const targetDatabase = getDatabase(theApp, ${databaseName ? `"${escapeStringForJXA(databaseName)}"` : "null"});

    // Get record to classify
    const targetRecord = theApp.getRecordWithUuid("${escapeStringForJXA(recordUuid)}");
    if (!targetRecord) {
      const errorResult = {};
      errorResult["success"] = false;
      errorResult["error"] = "Record not found with UUID: ${escapeStringForJXA(recordUuid)}";
      errorResult["operationType"] = "classify";
      return JSON.stringify(errorResult);
    }
    
    // Build classify options
    const classifyOptions = {};
    classifyOptions["record"] = targetRecord;
    
    if (targetDatabase) {
      classifyOptions["in"] = targetDatabase;
    }
    ${comparison ? `classifyOptions["comparison"] = "${comparison}";` : ''}
    ${tags ? `classifyOptions["tags"] = true;` : ''}
    ${engine !== 'ChatGPT' ? `classifyOptions["engine"] = "${engine}";` : ''}
    ${model ? `classifyOptions["model"] = "${escapeStringForJXA(model)}";` : ''}
    
    // Perform classification
    const classifyResults = theApp.classify(classifyOptions);
    
    if (!classifyResults || classifyResults.length === 0) {
      const result = {};
      result["success"] = true;
      result["operationType"] = "classify";
      result["proposals"] = [];
      result["totalCount"] = 0;
      result["recordUuid"] = targetRecord.uuid();
      result["engine"] = "${engine}";
      return JSON.stringify(result);
    }
    
    // Process proposals
    const proposals = classifyResults.map(proposal => {
      const proposalResult = {};
      proposalResult["name"] = proposal.name();
      proposalResult["type"] = proposal.recordType ? proposal.recordType() : "group";
      
      // Add location if available
      try {
        if (proposal.location) {
          proposalResult["location"] = proposal.location();
        }
      } catch (e) {
        // Location might not be available
      }
      
      // Add score if available
      try {
        if (proposal.score && proposal.score() !== undefined) {
          proposalResult["score"] = proposal.score();
        }
      } catch (e) {
        // Score might not be available
      }
      
      return proposalResult;
    });
    
    const result = {};
    result["success"] = true;
    result["operationType"] = "classify";
    result["proposals"] = proposals;
    result["totalCount"] = classifyResults.length;
    result["recordUuid"] = targetRecord.uuid();
    result["engine"] = "${engine}";
    ${model ? `result["model"] = "${escapeStringForJXA(model)}";` : ''}
    
    return JSON.stringify(result);
  `;

  return buildBaseAIScript('classify', scriptBody);
}

/**
 * Builds a comparison/similarity AI script
 */
export function buildCompareScript(
  recordUuid: string,
  targetRecordUuid?: string,
  options: AIScriptOptions & {
    databaseName?: string;
    maxResults?: number;
  } = {}
): string {
  const {
    databaseName,
    maxResults = 10,
    engine = 'ChatGPT',
    model
  } = options;

  const scriptBody = `
    // Get source record
    const sourceRecord = theApp.getRecordWithUuid("${escapeStringForJXA(recordUuid)}");
    if (!sourceRecord) {
      const errorResult = {};
      errorResult["success"] = false;
      errorResult["error"] = "Source record not found with UUID: ${escapeStringForJXA(recordUuid)}";
      errorResult["operationType"] = "compare";
      return JSON.stringify(errorResult);
    }
    
    // Build compare options
    const compareOptions = {};
    compareOptions["record"] = sourceRecord;
    
    ${targetRecordUuid ? `
    // Get specific target record for comparison
    const targetRecord = theApp.getRecordWithUuid("${escapeStringForJXA(targetRecordUuid)}");
    if (!targetRecord) {
      const errorResult = {};
      errorResult["success"] = false;
      errorResult["error"] = "Target record not found with UUID: ${escapeStringForJXA(targetRecordUuid)}";
      errorResult["operationType"] = "compare";
      return JSON.stringify(errorResult);
    }
    compareOptions["to"] = targetRecord;
    ` : `
    // Find similar records in database
    ${databaseName ? `
    const targetDatabase = getDatabase(theApp, "${escapeStringForJXA(databaseName)}");
    if (targetDatabase) {
      compareOptions["in"] = targetDatabase;
    }
    ` : ''}
    compareOptions["maxResults"] = ${maxResults};
    `}
    
    ${engine !== 'ChatGPT' ? `compareOptions["engine"] = "${engine}";` : ''}
    ${model ? `compareOptions["model"] = "${escapeStringForJXA(model)}";` : ''}
    
    // Execute comparison
    const compareResults = theApp.compareTo(compareOptions);
    
    if (!compareResults) {
      const errorResult = {};
      errorResult["success"] = false;
      errorResult["error"] = "AI comparison failed. Check if AI features are configured and available.";
      errorResult["operationType"] = "compare";
      return JSON.stringify(errorResult);
    }
    
    // Process results
    let processedResults;
    
    ${targetRecordUuid ? `
    // Direct comparison result
    processedResults = {
      similarity: compareResults.similarity || 0,
      analysis: compareResults.analysis || "No analysis available",
      sourceRecord: {
        uuid: sourceRecord.uuid(),
        name: sourceRecord.name(),
        location: sourceRecord.location()
      },
      targetRecord: {
        uuid: targetRecord.uuid(),
        name: targetRecord.name(),
        location: targetRecord.location()
      }
    };
    ` : `
    // Similar records list
    processedResults = {
      similarRecords: compareResults.map(record => ({
        uuid: record.uuid(),
        id: record.id(),
        name: record.name(),
        location: record.location(),
        similarity: record.similarity || 0
      })),
      sourceRecord: {
        uuid: sourceRecord.uuid(),
        name: sourceRecord.name(),
        location: sourceRecord.location()
      }
    };
    `}
    
    const result = {};
    result["success"] = true;
    result["operationType"] = "compare";
    result["results"] = processedResults;
    result["engine"] = "${engine}";
    ${model ? `result["model"] = "${escapeStringForJXA(model)}";` : ''}
    
    return JSON.stringify(result);
  `;

  return buildBaseAIScript('compare', scriptBody);
}

/**
 * Utility function to escape and format values for JXA script interpolation
 */
export function formatAIScriptValue(value: any): string {
  if (value === undefined || value === null) {
    return "null";
  }
  
  if (typeof value === "string") {
    return `"${escapeStringForJXA(value)}"`;
  }
  
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  
  if (Array.isArray(value)) {
    return `[${value.map(formatAIScriptValue).join(', ')}]`;
  }
  
  if (typeof value === "object") {
    const pairs = Object.entries(value).map(([k, v]) => `"${escapeStringForJXA(k)}": ${formatAIScriptValue(v)}`);
    return `{${pairs.join(', ')}}`;
  }
  
  return `"${escapeStringForJXA(String(value))}"`;
}