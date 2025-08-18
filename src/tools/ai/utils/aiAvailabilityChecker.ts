/**
 * DEVONthink AI service availability checker
 * Provides utilities to check if AI features are available and properly configured
 */

import { executeJxa } from "../../../applescript/execute.js";
import type { AIEngine } from "./aiValidation.js";

/**
 * AI service availability status
 */
export interface AIServiceStatus {
  isAvailable: boolean;
  devonthinkRunning: boolean;
  aiFeatureEnabled: boolean;
  availableEngines: AIEngine[];
  defaultEngine: AIEngine | null;
  engineDetails?: Record<string, EngineDetail>;
  error?: string;
  warnings: string[];
  lastChecked: string;
}

/**
 * Detailed information about an AI engine
 */
export interface EngineDetail {
  models: string[];
  isConfigured: boolean;
  error?: string;
}

/**
 * Engine-specific availability information
 */
export interface EngineAvailability {
  engine: AIEngine;
  isAvailable: boolean;
  isConfigured: boolean;
  error?: string;
  model?: string;
  models?: string[];
  capabilities?: string[];
}

/**
 * Cache for AI service status to avoid repeated checks
 */
class AIStatusCache {
  private cache: AIServiceStatus | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute

  get(forceRefresh: boolean = false): AIServiceStatus | null {
    if (forceRefresh || Date.now() > this.cacheExpiry) {
      this.cache = null;
    }
    return this.cache;
  }

  set(status: AIServiceStatus): void {
    this.cache = status;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
  }

