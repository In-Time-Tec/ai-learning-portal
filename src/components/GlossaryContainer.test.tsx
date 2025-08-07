import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { GlossaryContainer } from './GlossaryContainer';
import { glossaryDataService } from '../services/GlossaryDataService';
import { GlossaryTerm, UserRole } from '../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock the GlossaryDataService
jest.mock('../services/GlossaryDataService');
const mockGlossaryDataService = glossaryDataService as jest.Mocked<typeof glossaryDataService>;

// Mock data
const mockTerms: GlossaryTerm[] = [
  {
    id: 'artificial-intelligence',
    term: 'Artificial Intelligence (AI)',
    definition: 'Systems that perform tasks normally requiring human intelligence.',
    externalLink: 'https://www.ibm.com/topics/artificial-intelligence',
    roleContext: {
      'business': 'Understand automation potential',
      'pm-designer': 'Scope AI features',
      'engineer': 'Implement AI integrations',
      'data-scientist': 'Concept context'
    }
  },
  {
    id: 'machine-learning',
    term: 'Machine Learning (ML)',
    definition: 'A subset of AI where models learn patterns from data.',
    externalLink: 'https://cloud.google.com/learn/what-is-machine-learning',
    roleContext: {
      'business': 'Recognize data-driven insights',
      'pm-designer': 'Understand ML capabilities',
      'engineer': 'Integrate ML APIs',
      'data-scientist': 'Model-building foundation'
    }
  },
  {
    id: 'neural-network',
    term: 'Neural Network',
    definition: 'A series of interconnected nodes mimicking brain neurons for learning patterns.',
    externalLink: 'https://en.wikipedia.org/wiki/Artificial_neural_network',
    roleContext: {
      'business': 'Recognize deep learning use cases',
      'pm-designer': 'Understand AI capabilities',
      'engineer': 'Deploy scalable architectures',
      'data-scientist': 'Build deep learning models'
    }
  }
];

describe('GlossaryContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGlossaryDataService.loadGlossary.mockResolvedValue(mockTerms);
    mockGlossaryDataService.searchTerms.mockImplementation((query: string) => {
      if (!query.trim()) return mockTerms;
      return mockTerms.filter(term =>
        term.term.toLowerCase().includes(query.toLowerCase()) ||
        term.definition.toLowerCase().includes(query.toLowerCase())
      );
    });
  });

  describe('Loading State', () => {
    it('displays loading state initially', async () => {
      // Make loadGlossary hang to test loading state
      mockGlossaryDataService.loadGlossary.mockImplementation(
        () => new Promise(() => { }) // Never resolves
      );

      render(<GlossaryContainer />);

      expect(screen.getByRole('status', { name: /loading content/i })).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('skeleton-loader');
    });

    it('has accessible loading state', async () => {
      mockGlossaryDataService.loadGlossary.mockImplementation(
        () => new Promise(() => { })
      );

      const { container } = render(<GlossaryContainer />);

      const loadingElement = screen.getByRole('status', { name: /loading content/i });
      expect(loadingElement).toHaveAttribute('aria-label', 'Loading content');

      // Check accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Error Handling', () => {
    it('displays error state when data loading fails', async () => {
      const errorMessage = 'Failed to load glossary data';
      mockGlossaryDataService.loadGlossary.mockRejectedValue(new Error(errorMessage));

      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Unable to Load Glossary')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('allows retry after error', async () => {
      mockGlossaryDataService.loadGlossary
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockTerms);

      render(<GlossaryContainer />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Glossary')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      // Wait for successful load
      await waitFor(() => {
        expect(screen.getByText('AI Glossary')).toBeInTheDocument();
        expect(screen.getByText('Showing 3 of 3 terms')).toBeInTheDocument();
      });
    });

    it('shows retry loading state', async () => {
      mockGlossaryDataService.loadGlossary.mockRejectedValue(new Error('Network error'));

      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      // Mock a slow retry that never resolves during the test
      let resolveRetry: (value: any) => void;
      mockGlossaryDataService.loadGlossary.mockImplementation(
        () => new Promise(resolve => { resolveRetry = resolve; })
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      // After retry is clicked, the component should show loading state
      await waitFor(() => {
        expect(screen.getByRole('status', { name: /loading content/i })).toBeInTheDocument();
        expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('renders glossary terms after successful load', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('AI Glossary')).toBeInTheDocument();
        expect(screen.getByText('Artificial Intelligence (AI)')).toBeInTheDocument();
        expect(screen.getByText('Machine Learning (ML)')).toBeInTheDocument();
        expect(screen.getByText('Neural Network')).toBeInTheDocument();
      });

      expect(screen.getByText('Showing 3 of 3 terms')).toBeInTheDocument();
    });

    it('displays terms in alphabetical order', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        const termElements = screen.getAllByRole('article');
        expect(termElements).toHaveLength(3);
      });

      const termTitles = screen.getAllByRole('heading', { level: 2 });
      expect(termTitles[0]).toHaveTextContent('Artificial Intelligence (AI)');
      expect(termTitles[1]).toHaveTextContent('Machine Learning (ML)');
      expect(termTitles[2]).toHaveTextContent('Neural Network');
    });

    it('displays correct term count and description', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText(/Explore 3 essential AI terms/)).toBeInTheDocument();
        expect(screen.getByText('Showing 3 of 3 terms')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters terms based on search query', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Showing 3 of 3 terms')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search terms and definitions');
      await userEvent.type(searchInput, 'machine');

      await waitFor(() => {
        expect(mockGlossaryDataService.searchTerms).toHaveBeenCalledWith('machine');
        expect(screen.getByText('Showing 1 of 3 terms matching "machine"')).toBeInTheDocument();
        expect(screen.getByText('Machine Learning (ML)')).toBeInTheDocument();
        expect(screen.queryByText('Artificial Intelligence (AI)')).not.toBeInTheDocument();
      });
    });

    it('shows no results message for empty search', async () => {
      mockGlossaryDataService.searchTerms.mockReturnValue([]);

      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Showing 3 of 3 terms')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search terms and definitions');
      await userEvent.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No terms found for "nonexistent". Try a different search term.')).toBeInTheDocument();
        expect(screen.getByText('No matching terms found')).toBeInTheDocument();
      });
    });

    it('clears search with clear button', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Showing 3 of 3 terms')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search terms and definitions');
      await userEvent.type(searchInput, 'test');

      const clearButton = screen.getByLabelText('Clear search');
      await userEvent.click(clearButton);

      expect(searchInput).toHaveValue('');
      expect(screen.getByText('Showing 3 of 3 terms')).toBeInTheDocument();
    });

    it('clears search with Escape key', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Showing 3 of 3 terms')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search terms and definitions');
      await userEvent.type(searchInput, 'test');
      await userEvent.keyboard('{Escape}');

      expect(searchInput).toHaveValue('');
    });
  });

  describe('Role Filtering', () => {
    it('displays all role filter buttons', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        const roleFilterGroup = screen.getByRole('group', { name: 'Role filter options' });
        expect(within(roleFilterGroup).getByText('All Roles')).toBeInTheDocument();
        expect(within(roleFilterGroup).getByText('Business & Operations')).toBeInTheDocument();
        expect(within(roleFilterGroup).getByText('Product Manager & Designer')).toBeInTheDocument();
        expect(within(roleFilterGroup).getByText('Engineer')).toBeInTheDocument();
        expect(within(roleFilterGroup).getByText('Data Scientist')).toBeInTheDocument();
      });
    });

    it('sets initial role when provided', async () => {
      render(<GlossaryContainer initialRole="engineer" />);

      await waitFor(() => {
        const roleFilterGroup = screen.getByRole('group', { name: 'Role filter options' });
        const engineerButton = within(roleFilterGroup).getByText('Engineer');
        expect(engineerButton).toHaveAttribute('aria-pressed', 'true');
        expect(engineerButton).toHaveClass('active');
      });
    });

    it('calls onRoleChange when role is selected', async () => {
      const mockOnRoleChange = jest.fn();
      render(<GlossaryContainer onRoleChange={mockOnRoleChange} />);

      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'Role filter options' })).toBeInTheDocument();
      });

      const roleFilterGroup = screen.getByRole('group', { name: 'Role filter options' });
      const businessButton = within(roleFilterGroup).getByText('Business & Operations');
      await userEvent.click(businessButton);

      expect(mockOnRoleChange).toHaveBeenCalledWith('business');
    });

    it('updates results summary when role is selected', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Showing 3 of 3 terms')).toBeInTheDocument();
      });

      const roleFilterGroup = screen.getByRole('group', { name: 'Role filter options' });
      const engineerButton = within(roleFilterGroup).getByText('Engineer');
      await userEvent.click(engineerButton);

      expect(screen.getByText('Showing 3 of 3 terms for Engineer')).toBeInTheDocument();
    });

    it('clears role filter when "All Roles" is clicked', async () => {
      const mockOnRoleChange = jest.fn();
      render(<GlossaryContainer initialRole="business" onRoleChange={mockOnRoleChange} />);

      await waitFor(() => {
        const roleFilterGroup = screen.getByRole('group', { name: 'Role filter options' });
        const businessButton = within(roleFilterGroup).getByText('Business & Operations');
        expect(businessButton).toHaveClass('active');
      });

      const allRolesButton = screen.getByText('All Roles');
      await userEvent.click(allRolesButton);

      expect(allRolesButton).toHaveClass('active');
      expect(mockOnRoleChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation in search input', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByLabelText('Search terms and definitions')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search terms and definitions');
      searchInput.focus();

      await userEvent.keyboard('{ArrowDown}');

      // Should focus first role button
      const roleFilterGroup = screen.getByRole('group', { name: 'Role filter options' });
      const businessButton = within(roleFilterGroup).getByText('Business & Operations');
      expect(businessButton).toHaveFocus();
    });

    it('supports keyboard navigation between role buttons', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'Role filter options' })).toBeInTheDocument();
      });

      const roleFilterGroup = screen.getByRole('group', { name: 'Role filter options' });
      const businessButton = within(roleFilterGroup).getByText('Business & Operations');
      businessButton.focus();

      await userEvent.keyboard('{ArrowRight}');

      const pmButton = within(roleFilterGroup).getByText('Product Manager & Designer');
      expect(pmButton).toHaveFocus();

      await userEvent.keyboard('{ArrowLeft}');
      expect(businessButton).toHaveFocus();
    });

    it('supports Enter and Space for role selection', async () => {
      const mockOnRoleChange = jest.fn();
      render(<GlossaryContainer onRoleChange={mockOnRoleChange} />);

      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'Role filter options' })).toBeInTheDocument();
      });

      const roleFilterGroup = screen.getByRole('group', { name: 'Role filter options' });
      const engineerButton = within(roleFilterGroup).getByText('Engineer');
      engineerButton.focus();

      await userEvent.keyboard('{Enter}');
      expect(mockOnRoleChange).toHaveBeenCalledWith('engineer');

      mockOnRoleChange.mockClear();

      await userEvent.keyboard(' ');
      expect(mockOnRoleChange).toHaveBeenCalledWith('engineer');
    });

    it('supports Escape to return focus to search', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'Role filter options' })).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search terms and definitions');
      const roleFilterGroup = screen.getByRole('group', { name: 'Role filter options' });
      const engineerButton = within(roleFilterGroup).getByText('Engineer');

      engineerButton.focus();
      await userEvent.keyboard('{Escape}');

      expect(searchInput).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('AI Glossary')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA labels and roles', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('AI Glossary')).toBeInTheDocument();
        expect(screen.getByRole('group', { name: 'Role filter options' })).toBeInTheDocument();
        expect(screen.getByLabelText('Search terms and definitions')).toBeInTheDocument();
      });

      const roleButtons = screen.getAllByRole('button');
      const roleFilterButtons = roleButtons.filter(button =>
        button.hasAttribute('aria-pressed')
      );

      expect(roleFilterButtons.length).toBeGreaterThan(0);
      roleFilterButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed');
      });
    });

    it('announces results changes to screen readers', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Showing 3 of 3 terms')).toBeInTheDocument();
      });

      const resultsElement = screen.getByText('Showing 3 of 3 terms').parentElement;
      expect(resultsElement).toHaveAttribute('aria-live', 'polite');
    });

    it('has proper fieldset and legend for role filters', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Filter by role perspective')).toBeInTheDocument();
      });

      const fieldset = screen.getByRole('group', { name: 'Filter by role perspective' });
      expect(fieldset).toBeInTheDocument();

      const legend = within(fieldset).getByText('Filter by role perspective');
      expect(legend).toBeInTheDocument();
    });
  });

  describe('Integration with GlossaryTerm', () => {
    it('passes selected role to GlossaryTerm components', async () => {
      render(<GlossaryContainer initialRole="business" />);

      await waitFor(() => {
        expect(screen.getByText('Artificial Intelligence (AI)')).toBeInTheDocument();
      });

      // The GlossaryTerm components should receive the selected role
      // This is tested indirectly by checking that role context is available
      const roleFilterGroup = screen.getByRole('group', { name: 'Role filter options' });
      const businessButton = within(roleFilterGroup).getByText('Business & Operations');
      expect(businessButton).toHaveClass('active');
    });

    it('updates all terms when role changes', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Artificial Intelligence (AI)')).toBeInTheDocument();
      });

      const roleFilterGroup = screen.getByRole('group', { name: 'Role filter options' });
      const engineerButton = within(roleFilterGroup).getByText('Engineer');
      await userEvent.click(engineerButton);

      // All GlossaryTerm components should now have engineer role selected
      expect(engineerButton).toHaveClass('active');
      expect(screen.getByText('Showing 3 of 3 terms for Engineer')).toBeInTheDocument();
    });
  });

  describe('Combined Search and Role Filtering', () => {
    it('shows combined search and role filter in results', async () => {
      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Showing 3 of 3 terms')).toBeInTheDocument();
      });

      // Apply role filter
      const roleFilterGroup = screen.getByRole('group', { name: 'Role filter options' });
      const engineerButton = within(roleFilterGroup).getByText('Engineer');
      await userEvent.click(engineerButton);

      // Apply search
      const searchInput = screen.getByLabelText('Search terms and definitions');
      await userEvent.type(searchInput, 'machine');

      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 3 terms matching "machine" for Engineer')).toBeInTheDocument();
      });
    });

    it('clears search from no results state', async () => {
      mockGlossaryDataService.searchTerms.mockReturnValue([]);

      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Showing 3 of 3 terms')).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText('Search terms and definitions');
      await userEvent.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No matching terms found')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Clear Search');
      await userEvent.click(clearButton);

      expect(searchInput).toHaveFocus();
      expect(searchInput).toHaveValue('');
    });
  });
});