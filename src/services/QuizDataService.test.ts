import { QuizDataService } from './QuizDataService';
import { QuizQuestion } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('QuizDataService', () => {
  let service: QuizDataService;
  const mockQuestions: QuizQuestion[] = [
    {
      id: 'test-1',
      term: 'AI',
      question: 'What is AI?',
      options: ['Option A', 'Option B', 'Option C'],
      correctAnswer: 'Option A',
      glossaryLink: '#ai'
    },
    {
      id: 'test-2',
      term: 'ML',
      question: 'What is ML?',
      options: ['Option X', 'Option Y', 'Option Z'],
      correctAnswer: 'Option Y',
      glossaryLink: '#ml'
    },
    {
      id: 'test-3',
      term: 'DL',
      question: 'What is DL?',
      options: ['Option 1', 'Option 2', 'Option 3'],
      correctAnswer: 'Option 3',
      glossaryLink: '#dl'
    }
  ];

  beforeEach(() => {
    service = new QuizDataService();
    jest.clearAllMocks();
  });

  describe('loadQuestions', () => {
    it('should load questions successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ questions: mockQuestions })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.loadQuestions();

      expect(fetch).toHaveBeenCalledWith('/questions.json');
      expect(result).toEqual(mockQuestions);
    });

    it('should return cached questions on subsequent calls', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ questions: mockQuestions })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await service.loadQuestions();
      const result = await service.loadQuestions();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockQuestions);
    });

    it('should throw error when fetch fails', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadQuestions()).rejects.toThrow('Failed to load questions: 404 Not Found');
    });

    it('should throw error when JSON is invalid', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ invalid: 'data' })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadQuestions()).rejects.toThrow('Invalid questions data format: missing questions array');
    });

    it('should filter out invalid questions', async () => {
      const invalidQuestions = [
        ...mockQuestions,
        { id: 'invalid', term: 'Invalid' }, // Missing required fields
        { id: 'invalid-2', term: 'Invalid2', question: 'Test?', options: [], correctAnswer: 'Wrong', glossaryLink: '#test' } // Empty options
      ];
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ questions: invalidQuestions })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.loadQuestions();

      expect(result).toEqual(mockQuestions);
    });

    it('should throw error when no valid questions found', async () => {
      const invalidQuestions = [
        { id: 'invalid', term: 'Invalid' },
        { invalid: 'data' }
      ];
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ questions: invalidQuestions })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.loadQuestions()).rejects.toThrow('No valid questions found in data file');
    });
  });

  describe('selectRandomQuestions', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ questions: mockQuestions })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadQuestions();
    });

    it('should select requested number of questions', () => {
      const result = service.selectRandomQuestions(2);
      expect(result).toHaveLength(2);
      expect(result.every(q => mockQuestions.includes(q))).toBe(true);
    });

    it('should exclude specified terms', () => {
      const excludeTerms = new Set(['AI', 'ML']);
      const result = service.selectRandomQuestions(2, excludeTerms);
      
      expect(result).toHaveLength(1); // Only DL should be available
      expect(result[0]?.term).toBe('DL');
    });

    it('should return all questions when exclude set is larger than available', () => {
      const excludeTerms = new Set(['AI', 'ML', 'DL']);
      const result = service.selectRandomQuestions(2, excludeTerms);
      
      expect(result).toHaveLength(2); // Should reset and use all questions
    });

    it('should return available questions when requesting more than available', () => {
      const result = service.selectRandomQuestions(10);
      expect(result).toHaveLength(3); // Only 3 questions available
    });

    it('should throw error when questions not loaded', () => {
      const newService = new QuizDataService();
      expect(() => newService.selectRandomQuestions(1)).toThrow('Questions not loaded. Call loadQuestions() first.');
    });
  });

  describe('validateAnswer', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ questions: mockQuestions })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadQuestions();
    });

    it('should return true for correct answer', () => {
      const result = service.validateAnswer('test-1', 'Option A');
      expect(result).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const result = service.validateAnswer('test-1', 'Option B');
      expect(result).toBe(false);
    });

    it('should throw error for non-existent question', () => {
      expect(() => service.validateAnswer('non-existent', 'Answer')).toThrow('Question with ID non-existent not found');
    });
  });

  describe('getQuestionById', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ questions: mockQuestions })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadQuestions();
    });

    it('should return question for valid ID', () => {
      const result = service.getQuestionById('test-1');
      expect(result).toEqual(mockQuestions[0]);
    });

    it('should return undefined for invalid ID', () => {
      const result = service.getQuestionById('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllQuestions', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ questions: mockQuestions })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadQuestions();
    });

    it('should return all questions', () => {
      const result = service.getAllQuestions();
      expect(result).toEqual(mockQuestions);
    });

    it('should return a copy of questions array', () => {
      const result = service.getAllQuestions();
      expect(result).not.toBe(mockQuestions);
      result.push({} as QuizQuestion);
      expect(service.getAllQuestions()).toHaveLength(3);
    });
  });

  describe('getQuestionsByTerm', () => {
    beforeEach(async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ questions: mockQuestions })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      await service.loadQuestions();
    });

    it('should return questions for specific term', () => {
      const result = service.getQuestionsByTerm('AI');
      expect(result).toHaveLength(1);
      expect(result[0]?.term).toBe('AI');
    });

    it('should return empty array for non-existent term', () => {
      const result = service.getQuestionsByTerm('NonExistent');
      expect(result).toHaveLength(0);
    });
  });
});