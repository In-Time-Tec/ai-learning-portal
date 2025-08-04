import { GlossaryTerm, UserRole } from '../types';

export class GlossaryDataService {
  private terms: GlossaryTerm[] = [];
  private isLoaded = false;

  /**
   * Load glossary terms from the static JSON file
   */
  async loadGlossary(): Promise<GlossaryTerm[]> {
    if (this.isLoaded) {
      return this.terms;
    }

    try {
      // Use process.env.PUBLIC_URL to handle different deployment paths
      const publicUrl = process.env.PUBLIC_URL || '';
      const response = await fetch(`${publicUrl}/glossary.json`);
      if (!response.ok) {
        throw new Error(`Failed to load glossary: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.terms || !Array.isArray(data.terms)) {
        throw new Error('Invalid glossary data format: missing terms array');
      }

      // Validate each term has required fields
      const validTerms = data.terms.filter((term: any) => 
        this.isValidTerm(term)
      );

      if (validTerms.length === 0) {
        throw new Error('No valid terms found in data file');
      }

      this.terms = validTerms;
      this.isLoaded = true;
      return this.terms;
    } catch (error) {
      console.error('Error loading glossary terms:', error);
      throw error;
    }
  }

  /**
   * Get a specific term by ID
   * @param id The ID of the term to retrieve
   * @returns The term or undefined if not found
   */
  getTermById(id: string): GlossaryTerm | undefined {
    return this.terms.find(term => term.id === id);
  }

  /**
   * Get all loaded terms
   * @returns Array of all terms
   */
  getAllTerms(): GlossaryTerm[] {
    return [...this.terms];
  }

  /**
   * Filter terms by user role (returns all terms with role context)
   * @param role The user role to filter by
   * @returns Array of terms with role-specific context
   */
  filterByRole(role: UserRole): GlossaryTerm[] {
    // All terms should have context for all roles, so we return all terms
    // but this method can be used to highlight role-specific context
    return this.terms.filter(term => 
      term.roleContext && term.roleContext[role]
    );
  }

  /**
   * Search terms by text query
   * @param query The search query
   * @returns Array of terms matching the query
   */
  searchTerms(query: string): GlossaryTerm[] {
    if (!query.trim()) {
      return this.getAllTerms();
    }

    const searchQuery = query.toLowerCase().trim();
    
    return this.terms.filter(term => 
      term.term.toLowerCase().includes(searchQuery) ||
      term.definition.toLowerCase().includes(searchQuery) ||
      Object.values(term.roleContext).some(context => 
        context.toLowerCase().includes(searchQuery)
      )
    );
  }

  /**
   * Get terms sorted alphabetically
   * @returns Array of terms sorted by term name
   */
  getTermsSorted(): GlossaryTerm[] {
    return [...this.terms].sort((a, b) => 
      a.term.localeCompare(b.term)
    );
  }

  /**
   * Get role-specific context for a term
   * @param termId The ID of the term
   * @param role The user role
   * @returns Role-specific context or undefined if not found
   */
  getRoleContext(termId: string, role: UserRole): string | undefined {
    const term = this.getTermById(termId);
    return term?.roleContext[role];
  }

  /**
   * Get all available user roles that have context
   * @returns Array of user roles
   */
  getAvailableRoles(): UserRole[] {
    const roles = new Set<UserRole>();
    
    this.terms.forEach(term => {
      Object.keys(term.roleContext).forEach(role => {
        roles.add(role as UserRole);
      });
    });
    
    return Array.from(roles);
  }

  /**
   * Validate if a term object has all required fields
   * @param term The term object to validate
   * @returns true if valid, false otherwise
   */
  private isValidTerm(term: any): boolean {
    const requiredRoles: UserRole[] = ['business', 'pm-designer', 'engineer', 'data-scientist'];
    
    return (
      typeof term.id === 'string' &&
      typeof term.term === 'string' &&
      typeof term.definition === 'string' &&
      typeof term.externalLink === 'string' &&
      term.roleContext &&
      typeof term.roleContext === 'object' &&
      requiredRoles.every(role => 
        typeof term.roleContext[role] === 'string' &&
        term.roleContext[role].length > 0
      )
    );
  }
}

// Export a singleton instance
export const glossaryDataService = new GlossaryDataService();