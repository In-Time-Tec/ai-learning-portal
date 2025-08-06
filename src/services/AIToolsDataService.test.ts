import { AIToolsDataService } from './AIToolsDataService';
import { AITool, AIToolsData, ToolCategory, UserExperience } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('AIToolsDataService', () => {
  let service: AIToolsDataService;
  
  const mockUserExperiences: UserExperience[] = [
    {
      id: 'exp-1',
      quote: 'Fully sold after a few hours',
      context: 'Team adoption',
      useCase: 'Regular meetings to upskill in usage',
      sentiment: 'positive',
      role: 'engineer'
    },
    {
      id: 'exp-2',
      quote: 'Using as an Advisor instead of an Engineer',
      context: 'Customer Success Experience',
      useCase: 'Provides instructions, requests permissions to perform actions',
      sentiment: 'positive',
      role: 'business'
    }
  ];

  const mockTools: AITool[] = [
    {
      id: 'warp',
      name: 'Warp',
      category: 'code-assistant',
      description: 'AI-powered terminal and development assistant',
      officialLink: 'https://warp.dev',
      userExperiences: mockUserExperiences,
      commonUseCases: ['Debugging and refactoring', 'Understanding code'],
      integrations: ['ADO (Azure DevOps)'],
      teamAdoption: {
        level: 'team',
        notes: 'Having regular meetings to upskill in usage'
      }
    },
    {
      id: 'copilot',
      name: 'GitHub Copilot',
      category: 'ide-extension',
      description: 'AI pair programmer that helps you write code faster',
      officialLink: 'https://github.com/features/copilot',
      userExperiences: [
        {
          id: 'exp-3',
          quote: 'Can\'t go back to without using AI',
          context: 'Daily development workflow',
          useCase: 'Code completion and generation',
          sentiment: 'positive',
          role: 'engineer'
        }
      ],
      commonUseCases: ['Code completion', 'Unit testing', 'Documentation'],
      integrations: ['VS Code', 'GitHub'],
      teamAdoption: {
        level: 'individual',
        notes: 'Individual developers using it for productivity'
      }
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      category: 'research-tool',
      description: 'AI-powered research and information gathering tool',
      officialLink: 'https://perplexity.ai',
      userExperiences: [
        {
          id: 'exp-4',
          quote: 'Great for quick research',
          context: 'Research workflow',
          useCase: 'Finding technical documentation',
          sentiment: 'positive',
          role: 'pm-designer'
        }
      ],
      commonUseCases: ['Research', 'Documentation lookup'],
      licensingNotes: 'IT is figuring that out'
    }
  ];

  const mockToolsData: AIToolsData = {
    tools: mockTools,
    categories: {
      'code-assistant': {
        label: 'Code Assistant',
        description: 'AI-powered coding assistance and code generation tools'
      },
      'ide-extension': {
        label: 'IDE Extension',
        description: 'Integrated development environment extensions and plugins'
      },
      'research-tool': {
        label: 'Research Tool',
        description: 'Tools for research, documentation, and information gathering'
      },
      'debugging-tool': {
        label: 'Debugging Tool',
        description: 'Tools for debugging and troubleshooting code'
      },
      'testing-tool': {
        label: 'Testing Tool',
        description: 'Tools for automated testing and quality assurance'
      },
      'terminal-tool': {
        label: 'Terminal Tool',
        description: 'AI-enhanced terminal and command-line interfaces'
      }
    }
  };

  beforeEach(() => {
    service = new AIToolsDataService();
    jest.clearAllMocks();
  });

  describe('loadTools', () => {
    it('should load AI tools successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.loadTools();

      expect(fetch).toHaveBeenCalledWith('/ai-tools.json', expect.objectContaining({
        headers: { 'Cache-Control': 'no-cache' }
      }));
      expect(result).toEqual(mockTools);
    });

    it('should return cached tools on subsequent calls', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await service.loadTools();
      const result = await service.loadTools();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTools);
    });

    it('should handle PUBLIC_URL environment variable', async () => {
      const originalEnv = process.env.PUBLIC_URL;
      process.env.PUBLIC_URL = '/test-path';

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await service.loadTools();

      expect(fetch).toHaveBeenCalledWith('/test-path/ai-tools.json', expect.any(Object));
      
      process.env.PUBLIC_URL = originalEnv;
    });

    it('should throw error when fetch fails with 404', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadTools()).rejects.toThrow(
        'AI tools data file not found. Please check if ai-tools.json exists in the public folder.'
      );
    });

    it('should throw error when fetch fails with server error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadTools()).rejects.toThrow(
        'Server error while loading AI tools data. Please try again later.'
      );
    });

    it('should throw error when fetch fails with other status', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadTools()).rejects.toThrow(
        'Failed to load AI tools: 403 Forbidden'
      );
    });

    it('should throw error when JSON is malformed', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token'))
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadTools()).rejects.toThrow(
        'Invalid AI tools data format: file contains malformed JSON'
      );
    });

    it('should throw error when data is not an object', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue('invalid data')
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadTools()).rejects.toThrow(
        'Invalid AI tools data format: expected JSON object'
      );
    });

    it('should throw error when data structure is invalid', async () => {
      const invalidData = {
        tools: [{ invalid: 'tool' }],
        categories: {}
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(invalidData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadTools()).rejects.toThrow(
        'Invalid AI tools data format: data structure does not match expected format'
      );
    });

    it('should throw error when no tools found', async () => {
      const emptyData = {
        tools: [],
        categories: mockToolsData.categories
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(emptyData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadTools()).rejects.toThrow(
        'No AI tools found in data file. Please check the ai-tools data format.'
      );
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(service.loadTools()).rejects.toThrow(
        'Network error: Unable to connect to load AI tools data. Please check your internet connection.'
      );
    });

    it('should handle timeout errors', async () => {
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      (fetch as jest.Mock).mockRejectedValue(abortError);

      await expect(service.loadTools()).rejects.toThrow(
        'Request timeout: Loading AI tools data took too long. Please try again.'
      );
    });
  });

  describe('getToolById', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadTools();
    });

    it('should return tool for valid ID', () => {
      const result = service.getToolById('warp');
      expect(result).toEqual(mockTools[0]);
    });

    it('should return undefined for invalid ID', () => {
      const result = service.getToolById('non-existent');
      expect(result).toBeUndefined();
    });

    it('should return undefined when data not loaded', () => {
      const newService = new AIToolsDataService();
      const result = newService.getToolById('warp');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllTools', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadTools();
    });

    it('should return all tools', () => {
      const result = service.getAllTools();
      expect(result).toEqual(mockTools);
    });

    it('should return a copy of tools array', () => {
      const result = service.getAllTools();
      expect(result).not.toBe(mockTools);
      result.push({} as AITool);
      expect(service.getAllTools()).toHaveLength(3);
    });

    it('should return empty array when data not loaded', () => {
      const newService = new AIToolsDataService();
      const result = newService.getAllTools();
      expect(result).toEqual([]);
    });
  });

  describe('filterByCategory', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadTools();
    });

    it('should filter tools by code-assistant category', () => {
      const result = service.filterByCategory('code-assistant');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Warp');
    });

    it('should filter tools by ide-extension category', () => {
      const result = service.filterByCategory('ide-extension');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('GitHub Copilot');
    });

    it('should filter tools by research-tool category', () => {
      const result = service.filterByCategory('research-tool');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Perplexity');
    });

    it('should return empty array for category with no tools', () => {
      const result = service.filterByCategory('debugging-tool');
      expect(result).toEqual([]);
    });

    it('should return empty array when data not loaded', () => {
      const newService = new AIToolsDataService();
      const result = newService.filterByCategory('code-assistant');
      expect(result).toEqual([]);
    });
  });

  describe('searchTools', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadTools();
    });

    it('should return all tools for empty query', () => {
      const result = service.searchTools('');
      expect(result).toEqual(mockTools);
    });

    it('should return all tools for whitespace query', () => {
      const result = service.searchTools('   ');
      expect(result).toEqual(mockTools);
    });

    it('should search by tool name', () => {
      const result = service.searchTools('Warp');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Warp');
    });

    it('should search by description', () => {
      const result = service.searchTools('terminal');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Warp');
    });

    it('should search by use cases', () => {
      const result = service.searchTools('debugging');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Warp');
    });

    it('should search by user experience quotes', () => {
      const result = service.searchTools('fully sold');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Warp');
    });

    it('should search by user experience context', () => {
      const result = service.searchTools('team adoption');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Warp');
    });

    it('should search by integrations', () => {
      const result = service.searchTools('ADO');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Warp');
    });

    it('should be case insensitive', () => {
      const result = service.searchTools('WARP');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Warp');
    });

    it('should return empty array for no matches', () => {
      const result = service.searchTools('nonexistent');
      expect(result).toHaveLength(0);
    });

    it('should return empty array when data not loaded', () => {
      const newService = new AIToolsDataService();
      const result = newService.searchTools('warp');
      expect(result).toEqual([]);
    });
  });

  describe('getToolsSorted', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadTools();
    });

    it('should return tools sorted alphabetically by name', () => {
      const result = service.getToolsSorted();
      expect(result).toHaveLength(3);
      expect(result[0]?.name).toBe('GitHub Copilot');
      expect(result[1]?.name).toBe('Perplexity');
      expect(result[2]?.name).toBe('Warp');
    });

    it('should not modify original tools array', () => {
      const originalOrder = service.getAllTools();
      service.getToolsSorted();
      const afterSort = service.getAllTools();
      expect(afterSort).toEqual(originalOrder);
    });

    it('should return empty array when data not loaded', () => {
      const newService = new AIToolsDataService();
      const result = newService.getToolsSorted();
      expect(result).toEqual([]);
    });
  });

  describe('getCategories', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadTools();
    });

    it('should return categories object', () => {
      const result = service.getCategories();
      expect(result).toEqual(mockToolsData.categories);
    });

    it('should return null when data not loaded', () => {
      const newService = new AIToolsDataService();
      const result = newService.getCategories();
      expect(result).toBeNull();
    });
  });

  describe('filterTools', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadTools();
    });

    it('should filter by category only', () => {
      const result = service.filterTools({ category: 'code-assistant' });
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Warp');
    });

    it('should filter by query only', () => {
      const result = service.filterTools({ query: 'terminal' });
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Warp');
    });

    it('should filter by hasExperiences only', () => {
      const result = service.filterTools({ hasExperiences: true });
      expect(result).toHaveLength(3); // All tools have experiences
    });

    it('should filter by hasIntegrations only', () => {
      const result = service.filterTools({ hasIntegrations: true });
      expect(result).toHaveLength(2); // Warp and Copilot have integrations
      expect(result.map(t => t.name)).toContain('Warp');
      expect(result.map(t => t.name)).toContain('GitHub Copilot');
    });

    it('should combine multiple filters', () => {
      const result = service.filterTools({ 
        category: 'ide-extension',
        hasIntegrations: true 
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('GitHub Copilot');
    });

    it('should return empty array when no tools match filters', () => {
      const result = service.filterTools({ 
        category: 'debugging-tool',
        hasIntegrations: true 
      });
      expect(result).toEqual([]);
    });

    it('should return empty array when data not loaded', () => {
      const newService = new AIToolsDataService();
      const result = newService.filterTools({ category: 'code-assistant' });
      expect(result).toEqual([]);
    });
  });

  describe('getToolsByAdoptionLevel', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadTools();
    });

    it('should filter tools by team adoption level', () => {
      const result = service.getToolsByAdoptionLevel('team');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Warp');
    });

    it('should filter tools by individual adoption level', () => {
      const result = service.getToolsByAdoptionLevel('individual');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('GitHub Copilot');
    });

    it('should return empty array for organization level', () => {
      const result = service.getToolsByAdoptionLevel('organization');
      expect(result).toEqual([]);
    });

    it('should return empty array when data not loaded', () => {
      const newService = new AIToolsDataService();
      const result = newService.getToolsByAdoptionLevel('team');
      expect(result).toEqual([]);
    });
  });

  describe('getAllUseCases', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadTools();
    });

    it('should return all unique use cases sorted', () => {
      const result = service.getAllUseCases();
      expect(result).toContain('Debugging and refactoring');
      expect(result).toContain('Understanding code');
      expect(result).toContain('Code completion');
      expect(result).toContain('Unit testing');
      expect(result).toContain('Documentation');
      expect(result).toContain('Research');
      expect(result).toContain('Documentation lookup');
      
      // Should be sorted
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });

    it('should return empty array when data not loaded', () => {
      const newService = new AIToolsDataService();
      const result = newService.getAllUseCases();
      expect(result).toEqual([]);
    });
  });

  describe('getAllIntegrations', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadTools();
    });

    it('should return all unique integrations sorted', () => {
      const result = service.getAllIntegrations();
      expect(result).toContain('ADO (Azure DevOps)');
      expect(result).toContain('VS Code');
      expect(result).toContain('GitHub');
      
      // Should be sorted
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });

    it('should return empty array when data not loaded', () => {
      const newService = new AIToolsDataService();
      const result = newService.getAllIntegrations();
      expect(result).toEqual([]);
    });
  });

  describe('isDataLoaded', () => {
    it('should return false initially', () => {
      expect(service.isDataLoaded()).toBe(false);
    });

    it('should return true after successful load', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      await service.loadTools();
      expect(service.isDataLoaded()).toBe(true);
    });

    it('should return false after failed load', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      try {
        await service.loadTools();
      } catch (error) {
        // Expected to throw
      }
      
      expect(service.isDataLoaded()).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear cached data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      await service.loadTools();
      expect(service.isDataLoaded()).toBe(true);
      
      service.clearCache();
      expect(service.isDataLoaded()).toBe(false);
      expect(service.getAllTools()).toEqual([]);
    });

    it('should force reload after cache clear', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockToolsData)
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      await service.loadTools();
      service.clearCache();
      await service.loadTools();
      
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});