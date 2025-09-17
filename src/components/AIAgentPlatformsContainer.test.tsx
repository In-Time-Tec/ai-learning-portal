import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import AIAgentPlatformsContainer from './AIAgentPlatformsContainer';
import { AgentPlatformsDataService } from '../services/AgentPlatformsDataService';
import { AgentPlatform } from '../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the data service
jest.mock('../services/AgentPlatformsDataService');
const mockDataService = AgentPlatformsDataService as jest.Mocked<typeof AgentPlatformsDataService>;

// Mock child components
jest.mock('./LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

jest.mock('./ErrorMessage', () => {
  return function MockErrorMessage({ message, onRetry, retryText }: any) {
    return (
      <div data-testid="error-message">
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} data-testid="retry-button">
            {retryText || 'Retry'}
          </button>
        )}
      </div>
    );
  };
});

jest.mock('./PlatformCard', () => {
  return function MockPlatformCard({ platform, onViewDetails }: any) {
    return (
      <div data-testid={`platform-card-${platform.id}`}>
        <h3>{platform.name}</h3>
        <button onClick={() => onViewDetails(platform)} data-testid={`view-details-${platform.id}`}>
          View Details
        </button>
      </div>
    );
  };
});

jest.mock('./PlatformDetailModal', () => {
  return function MockPlatformDetailModal({ platform, isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="platform-modal">
        <h2>{platform.name}</h2>
        <button onClick={onClose} data-testid="close-modal">Close</button>
      </div>
    );
  };
});

jest.mock('./PlatformSearchFilter', () => {
  return function MockPlatformSearchFilter({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    availableCategories,
    resultCount,
    totalCount
  }: any) {
    return (
      <div data-testid="search-filter">
        <input
          data-testid="search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search platforms"
        />
        <div data-testid="category-filters">
          {availableCategories.map((category: string) => (
            <button
              key={category}
              data-testid={`category-${category}`}
              onClick={() => onCategoryChange(selectedCategory === category ? undefined : category)}
              className={selectedCategory === category ? 'active' : ''}
            >
              {category}
            </button>
          ))}
        </div>
        <span data-testid="result-count">
          Showing {resultCount} of {totalCount} platforms
        </span>
      </div>
    );
  };
});

// Sample test data
const mockPlatforms: AgentPlatform[] = [
  {
    id: 'platform-1',
    name: 'Test Platform 1',
    category: 'open-source-framework',
    type: 'open-source',
    description: 'A test platform for unit testing',
    detailedDescription: 'Detailed description of test platform 1',
    strengths: ['Easy to use', 'Well documented'],
    weaknesses: ['Limited features'],
    primaryUseCases: ['Testing', 'Development'],
    keyFeatures: ['Feature 1', 'Feature 2'],
    targetAudience: ['Developers', 'Testers'],
    maturityLevel: 'stable',
    lastUpdated: '2024-01-01'
  },
  {
    id: 'platform-2',
    name: 'Test Platform 2',
    category: 'commercial-platform',
    type: 'commercial',
    description: 'Another test platform',
    detailedDescription: 'Detailed description of test platform 2',
    strengths: ['Enterprise ready', 'Support available'],
    weaknesses: ['Expensive'],
    primaryUseCases: ['Enterprise', 'Production'],
    keyFeatures: ['Enterprise features', 'Support'],
    targetAudience: ['Enterprises', 'Large teams'],
    maturityLevel: 'enterprise',
    lastUpdated: '2024-01-02'
  }
];