  clear(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}

const statusCache = new AIStatusCache();

/**
 * Checks if DEVONthink AI services are available and properly configured
 */
export async function checkAIServiceAvailability(forceRefresh: boolean = false, skipTesting: boolean = false): Promise<AIServiceStatus> {
  // Return cached result if available and not expired
  if (!forceRefresh) {
    const cached = statusCache.get();
    if (cached) return cached;
  }

  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      const skipTesting = ${skipTesting ? "true" : "false"};
      
      const result = {};
      result["devonthinkRunning"] = false;
      result["aiFeatureEnabled"] = false;
      result["availableEngines"] = [];
      result["warnings"] = [];
      result["isAvailable"] = false;
      result["lastChecked"] = new Date().toISOString();
      
      try {
        // Check if DEVONthink is running
        if (!theApp.running()) {
          result["error"] = "DEVONthink is not running";
          return JSON.stringify(result);
        }
        
        result["devonthinkRunning"] = true;
        
        // Check DEVONthink version and AI feature availability
        try {
          const version = theApp.version();
          result["version"] = version;
          
          // DEVONthink Pro is required for AI features
          if (!version || !version.includes("Pro")) {
            result["warnings"].push("DEVONthink Pro is required for AI features");
          }
        } catch (versionError) {
          result["warnings"].push("Could not determine DEVONthink version");
        }
        
        // Test AI functionality by attempting a minimal AI operation
        try {
          // Try to get AI service status by attempting a simple operation
          // This is a safe test that won't consume significant API credits
          const databases = theApp.databases();
          if (databases && databases.length > 0) {
            const testDatabase = databases[0];
            
            // Try to access AI-related functionality
            // Note: This is a lightweight check that doesn't actually call AI services
            result["aiFeatureEnabled"] = true;
            
            // Test available engines using DEVONthink's actual API
            const testEngines = ["ChatGPT", "Claude", "Gemini", "Mistral AI", "GPT4All", "LM Studio", "Ollama"];
            const availableEngines = [];
            const engineDetails = {};
            
            for (const engine of testEngines) {
              try {
                // First check if models are available
                const models = theApp.getChatModelsForEngine(engine);
                if (models && models.length > 0) {
                  
                  if (skipTesting) {
                    // Skip actual testing - just report based on model availability
                    availableEngines.push(engine);
                    engineDetails[engine] = {
                      "models": models,
                      "isConfigured": true,
                      "tested": false,
                      "warning": "Configuration not verified - API key may be invalid"
                    };
                  } else {
                    // ENHANCED: Actually test the engine with a minimal operation
                    // This will fail if API key is invalid or engine isn't truly configured
                    let isReallyConfigured = false;
                    let actualError = null;
                    
                    try {
                      // Create a minimal test prompt that won't consume significant credits
                      // Use a very short input to minimize API costs
                      // Add timeout to prevent long delays
                      const testResult = theApp.chatWithAI({
                        "engine": engine,
                        "model": models[0], // Use first available model
                        "prompt": "Hi", // Minimal test
                        "maxTokens": 1, // Absolute minimum to reduce cost and time
                        "timeout": 5 // 5 second timeout to prevent delays
                      });
                      
                      // If we get here without error, the engine is truly configured
                      isReallyConfigured = true;
                      
                    } catch (testError) {
                      actualError = testError.toString();
                      // Common error patterns that indicate misconfiguration:
                      if (actualError.includes("API key") || 
                          actualError.includes("authentication") ||
                          actualError.includes("invalid key") ||
                          actualError.includes("unauthorized") ||
                          actualError.includes("401") ||
                          actualError.includes("403")) {
                        isReallyConfigured = false;
                      } else {
                        // Other errors might be temporary - assume configured
                        isReallyConfigured = true;
                      }
                    }
                    
                    if (isReallyConfigured) {
                      availableEngines.push(engine);
                      engineDetails[engine] = {
                        "models": models,
                        "isConfigured": true,
                        "tested": true
                      };
                    } else {
                      engineDetails[engine] = {
                        "models": models,
                        "isConfigured": false,
                        "tested": true,
                        "error": actualError || "Engine appears configured but authentication failed"
                      };
                    }
                  }
                  
                } else {
                  // No models available
                  engineDetails[engine] = {
                    "models": [],
                    "isConfigured": false,
                    "error": "No models available for this engine"
                  };
                }
              } catch (engineError) {
                // Engine not available or configured - this is expected for unconfigured engines
                engineDetails[engine] = {
                  "models": [],
                  "isConfigured": false,
                  "error": engineError.toString()
                };
              }
            }
            
            result["availableEngines"] = availableEngines;
            result["engineDetails"] = engineDetails;
            
            // Set default engine (first available one)
            result["defaultEngine"] = availableEngines.length > 0 ? availableEngines[0] : null;
            
          } else {
            result["warnings"].push("No databases found in DEVONthink");
          }
          
        } catch (aiError) {
          result["error"] = "AI features may not be available: " + aiError.toString();
          result["aiFeatureEnabled"] = false;
        }
        
        // Overall availability assessment
        result["isAvailable"] = result["devonthinkRunning"] && result["aiFeatureEnabled"];
        
        return JSON.stringify(result);
        
      } catch (error) {
        result["error"] = error.toString();
        return JSON.stringify(result);
      }
    })();
  `;

  try {
    const rawResult = await executeJxa<any>(script);
    
    const status: AIServiceStatus = {
      isAvailable: rawResult.isAvailable || false,
      devonthinkRunning: rawResult.devonthinkRunning || false,
      aiFeatureEnabled: rawResult.aiFeatureEnabled || false,
      availableEngines: rawResult.availableEngines || [],
      defaultEngine: rawResult.defaultEngine || null,
      engineDetails: rawResult.engineDetails || {},
      warnings: rawResult.warnings || [],
      lastChecked: rawResult.lastChecked || new Date().toISOString(),
      ...(rawResult.error && { error: rawResult.error })
    };

    // Cache the result
    statusCache.set(status);
    
    return status;
    
  } catch (error) {
    const errorStatus: AIServiceStatus = {
      isAvailable: false,
      devonthinkRunning: false,
      aiFeatureEnabled: false,
      availableEngines: [],
      defaultEngine: null,
      warnings: [],
      lastChecked: new Date().toISOString(),
      error: `Failed to check AI service availability: ${error instanceof Error ? error.message : String(error)}`
    };

    return errorStatus;
  }
}

/**
 * Checks availability of a specific AI engine using DEVONthink's actual API
 */
export async function checkEngineAvailability(engine: AIEngine): Promise<EngineAvailability> {
  const script = `
    (() => {
      const theApp = Application("DEVONthink");
      theApp.includeStandardAdditions = true;
      
      const result = {};
      result["engine"] = "${engine}";
      result["isAvailable"] = false;
      result["isConfigured"] = false;
      
      try {
        if (!theApp.running()) {
          result["error"] = "DEVONthink is not running";
          return JSON.stringify(result);
        }
        
        // Test engine availability using DEVONthink's getChatModelsForEngine API
        try {
          const models = theApp.getChatModelsForEngine("${engine}");
          if (models && models.length > 0) {
            result["models"] = models;
            result["model"] = models[0];
            
            // ENHANCED: Actually test the engine with a minimal operation
            let isReallyConfigured = false;
            let actualError = null;
            
            try {
              // Test with minimal prompt to verify authentication works
              const testResult = theApp.chatWithAI({
                "engine": "${engine}",
                "model": models[0],
                "prompt": "Hi",
                "maxTokens": 5
              });
              isReallyConfigured = true;
              
            } catch (testError) {
              actualError = testError.toString();
              // Check for authentication/API key errors
              if (actualError.includes("API key") || 
                  actualError.includes("authentication") ||
                  actualError.includes("invalid key") ||
                  actualError.includes("unauthorized") ||
                  actualError.includes("401") ||
                  actualError.includes("403")) {
                isReallyConfigured = false;
              } else {
                // Other errors might be temporary - assume configured
                isReallyConfigured = true;
              }
            }
            
            if (isReallyConfigured) {
              result["isAvailable"] = true;
              result["isConfigured"] = true;
              result["tested"] = true;
              
              // Add engine-specific capabilities based on what's actually configured
              const capabilities = ["chat", "analyze", "generate"];
              
              switch ("${engine}") {
                case "ChatGPT":
                  capabilities.push("summarize", "reasoning");
                  break;
                case "Claude":
                  capabilities.push("reasoning", "long-form");
                  break;
                case "Gemini":
                  capabilities.push("multimodal");
                  break;
                case "GPT4All":
                case "LM Studio":
                case "Ollama":
                  capabilities.push("local", "offline");
                  break;
              }
              
              result["capabilities"] = capabilities;
            } else {
              result["isAvailable"] = false;
              result["isConfigured"] = false;
              result["tested"] = true;
              result["error"] = actualError || "Engine appears configured but authentication failed";
            }
            
          } else {
            result["isAvailable"] = false;
            result["isConfigured"] = false;
            result["error"] = "Engine is not configured or has no available models";
            result["models"] = [];
          }
          
        } catch (engineError) {
          result["isAvailable"] = false;
          result["isConfigured"] = false;
          result["error"] = "Engine not configured: " + engineError.toString();
          result["models"] = [];
        }
        
        return JSON.stringify(result);
        
      } catch (error) {
        result["error"] = error.toString();
        return JSON.stringify(result);
      }
    })();
  `;

  try {
    const rawResult = await executeJxa<any>(script);
    
    return {
      engine,
      isAvailable: rawResult.isAvailable || false,
      isConfigured: rawResult.isConfigured || false,
      error: rawResult.error,
      model: rawResult.model,
      capabilities: rawResult.capabilities || [],
      models: rawResult.models || []
    };
    
  } catch (error) {
    return {
      engine,
      isAvailable: false,
      isConfigured: false,
      error: `Failed to check engine availability: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Gets comprehensive AI service information
 */
export async function getAIServiceInfo(forceRefresh: boolean = false, skipTesting: boolean = false): Promise<{
  status: AIServiceStatus;
  engines: EngineAvailability[];
}> {
  const status = await checkAIServiceAvailability(forceRefresh, skipTesting);
  
  // Check each available engine
  const enginePromises = status.availableEngines.map(engine => 
    checkEngineAvailability(engine)
  );
  
  const engines = await Promise.all(enginePromises);
  
  return { status, engines };
}

/**
 * Validates AI prerequisites before running an operation
 */
export async function validateAIPrerequisites(
  requiredEngine?: AIEngine,
  operationType?: string
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}> {
  const status = await checkAIServiceAvailability();
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Basic availability checks
  if (!status.devonthinkRunning) {
    errors.push("DEVONthink is not running");
    recommendations.push("Start DEVONthink application");
  }
  
  if (!status.aiFeatureEnabled) {
    errors.push("AI features are not enabled or available");
    recommendations.push("Ensure DEVONthink Pro is installed with AI features enabled");
    recommendations.push("Check AI service configuration in DEVONthink preferences");
  }
  
  if (status.availableEngines.length === 0) {
    warnings.push("No AI engines detected");
    recommendations.push("Configure at least one AI engine in DEVONthink settings");
  }
  
  // Engine-specific checks
  if (requiredEngine && !status.availableEngines.includes(requiredEngine)) {
    errors.push(`Required AI engine "${requiredEngine}" is not available`);
    recommendations.push(`Configure the ${requiredEngine} engine in DEVONthink settings`);
    
    if (status.availableEngines.length > 0) {
      recommendations.push(`Available alternatives: ${status.availableEngines.join(', ')}`);
    }
  }
  
  // Operation-specific checks
  if (operationType) {
    switch (operationType) {
      case 'summarize':
        if (status.availableEngines.length === 0) {
          errors.push("Summarization requires at least one AI engine to be configured");
        }
        break;
      case 'classify':
        if (status.availableEngines.length === 0) {
          errors.push("Classification requires AI engine configuration");
        }
        break;
      case 'compare':
        if (status.availableEngines.length === 0) {
          errors.push("Comparison requires AI engine configuration");
        }
        break;
    }
  }
  
  // Add general warnings
  warnings.push(...status.warnings);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations
  };
}

