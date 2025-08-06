import { AITool, AIToolsData, ToolCategory, isAIToolsData } from '../types';

export class AIToolsDataService {
  private toolsData: AIToolsData | null = null;
  private isLoaded = false;

  /**
   * Load AI tools data from the static JSON file
   */
  async loadTools(): Promise<AITool[]> {
    if (this.isLoaded && this.toolsData) {
      return this.toolsData.tools;
    }

    try {
      // Use process.env.PUBLIC_URL to handle different deployment paths
      const publicUrl = process.env.PUBLIC_URL || '';
      const url = `${publicUrl}/ai-tools.json`;
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('AI tools data file not found. Please check if ai-tools.json exists in the public folder.');
        } else if (response.status >= 500) {
          throw new Error('Server error while loading AI tools data. Please try again later.');
        } else {
          throw new Error(`Failed to load AI tools: ${response.status} ${response.statusText}`);
        }
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid AI tools data format: file contains malformed JSON');
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid AI tools data format: expected JSON object');
      }
      
      // Validate the entire data structure using type guard
      if (!isAIToolsData(data)) {
        throw new Error('Invalid AI tools data format: data structure does not match expected format');
      }

      // Additional validation for tools array
      if (data.tools.length === 0) {
        throw new Error('No AI tools found in data file. Please check the ai-tools data format.');
      }

      this.toolsData = data;
      this.isLoaded = true;
      return this.toolsData.tools;
    } catch (error) {
      console.error('Error loading AI tools:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to load AI tools data. Please check your internet connection.');
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timeout: Loading AI tools data took too long. Please try again.');
      }
      
      throw error;
    }
  }

  /**
   * Get a specific tool by ID
   * @param id The ID of the tool to retrieve
   * @returns The tool or undefined if not found
   */
  getToolById(id: string): AITool | undefined {
    if (!this.toolsData) {
      return undefined;
    }
    return this.toolsData.tools.find(tool => tool.id === id);
  }

  /**
   * Get all loaded tools
   * @returns Array of all tools
   */
  getAllTools(): AITool[] {
    if (!this.toolsData) {
      return [];
    }
    return [...this.toolsData.tools];
  }

  /**
   * Filter tools by category
   * @param category The category to filter by
   * @returns Array of tools in the specified category
   */
  filterByCategory(category: ToolCategory): AITool[] {
    if (!this.toolsData) {
      return [];
    }
    return this.toolsData.tools.filter(tool => tool.category === category);
  }

  /**
   * Search tools by text query across names, descriptions, and use cases
   * @param query The search query
   * @returns Array of tools matching the query
   */
  searchTools(query: string): AITool[] {
    if (!this.toolsData) {
      return [];
    }

    if (!query.trim()) {
      return this.getAllTools();
    }

    const searchQuery = query.toLowerCase().trim();
    
    return this.toolsData.tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery) ||
      tool.description.toLowerCase().includes(searchQuery) ||
      tool.commonUseCases.some(useCase => 
        useCase.toLowerCase().includes(searchQuery)
      ) ||
      tool.userExperiences.some(experience =>
        experience.quote.toLowerCase().includes(searchQuery) ||
        experience.context.toLowerCase().includes(searchQuery) ||
        experience.useCase.toLowerCase().includes(searchQuery)
      ) ||
      (tool.integrations && tool.integrations.some(integration =>
        integration.toLowerCase().includes(searchQuery)
      ))
    );
  }

  /**
   * Get tools sorted alphabetically by name
   * @returns Array of tools sorted by name
   */
  getToolsSorted(): AITool[] {
    if (!this.toolsData) {
      return [];
    }
    return [...this.toolsData.tools].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }

  /**
   * Get all available categories with their metadata
   * @returns Object containing category information
   */
  getCategories(): AIToolsData['categories'] | null {
    return this.toolsData?.categories || null;
  }

  /**
   * Get tools filtered by multiple criteria
   * @param filters Object containing filter criteria
   * @returns Array of tools matching all specified criteria
   */
  filterTools(filters: {
    category?: ToolCategory;
    query?: string;
    hasExperiences?: boolean;
    hasIntegrations?: boolean;
  }): AITool[] {
    if (!this.toolsData) {
      return [];
    }

    let filteredTools = [...this.toolsData.tools];

    // Filter by category
    if (filters.category) {
      filteredTools = filteredTools.filter(tool => tool.category === filters.category);
    }

    // Filter by search query
    if (filters.query && filters.query.trim()) {
      const searchQuery = filters.query.toLowerCase().trim();
      filteredTools = filteredTools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery) ||
        tool.description.toLowerCase().includes(searchQuery) ||
        tool.commonUseCases.some(useCase => 
          useCase.toLowerCase().includes(searchQuery)
        )
      );
    }

    // Filter by presence of user experiences
    if (filters.hasExperiences) {
      filteredTools = filteredTools.filter(tool => 
        tool.userExperiences && tool.userExperiences.length > 0
      );
    }

    // Filter by presence of integrations
    if (filters.hasIntegrations) {
      filteredTools = filteredTools.filter(tool => 
        tool.integrations && tool.integrations.length > 0
      );
    }

    return filteredTools;
  }

  /**
   * Get tools by team adoption level
   * @param level The adoption level to filter by
   * @returns Array of tools with the specified adoption level
   */
  getToolsByAdoptionLevel(level: 'individual' | 'team' | 'organization'): AITool[] {
    if (!this.toolsData) {
      return [];
    }
    return this.toolsData.tools.filter(tool => 
      tool.teamAdoption && tool.teamAdoption.level === level
    );
  }

  /**
   * Get all unique use cases across all tools
   * @returns Array of unique use cases
   */
  getAllUseCases(): string[] {
    if (!this.toolsData) {
      return [];
    }

    const useCases = new Set<string>();
    
    this.toolsData.tools.forEach(tool => {
      tool.commonUseCases.forEach(useCase => {
        useCases.add(useCase);
      });
    });
    
    return Array.from(useCases).sort();
  }

  /**
   * Get all unique integrations across all tools
   * @returns Array of unique integrations
   */
  getAllIntegrations(): string[] {
    if (!this.toolsData) {
      return [];
    }

    const integrations = new Set<string>();
    
    this.toolsData.tools.forEach(tool => {
      if (tool.integrations) {
        tool.integrations.forEach(integration => {
          integrations.add(integration);
        });
      }
    });
    
    return Array.from(integrations).sort();
  }

  /**
   * Check if data is loaded
   * @returns true if data is loaded, false otherwise
   */
  isDataLoaded(): boolean {
    return this.isLoaded && this.toolsData !== null;
  }

  /**
   * Clear cached data (useful for testing or forcing reload)
   */
  clearCache(): void {
    this.toolsData = null;
    this.isLoaded = false;
  }
}

// Export a singleton instance
export const aiToolsDataService = new AIToolsDataService();