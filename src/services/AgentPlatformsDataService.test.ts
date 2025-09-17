import { AgentPlatformsDataService } from './AgentPlatformsDataService';
import { AgentPlatform, AgentPlatformsData } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AgentPlatformsDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    AgentPlatformsDataService.clearCache();
  });

  const mockPlatformData: AgentPlatformsData = {
    platforms: [
      {
        id: 'test-platform',
        name: 'Test Platform',
        category: 'open-source-framework',
        type: 'open-source',
        description: 'A test platform',
        detailedDescription: 'A detailed test platform description',
        strengths: ['Easy to use'],
        weaknesses: ['Limited features'],
        primaryUseCases: ['Testing'],
        keyFeatures: ['Test feature'],
        targetAudience: ['Developers'],
        maturityLevel: 'stable',
        lastUpdated: '2024-12-01'
      }
    ],
    categories: {
      'open-source-framework': {
        label: 'Open Source',
        description: 'Open source frameworks',
        icon: '🔧'
      },
      'commercial-platform': {
        label: 'Commercial',
        description: 'Commercial platforms',
        icon: '🏢'
      },
      'enterprise-solution': {
        label: 'Enterprise',
        description: 'Enterprise solutions',
        icon: '🏭'
      },
      'workflow-automation': {
        label: 'Workflow',
        description: 'Workflow automation',
        icon: '⚡'
      },
      'multi-agent-system': {
        label: 'Multi-Agent',
        description: 'Multi-agent systems',
        icon: '👥'
      },
      'autonomous-agent': {
        label: 'Autonomous',
        description: 'Autonomous agents',
        icon: '🤖'
      }
    },
    metadata: {
      lastUpdated: '2024-12-01',
      totalPlatforms: 1,
      dataSource: 'Test data'
    }
  };

  describe('loadPlatforms', () => {
    it('should load platforms successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlatformData,
      });

      const platforms = await AgentPlatformsDataService.loadPlatforms();

      expect(platforms).toEqual(mockPlatformData.platforms);
      expect(fetch).toHaveBeenCalledWith('/agent-platforms.json');
    });

    it('should handle fetch errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(AgentPlatformsDataService.loadPlatforms()).rejects.toThrow(
        'Unable to load platforms data: Failed to fetch platforms data: 404 Not Found'
      );
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(AgentPlatformsDataService.loadPlatforms()).rejects.toThrow(
        'Unable to load platforms data: Network error'
      );
    });

    it('should use cached data when available', async () => {
      const cachedData = {
        platforms: mockPlatformData.platforms,
        timestamp: Date.now()
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

      const platforms = await AgentPlatformsDataService.loadPlatforms();

      expect(platforms).toEqual(mockPlatformData.platforms);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should ignore expired cached data', async () => {
      const expiredData = {
        platforms: mockPlatformData.platforms,
        timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredData));

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlatformData,
      });

      const platforms = await AgentPlatformsDataService.loadPlatforms();

      expect(platforms).toEqual(mockPlatformData.platforms);
      expect(fetch).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('agent-platforms-cache');
    });
  });

  describe('validatePlatformData', () => {
    it('should validate correct platform data', () => {
      const result = AgentPlatformsDataService.validatePlatformData(mockPlatformData);
      expect(result).toEqual(mockPlatformData);
    });

    it('should throw error for invalid data format', () => {
      expect(() => {
        AgentPlatformsDataService.validatePlatformData(null);
      }).toThrow('Invalid data format: expected object');

      expect(() => {
        AgentPlatformsDataService.validatePlatformData({ platforms: 'not-array' });
      }).toThrow('Invalid data format: platforms must be an array');
    });

    it('should throw error for invalid platform', () => {
      const invalidData = {
        ...mockPlatformData,
        platforms: [{ id: '', name: 'Test' }] // Missing required fields
      };

      expect(() => {
        AgentPlatformsDataService.validatePlatformData(invalidData);
      }).toThrow('Invalid platform at index 0');
    });
  });

  describe('searchPlatforms', () => {
    const platforms: AgentPlatform[] = [
      {
        id: 'langchain',
        name: 'LangChain',
        category: 'open-source-framework',
        type: 'open-source',
        description: 'Framework for LLM applications',
        detailedDescription: 'Detailed description',
        strengths: ['Flexible'],
        weaknesses: ['Complex'],
        primaryUseCases: ['Chatbots'],
        keyFeatures: ['Chain composition'],
        targetAudience: ['Developers'],
        maturityLevel: 'stable',
        lastUpdated: '2024-12-01'
      },
      {
        id: 'autogpt',
        name: 'AutoGPT',
        category: 'autonomous-agent',
        type: 'open-source',
        description: 'Autonomous AI agent',
        detailedDescription: 'Detailed description',
        strengths: ['Autonomous'],
        weaknesses: ['Unpredictable'],
        primaryUseCases: ['Task automation'],
        keyFeatures: ['Self-direction'],
        targetAudience: ['Researchers'],
        maturityLevel: 'experimental',
        lastUpdated: '2024-12-01'
      }
    ];

    it('should return all platforms for empty query', () => {
      const result = AgentPlatformsDataService.searchPlatforms(platforms, '');
      expect(result).toEqual(platforms);
    });

    it('should search by name', () => {
      const result = AgentPlatformsDataService.searchPlatforms(platforms, 'LangChain');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('LangChain');
    });

    it('should search by description', () => {
      const result = AgentPlatformsDataService.searchPlatforms(platforms, 'autonomous');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('AutoGPT');
    });

    it('should search case-insensitively', () => {
      const result = AgentPlatformsDataService.searchPlatforms(platforms, 'LANGCHAIN');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('LangChain');
    });

    it('should search in key features', () => {
      const result = AgentPlatformsDataService.searchPlatforms(platforms, 'composition');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('LangChain');
    });
  });

  describe('filterByCategory', () => {
    const platforms: AgentPlatform[] = [
      {
        id: 'langchain',
        name: 'LangChain',
        category: 'open-source-framework',
        type: 'open-source',
        description: 'Framework',
        detailedDescription: 'Detailed',
        strengths: [],
        weaknesses: [],
        primaryUseCases: [],
        keyFeatures: [],
        targetAudience: [],
        maturityLevel: 'stable',
        lastUpdated: '2024-12-01'
      },
      {
        id: 'autogpt',
        name: 'AutoGPT',
        category: 'autonomous-agent',
        type: 'open-source',
        description: 'Agent',
        detailedDescription: 'Detailed',
        strengths: [],
        weaknesses: [],
        primaryUseCases: [],
        keyFeatures: [],
        targetAudience: [],
        maturityLevel: 'experimental',
        lastUpdated: '2024-12-01'
      }
    ];

    it('should filter by category', () => {
      const result = AgentPlatformsDataService.filterByCategory(platforms, 'open-source-framework');
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('LangChain');
    });

    it('should return empty array for non-matching category', () => {
      const result = AgentPlatformsDataService.filterByCategory(platforms, 'commercial-platform');
      expect(result).toHaveLength(0);
    });
  });

  describe('getFilteredPlatforms', () => {
    const platforms: AgentPlatform[] = [
      {
        id: 'langchain',
        name: 'LangChain',
        category: 'open-source-framework',
        type: 'open-source',
        description: 'Framework for LLM applications',
        detailedDescription: 'Detailed',
        strengths: [],
        weaknesses: [],
        primaryUseCases: [],
        keyFeatures: [],
        targetAudience: [],
        maturityLevel: 'stable',
        lastUpdated: '2024-12-01'
      }
    ];

    it('should apply multiple filters', () => {
      const result = AgentPlatformsDataService.getFilteredPlatforms(platforms, {
        query: 'LLM',
        category: 'open-source-framework',
        type: 'open-source',
        maturity: 'stable'
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('LangChain');
    });

    it('should return empty array when filters do not match', () => {
      const result = AgentPlatformsDataService.getFilteredPlatforms(platforms, {
        category: 'commercial-platform'
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('getPlatformById', () => {
    it('should return platform by ID', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlatformData,
      });

      const platform = await AgentPlatformsDataService.getPlatformById('test-platform');
      expect(platform).toEqual(mockPlatformData.platforms[0]);
    });

    it('should return null for non-existent ID', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlatformData,
      });

      const platform = await AgentPlatformsDataService.getPlatformById('non-existent');
      expect(platform).toBeNull();
    });
  });

  describe('cache management', () => {
    it('should cache data after successful load', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlatformData,
      });

      await AgentPlatformsDataService.loadPlatforms();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'agent-platforms-cache',
        expect.stringContaining('"platforms"')
      );
    });

    it('should clear cache', () => {
      AgentPlatformsDataService.clearCache();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('agent-platforms-cache');
    });

    it('should handle localStorage errors gracefully', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlatformData,
      });

      // Should not throw error even if caching fails
      const platforms = await AgentPlatformsDataService.loadPlatforms();
      expect(platforms).toEqual(mockPlatformData.platforms);
    });
  });
});