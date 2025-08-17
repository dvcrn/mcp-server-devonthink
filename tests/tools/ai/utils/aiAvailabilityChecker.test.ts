/**
 * Unit tests for AI availability checker utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkAIServiceAvailability,
  checkEngineAvailability,
  getAIServiceInfo,
  validateAIPrerequisites,
  clearAIStatusCache,
  getAIStatusSummary,
  waitForAIService,
  AIServiceStatus,
  EngineAvailability
} from '@/tools/ai/utils/aiAvailabilityChecker.js';
import { 
  mockExecuteJxa,
  setupDefaultJXAMocks,
  setupAIUnavailableMocks,
  setupDevonThinkNotRunningMocks,
  MOCK_AI_AVAILABILITY
} from '@tests/mocks/devonthink.js';

// Mock the executeJxa function
vi.mock('@/applescript/execute.js', () => ({
  executeJxa: mockExecuteJxa
}));

describe('AI Availability Checker Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAIStatusCache(); // Clear cache before each test
  });

  describe('checkAIServiceAvailability', () => {
    it('should return available status when DEVONthink and AI are available', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: true,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: ['ChatGPT', 'Claude'],
        defaultEngine: 'ChatGPT',
        warnings: [],
        lastChecked: new Date().toISOString(),
        version: 'DEVONthink Pro 3.9.0'
      });

      const status = await checkAIServiceAvailability();

      expect(status.isAvailable).toBe(true);
      expect(status.devonthinkRunning).toBe(true);
      expect(status.aiFeatureEnabled).toBe(true);
      expect(status.availableEngines).toContain('ChatGPT');
      expect(status.availableEngines).toContain('Claude');
      expect(status.defaultEngine).toBe('ChatGPT');
      expect(status.warnings).toHaveLength(0);
    });

    it('should return unavailable status when DEVONthink is not running', async () => {
      setupDevonThinkNotRunningMocks();

      const status = await checkAIServiceAvailability();

      expect(status.isAvailable).toBe(false);
      expect(status.devonthinkRunning).toBe(false);
      expect(status.error).toContain('DEVONthink is not running');
    });

    it('should return unavailable status when AI features are disabled', async () => {
      setupAIUnavailableMocks();

      const status = await checkAIServiceAvailability();

      expect(status.isAvailable).toBe(false);
      expect(status.devonthinkRunning).toBe(true);
      expect(status.aiFeatureEnabled).toBe(false);
    });

    it('should handle warnings for non-Pro versions', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: true,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: ['ChatGPT'],
        defaultEngine: 'ChatGPT',
        warnings: ['DEVONthink Pro is required for AI features'],
        lastChecked: new Date().toISOString(),
        version: 'DEVONthink 3.9.0' // Not Pro
      });

      const status = await checkAIServiceAvailability();

      expect(status.warnings).toContain('DEVONthink Pro is required for AI features');
    });

    it('should handle warnings for no databases', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: false,
        devonthinkRunning: true,
        aiFeatureEnabled: false,
        availableEngines: [],
        defaultEngine: null,
        warnings: ['No databases found in DEVONthink'],
        lastChecked: new Date().toISOString()
      });

      const status = await checkAIServiceAvailability();

      expect(status.warnings).toContain('No databases found in DEVONthink');
      expect(status.availableEngines).toHaveLength(0);
    });

    it('should cache results and return cached data', async () => {
      const mockStatus = {
        isAvailable: true,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: ['ChatGPT'],
        defaultEngine: 'ChatGPT',
        warnings: [],
        lastChecked: new Date().toISOString()
      };

      mockExecuteJxa.mockResolvedValueOnce(mockStatus);

      // First call should execute JXA
      const status1 = await checkAIServiceAvailability();
      expect(mockExecuteJxa).toHaveBeenCalledTimes(1);

      // Second call should return cached result
      const status2 = await checkAIServiceAvailability();
      expect(mockExecuteJxa).toHaveBeenCalledTimes(1); // No additional call
      expect(status2).toEqual(status1);
    });

    it('should bypass cache when forceRefresh is true', async () => {
      const mockStatus = {
        isAvailable: true,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: ['ChatGPT'],
        defaultEngine: 'ChatGPT',
        warnings: [],
        lastChecked: new Date().toISOString()
      };

      mockExecuteJxa.mockResolvedValue(mockStatus);

      // First call
      await checkAIServiceAvailability();
      expect(mockExecuteJxa).toHaveBeenCalledTimes(1);

      // Second call with forceRefresh should make new JXA call
      await checkAIServiceAvailability(true);
      expect(mockExecuteJxa).toHaveBeenCalledTimes(2);
    });

    it('should handle JXA execution errors', async () => {
      mockExecuteJxa.mockRejectedValueOnce(new Error('JXA execution failed'));

      const status = await checkAIServiceAvailability();

      expect(status.isAvailable).toBe(false);
      expect(status.devonthinkRunning).toBe(false);
      expect(status.aiFeatureEnabled).toBe(false);
      expect(status.error).toContain('Failed to check AI service availability');
    });
  });

  describe('checkEngineAvailability', () => {
    it('should check ChatGPT engine availability', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        engine: 'ChatGPT',
        isAvailable: true,
        isConfigured: true,
        model: 'gpt-4',
        capabilities: ['chat', 'summarize', 'analyze', 'generate']
      });

      const engine = await checkEngineAvailability('ChatGPT');

      expect(engine.engine).toBe('ChatGPT');
      expect(engine.isAvailable).toBe(true);
      expect(engine.isConfigured).toBe(true);
      expect(engine.model).toBe('gpt-4');
      expect(engine.capabilities).toContain('chat');
      expect(engine.capabilities).toContain('summarize');
    });

    it('should check Claude engine availability', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        engine: 'Claude',
        isAvailable: true,
        isConfigured: true,
        model: 'claude-3',
        capabilities: ['chat', 'analyze', 'generate', 'reasoning']
      });

      const engine = await checkEngineAvailability('Claude');

      expect(engine.engine).toBe('Claude');
      expect(engine.capabilities).toContain('reasoning');
    });

    it('should handle local engines', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        engine: 'Ollama',
        isAvailable: true,
        isConfigured: true,
        model: 'local',
        capabilities: ['chat', 'local', 'open-source']
      });

      const engine = await checkEngineAvailability('Ollama');

      expect(engine.engine).toBe('Ollama');
      expect(engine.model).toBe('local');
      expect(engine.capabilities).toContain('local');
      expect(engine.capabilities).toContain('open-source');
    });

    it('should handle unavailable engines', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        engine: 'UnsupportedEngine',
        isAvailable: false,
        isConfigured: false,
        error: 'Engine not supported or not available'
      });

      const engine = await checkEngineAvailability('ChatGPT');

      expect(engine.isAvailable).toBe(false);
      expect(engine.isConfigured).toBe(false);
      expect(engine.error).toContain('Engine not supported');
    });

    it('should handle DEVONthink not running', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        engine: 'ChatGPT',
        isAvailable: false,
        isConfigured: false,
        error: 'DEVONthink is not running'
      });

      const engine = await checkEngineAvailability('ChatGPT');

      expect(engine.isAvailable).toBe(false);
      expect(engine.error).toContain('DEVONthink is not running');
    });

    it('should handle JXA execution errors', async () => {
      mockExecuteJxa.mockRejectedValueOnce(new Error('Network error'));

      const engine = await checkEngineAvailability('ChatGPT');

      expect(engine.isAvailable).toBe(false);
      expect(engine.isConfigured).toBe(false);
      expect(engine.error).toContain('Failed to check engine availability');
    });
  });

  describe('getAIServiceInfo', () => {
    it('should return comprehensive AI service information', async () => {
      // Mock overall status
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: true,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: ['ChatGPT', 'Claude'],
        defaultEngine: 'ChatGPT',
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      // Mock engine-specific checks
      mockExecuteJxa
        .mockResolvedValueOnce({
          engine: 'ChatGPT',
          isAvailable: true,
          isConfigured: true,
          capabilities: ['chat', 'summarize']
        })
        .mockResolvedValueOnce({
          engine: 'Claude',
          isAvailable: true,
          isConfigured: true,
          capabilities: ['chat', 'analyze']
        });

      const info = await getAIServiceInfo();

      expect(info.status.isAvailable).toBe(true);
      expect(info.engines).toHaveLength(2);
      expect(info.engines[0].engine).toBe('ChatGPT');
      expect(info.engines[1].engine).toBe('Claude');
    });
  });

  describe('validateAIPrerequisites', () => {
    it('should validate successful prerequisites', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: true,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: ['ChatGPT', 'Claude'],
        defaultEngine: 'ChatGPT',
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      const validation = await validateAIPrerequisites('ChatGPT', 'summarize');

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect DEVONthink not running', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: false,
        devonthinkRunning: false,
        aiFeatureEnabled: false,
        availableEngines: [],
        defaultEngine: null,
        warnings: [],
        lastChecked: new Date().toISOString(),
        error: 'DEVONthink is not running'
      });

      const validation = await validateAIPrerequisites();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('DEVONthink is not running');
      expect(validation.recommendations).toContain('Start DEVONthink application');
    });

    it('should detect AI features not enabled', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: false,
        devonthinkRunning: true,
        aiFeatureEnabled: false,
        availableEngines: [],
        defaultEngine: null,
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      const validation = await validateAIPrerequisites();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('AI features are not enabled or available');
      expect(validation.recommendations).toContain('Ensure DEVONthink Pro is installed with AI features enabled');
    });

    it('should detect missing required engine', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: true,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: ['ChatGPT'],
        defaultEngine: 'ChatGPT',
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      const validation = await validateAIPrerequisites('Claude');

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Required AI engine "Claude" is not available');
      expect(validation.recommendations).toContain('Configure the Claude engine in DEVONthink settings');
      expect(validation.recommendations).toContain('Available alternatives: ChatGPT');
    });

    it('should warn about no configured engines', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: false,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: [],
        defaultEngine: null,
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      const validation = await validateAIPrerequisites();

      expect(validation.warnings).toContain('No AI engines detected');
      expect(validation.recommendations).toContain('Configure at least one AI engine in DEVONthink settings');
    });

    it('should validate operation-specific requirements', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: false,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: [],
        defaultEngine: null,
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      const operations = ['summarize', 'classify', 'compare'];

      for (const operation of operations) {
        const validation = await validateAIPrerequisites(undefined, operation);
        expect(validation.errors.some(error => 
          error.includes(operation) && error.includes('requires')
        )).toBe(true);
      }
    });
  });

  describe('getAIStatusSummary', () => {
    it('should return error message when DEVONthink is not running', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: false,
        devonthinkRunning: false,
        aiFeatureEnabled: false,
        availableEngines: [],
        defaultEngine: null,
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      const summary = await getAIStatusSummary();

      expect(summary).toContain('❌ DEVONthink is not running');
    });

    it('should return warning when AI features are not available', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: false,
        devonthinkRunning: true,
        aiFeatureEnabled: false,
        availableEngines: [],
        defaultEngine: null,
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      const summary = await getAIStatusSummary();

      expect(summary).toContain('⚠️ AI features are not available');
    });

    it('should return warning when no engines are configured', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: false,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: [],
        defaultEngine: null,
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      const summary = await getAIStatusSummary();

      expect(summary).toContain('⚠️ No AI engines are configured');
    });

    it('should return success message when AI is available', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: true,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: ['ChatGPT', 'Claude'],
        defaultEngine: 'ChatGPT',
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      const summary = await getAIStatusSummary();

      expect(summary).toContain('✅ AI features are available');
      expect(summary).toContain('2 engine(s)');
      expect(summary).toContain('ChatGPT, Claude');
    });

    it('should include warnings in success message', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: true,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: ['ChatGPT'],
        defaultEngine: 'ChatGPT',
        warnings: ['Some configuration issue'],
        lastChecked: new Date().toISOString()
      });

      const summary = await getAIStatusSummary();

      expect(summary).toContain('✅ AI features are available');
      expect(summary).toContain('⚠️ Warnings: Some configuration issue');
    });
  });

  describe('waitForAIService', () => {
    it('should return true when service becomes available', async () => {
      // First call - service not available
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: false,
        devonthinkRunning: false,
        aiFeatureEnabled: false,
        availableEngines: [],
        defaultEngine: null,
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      // Second call - service available
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: true,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: ['ChatGPT'],
        defaultEngine: 'ChatGPT',
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      const result = await waitForAIService(5000, 100); // Short timeout for testing

      expect(result).toBe(true);
      expect(mockExecuteJxa).toHaveBeenCalledTimes(2);
    });

    it('should return false when service does not become available within timeout', async () => {
      // Always return service not available
      mockExecuteJxa.mockResolvedValue({
        isAvailable: false,
        devonthinkRunning: false,
        aiFeatureEnabled: false,
        availableEngines: [],
        defaultEngine: null,
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      const result = await waitForAIService(200, 50); // Very short timeout

      expect(result).toBe(false);
      expect(mockExecuteJxa).toHaveBeenCalledTimes(4); // Should make multiple attempts
    });

    it('should return true immediately if service is already available', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        isAvailable: true,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: ['ChatGPT'],
        defaultEngine: 'ChatGPT',
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      const result = await waitForAIService(1000, 100);

      expect(result).toBe(true);
      expect(mockExecuteJxa).toHaveBeenCalledTimes(1); // Only one call needed
    });
  });

  describe('Cache Management', () => {
    it('should clear cache when requested', async () => {
      mockExecuteJxa.mockResolvedValue({
        isAvailable: true,
        devonthinkRunning: true,
        aiFeatureEnabled: true,
        availableEngines: ['ChatGPT'],
        defaultEngine: 'ChatGPT',
        warnings: [],
        lastChecked: new Date().toISOString()
      });

      // First call should cache result
      await checkAIServiceAvailability();
      expect(mockExecuteJxa).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await checkAIServiceAvailability();
      expect(mockExecuteJxa).toHaveBeenCalledTimes(1);

      // Clear cache
      clearAIStatusCache();

      // Third call should make new request
      await checkAIServiceAvailability();
      expect(mockExecuteJxa).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JXA responses', async () => {
      mockExecuteJxa.mockResolvedValueOnce({
        // Missing required fields
        someRandomField: 'value'
      });

      const status = await checkAIServiceAvailability();

      expect(status.isAvailable).toBe(false);
      expect(status.devonthinkRunning).toBe(false);
      expect(status.availableEngines).toEqual([]);
    });

    it('should handle null/undefined JXA responses', async () => {
      mockExecuteJxa.mockResolvedValueOnce(null);

      const status = await checkAIServiceAvailability();

      expect(status.isAvailable).toBe(false);
      expect(status.availableEngines).toEqual([]);
    });

    it('should handle JXA timeout errors', async () => {
      mockExecuteJxa.mockRejectedValueOnce(new Error('Timeout'));

      const status = await checkAIServiceAvailability();

      expect(status.isAvailable).toBe(false);
      expect(status.error).toContain('Failed to check AI service availability: Timeout');
    });
  });
});