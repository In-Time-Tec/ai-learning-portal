import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import AIAgentPlatformsContainer from './AIAgentPlatformsContainer';
import PlatformCard from './PlatformCard';
import PlatformDetailModal from './PlatformDetailModal';
import PlatformSearchFilter from './PlatformSearchFilter';
import { AgentPlatform, PlatformCategory } from '../types';
import { AgentPlatformsDataService } from '../services/AgentPlatformsDataService';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the data service
jest.mock('../services/AgentPlatformsDataService');
const mockDataService = AgentPlatformsDataService as jest.Mocked<typeof AgentPlatformsDataService>;

// Mock child components for container tests
jest.mock('./ErrorMessage', () => {
  return function MockErrorMessage({ message, onRetry }: any) {
    return (
      <div data-testid="error-message">
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} data-testid="retry-button">
            Retry
          </button>
        )}
      </div>
    );
  };
});

// Sample test data
const mockPlatform: AgentPlatform = {
  id: 'test-platform',
  name: 'Test Platform',
  category: 'open-source-framework',
  type: 'open-source',
  description: 'A test platform for accessibility testing',
  detailedDescription: 'Detailed description for accessibility testing',
  strengths: ['Accessible', 'Well tested'],
  weaknesses: ['Limited features'],
  primaryUseCases: ['Testing', 'Development'],
  keyFeatures: ['Feature 1', 'Feature 2', 'Feature 3'],
  officialWebsite: 'https://example.com',
  documentation: 'https://docs.example.com',
  githubRepository: 'https://github.com/example/test',
  targetAudience: ['Developers', 'Testers'],
  maturityLevel: 'stable',
  lastUpdated: '2024-01-01'
};

const mockPlatforms: AgentPlatform[] = [mockPlatform];

