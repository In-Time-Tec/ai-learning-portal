import React, { memo } from 'react';
import { AgentPlatform } from '../types';

interface TabContentProps {
  platform: AgentPlatform;
}

// Memoized Overview Tab Component
export const OverviewTab = memo<TabContentProps>(({ platform }) => (
  <div 
    id="tabpanel-overview"
    className="platform-modal__tab-content" 
    role="tabpanel"
    aria-labelledby="tab-overview"
    tabIndex={0}
  >
    <section className="platform-modal__section">
      <h3>Description</h3>
      <p>{platform.detailedDescription}</p>
    </section>

    <div className="platform-modal__two-column">
      <section className="platform-modal__section">
        <h3>Strengths</h3>
        <ul className="platform-modal__list platform-modal__list--strengths">
          {platform.strengths.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </section>

      <section className="platform-modal__section">
        <h3>Weaknesses</h3>
        <ul className="platform-modal__list platform-modal__list--weaknesses">
          {platform.weaknesses.map((weakness, index) => (
            <li key={index}>{weakness}</li>
          ))}
        </ul>
      </section>
    </div>

    <section className="platform-modal__section">
      <h3>Primary Use Cases</h3>
      <ul className="platform-modal__list">
        {platform.primaryUseCases.map((useCase, index) => (
          <li key={index}>{useCase}</li>
        ))}
      </ul>
    </section>

    <section className="platform-modal__section">
      <h3>Target Audience</h3>
      <div className="platform-modal__tags">
        {platform.targetAudience.map((audience, index) => (
          <span key={index} className="platform-modal__tag">
            {audience}
          </span>
        ))}
      </div>
    </section>

    {platform.competitorComparison && (
      <section className="platform-modal__section">
        <h3>Competitive Positioning</h3>
        <p>{platform.competitorComparison}</p>
      </section>
    )}
  </div>
));

// Memoized Features Tab Component
export const FeaturesTab = memo<TabContentProps>(({ platform }) => (
  <div 
    id="tabpanel-features"
    className="platform-modal__tab-content" 
    role="tabpanel"
    aria-labelledby="tab-features"
    tabIndex={0}
  >
    <section className="platform-modal__section">
      <h3>Key Features</h3>
      <ul className="platform-modal__list">
        {platform.keyFeatures.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </section>

    {platform.supportedLanguages && platform.supportedLanguages.length > 0 && (
      <section className="platform-modal__section">
        <h3>Supported Languages</h3>
        <div className="platform-modal__tags">
          {platform.supportedLanguages.map((language, index) => (
            <span key={index} className="platform-modal__tag platform-modal__tag--language">
              {language}
            </span>
          ))}
        </div>
      </section>
    )}

    {platform.integrations && platform.integrations.length > 0 && (
      <section className="platform-modal__section">
        <h3>Integrations</h3>
        <div className="platform-modal__tags">
          {platform.integrations.map((integration, index) => (
            <span key={index} className="platform-modal__tag platform-modal__tag--integration">
              {integration}
            </span>
          ))}
        </div>
      </section>
    )}

    {platform.deploymentOptions && platform.deploymentOptions.length > 0 && (
      <section className="platform-modal__section">
        <h3>Deployment Options</h3>
        <ul className="platform-modal__list">
          {platform.deploymentOptions.map((option, index) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
      </section>
    )}
  </div>
));

// Memoized Resources Tab Component
export const ResourcesTab = memo<TabContentProps>(({ platform }) => {
  const renderExternalLink = (url: string, text: string, ariaLabel?: string) => (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="platform-modal__external-link"
      aria-label={ariaLabel || `${text} (opens in new tab)`}
    >
      {text}
      <span className="platform-modal__external-icon" aria-hidden="true">↗</span>
    </a>
  );

  return (
    <div 
      id="tabpanel-resources"
      className="platform-modal__tab-content" 
      role="tabpanel"
      aria-labelledby="tab-resources"
      tabIndex={0}
    >
      <section className="platform-modal__section">
        <h3>Official Resources</h3>
        <div className="platform-modal__links">
          {platform.officialWebsite && (
            <div className="platform-modal__link-item">
              <strong>Official Website:</strong>
              {renderExternalLink(platform.officialWebsite, platform.officialWebsite, `Visit ${platform.name} official website`)}
            </div>
          )}
          
          {platform.documentation && (
            <div className="platform-modal__link-item">
              <strong>Documentation:</strong>
              {renderExternalLink(platform.documentation, 'View Documentation', `View ${platform.name} documentation`)}
            </div>
          )}
          
          {platform.githubRepository && (
            <div className="platform-modal__link-item">
              <strong>GitHub Repository:</strong>
              {renderExternalLink(platform.githubRepository, 'View Source Code', `View ${platform.name} source code on GitHub`)}
            </div>
          )}
          
          {platform.pricing && (
            <div className="platform-modal__link-item">
              <strong>Pricing Information:</strong>
              {renderExternalLink(platform.pricing, 'View Pricing', `View ${platform.name} pricing information`)}
            </div>
          )}
        </div>
      </section>

      <section className="platform-modal__section">
        <h3>Platform Details</h3>
        <div className="platform-modal__metadata">
          <div className="platform-modal__metadata-item">
            <strong>Type:</strong>
            <span className={`platform-modal__badge platform-modal__badge--${platform.type}`}>
              {platform.type.charAt(0).toUpperCase() + platform.type.slice(1)}
            </span>
          </div>
          
          <div className="platform-modal__metadata-item">
            <strong>Maturity Level:</strong>
            <span className={`platform-modal__badge platform-modal__badge--${platform.maturityLevel}`}>
              {platform.maturityLevel.charAt(0).toUpperCase() + platform.maturityLevel.slice(1)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
});

// Loading component for lazy loading
export const TabLoadingSpinner = () => (
  <div className="platform-modal__tab-loading">
    <div className="loading-spinner" aria-label="Loading content">
      <div className="spinner"></div>
    </div>
  </div>
);