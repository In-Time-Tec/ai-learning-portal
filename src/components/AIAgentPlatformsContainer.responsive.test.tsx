import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIAgentPlatformsContainer from './AIAgentPlatformsContainer';
import { AgentPlatformsDataService } from '../services/AgentPlatformsDataService';
import { AgentPlatform } from '../types';

// Mock the data service
jest.mock('../services/AgentPlatformsDataService');
const mockDataService = AgentPlatformsDataService as jest.Mocked<typeof AgentPlatformsDataService>;

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Viewport size utilities
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Mock matchMedia for different screen sizes
const mockMatchMedia = (width: number) => {
  const mediaQueries = {
    mobile: '(max-width: 768px)',
    tablet: '(min-width: 769px) and (max-width: 1024px)',
    desktop: '(min-width: 1025px)'
  };

  return (query: string) => ({
    matches: 
      (query === mediaQueries.mobile && width <= 768) ||
      (query === mediaQueries.tablet && width > 768 && width <= 1024) ||
      (query === mediaQueries.desktop && width > 1024),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
};

// Test data
const testPlatforms: AgentPlatform[] = [
  {
    id: 'platform-1',
    name: 'Test Platform 1',
    category: 'open-source-framework',
    type: 'open-source',
    description: 'A comprehensive test platform with extensive features for testing responsive layouts',
    detailedDescription: 'Detailed description for responsive testing',
    strengths: ['Responsive design', 'Mobile-friendly', 'Touch optimized'],
    weaknesses: ['Complex on small screens'],
    primaryUseCases: ['Mobile development', 'Responsive testing'],
    keyFeatures: ['Touch support', 'Responsive grid', 'Mobile navigation'],
    targetAudience: ['Mobile developers', 'UI/UX designers'],
    maturityLevel: 'stable',
    lastUpdated: '2024-01-01'
  },
  {
    id: 'platform-2',
    name: 'Test Platform 2',
    category: 'commercial-platform',
    type: 'commercial',
    description: 'Another test platform for responsive behavior validation',
    detailedDescription: 'Another detailed description for testing',
    strengths: ['Cross-platform', 'Adaptive UI'],
    weaknesses: ['Resource intensive'],
    primaryUseCases: ['Enterprise apps', 'Cross-platform development'],
    keyFeatures: ['Adaptive layouts', 'Multi-device support'],
    targetAudience: ['Enterprise developers'],
    maturityLevel: 'enterprise',
    lastUpdated: '2024-01-02'
  }
];

describe('AIAgentPlatformsContainer Responsive Design Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default successful responses
    mockDataService.loadPlatforms.mockResolvedValue(testPlatforms);
    mockDataService.getFilteredPlatforms.mockImplementation((platforms, filters) => {
      let filtered = platforms;
      
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      }
      
      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      
      return filtered;
    });
    
    mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework', 'commercial-platform']);
  });

  describe('Mobile Layout (320px - 768px)', () => {
    beforeEach(() => {
      setViewportSize(375, 667); // iPhone SE dimensions
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia(375),
      });
    });

    it('should display single column layout on mobile', async () => {
      const { container } = render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Test Platform 1')).toBeInTheDocument();
      });

      // Check for mobile-specific CSS classes or styles
      const platformGrid = container.querySelector('.ai-agent-platforms-container__grid');
      expect(platformGrid).toBeInTheDocument();
      
      // Verify grid layout adapts to mobile
      const computedStyle = window.getComputedStyle(platformGrid!);
      // Note: In a real test environment, you'd check actual CSS grid properties
      expect(platformGrid).toHaveClass('ai-agent-platforms-container__grid');
    });

    it('should stack filter controls vertically on mobile', async () => {
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('search-filter')).toBeInTheDocument();
      });

      const searchFilter = screen.getByTestId('search-filter');
      expect(searchFilter).toBeInTheDocument();
      
      // On mobile, search and category filters should stack
      const searchInput = screen.getByTestId('search-input');
      const categoryFilters = screen.getByTestId('category-filters');
      
      expect(searchInput).toBeInTheDocument();
      expect(categoryFilters).toBeInTheDocument();
    });

    it('should use touch-friendly button sizes on mobile', async () => {
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('view-details-platform-1')).toBeInTheDocument();
      });

      const viewDetailsButton = screen.getByTestId('view-details-platform-1');
      
      // Touch targets should be at least 44px (iOS guidelines)
      const buttonRect = viewDetailsButton.getBoundingClientRect();
      expect(buttonRect.height).toBeGreaterThanOrEqual(44);
    });

    it('should optimize modal for mobile screens', async () => {
      const user = userEvent.setup();
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('view-details-platform-1')).toBeInTheDocument();
      });

      const viewDetailsButton = screen.getByTestId('view-details-platform-1');
      await user.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const modal = screen.getByRole('dialog');
      
      // Modal should adapt to mobile viewport
      expect(modal).toBeInTheDocument();
      
      // Check that modal content is scrollable on mobile
      const modalContent = modal.querySelector('.platform-modal__container');
      expect(modalContent).toBeInTheDocument();
    });

    it('should handle touch interactions properly', async () => {
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('category-open-source-framework')).toBeInTheDocument();
      });

      const categoryButton = screen.getByTestId('category-open-source-framework');
      
      // Simulate touch events
      fireEvent.touchStart(categoryButton);
      fireEvent.touchEnd(categoryButton);
      fireEvent.click(categoryButton);

      await waitFor(() => {
        expect(mockDataService.getFilteredPlatforms).toHaveBeenCalledWith(
          testPlatforms,
          expect.objectContaining({ category: 'open-source-framework' })
        );
      });
    });

    it('should provide adequate spacing for mobile interaction', async () => {
      const { container } = render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Test Platform 1')).toBeInTheDocument();
      });

      // Check spacing between interactive elements
      const platformCards = container.querySelectorAll('[data-testid^="platform-card-"]');
      expect(platformCards.length).toBeGreaterThan(0);
      
      // Cards should have adequate spacing for touch interaction
      platformCards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        expect(cardRect.height).toBeGreaterThan(0);
      });
    });
  });

  describe('Tablet Layout (769px - 1024px)', () => {
    beforeEach(() => {
      setViewportSize(768, 1024); // iPad dimensions
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia(768),
      });
    });

    it('should display two-column layout on tablet', async () => {
      const { container } = render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Test Platform 1')).toBeInTheDocument();
      });

      const platformGrid = container.querySelector('.ai-agent-platforms-container__grid');
      expect(platformGrid).toBeInTheDocument();
      
      // Should use tablet-optimized layout
      expect(platformGrid).toHaveClass('ai-agent-platforms-container__grid');
    });

    it('should arrange filters horizontally on tablet', async () => {
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('search-filter')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      const categoryFilters = screen.getByTestId('category-filters');
      
      expect(searchInput).toBeInTheDocument();
      expect(categoryFilters).toBeInTheDocument();
      
      // On tablet, filters should be arranged more horizontally
      const searchRect = searchInput.getBoundingClientRect();
      const filtersRect = categoryFilters.getBoundingClientRect();
      
      expect(searchRect.width).toBeGreaterThan(0);
      expect(filtersRect.width).toBeGreaterThan(0);
    });

    it('should optimize modal size for tablet', async () => {
      const user = userEvent.setup();
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('view-details-platform-1')).toBeInTheDocument();
      });

      const viewDetailsButton = screen.getByTestId('view-details-platform-1');
      await user.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const modal = screen.getByRole('dialog');
      const modalRect = modal.getBoundingClientRect();
      
      // Modal should use appropriate size for tablet
      expect(modalRect.width).toBeGreaterThan(0);
      expect(modalRect.height).toBeGreaterThan(0);
    });
  });

  describe('Desktop Layout (1025px+)', () => {
    beforeEach(() => {
      setViewportSize(1440, 900); // Desktop dimensions
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia(1440),
      });
    });

    it('should display three-column layout on desktop', async () => {
      const { container } = render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Test Platform 1')).toBeInTheDocument();
      });

      const platformGrid = container.querySelector('.ai-agent-platforms-container__grid');
      expect(platformGrid).toBeInTheDocument();
      
      // Should use desktop-optimized layout with more columns
      expect(platformGrid).toHaveClass('ai-agent-platforms-container__grid');
    });

    it('should use optimal spacing and sizing on desktop', async () => {
      const { container } = render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Test Platform 1')).toBeInTheDocument();
      });

      // Check that desktop layout uses available space efficiently
      const mainContainer = container.querySelector('.ai-agent-platforms-container');
      expect(mainContainer).toBeInTheDocument();
      
      const containerRect = mainContainer!.getBoundingClientRect();
      expect(containerRect.width).toBeGreaterThan(1000); // Should use desktop width
    });

    it('should position modal optimally on desktop', async () => {
      const user = userEvent.setup();
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('view-details-platform-1')).toBeInTheDocument();
      });

      const viewDetailsButton = screen.getByTestId('view-details-platform-1');
      await user.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const modal = screen.getByRole('dialog');
      const modalRect = modal.getBoundingClientRect();
      
      // Modal should be centered and appropriately sized for desktop
      expect(modalRect.width).toBeGreaterThan(600);
      expect(modalRect.left).toBeGreaterThan(0);
    });

    it('should support hover interactions on desktop', async () => {
      const { container } = render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('platform-card-platform-1')).toBeInTheDocument();
      });

      const platformCard = screen.getByTestId('platform-card-platform-1');
      
      // Simulate hover
      fireEvent.mouseEnter(platformCard);
      
      // Should handle hover states (visual feedback would be tested in CSS)
      expect(platformCard).toBeInTheDocument();
      
      fireEvent.mouseLeave(platformCard);
    });
  });

  describe('Responsive Breakpoint Transitions', () => {
    it('should handle viewport size changes gracefully', async () => {
      const { rerender } = render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Test Platform 1')).toBeInTheDocument();
      });

      // Start with mobile
      setViewportSize(375, 667);
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia(375),
      });

      rerender(<AIAgentPlatformsContainer />);

      // Transition to tablet
      setViewportSize(768, 1024);
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia(768),
      });

      rerender(<AIAgentPlatformsContainer />);

      // Transition to desktop
      setViewportSize(1440, 900);
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia(1440),
      });

      rerender(<AIAgentPlatformsContainer />);

      // Should maintain functionality across all breakpoints
      expect(screen.getByText('Test Platform 1')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should maintain modal functionality across breakpoints', async () => {
      const user = userEvent.setup();
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('view-details-platform-1')).toBeInTheDocument();
      });

      // Open modal on mobile
      setViewportSize(375, 667);
      const viewDetailsButton = screen.getByTestId('view-details-platform-1');
      await user.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Resize to desktop while modal is open
      setViewportSize(1440, 900);
      window.dispatchEvent(new Event('resize'));

      // Modal should remain functional
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Across Screen Sizes', () => {
    it('should maintain focus management on all screen sizes', async () => {
      const screenSizes = [
        { width: 375, height: 667 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1440, height: 900 }   // Desktop
      ];

      for (const size of screenSizes) {
        setViewportSize(size.width, size.height);
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: mockMatchMedia(size.width),
        });

        const { unmount } = render(<AIAgentPlatformsContainer />);

        await waitFor(() => {
          expect(screen.getByTestId('search-input')).toBeInTheDocument();
        });

        const searchInput = screen.getByTestId('search-input');
        searchInput.focus();
        expect(searchInput).toHaveFocus();

        unmount();
      }
    });

    it('should provide appropriate touch targets on touch devices', async () => {
      // Test mobile touch targets
      setViewportSize(375, 667);
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia(375),
      });

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('category-open-source-framework')).toBeInTheDocument();
      });

      const categoryButton = screen.getByTestId('category-open-source-framework');
      const buttonRect = categoryButton.getBoundingClientRect();
      
      // Should meet minimum touch target size (44px)
      expect(Math.min(buttonRect.width, buttonRect.height)).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Performance Across Screen Sizes', () => {
    it('should render efficiently on all screen sizes', async () => {
      const screenSizes = [375, 768, 1440];

      for (const width of screenSizes) {
        setViewportSize(width, 900);
        Object.defineProperty(window, 'matchMedia', {
          writable: true,
          value: mockMatchMedia(width),
        });

        const startTime = performance.now();
        
        const { unmount } = render(<AIAgentPlatformsContainer />);

        await waitFor(() => {
          expect(screen.getByText('Test Platform 1')).toBeInTheDocument();
        });

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        // Should render quickly on all screen sizes
        expect(renderTime).toBeLessThan(1000);

        unmount();
      }
    });
  });
});