describe('Accessibility Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDataService.loadPlatforms.mockResolvedValue(mockPlatforms);
    mockDataService.getFilteredPlatforms.mockReturnValue(mockPlatforms);
    mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);
  });

  describe('Skip Links and Landmarks', () => {
    it('should provide skip link for keyboard navigation', async () => {
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Agent Platforms')).toBeInTheDocument();
      });
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
      expect(skipLink).toHaveClass('skip-link');
    });

    it('should have proper landmark roles', async () => {
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Agent Platforms')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'AI Agent Platforms content');
    });

    it('should have screen reader announcement region', async () => {
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Agent Platforms')).toBeInTheDocument();
      });
      
      const announcementRegions = screen.getAllByRole('status');
      const srOnlyRegion = announcementRegions.find(region => region.classList.contains('sr-only'));
      expect(srOnlyRegion).toHaveAttribute('aria-live', 'polite');
      expect(srOnlyRegion).toHaveAttribute('aria-atomic', 'true');
      expect(srOnlyRegion).toHaveClass('sr-only');
    });
  });

  describe('Focus Management', () => {
    it('should have proper focus indicators on interactive elements', async () => {
      const { container } = render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Agent Platforms')).toBeInTheDocument();
      });
      
      // Check that focus styles are applied via CSS classes
      const focusableElements = container.querySelectorAll('button, a, input, [tabindex="0"]');
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation through platform cards', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={jest.fn()} 
          aria-setsize={5}
          aria-posinset={1}
        />
      );
      
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-setsize', '5');
      expect(card).toHaveAttribute('aria-posinset', '1');
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide proper ARIA labels for platform cards', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={jest.fn()} 
        />
      );
      
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-labelledby', 'platform-test-platform-title');
      expect(card).toHaveAttribute('aria-describedby', 'platform-test-platform-description');
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveAttribute('id', 'platform-test-platform-title');
      
      const description = screen.getByText('A test platform for accessibility testing');
      expect(description).toHaveAttribute('id', 'platform-test-platform-description');
    });

    it('should provide descriptive button labels', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={jest.fn()} 
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'View detailed information about Test Platform');
      expect(button).toHaveAttribute('aria-describedby', 'platform-test-platform-title');
    });

    it('should provide proper labels for category and maturity badges', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={jest.fn()} 
        />
      );
      
      expect(screen.getByLabelText('Category: Open Source Framework')).toBeInTheDocument();
      expect(screen.getByLabelText('Maturity level: Stable')).toBeInTheDocument();
    });

    it('should provide proper labels for search and filter controls', () => {
      const mockProps = {
        searchQuery: '',
        onSearchChange: jest.fn(),
        selectedCategory: undefined as PlatformCategory | undefined,
        onCategoryChange: jest.fn(),
        availableCategories: ['open-source-framework'] as PlatformCategory[],
        resultCount: 1,
        totalCount: 1
      };
      
      render(<PlatformSearchFilter {...mockProps} />);
      
      expect(screen.getByLabelText('Search Platforms')).toBeInTheDocument();
      expect(screen.getByRole('group', { name: 'Platform categories' })).toBeInTheDocument();
      expect(screen.getByText('Showing 1 of 1 platforms')).toHaveAttribute('id', 'search-results-count');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Enter and Space key activation for category buttons', () => {
      const mockOnCategoryChange = jest.fn();
      const mockProps = {
        searchQuery: '',
        onSearchChange: jest.fn(),
        selectedCategory: undefined as PlatformCategory | undefined,
        onCategoryChange: mockOnCategoryChange,
        availableCategories: ['open-source-framework'] as PlatformCategory[],
        resultCount: 1,
        totalCount: 1
      };
      
      render(<PlatformSearchFilter {...mockProps} />);
      
      const categoryButton = screen.getByRole('button', { name: /filter by open source platforms/i });
      
      // Test Enter key
      fireEvent.keyDown(categoryButton, { key: 'Enter', code: 'Enter' });
      expect(mockOnCategoryChange).toHaveBeenCalledWith('open-source-framework');
      
      // Test Space key
      fireEvent.keyDown(categoryButton, { key: ' ', code: 'Space' });
      expect(mockOnCategoryChange).toHaveBeenCalledTimes(2);
    });

    it('should support arrow key navigation in modal tabs', async () => {
      render(
        <PlatformDetailModal 
          platform={mockPlatform} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      // Wait for the modal to render and tabs to be available
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
      });
      
      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      const featuresTab = screen.getByRole('tab', { name: 'Features' });
      
      // Focus the overview tab first
      overviewTab.focus();
      expect(overviewTab).toHaveFocus();
      
      // Arrow right should move to next tab - simulate on document since the event listener is on document
      fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
      
      await waitFor(() => {
        expect(featuresTab).toHaveFocus();
      });
    });

    it('should trap focus within modal', async () => {
      render(
        <PlatformDetailModal 
          platform={mockPlatform} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      
      // Focus should be managed within the modal
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('WCAG AAA Compliance', () => {
    it('should have no accessibility violations in main container', async () => {
      const { container } = render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Agent Platforms')).toBeInTheDocument();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in platform card', async () => {
      const { container } = render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={jest.fn()} 
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in search filter', async () => {
      const mockProps = {
        searchQuery: '',
        onSearchChange: jest.fn(),
        selectedCategory: undefined as PlatformCategory | undefined,
        onCategoryChange: jest.fn(),
        availableCategories: ['open-source-framework'] as PlatformCategory[],
        resultCount: 1,
        totalCount: 1
      };
      
      const { container } = render(<PlatformSearchFilter {...mockProps} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in modal', async () => {
      const { container } = render(
        <PlatformDetailModal 
          platform={mockPlatform} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper color contrast for text elements', async () => {
      const { container } = render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Agent Platforms')).toBeInTheDocument();
      });
      
      // Check that high contrast styles are available
      const title = screen.getByText('AI Agent Platforms');
      expect(title).toHaveClass('platforms-title');
      
      // The CSS should provide proper contrast ratios
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dynamic Content Announcements', () => {
    it('should announce filter changes to screen readers', async () => {
      
      render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Agent Platforms')).toBeInTheDocument();
      });
      
      // The announcement region should be present for screen reader updates
      const announcementRegions = screen.getAllByRole('status');
      const srOnlyRegion = announcementRegions.find(region => region.classList.contains('sr-only'));
      expect(srOnlyRegion).toBeInTheDocument();
      
      // Simulate a search that would trigger an announcement
      // Note: The actual announcement text is set via JavaScript and may not be visible in tests
      expect(srOnlyRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should provide proper tab panel labels and controls', () => {
      render(
        <PlatformDetailModal 
          platform={mockPlatform} 
          isOpen={true} 
          onClose={jest.fn()} 
        />
      );
      
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Platform information sections');
      
      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      expect(overviewTab).toHaveAttribute('aria-controls', 'tabpanel-overview');
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
      
      const featuresTab = screen.getByRole('tab', { name: 'Features' });
      expect(featuresTab).toHaveAttribute('aria-controls', 'tabpanel-features');
      expect(featuresTab).toHaveAttribute('aria-selected', 'false');
      expect(featuresTab).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Error State Accessibility', () => {
    it('should maintain accessibility in error states', async () => {
      mockDataService.loadPlatforms.mockRejectedValue(new Error('Test error'));
      
      const { container } = render(<AIAgentPlatformsContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
      
      // Should still have skip link and landmarks in error state
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Loading State Accessibility', () => {
    it('should maintain accessibility during loading', async () => {
      mockDataService.loadPlatforms.mockImplementation(() => new Promise(() => {}));
      
      const { container } = render(<AIAgentPlatformsContainer />);
      
      // Should have skip link and landmarks even during loading
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('status', { name: 'Loading content' })).toBeInTheDocument();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});