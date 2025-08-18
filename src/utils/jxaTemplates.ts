/**
 * JXA Template System - Reusable, tested code fragments
 * 
 * This module provides pre-built, tested code fragments for common operations
 * that can be safely combined to create complex JXA scripts.
 */

import { JXAScriptFragment } from './jxaScriptBuilder.js';

/**
 * Common regex patterns used in document analysis
 */
export const REGEX_PATTERNS = {
  // Theme header patterns (properly escaped for JXA)
  themeHeaders: {
    pattern: '^\\\\d+\\\\.|^[A-Z][^.]*:$|^\\\\*\\\\*.*\\\\*\\\\*$',
    description: 'Matches numbered lists, titles with colons, or bold text markers'
  },
  
  // Quote extraction
  quotedText: {
    pattern: '"([^"]+)"',
    flags: 'g',
    description: 'Extracts text within double quotes'
  },
  
  // Document type detection
  documentTypes: {
    pattern: '\\\\.(pdf|doc|docx|txt|md|rtf|html)$',
    flags: 'i',
    description: 'Matches common document file extensions'
  }
};

/**
 * Template for document collection and validation
 */
export const DocumentCollectionTemplate: JXAScriptFragment = {
  dependencies: [],
  code: `
// Document collection function
const collectTargetDocuments = function() {
  let targetDocuments = [];
  
  // Handle single document lookup
  if (recordUuid || recordId || recordPath) {
    const lookupOptions = {};
    lookupOptions["uuid"] = recordUuid;
    lookupOptions["id"] = recordId;
    lookupOptions["databaseName"] = databaseName;
    lookupOptions["path"] = recordPath;
    
    const lookupResult = getRecord(theApp, lookupOptions);
    
    if (!lookupResult.record) {
      let errorMsg = "Record not found";
      if (recordUuid) {
        errorMsg += " with UUID: " + recordUuid;
      } else if (recordId && databaseName) {
        errorMsg += " with ID " + recordId + " in database: " + databaseName;
      } else if (recordPath) {
        errorMsg += " at path: " + recordPath;
      }
      throw new Error(errorMsg);
    }
    
    const record = lookupResult.record;
    const recordType = record.recordType();
    if (recordType === "group" || recordType === "smart group") {
      throw new Error("Cannot analyze themes for groups directly. Use groupUuid to analyze documents within a group.");
    }
    
    targetDocuments.push(record);
  }
  
  // Handle multiple document UUIDs
  if (recordUuids && recordUuids.length > 0) {
    for (let i = 0; i < recordUuids.length; i++) {
      try {
        const record = theApp.getRecordWithUuid(recordUuids[i]);
        if (record) {
          const recordType = record.recordType();
          if (recordType !== "group" && recordType !== "smart group") {
            targetDocuments.push(record);
          }
        }
      } catch (recordError) {
        // Skip missing records silently
      }
    }
  }
  
  // Handle search query
  if (searchQuery) {
    try {
      const searchOptions = {};
      searchOptions["comparison"] = "phrase";
      
      const searchResults = theApp.search(searchQuery, searchOptions);
      if (searchResults && searchResults.length > 0) {
        const filteredResults = searchResults
          .filter(function(record) {
            const recordType = record.recordType();
            return recordType !== "group" && recordType !== "smart group";
          })
          .slice(0, Math.min(30, searchResults.length));
        
        // Use ES5 compatible array concatenation
        for (let i = 0; i < filteredResults.length; i++) {
          targetDocuments.push(filteredResults[i]);
        }
      }
    } catch (searchError) {
      // Search failures are non-fatal
    }
  }
  
  // Handle group-based analysis
  if (groupUuid) {
    try {
      const groupRecord = theApp.getRecordWithUuid(groupUuid);
      if (!groupRecord) {
        throw new Error("Group not found with UUID: " + groupUuid);
      }
      
      const groupType = groupRecord.recordType();
      if (groupType !== "group" && groupType !== "smart group") {
        throw new Error("UUID does not reference a group: " + groupUuid);
      }
      
      // Recursive document collection
      const getAllDocuments = function(group) {
        const documents = [];
        const children = group.children();
        
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          const childType = child.recordType();
          
          if (childType === "group" || childType === "smart group") {
            const childDocuments = getAllDocuments(child);
            for (let j = 0; j < childDocuments.length; j++) {
              documents.push(childDocuments[j]);
            }
          } else {
            documents.push(child);
          }
        }
        
        return documents;
      };
      
      const groupDocuments = getAllDocuments(groupRecord);
      for (let i = 0; i < groupDocuments.length; i++) {
        targetDocuments.push(groupDocuments[i]);
      }
    } catch (groupError) {
      throw new Error("Error accessing group: " + groupError.toString());
    }
  }
  
  // Remove duplicates and limit for performance
  const uniqueDocuments = [];
  const seenUuids = {};
  
  for (let i = 0; i < targetDocuments.length; i++) {
    const doc = targetDocuments[i];
    const docUuid = doc.uuid();
    
    if (!seenUuids[docUuid]) {
      seenUuids[docUuid] = true;
      uniqueDocuments.push(doc);
    }
  }
  
  // Limit to 50 documents for performance
  if (uniqueDocuments.length > 50) {
    uniqueDocuments.splice(50);
  }
  
  return uniqueDocuments;
};
  `.trim()
};

/**
 * Template for AI analysis execution
 */
export const AIAnalysisTemplate: JXAScriptFragment = {
  code: `
// AI Analysis execution function
const executeAIAnalysis = function(documents, prompt, options) {
  const chatOptions = {};
  chatOptions["engine"] = options.engine || "ChatGPT";
  chatOptions["temperature"] = options.temperature || 0.3;
  chatOptions["as"] = "text";
  chatOptions["record"] = documents;
  chatOptions["mode"] = "context";
  
  const analysisStartTime = Date.now();
  const aiResponse = theApp.getChatResponseForMessage(prompt, chatOptions);
  
  if (!aiResponse) {
    throw new Error("AI service returned no response. Check if AI features are configured and available.");
  }
  
  const analysisEndTime = Date.now();
  const processingTime = analysisEndTime - analysisStartTime;
  
  const result = {};
  result["response"] = aiResponse;
  result["processingTime"] = processingTime;
  return result;
};
  `.trim()
};

/**
 * Template for intelligent theme parsing with content-aware analysis
 * 
 * MAJOR IMPROVEMENT: Replaced crude regex-based parsing with intelligent content analysis
 * - Identifies real themes vs formatting artifacts
 * - Extracts meaningful descriptions, evidence, and sub-themes  
 * - Filters out metadata and document structure elements
 * - Uses confidence scoring and multi-phase validation
 */
