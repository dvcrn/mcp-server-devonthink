/**
 * Test for AI Status Check Tool
 * Validates the new smart AI detection system
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkAIStatusTool } from "../../../src/tools/ai/checkAIStatus.js";

// Mock the executeJxa function to simulate DEVONthink responses
vi.mock("../../../src/applescript/execute.js", () => ({
  executeJxa: vi.fn()
}));

// Mock AI availability checker functions  
vi.mock("../../../src/tools/ai/utils/aiAvailabilityChecker.js", () => ({
  checkAIServiceAvailability: vi.fn(),
  getAIServiceInfo: vi.fn(),
  getEngineConfigurationGuide: vi.fn(),
  selectBestEngine: vi.fn()
}));

describe("checkAIStatus Tool", () => {
  const mockExecuteJxa = vi.fn();
  const mockCheckAIServiceAvailability = vi.fn();
  const mockGetAIServiceInfo = vi.fn();
  const mockGetEngineConfigurationGuide = vi.fn();
  const mockSelectBestEngine = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Import mocked functions
    const executeModule = vi.importActual("../../../src/applescript/execute.js");
    const availabilityModule = vi.importActual("../../../src/tools/ai/utils/aiAvailabilityChecker.js");
    
    vi.mocked(executeModule.executeJxa).mockImplementation(mockExecuteJxa);
    vi.mocked(availabilityModule.checkAIServiceAvailability).mockImplementation(mockCheckAIServiceAvailability);
    vi.mocked(availabilityModule.getAIServiceInfo).mockImplementation(mockGetAIServiceInfo);
    vi.mocked(availabilityModule.getEngineConfigurationGuide).mockImplementation(mockGetEngineConfigurationGuide);
    vi.mocked(availabilityModule.selectBestEngine).mockImplementation(mockSelectBestEngine);
  });

  describe("Tool Definition", () => {
    it("should have correct tool name", () => {
      expect(checkAIStatusTool.name).toBe("check_ai_status");
    });

    it("should have comprehensive description", () => {
      expect(checkAIStatusTool.description).toContain("Check AI Status");
      expect(checkAIStatusTool.description).toContain("Auto-Detection");
      expect(checkAIStatusTool.description).toContain("Setup Guidance");
    });

    it("should have valid input schema", () => {
      expect(checkAIStatusTool.inputSchema).toBeDefined();
      expect(typeof checkAIStatusTool.inputSchema).toBe("object");
    });

    it("should have run function", () => {
      expect(typeof checkAIStatusTool.run).toBe("function");
    });
  });

  describe("AI Status Detection", () => {
    it("should detect configured AI engines", async () => {
      // Mock successful AI service detection
      const mockServiceInfo = {
        status: {
          isAvailable: true,
          devonthinkRunning: true,
          aiFeatureEnabled: true,
          availableEngines: ["ChatGPT", "Claude"],
          defaultEngine: "ChatGPT",
          engineDetails: {
            "ChatGPT": {
              models: ["gpt-4", "gpt-3.5-turbo"],
              isConfigured: true
            },
            "Claude": {
              models: ["claude-3-sonnet"],
              isConfigured: true
            }
          },
          warnings: [],
          lastChecked: new Date().toISOString()
        },
        engines: [
          {
            engine: "ChatGPT",
            isAvailable: true,
            isConfigured: true,
            models: ["gpt-4", "gpt-3.5-turbo"],
            capabilities: ["chat", "summarize", "analyze"]
          },
          {
            engine: "Claude", 
            isAvailable: true,
            isConfigured: true,
            models: ["claude-3-sonnet"],
            capabilities: ["chat", "analyze", "reasoning"]
          },
          {
            engine: "Gemini",
            isAvailable: false,
            isConfigured: false,
            error: "Engine not configured"
          }
        ]
      };

      mockGetAIServiceInfo.mockResolvedValue(mockServiceInfo);
      mockGetEngineConfigurationGuide.mockReturnValue("Setup Gemini in DEVONthink > Preferences > AI");

      const input = {
        includeModels: true,
        includeConfiguration: true
      };

      const result = await checkAIStatusTool.run(input);

      expect(result.success).toBe(true);
      expect(result.isAvailable).toBe(true);
      expect(result.configuredEngines).toHaveLength(2);
      expect(result.unconfiguredEngines).toHaveLength(1);
      expect(result.summary).toContain("✅ 2 AI engine(s) ready: ChatGPT, Claude");
    });

    it("should handle no configured engines", async () => {
      const mockServiceInfo = {
        status: {
          isAvailable: false,
          devonthinkRunning: true,
          aiFeatureEnabled: true,
          availableEngines: [],
          defaultEngine: null,
          engineDetails: {},
          warnings: [],
          lastChecked: new Date().toISOString()
        },
        engines: [
          {
            engine: "ChatGPT",
            isAvailable: false,
            isConfigured: false,
            error: "Engine not configured"
          },
          {
            engine: "Claude",
            isAvailable: false, 
            isConfigured: false,
            error: "Engine not configured"
          }
        ]
      };

      mockGetAIServiceInfo.mockResolvedValue(mockServiceInfo);

      const result = await checkAIStatusTool.run({});

      expect(result.success).toBe(true);
      expect(result.isAvailable).toBe(false);
      expect(result.configuredEngines).toHaveLength(0);
      expect(result.summary).toContain("⚠️ No AI engines configured");
    });

    it("should handle DEVONthink not running", async () => {
      const mockServiceInfo = {
        status: {
          isAvailable: false,
          devonthinkRunning: false,
          aiFeatureEnabled: false,
          availableEngines: [],
          defaultEngine: null,
          engineDetails: {},
          warnings: [],
          lastChecked: new Date().toISOString(),
          error: "DEVONthink is not running"
        },
        engines: []
      };

      mockGetAIServiceInfo.mockResolvedValue(mockServiceInfo);

      const result = await checkAIStatusTool.run({});

      expect(result.success).toBe(true);
      expect(result.devonthinkRunning).toBe(false);
      expect(result.summary).toContain("❌ DEVONthink is not running");
    });
  });

  describe("Engine Recommendation", () => {
    it("should recommend best engine for specific operations", async () => {
      const mockServiceInfo = {
        status: {
          isAvailable: true,
          devonthinkRunning: true,
          aiFeatureEnabled: true,
          availableEngines: ["ChatGPT", "Claude"],
          defaultEngine: "ChatGPT",
          engineDetails: {},
          warnings: [],
          lastChecked: new Date().toISOString()
        },
        engines: [
          {
            engine: "ChatGPT",
            isAvailable: true,
            isConfigured: true,
            models: ["gpt-4"]
          },
          {
            engine: "Claude",
            isAvailable: true,
            isConfigured: true,
            models: ["claude-3-sonnet"]
          }
        ]
      };

      mockGetAIServiceInfo.mockResolvedValue(mockServiceInfo);
      mockSelectBestEngine.mockResolvedValue({
        engine: "Claude",
        model: "claude-3-sonnet",
        success: true,
        message: "Auto-selected Claude with model claude-3-sonnet for summarize."
      });

      const input = {
        testOperation: "summarize" as const
      };

      const result = await checkAIStatusTool.run(input);

      expect(result.success).toBe(true);
      expect(result.recommendedEngine).toBeDefined();
      expect(result.recommendedEngine?.engine).toBe("Claude");
      expect(result.recommendedEngine?.model).toBe("claude-3-sonnet");
      expect(mockSelectBestEngine).toHaveBeenCalledWith(undefined, "summarize");
    });
  });

  describe("Configuration Guidance", () => {
    it("should provide setup instructions for unconfigured engines", async () => {
      const mockServiceInfo = {
        status: {
          isAvailable: true,
          devonthinkRunning: true,
          aiFeatureEnabled: true,
          availableEngines: ["ChatGPT"],
          defaultEngine: "ChatGPT",
          engineDetails: {},
          warnings: [],
          lastChecked: new Date().toISOString()
        },
        engines: [
          {
            engine: "ChatGPT",
            isAvailable: true,
            isConfigured: true,
            models: ["gpt-4"]
          },
          {
            engine: "Claude",
            isAvailable: false,
            isConfigured: false,
            error: "Engine not configured"
          }
        ]
      };

      mockGetAIServiceInfo.mockResolvedValue(mockServiceInfo);
      mockGetEngineConfigurationGuide.mockReturnValue("To configure Claude: 1. Open DEVONthink > Preferences > AI...");

      const input = {
        includeConfiguration: true
      };

      const result = await checkAIStatusTool.run(input);

      expect(result.success).toBe(true);
      expect(result.unconfiguredEngines).toHaveLength(1);
      expect(result.unconfiguredEngines[0].engine).toBe("Claude");
      expect(result.unconfiguredEngines[0].configurationGuide).toContain("Configure Claude");
    });
  });

  describe("Error Handling", () => {
    it("should handle AI service check failures gracefully", async () => {
      mockGetAIServiceInfo.mockRejectedValue(new Error("Service check failed"));

      const result = await checkAIStatusTool.run({});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to check AI status");
      expect(result.summary).toBe("❌ Failed to check AI status");
    });
  });
});