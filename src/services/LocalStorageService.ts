/**
 * LocalStorageService - Manages user progress and data persistence
 * 
 * Provides centralized localStorage management with error handling,
 * data migration, and graceful fallbacks when localStorage is unavailable.
 */

import {
  UserProgress,
  QuizAttempt,
  StoredUserData,
  isStoredUserData,
  isQuizAttempt
} from '../types';

/**
 * Current schema version for data migration
 */
const CURRENT_VERSION = '1.0.0';

/**
 * Default user progress when no data exists
 */
const DEFAULT_USER_PROGRESS: UserProgress = {
  quizAttempts: [],
  answeredTerms: new Set<string>(),
  bestScore: 0
};

/**
 * Default stored user data structure
 */
const DEFAULT_STORED_DATA: StoredUserData = {
  version: CURRENT_VERSION,
  quizHistory: [],
  answeredTerms: [],
  preferences: {}
};

/**
 * LocalStorage key for user data
 */
const STORAGE_KEY = 'ai-glossary-user-data';

/**
 * Service class for managing localStorage operations with error handling
 */
export class LocalStorageService {
  private isAvailable: boolean;
  private fallbackData: UserProgress;

  constructor() {
    this.isAvailable = this.checkLocalStorageAvailability();
    this.fallbackData = { ...DEFAULT_USER_PROGRESS };
    
    if (this.isAvailable) {
      this.migrateDataIfNeeded();
    }
  }

  /**
   * Check if localStorage is available and functional
   */
  private checkLocalStorageAvailability(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  }

  /**
   * Get current user progress from localStorage or fallback
   */
  public getProgress(): UserProgress {
    if (!this.isAvailable) {
      return { ...this.fallbackData };
    }

    try {
      const storedData = this.getStoredData();
      return this.convertStoredDataToProgress(storedData);
    } catch (error) {
      console.error('Error reading user progress:', error);
      return { ...DEFAULT_USER_PROGRESS };
    }
  }

  /**
   * Update user progress in localStorage
   */
  public updateProgress(progress: Partial<UserProgress>): void {
    if (!this.isAvailable) {
      // Update fallback data for session persistence
      this.fallbackData = { ...this.fallbackData, ...progress };
      return;
    }

    try {
      const currentData = this.getStoredData();
      const updatedData: StoredUserData = {
        ...currentData,
        quizHistory: progress.quizAttempts ?? currentData.quizHistory,
        answeredTerms: progress.answeredTerms 
          ? Array.from(progress.answeredTerms) 
          : currentData.answeredTerms
      };

      this.setStoredData(updatedData);
    } catch (error) {
      console.error('Error updating user progress:', error);
      // Update fallback data as backup
      this.fallbackData = { ...this.fallbackData, ...progress };
    }
  }

  /**
   * Record a new quiz attempt
   */
  public recordQuizAttempt(attempt: QuizAttempt): void {
    if (!isQuizAttempt(attempt)) {
      console.error('Invalid quiz attempt data:', attempt);
      return;
    }

    const currentProgress = this.getProgress();
    const updatedAttempts = [...currentProgress.quizAttempts, attempt];
    const newBestScore = Math.max(currentProgress.bestScore, attempt.score);
    
    // Update answered terms
    const updatedAnsweredTerms = new Set<string>();
    currentProgress.answeredTerms.forEach(term => updatedAnsweredTerms.add(term));
    attempt.questionsAnswered.forEach(term => updatedAnsweredTerms.add(term));

    this.updateProgress({
      quizAttempts: updatedAttempts,
      bestScore: newBestScore,
      answeredTerms: updatedAnsweredTerms
    });
  }

  /**
   * Get user preferences
   */
  public getPreferences(): StoredUserData['preferences'] {
    if (!this.isAvailable) {
      return {};
    }

    try {
      const storedData = this.getStoredData();
      return storedData.preferences;
    } catch (error) {
      console.error('Error reading user preferences:', error);
      return {};
    }
  }

  /**
   * Update user preferences
   */
  public updatePreferences(preferences: Partial<StoredUserData['preferences']>): void {
    if (!this.isAvailable) {
      return;
    }

    try {
      const currentData = this.getStoredData();
      const updatedData: StoredUserData = {
        ...currentData,
        preferences: {
          ...currentData.preferences,
          ...preferences
        }
      };

      this.setStoredData(updatedData);
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  /**
   * Clear all user data
   */
  public clearAllData(): void {
    if (!this.isAvailable) {
      this.fallbackData = { ...DEFAULT_USER_PROGRESS };
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  /**
   * Check if localStorage is currently available
   */
  public isLocalStorageAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Get raw stored data with validation
   */
  private getStoredData(): StoredUserData {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      
      if (!rawData) {
        return { ...DEFAULT_STORED_DATA };
      }

      const parsedData = JSON.parse(rawData);
      
      if (!isStoredUserData(parsedData)) {
        console.warn('Invalid stored data format, using defaults');
        return { ...DEFAULT_STORED_DATA };
      }

      return parsedData;
    } catch (error) {
      console.error('Error parsing stored data:', error);
      return { ...DEFAULT_STORED_DATA };
    }
  }

  /**
   * Set stored data with error handling
   */
  private setStoredData(data: StoredUserData): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serializedData);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
        // Try to clear old data and retry
        this.clearOldQuizAttempts(data);
      } else {
        console.error('Error storing data:', error);
        throw error; // Re-throw to be caught by calling methods
      }
    }
  }

  /**
   * Convert stored data format to UserProgress format
   */
  private convertStoredDataToProgress(storedData: StoredUserData): UserProgress {
    return {
      quizAttempts: storedData.quizHistory,
      answeredTerms: new Set(storedData.answeredTerms),
      bestScore: storedData.quizHistory.reduce(
        (max, attempt) => Math.max(max, attempt.score),
        0
      )
    };
  }

  /**
   * Migrate data from older versions if needed
   */
  private migrateDataIfNeeded(): void {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) {
        return; // No data to migrate
      }

      const parsedData = JSON.parse(rawData);
      
      if (!parsedData.version || parsedData.version !== CURRENT_VERSION) {
        const migratedData = this.migrateData(parsedData);
        this.setStoredData(migratedData);
      }
    } catch (error) {
      console.error('Error during data migration:', error);
    }
  }

  /**
   * Migrate data from older versions
   */
  private migrateData(oldData: any): StoredUserData {
    // For now, just update version and ensure all required fields exist
    const migratedData: StoredUserData = {
      version: CURRENT_VERSION,
      quizHistory: oldData.quizHistory || [],
      answeredTerms: oldData.answeredTerms || [],
      preferences: oldData.preferences || {}
    };

    console.log(`Migrated data from version ${oldData.version || 'unknown'} to ${CURRENT_VERSION}`);
    return migratedData;
  }

  /**
   * Clear old quiz attempts to free up storage space
   */
  private clearOldQuizAttempts(data: StoredUserData): void {
    try {
      // Keep only the last 50 quiz attempts
      const recentAttempts = data.quizHistory
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);

      const cleanedData: StoredUserData = {
        ...data,
        quizHistory: recentAttempts
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedData));
      console.log('Cleared old quiz attempts to free up storage space');
    } catch (error) {
      console.error('Failed to clear old data:', error);
    }
  }
}

/**
 * Singleton instance of LocalStorageService
 */
export const localStorageService = new LocalStorageService();