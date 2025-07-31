/**
 * Unit tests for TypeScript interfaces and type guards
 */

import {
  UserRole,
  GlossaryTerm,
  QuizQuestion,
  QuizAttempt,
  StoredUserData,
  QuizResults,
  isUserRole,
  isGlossaryTerm,
  isQuizQuestion,
  isQuizAttempt,
  isStoredUserData,
  isQuizResults,
} from './index';

describe('Type Guards', () => {
  describe('isUserRole', () => {
    it('should return true for valid user roles', () => {
      expect(isUserRole('business')).toBe(true);
      expect(isUserRole('pm-designer')).toBe(true);
      expect(isUserRole('engineer')).toBe(true);
      expect(isUserRole('data-scientist')).toBe(true);
    });

    it('should return false for invalid user roles', () => {
      expect(isUserRole('invalid-role')).toBe(false);
      expect(isUserRole('')).toBe(false);
      expect(isUserRole(null)).toBe(false);
      expect(isUserRole(undefined)).toBe(false);
      expect(isUserRole(123)).toBe(false);
      expect(isUserRole({})).toBe(false);
      expect(isUserRole([])).toBe(false);
    });
  });

  describe('isGlossaryTerm', () => {
    const validGlossaryTerm: GlossaryTerm = {
      id: 'ai-001',
      term: 'Artificial Intelligence',
      definition: 'Systems that perform tasks normally requiring human intelligence.',
      externalLink: 'https://example.com/ai',
      roleContext: {
        business: 'Business context',
        'pm-designer': 'PM context',
        engineer: 'Engineer context',
        'data-scientist': 'Data scientist context',
      },
    };

    it('should return true for valid glossary terms', () => {
      expect(isGlossaryTerm(validGlossaryTerm)).toBe(true);
    });

    it('should return false for invalid glossary terms', () => {
      expect(isGlossaryTerm(null)).toBe(false);
      expect(isGlossaryTerm(undefined)).toBe(false);
      expect(isGlossaryTerm({})).toBe(false);
      expect(isGlossaryTerm('string')).toBe(false);
      expect(isGlossaryTerm(123)).toBe(false);
    });

    it('should return false when required fields are missing', () => {
      const { id, ...withoutId } = validGlossaryTerm;
      expect(isGlossaryTerm(withoutId)).toBe(false);

      const { term, ...withoutTerm } = validGlossaryTerm;
      expect(isGlossaryTerm(withoutTerm)).toBe(false);

      const { definition, ...withoutDefinition } = validGlossaryTerm;
      expect(isGlossaryTerm(withoutDefinition)).toBe(false);

      const { externalLink, ...withoutExternalLink } = validGlossaryTerm;
      expect(isGlossaryTerm(withoutExternalLink)).toBe(false);

      const { roleContext, ...withoutRoleContext } = validGlossaryTerm;
      expect(isGlossaryTerm(withoutRoleContext)).toBe(false);
    });

    it('should return false when roleContext is invalid', () => {
      const invalidRoleContext = {
        ...validGlossaryTerm,
        roleContext: {
          business: 'Business context',
          // Missing other required roles
        },
      };
      expect(isGlossaryTerm(invalidRoleContext)).toBe(false);

      const nonStringRoleContext = {
        ...validGlossaryTerm,
        roleContext: {
          business: 123, // Should be string
          'pm-designer': 'PM context',
          engineer: 'Engineer context',
          'data-scientist': 'Data scientist context',
        },
      };
      expect(isGlossaryTerm(nonStringRoleContext)).toBe(false);
    });
  });

  describe('isQuizQuestion', () => {
    const validQuizQuestion: QuizQuestion = {
      id: 'q-001',
      term: 'AI',
      question: 'What does AI stand for?',
      options: ['Artificial Intelligence', 'Automated Intelligence', 'Advanced Intelligence'],
      correctAnswer: 'Artificial Intelligence',
      glossaryLink: '#ai',
    };

    it('should return true for valid quiz questions', () => {
      expect(isQuizQuestion(validQuizQuestion)).toBe(true);
    });

    it('should return false for invalid quiz questions', () => {
      expect(isQuizQuestion(null)).toBe(false);
      expect(isQuizQuestion(undefined)).toBe(false);
      expect(isQuizQuestion({})).toBe(false);
      expect(isQuizQuestion('string')).toBe(false);
    });

    it('should return false when required fields are missing', () => {
      const { id, ...withoutId } = validQuizQuestion;
      expect(isQuizQuestion(withoutId)).toBe(false);

      const { options, ...withoutOptions } = validQuizQuestion;
      expect(isQuizQuestion(withoutOptions)).toBe(false);
    });

    it('should return false when options array is invalid', () => {
      const tooFewOptions = {
        ...validQuizQuestion,
        options: ['Only one option'],
      };
      expect(isQuizQuestion(tooFewOptions)).toBe(false);

      const nonStringOptions = {
        ...validQuizQuestion,
        options: ['Valid option', 123, 'Another valid option'],
      };
      expect(isQuizQuestion(nonStringOptions)).toBe(false);

      const notAnArray = {
        ...validQuizQuestion,
        options: 'not an array',
      };
      expect(isQuizQuestion(notAnArray)).toBe(false);
    });

    it('should return false when correctAnswer is not in options', () => {
      const invalidCorrectAnswer = {
        ...validQuizQuestion,
        correctAnswer: 'Not in options',
      };
      expect(isQuizQuestion(invalidCorrectAnswer)).toBe(false);
    });
  });

  describe('isQuizAttempt', () => {
    const validQuizAttempt: QuizAttempt = {
      timestamp: Date.now(),
      score: 2,
      totalQuestions: 3,
      questionsAnswered: ['q1', 'q2', 'q3'],
    };

    it('should return true for valid quiz attempts', () => {
      expect(isQuizAttempt(validQuizAttempt)).toBe(true);
    });

    it('should return false for invalid quiz attempts', () => {
      expect(isQuizAttempt(null)).toBe(false);
      expect(isQuizAttempt(undefined)).toBe(false);
      expect(isQuizAttempt({})).toBe(false);
      expect(isQuizAttempt('string')).toBe(false);
    });

    it('should return false for invalid field values', () => {
      const negativeScore = {
        ...validQuizAttempt,
        score: -1,
      };
      expect(isQuizAttempt(negativeScore)).toBe(false);

      const zeroQuestions = {
        ...validQuizAttempt,
        totalQuestions: 0,
      };
      expect(isQuizAttempt(zeroQuestions)).toBe(false);

      const invalidTimestamp = {
        ...validQuizAttempt,
        timestamp: 0,
      };
      expect(isQuizAttempt(invalidTimestamp)).toBe(false);

      const nonArrayQuestions = {
        ...validQuizAttempt,
        questionsAnswered: 'not an array',
      };
      expect(isQuizAttempt(nonArrayQuestions)).toBe(false);

      const nonStringQuestions = {
        ...validQuizAttempt,
        questionsAnswered: ['q1', 123, 'q3'],
      };
      expect(isQuizAttempt(nonStringQuestions)).toBe(false);
    });
  });

  describe('isStoredUserData', () => {
    const validStoredUserData: StoredUserData = {
      version: '1.0.0',
      visitCount: 5,
      quizHistory: [
        {
          timestamp: Date.now(),
          score: 2,
          totalQuestions: 3,
          questionsAnswered: ['q1', 'q2', 'q3'],
        },
      ],
      answeredTerms: ['term1', 'term2'],
      preferences: {
        selectedRole: 'business',
        theme: 'light',
      },
    };

    it('should return true for valid stored user data', () => {
      expect(isStoredUserData(validStoredUserData)).toBe(true);
    });

    it('should return true for valid data with optional preferences', () => {
      const minimalPreferences = {
        ...validStoredUserData,
        preferences: {},
      };
      expect(isStoredUserData(minimalPreferences)).toBe(true);
    });

    it('should return false for invalid stored user data', () => {
      expect(isStoredUserData(null)).toBe(false);
      expect(isStoredUserData(undefined)).toBe(false);
      expect(isStoredUserData({})).toBe(false);
      expect(isStoredUserData('string')).toBe(false);
    });

    it('should return false when required fields are invalid', () => {
      const invalidVersion = {
        ...validStoredUserData,
        version: 123,
      };
      expect(isStoredUserData(invalidVersion)).toBe(false);

      const negativeVisitCount = {
        ...validStoredUserData,
        visitCount: -1,
      };
      expect(isStoredUserData(negativeVisitCount)).toBe(false);

      const invalidQuizHistory = {
        ...validStoredUserData,
        quizHistory: [{ invalid: 'attempt' }],
      };
      expect(isStoredUserData(invalidQuizHistory)).toBe(false);

      const invalidAnsweredTerms = {
        ...validStoredUserData,
        answeredTerms: [123, 'term2'],
      };
      expect(isStoredUserData(invalidAnsweredTerms)).toBe(false);
    });

    it('should return false when preferences are invalid', () => {
      const invalidRole = {
        ...validStoredUserData,
        preferences: {
          selectedRole: 'invalid-role',
        },
      };
      expect(isStoredUserData(invalidRole)).toBe(false);

      const invalidTheme = {
        ...validStoredUserData,
        preferences: {
          theme: 'invalid-theme',
        },
      };
      expect(isStoredUserData(invalidTheme)).toBe(false);
    });
  });

  describe('isQuizResults', () => {
    const validQuizResults: QuizResults = {
      score: 2,
      totalQuestions: 3,
      questionsAnswered: ['q1', 'q2', 'q3'],
      timestamp: Date.now(),
    };

    it('should return true for valid quiz results', () => {
      expect(isQuizResults(validQuizResults)).toBe(true);
    });

    it('should return false for invalid quiz results', () => {
      expect(isQuizResults(null)).toBe(false);
      expect(isQuizResults(undefined)).toBe(false);
      expect(isQuizResults({})).toBe(false);
      expect(isQuizResults('string')).toBe(false);
    });

    it('should return false for invalid field values', () => {
      const negativeScore = {
        ...validQuizResults,
        score: -1,
      };
      expect(isQuizResults(negativeScore)).toBe(false);

      const zeroQuestions = {
        ...validQuizResults,
        totalQuestions: 0,
      };
      expect(isQuizResults(zeroQuestions)).toBe(false);

      const invalidTimestamp = {
        ...validQuizResults,
        timestamp: 0,
      };
      expect(isQuizResults(invalidTimestamp)).toBe(false);

      const nonStringQuestions = {
        ...validQuizResults,
        questionsAnswered: ['q1', 123, 'q3'],
      };
      expect(isQuizResults(nonStringQuestions)).toBe(false);
    });
  });
});