import React, { useState, useRef, useEffect } from 'react';
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
  const [focusedRole, setFocusedRole] = useState<UserRole | null>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const roleButtonsRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation for role buttons
  const handleRoleKeyDown = (event: React.KeyboardEvent, role: UserRole) => {
    const roles: UserRole[] = ['business', 'pm-designer', 'engineer', 'data-scientist'];
    const currentIndex = roles.indexOf(role);

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % roles.length;
        const nextRole = roles[nextIndex];
        if (nextRole) setFocusedRole(nextRole);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + roles.length) % roles.length;
        const prevRole = roles[prevIndex];
        if (prevRole) setFocusedRole(prevRole);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onRoleChange?.(role);
        break;
      case 'Escape':
        event.preventDefault();
        setFocusedRole(null);
        termRef.current?.focus();
        break;
    }
  };

  // Focus management for role buttons
  useEffect(() => {
    if (focusedRole && roleButtonsRef.current) {
      const button = roleButtonsRef.current.querySelector(
        `[data-role="${focusedRole}"]`
      ) as HTMLButtonElement;
      button?.focus();
    }
  }, [focusedRole]);

  // Handle external link with proper accessibility
  const handleExternalLinkClick = () => {
    // Link will open in new tab due to target="_blank"
    // Screen readers will announce this due to aria-label
  };

  const handleExternalLinkKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.open(term.externalLink, '_blank', 'noopener,noreferrer');
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleTermKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  };

  return (
    <article 
      className={`glossary-term ${className}`}
      ref={termRef}
      aria-labelledby={`term-${term.id}`}
      aria-describedby={`definition-${term.id}`}
    >
      <header className="glossary-term__header">
        <button 
          id={`term-${term.id}`}
          className="glossary-term__title"
          onClick={toggleExpanded}
          onKeyDown={handleTermKeyDown}
          aria-expanded={isExpanded}
          aria-controls={`content-${term.id}`}
          type="button"
        >
          {term.term}
          <span 
            className={`glossary-term__expand-icon ${isExpanded ? 'expanded' : ''}`}
            aria-hidden="true"
          >
            ▼
          </span>
        </button>
        
        <a
          href={term.externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="glossary-term__external-link"
          aria-label={`Learn more about ${term.term} from external source (opens in new tab)`}
          onClick={handleExternalLinkClick}
          onKeyDown={handleExternalLinkKeyDown}
        >
          <span className="glossary-term__link-icon" aria-hidden="true">🔗</span>
          <span className="glossary-term__link-text">Learn More</span>
        </a>
      </header>

      <div 
        id={`content-${term.id}`}
        className={`glossary-term__content ${isExpanded ? 'expanded' : ''}`}
        aria-hidden={!isExpanded}
      >
        <p 
          id={`definition-${term.id}`}
          className="glossary-term__definition"
        >
          {term.definition}
        </p>

        <div className="glossary-term__role-section">
          <h3 className="glossary-term__role-title">
            Role-Specific Context
          </h3>
          
          <div 
            className="glossary-term__role-buttons"
            ref={roleButtonsRef}
            role="tablist"
            aria-label="Select role for context"
          >
            {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
              <button
                key={role}
                data-role={role}
                className={`glossary-term__role-button ${selectedRole === role ? 'active' : ''}`}
                onClick={() => onRoleChange?.(role)}
                onKeyDown={(e) => handleRoleKeyDown(e, role)}
                role="tab"
                aria-selected={selectedRole === role}
                aria-controls={`role-context-${term.id}`}
                tabIndex={selectedRole === role || (!selectedRole && role === 'business') ? 0 : -1}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>

          {selectedRole && (
            <div 
              id={`role-context-${term.id}`}
              className="glossary-term__role-context"
              role="tabpanel"
              aria-labelledby={`role-button-${selectedRole}`}
            >
              <p className="glossary-term__context-text">
                <strong>{ROLE_LABELS[selectedRole]}:</strong> {term.roleContext[selectedRole]}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default GlossaryTerm;