export const ThemeParsingTemplate: JXAScriptFragment = {
  code: `
// Intelligent theme parsing function that understands AI response structures
const parseThemesFromResponse = function(aiResponse, maxThemes, includeSubthemes, includeConfidence, includeEvidence) {
  const themes = [];
  
  // Clean and normalize the response
  const cleanResponse = aiResponse
    .replace(/\\r\\n/g, "\\n")
    .replace(/\\r/g, "\\n")
    .replace(/\\n\\s*\\n/g, "\\n\\n"); // Normalize line endings
  
  const responseLines = cleanResponse.split("\\n")
    .map(function(line) { return line.trim(); })
    .filter(function(line) { return line.length > 0; });
  
  // Phase 1: Identify actual theme headers using intelligent pattern recognition
  const identifyThemeHeader = function(line, index, allLines) {
    // Skip obvious formatting artifacts and metadata
    if (line.length < 5 || line.length > 200) return false;
    if (line.indexOf("Source") === 0 && line.indexOf("bracket") > 0) return false;
    if (line.indexOf("•") === 0 && line.indexOf("Sub-theme") > 0) return false;
    if (line.indexOf("Top cross-document") >= 0) return false;
    if (line.indexOf("representative evidence") >= 0) return false;
    if (line.indexOf("Item ID") >= 0 && line.indexOf("p.0") >= 0) return false;
    if (line.indexOf("PDCA") >= 0 && line.indexOf("Kaizen") >= 0) return false;
    
    // Look for numbered themes (highest confidence)
    if (themeHeaderPattern.test(line)) {
      const themePart = line.replace(/^\\d+\\s*[.):]\\s*/, "");
      if (themePart.length > 5 && themePart.length < 100) {
        const result = {};
        result["confidence"] = 0.95;
        result["type"] = "numbered";
        result["title"] = themePart;
        return result;
      }
    }
    
    // Look for header-style themes (bolded or emphasized)
    if (/^\\*\\*.*\\*\\*$/.test(line)) {
      const themePart = line.replace(/^\\*\\*|\\*\\*$/g, "").trim();
      if (themePart.length > 5 && themePart.length < 100 && !/^(\\d+\\.|•)/.test(themePart)) {
        const result = {};
        result["confidence"] = 0.85;
        result["type"] = "emphasized";
        result["title"] = themePart;
        return result;
      }
    }
    
    // Look for capitalized theme titles (medium confidence)
    if (/^[A-Z][A-Za-z\\s&-]+:?$/.test(line) && line.length > 10 && line.length < 80) {
      // Must not be followed by a list or bullet points
      const nextLine = index + 1 < allLines.length ? allLines[index + 1] : "";
      if (!nextLine.startsWith("•") && !nextLine.startsWith("-") && !nextLine.startsWith("*")) {
        const result = {};
        result["confidence"] = 0.75;
        result["type"] = "capitalized";
        result["title"] = line.replace(/:$/, "");
        return result;
      }
    }
    
    // Look for theme-like sentences (lower confidence)
    if (line.length > 15 && line.length < 120) {
      // Check if it contains theme-indicative words
      const themeWords = ["management", "development", "improvement", "quality", "innovation", 
                         "leadership", "strategy", "process", "system", "approach", "method",
                         "collaboration", "communication", "technology", "research", "analysis"];
      
      const hasThemeWords = themeWords.some(function(word) {
        return line.toLowerCase().indexOf(word) >= 0;
      });
      
      if (hasThemeWords && !/^(•|-|\\*)/.test(line) && line.indexOf("(") === -1) {
        const result = {};
        result["confidence"] = 0.6;
        result["type"] = "content";
        result["title"] = line;
        return result;
      }
    }
    
    return false;
  };
  
  // Phase 2: Extract themes with context-aware parsing
  let currentTheme = null;
  let descriptionAccumulator = [];
  
  for (let i = 0; i < responseLines.length && themes.length < maxThemes; i++) {
    const line = responseLines[i];
    const themeMatch = identifyThemeHeader(line, i, responseLines);
    
    if (themeMatch && themeMatch.confidence > 0.65) {
      // Save previous theme if it exists
      if (currentTheme) {
        // Finalize description from accumulator
        if (descriptionAccumulator.length > 0) {
          currentTheme["description"] = descriptionAccumulator.join(" ").substring(0, 500);
        }
        themes.push(currentTheme);
        descriptionAccumulator = [];
      }
      
      // Create new theme with safe object construction
      currentTheme = {};
      currentTheme["theme"] = themeMatch.title.substring(0, 150); // Reasonable limit
      currentTheme["description"] = "";
      currentTheme["frequency"] = themes.length + 1;
      
      if (includeConfidence) {
        currentTheme["confidence"] = themeMatch.confidence;
      }
      
      if (includeSubthemes) {
        currentTheme["subthemes"] = [];
      }
      
      if (includeEvidence) {
        currentTheme["evidence"] = [];
      }
      
    } else if (currentTheme) {
      // Process content lines for current theme
      
      // Check for sub-themes
      if (includeSubthemes && (/^(•|-|\\*)\\s*/.test(line) || /^[a-z]\\)/.test(line))) {
        const subtheme = line.replace(/^(•|-|\\*|[a-z]\\))\\s*/, "").trim();
        if (subtheme.length > 3 && subtheme.length < 100) {
          currentTheme["subthemes"].push(subtheme);
        }
      }
      
      // Extract evidence (quoted text or specific examples)
      if (includeEvidence) {
        // Look for quoted text
        if (line.indexOf('"') >= 0) {
          const matches = line.match(quotedTextPattern);
          if (matches) {
            for (let j = 0; j < matches.length; j++) {
              const evidence = matches[j].replace(/"/g, "");
              if (evidence.length > 10 && evidence.length < 200 && currentTheme["evidence"].length < 5) {
                currentTheme["evidence"].push(evidence);
              }
            }
          }
        }
        
        // Look for example indicators
        if (/^(for example|such as|including|e\\.g\\.|i\\.e\\.)/.test(line.toLowerCase())) {
          const example = line.substring(0, 200);
          if (currentTheme["evidence"].length < 5) {
            currentTheme["evidence"].push(example);
          }
        }
      }
      
      // Accumulate description content (avoid sub-themes and evidence)
      if (line.length > 15 && line.length < 300 && 
          !(/^(•|-|\\*|[a-z]\\))\\s*/.test(line)) && 
          !(line.indexOf('"') >= 0 && includeEvidence) &&
          !(/^(for example|such as|including)/i.test(line))) {
        
        // Skip lines that look like formatting or metadata
        if (line.indexOf("bracket") === -1 && 
            line.indexOf("Item ID") === -1 && 
            line.indexOf("p.0") === -1) {
          descriptionAccumulator.push(line);
        }
      }
    }
  }
  
  // Add the final theme
  if (currentTheme && themes.length < maxThemes) {
    if (descriptionAccumulator.length > 0) {
      currentTheme["description"] = descriptionAccumulator.join(" ").substring(0, 500);
    }
    themes.push(currentTheme);
  }
  
  // Phase 3: Quality validation and enhancement
  const validatedThemes = [];
  for (let i = 0; i < themes.length; i++) {
    const theme = themes[i];
    
    // Validate theme quality
    if (theme["theme"] && theme["theme"].length > 5 && theme["theme"].length < 150) {
      // Ensure reasonable description
      if (!theme["description"] || theme["description"].length < 10) {
        theme["description"] = "This theme appears in the analyzed content but requires additional context for a complete description.";
      }
      
      // Ensure confidence is reasonable
      if (includeConfidence && (!theme["confidence"] || theme["confidence"] < 0.3)) {
        theme["confidence"] = Math.max(0.4, 0.8 - (i * 0.1));
      }
      
      validatedThemes.push(theme);
    }
  }
  
  // Create fallback if no valid themes found
  if (validatedThemes.length === 0) {
    const fallbackTheme = {};
    fallbackTheme["theme"] = "Document Analysis";
    fallbackTheme["description"] = "The AI analysis was completed, but the response format did not contain clearly identifiable themes. This may indicate the need for a more structured analysis prompt.";
    fallbackTheme["frequency"] = 1;
    
    if (includeConfidence) {
      fallbackTheme["confidence"] = 0.5;
    }
    
    if (includeSubthemes) {
      fallbackTheme["subthemes"] = [];
    }
    
    if (includeEvidence) {
      fallbackTheme["evidence"] = [];
    }
    
    validatedThemes.push(fallbackTheme);
  }
  
  return validatedThemes;
};
  `.trim()
};

