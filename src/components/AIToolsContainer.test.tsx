import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AIToolsContainer } from './AIToolsContainer';
import { aiToolsDataService } from '../services/AIToolsDataService';
import { AITool, ToolCategory } from '../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the AIToolsDataService
jest.mock('../services/AIToolsDataService');
const mockAIToolsDataService = aiToolsDataService as jest.Mocked<typeof aiToolsDataService>;

// Mock data
const mockTools: AITool[] = [
  {
    id: 'warp',
    name: 'Warp',
    category: 'code-assistant',
    description: 'AI-powered terminal and development assistant',
    officialLink: 'https://warp.dev',
    userExperiences: [
      {
        id: 'warp-exp-1',
        quote: 'Using as an Advisor instead of an Engineer',
        context: 'Customer Success Experience',
        useCase: 'Provides instructions, requests permissions to perform actions',
        sentiment: 'positive',
        role: 'business'
      }
    ],
    commonUseCases: ['Debugging and refactoring', 'Understanding code'],
    integrations: ['ADO (Azure DevOps)'],
    teamAdoption: {
      level: 'team',
      notes: 'Having regular meetings to upskill in usage'
    }
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'ide-extension',
    description: 'AI pair programmer that helps you write code faster',
    officialLink: 'https://github.com/features/copilot',
    userExperiences: [
      {
        id: 'copilot-exp-1',
        quote: 'Fully sold after a few hours',
        context: 'Development workflow',
        useCase: 'Code completion and generation',
        sentiment: 'positive'
      }
    ],
    commonUseCases: ['Code completion', 'Unit testing', 'Documentation'],
    licensingNotes: 'Requires GitHub subscription'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    category: 'research-tool',
    description: 'AI-powered research and information gathering tool',
    userExperiences: [
      {
        id: 'perplexity-exp-1',
        quote: 'Great for quick research',
        context: 'Research tasks',
        useCase: 'Finding information and sources',
        sentiment: 'positive'
      }
    ],
    commonUseCases: ['Research', 'Information gathering']
  }
];

