import { AgentPlatform, AgentPlatformsData, PlatformCategory } from '../types';

/**
 * Service for loading and managing AI Agent Platform data
 */
export class AgentPlatformsDataService {
  private static readonly DATA_URL = process.env.NODE_ENV === 'development' 
    ? '/agent-platforms.json' 
    : `${process.env.PUBLIC_URL || ''}/agent-platforms.json`;
  private static cachedData: AgentPlatform[] | null = null;
  private static readonly CACHE_KEY = 'agent-platforms-cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private static readonly CACHE_VERSION = '1.0'; // Version for cache invalidation

  /**
   * Load platforms data from JSON file with caching
   */
  static async loadPlatforms(): Promise<AgentPlatform[]> {
    // Check cache first
    const cachedResult = this.getCachedData();
    if (cachedResult) {
      this.cachedData = cachedResult;
      return cachedResult;
    }

    // Try multiple URLs in case of path issues
    const urlsToTry = [
      this.DATA_URL,
      '/agent-platforms.json',
      `${process.env.PUBLIC_URL || ''}/agent-platforms.json`,
      './agent-platforms.json'
    ].filter((url, index, arr) => arr.indexOf(url) === index); // Remove duplicates

    let lastError: Error | null = null;

    for (const url of urlsToTry) {
      try {
        console.log(`Attempting to fetch from: ${url}`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch platforms data: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Check if we got HTML instead of JSON
          const text = await response.text();
          if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            throw new Error('Received HTML instead of JSON - likely a routing issue');
          }
          // Try to parse as JSON anyway
          const rawData = JSON.parse(text);
          const validatedData = this.validatePlatformData(rawData);
          
          // Cache the validated data
          this.setCachedData(validatedData.platforms);
          this.cachedData = validatedData.platforms;
          
          return validatedData.platforms;
        }

        const rawData = await response.json();
        const validatedData = this.validatePlatformData(rawData);
        
        // Cache the validated data
        this.setCachedData(validatedData.platforms);
        this.cachedData = validatedData.platforms;
        
        console.log(`Successfully loaded data from: ${url}`);
        return validatedData.platforms;
      } catch (error) {
        console.warn(`Failed to load from ${url}:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    // Try to return cached data as fallback
    const fallbackData = this.getCachedData();
    if (fallbackData) {
      console.warn('Using cached data as fallback');
      return fallbackData;
    }
    
    throw new Error(`Unable to load platforms data from any URL. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Validate the structure of platform data
   */
  static validatePlatformData(data: unknown): AgentPlatformsData {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format: expected object');
    }

    const typedData = data as Record<string, unknown>;

    if (!Array.isArray(typedData.platforms)) {
      throw new Error('Invalid data format: platforms must be an array');
    }

    if (!typedData.categories || typeof typedData.categories !== 'object') {
      throw new Error('Invalid data format: categories must be an object');
    }

    if (!typedData.metadata || typeof typedData.metadata !== 'object') {
      throw new Error('Invalid data format: metadata must be an object');
    }

    // Validate each platform
    const platforms = typedData.platforms.map((platform, index) => {
      try {
        return this.validatePlatform(platform);
      } catch (error) {
        throw new Error(`Invalid platform at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    return {
      platforms,
      categories: typedData.categories as AgentPlatformsData['categories'],
      metadata: typedData.metadata as AgentPlatformsData['metadata']
    };
  }

  /**
   * Validate individual platform object
   */
  private static validatePlatform(platform: unknown): AgentPlatform {
    if (!platform || typeof platform !== 'object') {
      throw new Error('Platform must be an object');
    }

    const p = platform as Record<string, unknown>;

    // Required fields
    if (typeof p.id !== 'string' || !p.id.trim()) {
      throw new Error('Platform id is required and must be a non-empty string');
    }

    if (typeof p.name !== 'string' || !p.name.trim()) {
      throw new Error('Platform name is required and must be a non-empty string');
    }

    if (typeof p.category !== 'string') {
      throw new Error('Platform category is required and must be a string');
    }

    if (typeof p.type !== 'string') {
      throw new Error('Platform type is required and must be a string');
    }

    if (typeof p.description !== 'string') {
      throw new Error('Platform description is required and must be a string');
    }

    if (typeof p.detailedDescription !== 'string') {
      throw new Error('Platform detailedDescription is required and must be a string');
    }

    // Array fields
    if (!Array.isArray(p.strengths)) {
      throw new Error('Platform strengths must be an array');
    }

    if (!Array.isArray(p.weaknesses)) {
      throw new Error('Platform weaknesses must be an array');
    }

    if (!Array.isArray(p.primaryUseCases)) {
      throw new Error('Platform primaryUseCases must be an array');
    }

    if (!Array.isArray(p.keyFeatures)) {
      throw new Error('Platform keyFeatures must be an array');
    }

    if (!Array.isArray(p.targetAudience)) {
      throw new Error('Platform targetAudience must be an array');
    }

    return p as unknown as AgentPlatform;
  }

  /**
   * Search platforms by query string with result limiting
   */
  static searchPlatforms(platforms: AgentPlatform[], query: string, limit?: number): AgentPlatform[] {
    if (!query.trim()) {
      return platforms;
    }

    const searchTerm = query.toLowerCase().trim();
    
    const results = platforms.filter(platform => {
      // Search in name, description, and key features
      const searchableText = [
        platform.name,
        platform.description,
        platform.detailedDescription,
        ...platform.keyFeatures,
        ...platform.primaryUseCases,
        ...platform.strengths,
        ...platform.targetAudience
      ].join(' ').toLowerCase();

      return searchableText.includes(searchTerm);
    });

    // Limit results if specified (default to 50 for performance)
    return limit ? results.slice(0, limit) : results.slice(0, 50);
  }

  /**
   * Filter platforms by category
   */
  static filterByCategory(platforms: AgentPlatform[], category: PlatformCategory): AgentPlatform[] {
    return platforms.filter(platform => platform.category === category);
  }

  /**
   * Filter platforms by type
   */
  static filterByType(platforms: AgentPlatform[], type: 'open-source' | 'commercial' | 'enterprise'): AgentPlatform[] {
    return platforms.filter(platform => platform.type === type);
  }

  /**
   * Filter platforms by maturity level
   */
  static filterByMaturity(platforms: AgentPlatform[], maturity: 'experimental' | 'beta' | 'stable' | 'enterprise'): AgentPlatform[] {
    return platforms.filter(platform => platform.maturityLevel === maturity);
  }

  /**
   * Get unique categories from platforms
   */
  static getUniqueCategories(platforms: AgentPlatform[]): PlatformCategory[] {
    const categories = new Set(platforms.map(p => p.category));
    return Array.from(categories);
  }

  /**
   * Get platforms by multiple filters with result limiting
   */
  static getFilteredPlatforms(
    platforms: AgentPlatform[],
    filters: {
      query?: string;
      category?: PlatformCategory;
      type?: 'open-source' | 'commercial' | 'enterprise';
      maturity?: 'experimental' | 'beta' | 'stable' | 'enterprise';
      limit?: number;
    }
  ): AgentPlatform[] {
    let filtered = platforms;

    // Apply category filter first (most selective)
    if (filters.category) {
      filtered = this.filterByCategory(filtered, filters.category);
    }

    if (filters.type) {
      filtered = this.filterByType(filtered, filters.type);
    }

    if (filters.maturity) {
      filtered = this.filterByMaturity(filtered, filters.maturity);
    }

    // Apply search last with limiting
    if (filters.query) {
      filtered = this.searchPlatforms(filtered, filters.query, filters.limit);
    } else if (filters.limit) {
      // Apply limit even without search
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  /**
   * Cache data in localStorage with versioning and compression
   */
  private static setCachedData(platforms: AgentPlatform[]): void {
    try {
      const cacheData = {
        platforms,
        timestamp: Date.now(),
        version: this.CACHE_VERSION,
        count: platforms.length
      };
      
      const serialized = JSON.stringify(cacheData);
      
      // Check if data fits in localStorage (approximate 5MB limit)
      if (serialized.length > 5 * 1024 * 1024) {
        console.warn('Platform data too large for localStorage cache');
        return;
      }
      
      localStorage.setItem(this.CACHE_KEY, serialized);
      console.log(`Cached ${platforms.length} platforms (${(serialized.length / 1024).toFixed(1)}KB)`);
    } catch (error) {
      console.warn('Failed to cache platforms data:', error);
      // Clear cache if storage is full
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearCache();
      }
    }
  }

  /**
   * Get cached data from localStorage with version checking
   */
  private static getCachedData(): AgentPlatform[] | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      
      // Check cache version
      if (cacheData.version !== this.CACHE_VERSION) {
        console.log('Cache version mismatch, clearing cache');
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }
      
      // Check expiration
      const isExpired = Date.now() - cacheData.timestamp > this.CACHE_DURATION;
      if (isExpired) {
        console.log('Cache expired, clearing cache');
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }

      // Validate cached data structure
      if (!Array.isArray(cacheData.platforms) || cacheData.platforms.length === 0) {
        console.warn('Invalid cached data structure');
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }

      console.log(`Using cached data: ${cacheData.count} platforms`);
      return cacheData.platforms;
    } catch (error) {
      console.warn('Failed to retrieve cached platforms data:', error);
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    }
  }

  /**
   * Clear cached data
   */
  static clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    this.cachedData = null;
  }

  /**
   * Get platform by ID
   */
  static async getPlatformById(id: string): Promise<AgentPlatform | null> {
    const platforms = await this.loadPlatforms();
    return platforms.find(platform => platform.id === id) || null;
  }
}