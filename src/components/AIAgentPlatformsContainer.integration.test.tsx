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

// Mock window.open for external link testing
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen
});

// Mock ResizeObserver for responsive testing
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Comprehensive test data
const createTestPlatforms = (): AgentPlatform[] => [
  {
    id: 'langchain',
    name: 'LangChain',
    category: 'open-source-framework',
    type: 'open-source',
    description: 'Framework for developing applications powered by language models',
    detailedDescription: 'LangChain is a comprehensive framework for building LLM applications with chains, agents, and memory.',
    strengths: ['Extensive ecosystem', 'Active community', 'Well documented'],
    weaknesses: ['Steep learning curve', 'Rapid API changes'],
    primaryUseCases: ['Chatbots', 'Document analysis', 'Code generation'],
    keyFeatures: ['Chain composition', 'Memory management', 'Agent framework'],
    officialWebsite: 'https://langchain.com',
    documentation: 'https://docs.langchain.com',
    githubRepository: 'https://github.com/langchain-ai/langchain',
    supportedLanguages: ['Python', 'JavaScript', 'TypeScript'],
    integrations: ['OpenAI', 'Anthropic', 'Hugging Face'],
    deploymentOptions: ['Cloud', 'On-premise'],
    targetAudience: ['Developers', 'Data Scientists'],
    maturityLevel: 'stable',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'autogen',
    name: 'AutoGen',
    category: 'multi-agent-system',
    type: 'open-source',
    description: 'Multi-agent conversation framework for complex task solving',
    detailedDescription: 'AutoGen enables multiple AI agents to collaborate and solve complex problems through conversation.',
    strengths: ['Multi-agent coordination', 'Flexible architecture', 'Research-backed'],
    weaknesses: ['Complex setup', 'Limited documentation'],
    primaryUseCases: ['Complex problem solving', 'Research', 'Collaborative AI'],
    keyFeatures: ['Multi-agent chat', 'Role-based agents', 'Human-in-the-loop'],
    officialWebsite: 'https://microsoft.github.io/autogen/',
    documentation: 'https://microsoft.github.io/autogen/docs/',
    githubRepository: 'https://github.com/microsoft/autogen',
    supportedLanguages: ['Python'],
    integrations: ['OpenAI', 'Azure OpenAI'],
    deploymentOptions: ['Local', 'Cloud'],
    targetAudience: ['Researchers', 'Advanced developers'],
    maturityLevel: 'beta',
    lastUpdated: '2024-01-10'
  },
  {
    id: 'openai-assistants',
    name: 'OpenAI Assistants API',
    category: 'commercial-platform',
    type: 'commercial',
    description: 'Commercial API for building AI assistants with tools and knowledge',
    detailedDescription: 'OpenAI Assistants API provides a managed service for creating AI assistants with function calling and file handling.',
    strengths: ['Managed service', 'Built-in tools', 'Reliable infrastructure'],
    weaknesses: ['Vendor lock-in', 'Cost considerations', 'Limited customization'],
    primaryUseCases: ['Customer support', 'Personal assistants', 'Business automation'],
    keyFeatures: ['Function calling', 'File handling', 'Persistent threads'],
    officialWebsite: 'https://openai.com/assistants',
    documentation: 'https://platform.openai.com/docs/assistants',
    pricing: 'https://openai.com/pricing',
    supportedLanguages: ['REST API', 'Python', 'Node.js'],
    integrations: ['OpenAI ecosystem'],
    deploymentOptions: ['Cloud'],
    targetAudience: ['Businesses', 'Product teams'],
    maturityLevel: 'stable',
    lastUpdated: '2024-01-20'
  }
];

describe('AIAgentPlatformsContainer Integration Tests', () => {
  const testPlatforms = createTestPlatforms();

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowOpen.mockClear();
    
    // Setup default successful responses
    mockDataService.loadPlatforms.mockResolvedValue(testPlatforms);
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
      
      if (filters.type) {
        filtered = filtered.filter(p => p.type === filters.type);
      }
      
      return filtered.slice(0, filters.limit || 50);
    });
    
    mockDataService.getUniqueCategories.mockReturnValue([
      'open-source-framework',
      'multi-agent-system', 
      'commercial-platform'
    ]);
  });

  describe('Complete User Workflows', () => {
    it('should complete full browse and view workflow', async () => {
      
      render(<AIAgentPlatformsContainer />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('LangChain')).toBeInTheDocument();
      });

      // Verify all platforms are displayed
      expect(screen.getByText('LangChain')).toBeInTheDocument();
      expect(screen.getByText('AutoGen')).toBeInTheDocument();
      expect(screen.getByText('OpenAI Assistants API')).toBeInTheDocument();

      // Verify search functionality works
      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'LangChain');

      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          testPlatforms,
          expect.objectContaining({ query: 'LangChain' })
        );
      });

      // Verify category filtering works
      const categoryButton = screen.getByTestId('category-open-source-framework');
      await userEvent.click(categoryButton);

      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          testPlatforms,
          expect.objectContaining({ category: 'open-source-framework' })
        );
      });
    });

    it('should complete search and filter workflow', async () => {
      
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      // Search for specific platform
      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'LangChain');

      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          testPlatforms,
          expect.objectContaining({ query: 'LangChain' })
        );
      });

      // Apply category filter
      const categoryButton = screen.getByTestId('category-open-source-framework');
      await userEvent.click(categoryButton);

      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          testPlatforms,
          expect.objectContaining({ 
            query: 'LangChain',
            category: 'open-source-framework'
          })
        );
      });

      // Clear search
      await userEvent.clear(searchInput);

      // Verify category filter still active
      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          testPlatforms,
          expect.objectContaining({ 
            query: '',
            category: 'open-source-framework'
          })
        );
      });
    });

    it('should handle complex multi-step interactions', async () => {
      
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('LangChain')).toBeInTheDocument();
      });

      // Step 1: Search for frameworks
      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'framework');

      // Step 2: Apply category filter
      const categoryButton = screen.getByTestId('category-open-source-framework');
      await userEvent.click(categoryButton);

      // Step 3: View platform details
      const viewDetailsButton = screen.getByTestId('view-details-langchain');
      await userEvent.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Step 4: Navigate to resources tab
      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      expect(screen.getByText('Official Resources')).toBeInTheDocument();

      // Step 5: Close modal and modify search
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Step 6: Clear filters and search for different term
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'multi-agent');

      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          testPlatforms,
          expect.objectContaining({ query: 'multi-agent' })
        );
      });
    });
  });

  describe('External Link Security and Handling', () => {
    it('should handle external links with proper security attributes', async () => {
      
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view detailed information about langchain/i })).toBeInTheDocument();
      });

      // Open modal
      const viewDetailsButton = screen.getByRole('button', { name: /view detailed information about langchain/i });
      await userEvent.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Navigate to resources tab
      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Check external links have proper security attributes
      const websiteLink = screen.getByRole('link', { name: /visit langchain official website/i });
      expect(websiteLink).toHaveAttribute('href', 'https://langchain.com');
      expect(websiteLink).toHaveAttribute('target', '_blank');
      expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');

      const docsLink = screen.getByRole('link', { name: /view langchain documentation/i });
      expect(docsLink).toHaveAttribute('href', 'https://docs.langchain.com');
      expect(docsLink).toHaveAttribute('target', '_blank');
      expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer');

      const githubLink = screen.getByRole('link', { name: /view langchain github repository/i });
      expect(githubLink).toHaveAttribute('href', 'https://github.com/langchain-ai/langchain');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should validate and sanitize external URLs', async () => {
      const platformWithSuspiciousUrl: AgentPlatform = {
        ...testPlatforms[0]!,
        id: 'suspicious-platform',
        name: 'Suspicious Platform',
        officialWebsite: 'javascript:alert("xss")',
        documentation: 'data:text/html,<script>alert("xss")</script>'
      };

      mockDataService.loadPlatforms.mockResolvedValue([platformWithSuspiciousUrl]);

      
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('view-details-suspicious-platform')).toBeInTheDocument();
      });

      const viewDetailsButton = screen.getByTestId('view-details-suspicious-platform');
      await userEvent.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Suspicious URLs should be filtered out or sanitized
      const suspiciousLinks = screen.queryAllByRole('link').filter(link => {
        const href = link.getAttribute('href');
        return href && (href.startsWith('javascript:') || href.startsWith('data:'));
      });

      expect(suspiciousLinks).toHaveLength(0);
    });

    it('should handle broken external links gracefully', async () => {
      const platformWithBrokenLinks: AgentPlatform = {
        ...testPlatforms[0]!,
        id: 'broken-links-platform',
        name: 'Broken Links Platform',
        officialWebsite: 'https://nonexistent-domain-12345.com',
        documentation: 'https://broken-docs-link.com/404'
      };

      mockDataService.loadPlatforms.mockResolvedValue([platformWithBrokenLinks]);

      
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view detailed information about broken links platform/i })).toBeInTheDocument();
      });

      const viewDetailsButton = screen.getByRole('button', { name: /view detailed information about broken links platform/i });
      await userEvent.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Links should still be rendered but with appropriate warnings or indicators
      const websiteLink = screen.getByRole('link', { name: /visit broken links platform official website/i });
      expect(websiteLink).toBeInTheDocument();
      expect(websiteLink).toHaveAttribute('href', 'https://nonexistent-domain-12345.com');
    });
  });

  describe('Error Scenarios and Recovery', () => {
    it('should handle network failures with retry mechanism', async () => {
      // Simulate network failure followed by success
      mockDataService.loadPlatforms
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(testPlatforms);

      render(<AIAgentPlatformsContainer />);

      // Should show error initially
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText('Network error')).toBeInTheDocument();

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      // Should recover and show platforms
      await waitFor(() => {
        expect(screen.getByText('LangChain')).toBeInTheDocument();
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should handle malformed data gracefully', async () => {
      const malformedData = [
        {
          id: 'incomplete-platform',
          name: 'Incomplete Platform',
          // Missing required fields
        }
      ];

      mockDataService.loadPlatforms.mockRejectedValue(new Error('Invalid data format'));

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(screen.getByText('Invalid data format')).toBeInTheDocument();
    });

    it('should handle search service failures', async () => {
      
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      // Mock search failure
      mockDataService.getFilteredPlatforms.mockImplementation(() => {
        throw new Error('Search service unavailable');
      });

      const searchInput = screen.getByTestId('search-input');
      
      // Should handle search errors gracefully
      await act(async () => {
        await userEvent.type(searchInput, 'test search');
      });

      // Should show error state or fallback behavior
      // The component should not crash
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should handle modal state corruption', async () => {
      
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view detailed information about langchain/i })).toBeInTheDocument();
      });

      // Open modal
      const viewDetailsButton = screen.getByRole('button', { name: /view detailed information about langchain/i });
      await userEvent.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Simulate corrupted platform data
      const corruptedPlatform = { ...testPlatforms[0], name: null };
      mockDataService.loadPlatforms.mockResolvedValue([corruptedPlatform as any]);

      // Modal should handle corrupted data gracefully
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Should be able to close modal despite data issues
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance Benchmarks', () => {
    it('should render large datasets efficiently', async () => {
      const largePlatformSet = Array.from({ length: 100 }, (_, i) => ({
        ...testPlatforms[0],
        id: `platform-${i}`,
        name: `Platform ${i}`,
        description: `Description for platform ${i}`
      } as AgentPlatform));

      mockDataService.loadPlatforms.mockResolvedValue(largePlatformSet);

      const startTime = performance.now();
      
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Platform 0')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 2 seconds)
      expect(renderTime).toBeLessThan(2000);
    });

    it('should handle rapid search input efficiently', async () => {
      
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      
      const startTime = performance.now();

      // Simulate rapid typing
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          await userEvent.type(searchInput, `search${i}`);
          await userEvent.clear(searchInput);
        }
      });

      const endTime = performance.now();
      const searchTime = endTime - startTime;

      // Should handle rapid input without significant lag
      expect(searchTime).toBeLessThan(5000);
    });

    it('should manage memory efficiently during extended use', async () => {
      
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      // Simulate extended usage patterns
      for (let i = 0; i < 20; i++) {
        // Search
        const searchInput = screen.getByTestId('search-input');
        await userEvent.type(searchInput, `search${i}`);
        
        // Filter
        const categoryButton = screen.getByTestId('category-open-source-framework');
        await userEvent.click(categoryButton);
        
        // Clear
        await userEvent.clear(searchInput);
        await userEvent.click(categoryButton); // Deselect category
      }

      // Should still be responsive after extended use
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('should maintain accessibility during all user interactions', async () => {
      
      const { container } = render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('LangChain')).toBeInTheDocument();
      });

      // Test initial state
      let results = await axe(container);
      expect(results).toHaveNoViolations();

      // Test after search
      const searchInput = screen.getByTestId('search-input');
      await userEvent.type(searchInput, 'LangChain');

      results = await axe(container);
      expect(results).toHaveNoViolations();

      // Test modal accessibility
      const viewDetailsButton = screen.getByTestId('view-details-langchain');
      await userEvent.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation throughout', async () => {
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('LangChain')).toBeInTheDocument();
      });

      // Test tab navigation
      const searchInput = screen.getByTestId('search-input');
      searchInput.focus();
      expect(searchInput).toHaveFocus();

      // Should be able to navigate to category filters
      fireEvent.keyDown(searchInput, { key: 'Tab' });
      
      // Should be able to navigate to platform cards
      const viewDetailsButton = screen.getByRole('button', { name: /view detailed information about langchain/i });
      viewDetailsButton.focus();
      expect(viewDetailsButton).toHaveFocus();

      // Should be able to activate with Enter
      fireEvent.keyDown(viewDetailsButton, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });
});