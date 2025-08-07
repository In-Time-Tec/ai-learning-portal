import React, { useState, useRef } from 'react';
import { AITool, UserExperience, ToolCategory } from '../types';
import './AIToolCard.css';

interface AIToolCardProps {
  tool: AITool;
  className?: string;
  onExperienceExpand?: (experienceId: string) => void;
}

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  'code-assistant': 'Code Assistant',
  'ide-extension': 'IDE Extension',
  'research-tool': 'Research Tool',
  'debugging-tool': 'Debugging Tool',
  'testing-tool': 'Testing Tool',
  'terminal-tool': 'Terminal Tool'
};

const SENTIMENT_LABELS: Record<UserExperience['sentiment'], string> = {
  'positive': 'Positive Experience',
  'mixed': 'Mixed Experience',
  'challenge': 'Challenge Noted'
};

export const AIToolCard: React.FC<AIToolCardProps> = ({
  tool,
  className = '',
  onExperienceExpand
}) => {
  const [expandedExperiences, setExpandedExperiences] = useState<Set<string>>(new Set());
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const cardRef = useRef<HTMLElement>(null);

  const toggleExperience = (experienceId: string) => {
    const newExpanded = new Set(expandedExperiences);
    if (newExpanded.has(experienceId)) {
      newExpanded.delete(experienceId);
    } else {
      newExpanded.add(experienceId);
    }
    setExpandedExperiences(newExpanded);
    onExperienceExpand?.(experienceId);
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const handleExperienceKeyDown = (event: React.KeyboardEvent, experienceId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExperience(experienceId);
    }
  };

  const handleDescriptionKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDescription();
    }
  };

  const handleExternalLinkKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (tool.officialLink) {
        window.open(tool.officialLink, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const getSentimentClassName = (sentiment: UserExperience['sentiment']): string => {
    return `ai-tool-card__experience--${sentiment}`;
  };

  const getAdoptionLevelLabel = (level: string): string => {
    switch (level) {
      case 'individual': return 'Individual Use';
      case 'team': return 'Team Adoption';
      case 'organization': return 'Organization-wide';
      default: return level;
    }
  };

  return (
    <article 
      className={`ai-tool-card ${className}`}
      ref={cardRef}
      aria-labelledby={`tool-${tool.id}-title`}
      aria-describedby={`tool-${tool.id}-description`}
    >
      {/* Tool Header */}
      <header className="ai-tool-card__header">
        <div className="ai-tool-card__title-section">
          <h2 
            id={`tool-${tool.id}-title`}
            className="ai-tool-card__title"
          >
            {tool.name}
          </h2>
          <span 
            className="ai-tool-card__category"
            aria-label={`Category: ${CATEGORY_LABELS[tool.category]}`}
          >
            {CATEGORY_LABELS[tool.category]}
          </span>
        </div>
        
        {tool.officialLink && (
          <a
            href={tool.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ai-tool-card__external-link"
            aria-label={`Visit ${tool.name} official website (opens in new tab)`}
            onKeyDown={handleExternalLinkKeyDown}
          >
            <span className="ai-tool-card__link-icon" aria-hidden="true">🔗</span>
            <span className="ai-tool-card__link-text">Visit Site</span>
          </a>
        )}
      </header>

      {/* Tool Description */}
      <div className="ai-tool-card__description-section">
        <button
          className="ai-tool-card__description-toggle"
          onClick={toggleDescription}
          onKeyDown={handleDescriptionKeyDown}
          aria-expanded={isDescriptionExpanded}
          aria-controls={`description-${tool.id}`}
          type="button"
        >
          <span className="ai-tool-card__description-label">Description</span>
          <span 
            className={`ai-tool-card__expand-icon ${isDescriptionExpanded ? 'expanded' : ''}`}
            aria-hidden="true"
          >
            ▼
          </span>
        </button>
        
        <div 
          id={`description-${tool.id}`}
          className={`ai-tool-card__description ${isDescriptionExpanded ? 'expanded' : ''}`}
          aria-hidden={!isDescriptionExpanded}
        >
          <p 
            id={`tool-${tool.id}-description`}
            className="ai-tool-card__description-text"
          >
            {tool.description}
          </p>
        </div>
      </div>

      {/* Common Use Cases */}
      {tool.commonUseCases.length > 0 && (
        <section className="ai-tool-card__use-cases">
          <h3 className="ai-tool-card__section-title">Common Use Cases</h3>
          <ul className="ai-tool-card__use-cases-list">
            {tool.commonUseCases.map((useCase, index) => (
              <li key={`${tool.id}-usecase-${index}`} className="ai-tool-card__use-case">
                {useCase}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* User Experiences */}
      {tool.userExperiences.length > 0 && (
        <section className="ai-tool-card__experiences">
          <h3 className="ai-tool-card__section-title">User Experiences</h3>
          <div className="ai-tool-card__experiences-list">
            {tool.userExperiences.map((experience) => (
              <div 
                key={experience.id}
                className={`ai-tool-card__experience ${getSentimentClassName(experience.sentiment)}`}
              >
                <button
                  className="ai-tool-card__experience-toggle"
                  onClick={() => toggleExperience(experience.id)}
                  onKeyDown={(e) => handleExperienceKeyDown(e, experience.id)}
                  aria-expanded={expandedExperiences.has(experience.id)}
                  aria-controls={`experience-${experience.id}`}
                  aria-label={`${SENTIMENT_LABELS[experience.sentiment]}: ${experience.quote}`}
                  type="button"
                >
                  <span className="ai-tool-card__experience-quote">
                    "{experience.quote}"
                  </span>
                  <span 
                    className={`ai-tool-card__expand-icon ${expandedExperiences.has(experience.id) ? 'expanded' : ''}`}
                    aria-hidden="true"
                  >
                    ▼
                  </span>
                </button>
                
                <div 
                  id={`experience-${experience.id}`}
                  className={`ai-tool-card__experience-details ${expandedExperiences.has(experience.id) ? 'expanded' : ''}`}
                  aria-hidden={!expandedExperiences.has(experience.id)}
                >
                  <div className="ai-tool-card__experience-meta">
                    <p className="ai-tool-card__experience-context">
                      <strong>Context:</strong> {experience.context}
                    </p>
                    <p className="ai-tool-card__experience-use-case">
                      <strong>Use Case:</strong> {experience.useCase}
                    </p>
                    {experience.role && (
                      <p className="ai-tool-card__experience-role">
                        <strong>Role:</strong> {experience.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Team Adoption */}
      {tool.teamAdoption && (
        <section className="ai-tool-card__adoption">
          <h3 className="ai-tool-card__section-title">Team Adoption</h3>
          <div className="ai-tool-card__adoption-content">
            <p className="ai-tool-card__adoption-level">
              <strong>Level:</strong> {getAdoptionLevelLabel(tool.teamAdoption.level)}
            </p>
            <p className="ai-tool-card__adoption-notes">
              {tool.teamAdoption.notes}
            </p>
          </div>
        </section>
      )}

      {/* Integrations */}
      {tool.integrations && tool.integrations.length > 0 && (
        <section className="ai-tool-card__integrations">
          <h3 className="ai-tool-card__section-title">Integrations</h3>
          <ul className="ai-tool-card__integrations-list">
            {tool.integrations.map((integration, index) => (
              <li key={`${tool.id}-integration-${index}`} className="ai-tool-card__integration">
                {integration}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Setup Notes and Licensing */}
      <footer className="ai-tool-card__footer">
        {tool.internalSetupNotes && (
          <div className="ai-tool-card__setup-notes">
            <h4 className="ai-tool-card__footer-title">Setup Notes</h4>
            <p className="ai-tool-card__footer-text">{tool.internalSetupNotes}</p>
          </div>
        )}
        
        {tool.licensingNotes && (
          <div className="ai-tool-card__licensing">
            <h4 className="ai-tool-card__footer-title">Licensing</h4>
            <p className="ai-tool-card__footer-text">{tool.licensingNotes}</p>
          </div>
        )}
      </footer>
    </article>
  );
};

export default AIToolCard;