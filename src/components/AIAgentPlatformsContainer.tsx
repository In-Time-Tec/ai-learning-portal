import React, { useState, useEffect, useCallback, useMemo, useRef, startTransition } from 'react';
import { AgentPlatform, PlatformCategory } from '../types';
import { AgentPlatformsDataService } from '../services/AgentPlatformsDataService';
import PlatformCard from './PlatformCard';
import PlatformDetailModal from './PlatformDetailModal';
import PlatformSearchFilter from './PlatformSearchFilter';
import PlatformVsToolsExplanation from './PlatformVsToolsExplanation';
import ErrorBoundary from './ErrorBoundary';
import ErrorMessage from './ErrorMessage';
import SkeletonLoader from './SkeletonLoader';
import './AIAgentPlatformsContainer.css';

// Performance constants
const MAX_VISIBLE_PLATFORMS = 50;

interface AIAgentPlatformsContainerProps {
  className?: string;
}

interface ContainerState {
  platforms: AgentPlatform[];
  filteredPlatforms: AgentPlatform[];
  selectedCategory: PlatformCategory | undefined;
  searchQuery: string;
  selectedPlatform: AgentPlatform | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
}

const MAX_RETRY_ATTEMPTS = 3;
// const RETRY_DELAY = 1000; // 1 second