/**
 * Clears the AI service status cache
 */
export function clearAIStatusCache(): void {
  statusCache.clear();
}

/**
 * Gets a user-friendly status summary
 */
export async function getAIStatusSummary(): Promise<string> {
  const status = await checkAIServiceAvailability();
  
  if (!status.devonthinkRunning) {
    return "❌ DEVONthink is not running. Start DEVONthink to use AI features.";
  }
  
  if (!status.aiFeatureEnabled) {
    return "⚠️ AI features are not available. Ensure DEVONthink Pro is installed and AI features are configured.";
  }
  
  if (status.availableEngines.length === 0) {
    return "⚠️ No AI engines are configured. Set up at least one AI engine in DEVONthink preferences.";
  }
  
  const engineList = status.availableEngines.join(', ');
  const warningText = status.warnings.length > 0 ? 
    `\n⚠️ Warnings: ${status.warnings.join('; ')}` : '';
  
  return `✅ AI features are available with ${status.availableEngines.length} engine(s): ${engineList}${warningText}`;
}

/**
 * Utility function to wait for AI service to become available
 */
export async function waitForAIService(
  timeoutMs: number = 30000,
  checkIntervalMs: number = 2000
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const status = await checkAIServiceAvailability(true); // Force refresh
    
    if (status.isAvailable) {
      return true;
    }
    
    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
  }
  
  return false;
}

/**
 * Smart engine selection with user-friendly guidance
 */
