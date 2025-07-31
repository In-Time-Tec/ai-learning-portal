import { GlossaryDataService } from './GlossaryDataService';
import { GlossaryTerm, UserRole } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('GlossaryDataService', () => {
  let service: GlossaryDataService;
  const mockTerms: GlossaryTerm[] = [
    {
      id: 'ai',
      term: 'Artificial Intelligence',
      definition: 'Systems that perform tasks normally requiring human intelligence.',
      externalLink: 'https://example.com/ai',
      roleContext: {
        business: 'Understand automation potential',
        'pm-designer': 'Scope AI features',
        engineer: 'Implement AI integrations',
        'data-scientist': 'Concept context'
      }
    },
    {
      id: 'ml',
      term: 'Machine Learning',
      definition: 'A subset of AI where models learn patterns from data.',
      externalLink: 'https://example.com/ml',
      roleContext: {
        business: 'Recognize data-driven insights',
        'pm-designer': 'Understand ML capabilities',
        engineer: 'Integrate ML APIs',
        'data-scientist': 'Model-building foundation'
      }
    },
    {
      id: 'dataset',
      term: 'Dataset',
      definition: 'A collection of structured or unstructured data.',
      externalLink: 'https://example.com/dataset',
      roleContext: {
        business: 'Supply domain data contexts',
        'pm-designer': 'Understand data requirements',
        engineer: 'Manage data pipelines',
        'data-scientist': 'Prepare and clean data'
      }
    }
  ];

  beforeEach(() => {
    service = new GlossaryDataService();
    jest.clearAllMocks();
  });

  describe('loadGlossary', () => {
    it('should load glossary terms successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ terms: mockTerms })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.loadGlossary();

      expect(fetch).toHaveBeenCalledWith('/glossary.json');
      expect(result).toEqual(mockTerms);
    });

    it('should return cached terms on subsequent calls', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ terms: mockTerms })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await service.loadGlossary();
      const result = await service.loadGlossary();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTerms);
    });

    it('should throw error when fetch fails', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadGlossary()).rejects.toThrow('Failed to load glossary: 404 Not Found');
    });

    it('should throw error when JSON is invalid', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ invalid: 'data' })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadGlossary()).rejects.toThrow('Invalid glossary data format: missing terms array');
    });

    it('should filter out invalid terms', async () => {
      const invalidTerms = [
        ...mockTerms,
        { id: 'invalid', term: 'Invalid' }, // Missing required fields
        { 
          id: 'invalid-2', 
          term: 'Invalid2', 
          definition: 'Test', 
          externalLink: 'http://test.com',
          roleContext: { business: 'test' } // Missing required roles
        }
      ];
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ terms: invalidTerms })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.loadGlossary();

      expect(result).toEqual(mockTerms);
    });

    it('should throw error when no valid terms found', async () => {
      const invalidTerms = [
        { id: 'invalid', term: 'Invalid' },
        { invalid: 'data' }
      ];
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ terms: invalidTerms })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadGlossary()).rejects.toThrow('No valid terms found in data file');
    });
  });

  describe('getTermById', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ terms: mockTerms })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadGlossary();
    });

    it('should return term for valid ID', () => {
      const result = service.getTermById('ai');
      expect(result).toEqual(mockTerms[0]);
    });

    it('should return undefined for invalid ID', () => {
      const result = service.getTermById('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllTerms', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ terms: mockTerms })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadGlossary();
    });

    it('should return all terms', () => {
      const result = service.getAllTerms();
      expect(result).toEqual(mockTerms);
    });

    it('should return a copy of terms array', () => {
      const result = service.getAllTerms();
      expect(result).not.toBe(mockTerms);
      result.push({} as GlossaryTerm);
      expect(service.getAllTerms()).toHaveLength(3);
    });
  });

  describe('filterByRole', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ terms: mockTerms })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadGlossary();
    });

    it('should return all terms for business role', () => {
      const result = service.filterByRole('business');
      expect(result).toHaveLength(3);
      expect(result.every(term => term.roleContext.business)).toBe(true);
    });

    it('should return all terms for engineer role', () => {
      const result = service.filterByRole('engineer');
      expect(result).toHaveLength(3);
      expect(result.every(term => term.roleContext.engineer)).toBe(true);
    });

    it('should handle terms without role context', async () => {
      const termsWithMissingContext = [
        ...mockTerms,
        {
          id: 'incomplete',
          term: 'Incomplete Term',
          definition: 'Test definition',
          externalLink: 'http://test.com',
          roleContext: {
            business: 'test',
            'pm-designer': 'test',
            engineer: 'test'
            // Missing data-scientist role
          }
        } as any
      ];

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ terms: termsWithMissingContext })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const newService = new GlossaryDataService();
      await newService.loadGlossary();

      const result = newService.filterByRole('data-scientist');
      expect(result).toHaveLength(3); // Should only return terms with data-scientist context
    });
  });

  describe('searchTerms', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ terms: mockTerms })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadGlossary();
    });

    it('should return all terms for empty query', () => {
      const result = service.searchTerms('');
      expect(result).toEqual(mockTerms);
    });

    it('should return all terms for whitespace query', () => {
      const result = service.searchTerms('   ');
      expect(result).toEqual(mockTerms);
    });

    it('should search by term name', () => {
      const result = service.searchTerms('Machine');
      expect(result).toHaveLength(1);
      expect(result[0]?.term).toBe('Machine Learning');
    });

    it('should search by definition', () => {
      const result = service.searchTerms('intelligence');
      expect(result).toHaveLength(1);
      expect(result[0]?.term).toBe('Artificial Intelligence');
    });

    it('should search by role context', () => {
      const result = service.searchTerms('automation');
      expect(result).toHaveLength(1);
      expect(result[0]?.term).toBe('Artificial Intelligence');
    });

    it('should be case insensitive', () => {
      const result = service.searchTerms('MACHINE');
      expect(result).toHaveLength(1);
      expect(result[0]?.term).toBe('Machine Learning');
    });

    it('should return empty array for no matches', () => {
      const result = service.searchTerms('nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('getTermsSorted', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ terms: mockTerms })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadGlossary();
    });

    it('should return terms sorted alphabetically', () => {
      const result = service.getTermsSorted();
      expect(result).toHaveLength(3);
      expect(result[0]?.term).toBe('Artificial Intelligence');
      expect(result[1]?.term).toBe('Dataset');
      expect(result[2]?.term).toBe('Machine Learning');
    });

    it('should not modify original terms array', () => {
      const originalOrder = service.getAllTerms();
      service.getTermsSorted();
      const afterSort = service.getAllTerms();
      expect(afterSort).toEqual(originalOrder);
    });
  });

  describe('getRoleContext', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ terms: mockTerms })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadGlossary();
    });

    it('should return role context for valid term and role', () => {
      const result = service.getRoleContext('ai', 'business');
      expect(result).toBe('Understand automation potential');
    });

    it('should return undefined for invalid term', () => {
      const result = service.getRoleContext('invalid', 'business');
      expect(result).toBeUndefined();
    });

    it('should return undefined for invalid role', () => {
      const result = service.getRoleContext('ai', 'invalid' as UserRole);
      expect(result).toBeUndefined();
    });
  });

  describe('getAvailableRoles', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ terms: mockTerms })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadGlossary();
    });

    it('should return all available roles', () => {
      const result = service.getAvailableRoles();
      expect(result).toHaveLength(4);
      expect(result).toContain('business');
      expect(result).toContain('pm-designer');
      expect(result).toContain('engineer');
      expect(result).toContain('data-scientist');
    });
  });
});