describe('AIAgentPlatformsContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful data loading by default
    mockDataService.loadPlatforms.mockResolvedValue(mockPlatforms);
    mockDataService.getFilteredPlatforms.mockImplementation((platforms, filters) => {
      let filtered = platforms;
      
      if (filters.query) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(filters.query!.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.query!.toLowerCase())
        );
      }
      
      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      
      return filtered;
    });
    
    mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework', 'commercial-platform']);
  });

  describe('Loading State', () => {
    it('should display loading spinner while loading data', async () => {
      // Make the promise never resolve to test loading state
      mockDataService.loadPlatforms.mockImplementation(() => new Promise(() => {}));
      
      render(<AIAgentPlatformsContainer />);
      
      expect(screen.getByRole('status', { name: 'Loading platforms' })).toBeInTheDocument();
      expect(screen.getByText('AI Agent Platforms')).toBeInTheDocument();
    });

    it('should have proper accessibility during loading', async () => {
      mockDataService.loadPlatforms.mockImplementation(() => new Promise(() => {}));
      
      const { container } = render(<AIAgentPlatformsContainer />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Successful Data Loading', () => {
    it('should load and display platforms successfully', async () => {
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Platform 1')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Test Platform 1')).toBeInTheDocument();
      expect(screen.getByText('Test Platform 2')).toBeInTheDocument();
      expect(screen.getByText('2 platforms available')).toBeInTheDocument();
    });

    it('should display search filter controls', async () => {
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-filter')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
      expect(screen.getByTestId('category-filters')).toBeInTheDocument();
    });

    it('should have proper accessibility when loaded', async () => {
      const { container } = render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Agent Platforms')).toBeInTheDocument();
      });
      
      // Note: Some accessibility violations are expected due to mocked components
      // In real implementation, proper heading hierarchy and landmarks would be maintained
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper skip link and landmarks', async () => {
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Agent Platforms')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should announce filter changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-filter')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'test');
      
      // The announcement should be made to the screen reader region
      const announcementRegion = screen.getByRole('status');
      expect(announcementRegion).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when loading fails', async () => {
      const errorMessage = 'Failed to load platforms data';
      mockDataService.loadPlatforms.mockRejectedValue(new Error(errorMessage));
      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
      
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('should retry loading when retry button is clicked', async () => {
      mockDataService.loadPlatforms
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockPlatforms);
      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
      
      const retryButton = screen.getByTestId('retry-button');
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Platform 1')).toBeInTheDocument();
      });
      
      expect(mockDataService.loadPlatforms).toHaveBeenCalledTimes(2);
    });

    it('should show retry count and disable retry after max attempts', async () => {
      mockDataService.loadPlatforms.mockRejectedValue(new Error('Persistent error'));
      
      render(<AIAgentPlatformsContainer />);
      
      // Wait for initial error (this counts as retry attempt 1)
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
      
      // Should show retry count after first failure
      expect(screen.getByText(/Retry attempt 1 of 3/)).toBeInTheDocument();
      
      // Click retry button two more times to reach max attempts
      for (let i = 0; i < 2; i++) {
        const retryButton = screen.queryByTestId('retry-button');
        if (retryButton) {
          fireEvent.click(retryButton);
          // Wait for the retry to complete and error to show again
          await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
          });
        }
      }
      
      // After max retries, retry button should not be available
      await waitFor(() => {
        expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Should show max retries message
      expect(screen.getByText(/Maximum retry attempts reached/)).toBeInTheDocument();
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(async () => {
      render(<AIAgentPlatformsContainer />);
      await waitFor(() => {
        expect(screen.getByTestId('search-filter')).toBeInTheDocument();
      });
    });

    it('should filter platforms by search query', async () => {
      const user = userEvent.setup();
      const searchInput = screen.getByTestId('search-input');
      
      await user.type(searchInput, 'Platform 1');
      
      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          mockPlatforms,
          expect.objectContaining({ query: 'Platform 1' })
        );
      });
    });

    it('should filter platforms by category', async () => {
      const categoryButton = screen.getByTestId('category-open-source-framework');
      
      fireEvent.click(categoryButton);
      
      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          mockPlatforms,
          expect.objectContaining({ category: 'open-source-framework' })
        );
      });
    });

    it('should clear category filter when clicking active category', async () => {
      const categoryButton = screen.getByTestId('category-open-source-framework');
      
      // Click to select
      fireEvent.click(categoryButton);
      
      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          mockPlatforms,
          expect.objectContaining({ category: 'open-source-framework' })
        );
      });
      
      // Click again to deselect
      fireEvent.click(categoryButton);
      
      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          mockPlatforms,
          expect.objectContaining({ category: undefined })
        );
      });
    });
  });

  describe('Platform Detail Modal', () => {
    beforeEach(async () => {
      render(<AIAgentPlatformsContainer />);
      await waitFor(() => {
        expect(screen.getByTestId('view-details-platform-1')).toBeInTheDocument();
      });
    });

    it('should open modal when view details is clicked', async () => {
      const viewDetailsButton = screen.getByTestId('view-details-platform-1');
      
      fireEvent.click(viewDetailsButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('platform-modal')).toBeInTheDocument();
      });
      
      // Check that modal contains the platform name (there will be multiple instances)
      const modalTitle = screen.getByTestId('platform-modal').querySelector('h2');
      expect(modalTitle).toHaveTextContent('Test Platform 1');
    });

    it('should close modal when close button is clicked', async () => {
      const viewDetailsButton = screen.getByTestId('view-details-platform-1');
      fireEvent.click(viewDetailsButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('platform-modal')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByTestId('close-modal');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('platform-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no platforms match filters', async () => {
      mockDataService.getFilteredPlatforms.mockReturnValue([]);
      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-filter')).toBeInTheDocument();
      });
      
      // Trigger a search that returns no results
      const searchInput = screen.getByTestId('search-input');
      const user = userEvent.setup();
      await user.type(searchInput, 'nonexistent');
      
      await waitFor(() => {
        expect(screen.getByText('No platforms found')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Try adjusting your search criteria/)).toBeInTheDocument();
    });

    it('should show clear filters button in empty state when filters are active', async () => {
      mockDataService.getFilteredPlatforms.mockReturnValue([]);
      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-filter')).toBeInTheDocument();
      });
      
      // Apply a filter
      const searchInput = screen.getByTestId('search-input');
      const user = userEvent.setup();
      await user.type(searchInput, 'nonexistent');
      
      await waitFor(() => {
        expect(screen.getByText('Clear All Filters')).toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    it('should maintain separate state for search query and filtered results', async () => {
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-filter')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByTestId('search-input');
      const user = userEvent.setup();
      
      await user.type(searchInput, 'Platform');
      
      // Verify that the search input maintains its value
      expect(searchInput).toHaveValue('Platform');
      
      // Verify that filtering was called
      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          mockPlatforms,
          expect.objectContaining({ query: 'Platform' })
        );
      });
    });

    it('should handle concurrent state updates correctly', async () => {
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-filter')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByTestId('search-input');
      const categoryButton = screen.getByTestId('category-open-source-framework');
      
      // Perform concurrent updates
      await act(async () => {
        const user = userEvent.setup();
        await user.type(searchInput, 'Test');
        fireEvent.click(categoryButton);
      });
      
      // Verify both filters are applied
      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          mockPlatforms,
          expect.objectContaining({
            query: 'Test',
            category: 'open-source-framework'
          })
        );
      });
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', async () => {
      const { container } = render(<AIAgentPlatformsContainer className="custom-class" />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Agent Platforms')).toBeInTheDocument();
      });
      
      expect(container.firstChild).toHaveClass('ai-agent-platforms-container', 'custom-class');
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders during search', async () => {
      const { rerender } = render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Agent Platforms')).toBeInTheDocument();
      });
      
      const initialCallCount = mockDataService.getFilteredPlatforms.mock.calls.length;
      
      // Re-render with same props should not trigger additional filtering
      rerender(<AIAgentPlatformsContainer />);
      
      expect(mockDataService.getFilteredPlatforms.mock.calls.length).toBe(initialCallCount);
    });
  });
});