/**
 * IntroductionSection Component
 * 
 * Reusable component for displaying individual content sections with consistent formatting.
 * Supports different visual variants and semantic HTML structure with proper heading hierarchy.
 */

import React from 'react';
import './IntroductionSection.css';

/**
 * Props interface for IntroductionSection component
 */
export interface IntroductionSectionProps {
  /** Unique identifier for the section */
  id: string;
  /** Main section title */
  title: string;
  /** Optional subtitle for additional context */
  subtitle?: string;
  /** Section content - can be string or React nodes */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Visual variant for different content types */
  variant?: 'default' | 'highlighted' | 'warning';
}

/**
 * IntroductionSection component implementation
 */
export const IntroductionSection: React.FC<IntroductionSectionProps> = ({
  id,
  title,
  subtitle,
  children,
  className = '',
  variant = 'default'
}) => {
  return (
    <section
      id={id}
      className={`introduction-section introduction-section--${variant} ${className}`}
      aria-labelledby={`${id}-title`}
      aria-describedby={subtitle ? `${id}-subtitle` : undefined}
      tabIndex={-1}
    >
      <header className="introduction-section__header">
        <h2 
          id={`${id}-title`}
          className="introduction-section__title"
          tabIndex={-1}
        >
          {title}
        </h2>
        {subtitle && subtitle.trim() && (
          <h3 
            id={`${id}-subtitle`}
            className="introduction-section__subtitle"
          >
            {subtitle}
          </h3>
        )}
      </header>
      
      <div 
        className="introduction-section__content"
        role="document"
        aria-label={`Content for ${title}`}
      >
        {children}
      </div>
    </section>
  );
};

export default IntroductionSection;