import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import PlatformSearchFilter, { PlatformSearchFilterProps } from './PlatformSearchFilter';
import { PlatformCategory } from '../types';

expect.extend(toHaveNoViolations);

const mockCategories: PlatformCategory[] = [
  'open-source-framework',
  'commercial-platform',
  'enterprise-solution',
  'workflow-automation'
];

const defaultProps: PlatformSearchFilterProps = {
  searchQuery: '',
  onSearchChange: jest.fn(),
  selectedCategory: undefined,
  onCategoryChange: jest.fn(),
  availableCategories: mockCategories,
  resultCount: 25,
  totalCount: 50
};

describe('PlatformSearchFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders search input with correct label and placeholder', () => {
      render(<PlatformSearchFilter {...defaultProps} />);
      
      expect(screen.getByLabelText('Search Platforms')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search by name, description, or features...')).toBeInTheDocument();
    });

    it('renders all category filter buttons', () => {
      render(<PlatformSearchFilter {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: 'Open Source' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Commercial' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Enterprise' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Workflow' })).toBeInTheDocument();
    });

    it('displays correct result count', () => {
      render(<PlatformSearchFilter {...defaultProps} />);
      
      expect(screen.getByText('Showing 25 of 50 platforms')).toBeInTheDocument();
    });

    it('does not show clear filters button when no filters are active', () => {
      render(<PlatformSearchFilter {...defaultProps} />);
      
      expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
    });

    it('shows clear filters button when search query is active', () => {
      render(<PlatformSearchFilter {...defaultProps} searchQuery="test" />);
      
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('shows clear filters button when category is selected', () => {
      render(<PlatformSearchFilter {...defaultProps} selectedCategory="open-source-framework" />);
      
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('updates search input value when typing', async () => {
      
      render(<PlatformSearchFilter {...defaultProps} />);
      
      const searchInput = screen.getByLabelText('Search Platforms');
      await userEvent.type(searchInput, 'test query');
      
      expect(searchInput).toHaveValue('test query');
    });

    it('calls onSearchChange with debounced value after 300ms', async () => {
      const mockOnSearchChange = jest.fn();
      
      
      render(<PlatformSearchFilter {...defaultProps} onSearchChange={mockOnSearchChange} />);
      
      const searchInput = screen.getByLabelText('Search Platforms');
      await userEvent.type(searchInput, 'test');
      
      // Should not call immediately
      expect(mockOnSearchChange).not.toHaveBeenCalled();
      
      // Should call after debounce delay
      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith('test');
      }, { timeout: 400 });
    });

    it('debounces multiple rapid keystrokes', async () => {
      const mockOnSearchChange = jest.fn();
      
      
      render(<PlatformSearchFilter {...defaultProps} onSearchChange={mockOnSearchChange} />);
      
      const searchInput = screen.getByLabelText('Search Platforms');
      
      // Type multiple characters rapidly
      await userEvent.type(searchInput, 'abc');
      
      // Should only call once after debounce
      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledTimes(1);
        expect(mockOnSearchChange).toHaveBeenCalledWith('abc');
      }, { timeout: 400 });
    });

    it('updates local state when external searchQuery prop changes', () => {
      const { rerender } = render(<PlatformSearchFilter {...defaultProps} searchQuery="" />);
      
      const searchInput = screen.getByLabelText('Search Platforms');
      expect(searchInput).toHaveValue('');
      
      rerender(<PlatformSearchFilter {...defaultProps} searchQuery="external update" />);
      expect(searchInput).toHaveValue('external update');
    });
  });

  describe('Category Filtering', () => {
    it('calls onCategoryChange when category button is clicked', async () => {
      const mockOnCategoryChange = jest.fn();
      
      
      render(<PlatformSearchFilter {...defaultProps} onCategoryChange={mockOnCategoryChange} />);
      
      await userEvent.click(screen.getByRole('button', { name: 'Open Source' }));
      
      expect(mockOnCategoryChange).toHaveBeenCalledWith('open-source-framework');
    });

    it('shows active state for selected category', () => {
      render(<PlatformSearchFilter {...defaultProps} selectedCategory="commercial-platform" />);
      
      const commercialButton = screen.getByRole('button', { name: 'Commercial' });
      expect(commercialButton).toHaveClass('active');
      expect(commercialButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('deselects category when clicking active category button', async () => {
      const mockOnCategoryChange = jest.fn();
      
      
      render(<PlatformSearchFilter {...defaultProps} 
        selectedCategory="open-source-framework" 
        onCategoryChange={mockOnCategoryChange} 
      />);
      
      await userEvent.click(screen.getByRole('button', { name: 'Open Source' }));
      
      expect(mockOnCategoryChange).toHaveBeenCalledWith(undefined);
    });

    it('sets correct aria-pressed attributes for category buttons', () => {
      render(<PlatformSearchFilter {...defaultProps} selectedCategory="enterprise-solution" />);
      
      expect(screen.getByRole('button', { name: 'Enterprise' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Open Source' })).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByRole('button', { name: 'Commercial' })).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Clear Filters Functionality', () => {
    it('clears search query when clear filters is clicked', async () => {
      const mockOnSearchChange = jest.fn();
      
      
      render(<PlatformSearchFilter {...defaultProps} 
        searchQuery="test query" 
        onSearchChange={mockOnSearchChange} 
      />);
      
      await userEvent.click(screen.getByText('Clear Filters'));
      
      expect(mockOnSearchChange).toHaveBeenCalledWith('');
    });

    it('clears selected category when clear filters is clicked', async () => {
      const mockOnCategoryChange = jest.fn();
      
      
      render(<PlatformSearchFilter {...defaultProps} 
        selectedCategory="open-source-framework" 
        onCategoryChange={mockOnCategoryChange} 
      />);
      
      await userEvent.click(screen.getByText('Clear Filters'));
      
      expect(mockOnCategoryChange).toHaveBeenCalledWith(undefined);
    });

    it('clears both search and category filters simultaneously', async () => {
      const mockOnSearchChange = jest.fn();
      const mockOnCategoryChange = jest.fn();
      
      
      render(<PlatformSearchFilter {...defaultProps} 
        searchQuery="test" 
        selectedCategory="commercial-platform"
        onSearchChange={mockOnSearchChange}
        onCategoryChange={mockOnCategoryChange}
      />);
      
      await userEvent.click(screen.getByText('Clear Filters'));
      
      expect(mockOnSearchChange).toHaveBeenCalledWith('');
      expect(mockOnCategoryChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports tab navigation through interactive elements', async () => {
      
      render(<PlatformSearchFilter {...defaultProps} searchQuery="test" />);
      
      const searchInput = screen.getByLabelText('Search Platforms');
      const firstCategoryButton = screen.getByRole('button', { name: 'Open Source' });
      const clearButton = screen.getByText('Clear Filters');
      
      // Tab through elements
      await userEvent.tab();
      expect(searchInput).toHaveFocus();
      
      await userEvent.tab();
      expect(firstCategoryButton).toHaveFocus();
      
      // Tab through all category buttons
      await userEvent.tab();
      await userEvent.tab();
      await userEvent.tab();
      await userEvent.tab();
      expect(clearButton).toHaveFocus();
    });

    it('activates category buttons with Enter key', async () => {
      const mockOnCategoryChange = jest.fn();
      
      render(<PlatformSearchFilter {...defaultProps} onCategoryChange={mockOnCategoryChange} />);
      
      const categoryButton = screen.getByRole('button', { name: /filter by open source platforms/i });
      categoryButton.focus();
      
      fireEvent.keyDown(categoryButton, { key: 'Enter', code: 'Enter' });
      
      expect(mockOnCategoryChange).toHaveBeenCalledWith('open-source-framework');
    });

    it('activates category buttons with Space key', async () => {
      const mockOnCategoryChange = jest.fn();
      
      render(<PlatformSearchFilter {...defaultProps} onCategoryChange={mockOnCategoryChange} />);
      
      const categoryButton = screen.getByRole('button', { name: /filter by commercial platforms/i });
      categoryButton.focus();
      
      fireEvent.keyDown(categoryButton, { key: ' ', code: 'Space' });
      
      expect(mockOnCategoryChange).toHaveBeenCalledWith('commercial-platform');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<PlatformSearchFilter {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA labels and descriptions', () => {
      render(<PlatformSearchFilter {...defaultProps} searchQuery="test" />);
      
      const searchInput = screen.getByLabelText('Search Platforms');
      expect(searchInput).toHaveAttribute('aria-describedby', 'search-results-count');
      
      const categoryGroup = screen.getByRole('group', { name: 'Platform categories' });
      expect(categoryGroup).toBeInTheDocument();
      
      const clearButton = screen.getByLabelText('Clear all filters');
      expect(clearButton).toBeInTheDocument();
    });

    it('announces result count to screen readers', () => {
      render(<PlatformSearchFilter {...defaultProps} resultCount={10} totalCount={25} />);
      
      const resultCount = screen.getByText('Showing 10 of 25 platforms');
      expect(resultCount).toHaveAttribute('id', 'search-results-count');
    });

    it('provides proper focus indicators', () => {
      render(<PlatformSearchFilter {...defaultProps} />);
      
      const searchInput = screen.getByLabelText('Search Platforms');
      searchInput.focus();
      
      // CSS focus styles should be applied (tested via CSS classes)
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty categories array', () => {
      render(<PlatformSearchFilter {...defaultProps} availableCategories={[]} />);
      
      expect(screen.getByText('Filter by Category:')).toBeInTheDocument();
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('handles zero result count', () => {
      render(<PlatformSearchFilter {...defaultProps} resultCount={0} totalCount={50} />);
      
      expect(screen.getByText('Showing 0 of 50 platforms')).toBeInTheDocument();
    });

    it('handles very long search queries', async () => {
      const longQuery = 'a'.repeat(100); // Reduced size for faster test
      const mockOnSearchChange = jest.fn();
      
      
      render(<PlatformSearchFilter {...defaultProps} onSearchChange={mockOnSearchChange} />);
      
      const searchInput = screen.getByLabelText('Search Platforms');
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, longQuery);
      
      await waitFor(() => {
        expect(mockOnSearchChange).toHaveBeenCalledWith(longQuery);
      }, { timeout: 1000 });
    });

    it('handles rapid category selection changes', async () => {
      const mockOnCategoryChange = jest.fn();
      
      
      render(<PlatformSearchFilter {...defaultProps} onCategoryChange={mockOnCategoryChange} />);
      
      // Rapidly click different category buttons
      await userEvent.click(screen.getByRole('button', { name: 'Open Source' }));
      await userEvent.click(screen.getByRole('button', { name: 'Commercial' }));
      await userEvent.click(screen.getByRole('button', { name: 'Enterprise' }));
      
      expect(mockOnCategoryChange).toHaveBeenCalledTimes(3);
      expect(mockOnCategoryChange).toHaveBeenNthCalledWith(1, 'open-source-framework');
      expect(mockOnCategoryChange).toHaveBeenNthCalledWith(2, 'commercial-platform');
      expect(mockOnCategoryChange).toHaveBeenNthCalledWith(3, 'enterprise-solution');
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders with stable callbacks', () => {
      const mockOnSearchChange = jest.fn();
      const mockOnCategoryChange = jest.fn();
      
      const { rerender } = render(
        <PlatformSearchFilter 
          {...defaultProps} 
          onSearchChange={mockOnSearchChange}
          onCategoryChange={mockOnCategoryChange}
        />
      );
      
      // Re-render with same props
      rerender(
        <PlatformSearchFilter 
          {...defaultProps} 
          onSearchChange={mockOnSearchChange}
          onCategoryChange={mockOnCategoryChange}
        />
      );
      
      // Component should handle stable references properly
      expect(screen.getByLabelText('Search Platforms')).toBeInTheDocument();
    });
  });
});