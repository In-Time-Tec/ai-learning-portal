import React, { memo } from 'react';
import { AgentPlatform } from '../types';
import './PlatformCard.css';

interface PlatformCardProps {
  platform: AgentPlatform;
  onViewDetails: (platform: AgentPlatform) => void;
  className?: string;
  'aria-setsize'?: number;
  'aria-posinset'?: number;
}

const PlatformCard: React.FC<PlatformCardProps> = ({
  platform,
  onViewDetails,
  className = '',
  'aria-setsize': ariaSetsize,
  'aria-posinset': ariaPosinset
}) => {
  const handleViewDetails = () => {
    onViewDetails(platform);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleViewDetails();
    }
  };

  const getCategoryLabel = (category: string): string => {
    const categoryLabels: Record<string, string> = {
      'open-source-framework': 'Open Source Framework',
      'commercial-platform': 'Commercial Platform',
      'enterprise-solution': 'Enterprise Solution',
      'workflow-automation': 'Workflow Automation',
      'multi-agent-system': 'Multi-Agent System',
      'autonomous-agent': 'Autonomous Agent'
    };
    return categoryLabels[category] || category;
  };

  const getMaturityLabel = (maturity: string): string => {
    const maturityLabels: Record<string, string> = {
      'experimental': 'Experimental',
      'beta': 'Beta',
      'stable': 'Stable',
      'enterprise': 'Enterprise'
    };
    return maturityLabels[maturity] || maturity;
  };

  const hasExternalLinks = platform.officialWebsite || platform.documentation || platform.githubRepository;

  return (
    <div 
      className={`platform-card platform-card--${platform.category} ${className}`}
      role="article"
      aria-labelledby={`platform-${platform.id}-title`}
      aria-describedby={`platform-${platform.id}-description`}
      {...(ariaSetsize && { 'aria-setsize': ariaSetsize })}
      {...(ariaPosinset && { 'aria-posinset': ariaPosinset })}

    >
      <div className="platform-card__header">
        <h3 
          id={`platform-${platform.id}-title`}
          className="platform-card__title"
        >
          {platform.name}
        </h3>
        <div className="platform-card__badges">
          <span 
            className={`platform-card__category-badge platform-card__category-badge--${platform.category}`}
            aria-label={`Category: ${getCategoryLabel(platform.category)}`}
          >
            {getCategoryLabel(platform.category)}
          </span>
          <span 
            className={`platform-card__maturity-badge platform-card__maturity-badge--${platform.maturityLevel}`}
            aria-label={`Maturity level: ${getMaturityLabel(platform.maturityLevel)}`}
          >
            {getMaturityLabel(platform.maturityLevel)}
          </span>
        </div>
      </div>

      <div className="platform-card__content">
        <p 
          id={`platform-${platform.id}-description`}
          className="platform-card__description"
        >
          {platform.description}
        </p>

        {platform.keyFeatures.length > 0 && (
          <div className="platform-card__features">
            <h4 
              id={`platform-${platform.id}-features-title`}
              className="platform-card__features-title"
            >
              Key Features:
            </h4>
            <ul 
              className="platform-card__features-list"
              aria-labelledby={`platform-${platform.id}-features-title`}
            >
              {platform.keyFeatures.slice(0, 3).map((feature, index) => (
                <li key={index} className="platform-card__feature-item">
                  {feature}
                </li>
              ))}
              {platform.keyFeatures.length > 3 && (
                <li 
                  className="platform-card__feature-item platform-card__feature-item--more"
                  aria-label={`${platform.keyFeatures.length - 3} additional features available in detailed view`}
                >
                  +{platform.keyFeatures.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}

        {platform.strengths.length > 0 && (
          <div className="platform-card__strengths">
            <div className="platform-card__strength-indicators">
              <span className="platform-card__strength-icon" aria-hidden="true">✓</span>
              <span className="platform-card__strength-text">
                {platform.strengths.length} strength{platform.strengths.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="platform-card__footer">
        <div className="platform-card__actions">
          <button
            className="platform-card__view-details-btn"
            onClick={handleViewDetails}
            onKeyDown={handleKeyDown}
            aria-describedby={`platform-${platform.id}-title`}
            aria-label={`View detailed information about ${platform.name}`}
          >
            View Details
            <span className="platform-card__view-details-icon" aria-hidden="true">→</span>
          </button>
          
          {hasExternalLinks && (
            <div className="platform-card__external-links" aria-label="External links available">
              {platform.officialWebsite && (
                <span className="platform-card__external-icon platform-card__external-icon--website" 
                      aria-label="Official website available" title="Official website">
                  🌐
                </span>
              )}
              {platform.documentation && (
                <span className="platform-card__external-icon platform-card__external-icon--docs" 
                      aria-label="Documentation available" title="Documentation">
                  📚
                </span>
              )}
              {platform.githubRepository && (
                <span className="platform-card__external-icon platform-card__external-icon--github" 
                      aria-label="GitHub repository available" title="GitHub repository">
                  💻
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(PlatformCard, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.platform.id === nextProps.platform.id &&
    prevProps.className === nextProps.className &&
    prevProps['aria-setsize'] === nextProps['aria-setsize'] &&
    prevProps['aria-posinset'] === nextProps['aria-posinset']
    // onViewDetails is stable due to useCallback in parent
  );
});