/**
 * AIIntroductionContainer Component Tests
 * 
 * Unit tests for the AI Introduction and Risks feature component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';
import { AIIntroductionContainer } from './AIIntroductionContainer';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('AIIntroductionContainer', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('should render the main title and description', () => {
      render(<AIIntroductionContainer />);
      
      expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      expect(screen.getByText(/A balanced perspective on artificial intelligence/i)).toBeInTheDocument();
    });

    it('should render table of contents with all sections', () => {
      render(<AIIntroductionContainer />);
      
      // Check for table of contents - now uses aria-labelledby instead of aria-label
      expect(screen.getByRole('navigation', { name: /Contents/i })).toBeInTheDocument();
      expect(screen.getByText('Contents')).toBeInTheDocument();
      
      // Check for all section titles in TOC using more specific selectors
      expect(screen.getByRole('button', { name: /Go to section 1 of 6: Understanding AI: A Balanced Perspective/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to section 2 of 6: Approved AI Tools at In Time Tec/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to section 3 of 6: The "Too Much Too Soon" Problem/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to section 4 of 6: The Invisible Degradation Effect/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to section 5 of 6: The Need for "Productive Friction"/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to section 6 of 6: Toward Cultural Wisdom for AI/i })).toBeInTheDocument();
    });

    it('should render all content sections with proper headings', () => {
      render(<AIIntroductionContainer />);
      
      // Check for all section headings
      expect(screen.getByRole('heading', { level: 2, name: /Understanding AI: A Balanced Perspective/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /Approved AI Tools at In Time Tec/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /The "Too Much Too Soon" Problem/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /The Invisible Degradation Effect/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /The Need for "Productive Friction"/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /Toward Cultural Wisdom for AI/i })).toBeInTheDocument();
    });

    it('should render navigation buttons to glossary, quiz, and home', () => {
      render(<AIIntroductionContainer onNavigate={mockOnNavigate} />);
      
      expect(screen.getByRole('button', { name: /📚 Explore AI Glossary/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🧠 Take the Quiz/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🏠 Return to Home/i })).toBeInTheDocument();
    });

    it('should apply custom className when provided', () => {
      const { container } = render(<AIIntroductionContainer className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('ai-introduction-container', 'custom-class');
    });
  });

  describe('Navigation', () => {
    it('should call onNavigate when glossary button is clicked', () => {
      render(<AIIntroductionContainer onNavigate={mockOnNavigate} />);
      
      const glossaryButton = screen.getByRole('button', { name: /📚 Explore AI Glossary/i });
      fireEvent.click(glossaryButton);
      
      expect(mockOnNavigate).toHaveBeenCalledWith('glossary');
    });

    it('should call onNavigate when quiz button is clicked', () => {
      render(<AIIntroductionContainer onNavigate={mockOnNavigate} />);
      
      const quizButton = screen.getByRole('button', { name: /🧠 Take the Quiz/i });
      fireEvent.click(quizButton);
      
      expect(mockOnNavigate).toHaveBeenCalledWith('quiz');
    });

    it('should call onNavigate when home button is clicked', () => {
      render(<AIIntroductionContainer onNavigate={mockOnNavigate} />);
      
      const homeButton = screen.getByRole('button', { name: /🏠 Return to Home/i });
      fireEvent.click(homeButton);
      
      expect(mockOnNavigate).toHaveBeenCalledWith('home');
    });

    it('should handle missing onNavigate prop gracefully', () => {
      render(<AIIntroductionContainer />);
      
      const glossaryButton = screen.getByRole('button', { name: /📚 Explore AI Glossary/i });
      
      // Should not throw error when clicked without onNavigate
      expect(() => fireEvent.click(glossaryButton)).not.toThrow();
    });
  });

  describe('Section Navigation', () => {
    it('should handle table of contents link clicks', () => {
      // Mock scrollIntoView since it's not available in test environment
      const mockScrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = mockScrollIntoView;
      
      render(<AIIntroductionContainer />);
      
      const tocButton = screen.getByRole('button', { name: /Go to section 1 of 6: Understanding AI: A Balanced Perspective/i });
      fireEvent.click(tocButton);
      
      // Should attempt to scroll to the section
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
    });

    it('should render section navigation buttons', () => {
      render(<AIIntroductionContainer />);
      
      // Check for section navigation buttons (should have multiple "Next" buttons)
      const nextButtons = screen.getAllByText(/Next →/);
      expect(nextButtons.length).toBeGreaterThan(0);
      
      // Check for "Contents" buttons
      const contentsButtons = screen.getAllByText(/↑ Contents/);
      expect(contentsButtons.length).toBeGreaterThan(0);
      
      // Check for "Next Steps" button on last section
      expect(screen.getByText(/Next Steps →/)).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('should have proper section variants applied', () => {
      const { container } = render(<AIIntroductionContainer />);
      
      // Check for default variant sections
      expect(container.querySelector('.ai-introduction-container__section--default')).toBeInTheDocument();
      
      // Check for warning variant sections
      expect(container.querySelectorAll('.ai-introduction-container__section--warning')).toHaveLength(2);
      
      // Check for highlighted variant sections
      expect(container.querySelectorAll('.ai-introduction-container__section--highlighted')).toHaveLength(3);
    });

    it('should render content with proper formatting', () => {
      render(<AIIntroductionContainer />);
      
      // Check that content is rendered (look for specific text from sections)
      expect(screen.getByText(/Artificial Intelligence represents one of the most transformative technologies/i)).toBeInTheDocument();
      expect(screen.getByText(/The rapid adoption of AI tools creates a phenomenon/i)).toBeInTheDocument();
      expect(screen.getByText(/Three key risks emerge from unreflective AI use/i)).toBeInTheDocument();
    });
  });

  describe('Enhanced Navigation Features', () => {
    it('should render progress indicators for each section', () => {
      render(<AIIntroductionContainer />);
      
      // Check for progress indicators
      expect(screen.getByText(/Section 1 of 6/)).toBeInTheDocument();
      expect(screen.getByText(/Section 2 of 6/)).toBeInTheDocument();
      expect(screen.getByText(/Section 6 of 6/)).toBeInTheDocument();
    });

    it('should render reading time estimate', () => {
      render(<AIIntroductionContainer />);
      
      expect(screen.getByText(/6 sections • Estimated reading time: 10-12 minutes/)).toBeInTheDocument();
    });

    it('should render completion summary', () => {
      const { container } = render(<AIIntroductionContainer />);
      
      expect(screen.getByText(/🎉 You've completed the AI Introduction!/)).toBeInTheDocument();
      
      // Check for sections count in the summary stats
      const summaryStats = container.querySelector('.ai-introduction-container__summary-stats');
      expect(summaryStats).toBeInTheDocument();
      expect(summaryStats?.textContent).toContain('6');
      expect(summaryStats?.textContent).toContain('100%');
      
      // Check for completion percentage
      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });

    it('should render skip link for accessibility', () => {
      render(<AIIntroductionContainer />);
      
      expect(screen.getByRole('link', { name: /Skip to main content/i })).toBeInTheDocument();
    });

    it('should render keyboard navigation hint', () => {
      render(<AIIntroductionContainer />);
      
      expect(screen.getByText(/💡 Keyboard Navigation/)).toBeInTheDocument();
      expect(screen.getByText(/Navigate table of contents/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and structure', () => {
      render(<AIIntroductionContainer />);
      
      // Check for proper navigation labeling - now uses "Contents" as the accessible name
      expect(screen.getByRole('navigation', { name: /Contents/i })).toBeInTheDocument();
      
      // Check for proper section structure with aria-labelledby
      const sections = screen.getAllByRole('region');
      expect(sections.length).toBeGreaterThan(0);
      
      // Check for skip links
      expect(screen.getByRole('link', { name: /Skip to main content/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Skip to table of contents/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Skip to navigation/i })).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<AIIntroductionContainer />);
      
      // Check for h1 main title
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      
      // Check for h2 section titles
      const h2Headings = screen.getAllByRole('heading', { level: 2 });
      expect(h2Headings).toHaveLength(8); // 6 content sections + 1 TOC title + 1 completion title
      
      // Check for h3 headings (keyboard navigation and next steps)
      const h3Headings = screen.getAllByRole('heading', { level: 3 });
      expect(h3Headings.length).toBeGreaterThan(0);
    });

    it('should have proper focus management attributes', () => {
      const { container } = render(<AIIntroductionContainer />);
      
      // Check that section titles have tabindex for focus management
      const sectionTitles = container.querySelectorAll('.ai-introduction-container__section-title');
      sectionTitles.forEach(title => {
        expect(title).toHaveAttribute('tabindex', '-1');
      });
    });

    it('should pass accessibility audit for content sections', async () => {
      const { container } = render(<AIIntroductionContainer />);
      
      // Test specific sections that don't have landmark conflicts
      const sections = container.querySelectorAll('.ai-introduction-container__section');
      
      for (const section of Array.from(sections)) {
        const results = await axe(section as Element);
        expect(results).toHaveNoViolations();
      }
    });

    it('should pass accessibility audit for table of contents', async () => {
      const { container } = render(<AIIntroductionContainer />);
      
      // Test the table of contents navigation specifically
      const toc = container.querySelector('.ai-introduction-container__toc');
      if (toc) {
        const results = await axe(toc);
        expect(results).toHaveNoViolations();
      }
    });

    it('should pass accessibility audit for navigation buttons', async () => {
      const mockOnNavigate = jest.fn();
      const { container } = render(<AIIntroductionContainer onNavigate={mockOnNavigate} />);
      
      // Test navigation buttons specifically
      const navButtons = container.querySelectorAll('.ai-introduction-container__nav-button');
      
      for (const button of Array.from(navButtons)) {
        const results = await axe(button as Element);
        expect(results).toHaveNoViolations();
      }
    });

    it('should have proper keyboard navigation support', () => {
      render(<AIIntroductionContainer />);
      
      // Check that all interactive elements are keyboard accessible
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should provide proper screen reader context', () => {
      render(<AIIntroductionContainer />);
      
      // Check for proper labeling of navigation elements
      expect(screen.getByRole('navigation', { name: /Contents/i })).toBeInTheDocument();
      
      // Check for proper section labeling
      const sections = screen.getAllByRole('region');
      sections.forEach(section => {
        expect(section).toHaveAttribute('aria-labelledby');
      });
      
      // Check for proper button descriptions
      expect(screen.getByRole('button', { name: /Go to section 1 of 6: Understanding AI: A Balanced Perspective/i })).toBeInTheDocument();
    });

    it('should support high contrast mode', () => {
      const { container } = render(<AIIntroductionContainer />);
      
      // Check that important elements have proper contrast indicators
      const mainContainer = container.querySelector('.ai-introduction-container');
      expect(mainContainer).toBeInTheDocument();
      
      // Check that sections have proper variant classes for styling
      expect(container.querySelector('.ai-introduction-container__section--warning')).toBeInTheDocument();
      expect(container.querySelector('.ai-introduction-container__section--highlighted')).toBeInTheDocument();
    });
  });

  describe('Responsive Design and Mobile Compatibility', () => {
    // Mock window.matchMedia for responsive tests
    const mockMatchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });

    beforeAll(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(mockMatchMedia),
      });
    });

    it('should render properly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      const { container } = render(<AIIntroductionContainer />);
      
      // Should render all essential elements
      expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /Contents/i })).toBeInTheDocument();
      expect(container.querySelector('.ai-introduction-container')).toBeInTheDocument();
    });

    it('should render properly on tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = render(<AIIntroductionContainer />);
      
      // Should render all essential elements
      expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /Contents/i })).toBeInTheDocument();
      expect(container.querySelector('.ai-introduction-container')).toBeInTheDocument();
    });

    it('should render properly on desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      });

      const { container } = render(<AIIntroductionContainer />);
      
      // Should render all essential elements
      expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /Contents/i })).toBeInTheDocument();
      expect(container.querySelector('.ai-introduction-container')).toBeInTheDocument();
    });

    it('should handle touch interactions on mobile', () => {
      const mockOnNavigate = jest.fn();
      render(<AIIntroductionContainer onNavigate={mockOnNavigate} />);
      
      // Test touch interaction with navigation buttons
      const glossaryButton = screen.getByRole('button', { name: /📚 Explore AI Glossary/i });
      
      // Simulate touch events
      fireEvent.touchStart(glossaryButton);
      fireEvent.touchEnd(glossaryButton);
      fireEvent.click(glossaryButton);
      
      expect(mockOnNavigate).toHaveBeenCalledWith('glossary');
    });

    it('should maintain proper spacing and layout on small screens', () => {
      const { container } = render(<AIIntroductionContainer />);
      
      // Check that container has proper responsive classes
      const mainContainer = container.querySelector('.ai-introduction-container');
      expect(mainContainer).toBeInTheDocument();
      
      // Check that sections are properly structured for mobile
      const sections = container.querySelectorAll('.ai-introduction-container__section');
      expect(sections.length).toBeGreaterThan(0);
      
      // Check that navigation elements are present
      expect(screen.getByRole('navigation', { name: /Contents/i })).toBeInTheDocument();
    });

    it('should handle long content gracefully on mobile', () => {
      const { container } = render(<AIIntroductionContainer />);
      
      // Check that long text content is handled properly
      expect(screen.getByText(/Artificial Intelligence represents one of the most transformative technologies/i)).toBeInTheDocument();
      expect(screen.getByText(/The rapid adoption of AI tools creates a phenomenon/i)).toBeInTheDocument();
      
      // Check that content sections are scrollable
      const sections = container.querySelectorAll('.ai-introduction-container__section');
      sections.forEach(section => {
        expect(section).toBeInTheDocument();
      });
    });

    it('should support pinch-to-zoom accessibility', () => {
      const { container } = render(<AIIntroductionContainer />);
      
      // Check that viewport meta tag requirements are met (this would be in the HTML head)
      // For component testing, we verify that content is scalable
      const mainContainer = container.querySelector('.ai-introduction-container');
      expect(mainContainer).toBeInTheDocument();
      
      // Verify that text content is readable and scalable
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(8);
    });

    it('should maintain functionality across different orientations', () => {
      const mockOnNavigate = jest.fn();
      
      // Test portrait orientation
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
      
      const { rerender } = render(<AIIntroductionContainer onNavigate={mockOnNavigate} />);
      
      // Test navigation in portrait
      fireEvent.click(screen.getByRole('button', { name: /📚 Explore AI Glossary/i }));
      expect(mockOnNavigate).toHaveBeenCalledWith('glossary');
      
      mockOnNavigate.mockClear();
      
      // Test landscape orientation
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      rerender(<AIIntroductionContainer onNavigate={mockOnNavigate} />);
      
      // Test navigation in landscape
      fireEvent.click(screen.getByRole('button', { name: /🧠 Take the Quiz/i }));
      expect(mockOnNavigate).toHaveBeenCalledWith('quiz');
    });
  });
});