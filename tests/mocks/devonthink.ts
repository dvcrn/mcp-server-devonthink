/**
 * DEVONthink Mock Utilities
 * Provides comprehensive mocks for DEVONthink JXA interactions
 */

import { vi } from 'vitest';

// Mock DEVONthink record structure
export interface MockRecord {
  id: number;
  uuid: string;
  name: string;
  type: string;
  location: string;
  database: string;
  content?: string;
  tags?: string[];
  creationDate?: Date;
  modificationDate?: Date;
}

// Mock database structure
export interface MockDatabase {
  id: number;
  uuid: string;
  name: string;
  path: string;
  isOpen: boolean;
}

// Default mock data
export const MOCK_RECORDS: MockRecord[] = [
  {
    id: 12345,
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Document.md',
    type: 'markdown',
    location: '/Inbox/Test Document.md',
    database: 'Test Database',
    content: '# Test Document\n\nThis is a test document.',
    tags: ['test', 'document'],
    creationDate: new Date('2024-01-01T10:00:00Z'),
    modificationDate: new Date('2024-01-02T10:00:00Z')
  },
  {
    id: 67890,
    uuid: '456e7890-e89b-12d3-a456-426614174001',
    name: 'Another Document.txt',
    type: 'txt',
    location: '/Projects/Another Document.txt',
    database: 'Test Database',
    content: 'Plain text content here.',
    tags: ['project', 'text']
  }
];

export const MOCK_DATABASES: MockDatabase[] = [
  {
    id: 1,
    uuid: 'db-123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Database',
    path: '/Users/test/Databases/Test Database.dtBase2',
    isOpen: true
  },
  {
    id: 2,
    uuid: 'db-456e7890-e89b-12d3-a456-426614174001',
    name: 'Archive Database',
    path: '/Users/test/Databases/Archive.dtBase2',
    isOpen: false
  }
];

// Mock AI service availability responses
export const MOCK_AI_AVAILABILITY = {
  chatgpt: {
    available: true,
    version: '4.0',
    features: ['chat', 'summarize', 'classify']
  },
  claude: {
    available: true,
    version: '3.5',
    features: ['chat', 'summarize', 'analyze']
  },
  gemini: {
    available: false,
    error: 'Service not configured'
  }
};

// Mock AI responses
export const MOCK_AI_RESPONSES = {
  chat: {
    success: true,
    response: 'This is a mock AI chat response.',
    usage: { tokens: 150 }
  },
  summarize: {
    success: true,
    response: 'This is a mock summary of the content.',
    usage: { tokens: 75 }
  },
  classify: {
    success: true,
    response: JSON.stringify({
      categories: ['Document', 'Research'],
      confidence: 0.85,
      suggestions: ['Move to Research folder', 'Add tag: important']
    }),
    usage: { tokens: 100 }
  },
  error: {
    success: false,
    error: 'Mock AI service error'
  }
};

/**
 * Creates mock JXA execution responses
 */
export function createMockJXAResponse<T>(data: T): Promise<T> {
  return Promise.resolve(data);
}

/**
 * Creates mock JXA execution that throws an error
 */
export function createMockJXAError(error: string): Promise<never> {
  return Promise.reject(new Error(error));
}

/**
 * Mock executeJxa function - properly defined for Vitest hoisting
 */
export const mockExecuteJxa = vi.fn();

/**
 * Sets up default JXA mock behaviors
 */
export function setupDefaultJXAMocks(mockFn = mockExecuteJxa) {
  mockFn.mockImplementation((script: string) => {
    // Parse common DEVONthink operations from script content
    
    // Mock DEVONthink availability check
    if (script.includes('Application("DEVONthink").running')) {
      return createMockJXAResponse({ success: true, isRunning: true });
    }
    
    // Mock AI service availability
    if (script.includes('theApp.aiServiceAvailable')) {
      return createMockJXAResponse(MOCK_AI_AVAILABILITY);
    }
    
    // Mock AI chat operations
    if (script.includes('theApp.performSmartRule') && script.includes('chat')) {
      return createMockJXAResponse(MOCK_AI_RESPONSES.chat);
    }
    
    // Mock AI summarize operations
    if (script.includes('theApp.performSmartRule') && script.includes('summarize')) {
      return createMockJXAResponse(MOCK_AI_RESPONSES.summarize);
    }
    
    // Mock AI classify operations
    if (script.includes('theApp.performSmartRule') && script.includes('classify')) {
      return createMockJXAResponse(MOCK_AI_RESPONSES.classify);
    }
    
    // Mock record lookup by UUID
    if (script.includes('getRecordWithUuid')) {
      const record = MOCK_RECORDS.find(r => script.includes(r.uuid));
      if (record) {
        return createMockJXAResponse({ success: true, record });
      }
      return createMockJXAResponse({ success: false, error: 'Record not found' });
    }
    
    // Mock database listing
    if (script.includes('databases')) {
      return createMockJXAResponse({ 
        success: true, 
        databases: MOCK_DATABASES.filter(db => db.isOpen) 
      });
    }
    
    // Default successful response
    return createMockJXAResponse({ success: true });
  });
}

/**
 * Sets up mock for AI service unavailable
 */
export function setupAIUnavailableMocks(mockFn = mockExecuteJxa) {
  mockFn.mockImplementation((script: string) => {
    // Check for the AI service availability script pattern
    if (script.includes('devonthinkRunning') && script.includes('aiFeatureEnabled')) {
      // AI service availability check - DEVONthink running but AI features disabled
      return Promise.resolve({
        isAvailable: false,
        devonthinkRunning: true,
        aiFeatureEnabled: false,
        availableEngines: [],
        defaultEngine: null,
        engineDetails: {},
        warnings: ['AI features are not enabled'],
        lastChecked: new Date().toISOString(),
        version: 'DEVONthink 3.9.0'
      });
    }
    
    if (script.includes('checkAIServiceAvailability')) {
      // AI service availability check - DEVONthink running but AI features disabled
      return Promise.resolve({
        isAvailable: false,
        devonthinkRunning: true,
        aiFeatureEnabled: false,
        availableEngines: [],
        defaultEngine: null,
        engineDetails: {},
        warnings: ['AI features are not enabled'],
        lastChecked: new Date().toISOString(),
        version: 'DEVONthink 3.9.0'
      });
    }
    
    if (script.includes('aiServiceAvailable')) {
      return createMockJXAResponse({
        chatgpt: { available: false, error: 'Service not available' },
        claude: { available: false, error: 'Service not available' },
        gemini: { available: false, error: 'Service not available' }
      });
    }
    
    if (script.includes('performSmartRule')) {
      return createMockJXAResponse({ 
        success: false, 
        error: 'AI service not available' 
      });
    }
    
    return createMockJXAResponse({ success: true });
  });
}

/**
 * Sets up mock for DEVONthink not running
 */
export function setupDevonThinkNotRunningMocks(mockFn = mockExecuteJxa) {
  mockFn.mockImplementation((script: string) => {
    if (script.includes('Application("DEVONthink").running')) {
      return createMockJXAResponse({ success: true, isRunning: false });
    }
    
    // Any other DEVONthink operation should fail
    return createMockJXAError('DEVONthink is not running');
  });
}

/**
 * Sets up mock for network/timeout errors
 */
export function setupNetworkErrorMocks(mockFn = mockExecuteJxa) {
  mockFn.mockImplementation(() => {
    return createMockJXAError('Network timeout');
  });
}

/**
 * Creates a mock record with specified properties
 */
export function createMockRecord(overrides: Partial<MockRecord> = {}): MockRecord {
  return {
    id: 99999,
    uuid: 'mock-' + Math.random().toString(36).substr(2, 9),
    name: 'Mock Document.md',
    type: 'markdown',
    location: '/Test/Mock Document.md',
    database: 'Test Database',
    content: 'Mock document content',
    tags: ['mock', 'test'],
    creationDate: new Date(),
    modificationDate: new Date(),
    ...overrides
  };
}

/**
 * Creates a mock database with specified properties
 */
export function createMockDatabase(overrides: Partial<MockDatabase> = {}): MockDatabase {
  return {
    id: 999,
    uuid: 'db-mock-' + Math.random().toString(36).substr(2, 9),
    name: 'Mock Database',
    path: '/Users/test/Databases/Mock.dtBase2',
    isOpen: true,
    ...overrides
  };
}