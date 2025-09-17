import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIAgentPlatformsContainer from './AIAgentPlatformsContainer';
import { AgentPlatformsDataService } from '../services/AgentPlatformsDataService';
import { AgentPlatform, PlatformCategory } from '../types';

// Mock the data service
jest.mock('../services/AgentPlatformsDataService');
const mockDataService = AgentPlatformsDataService as jest.Mocked<typeof AgentPlatformsDataService>;

// Performance measurement utilities
const measurePerformance = async (operation: () => Promise<void> | void): Promise<number> => {
  const startTime = performance.now();
  await operation();
  const endTime = performance.now();
  return endTime - startTime;
};

const measureMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

// Generate test data of various sizes
const generateTestPlatforms = (count: number): AgentPlatform[] => {
  const categories: PlatformCategory[] = [
    'open-source-framework',
    'commercial-platform',
    'enterprise-solution',
    'workflow-automation',
    'multi-agent-system',
    'autonomous-agent'
  ];
  
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
      description: `Description for platform ${index} with searchable content and keywords`,
      detailedDescription: `Detailed description for platform ${index} with comprehensive information about features, capabilities, and use cases`,
      strengths: [`Strength ${index}`, `Advanced feature ${index}`, `Unique capability ${index}`],
      weaknesses: [`Limitation ${index}`, `Area for improvement ${index}`],
      primaryUseCases: [`Use case ${index}`, `Application ${index}`, `Scenario ${index}`],
      keyFeatures: [`Feature ${index}`, `Advanced feature ${index}`, `Core capability ${index}`],
      officialWebsite: `https://platform${index}.com`,
      documentation: `https://docs.platform${index}.com`,
      githubRepository: `https://github.com/platform${index}/repo`,
      supportedLanguages: ['JavaScript', 'Python', 'TypeScript', 'Java'],
      integrations: [`Integration ${index}`, `Service ${index}`, `Tool ${index}`],
      deploymentOptions: ['Cloud', 'On-premise', 'Hybrid'],
      targetAudience: [`Audience ${index}`, 'Developers', 'Data Scientists'],
      competitorComparison: `Compared to competitors, platform ${index} offers unique advantages`,
      maturityLevel,
      lastUpdated: '2024-01-01'
    };
  });
};

