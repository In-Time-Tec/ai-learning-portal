/**
 * Core TypeScript interfaces and types for the Interactive AI Glossary
 */

import React from 'react';

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
  quizAttempts: QuizAttempt[];
  answeredTerms: Set<string>;
  bestScore: number;
}

/**
 * LocalStorage data structure with versioning
 */
export interface StoredUserData {
  version: string;
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
 * AI tool categories for organization and filtering
 */
export type ToolCategory = 'code-assistant' | 'ide-extension' | 'research-tool' | 'debugging-tool' | 'testing-tool' | 'terminal-tool';

/**
 * Represents a user experience or testimonial about an AI tool
 */
export interface UserExperience {
  id: string;
  quote: string;
  context: string;
  useCase: string;
  sentiment: 'positive' | 'mixed' | 'challenge';
  role?: UserRole;
}

/**
 * Represents an AI tool with all its associated data
 */
export interface AITool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  officialLink?: string;
  internalSetupNotes?: string;
  userExperiences: UserExperience[];
  commonUseCases: string[];
  integrations?: string[];
  licensingNotes?: string;
  teamAdoption?: {
    level: 'individual' | 'team' | 'organization';
    notes: string;
  };
}

/**
 * Complete AI tools data structure with categories and tools
 */
export interface AIToolsData {
  tools: AITool[];
  categories: {
    [key in ToolCategory]: {
      label: string;
      description: string;
    };
  };
}

/**
 * Interface for individual introduction content sections
 */
export interface IntroductionSection {
  id: string;
  title: string;
  subtitle?: string;
  content: string | React.ReactNode;
  variant?: 'default' | 'highlighted' | 'warning';
}

/**
 * Complete introduction content data structure
 */
export interface IntroductionContent {
  sections: IntroductionSection[];
  navigation: {
    previous?: { label: string; destination: 'glossary' | 'quiz' | 'home' };
    next?: { label: string; destination: 'glossary' | 'quiz' | 'home' };
  };
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

/**
 * Type guard to check if a value is a valid ToolCategory
 */
export function isToolCategory(value: unknown): value is ToolCategory {
  return typeof value === 'string' && 
    ['code-assistant', 'ide-extension', 'research-tool', 'debugging-tool', 'testing-tool', 'terminal-tool'].includes(value);
}

/**
 * Type guard to check if an object is a valid UserExperience
 */
export function isUserExperience(obj: unknown): obj is UserExperience {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const experience = obj as Record<string, unknown>;
  
  return (
    typeof experience.id === 'string' &&
    typeof experience.quote === 'string' &&
    typeof experience.context === 'string' &&
    typeof experience.useCase === 'string' &&
    typeof experience.sentiment === 'string' &&
    ['positive', 'mixed', 'challenge'].includes(experience.sentiment as string) &&
    (experience.role === undefined || isUserRole(experience.role))
  );
}

/**
 * Type guard to check if an object is a valid AITool
 */
export function isAITool(obj: unknown): obj is AITool {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const tool = obj as Record<string, unknown>;
  
  return (
    typeof tool.id === 'string' &&
    typeof tool.name === 'string' &&
    isToolCategory(tool.category) &&
    typeof tool.description === 'string' &&
    (tool.officialLink === undefined || typeof tool.officialLink === 'string') &&
    (tool.internalSetupNotes === undefined || typeof tool.internalSetupNotes === 'string') &&
    Array.isArray(tool.userExperiences) &&
    tool.userExperiences.every(exp => isUserExperience(exp)) &&
    Array.isArray(tool.commonUseCases) &&
    tool.commonUseCases.every(useCase => typeof useCase === 'string') &&
    (tool.integrations === undefined || (Array.isArray(tool.integrations) && 
      tool.integrations.every(integration => typeof integration === 'string'))) &&
    (tool.licensingNotes === undefined || typeof tool.licensingNotes === 'string') &&
    (tool.teamAdoption === undefined || isValidTeamAdoption(tool.teamAdoption))
  );
}

/**
 * Helper function to validate team adoption object
 */
function isValidTeamAdoption(obj: unknown): obj is AITool['teamAdoption'] {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const adoption = obj as Record<string, unknown>;
  
  return (
    typeof adoption.level === 'string' &&
    ['individual', 'team', 'organization'].includes(adoption.level as string) &&
    typeof adoption.notes === 'string'
  );
}

/**
 * Type guard to check if an object is a valid AIToolsData
 */
export function isAIToolsData(obj: unknown): obj is AIToolsData {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const data = obj as Record<string, unknown>;
  
  return (
    Array.isArray(data.tools) &&
    data.tools.every(tool => isAITool(tool)) &&
    typeof data.categories === 'object' &&
    data.categories !== null &&
    isValidCategoriesObject(data.categories)
  );
}

/**
 * Helper function to validate categories object
 */
function isValidCategoriesObject(obj: unknown): obj is AIToolsData['categories'] {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const categories = obj as Record<string, unknown>;
  
  // Validate that each category in the data has the correct structure
  // and that the category key is a valid ToolCategory
  return Object.entries(categories).every(([categoryKey, categoryData]) => {
    return (
      isToolCategory(categoryKey) &&
      typeof categoryData === 'object' &&
      categoryData !== null &&
      typeof (categoryData as Record<string, unknown>).label === 'string' &&
      typeof (categoryData as Record<string, unknown>).description === 'string'
    );
  });
}