export async function selectBestEngine(
  requestedEngine?: AIEngine,
  operationType?: string
): Promise<{
  engine: AIEngine | null;
  model?: string;
  success: boolean;
  message: string;
  availableAlternatives?: AIEngine[];
}> {
  const status = await checkAIServiceAvailability();
  
  // Check basic prerequisites
  if (!status.devonthinkRunning) {
    return {
      engine: null,
      success: false,
      message: "DEVONthink is not running. Please start DEVONthink to use AI features."
    };
  }
  
  if (!status.aiFeatureEnabled || status.availableEngines.length === 0) {
    return {
      engine: null,
      success: false,
      message: "No AI engines are configured. Please set up an AI engine in DEVONthink > Preferences > AI. This usually takes 2-3 minutes and requires an API key for services like ChatGPT or Claude."
    };
  }
  
  // If user requested a specific engine
  if (requestedEngine) {
    if (status.availableEngines.includes(requestedEngine)) {
      const engineDetail = status.engineDetails?.[requestedEngine];
      const model = engineDetail?.models?.[0];
      return {
        engine: requestedEngine,
        model,
        success: true,
        message: `Using ${requestedEngine}${model ? ` with model ${model}` : ""}.`
      };
    } else {
      // Requested engine not available, suggest alternatives
      return {
        engine: null,
        success: false,
        message: `${requestedEngine} isn't configured yet. Available now: ${status.availableEngines.join(', ')}. To set up ${requestedEngine}, go to DEVONthink > Preferences > AI.`,
        availableAlternatives: status.availableEngines
      };
    }
  }
  
  // Auto-select best engine based on operation type and availability
  let preferredEngines: AIEngine[];
  
  switch (operationType) {
    case 'summarize':
      preferredEngines = ['Claude', 'ChatGPT', 'Gemini', 'Mistral AI'];
      break;
    case 'classify':
      preferredEngines = ['ChatGPT', 'Claude', 'Gemini', 'Mistral AI'];
      break;
    case 'compare':
      preferredEngines = ['Claude', 'ChatGPT', 'Gemini'];
      break;
    case 'chat':
    default:
      preferredEngines = ['ChatGPT', 'Claude', 'Gemini', 'Mistral AI', 'GPT4All', 'LM Studio', 'Ollama'];
      break;
  }
  
  // Find the first preferred engine that's available
  for (const engine of preferredEngines) {
    if (status.availableEngines.includes(engine)) {
      const engineDetail = status.engineDetails?.[engine];
      const model = engineDetail?.models?.[0];
      return {
        engine,
        model,
        success: true,
        message: `Auto-selected ${engine}${model ? ` with model ${model}` : ""} for ${operationType || 'this operation'}.`
      };
    }
  }
  
  // Fallback to first available engine
  const firstEngine = status.availableEngines[0];
  const engineDetail = status.engineDetails?.[firstEngine];
  const model = engineDetail?.models?.[0];
  
  return {
    engine: firstEngine,
    model,
    success: true,
    message: `Using ${firstEngine}${model ? ` with model ${model}` : ""}.`
  };
}

/**
 * Gets user-friendly configuration guidance for AI engines
 */
export function getEngineConfigurationGuide(engine?: AIEngine): string {
  const baseGuide = "To configure AI engines in DEVONthink:\n1. Open DEVONthink > Preferences > AI\n2. ";
  
  switch (engine) {
    case 'ChatGPT':
      return baseGuide + "Select OpenAI/ChatGPT tab\n3. Enter your OpenAI API key (get one from platform.openai.com)\n4. Choose your preferred model (GPT-4 recommended)\n5. Click 'Test' to verify connection\n\n⏱️ Setup time: ~2 minutes";
    
    case 'Claude':
      return baseGuide + "Select Claude tab\n3. Enter your Anthropic API key (get one from console.anthropic.com)\n4. Choose your preferred model (Claude-3.5-Sonnet recommended)\n5. Click 'Test' to verify connection\n\n⏱️ Setup time: ~2 minutes";
    
    case 'Gemini':
      return baseGuide + "Select Google/Gemini tab\n3. Enter your Google AI API key (get one from aistudio.google.com)\n4. Choose your preferred model (Gemini-Pro recommended)\n5. Click 'Test' to verify connection\n\n⏱️ Setup time: ~2 minutes";
    
    case 'GPT4All':
      return baseGuide + "Select Local AI tab\n3. Download and install GPT4All application\n4. Configure the local model connection\n5. Test the connection\n\n⏱️ Setup time: ~10 minutes (includes model download)";
    
    case 'LM Studio':
      return baseGuide + "Select Local AI tab\n3. Download and install LM Studio\n4. Load a model in LM Studio\n5. Configure DEVONthink to connect to local server\n\n⏱️ Setup time: ~15 minutes (includes model download)";
    
    case 'Ollama':
      return baseGuide + "Select Local AI tab\n3. Install Ollama (ollama.ai)\n4. Download a model (e.g., 'ollama pull llama2')\n5. Configure DEVONthink connection\n\n⏱️ Setup time: ~15 minutes (includes model download)";
    
    default:
      return baseGuide + "Choose an AI service tab (ChatGPT, Claude, Gemini for cloud, or Local AI for offline)\n3. Follow the setup instructions for your chosen service\n4. Enter required credentials or configure local connection\n5. Test the connection\n\n💡 Tip: ChatGPT and Claude are quickest to set up (~2 minutes each)";
  }
}