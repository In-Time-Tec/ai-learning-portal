import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import PlatformCard from './PlatformCard';
import { AgentPlatform } from '../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock platform data for testing
const mockPlatform: AgentPlatform = {
  id: 'test-platform-1',
  name: 'Test AI Platform',
  category: 'open-source-framework',
  type: 'open-source',
  description: 'A comprehensive test platform for AI development with advanced features.',
  detailedDescription: 'Detailed description of the test platform with comprehensive information.',
  strengths: ['Easy to use', 'Well documented', 'Active community'],
  weaknesses: ['Limited enterprise features', 'Steep learning curve'],
  primaryUseCases: ['Chatbots', 'Data analysis', 'Automation'],
  keyFeatures: ['Multi-agent support', 'Real-time processing', 'Cloud integration', 'Advanced analytics', 'Custom workflows'],
  officialWebsite: 'https://example.com',
  documentation: 'https://docs.example.com',
  githubRepository: 'https://github.com/example/platform',
  pricing: 'Free with paid tiers',
  supportedLanguages: ['Python', 'JavaScript', 'TypeScript'],
  integrations: ['Slack', 'Discord', 'Teams'],
  deploymentOptions: ['Cloud', 'On-premise', 'Hybrid'],
  targetAudience: ['Developers', 'Data Scientists', 'Business Users'],
  competitorComparison: 'Comparison with other platforms',
  maturityLevel: 'stable',
  lastUpdated: '2024-01-15'
};

const mockPlatformMinimal: AgentPlatform = {
  id: 'minimal-platform',
  name: 'Minimal Platform',
  category: 'commercial-platform',
  type: 'commercial',
  description: 'A minimal platform for testing.',
  detailedDescription: 'Minimal detailed description.',
  strengths: [],
  weaknesses: [],
  primaryUseCases: [],
  keyFeatures: [],
  targetAudience: [],
  maturityLevel: 'experimental',
  lastUpdated: '2024-01-01'
};

