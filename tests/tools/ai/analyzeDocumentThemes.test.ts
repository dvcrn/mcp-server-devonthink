/**
 * Test suite for analyzeDocumentThemes tool
 * Validates comprehensive document theme analysis functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeDocumentThemesTool } from '../../../src/tools/ai/analyzeDocumentThemes.js';
import { executeJxa } from '../../../src/applescript/execute.js';
import { checkAIServiceSimple } from '../../../src/tools/ai/utils/simpleAIChecker.js';

// Mock the executeJxa function and AI service availability
vi.mock('../../../src/applescript/execute.js');
vi.mock('../../../src/tools/ai/utils/simpleAIChecker.js');

const mockExecuteJxa = vi.mocked(executeJxa);
const mockCheckAIServiceSimple = vi.mocked(checkAIServiceSimple);

describe('analyzeDocumentThemes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock AI service availability to be available by default
    mockCheckAIServiceSimple.mockResolvedValue({ 
      success: true, 
      devonthinkRunning: true,
      aiEnginesConfigured: ['ChatGPT'] 
    });
  });

  describe('Input Schema Validation', () => {
    it('should accept valid single document UUID input', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: [
            {
              theme: "Software Development",
              description: "Technical documentation about software engineering practices",
              confidence: 0.9,
              subthemes: ["Code Quality", "Testing"],
              evidence: ["mentions unit testing", "code review processes"],
              frequency: 15
            }
          ],
          overallSummary: "Document focuses on software engineering best practices",
          conceptualFramework: ["Technical", "Educational", "Professional"],
          documentsCovered: 1,
          analysisType: "comprehensive"
        },
        documents: [{
          uuid: "12345678-1234-1234-1234-123456789abc",
          name: "Dev Guide.md",
          contribution: "Primary source for technical themes"
        }],
        metadata: {
          processingTime: 2500,
          themeCount: 3,
          documentCount: 1
        }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: {
          uuid: "12345678-1234-1234-1234-123456789abc"
        },
        analysisType: "comprehensive" as const,
        maxThemes: 5,
        includeSubthemes: true,
        themeDepth: "deep" as const,
        format: "structured" as const,
        includeConfidence: true,
        includeEvidence: true
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(true);
      expect(result.analysis?.mainThemes).toBeDefined();
      expect(result.analysis?.mainThemes?.[0]?.theme).toBe("Software Development");
    });

    it('should accept valid multiple documents search query input', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: [
            {
              theme: "Project Management",
              description: "Themes related to organizing and managing work",
              confidence: 0.8,
              frequency: 12
            },
            {
              theme: "Team Collaboration",
              description: "Communication and teamwork aspects",
              confidence: 0.7,
              frequency: 8
            }
          ],
          overallSummary: "Documents focus on organizational and collaborative aspects of work",
          documentsCovered: 5,
          analysisType: "topics"
        },
        documents: [
          { uuid: "doc1", name: "Meeting Notes.md", contribution: "Team collaboration themes" },
          { uuid: "doc2", name: "Project Plan.docx", contribution: "Management themes" }
        ],
        metadata: {
          processingTime: 4200,
          themeCount: 2,
          documentCount: 5
        }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: {
          searchQuery: "meeting project team"
        },
        analysisType: "topics" as const,
        maxThemes: 10,
        themeDepth: "surface" as const
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(true);
      expect(result.analysis?.documentsCovered).toBe(5);
    });

    it('should accept valid group analysis input', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: [
            {
              theme: "Research Methods",
              description: "Methodological approaches to investigation",
              confidence: 0.85
            }
          ],
          overallSummary: "Research-focused content with methodological themes",
          documentsCovered: 8,
          analysisType: "concepts"
        },
        documents: [],
        metadata: {
          processingTime: 3800,
          themeCount: 1,
          documentCount: 8
        }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: {
          groupUuid: "12345678-1234-1234-1234-123456789def"
        },
        analysisType: "concepts" as const,
        format: "hierarchical" as const
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(true);
    });

    it('should reject input without target specification', async () => {
      const input = {
        analysisType: "comprehensive" as const
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(false);
      expect(result.error).toContain("target: Required");
    });

    it('should reject invalid analysisType', async () => {
      const input = {
        target: { uuid: "12345678-1234-1234-1234-123456789abc" },
        // @ts-expect-error - testing invalid input
        analysisType: "invalid-type"
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(false);
      expect(result.error).toContain("analysisType");
    });

    it('should reject maxThemes exceeding limit', async () => {
      const input = {
        target: { uuid: "12345678-1234-1234-1234-123456789abc" },
        maxThemes: 25 // exceeds max of 20
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(false);
      expect(result.error).toContain("maxThemes");
    });

    it('should apply default values correctly', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: [],
          documentsCovered: 1,
          analysisType: "concepts"
        },
        documents: [],
        metadata: {
          processingTime: 1000,
          themeCount: 0,
          documentCount: 1
        }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { uuid: "12345678-1234-1234-1234-123456789abc" }
      };

      await analyzeDocumentThemesTool.run(input);
      
      const scriptCall = mockExecuteJxa.mock.calls[0][0];
      expect(scriptCall).toContain('const maxThemes = 5');
      expect(scriptCall).toContain('const includeSubthemes = false');
      expect(scriptCall).toContain('const themeDepth = "surface"');
      expect(scriptCall).toContain('const analysisType = "concepts"');
      expect(scriptCall).toContain('const format = "structured"');
    });
  });

  describe('Document Target Resolution', () => {
    it('should handle UUID lookup correctly', async () => {
      const mockResult = {
        success: true,
        analysis: { mainThemes: [], documentsCovered: 1, analysisType: "concepts" },
        documents: [],
        metadata: { processingTime: 1000, themeCount: 0, documentCount: 1 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { uuid: "12345678-1234-1234-1234-123456789def" }
      };

      await analyzeDocumentThemesTool.run(input);
      
      const scriptCall = mockExecuteJxa.mock.calls[0][0];
      expect(scriptCall).toContain('recordUuid = "12345678-1234-1234-1234-123456789def"');
      expect(scriptCall).toContain('lookupOptions["uuid"] = recordUuid');
    });

    it('should handle recordId and databaseName lookup', async () => {
      const mockResult = {
        success: true,
        analysis: { mainThemes: [], documentsCovered: 1, analysisType: "concepts" },
        documents: [],
        metadata: { processingTime: 1000, themeCount: 0, documentCount: 1 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: {
          recordId: 12345,
          databaseName: "Test Database"
        }
      };

      await analyzeDocumentThemesTool.run(input);
      
      const scriptCall = mockExecuteJxa.mock.calls[0][0];
      expect(scriptCall).toContain('recordId = 12345');
      expect(scriptCall).toContain('databaseName = "Test Database"');
    });

    it('should handle record path lookup', async () => {
      const mockResult = {
        success: true,
        analysis: { mainThemes: [], documentsCovered: 1, analysisType: "concepts" },
        documents: [],
        metadata: { processingTime: 1000, themeCount: 0, documentCount: 1 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: {
          recordPath: "/Projects/Research/Analysis.pdf"
        }
      };

      await analyzeDocumentThemesTool.run(input);
      
      const scriptCall = mockExecuteJxa.mock.calls[0][0];
      expect(scriptCall).toContain('recordPath = "/Projects/Research/Analysis.pdf"');
    });

    it('should handle multiple document UUIDs', async () => {
      const mockResult = {
        success: true,
        analysis: { mainThemes: [], documentsCovered: 3, analysisType: "concepts" },
        documents: [],
        metadata: { processingTime: 2000, themeCount: 0, documentCount: 3 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: {
          uuids: ["12345678-1234-1234-1234-123456789001", "12345678-1234-1234-1234-123456789002", "12345678-1234-1234-1234-123456789003"]
        }
      };

      await analyzeDocumentThemesTool.run(input);
      
      const scriptCall = mockExecuteJxa.mock.calls[0][0];
      expect(scriptCall).toContain('recordUuids = ["12345678-1234-1234-1234-123456789001","12345678-1234-1234-1234-123456789002","12345678-1234-1234-1234-123456789003"]');
    });

    it('should handle search query for document discovery', async () => {
      const mockResult = {
        success: true,
        analysis: { mainThemes: [], documentsCovered: 4, analysisType: "concepts" },
        documents: [],
        metadata: { processingTime: 3000, themeCount: 0, documentCount: 4 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: {
          searchQuery: "research methodology academic"
        }
      };

      await analyzeDocumentThemesTool.run(input);
      
      const scriptCall = mockExecuteJxa.mock.calls[0][0];
      expect(scriptCall).toContain('searchQuery = "research methodology academic"');
    });

    it('should handle group-based analysis', async () => {
      const mockResult = {
        success: true,
        analysis: { mainThemes: [], documentsCovered: 6, analysisType: "concepts" },
        documents: [],
        metadata: { processingTime: 4000, themeCount: 0, documentCount: 6 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: {
          groupUuid: "12345678-1234-1234-1234-123456789xyz"
        }
      };

      await analyzeDocumentThemesTool.run(input);
      
      const scriptCall = mockExecuteJxa.mock.calls[0][0];
      expect(scriptCall).toContain('groupUuid = "12345678-1234-1234-1234-123456789xyz"');
    });
  });

  describe('Analysis Configuration', () => {
    it('should configure concepts analysis correctly', async () => {
      const mockResult = {
        success: true,
        analysis: { mainThemes: [], documentsCovered: 1, analysisType: "concepts" },
        documents: [],
        metadata: { processingTime: 1500, themeCount: 0, documentCount: 1 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { uuid: "test-uuid" },
        analysisType: "concepts" as const,
        themeDepth: "comprehensive" as const
      };

      await analyzeDocumentThemesTool.run(input);
      
      const scriptCall = mockExecuteJxa.mock.calls[0][0];
      expect(scriptCall).toContain('analysisType = "concepts"');
      expect(scriptCall).toContain('themeDepth = "comprehensive"');
    });

    it('should configure topics analysis correctly', async () => {
      const mockResult = {
        success: true,
        analysis: { mainThemes: [], documentsCovered: 1, analysisType: "topics" },
        documents: [],
        metadata: { processingTime: 1500, themeCount: 0, documentCount: 1 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { uuid: "test-uuid" },
        analysisType: "topics" as const,
        includeSubthemes: true
      };

      await analyzeDocumentThemesTool.run(input);
      
      const scriptCall = mockExecuteJxa.mock.calls[0][0];
      expect(scriptCall).toContain('analysisType = "topics"');
      expect(scriptCall).toContain('includeSubthemes = true');
    });

    it('should configure sentiment analysis correctly', async () => {
      const mockResult = {
        success: true,
        analysis: { mainThemes: [], documentsCovered: 1, analysisType: "sentiment" },
        documents: [],
        metadata: { processingTime: 1500, themeCount: 0, documentCount: 1 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { uuid: "test-uuid" },
        analysisType: "sentiment" as const,
        includeConfidence: true,
        includeEvidence: true
      };

      await analyzeDocumentThemesTool.run(input);
      
      const scriptCall = mockExecuteJxa.mock.calls[0][0];
      expect(scriptCall).toContain('analysisType = "sentiment"');
      expect(scriptCall).toContain('includeConfidence = true');
      expect(scriptCall).toContain('includeEvidence = true');
    });

    it('should configure comprehensive analysis correctly', async () => {
      const mockResult = {
        success: true,
        analysis: { mainThemes: [], documentsCovered: 1, analysisType: "comprehensive" },
        documents: [],
        metadata: { processingTime: 2500, themeCount: 0, documentCount: 1 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { uuid: "test-uuid" },
        analysisType: "comprehensive" as const,
        maxThemes: 15,
        format: "hierarchical" as const
      };

      await analyzeDocumentThemesTool.run(input);
      
      const scriptCall = mockExecuteJxa.mock.calls[0][0];
      expect(scriptCall).toContain('analysisType = "comprehensive"');
      expect(scriptCall).toContain('maxThemes = 15');
      expect(scriptCall).toContain('format = "hierarchical"');
    });
  });

  describe('Output Format Handling', () => {
    it('should handle structured format output', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: [
            {
              theme: "Data Analysis",
              description: "Statistical analysis and data interpretation",
              confidence: 0.92,
              subthemes: ["Statistics", "Visualization"],
              evidence: ["statistical methods", "data charts"],
              frequency: 20
            }
          ],
          overallSummary: "Document covers data analysis methodologies",
          conceptualFramework: ["Analytical", "Technical"],
          documentsCovered: 1,
          analysisType: "comprehensive"
        },
        documents: [],
        metadata: { processingTime: 2000, themeCount: 1, documentCount: 1 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { uuid: "test-uuid" },
        format: "structured" as const,
        includeConfidence: true,
        includeEvidence: true
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(true);
      expect(result.analysis?.mainThemes?.[0]?.confidence).toBe(0.92);
      expect(result.analysis?.mainThemes?.[0]?.evidence).toEqual(["statistical methods", "data charts"]);
    });

    it('should handle narrative format output', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: [
            {
              theme: "Creative Writing",
              description: "The document explores various aspects of creative writing, including narrative techniques, character development, and storytelling methods. The themes suggest a comprehensive guide for aspiring writers."
            }
          ],
          overallSummary: "This is a comprehensive narrative exploring creative writing techniques and methodologies for storytelling excellence.",
          documentsCovered: 1,
          analysisType: "concepts"
        },
        documents: [],
        metadata: { processingTime: 1800, themeCount: 1, documentCount: 1 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { uuid: "test-uuid" },
        format: "narrative" as const
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(true);
      expect(result.analysis?.overallSummary).toContain("comprehensive narrative");
    });

    it('should handle hierarchical format output', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: [
            {
              theme: "Technology",
              description: "Overarching technology themes",
              subthemes: ["Software Development", "Hardware Design", "System Architecture"]
            },
            {
              theme: "Software Development",
              description: "Software-specific themes",
              subthemes: ["Programming Languages", "Testing", "Deployment"]
            }
          ],
          conceptualFramework: ["Technical", "Educational", "Professional"],
          documentsCovered: 1,
          analysisType: "comprehensive"
        },
        documents: [],
        metadata: { processingTime: 2200, themeCount: 2, documentCount: 1 }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { uuid: "test-uuid" },
        format: "hierarchical" as const,
        includeSubthemes: true
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(true);
      expect(result.analysis?.mainThemes?.[0]?.subthemes).toContain("Software Development");
    });
  });

  describe('Error Handling', () => {
    it('should handle DEVONthink not running', async () => {
      const mockError = {
        success: false,
        error: "DEVONthink is not running"
      };

      mockExecuteJxa.mockResolvedValue(mockError);

      const input = {
        target: { uuid: "12345678-1234-1234-1234-123456789abc" }
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(false);
      expect(result.error).toContain("DEVONthink is not running");
    });

    it('should handle record not found', async () => {
      const mockError = {
        success: false,
        error: "Record not found with UUID: 12345678-1234-1234-1234-123456789abc"
      };

      mockExecuteJxa.mockResolvedValue(mockError);

      const input = {
        target: { uuid: "12345678-1234-1234-1234-123456789abc" }
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Record not found");
    });

    it('should handle AI service unavailable', async () => {
      const mockError = {
        success: false,
        error: "AI service not available"
      };

      mockExecuteJxa.mockResolvedValue(mockError);

      const input = {
        target: { uuid: "12345678-1234-1234-1234-123456789abc" }
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(false);
      expect(result.error).toContain("AI service not available");
    });

    it('should handle empty document set', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: [],
          documentsCovered: 0,
          analysisType: "concepts"
        },
        documents: [],
        metadata: {
          processingTime: 500,
          themeCount: 0,
          documentCount: 0
        },
        warnings: ["No documents found matching the specified criteria"]
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { searchQuery: "nonexistent content" }
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(true);
      expect(result.warnings).toContain("No documents found");
      expect(result.analysis?.documentsCovered).toBe(0);
    });

    it('should handle JXA execution errors', async () => {
      mockExecuteJxa.mockRejectedValue(new Error("JXA script execution failed"));

      const input = {
        target: { uuid: "12345678-1234-1234-1234-123456789abc" }
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(false);
      expect(result.error).toContain("execution failed");
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large document collections efficiently', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: Array.from({ length: 10 }, (_, i) => ({
            theme: `Theme ${i + 1}`,
            description: `Description for theme ${i + 1}`,
            frequency: 10 - i
          })),
          documentsCovered: 50,
          analysisType: "topics"
        },
        documents: Array.from({ length: 50 }, (_, i) => ({
          uuid: `doc-uuid-${i}`,
          name: `Document ${i + 1}.pdf`,
          contribution: `Contributes to themes ${Math.floor(i/5) + 1}-${Math.floor(i/5) + 2}`
        })),
        metadata: {
          processingTime: 12000, // 12 seconds - acceptable for 50 docs
          themeCount: 10,
          documentCount: 50
        }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { groupUuid: "12345678-1234-1234-1234-large1234567" },
        maxThemes: 10,
        themeDepth: "surface" as const
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(true);
      expect(result.analysis?.documentsCovered).toBe(50);
      expect(result.metadata?.processingTime).toBeLessThan(15000); // Under 15 seconds
    });

    it('should enforce performance timeout for excessive processing', async () => {
      const mockError = {
        success: false,
        error: "Analysis timed out after processing for 60 seconds",
        metadata: {
          processingTime: 60000,
          themeCount: 0,
          documentCount: 100
        }
      };

      mockExecuteJxa.mockResolvedValue(mockError);

      const input = {
        target: { groupUuid: "12345678-1234-1234-1234-massive12345" },
        analysisType: "comprehensive" as const,
        themeDepth: "comprehensive" as const
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(false);
      expect(result.error).toContain("timed out");
    });
  });

  describe('Integration and Compatibility', () => {
    it('should work with various document types', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: [
            {
              theme: "Mixed Content Analysis",
              description: "Themes extracted from multiple document formats",
              frequency: 8
            }
          ],
          documentsCovered: 6,
          analysisType: "concepts"
        },
        documents: [
          { uuid: "12345678-1234-1234-1234-123456789pdf", name: "Report.pdf", contribution: "Structured content" },
          { uuid: "12345678-1234-1234-1234-12345678word", name: "Notes.docx", contribution: "Rich text themes" },
          { uuid: "12345678-1234-1234-1234-1234567890md", name: "README.md", contribution: "Technical documentation" },
          { uuid: "12345678-1234-1234-1234-12345678txt", name: "notes.txt", contribution: "Plain text insights" },
          { uuid: "12345678-1234-1234-1234-123456789rtf", name: "formatted.rtf", contribution: "Formatted text themes" },
          { uuid: "12345678-1234-1234-1234-123456789htm", name: "webpage.html", contribution: "Web content analysis" }
        ],
        metadata: {
          processingTime: 3500,
          themeCount: 1,
          documentCount: 6
        }
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { searchQuery: "content analysis document types" }
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(true);
      expect(result.documents?.some(doc => doc.name.endsWith('.pdf'))).toBe(true);
      expect(result.documents?.some(doc => doc.name.endsWith('.docx'))).toBe(true);
      expect(result.documents?.some(doc => doc.name.endsWith('.md'))).toBe(true);
    });

    it('should provide useful recommendations for theme organization', async () => {
      const mockResult = {
        success: true,
        analysis: {
          mainThemes: [
            {
              theme: "Project Management",
              description: "Organizational and planning themes",
              confidence: 0.75
            }
          ],
          documentsCovered: 3,
          analysisType: "concepts"
        },
        documents: [],
        metadata: {
          processingTime: 2000,
          themeCount: 1,
          documentCount: 3
        },
        recommendations: [
          "Consider creating folders based on the identified themes",
          "Use theme keywords as tags for better document organization",
          "Group related themes into higher-level categories"
        ]
      };

      mockExecuteJxa.mockResolvedValue(mockResult);

      const input = {
        target: { uuid: "12345678-1234-1234-1234-project12345" }
      };

      const result = await analyzeDocumentThemesTool.run(input);
      expect(result.success).toBe(true);
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations?.length).toBeGreaterThan(0);
    });
  });

  describe('Tool Definition Validation', () => {
    it('should have correct tool name', () => {
      expect(analyzeDocumentThemesTool.name).toBe('analyze_document_themes');
    });

    it('should have comprehensive description', () => {
      expect(analyzeDocumentThemesTool.description).toBeDefined();
      expect(analyzeDocumentThemesTool.description.length).toBeGreaterThan(100);
      expect(analyzeDocumentThemesTool.description).toContain('theme');
      expect(analyzeDocumentThemesTool.description).toContain('analysis');
    });

    it('should have valid input schema', () => {
      expect(analyzeDocumentThemesTool.inputSchema).toBeDefined();
      expect(typeof analyzeDocumentThemesTool.inputSchema).toBe('object');
    });

    it('should have run function', () => {
      expect(typeof analyzeDocumentThemesTool.run).toBe('function');
    });
  });
});