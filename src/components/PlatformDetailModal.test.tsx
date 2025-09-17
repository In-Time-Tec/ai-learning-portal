import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import PlatformDetailModal from './PlatformDetailModal';
import { AgentPlatform } from '../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock platform data for testing
const mockPlatform: AgentPlatform = {
  id: 'test-platform',
  name: 'Test Platform',
  category: 'open-source-framework',
  type: 'open-source',
  description: 'A test platform for unit testing',
  detailedDescription: 'This is a detailed description of the test platform used for comprehensive testing of the modal component.',
  strengths: ['Easy to use', 'Well documented', 'Active community'],
  weaknesses: ['Limited enterprise features', 'Steep learning curve'],
  primaryUseCases: ['Prototyping', 'Small to medium projects', 'Educational purposes'],
  keyFeatures: ['Feature 1', 'Feature 2', 'Feature 3'],
  officialWebsite: 'https://example.com',
  documentation: 'https://docs.example.com',
  githubRepository: 'https://github.com/example/test-platform',
  pricing: 'https://example.com/pricing',
  supportedLanguages: ['JavaScript', 'Python', 'TypeScript'],
  integrations: ['Integration 1', 'Integration 2'],
  deploymentOptions: ['Cloud', 'On-premise', 'Hybrid'],
  targetAudience: ['Developers', 'Data Scientists', 'Product Managers'],
  competitorComparison: 'Compared to competitors, this platform offers better documentation and community support.',
  maturityLevel: 'stable',
  lastUpdated: '2024-01-15'
};

const defaultProps = {
  platform: mockPlatform,
  isOpen: true,
  onClose: jest.fn()
};

// Helper function to render modal
const renderModal = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(<PlatformDetailModal {...mergedProps} />);
};

describe('PlatformDetailModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body overflow style
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = 'unset';
  });

  describe('Rendering and Basic Functionality', () => {
    it('renders modal when isOpen is true', () => {
      renderModal();
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Platform')).toBeInTheDocument();
      expect(screen.getByText('Open Source Framework')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      renderModal({ isOpen: false });
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('displays platform information correctly', () => {
      renderModal();
      
      expect(screen.getByText('Test Platform')).toBeInTheDocument();
      expect(screen.getByText('Open Source Framework')).toBeInTheDocument();
      expect(screen.getByText(mockPlatform.detailedDescription)).toBeInTheDocument();
    });

    it('renders all tab buttons', () => {
      renderModal();
      
      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Features' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Resources' })).toBeInTheDocument();
    });

    it('shows overview tab by default', () => {
      renderModal();
      
      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
      expect(overviewTab).toHaveClass('platform-modal__tab--active');
    });
  });

  describe('Tab Navigation', () => {
    it('switches to features tab when clicked', async () => {
      const user = userEvent.setup();
      renderModal();
      
      const featuresTab = screen.getByRole('tab', { name: 'Features' });
      
      await act(async () => {
        await user.click(featuresTab);
      });
      
      expect(featuresTab).toHaveAttribute('aria-selected', 'true');
      expect(featuresTab).toHaveClass('platform-modal__tab--active');
      
      // Check that features content is displayed
      expect(screen.getByText('Key Features')).toBeInTheDocument();
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
    });

    it('switches to resources tab when clicked', async () => {
      const user = userEvent.setup();
      renderModal();
      
      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      
      await act(async () => {
        await user.click(resourcesTab);
      });
      
      expect(resourcesTab).toHaveAttribute('aria-selected', 'true');
      expect(resourcesTab).toHaveClass('platform-modal__tab--active');
      
      // Check that resources content is displayed
      expect(screen.getByText('Official Resources')).toBeInTheDocument();
      expect(screen.getByText('Official Website:')).toBeInTheDocument();
    });

    it('displays correct content for each tab', async () => {
      const user = userEvent.setup();
      renderModal();
      
      // Overview tab content
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Strengths')).toBeInTheDocument();
      expect(screen.getByText('Easy to use')).toBeInTheDocument();
      
      // Switch to Features tab
      await act(async () => {
        await user.click(screen.getByRole('tab', { name: 'Features' }));
      });
      expect(screen.getByText('Supported Languages')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      
      // Switch to Resources tab
      await act(async () => {
        await user.click(screen.getByRole('tab', { name: 'Resources' }));
      });
      expect(screen.getByText('Platform Details')).toBeInTheDocument();
      expect(screen.getByText('Stable')).toBeInTheDocument();
    });
  });

  describe('Modal Closing', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      renderModal({ onClose });
      
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      await user.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', async () => {
      const onClose = jest.fn();
      renderModal({ onClose });
      
      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when modal content is clicked', async () => {
      const onClose = jest.fn();
      renderModal({ onClose });
      
      const modalContent = document.querySelector('.platform-modal__container');
      if (modalContent) {
        fireEvent.click(modalContent);
        expect(onClose).not.toHaveBeenCalled();
      }
    });

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      renderModal({ onClose });
      
      await user.keyboard('{Escape}');
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Management', () => {
    it('focuses close button when modal opens', async () => {
      const { rerender } = render(<PlatformDetailModal {...defaultProps} isOpen={false} />);
      
      rerender(<PlatformDetailModal {...defaultProps} isOpen={true} />);
      
      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: 'Close modal' });
        expect(closeButton).toHaveFocus();
      });
    });

    it('traps focus within modal', async () => {
      const user = userEvent.setup();
      renderModal();
      
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      const featuresTab = screen.getByRole('tab', { name: 'Features' });
      
      // Focus should start on close button
      await waitFor(() => expect(closeButton).toHaveFocus());
      
      // Tab should move to next focusable element
      await user.tab();
      expect(overviewTab).toHaveFocus();
      
      await user.tab();
      expect(featuresTab).toHaveFocus();
    });

    it('handles shift+tab navigation correctly', async () => {
      const user = userEvent.setup();
      renderModal();
      
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      
      // Focus the resources tab first
      resourcesTab.focus();
      expect(resourcesTab).toHaveFocus();
      
      // Shift+Tab should move to previous element
      await user.tab({ shift: true });
      expect(screen.getByRole('tab', { name: 'Features' })).toHaveFocus();
    });
  });

  describe('External Links', () => {
    it('renders external links with correct attributes', () => {
      renderModal();
      
      // Switch to resources tab to see links
      fireEvent.click(screen.getByRole('tab', { name: 'Resources' }));
      
      const websiteLink = screen.getByRole('link', { name: /visit test platform official website/i });
      expect(websiteLink).toHaveAttribute('href', 'https://example.com');
      expect(websiteLink).toHaveAttribute('target', '_blank');
      expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('displays external link icons', () => {
      renderModal();
      
      fireEvent.click(screen.getByRole('tab', { name: 'Resources' }));
      
      const externalIcons = document.querySelectorAll('.platform-modal__external-icon');
      expect(externalIcons.length).toBeGreaterThan(0);
      
      externalIcons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('handles missing optional links gracefully', () => {
      const { officialWebsite, documentation, githubRepository, pricing, ...platformBase } = mockPlatform;
      const platformWithoutLinks: AgentPlatform = platformBase;
      
      renderModal({ platform: platformWithoutLinks });
      
      fireEvent.click(screen.getByRole('tab', { name: 'Resources' }));
      
      // Should still render the resources tab without errors
      expect(screen.getByText('Official Resources')).toBeInTheDocument();
      expect(screen.getByText('Platform Details')).toBeInTheDocument();
    });
  });

  describe('Body Scroll Prevention', () => {
    it('prevents body scroll when modal is open', () => {
      renderModal();
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal is closed', () => {
      const { rerender } = renderModal();
      
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(<PlatformDetailModal {...defaultProps} isOpen={false} />);
      
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      renderModal();
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      
      const title = screen.getByRole('heading', { name: 'Test Platform' });
      expect(title).toHaveAttribute('id', 'modal-title');
    });

    it('has proper tab navigation attributes', () => {
      renderModal();
      
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
      expect(tablist).toHaveAttribute('aria-label', 'Platform information sections');
      
      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
      expect(overviewTab).toHaveAttribute('aria-controls', 'tabpanel-overview');
      expect(overviewTab).toHaveAttribute('tabindex', '0');
      
      const featuresTab = screen.getByRole('tab', { name: 'Features' });
      expect(featuresTab).toHaveAttribute('aria-selected', 'false');
      expect(featuresTab).toHaveAttribute('aria-controls', 'tabpanel-features');
      expect(featuresTab).toHaveAttribute('tabindex', '-1');
    });

    it('supports arrow key navigation between tabs', async () => {
      renderModal();
      
      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      const featuresTab = screen.getByRole('tab', { name: 'Features' });
      
      overviewTab.focus();
      expect(overviewTab).toHaveFocus();
      
      // Arrow right should move to next tab
      fireEvent.keyDown(overviewTab, { key: 'ArrowRight', code: 'ArrowRight' });
      
      await waitFor(() => {
        expect(featuresTab).toHaveFocus();
        expect(featuresTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('wraps arrow key navigation at tab boundaries', async () => {
      renderModal();
      
      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      
      overviewTab.focus();
      
      // Arrow left from first tab should wrap to last tab
      fireEvent.keyDown(overviewTab, { key: 'ArrowLeft', code: 'ArrowLeft' });
      
      await waitFor(() => {
        expect(resourcesTab).toHaveFocus();
        expect(resourcesTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should not have accessibility violations', async () => {
      const { container } = renderModal();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper labels for external links', () => {
      renderModal();
      
      fireEvent.click(screen.getByRole('tab', { name: 'Resources' }));
      
      const websiteLink = screen.getByRole('link', { name: /visit test platform official website/i });
      expect(websiteLink).toBeInTheDocument();
      
      const docsLink = screen.getByRole('link', { name: /view test platform documentation/i });
      expect(docsLink).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('displays strengths and weaknesses correctly', () => {
      renderModal();
      
      expect(screen.getByText('Strengths')).toBeInTheDocument();
      expect(screen.getByText('Easy to use')).toBeInTheDocument();
      expect(screen.getByText('Well documented')).toBeInTheDocument();
      
      expect(screen.getByText('Weaknesses')).toBeInTheDocument();
      expect(screen.getByText('Limited enterprise features')).toBeInTheDocument();
    });

    it('displays use cases and target audience', () => {
      renderModal();
      
      expect(screen.getByText('Primary Use Cases')).toBeInTheDocument();
      expect(screen.getByText('Prototyping')).toBeInTheDocument();
      
      expect(screen.getByText('Target Audience')).toBeInTheDocument();
      expect(screen.getByText('Developers')).toBeInTheDocument();
    });

    it('displays technical details in features tab', async () => {
      const user = userEvent.setup();
      renderModal();
      
      await act(async () => {
        await user.click(screen.getByRole('tab', { name: 'Features' }));
      });
      
      expect(screen.getByText('Supported Languages')).toBeInTheDocument();
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
      
      expect(screen.getByText('Integrations')).toBeInTheDocument();
      expect(screen.getByText('Integration 1')).toBeInTheDocument();
    });

    it('displays metadata in resources tab', async () => {
      const user = userEvent.setup();
      renderModal();
      
      await act(async () => {
        await user.click(screen.getByRole('tab', { name: 'Resources' }));
      });
      
      expect(screen.getByText('Type:')).toBeInTheDocument();
      expect(screen.getByText('Open-source')).toBeInTheDocument();
      
      expect(screen.getByText('Maturity Level:')).toBeInTheDocument();
      expect(screen.getByText('Stable')).toBeInTheDocument();
      
      expect(screen.getByText('Last Updated:')).toBeInTheDocument();
      expect(screen.getByText('2024-01-15')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('handles missing optional fields gracefully', () => {
      const { supportedLanguages, integrations, deploymentOptions, competitorComparison, ...platformBase } = mockPlatform;
      const minimalPlatform: AgentPlatform = platformBase;
      
      renderModal({ platform: minimalPlatform });
      
      // Should render without errors
      expect(screen.getByText('Test Platform')).toBeInTheDocument();
      
      // Switch to features tab - should not show optional sections
      fireEvent.click(screen.getByRole('tab', { name: 'Features' }));
      expect(screen.queryByText('Supported Languages')).not.toBeInTheDocument();
      expect(screen.queryByText('Integrations')).not.toBeInTheDocument();
    });
  });
});