import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AITool, ToolCategory } from '../types';
import { aiToolsDataService } from '../services/AIToolsDataService';
import { AIToolCard } from './AIToolCard';
import { SkeletonLoader } from './SkeletonLoader';
import { ErrorMessage } from './ErrorMessage';
import './AIToolsContainer.css';

interface AIToolsContainerProps {
  className?: string;
}

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  'code-assistant': 'Code Assistant',
  'ide-extension': 'IDE Extension',
  'research-tool': 'Research Tool',
  'debugging-tool': 'Debugging Tool',
  'testing-tool': 'Testing Tool',
  'terminal-tool': 'Terminal Tool'
};

export const AIToolsContainer: React.FC<AIToolsContainerProps> = ({
  className = ''
}) => {
  const [tools, setTools] = useState<AITool[]>([]);
  const [filteredTools, setFilteredTools] = useState<AITool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorType, setErrorType] = useState<'network' | 'data' | 'generic'>('generic');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryFilterRef = useRef<HTMLDivElement>(null);

  // Load AI tools data on mount
  useEffect(() => {
    loadAIToolsData();
  }, []);

  // Filter and search tools when dependencies change
  const processedTools = useMemo(() => {
    let result = tools;

    // Apply search filter
    if (searchQuery.trim()) {
      const searchQueryLower = searchQuery.toLowerCase().trim();
      result = tools.filter(tool => 
        tool.name.toLowerCase().includes(searchQueryLower) ||
        tool.description.toLowerCase().includes(searchQueryLower) ||
        tool.commonUseCases.some(useCase => 
          useCase.toLowerCase().includes(searchQueryLower)
        ) ||
        tool.userExperiences.some(experience =>
          experience.quote.toLowerCase().includes(searchQueryLower) ||
          experience.context.toLowerCase().includes(searchQueryLower) ||
          experience.useCase.toLowerCase().includes(searchQueryLower)
        ) ||
        (tool.integrations && tool.integrations.some(integration =>
          integration.toLowerCase().includes(searchQueryLower)
        ))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(tool => tool.category === selectedCategory);
    }

    // Sort alphabetically by name
    result = result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [tools, searchQuery, selectedCategory]);

  // Update filtered tools when processed tools change
  useEffect(() => {
    setFilteredTools(processedTools);
  }, [processedTools]);

  const loadAIToolsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsRetrying(false);
      
      const loadedTools = await aiToolsDataService.loadTools();
      setTools(loadedTools);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load AI tools data';
      setError(errorMessage);
      
      // Determine error type for better user experience
      if (errorMessage.includes('Network error') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
        setErrorType('network');
      } else if (errorMessage.includes('Invalid AI tools data') || errorMessage.includes('format') || errorMessage.includes('malformed')) {
        setErrorType('data');
      } else {
        setErrorType('generic');
      }
      
      console.error('Error loading AI tools:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await loadAIToolsData();
  };

  const handleCategoryChange = (category: ToolCategory | undefined) => {
    setSelectedCategory(category);
  };

  const handleCategoryFilterKeyDown = (event: React.KeyboardEvent, category: ToolCategory) => {
    const categories: ToolCategory[] = ['code-assistant', 'ide-extension', 'research-tool', 'debugging-tool', 'testing-tool'];
    const currentIndex = categories.indexOf(category);

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % categories.length;
        const nextButton = categoryFilterRef.current?.querySelector(
          `[data-category="${categories[nextIndex]}"]`
        ) as HTMLButtonElement;
        nextButton?.focus();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
        const prevButton = categoryFilterRef.current?.querySelector(
          `[data-category="${categories[prevIndex]}"]`
        ) as HTMLButtonElement;
        prevButton?.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleCategoryChange(category);
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
        // Focus first category filter button
        const firstCategoryButton = categoryFilterRef.current?.querySelector(
          '[data-category="code-assistant"]'
        ) as HTMLButtonElement;
        firstCategoryButton?.focus();
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

  const clearCategoryFilter = () => {
    setSelectedCategory(undefined);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(undefined);
    searchInputRef.current?.focus();
  };

  // Get available categories from loaded tools
  const availableCategories = useMemo(() => {
    const categories = new Set<ToolCategory>();
    tools.forEach(tool => categories.add(tool.category));
    return Array.from(categories).sort();
  }, [tools]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`ai-tools-container ${className}`}>
        <div className="ai-tools-container__header">
          <h1 className="ai-tools-container__title">AI Tools Showcase</h1>
          <p className="ai-tools-container__description">
            Loading AI tools and user experiences...
          </p>
        </div>
        <SkeletonLoader type="ai-tools" count={6} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`ai-tools-container ${className}`}>
        <ErrorMessage
          title="Unable to Load AI Tools"
          message={error}
          type={errorType}
          onRetry={handleRetry}
          isRetrying={isRetrying}
          actions={[
            {
              label: 'Go to Glossary',
              onClick: () => window.location.hash = '#glossary',
              variant: 'secondary'
            }
          ]}
          details={error}
        />
      </div>
    );
  }

  return (
    <div className={`ai-tools-container ${className}`}>
      <div className="ai-tools-container__header">
        <h1 className="ai-tools-container__title">AI Tools Showcase</h1>
        <p className="ai-tools-container__description">
          Discover {tools.length} AI tools being used in our organization with real user experiences and practical insights.
        </p>
      </div>

      <div className="ai-tools-container__controls">
        {/* Search Input */}
        <div className="ai-tools-container__search">
          <label htmlFor="ai-tools-search" className="ai-tools-container__search-label">
            Search tools, descriptions, and use cases
          </label>
          <div className="ai-tools-container__search-wrapper">
            <input
              id="ai-tools-search"
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search AI tools..."
              className="ai-tools-container__search-input"
              aria-describedby="search-help"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="ai-tools-container__clear-search"
                aria-label="Clear search"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
          <div id="search-help" className="ai-tools-container__search-help">
            Use arrow keys to navigate to category filters, Escape to clear search
          </div>
        </div>

        {/* Category Filter */}
        <div className="ai-tools-container__category-filter">
          <fieldset className="ai-tools-container__category-fieldset">
            <legend className="ai-tools-container__category-legend">
              Filter by tool category
            </legend>
            <div 
              className="ai-tools-container__category-buttons"
              ref={categoryFilterRef}
              role="group"
              aria-label="Category filter options"
            >
              <button
                onClick={clearCategoryFilter}
                className={`ai-tools-container__category-button ${!selectedCategory ? 'active' : ''}`}
                aria-pressed={!selectedCategory}
              >
                All Categories
              </button>
              {availableCategories.map((category) => (
                <button
                  key={category}
                  data-category={category}
                  onClick={() => handleCategoryChange(category)}
                  onKeyDown={(e) => handleCategoryFilterKeyDown(e, category)}
                  className={`ai-tools-container__category-button ${selectedCategory === category ? 'active' : ''}`}
                  aria-pressed={selectedCategory === category}
                >
                  {CATEGORY_LABELS[category]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Results Summary */}
      <div className="ai-tools-container__results" aria-live="polite">
        <p className="ai-tools-container__results-text">
          {filteredTools.length === 0 && (searchQuery || selectedCategory) ? (
            <>
              No tools found
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedCategory && ` in ${CATEGORY_LABELS[selectedCategory]}`}
              . Try adjusting your filters.
            </>
          ) : (
            <>
              Showing {filteredTools.length} of {tools.length} tools
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedCategory && ` in ${CATEGORY_LABELS[selectedCategory]}`}
            </>
          )}
        </p>
        {(searchQuery || selectedCategory) && (
          <button 
            onClick={clearAllFilters}
            className="ai-tools-container__clear-filters"
            type="button"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Tools Grid */}
      <div className="ai-tools-container__tools">
        {filteredTools.length === 0 && (searchQuery || selectedCategory) ? (
          <div className="ai-tools-container__no-results">
            <h2>No matching tools found</h2>
            <p>
              Try adjusting your search terms or browse all categories to discover available tools.
            </p>
            <button onClick={clearAllFilters} className="ai-tools-container__clear-button">
              Show All Tools
            </button>
          </div>
        ) : (
          <div className="ai-tools-container__grid">
            {filteredTools.map((tool) => (
              <AIToolCard
                key={tool.id}
                tool={tool}
                className="ai-tools-container__tool-card"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIToolsContainer;