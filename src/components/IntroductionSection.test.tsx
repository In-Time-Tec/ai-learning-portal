/**
 * IntroductionSection Component Tests
 * 
 * Comprehensive unit tests for IntroductionSection component rendering,
 * props handling, accessibility, and variant styling.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import IntroductionSection, { IntroductionSectionProps } from './IntroductionSection';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

/**
 * Helper function to render IntroductionSection with default props
 */
const renderIntroductionSection = (props: Partial<IntroductionSectionProps> = {}) => {
  const defaultProps: IntroductionSectionProps = {
    id: 'test-section',
    title: 'Test Section Title',
    children: <p>Test section content</p>
  };

  return render(<IntroductionSection {...defaultProps} {...props} />);
};

describe('IntroductionSection Component', () => {
  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      renderIntroductionSection();
      
      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Test Section Title' })).toBeInTheDocument();
      expect(screen.getByText('Test section content')).toBeInTheDocument();
    });

    it('renders with subtitle when provided', () => {
      renderIntroductionSection({
        subtitle: 'Test subtitle'
      });
      
      expect(screen.getByRole('heading', { level: 2, name: 'Test Section Title' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Test subtitle' })).toBeInTheDocument();
    });

    it('renders without subtitle when not provided', () => {
      renderIntroductionSection();
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    });

    it('renders children content correctly', () => {
      const complexContent = (
        <div>
          <p>First paragraph</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
          <strong>Bold text</strong>
        </div>
      );

      renderIntroductionSection({
        children: complexContent
      });
      
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('applies custom id correctly', () => {
      renderIntroductionSection({
        id: 'custom-section-id'
      });
      
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('id', 'custom-section-id');
    });

    it('applies custom className', () => {
      renderIntroductionSection({
        className: 'custom-class'
      });
      
      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    it('applies default variant class when variant not specified', () => {
      renderIntroductionSection();
      
      const section = screen.getByRole('region');
      expect(section).toHaveClass('introduction-section--default');
    });

    it('applies highlighted variant class', () => {
      renderIntroductionSection({
        variant: 'highlighted'
      });
      
      const section = screen.getByRole('region');
      expect(section).toHaveClass('introduction-section--highlighted');
    });

    it('applies warning variant class', () => {
      renderIntroductionSection({
        variant: 'warning'
      });
      
      const section = screen.getByRole('region');
      expect(section).toHaveClass('introduction-section--warning');
    });

    it('combines custom className with variant class', () => {
      renderIntroductionSection({
        className: 'custom-class',
        variant: 'highlighted'
      });
      
      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
      expect(section).toHaveClass('introduction-section--highlighted');
    });
  });

  describe('Semantic HTML Structure', () => {
    it('uses section element with proper role', () => {
      renderIntroductionSection();
      
      const section = screen.getByRole('region');
      expect(section.tagName).toBe('SECTION');
    });

    it('uses h2 for main title', () => {
      renderIntroductionSection({
        title: 'Main Section Title'
      });
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading.tagName).toBe('H2');
      expect(heading).toHaveTextContent('Main Section Title');
    });

    it('uses h3 for subtitle', () => {
      renderIntroductionSection({
        subtitle: 'Section Subtitle'
      });
      
      const subtitle = screen.getByRole('heading', { level: 3 });
      expect(subtitle.tagName).toBe('H3');
      expect(subtitle).toHaveTextContent('Section Subtitle');
    });

    it('maintains proper heading hierarchy', () => {
      renderIntroductionSection({
        title: 'Main Title',
        subtitle: 'Subtitle'
      });
      
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(2);
      
      // Check that first heading is h2 and second is h3
      expect(headings[0]?.tagName).toBe('H2');
      expect(headings[1]?.tagName).toBe('H3');
      
      // Check heading levels using getByRole with level option
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Main Title');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Subtitle');
    });
  });

  describe('Accessibility Features', () => {
    it('has proper aria-labelledby attribute', () => {
      renderIntroductionSection({
        id: 'test-section'
      });
      
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'test-section-title');
    });

    it('title has correct id for aria-labelledby reference', () => {
      renderIntroductionSection({
        id: 'test-section'
      });
      
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveAttribute('id', 'test-section-title');
    });

    it('passes accessibility audit', async () => {
      const { container } = renderIntroductionSection({
        id: 'accessible-section',
        title: 'Accessible Title',
        subtitle: 'Accessible Subtitle',
        children: (
          <div>
            <p>Accessible content with proper structure.</p>
            <ul>
              <li>Accessible list item</li>
            </ul>
          </div>
        )
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes accessibility audit with all variants', async () => {
      const variants: Array<'default' | 'highlighted' | 'warning'> = ['default', 'highlighted', 'warning'];
      
      for (const variant of variants) {
        const { container } = render(
          <IntroductionSection
            id={`section-${variant}`}
            title={`${variant} Section`}
            subtitle={`${variant} subtitle`}
            variant={variant}
          >
            <p>Content for {variant} section</p>
          </IntroductionSection>
        );
        
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('CSS Classes', () => {
    it('applies base CSS class', () => {
      renderIntroductionSection();
      
      const section = screen.getByRole('region');
      expect(section).toHaveClass('introduction-section');
    });

    it('applies header CSS class', () => {
      renderIntroductionSection();
      
      const header = screen.getByRole('heading', { level: 2 }).closest('.introduction-section__header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('introduction-section__header');
    });

    it('applies title CSS class', () => {
      renderIntroductionSection();
      
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveClass('introduction-section__title');
    });

    it('applies subtitle CSS class when subtitle exists', () => {
      renderIntroductionSection({
        subtitle: 'Test subtitle'
      });
      
      const subtitle = screen.getByRole('heading', { level: 3 });
      expect(subtitle).toHaveClass('introduction-section__subtitle');
    });

    it('applies content CSS class', () => {
      renderIntroductionSection();
      
      const content = screen.getByText('Test section content').closest('.introduction-section__content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('introduction-section__content');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string title', () => {
      renderIntroductionSection({
        title: ''
      });
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('');
    });

    it('handles empty string subtitle', () => {
      renderIntroductionSection({
        subtitle: ''
      });
      
      // Empty string subtitle should not render h3 element
      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('handles whitespace-only subtitle', () => {
      renderIntroductionSection({
        subtitle: '   '
      });
      
      // Whitespace-only subtitle should not render h3 element
      expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('handles complex nested children', () => {
      const complexChildren = (
        <div>
          <div>
            <p>Nested paragraph</p>
            <div>
              <span>Deeply nested span</span>
            </div>
          </div>
        </div>
      );

      renderIntroductionSection({
        children: complexChildren
      });
      
      expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
      expect(screen.getByText('Deeply nested span')).toBeInTheDocument();
    });

    it('handles special characters in id', () => {
      renderIntroductionSection({
        id: 'section-with-special-chars_123'
      });
      
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('id', 'section-with-special-chars_123');
      expect(section).toHaveAttribute('aria-labelledby', 'section-with-special-chars_123-title');
    });
  });

  describe('Component Integration', () => {
    it('can be used multiple times on same page', () => {
      render(
        <div>
          <IntroductionSection id="section-1" title="Section 1">
            <p>Content 1</p>
          </IntroductionSection>
          <IntroductionSection id="section-2" title="Section 2" variant="highlighted">
            <p>Content 2</p>
          </IntroductionSection>
          <IntroductionSection id="section-3" title="Section 3" variant="warning">
            <p>Content 3</p>
          </IntroductionSection>
        </div>
      );
      
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
      expect(screen.getByText('Section 3')).toBeInTheDocument();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });

    it('maintains unique ids when used multiple times', () => {
      render(
        <div>
          <IntroductionSection id="unique-1" title="Title 1">
            <p>Content 1</p>
          </IntroductionSection>
          <IntroductionSection id="unique-2" title="Title 2">
            <p>Content 2</p>
          </IntroductionSection>
        </div>
      );
      
      const sections = screen.getAllByRole('region');
      expect(sections[0]).toHaveAttribute('id', 'unique-1');
      expect(sections[1]).toHaveAttribute('id', 'unique-2');
      
      const titles = screen.getAllByRole('heading', { level: 2 });
      expect(titles[0]).toHaveAttribute('id', 'unique-1-title');
      expect(titles[1]).toHaveAttribute('id', 'unique-2-title');
    });
  });
});

export {};