describe('PlatformCard', () => {
  const mockOnViewDetails = jest.fn();

  beforeEach(() => {
    mockOnViewDetails.mockClear();
  });

  describe('Rendering', () => {
    it('renders platform information correctly', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      expect(screen.getByText('Test AI Platform')).toBeInTheDocument();
      expect(screen.getByText('A comprehensive test platform for AI development with advanced features.')).toBeInTheDocument();
      expect(screen.getByText('Open Source Framework')).toBeInTheDocument();
      expect(screen.getByText('Stable')).toBeInTheDocument();
    });

    it('renders key features correctly', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      expect(screen.getByText('Key Features:')).toBeInTheDocument();
      expect(screen.getByText('Multi-agent support')).toBeInTheDocument();
      expect(screen.getByText('Real-time processing')).toBeInTheDocument();
      expect(screen.getByText('Cloud integration')).toBeInTheDocument();
      expect(screen.getByText('+2 more features')).toBeInTheDocument();
    });

    it('renders strength indicators correctly', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      expect(screen.getByText('3 strengths')).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('renders external link icons when links are available', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      expect(screen.getByLabelText('Official website available')).toBeInTheDocument();
      expect(screen.getByLabelText('Documentation available')).toBeInTheDocument();
      expect(screen.getByLabelText('GitHub repository available')).toBeInTheDocument();
    });

    it('handles minimal platform data gracefully', () => {
      render(
        <PlatformCard 
          platform={mockPlatformMinimal} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      expect(screen.getByText('Minimal Platform')).toBeInTheDocument();
      expect(screen.getByText('Commercial Platform')).toBeInTheDocument();
      expect(screen.getByText('Experimental')).toBeInTheDocument();
      expect(screen.queryByText('Key Features:')).not.toBeInTheDocument();
      expect(screen.queryByText('strengths')).not.toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Category and Maturity Badges', () => {
    it('renders correct category badge for each category type', () => {
      const categories: Array<{ category: AgentPlatform['category'], label: string }> = [
        { category: 'open-source-framework', label: 'Open Source Framework' },
        { category: 'commercial-platform', label: 'Commercial Platform' },
        { category: 'enterprise-solution', label: 'Enterprise Solution' },
        { category: 'workflow-automation', label: 'Workflow Automation' },
        { category: 'multi-agent-system', label: 'Multi-Agent System' },
        { category: 'autonomous-agent', label: 'Autonomous Agent' }
      ];

      categories.forEach(({ category, label }) => {
        const testPlatform = { ...mockPlatform, category };
        const { rerender } = render(
          <PlatformCard 
            platform={testPlatform} 
            onViewDetails={mockOnViewDetails} 
          />
        );

        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByLabelText(`Category: ${label}`)).toBeInTheDocument();

        rerender(<div />); // Clear for next iteration
      });
    });

    it('renders correct maturity badge for each maturity level', () => {
      const maturityLevels: Array<{ level: AgentPlatform['maturityLevel'], label: string }> = [
        { level: 'experimental', label: 'Experimental' },
        { level: 'beta', label: 'Beta' },
        { level: 'stable', label: 'Stable' },
        { level: 'enterprise', label: 'Enterprise' }
      ];

      maturityLevels.forEach(({ level, label }) => {
        const testPlatform = { ...mockPlatform, maturityLevel: level };
        const { rerender } = render(
          <PlatformCard 
            platform={testPlatform} 
            onViewDetails={mockOnViewDetails} 
          />
        );

        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.getByLabelText(`Maturity level: ${label}`)).toBeInTheDocument();

        rerender(<div />); // Clear for next iteration
      });
    });
  });

  describe('Interactions', () => {
    it('calls onViewDetails when View Details button is clicked', async () => {
      
      
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      const viewDetailsButton = screen.getByRole('button', { name: /view detailed information about test ai platform/i });
      await userEvent.click(viewDetailsButton);

      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockPlatform);
    });

    it('calls onViewDetails when Enter key is pressed on View Details button', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      const viewDetailsButton = screen.getByRole('button', { name: /view detailed information about test ai platform/i });
      fireEvent.keyDown(viewDetailsButton, { key: 'Enter', code: 'Enter' });

      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockPlatform);
    });

    it('calls onViewDetails when Space key is pressed on View Details button', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      const viewDetailsButton = screen.getByRole('button', { name: /view detailed information about test ai platform/i });
      fireEvent.keyDown(viewDetailsButton, { key: ' ', code: 'Space' });

      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockPlatform);
    });

    it('does not call onViewDetails for other key presses', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      const viewDetailsButton = screen.getByRole('button', { name: /view detailed information about test ai platform/i });
      fireEvent.keyDown(viewDetailsButton, { key: 'Tab', code: 'Tab' });
      fireEvent.keyDown(viewDetailsButton, { key: 'Escape', code: 'Escape' });

      expect(mockOnViewDetails).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA labels and roles', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
          aria-setsize={10}
          aria-posinset={5}
        />
      );

      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('aria-setsize', '10');
      expect(card).toHaveAttribute('aria-posinset', '5');
      expect(card).toHaveAttribute('tabindex', '0');
      
      expect(screen.getByLabelText(/category:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/maturity level:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/external links available/i)).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveTextContent('Test AI Platform');
      expect(title).toHaveAttribute('id', 'platform-test-platform-1-title');
    });

    it('has proper button labeling', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      const button = screen.getByRole('button', { name: /view detailed information about test ai platform/i });
      expect(button).toHaveAttribute('aria-describedby', 'platform-test-platform-1-title');
      expect(button).toHaveAttribute('aria-label', 'View detailed information about Test AI Platform');
    });

    it('handles screen reader announcements for external links', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      expect(screen.getByTitle('Official website')).toBeInTheDocument();
      expect(screen.getByTitle('Documentation')).toBeInTheDocument();
      expect(screen.getByTitle('GitHub repository')).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('applies correct CSS classes for category', () => {
      const { container } = render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      expect(container.firstChild).toHaveClass('platform-card--open-source-framework');
    });

    it('applies correct CSS classes for maturity level', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      expect(screen.getByText('Stable')).toHaveClass('platform-card__maturity-badge--stable');
    });

    it('shows correct number of features with overflow indicator', () => {
      render(
        <PlatformCard 
          platform={mockPlatform} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      // Should show first 3 features plus overflow indicator
      expect(screen.getByText('Multi-agent support')).toBeInTheDocument();
      expect(screen.getByText('Real-time processing')).toBeInTheDocument();
      expect(screen.getByText('Cloud integration')).toBeInTheDocument();
      expect(screen.getByText('+2 more features')).toBeInTheDocument();
      
      // Should not show the 4th and 5th features directly
      expect(screen.queryByText('Advanced analytics')).not.toBeInTheDocument();
      expect(screen.queryByText('Custom workflows')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles platform with no external links', () => {
      const { officialWebsite, documentation, githubRepository, ...platformNoLinks } = mockPlatform;

      render(
        <PlatformCard 
          platform={platformNoLinks} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      expect(screen.queryByLabelText(/external links available/i)).not.toBeInTheDocument();
    });

    it('handles platform with single strength', () => {
      const platformSingleStrength = {
        ...mockPlatform,
        strengths: ['Only one strength']
      };

      render(
        <PlatformCard 
          platform={platformSingleStrength} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      expect(screen.getByText('1 strength')).toBeInTheDocument();
    });

    it('handles platform with no strengths', () => {
      const platformNoStrengths = {
        ...mockPlatform,
        strengths: []
      };

      render(
        <PlatformCard 
          platform={platformNoStrengths} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      expect(screen.queryByText(/strength/)).not.toBeInTheDocument();
    });

    it('handles platform with exactly 3 features', () => {
      const platformThreeFeatures = {
        ...mockPlatform,
        keyFeatures: ['Feature 1', 'Feature 2', 'Feature 3']
      };

      render(
        <PlatformCard 
          platform={platformThreeFeatures} 
          onViewDetails={mockOnViewDetails} 
        />
      );

      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
      expect(screen.getByText('Feature 3')).toBeInTheDocument();
      expect(screen.queryByText(/more features/)).not.toBeInTheDocument();
    });
  });
});

export {};