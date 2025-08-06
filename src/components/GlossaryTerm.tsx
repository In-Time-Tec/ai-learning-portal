import React, { useState, useRef } from 'react';
import { GlossaryTerm as GlossaryTermType, UserRole } from '../types';
import './GlossaryTerm.css';

interface GlossaryTermProps {
  term: GlossaryTermType;
  selectedRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  className?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  'business': 'Business & Operations',
  'pm-designer': 'Product Manager & Designer',
  'engineer': 'Engineer',
  'data-scientist': 'Data Scientist'
};

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({
  term,
  selectedRole,
  onRoleChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const roleButtonsRef = useRef<HTMLDivElement>(null);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleToggleExpanded();
        break;
    }
  };

  const handleRoleButtonClick = (role: UserRole) => {
    onRoleChange?.(role);
  };

  const handleRoleButtonKeyDown = (event: React.KeyboardEvent, role: UserRole) => {
    const roles: UserRole[] = ['business', 'pm-designer', 'engineer', 'data-scientist'];
    const currentIndex = roles.indexOf(role);

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % roles.length;
        const nextButton = roleButtonsRef.current?.querySelector(
          `[data-role="${roles[nextIndex]}"]`
        ) as HTMLButtonElement;
        nextButton?.focus();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + roles.length) % roles.length;
        const prevButton = roleButtonsRef.current?.querySelector(
          `[data-role="${roles[prevIndex]}"]`
        ) as HTMLButtonElement;
        prevButton?.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleRoleButtonClick(role);
        break;
      case 'Escape':
        event.preventDefault();
        articleRef.current?.focus();
        break;
    }
  };

  const handleExternalLinkKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.open(term.externalLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <article
      ref={articleRef}
      className={`glossary-term ${className}`}
      aria-labelledby={`term-${term.id}`}
      aria-describedby={`definition-${term.id}`}
    >
      <button
        className="glossary-term__header"
        onClick={handleToggleExpanded}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls={`content-${term.id}`}
      >
        <h3
          id={`term-${term.id}`}
          className="glossary-term__title"
        >
          {term.term}
        </h3>
        <span className={`glossary-term__toggle ${isExpanded ? 'expanded' : ''}`}>
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      <div 
        id={`content-${term.id}`}
        className={`glossary-term__content ${isExpanded ? 'expanded' : ''}`}
      >
        <div className="glossary-term__definition">
          <p id={`definition-${term.id}`}>{term.definition}</p>
          <a
            href={term.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="glossary-term__external-link"
            aria-label={`Learn more about ${term.term} (opens in new tab)`}
            onKeyDown={handleExternalLinkKeyDown}
          >
            Learn More →
          </a>
        </div>

        <div className="glossary-term__role-section">
          <h4 className="glossary-term__role-heading">Role-Specific Context</h4>
          
          <div
            ref={roleButtonsRef}
            className="glossary-term__role-buttons"
            role="tablist"
            aria-label="Select role for context"
          >
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
              <button
                key={role}
                data-role={role}
                id={`role-button-${role}`}
                role="tab"
                aria-selected={selectedRole === role}
                aria-controls={`role-panel-${role}`}
                tabIndex={selectedRole === role ? 0 : -1}
                className={`glossary-term__role-button ${selectedRole === role ? 'active' : ''}`}
                onClick={() => handleRoleButtonClick(role)}
                onKeyDown={(e) => handleRoleButtonKeyDown(e, role)}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>

          {selectedRole && (
            <div
              id={`role-panel-${selectedRole}`}
              role="tabpanel"
              aria-labelledby={`role-button-${selectedRole}`}
              className="glossary-term__role-context"
            >
              <p>
                <strong>{ROLE_LABELS[selectedRole]}:</strong>{' '}
                {term.roleContext[selectedRole]}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default GlossaryTerm;