const AIAgentPlatformsContainerInner: React.FC<AIAgentPlatformsContainerProps> = ({
  className = ''
}) => {
  const [state, setState] = useState<ContainerState>({
    platforms: [],
    filteredPlatforms: [],
    selectedCategory: undefined,
    searchQuery: '',
    selectedPlatform: null,
    isLoading: true,
    error: null,
    retryCount: 0
  });

  // Refs for accessibility
  const announcementRef = useRef<HTMLDivElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  // Load platforms data with retry logic
  const loadPlatforms = useCallback(async (isRetry = false) => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      const platforms = await AgentPlatformsDataService.loadPlatforms();
      
      setState(prev => ({
        ...prev,
        platforms,
        filteredPlatforms: platforms,
        isLoading: false,
        error: null,
        retryCount: 0
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load platforms data';
      
      setState(prev => {
        const newRetryCount = isRetry ? prev.retryCount + 1 : 1;
        return {
          ...prev,
          isLoading: false,
          error: errorMessage,
          retryCount: newRetryCount
        };
      });
    }
  }, []);

  // Retry with exponential backoff
  // const retryLoadPlatforms = useCallback(() => {
  //   if (state.retryCount >= MAX_RETRY_ATTEMPTS) {
  //     return;
  //   }

  //   const delay = RETRY_DELAY * Math.pow(2, state.retryCount);
    
  //   setTimeout(() => {
  //     loadPlatforms(true);
  //   }, delay);
  // }, [loadPlatforms, state.retryCount]);

  // Initial data load
  useEffect(() => {
    loadPlatforms();
  }, [loadPlatforms]);

  // Filter platforms based on search and category with performance optimizations
  const applyFilters = useCallback(() => {
    const filters: {
      query?: string;
      category?: PlatformCategory;
      limit?: number;
    } = {};

    if (state.searchQuery) {
      filters.query = state.searchQuery;
    }

    if (state.selectedCategory) {
      filters.category = state.selectedCategory;
    }

    // Limit results for performance
    filters.limit = MAX_VISIBLE_PLATFORMS;

    const filtered = AgentPlatformsDataService.getFilteredPlatforms(
      state.platforms,
      filters
    );

    setState(prev => ({
      ...prev,
      filteredPlatforms: filtered
    }));
  }, [state.platforms, state.searchQuery, state.selectedCategory]);

  // Apply filters when search or category changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Get available categories
  const availableCategories = useMemo(() => {
    return AgentPlatformsDataService.getUniqueCategories(state.platforms);
  }, [state.platforms]);

  // Handle search query change with debouncing (already implemented in PlatformSearchFilter)
  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query
    }));
  }, []);

  // Handle category filter change
  const handleCategoryChange = useCallback((category: PlatformCategory | undefined) => {
    setState(prev => ({
      ...prev,
      selectedCategory: category
    }));
  }, []);

  // Handle platform detail view
  const handleViewDetails = useCallback((platform: AgentPlatform) => {
    startTransition(() => {
      setState(prev => ({
        ...prev,
        selectedPlatform: platform
      }));
    });
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    startTransition(() => {
      setState(prev => ({
        ...prev,
        selectedPlatform: null
      }));
    });
  }, []);

  // Announce changes to screen readers
  const announceToScreenReader = useCallback((message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
      // Clear after announcement to avoid repetition
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  // Announce filter changes
  useEffect(() => {
    if (!state.isLoading && !state.error) {
      const message = `${state.filteredPlatforms.length} platforms found${
        state.searchQuery ? ` for search "${state.searchQuery}"` : ''
      }${
        state.selectedCategory ? ` in category ${state.selectedCategory.replace('-', ' ')}` : ''
      }`;
      announceToScreenReader(message);
    }
  }, [state.filteredPlatforms.length, state.searchQuery, state.selectedCategory, state.isLoading, state.error, announceToScreenReader]);

  // Handle retry button click
  const handleRetry = useCallback(() => {
    loadPlatforms();
  }, [loadPlatforms]);

  // Create a specialized skeleton loader for platforms
  const renderPlatformSkeleton = () => {
    return (
      <SkeletonLoader 
        type="platforms" 
        count={6} 
        className="platforms-skeleton-loader"
      />
    );
  };

  // Render loading state
  if (state.isLoading) {
    return (
      <div className={`ai-agent-platforms-container ${className}`}>
        {/* Skip link for keyboard navigation */}
        <a 
          ref={skipLinkRef}
          href="#main-content" 
          className="skip-link"
          onFocus={(e) => e.target.scrollIntoView()}
        >
          Skip to main content
        </a>

        {/* Screen reader announcements */}
        <div 
          ref={announcementRef}
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
          role="status"
        />

        <header className="platforms-header">
          <h1 className="platforms-title">AI Agent Platforms</h1>
          <p className="platforms-description">
            Explore comprehensive information about AI agent platforms, frameworks, and tools. 
            Find the right solution for your specific needs and use cases.
          </p>
        </header>

        <div className="platforms-controls">
          <div className="platform-search-filter">
            <div className="search-section">
              <div className="search-input-container">
                <div className="platform-card-skeleton__title" style={{ height: '3rem', width: '100%' }}></div>
              </div>
            </div>
            <div className="category-filters">
              <div className="category-buttons">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="platform-card-skeleton__badge" style={{ height: '2.5rem', width: '120px' }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <main 
          ref={mainContentRef}
          id="main-content" 
          className="platforms-content"
          role="main"
          aria-label="AI Agent Platforms content"
        >
          {renderPlatformSkeleton()}
        </main>
      </div>
    );
  }

  // Render error state
  if (state.error) {
    const canRetry = state.retryCount < MAX_RETRY_ATTEMPTS;
    
    return (
      <div className={`ai-agent-platforms-container ${className}`}>
        {/* Skip link for keyboard navigation */}
        <a 
          ref={skipLinkRef}
          href="#main-content" 
          className="skip-link"
          onFocus={(e) => e.target.scrollIntoView()}
        >
          Skip to main content
        </a>

        {/* Screen reader announcements */}
        <div 
          ref={announcementRef}
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
          role="status"
        />

        <main 
          ref={mainContentRef}
          id="main-content" 
          className="platforms-content"
          role="main"
          aria-label="AI Agent Platforms content"
        >
          <ErrorMessage
            type="data"
            title="Failed to Load Platforms"
            message={state.error}
            {...(canRetry && { onRetry: handleRetry })}
            isRetrying={state.isLoading}
            actions={[
              {
                label: 'Refresh Page',
                onClick: () => window.location.reload(),
                variant: 'secondary'
              }
            ]}
            {...(process.env.NODE_ENV === 'development' && { 
              details: `Retry count: ${state.retryCount}/${MAX_RETRY_ATTEMPTS}` 
            })}
          />
        </main>
      </div>
    );
  }

  return (
    <div className={`ai-agent-platforms-container ${className}`}>
      {/* Skip link for keyboard navigation */}
      <a 
        ref={skipLinkRef}
        href="#main-content" 
        className="skip-link"
        onFocus={(e) => e.target.scrollIntoView()}
      >
        Skip to main content
      </a>

      {/* Screen reader announcements */}
      <div 
        ref={announcementRef}
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        role="status"
      />

      <header className="platforms-header">
        <h1 className="platforms-title">AI Agent Platforms</h1>
        <p className="platforms-description">
          Explore comprehensive information about AI agent platforms, frameworks, and tools. 
          Find the right solution for your specific needs and use cases.
        </p>
        <div className="platforms-metadata">
          <span className="platform-count" aria-label={`${state.platforms.length} platforms available in total`}>
            {state.platforms.length} platforms available
          </span>
        </div>
      </header>

      {/* Platform vs Tools Explanation */}
      <PlatformVsToolsExplanation />

      <div className="platforms-controls">
        <PlatformSearchFilter
          searchQuery={state.searchQuery}
          onSearchChange={handleSearchChange}
          selectedCategory={state.selectedCategory}
          onCategoryChange={handleCategoryChange}
          availableCategories={availableCategories}
          resultCount={state.filteredPlatforms.length}
          totalCount={state.platforms.length}
        />
      </div>

      <main 
        ref={mainContentRef}
        id="main-content" 
        className="platforms-content"
        role="main"
        aria-label="AI Agent Platforms content"
      >
        {state.filteredPlatforms.length === 0 ? (
          <div className="platforms-empty-state" role="region" aria-label="No results found">
            <div className="empty-state-icon" aria-hidden="true">🔍</div>
            <h2 className="empty-state-title">No platforms found</h2>
            <p className="empty-state-message">
              {state.searchQuery || state.selectedCategory
                ? 'Try adjusting your search criteria or clearing filters to see more results.'
                : 'No platforms are currently available.'}
            </p>
            {(state.searchQuery || state.selectedCategory) && (
              <button
                className="clear-filters-button"
                onClick={() => {
                  handleSearchChange('');
                  handleCategoryChange(undefined);
                  announceToScreenReader('All filters cleared');
                }}
                aria-label="Clear all search and category filters"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div 
            className="platforms-grid"
            role="region"
            aria-label={`${state.filteredPlatforms.length} platform results`}
          >
            {state.filteredPlatforms.map((platform, index) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                onViewDetails={handleViewDetails}
                aria-setsize={state.filteredPlatforms.length}
                aria-posinset={index + 1}
              />
            ))}
          </div>
        )}
      </main>

      {state.selectedPlatform && (
        <PlatformDetailModal
          platform={state.selectedPlatform}
          isOpen={!!state.selectedPlatform}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

// Wrap the component in ErrorBoundary for comprehensive error handling
export const AIAgentPlatformsContainer: React.FC<AIAgentPlatformsContainerProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="ai-agent-platforms-container">
          <ErrorMessage
            type="generic"
            title="Component Error"
            message="The AI Agent Platforms component encountered an unexpected error. Please try refreshing the page."
            actions={[
              {
                label: 'Refresh Page',
                onClick: () => window.location.reload(),
                variant: 'primary'
              }
            ]}
          />
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('AIAgentPlatformsContainer Error:', error, errorInfo);
      }}
    >
      <AIAgentPlatformsContainerInner {...props} />
    </ErrorBoundary>
  );
};

export default AIAgentPlatformsContainer;