import React, { useState, useEffect, useCallback } from 'react';
import { PlatformCategory } from '../types';
import './PlatformSearchFilter.css';

export interface PlatformSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: PlatformCategory | undefined;
  onCategoryChange: (category: PlatformCategory | undefined) => void;
  availableCategories: PlatformCategory[];
  resultCount: number;
  totalCount: number;
}

const CATEGORY_LABELS: Record<PlatformCategory, string> = {
  'open-source-framework': 'Open Source',
  'commercial-platform': 'Commercial',
  'enterprise-solution': 'Enterprise',
  'workflow-automation': 'Workflow',
  'multi-agent-system': 'Multi-Agent',
  'autonomous-agent': 'Autonomous'
};

export const PlatformSearchFilter: React.FC<PlatformSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  availableCategories,
  resultCount,
  totalCount
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounced search implementation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(localSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, onSearchChange]);

  // Update local state when external searchQuery changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(event.target.value);
  }, []);

  const handleCategoryClick = useCallback((category: PlatformCategory) => {
    if (selectedCategory === category) {
      onCategoryChange(undefined);
    } else {
      onCategoryChange(category);
    }
  }, [selectedCategory, onCategoryChange]);

  const handleCategoryKeyDown = useCallback((event: React.KeyboardEvent, category: PlatformCategory) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCategoryClick(category);
    }
  }, [handleCategoryClick]);

  const handleClearFilters = useCallback(() => {
    setLocalSearchQuery('');
    onSearchChange('');
    onCategoryChange(undefined);
  }, [onSearchChange, onCategoryChange]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== undefined;

  return (
    <div className="platform-search-filter" data-testid="search-filter">
      <div className="search-section">
        <div className="search-input-container">
          <label htmlFor="platform-search" className="search-label">
            Search Platforms
          </label>
          <input
            id="platform-search"
            type="text"
            className="search-input"
            placeholder="Search by name, description, or features..."
            value={localSearchQuery}
            onChange={handleSearchInputChange}
            aria-describedby="search-results-count"
            data-testid="search-input"
          />
          <div className="search-icon" aria-hidden="true">
            🔍
          </div>
        </div>
      </div>

      <div className="category-filters">
        <div className="category-filters-header">
          <span className="filter-label">Filter by Category:</span>
        </div>
        <div className="category-buttons" role="group" aria-label="Platform categories" data-testid="category-filters">
          {availableCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
              onKeyDown={(e) => handleCategoryKeyDown(e, category)}
              aria-pressed={selectedCategory === category}
              aria-label={`Filter by ${CATEGORY_LABELS[category]} platforms${selectedCategory === category ? ' (currently selected)' : ''}`}
              data-testid={`category-${category}`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-results">
        <div className="results-info">
          <span id="search-results-count" className="results-count">
            Showing {resultCount} of {totalCount} platforms
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters-button"
              onClick={handleClearFilters}
              aria-label="Clear all search and category filters"
              aria-describedby="search-results-count"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformSearchFilter;