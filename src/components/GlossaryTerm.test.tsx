import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { GlossaryTerm } from './GlossaryTerm';
import { GlossaryTerm as GlossaryTermType } from '../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock data for testing
const mockTerm: GlossaryTermType = {
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
};

// Mock window.open for external link testing
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true
});

describe('GlossaryTerm Component', () => {
  beforeEach(() => {
    mockWindowOpen.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders the term title correctly', () => {
      render(<GlossaryTerm term={mockTerm} />);
      expect(screen.getByText('Artificial Intelligence (AI)')).toBeInTheDocument();
    });

    it('renders the definition when expanded', async () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      // Click to expand
      fireEvent.click(screen.getByText('Artificial Intelligence (AI)'));
      
      expect(screen.getByText('Systems that perform tasks normally requiring human intelligence.')).toBeInTheDocument();
    });

    it('renders external link with proper attributes', () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      const link = screen.getByRole('link', { name: /learn more about artificial intelligence/i });
      expect(link).toHaveAttribute('href', 'https://www.ibm.com/topics/artificial-intelligence');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders all role buttons', () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      expect(screen.getByRole('tab', { name: 'Business & Operations' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Product Manager & Designer' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Engineer' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Data Scientist' })).toBeInTheDocument();
    });
  });

  describe('Interaction Behavior', () => {
    it('expands and collapses content when title is clicked', async () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      const title = screen.getByText('Artificial Intelligence (AI)');
      const content = screen.getByRole('article').querySelector('.glossary-term__content');
      
      // Initially collapsed
      expect(content).not.toHaveClass('expanded');
      
      // Click to expand
      fireEvent.click(title);
      expect(content).toHaveClass('expanded');
      
      // Click to collapse
      fireEvent.click(title);
      expect(content).not.toHaveClass('expanded');
    });

    it('calls onRoleChange when role button is clicked', async () => {
      const mockOnRoleChange = jest.fn();
      render(<GlossaryTerm term={mockTerm} onRoleChange={mockOnRoleChange} />);
      
      fireEvent.click(screen.getByRole('tab', { name: 'Engineer' }));
      expect(mockOnRoleChange).toHaveBeenCalledWith('engineer');
    });

    it('displays role-specific context when role is selected', () => {
      render(<GlossaryTerm term={mockTerm} selectedRole="business" />);
      
      expect(screen.getByText(/Business & Operations:/)).toBeInTheDocument();
      expect(screen.getByText(/Understand automation potential/)).toBeInTheDocument();
    });

    it('opens external link in new tab when clicked', async () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      const link = screen.getByRole('link', { name: /learn more about artificial intelligence/i });
      fireEvent.click(link);
      
      // Note: The actual window.open call happens via the browser's default behavior
      // We can't easily test this without mocking, but we can verify the attributes are correct
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('Keyboard Navigation', () => {
    it('expands/collapses with Enter key on title', async () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      const article = screen.getByRole('article');
      const content = article.querySelector('.glossary-term__content');
      article.focus();
      
      // Press Enter to expand
      fireEvent.keyDown(article, { key: 'Enter' });
      expect(content).toHaveClass('expanded');
      
      // Press Enter to collapse
      fireEvent.keyDown(article, { key: 'Enter' });
      expect(content).not.toHaveClass('expanded');
    });

    it('expands/collapses with Space key on title', async () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      const article = screen.getByRole('article');
      const content = article.querySelector('.glossary-term__content');
      article.focus();
      
      // Press Space to expand
      fireEvent.keyDown(article, { key: ' ' });
      expect(content).toHaveClass('expanded');
    });

    it('navigates between role buttons with arrow keys', async () => {
      const mockOnRoleChange = jest.fn();
      render(<GlossaryTerm term={mockTerm} onRoleChange={mockOnRoleChange} selectedRole="business" />);
      
      const businessButton = screen.getByRole('tab', { name: 'Business & Operations' });
      businessButton.focus();
      
      // Navigate to next role with ArrowRight
      fireEvent.keyDown(businessButton, { key: 'ArrowRight' });
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Product Manager & Designer' })).toHaveFocus();
      });
    });

    it('activates role button with Enter key', async () => {
      const mockOnRoleChange = jest.fn();
      render(<GlossaryTerm term={mockTerm} onRoleChange={mockOnRoleChange} />);
      
      const engineerButton = screen.getByRole('tab', { name: 'Engineer' });
      engineerButton.focus();
      
      fireEvent.keyDown(engineerButton, { key: 'Enter' });
      expect(mockOnRoleChange).toHaveBeenCalledWith('engineer');
    });

    it('activates role button with Space key', async () => {
      const mockOnRoleChange = jest.fn();
      render(<GlossaryTerm term={mockTerm} onRoleChange={mockOnRoleChange} />);
      
      const engineerButton = screen.getByRole('tab', { name: 'Engineer' });
      engineerButton.focus();
      
      fireEvent.keyDown(engineerButton, { key: ' ' });
      expect(mockOnRoleChange).toHaveBeenCalledWith('engineer');
    });

    it('opens external link with Enter key', async () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      const link = screen.getByRole('link', { name: /learn more about artificial intelligence/i });
      link.focus();
      
      fireEvent.keyDown(link, { key: 'Enter' });
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.ibm.com/topics/artificial-intelligence',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('opens external link with Space key', async () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      const link = screen.getByRole('link', { name: /learn more about artificial intelligence/i });
      link.focus();
      
      fireEvent.keyDown(link, { key: ' ' });
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.ibm.com/topics/artificial-intelligence',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('ARIA and Semantic HTML', () => {
    it('has proper ARIA labels and roles', () => {
      render(<GlossaryTerm term={mockTerm} selectedRole="business" />);
      
      // Article role and labeling
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-labelledby', 'term-artificial-intelligence');
      expect(article).toHaveAttribute('aria-describedby', 'definition-artificial-intelligence');
      
      // Tab list for role buttons
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-label', 'Select role for context');
      
      // Tab panel for role context
      expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'role-button-business');
    });

    it('has proper heading hierarchy', () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      // Main term should be h3
      expect(screen.getByRole('heading', { level: 3, name: /artificial intelligence/i })).toBeInTheDocument();
      
      // Role section should be h4
      expect(screen.getByRole('heading', { level: 4, name: 'Role-Specific Context' })).toBeInTheDocument();
    });

    it('has proper tab attributes for role buttons', () => {
      render(<GlossaryTerm term={mockTerm} selectedRole="engineer" />);
      
      const engineerTab = screen.getByRole('tab', { name: 'Engineer' });
      expect(engineerTab).toHaveAttribute('aria-selected', 'true');
      expect(engineerTab).toHaveAttribute('tabindex', '0');
      
      const businessTab = screen.getByRole('tab', { name: 'Business & Operations' });
      expect(businessTab).toHaveAttribute('aria-selected', 'false');
      expect(businessTab).toHaveAttribute('tabindex', '-1');
    });

    it('has proper expanded state for content', async () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveAttribute('aria-expanded', 'false');
      
      // Expand content
      fireEvent.click(screen.getByText('Artificial Intelligence (AI)'));
      expect(title).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Accessibility Compliance', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<GlossaryTerm term={mockTerm} selectedRole="business" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations when expanded', async () => {
      const { container } = render(<GlossaryTerm term={mockTerm} selectedRole="business" />);
      
      // Expand the term
      fireEvent.click(screen.getByText('Artificial Intelligence (AI)'));
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations with different roles', async () => {
      const { container } = render(<GlossaryTerm term={mockTerm} selectedRole="data-scientist" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Focus Management', () => {
    it('is focusable via tabindex', () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('tabindex', '0');
    });

    it('manages focus properly when navigating role buttons', async () => {
      render(<GlossaryTerm term={mockTerm} selectedRole="business" />);
      
      const businessButton = screen.getByRole('tab', { name: 'Business & Operations' });
      businessButton.focus();
      
      // Navigate with arrow key
      fireEvent.keyDown(businessButton, { key: 'ArrowRight' });
      
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Product Manager & Designer' })).toHaveFocus();
      });
    });

    it('returns focus to article when pressing Escape in role buttons', async () => {
      render(<GlossaryTerm term={mockTerm} selectedRole="business" />);
      
      const businessButton = screen.getByRole('tab', { name: 'Business & Operations' });
      const article = screen.getByRole('article');
      
      businessButton.focus();
      fireEvent.keyDown(businessButton, { key: 'Escape' });
      
      await waitFor(() => {
        expect(article).toHaveFocus();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onRoleChange prop gracefully', async () => {
      render(<GlossaryTerm term={mockTerm} />);
      
      // Should not throw error when clicking role button without onRoleChange
      fireEvent.click(screen.getByRole('tab', { name: 'Engineer' }));
      expect(screen.getByRole('tab', { name: 'Engineer' })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<GlossaryTerm term={mockTerm} className="custom-class" />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveClass('glossary-term', 'custom-class');
    });

    it('handles empty role context gracefully', () => {
      const termWithEmptyContext = {
        ...mockTerm,
        roleContext: {
          'business': '',
          'pm-designer': '',
          'engineer': '',
          'data-scientist': ''
        }
      };
      
      render(<GlossaryTerm term={termWithEmptyContext} selectedRole="business" />);
      expect(screen.getByText('Business & Operations:')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('renders properly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<GlossaryTerm term={mockTerm} />);
      
      // Component should still render all elements
      expect(screen.getByText('Artificial Intelligence (AI)')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /learn more/i })).toBeInTheDocument();
    });
  });
});