describe('AIAgentPlatformsContainer Performance Benchmarks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering Performance', () => {
    it('should render small datasets (10 platforms) quickly', async () => {
      const platforms = generateTestPlatforms(10);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      const renderTime = await measurePerformance(async () => {
        render(<AIAgentPlatformsContainer />);
        await waitFor(() => {
          expect(screen.getByText('Platform 0')).toBeInTheDocument();
        });
      });

      // Should render small datasets very quickly (< 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('should render medium datasets (50 platforms) efficiently', async () => {
      const platforms = generateTestPlatforms(50);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework', 'commercial-platform']);

      const renderTime = await measurePerformance(async () => {
        render(<AIAgentPlatformsContainer />);
        await waitFor(() => {
          expect(screen.getByText('Platform 0')).toBeInTheDocument();
        });
      });

      // Should render medium datasets reasonably quickly (< 500ms)
      expect(renderTime).toBeLessThan(500);
    });

    it('should handle large datasets (100+ platforms) within acceptable limits', async () => {
      const platforms = generateTestPlatforms(100);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(platforms.slice(0, 50)); // Limit displayed results
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework', 'commercial-platform', 'enterprise-solution']);

      const renderTime = await measurePerformance(async () => {
        render(<AIAgentPlatformsContainer />);
        await waitFor(() => {
          expect(screen.getByText('Platform 0')).toBeInTheDocument();
        });
      });

      // Should handle large datasets within reasonable time (< 1000ms)
      expect(renderTime).toBeLessThan(1000);
    });

    it('should measure memory usage during rendering', async () => {
      const platforms = generateTestPlatforms(50);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      const initialMemory = measureMemoryUsage();
      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('Platform 0')).toBeInTheDocument();
      });

      const finalMemory = measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (this is a rough check)
      if (initialMemory > 0 && finalMemory > 0) {
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
      }
    });
  });

  describe('Search Performance Benchmarks', () => {
    const setupSearchTest = (platformCount: number) => {
      const platforms = generateTestPlatforms(platformCount);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework', 'commercial-platform']);
      
      // Mock realistic search behavior
      mockDataService.getFilteredPlatforms.mockImplementation((platforms, filters) => {
        let filtered = platforms;
        
        if (filters.query) {
          const query = filters.query.toLowerCase();
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.keyFeatures.some(f => f.toLowerCase().includes(query))
          );
        }
        
        if (filters.category) {
          filtered = filtered.filter(p => p.category === filters.category);
        }
        
        return filtered.slice(0, filters.limit || 50);
      });
      
      return platforms;
    };

    it('should perform search on small datasets quickly', async () => {
      const platforms = setupSearchTest(25);
      
      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      
      const searchTime = await measurePerformance(async () => {
        await userEvent.type(searchInput, 'Platform 1');
      });

      // Search should be very fast on small datasets (< 50ms)
      expect(searchTime).toBeLessThan(50);
    });

    it('should perform search on medium datasets efficiently', async () => {
      const platforms = setupSearchTest(100);
      
      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      
      const searchTime = await measurePerformance(async () => {
        await userEvent.type(searchInput, 'Platform');
      });

      // Search should be reasonably fast on medium datasets (< 200ms)
      expect(searchTime).toBeLessThan(200);
    });

    it('should handle rapid consecutive searches efficiently', async () => {
      const platforms = setupSearchTest(50);
      
      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      
      const rapidSearchTime = await measurePerformance(async () => {
        // Simulate rapid typing
        for (let i = 0; i < 10; i++) {
          await userEvent.clear(searchInput);
          await userEvent.type(searchInput, `search${i}`);
        }
      });

      // Rapid searches should complete within reasonable time (< 2000ms)
      expect(rapidSearchTime).toBeLessThan(2000);
    });

    it('should debounce search input effectively', async () => {
      const platforms = setupSearchTest(50);
      
      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      const initialCallCount = mockDataService.getFilteredPlatforms.mock.calls.length;
      
      // Type rapidly without waiting
      await act(async () => {
        await userEvent.type(searchInput, 'test'); // Fast typing
      });

      // Wait for debounce to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      const finalCallCount = mockDataService.getFilteredPlatforms.mock.calls.length;
      const searchCalls = finalCallCount - initialCallCount;

      // Should have fewer calls than characters typed due to debouncing
      expect(searchCalls).toBeLessThan(4); // 'test' has 4 characters
    });
  });

  describe('Filtering Performance Benchmarks', () => {
    it('should apply category filters quickly', async () => {
      const platforms = generateTestPlatforms(100);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework', 'commercial-platform']);
      
      mockDataService.getFilteredPlatforms.mockImplementation((platforms, filters) => {
        if (filters.category) {
          return platforms.filter(p => p.category === filters.category).slice(0, 50);
        }
        return platforms.slice(0, 50);
      });
      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('category-open-source-framework')).toBeInTheDocument();
      });

      const categoryButton = screen.getByTestId('category-open-source-framework');
      
      const filterTime = await measurePerformance(async () => {
        fireEvent.click(categoryButton);
        await waitFor(() => {
          expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
            platforms,
            expect.objectContaining({ category: 'open-source-framework' })
          );
        });
      });

      // Category filtering should be very fast (< 100ms)
      expect(filterTime).toBeLessThan(100);
    });

    it('should handle combined search and filter operations efficiently', async () => {
      const platforms = generateTestPlatforms(75);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework', 'commercial-platform']);
      
      mockDataService.getFilteredPlatforms.mockImplementation((platforms, filters) => {
        let filtered = platforms;
        
        if (filters.query) {
          const query = filters.query.toLowerCase();
          filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
        }
        
        if (filters.category) {
          filtered = filtered.filter(p => p.category === filters.category);
        }
        
        return filtered.slice(0, 50);
      });
      
      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      const combinedOperationTime = await measurePerformance(async () => {
        // Apply search
        const searchInput = screen.getByTestId('search-input');
        await userEvent.type(searchInput, 'Platform');
        
        // Apply category filter
        const categoryButton = screen.getByTestId('category-open-source-framework');
        fireEvent.click(categoryButton);
        
        await waitFor(() => {
          expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
            platforms,
            expect.objectContaining({ 
              query: 'Platform',
              category: 'open-source-framework'
            })
          );
        });
      });

      // Combined operations should complete efficiently (< 300ms)
      expect(combinedOperationTime).toBeLessThan(300);
    });
  });

  describe('Modal Performance Benchmarks', () => {
    it('should open modal quickly', async () => {
      const platforms = generateTestPlatforms(10);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('view-details-platform-0')).toBeInTheDocument();
      });

      const viewDetailsButton = screen.getByTestId('view-details-platform-0');
      
      const modalOpenTime = await measurePerformance(async () => {
        await userEvent.click(viewDetailsButton);
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        });
      });

      // Modal should open quickly (< 100ms)
      expect(modalOpenTime).toBeLessThan(100);
    });

    it('should handle modal tab switching efficiently', async () => {
      const platforms = generateTestPlatforms(5);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('view-details-platform-0')).toBeInTheDocument();
      });

      // Open modal
      const viewDetailsButton = screen.getByTestId('view-details-platform-0');
      await userEvent.click(viewDetailsButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const tabSwitchTime = await measurePerformance(async () => {
        // Switch through all tabs
        const featuresTab = screen.getByRole('tab', { name: 'Features' });
        await userEvent.click(featuresTab);
        
        const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
        await userEvent.click(resourcesTab);
        
        const overviewTab = screen.getByRole('tab', { name: 'Overview' });
        await userEvent.click(overviewTab);
      });

      // Tab switching should be very fast (< 50ms)
      expect(tabSwitchTime).toBeLessThan(50);
    });

    it('should close modal quickly', async () => {
      const platforms = generateTestPlatforms(5);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('view-details-platform-0')).toBeInTheDocument();
      });

      // Open modal
      const viewDetailsButton = screen.getByTestId('view-details-platform-0');
      await userEvent.click(viewDetailsButton);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      
      const modalCloseTime = await measurePerformance(async () => {
        await userEvent.click(closeButton);
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      });

      // Modal should close quickly (< 100ms)
      expect(modalCloseTime).toBeLessThan(100);
    });
  });

  describe('Memory Management Benchmarks', () => {
    it('should not leak memory during repeated operations', async () => {
      const platforms = generateTestPlatforms(20);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      
      const { unmount } = render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      const initialMemory = measureMemoryUsage();
      
      // Perform many operations
      for (let i = 0; i < 50; i++) {
        const searchInput = screen.getByTestId('search-input');
        await userEvent.clear(searchInput);
        await userEvent.type(searchInput, `search${i % 10}`);
        
        if (i % 10 === 0) {
          const categoryButton = screen.getByTestId('category-open-source-framework');
          fireEvent.click(categoryButton);
        }
      }

      const finalMemory = measureMemoryUsage();
      
      unmount();
      
      // Memory usage should not grow excessively
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024); // Less than 20MB increase
      }
    });

    it('should handle component unmounting cleanly', async () => {
      const platforms = generateTestPlatforms(30);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      const unmountTime = await measurePerformance(async () => {
        const { unmount } = render(<AIAgentPlatformsContainer />);
        
        await waitFor(() => {
          expect(screen.getByText('Platform 0')).toBeInTheDocument();
        });
        
        unmount();
      });

      // Unmounting should be fast (< 50ms)
      expect(unmountTime).toBeLessThan(50);
    });
  });

  describe('Stress Testing', () => {
    it('should handle rapid user interactions without performance degradation', async () => {
      const platforms = generateTestPlatforms(50);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(platforms.slice(0, 25));
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework', 'commercial-platform']);

      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      const stressTestTime = await measurePerformance(async () => {
        // Rapid interactions
        for (let i = 0; i < 20; i++) {
          const searchInput = screen.getByTestId('search-input');
          await userEvent.clear(searchInput);
          await userEvent.type(searchInput, `stress${i}`);
          
          const categoryButton = screen.getByTestId('category-open-source-framework');
          fireEvent.click(categoryButton);
          fireEvent.click(categoryButton); // Toggle off
        }
      });

      // Should handle stress testing within reasonable time (< 5000ms)
      expect(stressTestTime).toBeLessThan(5000);
    });

    it('should maintain responsiveness under load', async () => {
      const largePlatforms = generateTestPlatforms(200);
      mockDataService.loadPlatforms.mockResolvedValue(largePlatforms);
      mockDataService.getFilteredPlatforms.mockImplementation((platforms, filters) => {
        // Simulate processing time
        const start = Date.now();
        while (Date.now() - start < 10) {
          // Busy wait for 10ms to simulate processing
        }
        return platforms.slice(0, 50);
      });
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      
      const loadTestTime = await measurePerformance(async () => {
        await userEvent.type(searchInput, 'load test');
      });

      // Should remain responsive even under simulated load (< 1000ms)
      expect(loadTestTime).toBeLessThan(1000);
    });
  });
});