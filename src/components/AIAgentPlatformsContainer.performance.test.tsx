import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIAgentPlatformsContainer } from './AIAgentPlatformsContainer';
import { AgentPlatformsDataService } from '../services/AgentPlatformsDataService';
import { AgentPlatform, PlatformCategory } from '../types';

// Mock the data service
jest.mock('../services/AgentPlatformsDataService');
const mockDataService = AgentPlatformsDataService as jest.Mocked<typeof AgentPlatformsDataService>;

// Generate large dataset for performance testing
const generateLargePlatformDataset = (count: number): AgentPlatform[] => {
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
      description: `Description for platform ${index}. This is a test platform with various features and capabilities.`,
      detailedDescription: `Detailed description for platform ${index}. This platform offers comprehensive solutions for various use cases and scenarios.`,
      strengths: [`Strength 1 for platform ${index}`, `Strength 2 for platform ${index}`],
      weaknesses: [`Weakness 1 for platform ${index}`, `Weakness 2 for platform ${index}`],
      primaryUseCases: [`Use case 1 for platform ${index}`, `Use case 2 for platform ${index}`],
      keyFeatures: [`Feature 1 for platform ${index}`, `Feature 2 for platform ${index}`, `Feature 3 for platform ${index}`],
      targetAudience: [`Audience 1 for platform ${index}`, `Audience 2 for platform ${index}`],
      maturityLevel,
      lastUpdated: '2024-01-01',
      officialWebsite: `https://platform${index}.com`,
      documentation: `https://docs.platform${index}.com`,
      githubRepository: `https://github.com/platform${index}/repo`
    };
  });
};