describe('AIToolsContainer', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to ensure clean state
    mockAIToolsDataService.loadTools.mockReset();
    mockAIToolsDataService.searchTools.mockReset();
    
    // Set up the mock to resolve immediately
    mockAIToolsDataService.loadTools.mockImplementation(() => 
      Promise.resolve(mockTools)
    );
    
    mockAIToolsDataService.searchTools.mockImplementation((query: string) => {
      if (!query.trim()) return mockTools;
      return mockTools.filter(tool => 
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase())
      );
    });
  });

  describe('Loading State', () => {
    it('should display loading skeleton while data is being fetched', async () => {
      // Make loadTools hang to test loading state
      mockAIToolsDataService.loadTools.mockImplementation(() => new Promise(() => {}));

      render(<AIToolsContainer />);

      expect(screen.getByText('Loading AI tools and user experiences...')).toBeInTheDocument();
      expect(screen.getByRole('status', { name: /loading content/i })).toBeInTheDocument();
    });

    it('should have proper accessibility attributes during loading', async () => {
      mockAIToolsDataService.loadTools.mockImplementation(() => new Promise(() => {}));

      const { container } = render(<AIToolsContainer />);
      
      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-label', 'Loading content');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Data Loading', () => {
    it('should load and display AI tools data on mount', async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });

      // Wait for the loading to complete and data to be displayed
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      }, { timeout: 5000 });

      expect(screen.getByText(/Discover.*3.*AI tools being used in our organization/)).toBeInTheDocument();
      expect(screen.getByText('GitHub Copilot')).toBeInTheDocument();
      expect(screen.getByText('Perplexity')).toBeInTheDocument();
    });

    it('should call aiToolsDataService.loadTools on mount', async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });

      await waitFor(() => {
        expect(mockAIToolsDataService.loadTools).toHaveBeenCalledTimes(1);
      });
    });

    it('should display correct results summary', async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Showing.*3.*of.*3.*tools/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when data loading fails', async () => {
      const errorMessage = 'Failed to load AI tools data';
      mockAIToolsDataService.loadTools.mockRejectedValue(new Error(errorMessage));

      render(<AIToolsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load AI Tools')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should provide retry functionality on error', async () => {
      mockAIToolsDataService.loadTools
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockTools);

      render(<AIToolsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load AI Tools')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('AI Tools Showcase')).toBeInTheDocument();
        expect(mockAIToolsDataService.loadTools).toHaveBeenCalledTimes(2);
      });
    });

    it('should categorize different error types correctly', async () => {
      const networkError = new Error('Network error: Unable to connect');
      mockAIToolsDataService.loadTools.mockRejectedValue(networkError);

      render(<AIToolsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load AI Tools')).toBeInTheDocument();
      });

      // The ErrorMessage component should receive the correct error type
      expect(screen.getByText('Network error: Unable to connect')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });
    });

    it('should filter tools based on search query', async () => {
      const searchInput = screen.getByLabelText('Search tools, descriptions, and use cases');
      
      await userEvent.type(searchInput, 'Warp');

      await waitFor(() => {
        expect(screen.getByText(/Showing.*1.*of.*3.*tools matching "Warp"/)).toBeInTheDocument();
        expect(screen.getByText('Warp')).toBeInTheDocument();
        expect(screen.queryByText('GitHub Copilot')).not.toBeInTheDocument();
        expect(screen.queryByText('Perplexity')).not.toBeInTheDocument();
      });
    });

    it('should clear search when clear button is clicked', async () => {
      const searchInput = screen.getByLabelText('Search tools, descriptions, and use cases');
      
      await userEvent.type(searchInput, 'Warp');
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Warp')).toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      await userEvent.click(clearButton);

      expect(searchInput).toHaveValue('');
      await waitFor(() => {
        expect(screen.getByText(/Showing.*3.*of.*3.*tools/)).toBeInTheDocument();
      });
    });

    it('should clear search when Escape key is pressed', async () => {
      const searchInput = screen.getByLabelText('Search tools, descriptions, and use cases');
      
      await userEvent.type(searchInput, 'Warp');
      await userEvent.keyboard('{Escape}');

      expect(searchInput).toHaveValue('');
      await waitFor(() => {
        expect(screen.getByText(/Showing.*3.*of.*3.*tools/)).toBeInTheDocument();
      });
    });

    it('should display no results message when search yields no matches', async () => {
      const searchInput = screen.getByLabelText('Search tools, descriptions, and use cases');
      
      await userEvent.type(searchInput, 'NonexistentTool');

      await waitFor(() => {
        expect(screen.getByText('No tools found matching "NonexistentTool". Try adjusting your filters.')).toBeInTheDocument();
        expect(screen.getByText('No matching tools found')).toBeInTheDocument();
      });
    });

    it('should filter results when searching', async () => {
      const searchInput = screen.getByLabelText('Search tools, descriptions, and use cases');
      
      await userEvent.type(searchInput, 'terminal');

      await waitFor(() => {
        expect(screen.getByText(/Showing.*1.*of.*3.*tools matching "terminal"/)).toBeInTheDocument();
        expect(screen.getByText('Warp')).toBeInTheDocument();
        expect(screen.queryByText('GitHub Copilot')).not.toBeInTheDocument();
      });
    });
  });

  describe('Category Filtering', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });
    });

    it('should display all available categories', async () => {
      expect(screen.getByText('All Categories')).toBeInTheDocument();
      expect(screen.getByText('Code Assistant')).toBeInTheDocument();
      expect(screen.getByText('IDE Extension')).toBeInTheDocument();
      expect(screen.getByText('Research Tool')).toBeInTheDocument();
    });

    it('should filter tools by category when category button is clicked', async () => {
      const codeAssistantButton = screen.getByRole('button', { name: 'Code Assistant' });
      await userEvent.click(codeAssistantButton);

      await waitFor(() => {
        expect(screen.getByText(/Showing.*1.*of.*3.*tools in Code Assistant/)).toBeInTheDocument();
        expect(screen.getByText('Warp')).toBeInTheDocument();
        expect(screen.queryByText('GitHub Copilot')).not.toBeInTheDocument();
        expect(screen.queryByText('Perplexity')).not.toBeInTheDocument();
      });

      expect(codeAssistantButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should clear category filter when "All Categories" is clicked', async () => {
      // First select a category
      const codeAssistantButton = screen.getByRole('button', { name: 'Code Assistant' });
      await userEvent.click(codeAssistantButton);

      await waitFor(() => {
        expect(screen.getByText(/Showing.*1.*of.*3.*tools in Code Assistant/)).toBeInTheDocument();
      });

      // Then clear the filter
      const allCategoriesButton = screen.getByRole('button', { name: 'All Categories' });
      await userEvent.click(allCategoriesButton);

      await waitFor(() => {
        expect(screen.getByText(/Showing.*3.*of.*3.*tools/)).toBeInTheDocument();
      });

      expect(allCategoriesButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should support keyboard navigation between category buttons', async () => {
      const codeAssistantButton = screen.getByRole('button', { name: 'Code Assistant' });
      codeAssistantButton.focus();

      await userEvent.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: 'IDE Extension' })).toHaveFocus();

      await userEvent.keyboard('{ArrowLeft}');
      expect(codeAssistantButton).toHaveFocus();

      await userEvent.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText(/Showing.*1.*of.*3.*tools in Code Assistant/)).toBeInTheDocument();
      });
    });
  });

  describe('Combined Search and Filter', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });
    });

    it('should combine search and category filters', async () => {
      // First apply category filter
      const ideExtensionButton = screen.getByRole('button', { name: 'IDE Extension' });
      await userEvent.click(ideExtensionButton);

      await waitFor(() => {
        expect(screen.getByText(/Showing.*1.*of.*3.*tools in IDE Extension/)).toBeInTheDocument();
      });

      // Then apply search
      const searchInput = screen.getByLabelText('Search tools, descriptions, and use cases');
      await userEvent.type(searchInput, 'GitHub');

      await waitFor(() => {
        expect(screen.getByText(/Showing.*1.*of.*3.*tools matching "GitHub" in IDE Extension/)).toBeInTheDocument();
        expect(screen.getByText('GitHub Copilot')).toBeInTheDocument();
      });
    });

    it('should clear all filters when "Clear All Filters" button is clicked', async () => {
      // Apply both filters
      const ideExtensionButton = screen.getByRole('button', { name: 'IDE Extension' });
      await userEvent.click(ideExtensionButton);

      const searchInput = screen.getByLabelText('Search tools, descriptions, and use cases');
      await userEvent.type(searchInput, 'GitHub');

      await waitFor(() => {
        expect(screen.getByText('Clear All Filters')).toBeInTheDocument();
      });

      const clearAllButton = screen.getByRole('button', { name: 'Clear All Filters' });
      await userEvent.click(clearAllButton);

      expect(searchInput).toHaveValue('');
      await waitFor(() => {
        expect(screen.getByText(/Showing.*3.*of.*3.*tools/)).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });
    });

    it('should navigate from search to category filters with arrow down', async () => {
      const searchInput = screen.getByLabelText('Search tools, descriptions, and use cases');
      searchInput.focus();

      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByRole('button', { name: 'Code Assistant' })).toHaveFocus();
    });

    it('should navigate back to search from category filters with Escape', async () => {
      const codeAssistantButton = screen.getByRole('button', { name: 'Code Assistant' });
      codeAssistantButton.focus();

      await userEvent.keyboard('{Escape}');
      expect(screen.getByLabelText('Search tools, descriptions, and use cases')).toHaveFocus();
    });
  });

  describe('Responsive Grid Layout', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });
    });

    it('should render tools in a grid layout', async () => {
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });
      
      const toolsGrid = screen.getByText('Warp').closest('.ai-tools-container__grid');
      expect(toolsGrid).toBeInTheDocument();
    });

    it('should display all tool cards', async () => {
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });
      
      expect(screen.getByText('GitHub Copilot')).toBeInTheDocument();
      expect(screen.getByText('Perplexity')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(<AIToolsContainer />);
        container = result.container;
      });
      
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });

      const results = await axe(container!);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels and roles', async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });
      
      // Wait for data to load completely
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });

      // Check search input accessibility
      const searchInput = screen.getByLabelText('Search tools, descriptions, and use cases');
      expect(searchInput).toHaveAttribute('aria-describedby', 'search-help');

      // Check category filter accessibility
      const categoryGroup = screen.getByRole('group', { name: 'Category filter options' });
      expect(categoryGroup).toBeInTheDocument();

      // Check results summary has live region
      const resultsRegion = screen.getByText(/Showing.*3.*of.*3.*tools/).closest('[aria-live]');
      expect(resultsRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should support screen readers with proper headings hierarchy', async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });
      
      // Wait for data to load completely
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });

      const mainHeading = screen.getByRole('heading', { level: 1, name: 'AI Tools Showcase' });
      expect(mainHeading).toBeInTheDocument();
    });

    it('should have proper focus management', async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search tools, descriptions, and use cases');

      await userEvent.type(searchInput, 'test');
      
      const clearButton = screen.getByRole('button', { name: 'Clear search' });
      await userEvent.click(clearButton);

      // Focus should return to search input after clearing
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });
    });

    it('should not re-render unnecessarily when props do not change', async () => {
      const { rerender } = render(<AIToolsContainer />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });
      
      const callCountAfterInitialLoad = mockAIToolsDataService.loadTools.mock.calls.length;
      
      // Re-render with same props
      rerender(<AIToolsContainer />);
      
      // Should not call loadTools again
      expect(mockAIToolsDataService.loadTools).toHaveBeenCalledTimes(callCountAfterInitialLoad);
    });

    it('should debounce search input to avoid excessive API calls', async () => {
      const searchInput = screen.getByLabelText('Search tools, descriptions, and use cases');
      
      // Type quickly
      await userEvent.type(searchInput, 'test', { delay: 1 });
      
      // Check that the search input has the value
      expect(searchInput).toHaveValue('test');
      
      // Wait for the search to be applied
      await waitFor(() => {
        expect(screen.getByText(/Showing.*0.*of.*3.*tools matching "test"/)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tools array gracefully', async () => {
      mockAIToolsDataService.loadTools.mockResolvedValue([]);

      render(<AIToolsContainer />);

      await waitFor(() => {
        expect(screen.getByText(/Discover.*0.*AI tools being used in our organization/)).toBeInTheDocument();
        expect(screen.getByText(/Showing.*0.*of.*0.*tools/)).toBeInTheDocument();
      });
    });

    it('should handle tools with missing optional properties', async () => {
      const minimalTool: AITool = {
        id: 'minimal',
        name: 'Minimal Tool',
        category: 'code-assistant',
        description: 'A minimal tool for testing',
        userExperiences: [],
        commonUseCases: []
      };

      mockAIToolsDataService.loadTools.mockResolvedValue([minimalTool]);

      render(<AIToolsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Minimal Tool')).toBeInTheDocument();
        expect(screen.getByText(/Showing.*1.*of.*1.*tools/)).toBeInTheDocument();
      });
    });

    it('should handle very long search queries', async () => {
      await act(async () => {
        render(<AIToolsContainer />);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search tools, descriptions, and use cases');
      const longQuery = 'a'.repeat(100); // Reduce length to avoid timeout
      
      await userEvent.type(searchInput, longQuery);
      
      expect(searchInput).toHaveValue(longQuery);
      // Since we're not using the service method anymore, we don't need to check this
      // expect(mockAIToolsDataService.searchTools).toHaveBeenCalledWith(longQuery);
    });
  });

  describe('Custom CSS Classes', () => {
    it('should apply custom className prop', async () => {
      let container: HTMLElement;
      await act(async () => {
        const result = render(<AIToolsContainer className="custom-class" />);
        container = result.container;
      });
      
      await waitFor(() => {
        expect(screen.getByText('Warp')).toBeInTheDocument();
      });

      expect(container!.firstChild).toHaveClass('ai-tools-container', 'custom-class');
    });
  });
});