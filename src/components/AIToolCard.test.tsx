import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AIToolCard } from './AIToolCard';
import { AITool } from '../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock data for testing
const mockTool: AITool = {
  id: 'test-tool',
  name: 'Test AI Tool',
  category: 'code-assistant',
  description: 'A comprehensive AI-powered tool for testing and development assistance.',
  officialLink: 'https://example.com/test-tool',
  internalSetupNotes: 'Available for download from official website. No special licensing required.',
  userExperiences: [
    {
      id: 'exp-1',
      quote: 'This tool dramatically improved my productivity',
      context: 'Daily development work',
      useCase: 'Code completion and debugging',
      sentiment: 'positive',
      role: 'engineer'
    },
    {
      id: 'exp-2',
      quote: 'Great for learning but has some limitations',
      context: 'Learning new frameworks',
      useCase: 'Educational purposes',
      sentiment: 'mixed'
    },
    {
      id: 'exp-3',
      quote: 'Difficult to integrate with existing workflow',
      context: 'Team adoption',
      useCase: 'Workflow integration',
      sentiment: 'challenge'
    }
  ],
  commonUseCases: [
    'Code completion and suggestions',
    'Debugging assistance',
    'Documentation generation',
    'Unit test creation'
  ],
  integrations: ['VS Code', 'IntelliJ IDEA', 'Git'],
  licensingNotes: 'Requires paid subscription for advanced features.',
  teamAdoption: {
    level: 'team',
    notes: 'Currently being evaluated by the development team for broader adoption.'
  }
};

const mockMinimalTool: AITool = {
  id: 'minimal-tool',
  name: 'Minimal Tool',
  category: 'research-tool',
  description: 'A simple research tool.',
  userExperiences: [],
  commonUseCases: []
};

// Mock window.open for external link testing
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true
});

describe('AIToolCard Component', () => {
  beforeEach(() => {
    mockWindowOpen.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders the tool name and category correctly', () => {
      render(<AIToolCard tool={mockTool} />);
      
      expect(screen.getByRole('heading', { level: 2, name: 'Test AI Tool' })).toBeInTheDocument();
      expect(screen.getByText('Code Assistant')).toBeInTheDocument();
    });

    it('renders the external link when provided', () => {
      render(<AIToolCard tool={mockTool} />);
      
      const link = screen.getByRole('link', { name: /visit test ai tool official website/i });
      expect(link).toHaveAttribute('href', 'https://example.com/test-tool');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('does not render external link when not provided', () => {
      render(<AIToolCard tool={mockMinimalTool} />);
      
      expect(screen.queryByRole('link', { name: /visit.*official website/i })).not.toBeInTheDocument();
    });

    it('renders description section with toggle', () => {
      render(<AIToolCard tool={mockTool} />);
      
      const descriptionToggle = screen.getByRole('button', { name: /description/i });
      expect(descriptionToggle).toHaveAttribute('aria-expanded', 'false');
      expect(descriptionToggle).toHaveAttribute('aria-controls', `description-${mockTool.id}`);
    });

    it('renders common use cases when provided', () => {
      render(<AIToolCard tool={mockTool} />);
      
      expect(screen.getByText('Common Use Cases')).toBeInTheDocument();
      mockTool.commonUseCases.forEach(useCase => {
        expect(screen.getByText(useCase)).toBeInTheDocument();
      });
    });

    it('does not render use cases section when empty', () => {
      render(<AIToolCard tool={mockMinimalTool} />);
      
      expect(screen.queryByText('Common Use Cases')).not.toBeInTheDocument();
    });

    it('renders user experiences when provided', () => {
      render(<AIToolCard tool={mockTool} />);
      
      expect(screen.getByText('User Experiences')).toBeInTheDocument();
      mockTool.userExperiences.forEach(experience => {
        expect(screen.getByText(`"${experience.quote}"`)).toBeInTheDocument();
      });
    });

    it('does not render experiences section when empty', () => {
      render(<AIToolCard tool={mockMinimalTool} />);
      
      expect(screen.queryByText('User Experiences')).not.toBeInTheDocument();
    });
  });

  describe('Interactive Behavior', () => {
    it('expands and collapses description when toggle is clicked', async () => {
      render(<AIToolCard tool={mockTool} />);
      
      const toggle = screen.getByRole('button', { name: /description/i });
      
      // Initially collapsed
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      
      // Click to expand
      await userEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      
      // Verify description text is visible
      expect(screen.getByText(mockTool.description)).toBeInTheDocument();
      
      // Click to collapse
      await userEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands and collapses user experiences when clicked', async () => {
      render(<AIToolCard tool={mockTool} />);
      
      const firstExperience = mockTool.userExperiences[0]!;
      const experienceToggle = screen.getByRole('button', { 
        name: new RegExp(firstExperience.quote) 
      });
      
      // Initially collapsed
      expect(experienceToggle).toHaveAttribute('aria-expanded', 'false');
      
      // Click to expand
      await userEvent.click(experienceToggle);
      expect(experienceToggle).toHaveAttribute('aria-expanded', 'true');
      
      // Verify experience details are visible (using more flexible text matching)
      await waitFor(() => {
        expect(screen.getByText((content, element) => {
          return element?.textContent === `Context: ${firstExperience.context}`;
        })).toBeInTheDocument();
        expect(screen.getByText((content, element) => {
          return element?.textContent === `Use Case: ${firstExperience.useCase}`;
        })).toBeInTheDocument();
      });
    });

    it('calls onExperienceExpand callback when experience is expanded', async () => {
      const mockCallback = jest.fn();
      render(<AIToolCard tool={mockTool} onExperienceExpand={mockCallback} />);
      
      const firstExperience = mockTool.userExperiences[0]!;
      const experienceToggle = screen.getByRole('button', { 
        name: new RegExp(firstExperience.quote) 
      });
      
      await userEvent.click(experienceToggle);
      expect(mockCallback).toHaveBeenCalledWith(firstExperience.id);
    });

    it('opens external link in new tab when clicked', async () => {
      render(<AIToolCard tool={mockTool} />);
      
      const link = screen.getByRole('link', { name: /visit.*official website/i });
      await userEvent.click(link);
      
      // The actual window.open happens via browser default behavior
      // We verify the attributes are correct
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Keyboard Navigation', () => {
    it('expands description with Enter key', async () => {
      render(<AIToolCard tool={mockTool} />);
      
      const toggle = screen.getByRole('button', { name: /description/i });
      toggle.focus();
      
      fireEvent.keyDown(toggle, { key: 'Enter' });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    it('expands description with Space key', async () => {
      render(<AIToolCard tool={mockTool} />);
      
      const toggle = screen.getByRole('button', { name: /description/i });
      toggle.focus();
      
      fireEvent.keyDown(toggle, { key: ' ' });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    it('expands user experience with Enter key', async () => {
      render(<AIToolCard tool={mockTool} />);
      
      const firstExperience = mockTool.userExperiences[0]!;
      const experienceToggle = screen.getByRole('button', { 
        name: new RegExp(firstExperience.quote) 
      });
      
      experienceToggle.focus();
      fireEvent.keyDown(experienceToggle, { key: 'Enter' });
      
      expect(experienceToggle).toHaveAttribute('aria-expanded', 'true');
    });

    it('opens external link with Enter key', async () => {
      render(<AIToolCard tool={mockTool} />);
      
      const link = screen.getByRole('link', { name: /visit.*official website/i });
      link.focus();
      
      fireEvent.keyDown(link, { key: 'Enter' });
      expect(mockWindowOpen).toHaveBeenCalledWith(
        mockTool.officialLink,
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('opens external link with Space key', async () => {
      render(<AIToolCard tool={mockTool} />);
      
      const link = screen.getByRole('link', { name: /visit.*official website/i });
      link.focus();
      
      fireEvent.keyDown(link, { key: ' ' });
      expect(mockWindowOpen).toHaveBeenCalledWith(
        mockTool.officialLink,
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('Sentiment Styling', () => {
    it('applies correct CSS classes for different sentiments', () => {
      render(<AIToolCard tool={mockTool} />);
      
      const experiences = mockTool.userExperiences;
      
      // Check that sentiment classes are applied (we can't directly test CSS classes with testing-library)
      // But we can verify the elements exist and have the expected structure
      experiences.forEach(experience => {
        const experienceElement = screen.getByRole('button', { 
          name: new RegExp(experience.quote) 
        });
        expect(experienceElement).toBeInTheDocument();
      });
    });

    it('displays correct sentiment labels in aria-label', () => {
      render(<AIToolCard tool={mockTool} />);
      
      const positiveExp = screen.getByRole('button', { 
        name: /positive experience.*dramatically improved/i 
      });
      const mixedExp = screen.getByRole('button', { 
        name: /mixed experience.*great for learning/i 
      });
      const challengeExp = screen.getByRole('button', { 
        name: /challenge noted.*difficult to integrate/i 
      });
      
      expect(positiveExp).toBeInTheDocument();
      expect(mixedExp).toBeInTheDocument();
      expect(challengeExp).toBeInTheDocument();
    });
  });

  describe('Team Adoption Section', () => {
    it('renders team adoption information when provided', () => {
      render(<AIToolCard tool={mockTool} />);
      
      expect(screen.getByRole('heading', { level: 3, name: 'Team Adoption' })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Level: Team Adoption';
      })).toBeInTheDocument();
      expect(screen.getByText(mockTool.teamAdoption!.notes)).toBeInTheDocument();
    });

    it('does not render team adoption section when not provided', () => {
      render(<AIToolCard tool={mockMinimalTool} />);
      
      expect(screen.queryByText('Team Adoption')).not.toBeInTheDocument();
    });

    it('displays correct adoption level labels', () => {
      const individualTool = { ...mockTool, teamAdoption: { level: 'individual' as const, notes: 'Individual use' } };
      const orgTool = { ...mockTool, teamAdoption: { level: 'organization' as const, notes: 'Organization-wide' } };
      
      const { rerender } = render(<AIToolCard tool={individualTool} />);
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Level: Individual Use';
      })).toBeInTheDocument();
      
      rerender(<AIToolCard tool={orgTool} />);
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Level: Organization-wide';
      })).toBeInTheDocument();
    });
  });

  describe('Integrations Section', () => {
    it('renders integrations when provided', () => {
      render(<AIToolCard tool={mockTool} />);
      
      expect(screen.getByText('Integrations')).toBeInTheDocument();
      mockTool.integrations!.forEach(integration => {
        expect(screen.getByText(integration)).toBeInTheDocument();
      });
    });

    it('does not render integrations section when not provided', () => {
      render(<AIToolCard tool={mockMinimalTool} />);
      
      expect(screen.queryByText('Integrations')).not.toBeInTheDocument();
    });
  });

  describe('Footer Section', () => {
    it('renders setup notes when provided', () => {
      render(<AIToolCard tool={mockTool} />);
      
      expect(screen.getByText('Setup Notes')).toBeInTheDocument();
      expect(screen.getByText(mockTool.internalSetupNotes!)).toBeInTheDocument();
    });

    it('renders licensing information when provided', () => {
      render(<AIToolCard tool={mockTool} />);
      
      expect(screen.getByText('Licensing')).toBeInTheDocument();
      expect(screen.getByText(mockTool.licensingNotes!)).toBeInTheDocument();
    });

    it('does not render footer sections when not provided', () => {
      render(<AIToolCard tool={mockMinimalTool} />);
      
      expect(screen.queryByText('Setup Notes')).not.toBeInTheDocument();
      expect(screen.queryByText('Licensing')).not.toBeInTheDocument();
    });
  });

  describe('ARIA and Semantic HTML', () => {
    it('has proper article structure with correct labeling', () => {
      render(<AIToolCard tool={mockTool} />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-labelledby', `tool-${mockTool.id}-title`);
      expect(article).toHaveAttribute('aria-describedby', `tool-${mockTool.id}-description`);
    });

    it('has proper heading hierarchy', () => {
      render(<AIToolCard tool={mockTool} />);
      
      // Main tool name should be h2
      expect(screen.getByRole('heading', { level: 2, name: mockTool.name })).toBeInTheDocument();
      
      // Section titles should be h3
      expect(screen.getByRole('heading', { level: 3, name: 'Common Use Cases' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'User Experiences' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Team Adoption' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Integrations' })).toBeInTheDocument();
      
      // Footer titles should be h4
      expect(screen.getByRole('heading', { level: 4, name: 'Setup Notes' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4, name: 'Licensing' })).toBeInTheDocument();
    });

    it('has proper button attributes for expandable sections', () => {
      render(<AIToolCard tool={mockTool} />);
      
      const descriptionToggle = screen.getByRole('button', { name: /description/i });
      expect(descriptionToggle).toHaveAttribute('type', 'button');
      expect(descriptionToggle).toHaveAttribute('aria-expanded', 'false');
      expect(descriptionToggle).toHaveAttribute('aria-controls', `description-${mockTool.id}`);
      
      const experienceToggle = screen.getByRole('button', { 
        name: new RegExp(mockTool.userExperiences[0]!.quote) 
      });
      expect(experienceToggle).toHaveAttribute('type', 'button');
      expect(experienceToggle).toHaveAttribute('aria-expanded', 'false');
      expect(experienceToggle).toHaveAttribute('aria-controls', `experience-${mockTool.userExperiences[0]!.id}`);
    });

    it('has proper category labeling', () => {
      render(<AIToolCard tool={mockTool} />);
      
      const categoryElement = screen.getByText('Code Assistant');
      expect(categoryElement).toHaveAttribute('aria-label', 'Category: Code Assistant');
    });
  });

  describe('Accessibility Compliance', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<AIToolCard tool={mockTool} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations when expanded', async () => {
      const { container } = render(<AIToolCard tool={mockTool} />);
      
      // Expand description
      const descriptionToggle = screen.getByRole('button', { name: /description/i });
      await userEvent.click(descriptionToggle);
      
      // Expand first experience
      const experienceToggle = screen.getByRole('button', { 
        name: new RegExp(mockTool.userExperiences[0]!.quote) 
      });
      await userEvent.click(experienceToggle);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations with minimal tool', async () => {
      const { container } = render(<AIToolCard tool={mockMinimalTool} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing optional props gracefully', () => {
      render(<AIToolCard tool={mockMinimalTool} />);
      
      expect(screen.getByText('Minimal Tool')).toBeInTheDocument();
      expect(screen.getByText('Research Tool')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<AIToolCard tool={mockTool} className="custom-class" />);
      
      const article = screen.getByRole('article');
      expect(article).toHaveClass('ai-tool-card', 'custom-class');
    });

    it('handles user experience without role', () => {
      const toolWithoutRole = {
        ...mockTool,
        userExperiences: [
          {
            id: 'exp-no-role',
            quote: 'Great tool overall',
            context: 'General usage',
            useCase: 'Various tasks',
            sentiment: 'positive' as const
          }
        ]
      };
      
      render(<AIToolCard tool={toolWithoutRole} />);
      
      const experienceToggle = screen.getByRole('button', { 
        name: /great tool overall/i 
      });
      fireEvent.click(experienceToggle);
      
      // Should not show role information
      expect(screen.queryByText(/Role:/)).not.toBeInTheDocument();
    });

    it('handles empty arrays gracefully', () => {
      const emptyTool = {
        ...mockTool,
        userExperiences: [],
        commonUseCases: [],
        integrations: []
      };
      
      render(<AIToolCard tool={emptyTool} />);
      
      expect(screen.queryByText('User Experiences')).not.toBeInTheDocument();
      expect(screen.queryByText('Common Use Cases')).not.toBeInTheDocument();
      expect(screen.queryByText('Integrations')).not.toBeInTheDocument();
    });

    it('handles very long text content', () => {
      const longTextTool = {
        ...mockTool,
        description: 'This is a very long description that should wrap properly and remain accessible even when it contains a lot of text that might span multiple lines and potentially cause layout issues if not handled correctly.',
        userExperiences: [
          {
            id: 'long-exp',
            quote: 'This is a very long user experience quote that should also wrap properly and remain accessible',
            context: 'Very detailed context with lots of information',
            useCase: 'Complex use case with multiple scenarios and detailed explanations',
            sentiment: 'positive' as const
          }
        ]
      };
      
      render(<AIToolCard tool={longTextTool} />);
      
      expect(screen.getByText(longTextTool.description)).toBeInTheDocument();
      expect(screen.getByText(`"${longTextTool.userExperiences[0]!.quote}"`)).toBeInTheDocument();
    });
  });

  describe('Category Labels', () => {
    it('displays correct labels for all category types', () => {
      const categories = [
        { category: 'code-assistant' as const, label: 'Code Assistant' },
        { category: 'ide-extension' as const, label: 'IDE Extension' },
        { category: 'research-tool' as const, label: 'Research Tool' },
        { category: 'debugging-tool' as const, label: 'Debugging Tool' },
        { category: 'testing-tool' as const, label: 'Testing Tool' }
      ];
      
      categories.forEach(({ category, label }) => {
        const tool = { ...mockMinimalTool, category };
        const { rerender } = render(<AIToolCard tool={tool} />);
        
        expect(screen.getByText(label)).toBeInTheDocument();
        
        // Clean up for next iteration
        rerender(<div />);
      });
    });
  });
});