/**
 * Template for building comprehensive analysis results
 */
export const ResultBuildingTemplate: JXAScriptFragment = {
  code: `
// Result building function with safe object construction
const buildAnalysisResult = function(themes, documents, metadata, analysisType, format) {
  const result = {};
  result["success"] = true;
  
  // Build analysis section
  const analysis = {};
  analysis["mainThemes"] = themes;
  analysis["documentsCovered"] = documents.length;
  analysis["analysisType"] = analysisType;
  
  // Generate summary based on format
  let overallSummary = "";
  if (format === "narrative") {
    overallSummary = "The thematic analysis reveals " + themes.length + " primary themes across " + 
                    documents.length + " documents, providing insights into the conceptual landscape and content patterns.";
  } else {
    overallSummary = "Analysis identified " + themes.length + " main themes from " + 
                    documents.length + " documents using " + analysisType + " analysis.";
  }
  analysis["overallSummary"] = overallSummary;
  
  // Generate conceptual framework
  const conceptualFramework = [];
  if (analysisType === "concepts" || analysisType === "comprehensive") {
    conceptualFramework.push("Conceptual");
  }
  if (analysisType === "topics" || analysisType === "comprehensive") {
    conceptualFramework.push("Topical");
  }
  if (analysisType === "sentiment" || analysisType === "comprehensive") {
    conceptualFramework.push("Attitudinal");
  }
  analysis["conceptualFramework"] = conceptualFramework;
  
  result["analysis"] = analysis;
  
  // Build document information
  const processedDocuments = [];
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const docInfo = {};
    docInfo["uuid"] = doc.uuid();
    docInfo["name"] = doc.name();
    
    if (themes.length > 0) {
      const primaryTheme = themes[0].theme;
      docInfo["contribution"] = "Contributes to " + primaryTheme + " and related themes";
    } else {
      docInfo["contribution"] = "Analyzed for thematic content";
    }
    
    processedDocuments.push(docInfo);
  }
  result["documents"] = processedDocuments;
  
  // Add metadata
  const resultMetadata = {};
  resultMetadata["processingTime"] = metadata.processingTime || 0;
  resultMetadata["themeCount"] = themes.length;
  resultMetadata["documentCount"] = documents.length;
  result["metadata"] = resultMetadata;
  
  // Generate recommendations
  const recommendations = [];
  if (themes.length >= 3) {
    recommendations.push("Consider creating folders based on the identified themes");
    recommendations.push("Use theme keywords as tags for better document organization");
  }
  if (conceptualFramework.length > 1) {
    recommendations.push("Group related themes into higher-level categories");
  }
  if (documents.length > 10) {
    recommendations.push("Consider analyzing subsets of documents for more focused insights");
  }
  
  if (recommendations.length > 0) {
    result["recommendations"] = recommendations;
  }
  
  // Generate warnings
  const warnings = [];
  if (metadata.processingTime > 30000) {
    warnings.push("Analysis took longer than expected. Consider reducing document count or analysis depth.");
  }
  if (documents.length > 30) {
    warnings.push("Large document set analyzed. Results may be more general than specific.");
  }
  
  if (warnings.length > 0) {
    result["warnings"] = warnings;
  }
  
  return result;
};
  `.trim()
};

