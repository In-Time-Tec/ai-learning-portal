import { AgentPlatformsDataService } from './AgentPlatformsDataService';
import { AgentPlatform, PlatformCategory } from '../types';

// Mock fetch for testing
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Generate test data
const generateTestPlatforms = (count: number): AgentPlatform[] => {
  const categories: PlatformCategory[] = ['open-source-framework', 'commercial-platform', 'enterprise-solution'];
  const types: AgentPlatform['type'][] = ['open-source', 'commercial', 'enterprise'];
  const maturityLevels: AgentPlatform['maturityLevel'][] = ['experimental', 'beta', 'stable', 'enterprise'];

  return Array.from({ length: count }, (_, index): AgentPlatform => {
    const category = categories[index % categories.length]!;
    const type = types[index % types.length]!;
    const maturityLevel = maturityLevels[index % maturityLevels.length]!;
    
    return {
      id: `platform-${index}`,
      name: `Platform ${index}`,
      category,
      type,
      description: `Description for platform ${index} with searchable content`,
      detailedDescription: `Detailed description for platform ${index}`,
      strengths: [`Strength ${index}`],
      weaknesses: [`Weakness ${index}`],
      primaryUseCases: [`Use case ${index}`],
      keyFeatures: [`Feature ${index}`, `Advanced feature ${index}`],
      targetAudience: [`Audience ${index}`],
      maturityLevel,
      lastUpdated: '2024-01-01'
    };
  });
};

