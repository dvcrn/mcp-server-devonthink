/**
 * Simple AI Service Checker
 * 
 * Provides lightweight, reliable AI service checking following the proven pattern 
 * of working tools like isRunning.ts and search.ts. This replaces the complex
 * multilayer checking that was causing false "DEVONthink not running" errors.
 */

import { executeJxa } from "../../../applescript/execute.js";

export interface SimpleAIStatus {
  success: boolean;
  devonthinkRunning: boolean;
  aiEnginesConfigured: string[];
  recommendedEngine: string | null;
  error?: string;
}

/**
 * Simple, fast check for AI service availability using proven working pattern
 */
export async function checkAIServiceSimple(): Promise<SimpleAIStatus> {
  // Safety check for test environments where executeJxa might be mocked
  try {
  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      
      try {
        // Simple running check (same as isRunning.ts - PROVEN TO WORK)
        const isRunning = theApp.running();
        
        if (!isRunning) {
          return JSON.stringify({
            success: true,
            devonthinkRunning: false,
            aiEnginesConfigured: [],
            recommendedEngine: null
          });
        }
        
        // Test engines using DEVONthink's actual API (SAFE - no complex error handling)
        const testEngines = ["ChatGPT", "Claude", "Gemini", "Mistral AI", "GPT4All", "LM Studio", "Ollama"];
        const configuredEngines = [];
        
        for (const engine of testEngines) {
          try {
            const models = theApp.getChatModelsForEngine(engine);
            if (models && models.length > 0) {
              configuredEngines.push(engine);
            }
          } catch (e) {
            // Engine not configured - this is expected and not an error
          }
        }
        
        // Simple recommendation logic
        let recommendedEngine = null;
        if (configuredEngines.length > 0) {
          // Prefer ChatGPT, then Claude, then others
          if (configuredEngines.includes("ChatGPT")) {
            recommendedEngine = "ChatGPT";
          } else if (configuredEngines.includes("Claude")) {
            recommendedEngine = "Claude";
          } else {
            recommendedEngine = configuredEngines[0];
          }
        }
        
        return JSON.stringify({
          success: true,
          devonthinkRunning: true,
          aiEnginesConfigured: configuredEngines,
          recommendedEngine: recommendedEngine
        });
        
      } catch (error) {
        return JSON.stringify({
          success: false,
          devonthinkRunning: false,
          aiEnginesConfigured: [],
          recommendedEngine: null,
          error: error.toString()
        });
      }
    })();
  `;

  const result = await executeJxa<SimpleAIStatus>(script);
  
  // Ensure we always return a valid SimpleAIStatus object
  if (!result || typeof result !== "object") {
    return {
      success: false,
      devonthinkRunning: false,
      aiEnginesConfigured: [],
      recommendedEngine: null,
      error: "Invalid response from AI service check"
    };
  }
  
  return result;
  
  } catch (error) {
    // Fallback for test environments or execution failures
    return {
      success: false,
      devonthinkRunning: false,
      aiEnginesConfigured: [],
      recommendedEngine: null,
      error: `AI service check failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Gets user-friendly status message (NEVER mentions JXA technical details)
 */
export function getSimpleStatusMessage(status: SimpleAIStatus): string {
  if (!status.success) {
    // Sanitize error message - remove any JXA technical details
    const sanitizedError = (status.error || 'Unknown error')
      .replace(/AppleScript/gi, "")
      .replace(/JXA/gi, "")
      .replace(/JavaScript for Automation/gi, "")
      .replace(/osascript/gi, "")
      .replace(/theApp\./gi, "")
      .trim();
    
    return `AI service check failed: ${sanitizedError}`;
  }
  
  if (!status.devonthinkRunning) {
    return "DEVONthink is not running. Please start DEVONthink to use AI features.";
  }
  
  if (status.aiEnginesConfigured.length === 0) {
    return "No AI engines configured. Please set up an AI engine in DEVONthink > Preferences > AI (takes 2-3 minutes).";
  }
  
  const engineList = status.aiEnginesConfigured.join(', ');
  return `AI ready: ${status.aiEnginesConfigured.length} engine(s) configured (${engineList})`;
}

/**
 * Quick engine selection - returns null if no engines available
 */
export function selectSimpleEngine(status: SimpleAIStatus, preferredEngine?: string): string | null {
  if (!status.success || !status.devonthinkRunning || status.aiEnginesConfigured.length === 0) {
    return null;
  }
  
  // If preferred engine is available, use it
  if (preferredEngine && status.aiEnginesConfigured.includes(preferredEngine)) {
    return preferredEngine;
  }
  
  // Otherwise use recommended engine
  return status.recommendedEngine;
}