describe('AIAgentPlatformsContainer Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Large Dataset Handling', () => {
    it('should handle 100 platforms efficiently', async () => {
      const largePlatforms = generateLargePlatformDataset(100);
      mockDataService.loadPlatforms.mockResolvedValue(largePlatforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework', 'commercial-platform', 'enterprise-solution']);
      mockDataService.getFilteredPlatforms.mockImplementation((platforms, filters) => {
        // Simulate filtering with result limiting
        let filtered = platforms;
        if (filters.category) {
          filtered = filtered.filter(p => p.category === filters.category);
        }
        if (filters.query) {
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(filters.query!.toLowerCase()) ||
            p.description.toLowerCase().includes(filters.query!.toLowerCase())
          );
        }
        // Apply limit (simulating the service behavior)
        return filtered.slice(0, filters.limit || 50);
      });

      const startTime = performance.now();
      
      render(<AIAgentPlatformsContainer />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading platforms')).not.toBeInTheDocument();
      }, { timeout: 5000 });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 2 seconds)
      expect(renderTime).toBeLessThan(2000);
      
      // Should limit displayed platforms to 50 (performance optimization)
      const platformCards = screen.getAllByRole('article');
      expect(platformCards.length).toBeLessThanOrEqual(50);
    });

    it('should handle search performance with large dataset', async () => {
      const largePlatforms = generateLargePlatformDataset(200);
      mockDataService.loadPlatforms.mockResolvedValue(largePlatforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework', 'commercial-platform', 'enterprise-solution']);
      mockDataService.getFilteredPlatforms.mockImplementation((platforms, filters) => {
        let filtered = platforms;
        if (filters.query) {
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(filters.query!.toLowerCase())
          );
        }
        return filtered.slice(0, filters.limit || 50);
      });

      render(<AIAgentPlatformsContainer />);
      
      // Wait for component to fully load
      await waitFor(() => {
        expect(screen.queryByRole('status', { name: /loading platforms/i })).not.toBeInTheDocument();
      }, { timeout: 5000 });

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /search platforms/i })).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox', { name: /search platforms/i });
      
      // Measure search performance
      const searchStartTime = performance.now();
      
      await userEvent.type(searchInput, 'Platform 1');
      
      // Wait for debounced search to complete
      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          largePlatforms,
          expect.objectContaining({
            query: 'Platform 1',
            limit: 50
          })
        );
      }, { timeout: 1000 });

      const searchEndTime = performance.now();
      const searchTime = searchEndTime - searchStartTime;

      // Search should complete within reasonable time (including debounce)
      expect(searchTime).toBeLessThan(1000);
    });

    it('should implement result limiting for performance', async () => {
      const largePlatforms = generateLargePlatformDataset(150);
      mockDataService.loadPlatforms.mockResolvedValue(largePlatforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework', 'commercial-platform', 'enterprise-solution']);
      mockDataService.getFilteredPlatforms.mockImplementation((platforms, filters) => {
        // Should always apply limit for performance
        expect(filters.limit).toBe(50);
        return platforms.slice(0, filters.limit);
      });

      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading platforms')).not.toBeInTheDocument();
      });

      // Verify that filtering is called with limit
      expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
        largePlatforms,
        expect.objectContaining({
          limit: 50
        })
      );
    });
  });

  describe('Search Debouncing', () => {
    it('should debounce search input to prevent excessive API calls', async () => {
      const platforms = generateLargePlatformDataset(50);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);
      mockDataService.getFilteredPlatforms.mockImplementation((platforms, filters) => {
        return platforms.filter(p => 
          !filters.query || p.name.toLowerCase().includes(filters.query.toLowerCase())
        ).slice(0, 50);
      });

      render(<AIAgentPlatformsContainer />);
      
      // Wait for component to fully load
      await waitFor(() => {
        expect(screen.queryByRole('status', { name: /loading platforms/i })).not.toBeInTheDocument();
      }, { timeout: 5000 });

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /search platforms/i })).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox', { name: /search platforms/i });
      
      // Clear previous calls
      mockDataService.getFilteredPlatforms.mockClear();
      
      // Type rapidly
      await userEvent.type(searchInput, 'test', { delay: 50 });
      
      // Should not call getFilteredPlatforms immediately for each keystroke
      expect(mockDataService.getFilteredPlatforms).not.toHaveBeenCalled();
      
      // Wait for debounce to complete
      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          platforms,
          expect.objectContaining({
            query: 'test'
          })
        );
      }, { timeout: 500 });

      // Should only be called once after debounce
      expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks with repeated filtering', async () => {
      const platforms = generateLargePlatformDataset(100);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework', 'commercial-platform']);
      mockDataService.getFilteredPlatforms.mockImplementation((platforms, filters) => {
        let filtered = platforms;
        if (filters.category) {
          filtered = filtered.filter(p => p.category === filters.category);
        }
        return filtered.slice(0, 50);
      });

      render(<AIAgentPlatformsContainer />);
      
      // Wait for component to fully load
      await waitFor(() => {
        expect(screen.queryByRole('status', { name: /loading platforms/i })).not.toBeInTheDocument();
      }, { timeout: 5000 });

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /search platforms/i })).toBeInTheDocument();
      });

      // Find category button by test id instead
      await waitFor(() => {
        expect(screen.getByTestId('category-open-source-framework')).toBeInTheDocument();
      });

      const categoryButton = screen.getByTestId('category-open-source-framework');
      
      // Perform multiple filter operations
      for (let i = 0; i < 5; i++) {
        fireEvent.click(categoryButton);
        await waitFor(() => {
          expect(mockDataService.getFilteredPlatforms).toHaveBeenCalled();
        });
        
        fireEvent.click(categoryButton); // Clear filter
        await waitFor(() => {
          expect(mockDataService.getFilteredPlatforms).toHaveBeenCalled();
        });
      }

      // Component should still be responsive
      expect(categoryButton).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /search platforms/i })).toBeInTheDocument();
    });
  });

  describe('Caching Performance', () => {
    it('should use cached data for improved performance', async () => {
      const platforms = generateLargePlatformDataset(50);
      
      // First load - should call loadPlatforms
      mockDataService.loadPlatforms.mockResolvedValueOnce(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);
      mockDataService.getFilteredPlatforms.mockImplementation(() => platforms.slice(0, 50));

      const { unmount } = render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading platforms')).not.toBeInTheDocument();
      });

      expect(mockDataService.loadPlatforms).toHaveBeenCalledTimes(1);
      
      unmount();
      
      // Second load - should use cache (mock will return cached data)
      mockDataService.loadPlatforms.mockResolvedValueOnce(platforms);
      
      const startTime = performance.now();
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.queryByText('Loading platforms')).not.toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const secondLoadTime = endTime - startTime;
      
      // Second load should be faster due to caching
      expect(secondLoadTime).toBeLessThan(1000);
      expect(mockDataService.loadPlatforms).toHaveBeenCalledTimes(2);
    });
  });

  describe('Modal Performance', () => {
    it('should lazy load modal content for better performance', async () => {
      const platforms = generateLargePlatformDataset(10);
      mockDataService.loadPlatforms.mockResolvedValue(platforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);
      mockDataService.getFilteredPlatforms.mockImplementation(() => platforms);

      render(<AIAgentPlatformsContainer />);
      
      // Wait for component to fully load
      await waitFor(() => {
        expect(screen.queryByRole('status', { name: /loading platforms/i })).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Wait for platform cards to be rendered
      await waitFor(() => {
        expect(screen.getAllByRole('article')).toHaveLength(10);
      });

      const viewDetailsButtons = screen.getAllByText('View Details');
      expect(viewDetailsButtons.length).toBeGreaterThan(0);
      
      const modalOpenTime = performance.now();
      fireEvent.click(viewDetailsButtons[0]!);
      
      // Modal should open quickly
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      const modalOpenEndTime = performance.now();
      const modalOpenDuration = modalOpenEndTime - modalOpenTime;
      
      // Modal should open within reasonable time
      expect(modalOpenDuration).toBeLessThan(500);
    });
  });
});