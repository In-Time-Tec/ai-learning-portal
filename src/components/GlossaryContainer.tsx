import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GlossaryTerm as GlossaryTermType, UserRole } from '../types';
import { glossaryDataService } from '../services/GlossaryDataService';
import { GlossaryTerm } from './GlossaryTerm';
import { SkeletonLoader } from './SkeletonLoader';
import { ErrorMessage } from './ErrorMessage';
import './GlossaryContainer.css';

interface GlossaryContainerProps {
  className?: string;
  initialRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  'business': 'Business & Operations',
  'pm-designer': 'Product Manager & Designer',
  'engineer': 'Engineer',
  'data-scientist': 'Data Scientist'
};

export const GlossaryContainer: React.FC<GlossaryContainerProps> = ({
  className = '',
  initialRole,
  onRoleChange
}) => {
  const [terms, setTerms] = useState<GlossaryTermType[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTermType[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(initialRole);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorType, setErrorType] = useState<'network' | 'data' | 'generic'>('generic');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const roleFilterRef = useRef<HTMLDivElement>(null);

  // Load glossary data on mount
  useEffect(() => {
    loadGlossaryData();
  }, []);

  // Filter and search terms when dependencies change
  const processedTerms = useMemo(() => {
    let result = terms;

    // Apply search filter
    if (searchQuery.trim()) {
      result = glossaryDataService.searchTerms(searchQuery);
    }

    // Sort alphabetically
    result = result.sort((a, b) => a.term.localeCompare(b.term));

    return result;
  }, [terms, searchQuery]);

  // Update filtered terms when processed terms change
  useEffect(() => {
    setFilteredTerms(processedTerms);
  }, [processedTerms]);

  const loadGlossaryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsRetrying(false);
      
      const loadedTerms = await glossaryDataService.loadGlossary();
      setTerms(loadedTerms);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load glossary data';
      setError(errorMessage);
      
      // Determine error type for better user experience
      if (errorMessage.includes('Network error') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
        setErrorType('network');
      } else if (errorMessage.includes('Invalid glossary data') || errorMessage.includes('format') || errorMessage.includes('malformed')) {
        setErrorType('data');
      } else {
        setErrorType('generic');
      }
      
      console.error('Error loading glossary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await loadGlossaryData();
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    onRoleChange?.(role);
  };

  const handleRoleFilterKeyDown = (event: React.KeyboardEvent, role: UserRole) => {
    const roles: UserRole[] = ['business', 'pm-designer', 'engineer', 'data-scientist'];
    const currentIndex = roles.indexOf(role);

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % roles.length;
        const nextButton = roleFilterRef.current?.querySelector(
          `[data-role="${roles[nextIndex]}"]`
        ) as HTMLButtonElement;
        nextButton?.focus();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + roles.length) % roles.length;
        const prevButton = roleFilterRef.current?.querySelector(
          `[data-role="${roles[prevIndex]}"]`
        ) as HTMLButtonElement;
        prevButton?.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleRoleChange(role);
        break;
      case 'Escape':
        event.preventDefault();
        searchInputRef.current?.focus();
        break;
    }
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        // Focus first role filter button
        const firstRoleButton = roleFilterRef.current?.querySelector(
          '[data-role="business"]'
        ) as HTMLButtonElement;
        firstRoleButton?.focus();
        break;
      case 'Escape':
        event.preventDefault();
        setSearchQuery('');
        break;
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const clearRoleFilter = () => {
    setSelectedRole(undefined);
    onRoleChange?.(undefined as any); // Reset role selection
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`glossary-container ${className}`}>
        <SkeletonLoader type="glossary" count={5} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`glossary-container ${className}`}>
        <ErrorMessage
          title="Unable to Load Glossary"
          message={error}
          type={errorType}
          onRetry={handleRetry}
          isRetrying={isRetrying}
          actions={[
            {
              label: 'Go to Quiz',
              onClick: () => window.location.hash = '#quiz',
              variant: 'secondary'
            }
          ]}
          details={error}
        />
      </div>
    );
  }

  return (
    <div className={`glossary-container ${className}`}>
      <div className="glossary-container__header">
        <h1 className="glossary-container__title">AI Glossary</h1>
        <p className="glossary-container__description">
          Explore {terms.length} essential AI terms with role-specific context for different business personas.
        </p>
      </div>

      <div className="glossary-container__controls">
        {/* Search Input */}
        <div className="glossary-container__search">
          <label htmlFor="glossary-search" className="glossary-container__search-label">
            Search terms and definitions
          </label>
          <div className="glossary-container__search-wrapper">
            <input
              id="glossary-search"
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search AI terms..."
              className="glossary-container__search-input"
              aria-describedby="search-help"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="glossary-container__clear-search"
                aria-label="Clear search"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
          <div id="search-help" className="glossary-container__search-help">
            Use arrow keys to navigate to role filters, Escape to clear search
          </div>
        </div>

        {/* Role Filter */}
        <div className="glossary-container__role-filter">
          <fieldset className="glossary-container__role-fieldset">
            <legend className="glossary-container__role-legend">
              Filter by role perspective
            </legend>
            <div 
              className="glossary-container__role-buttons"
              ref={roleFilterRef}
              role="group"
              aria-label="Role filter options"
            >
              <button
                onClick={clearRoleFilter}
                className={`glossary-container__role-button ${!selectedRole ? 'active' : ''}`}
                aria-pressed={!selectedRole}
              >
                All Roles
              </button>
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                <button
                  key={role}
                  data-role={role}
                  onClick={() => handleRoleChange(role)}
                  onKeyDown={(e) => handleRoleFilterKeyDown(e, role)}
                  className={`glossary-container__role-button ${selectedRole === role ? 'active' : ''}`}
                  aria-pressed={selectedRole === role}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Results Summary */}
      <div className="glossary-container__results" aria-live="polite">
        <p className="glossary-container__results-text">
          {filteredTerms.length === 0 && searchQuery ? (
            <>No terms found for "{searchQuery}". Try a different search term.</>
          ) : (
            <>
              Showing {filteredTerms.length} of {terms.length} terms
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedRole && ` for ${ROLE_LABELS[selectedRole]}`}
            </>
          )}
        </p>
      </div>

      {/* Terms List */}
      <div className="glossary-container__terms">
        {filteredTerms.length === 0 && searchQuery ? (
          <div className="glossary-container__no-results">
            <h3>No matching terms found</h3>
            <p>Try adjusting your search or browse all terms.</p>
            <button onClick={clearSearch} className="glossary-container__clear-button">
              Clear Search
            </button>
          </div>
        ) : (
          filteredTerms.map((term) => (
            <GlossaryTerm
              key={term.id}
              term={term}
              {...(selectedRole && { selectedRole })}
              onRoleChange={handleRoleChange}
              className="glossary-container__term"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GlossaryContainer;