/**
 * SkeletonLoader Component
 * 
 * Provides skeleton loading screens for different content types
 */

import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  /** Type of skeleton to display */
  type: 'glossary' | 'quiz' | 'progress' | 'term' | 'question' | 'ai-tools';
  /** Number of items to show (for list types) */
  count?: number;
  /** Additional CSS class */
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  count = 3,
  className = ''
}) => {
  const renderGlossarySkeleton = () => (
    <div className="skeleton-loader skeleton-loader--glossary">
      <div className="skeleton-loader__header">
        <div className="skeleton-loader__title"></div>
        <div className="skeleton-loader__description"></div>
      </div>
      <div className="skeleton-loader__controls">
        <div className="skeleton-loader__search"></div>
        <div className="skeleton-loader__filters">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-loader__filter-button"></div>
          ))}
        </div>
      </div>
      <div className="skeleton-loader__terms">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="skeleton-loader__term">
            <div className="skeleton-loader__term-title"></div>
            <div className="skeleton-loader__term-definition"></div>
            <div className="skeleton-loader__term-context"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQuizSkeleton = () => (
    <div className="skeleton-loader skeleton-loader--quiz">
      <div className="skeleton-loader__quiz-header">
        <div className="skeleton-loader__quiz-title"></div>
        <div className="skeleton-loader__progress-bar"></div>
      </div>
      <div className="skeleton-loader__question">
        <div className="skeleton-loader__question-text"></div>
        <div className="skeleton-loader__options">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-loader__option"></div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProgressSkeleton = () => (
    <div className="skeleton-loader skeleton-loader--progress">
      <div className="skeleton-loader__progress-title"></div>
      <div className="skeleton-loader__stats">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton-loader__stat">
            <div className="skeleton-loader__stat-label"></div>
            <div className="skeleton-loader__stat-value"></div>
          </div>
        ))}
      </div>
      <div className="skeleton-loader__progress-section">
        <div className="skeleton-loader__section-title"></div>
        <div className="skeleton-loader__progress-bar"></div>
      </div>
    </div>
  );

  const renderTermSkeleton = () => (
    <div className="skeleton-loader__term">
      <div className="skeleton-loader__term-title"></div>
      <div className="skeleton-loader__term-definition"></div>
      <div className="skeleton-loader__term-context"></div>
    </div>
  );

  const renderQuestionSkeleton = () => (
    <div className="skeleton-loader__question">
      <div className="skeleton-loader__question-text"></div>
      <div className="skeleton-loader__options">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-loader__option"></div>
        ))}
      </div>
    </div>
  );

  const renderAIToolsSkeleton = () => (
    <div className="skeleton-loader skeleton-loader--ai-tools">
      <div className="skeleton-loader__header">
        <div className="skeleton-loader__title"></div>
        <div className="skeleton-loader__description"></div>
      </div>
      <div className="skeleton-loader__controls">
        <div className="skeleton-loader__search"></div>
        <div className="skeleton-loader__filters">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-loader__filter-button"></div>
          ))}
        </div>
      </div>
      <div className="skeleton-loader__tools-grid">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="skeleton-loader__tool-card">
            <div className="skeleton-loader__tool-header">
              <div className="skeleton-loader__tool-title"></div>
              <div className="skeleton-loader__tool-category"></div>
            </div>
            <div className="skeleton-loader__tool-description"></div>
            <div className="skeleton-loader__tool-use-cases">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="skeleton-loader__use-case"></div>
              ))}
            </div>
            <div className="skeleton-loader__tool-experiences">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="skeleton-loader__experience"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'glossary':
        return renderGlossarySkeleton();
      case 'quiz':
        return renderQuizSkeleton();
      case 'progress':
        return renderProgressSkeleton();
      case 'term':
        return renderTermSkeleton();
      case 'question':
        return renderQuestionSkeleton();
      case 'ai-tools':
        return renderAIToolsSkeleton();
      default:
        return null;
    }
  };

  return (
    <div className={`skeleton-loader ${className}`} role="status" aria-label="Loading content">
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader;