/**
 * Core TypeScript interfaces and types for the Interactive AI Glossary
 */

/**
 * User roles for role-specific context display
 */
export type UserRole = 'business' | 'pm-designer' | 'engineer' | 'data-scientist';

/**
 * Represents a glossary term with role-specific context
 */
export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  externalLink: string;
  roleContext: {
    [key in UserRole]: string;
  };
}

/**
 * Represents a quiz question with multiple choice options
 */
export interface QuizQuestion {
  id: string;
  term: string;
  question: string;
  options: string[];
  correctAnswer: string;
  glossaryLink: string;
}

/**
 * Represents a completed quiz attempt
 */
export interface QuizAttempt {
  timestamp: number;
  score: number;
  totalQuestions: number;
  questionsAnswered: string[];
}

/**
 * Represents user progress and statistics
 */
export interface UserProgress {
  visitCount: number;
  quizAttempts: QuizAttempt[];
  answeredTerms: Set<string>;
  bestScore: number;
}

/**
 * LocalStorage data structure with versioning
 */
export interface StoredUserData {
  version: string;
  visitCount: number;
  quizHistory: QuizAttempt[];
  answeredTerms: string[];
  preferences: {
    selectedRole?: UserRole;
    theme?: 'light' | 'dark';
  };
}

/**
 * Quiz results after completion
 */
export interface QuizResults {
  score: number;
  totalQuestions: number;
  questionsAnswered: string[];
  timestamp: number;
}
/**
 *
 Type guards for runtime data validation
 */

/**
 * Type guard to check if a value is a valid UserRole
 */
export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && 
    ['business', 'pm-designer', 'engineer', 'data-scientist'].includes(value);
}

/**
 * Type guard to check if an object is a valid GlossaryTerm
 */
export function isGlossaryTerm(obj: unknown): obj is GlossaryTerm {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const term = obj as Record<string, unknown>;
  
  return (
    typeof term.id === 'string' &&
    typeof term.term === 'string' &&
    typeof term.definition === 'string' &&
    typeof term.externalLink === 'string' &&
    typeof term.roleContext === 'object' &&
    term.roleContext !== null &&
    isValidRoleContext(term.roleContext)
  );
}

/**
 * Helper function to validate role context object
 */
function isValidRoleContext(obj: unknown): obj is { [key in UserRole]: string } {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const roleContext = obj as Record<string, unknown>;
  const requiredRoles: UserRole[] = ['business', 'pm-designer', 'engineer', 'data-scientist'];
  
  return requiredRoles.every(role => 
    typeof roleContext[role] === 'string'
  );
}

/**
 * Type guard to check if an object is a valid QuizQuestion
 */
export function isQuizQuestion(obj: unknown): obj is QuizQuestion {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const question = obj as Record<string, unknown>;
  
  return (
    typeof question.id === 'string' &&
    typeof question.term === 'string' &&
    typeof question.question === 'string' &&
    Array.isArray(question.options) &&
    question.options.every(option => typeof option === 'string') &&
    question.options.length >= 2 &&
    typeof question.correctAnswer === 'string' &&
    question.options.includes(question.correctAnswer) &&
    typeof question.glossaryLink === 'string'
  );
}

/**
 * Type guard to check if an object is a valid QuizAttempt
 */
export function isQuizAttempt(obj: unknown): obj is QuizAttempt {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const attempt = obj as Record<string, unknown>;
  
  return (
    typeof attempt.timestamp === 'number' &&
    attempt.timestamp > 0 &&
    typeof attempt.score === 'number' &&
    attempt.score >= 0 &&
    typeof attempt.totalQuestions === 'number' &&
    attempt.totalQuestions > 0 &&
    Array.isArray(attempt.questionsAnswered) &&
    attempt.questionsAnswered.every(q => typeof q === 'string')
  );
}

/**
 * Type guard to check if an object is a valid StoredUserData
 */
export function isStoredUserData(obj: unknown): obj is StoredUserData {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const data = obj as Record<string, unknown>;
  
  return (
    typeof data.version === 'string' &&
    typeof data.visitCount === 'number' &&
    data.visitCount >= 0 &&
    Array.isArray(data.quizHistory) &&
    data.quizHistory.every(attempt => isQuizAttempt(attempt)) &&
    Array.isArray(data.answeredTerms) &&
    data.answeredTerms.every(term => typeof term === 'string') &&
    typeof data.preferences === 'object' &&
    data.preferences !== null &&
    isValidPreferences(data.preferences)
  );
}

/**
 * Helper function to validate preferences object
 */
function isValidPreferences(obj: unknown): obj is StoredUserData['preferences'] {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const prefs = obj as Record<string, unknown>;
  
  return (
    (prefs.selectedRole === undefined || isUserRole(prefs.selectedRole)) &&
    (prefs.theme === undefined || prefs.theme === 'light' || prefs.theme === 'dark')
  );
}

/**
 * Type guard to check if an object is a valid QuizResults
 */
export function isQuizResults(obj: unknown): obj is QuizResults {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const results = obj as Record<string, unknown>;
  
  return (
    typeof results.score === 'number' &&
    results.score >= 0 &&
    typeof results.totalQuestions === 'number' &&
    results.totalQuestions > 0 &&
    Array.isArray(results.questionsAnswered) &&
    results.questionsAnswered.every(q => typeof q === 'string') &&
    typeof results.timestamp === 'number' &&
    results.timestamp > 0
  );
}