/**
 * Helper to get all available templates
 */
export function getAllTemplates(): { [key: string]: JXAScriptFragment } {
  return {
    documentCollection: DocumentCollectionTemplate,
    aiAnalysis: AIAnalysisTemplate,
    themeParsing: ThemeParsingTemplate,
    resultBuilding: ResultBuildingTemplate
  };
}

/**
 * Helper to create analysis prompt based on parameters
 * 
 * IMPROVED: Enhanced prompt engineering for better AI responses that are easier to parse
 */
export function createAnalysisPrompt(
  analysisType: string,
  themeDepth: string,
  format: string,
  includeSubthemes: boolean,
  includeEvidence: boolean,
  maxThemes: number
): string {
  let basePrompt = "";
  
  // Create analysis-type specific prompts with clear output format requirements
  if (analysisType === "concepts") {
    basePrompt = "Analyze the following documents to identify the main conceptual themes, abstract ideas, and intellectual frameworks. Focus on high-level concepts, theoretical approaches, and underlying principles that connect the content.";
  } else if (analysisType === "topics") {
    basePrompt = "Identify the primary topics, subject areas, and domains covered in these documents. Focus on specific areas of knowledge, fields of study, and practical subjects discussed.";
  } else if (analysisType === "sentiment") {
    basePrompt = "Analyze the emotional themes, attitudes, and perspectives expressed in these documents. Identify the overall sentiment, emotional patterns, and attitudinal frameworks present in the content.";
  } else if (analysisType === "comprehensive") {
    basePrompt = "Perform a comprehensive thematic analysis covering conceptual frameworks, topical domains, and emotional/attitudinal themes. Provide a holistic view of the thematic landscape across all dimensions.";
  }
  
  // Build structured output format instructions
  let formatInstructions = "";
  
  if (format === "structured") {
    formatInstructions = `\\n\\nPRESENT YOUR ANALYSIS IN THIS EXACT FORMAT:

1. [First Theme Title]
[Detailed description of the theme in 2-3 sentences explaining what it represents and why it's significant.]`;
    
    if (includeSubthemes) {
      formatInstructions += `
• Sub-theme: [Name of sub-theme]
• Sub-theme: [Name of another sub-theme]`;
    }
    
    if (includeEvidence) {
      formatInstructions += `
Supporting evidence: "Quote or example from the document" and "Another piece of evidence"`;
    }
    
    formatInstructions += `

2. [Second Theme Title]  
[Detailed description of this theme and its significance to the overall content.]`;
    
    if (includeSubthemes) {
      formatInstructions += `
• Sub-theme: [Related concept]`;
    }
    
    if (includeEvidence) {
      formatInstructions += `
Supporting evidence: "Relevant quote or example"`;
    }
    
    formatInstructions += `

[Continue this pattern for all themes...]`;
    
  } else if (format === "narrative") {
    formatInstructions = `\\n\\nPRESENT AS A FLOWING NARRATIVE with clear theme headers:

**Theme 1: [Theme Title]**
[Narrative description explaining this theme and its significance...]`;
    
    if (includeEvidence) {
      formatInstructions += ` As evidenced by "[specific quote]" and demonstrated through [specific examples].`;
    }
    
    formatInstructions += `

**Theme 2: [Theme Title]**  
[Continue with narrative flow connecting themes...]`;
    
  } else if (format === "hierarchical") {
    formatInstructions = `\\n\\nPRESENT IN HIERARCHICAL FORMAT:

1. **[Main Theme Category]**
   Description: [What this overarching theme represents]
   
   1.1 [Sub-theme A]
   - Description and significance
   
   1.2 [Sub-theme B] 
   - Description and significance
   
2. **[Second Main Theme Category]**
   Description: [Explanation of this theme]
   
   2.1 [Related sub-theme]
   - Details and context`;
  }
  
  // Add depth-specific instructions
  let depthInstructions = "";
  if (themeDepth === "deep") {
    depthInstructions = " Provide detailed analysis with rich descriptions, contextual understanding, and connections between themes.";
  } else if (themeDepth === "comprehensive") {
    depthInstructions = " Conduct an exhaustive analysis with detailed explanations, contextual relationships, comprehensive coverage of all identifiable themes, and deep insights into their interconnections.";
  } else {
    depthInstructions = " Provide clear, concise analysis focusing on the most prominent themes.";
  }
  
  // Add evidence and sub-theme instructions
  let additionalInstructions = "";
  if (includeSubthemes && !formatInstructions.includes("Sub-theme")) {
    additionalInstructions += " Include related sub-themes and show how they relate to the main themes.";
  }
  
  if (includeEvidence && !formatInstructions.includes("evidence")) {
    additionalInstructions += " For each theme, include specific examples, quotes, or evidence from the documents that support the identification of that theme.";
  }
  
  // Quality instructions to prevent common parsing issues
  const qualityInstructions = `\\n\\nIMPORTANT FORMATTING GUIDELINES:
- Use clear, descriptive theme titles (not generic labels)
- Each theme should have a meaningful description
- Avoid including document metadata or formatting instructions in your analysis
- Focus on actual content themes, not document structure
- Limit to the top ${maxThemes} most significant themes
- Make each theme title distinct and specific`;
  
  // Combine all parts
  return basePrompt + depthInstructions + additionalInstructions + formatInstructions + qualityInstructions;
}