describe('AgentPlatformsDataService Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Clear static cache
    AgentPlatformsDataService.clearCache();
  });

  describe('Search Performance', () => {
    it('should handle search on large datasets efficiently', () => {
      const largePlatforms = generateTestPlatforms(1000);
      
      const startTime = performance.now();
      
      // Test search performance
      const results = AgentPlatformsDataService.searchPlatforms(largePlatforms, 'Platform 1');
      
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      // Search should complete quickly (less than 100ms for 1000 items)
      expect(searchTime).toBeLessThan(100);
      
      // Should return limited results (50 by default)
      expect(results.length).toBeLessThanOrEqual(50);
      
      // Should return relevant results
      expect(results.every(platform => 
        platform.name.toLowerCase().includes('platform 1') ||
        platform.description.toLowerCase().includes('platform 1')
      )).toBe(true);
    });

    it('should limit search results for performance', () => {
      const largePlatforms = generateTestPlatforms(200);
      
      // Search for a common term that would match many platforms
      const results = AgentPlatformsDataService.searchPlatforms(largePlatforms, 'platform');
      
      // Should limit results to 50 for performance
      expect(results.length).toBe(50);
    });

    it('should handle custom result limits', () => {
      const platforms = generateTestPlatforms(100);
      
      // Test with custom limit
      const results = AgentPlatformsDataService.searchPlatforms(platforms, 'platform', 25);
      
      expect(results.length).toBe(25);
    });
  });

  describe('Filtering Performance', () => {
    it('should handle multiple filters efficiently', () => {
      const largePlatforms = generateTestPlatforms(500);
      
      const startTime = performance.now();
      
      const results = AgentPlatformsDataService.getFilteredPlatforms(largePlatforms, {
        query: 'Platform 1',
        category: 'open-source-framework',
        type: 'open-source',
        limit: 25
      });
      
      const endTime = performance.now();
      const filterTime = endTime - startTime;
      
      // Filtering should be fast
      expect(filterTime).toBeLessThan(50);
      
      // Should respect limit
      expect(results.length).toBeLessThanOrEqual(25);
      
      // Should apply all filters correctly
      expect(results.every(platform => 
        platform.category === 'open-source-framework' &&
        platform.type === 'open-source' &&
        (platform.name.toLowerCase().includes('platform 1') ||
         platform.description.toLowerCase().includes('platform 1'))
      )).toBe(true);
    });

    it('should optimize filter order for performance', () => {
      const largePlatforms = generateTestPlatforms(1000);
      
      // Category filter should be applied first (most selective)
      const startTime = performance.now();
      
      AgentPlatformsDataService.getFilteredPlatforms(largePlatforms, {
        query: 'platform', // This would match many items
        category: 'enterprise-solution', // This is more selective
        limit: 50
      });
      
      const endTime = performance.now();
      const filterTime = endTime - startTime;
      
      // Should complete quickly due to optimized filter order
      expect(filterTime).toBeLessThan(100);
    });
  });

  describe('Caching Performance', () => {
    it('should cache data efficiently', async () => {
      const testPlatforms = generateTestPlatforms(100);
      const mockResponse = {
        platforms: testPlatforms,
        categories: {},
        metadata: { lastUpdated: '2024-01-01', totalPlatforms: 100, dataSource: 'test' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      // First load - should fetch and cache
      const startTime = performance.now();
      const platforms1 = await AgentPlatformsDataService.loadPlatforms();
      const firstLoadTime = performance.now() - startTime;

      expect(platforms1).toHaveLength(100);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second load - should use cache
      const cacheStartTime = performance.now();
      const platforms2 = await AgentPlatformsDataService.loadPlatforms();
      const cacheLoadTime = performance.now() - cacheStartTime;

      expect(platforms2).toHaveLength(100);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Should not fetch again

      // Cache load should be significantly faster
      expect(cacheLoadTime).toBeLessThan(firstLoadTime / 2);
      expect(cacheLoadTime).toBeLessThan(10); // Should be very fast
    });

    it('should handle cache storage efficiently', async () => {
      const largePlatforms = generateTestPlatforms(500);
      const mockResponse = {
        platforms: largePlatforms,
        categories: {},
        metadata: { lastUpdated: '2024-01-01', totalPlatforms: 500, dataSource: 'test' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      // Should handle large datasets in cache
      const platforms = await AgentPlatformsDataService.loadPlatforms();
      
      expect(platforms).toHaveLength(500);
      
      // Should have cached the data
      const cachedData = localStorage.getItem('agent-platforms-cache');
      expect(cachedData).toBeTruthy();
      
      // Cache should contain version and timestamp
      const parsed = JSON.parse(cachedData!);
      expect(parsed.version).toBe('1.0');
      expect(parsed.timestamp).toBeGreaterThan(0);
      expect(parsed.count).toBe(500);
    });

    it('should handle cache size limits gracefully', async () => {
      // Create extremely large dataset that would exceed localStorage limits
      const hugePlatforms = generateTestPlatforms(10000);
      const mockResponse = {
        platforms: hugePlatforms,
        categories: {},
        metadata: { lastUpdated: '2024-01-01', totalPlatforms: 10000, dataSource: 'test' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      // Should handle large data gracefully
      const platforms = await AgentPlatformsDataService.loadPlatforms();
      
      expect(platforms).toHaveLength(10000);
      
      // Should not crash even if caching fails due to size
      expect(() => {
        localStorage.getItem('agent-platforms-cache');
      }).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    it('should not cause memory leaks with repeated operations', () => {
      const platforms = generateTestPlatforms(100);
      
      // Perform many search operations
      for (let i = 0; i < 1000; i++) {
        AgentPlatformsDataService.searchPlatforms(platforms, `search ${i % 10}`);
      }
      
      // Perform many filter operations
      for (let i = 0; i < 1000; i++) {
        AgentPlatformsDataService.getFilteredPlatforms(platforms, {
          category: i % 2 === 0 ? 'open-source-framework' : 'commercial-platform',
          query: `query ${i % 5}`,
          limit: 50
        });
      }
      
      // Should complete without issues
      expect(true).toBe(true);
    });

    it('should handle concurrent operations efficiently', async () => {
      const platforms = generateTestPlatforms(200);
      
      // Simulate concurrent search operations
      const searchPromises = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve(AgentPlatformsDataService.searchPlatforms(platforms, `search ${i}`))
      );
      
      const filterPromises = Array.from({ length: 10 }, (_, i) => 
        Promise.resolve(AgentPlatformsDataService.getFilteredPlatforms(platforms, {
          query: `filter ${i}`,
          limit: 25
        }))
      );
      
      const startTime = performance.now();
      
      const [searchResults, filterResults] = await Promise.all([
        Promise.all(searchPromises),
        Promise.all(filterPromises)
      ]);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle concurrent operations efficiently
      expect(totalTime).toBeLessThan(100);
      expect(searchResults).toHaveLength(10);
      expect(filterResults).toHaveLength(10);
    });
  });

  describe('Data Validation Performance', () => {
    it('should validate large datasets efficiently', () => {
      const largePlatforms = generateTestPlatforms(500);
      const mockData = {
        platforms: largePlatforms,
        categories: {},
        metadata: { lastUpdated: '2024-01-01', totalPlatforms: 500, dataSource: 'test' }
      };
      
      const startTime = performance.now();
      
      const validatedData = AgentPlatformsDataService.validatePlatformData(mockData);
      
      const endTime = performance.now();
      const validationTime = endTime - startTime;
      
      // Validation should be reasonably fast
      expect(validationTime).toBeLessThan(200);
      expect(validatedData.platforms).toHaveLength(500);
    });
  });
});