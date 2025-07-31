/**
 * Unit tests for LocalStorageService
 * 
 * Tests all functionality including error handling, data migration,
 * and graceful fallbacks when localStorage is unavailable.
 */

import { LocalStorageService } from './LocalStorageService';
import { QuizAttempt, StoredUserData, UserProgress } from '../types';

// Mock localStorage
let mockStore: Record<string, string> = {};

const createMockLocalStorage = () => ({
    getItem: jest.fn((key: string) => mockStore[key] || null),
    setItem: jest.fn((key: string, value: string) => {
        mockStore[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
        delete mockStore[key];
    }),
    clear: jest.fn(() => {
        mockStore = {};
    }),
    get length() {
        return Object.keys(mockStore).length;
    },
    key: jest.fn((index: number) => Object.keys(mockStore)[index] || null)
});

// Mock console methods
const mockConsole = {
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn()
};

describe('LocalStorageService', () => {
    let service: LocalStorageService;
    let mockLocalStorage: any;

    beforeEach(() => {
        // Reset store and create fresh mocks
        mockStore = {};
        mockLocalStorage = createMockLocalStorage();

        // Mock global localStorage
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
            writable: true
        });

        // Mock console
        global.console = mockConsole as any;

        // Create fresh service instance
        service = new LocalStorageService();
    });

    describe('Constructor and Initialization', () => {
        it('should initialize with localStorage available', () => {
            expect(service.isLocalStorageAvailable()).toBe(true);
        });

        it('should handle localStorage unavailable gracefully', () => {
            // Mock localStorage to throw error
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('localStorage not available');
            });

            service = new LocalStorageService();
            expect(service.isLocalStorageAvailable()).toBe(false);
            expect(mockConsole.warn).toHaveBeenCalledWith(
                'localStorage is not available:',
                expect.any(Error)
            );
        });

        it('should migrate data on initialization if needed', () => {
            // Set up old version data
            const oldData: StoredUserData = {
                version: '0.9.0',
                visitCount: 5,
                quizHistory: [],
                answeredTerms: ['term1'],
                preferences: {}
            };

            mockLocalStorage.setItem('ai-glossary-user-data', JSON.stringify(oldData));

            service = new LocalStorageService();

            // Check that data was migrated
            const storedData = JSON.parse(mockLocalStorage.getItem('ai-glossary-user-data') || '{}');
            expect(storedData.version).toBe('1.0.0');
            expect(storedData.visitCount).toBe(5);
        });
    });

    describe('getProgress', () => {
        it('should return default progress when no data exists', () => {
            const progress = service.getProgress();

            expect(progress).toEqual({
                visitCount: 0,
                quizAttempts: [],
                answeredTerms: new Set(),
                bestScore: 0
            });
        });

        it('should return stored progress when data exists', () => {
            const storedData: StoredUserData = {
                version: '1.0.0',
                visitCount: 10,
                quizHistory: [
                    {
                        timestamp: Date.now(),
                        score: 2,
                        totalQuestions: 3,
                        questionsAnswered: ['term1', 'term2']
                    }
                ],
                answeredTerms: ['term1', 'term2', 'term3'],
                preferences: {}
            };

            mockLocalStorage.setItem('ai-glossary-user-data', JSON.stringify(storedData));

            const progress = service.getProgress();

            expect(progress.visitCount).toBe(10);
            expect(progress.quizAttempts).toHaveLength(1);
            expect(progress.answeredTerms).toEqual(new Set(['term1', 'term2', 'term3']));
            expect(progress.bestScore).toBe(2);
        });

        it('should return fallback data when localStorage is unavailable', () => {
            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('localStorage error');
            });

            service = new LocalStorageService();
            const progress = service.getProgress();

            expect(progress).toEqual({
                visitCount: 0,
                quizAttempts: [],
                answeredTerms: new Set(),
                bestScore: 0
            });
        });

        it('should handle corrupted data gracefully', () => {
            mockLocalStorage.setItem('ai-glossary-user-data', 'invalid json');

            const progress = service.getProgress();

            expect(progress).toEqual({
                visitCount: 0,
                quizAttempts: [],
                answeredTerms: new Set(),
                bestScore: 0
            });
            expect(mockConsole.error).toHaveBeenCalledWith(
                'Error parsing stored data:',
                expect.any(Error)
            );
        });
    });

    describe('updateProgress', () => {
        it('should update progress in localStorage', () => {
            const progressUpdate: Partial<UserProgress> = {
                visitCount: 5,
                answeredTerms: new Set(['term1', 'term2'])
            };

            service.updateProgress(progressUpdate);

            const storedData = JSON.parse(mockLocalStorage.getItem('ai-glossary-user-data') || '{}');
            expect(storedData.visitCount).toBe(5);
            expect(storedData.answeredTerms).toEqual(['term1', 'term2']);
        });

        it('should update fallback data when localStorage is unavailable', () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('localStorage error');
            });

            service = new LocalStorageService();

            const progressUpdate: Partial<UserProgress> = {
                visitCount: 3
            };

            service.updateProgress(progressUpdate);

            // Should still return updated data from fallback
            const progress = service.getProgress();
            expect(progress.visitCount).toBe(3);
        });

        it('should handle storage errors gracefully', () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            const progressUpdate: Partial<UserProgress> = {
                visitCount: 5
            };

            service.updateProgress(progressUpdate);

            expect(mockConsole.error).toHaveBeenCalledWith(
                'Error updating user progress:',
                expect.any(Error)
            );
        });
    });

    describe('incrementVisitCount', () => {
        it('should increment visit count from 0', () => {
            const newCount = service.incrementVisitCount();

            expect(newCount).toBe(1);

            const progress = service.getProgress();
            expect(progress.visitCount).toBe(1);
        });

        it('should increment existing visit count', () => {
            service.updateProgress({ visitCount: 5 });

            const newCount = service.incrementVisitCount();

            expect(newCount).toBe(6);
        });

        it('should work with fallback data when localStorage unavailable', () => {
            // Make localStorage unavailable by making setItem throw
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('localStorage error');
            });

            service = new LocalStorageService();

            const count1 = service.incrementVisitCount();
            const count2 = service.incrementVisitCount();

            expect(count1).toBe(1);
            expect(count2).toBe(2);
        });
    });

    describe('recordQuizAttempt', () => {
        const validQuizAttempt: QuizAttempt = {
            timestamp: Date.now(),
            score: 2,
            totalQuestions: 3,
            questionsAnswered: ['term1', 'term2']
        };

        it('should record a valid quiz attempt', () => {
            service.recordQuizAttempt(validQuizAttempt);

            const progress = service.getProgress();
            expect(progress.quizAttempts).toHaveLength(1);
            expect(progress.quizAttempts[0]).toEqual(validQuizAttempt);
            expect(progress.bestScore).toBe(2);
            expect(progress.answeredTerms).toEqual(new Set(['term1', 'term2']));
        });

        it('should update best score when new score is higher', () => {
            service.recordQuizAttempt({ ...validQuizAttempt, score: 1 });
            service.recordQuizAttempt({ ...validQuizAttempt, score: 3 });

            const progress = service.getProgress();
            expect(progress.bestScore).toBe(3);
        });

        it('should not update best score when new score is lower', () => {
            service.recordQuizAttempt({ ...validQuizAttempt, score: 3 });
            service.recordQuizAttempt({ ...validQuizAttempt, score: 1 });

            const progress = service.getProgress();
            expect(progress.bestScore).toBe(3);
        });

        it('should accumulate answered terms', () => {
            service.recordQuizAttempt({
                ...validQuizAttempt,
                questionsAnswered: ['term1', 'term2']
            });
            service.recordQuizAttempt({
                ...validQuizAttempt,
                questionsAnswered: ['term2', 'term3']
            });

            const progress = service.getProgress();
            expect(progress.answeredTerms).toEqual(new Set(['term1', 'term2', 'term3']));
        });

        it('should reject invalid quiz attempt data', () => {
            const invalidAttempt = {
                timestamp: 'invalid',
                score: -1,
                totalQuestions: 0,
                questionsAnswered: []
            } as any;

            service.recordQuizAttempt(invalidAttempt);

            const progress = service.getProgress();
            expect(progress.quizAttempts).toHaveLength(0);
            expect(mockConsole.error).toHaveBeenCalledWith(
                'Invalid quiz attempt data:',
                invalidAttempt
            );
        });
    });

    describe('getPreferences and updatePreferences', () => {
        it('should return empty preferences by default', () => {
            const preferences = service.getPreferences();
            expect(preferences).toEqual({});
        });

        it('should update and retrieve preferences', () => {
            const newPreferences = {
                selectedRole: 'engineer' as const,
                theme: 'dark' as const
            };

            service.updatePreferences(newPreferences);

            const preferences = service.getPreferences();
            expect(preferences).toEqual(newPreferences);
        });

        it('should merge preferences updates', () => {
            service.updatePreferences({ selectedRole: 'business' });
            service.updatePreferences({ theme: 'light' });

            const preferences = service.getPreferences();
            expect(preferences).toEqual({
                selectedRole: 'business',
                theme: 'light'
            });
        });

        it('should handle localStorage errors gracefully', () => {
            // Create a new service with getItem that throws
            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            // Create new service after setting up the error
            const errorService = new LocalStorageService();

            const preferences = errorService.getPreferences();
            expect(preferences).toEqual({});
            expect(mockConsole.error).toHaveBeenCalledWith(
                'Error parsing stored data:',
                expect.any(Error)
            );
        });
    });

    describe('clearAllData', () => {
        it('should clear all data from localStorage', () => {
            service.updateProgress({ visitCount: 10 });
            service.recordQuizAttempt({
                timestamp: Date.now(),
                score: 2,
                totalQuestions: 3,
                questionsAnswered: ['term1']
            });

            service.clearAllData();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ai-glossary-user-data');

            const progress = service.getProgress();
            expect(progress).toEqual({
                visitCount: 0,
                quizAttempts: [],
                answeredTerms: new Set(),
                bestScore: 0
            });
        });

        it('should clear fallback data when localStorage unavailable', () => {
            mockLocalStorage.removeItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            service = new LocalStorageService();
            service.updateProgress({ visitCount: 5 });

            service.clearAllData();

            const progress = service.getProgress();
            expect(progress.visitCount).toBe(0);
        });
    });

    describe('Storage Quota Handling', () => {
        it('should handle quota exceeded error', () => {
            const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');

            let callCount = 0;
            mockLocalStorage.setItem.mockImplementation(() => {
                callCount++;
                if (callCount <= 2) { // First two calls (test + initial data) throw quota error
                    throw quotaError;
                }
                // Third call (cleanup attempt) succeeds
                return;
            });

            // Create data that would trigger quota cleanup
            const largeQuizHistory = Array.from({ length: 100 }, (_, i) => ({
                timestamp: Date.now() - i * 1000,
                score: 2,
                totalQuestions: 3,
                questionsAnswered: [`term${i}`]
            }));

            service.updateProgress({ quizAttempts: largeQuizHistory });

            // Should attempt to clear old data (test call + initial call + cleanup call)
            expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3);
        });
    });

    describe('Data Migration', () => {
        it('should migrate data with missing fields', () => {
            const incompleteData = {
                version: '0.5.0',
                visitCount: 3
                // Missing other required fields
            };

            mockLocalStorage.setItem('ai-glossary-user-data', JSON.stringify(incompleteData));

            service = new LocalStorageService();

            const progress = service.getProgress();
            expect(progress.visitCount).toBe(3);
            expect(progress.quizAttempts).toEqual([]);
            expect(progress.answeredTerms).toEqual(new Set());
        });

        it('should handle migration errors gracefully', () => {
            mockLocalStorage.getItem.mockReturnValue('invalid json');

            service = new LocalStorageService();

            // Should not crash and should use defaults
            const progress = service.getProgress();
            expect(progress).toEqual({
                visitCount: 0,
                quizAttempts: [],
                answeredTerms: new Set(),
                bestScore: 0
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle null localStorage values', () => {
            mockLocalStorage.getItem.mockReturnValue(null);

            const progress = service.getProgress();
            expect(progress).toEqual({
                visitCount: 0,
                quizAttempts: [],
                answeredTerms: new Set(),
                bestScore: 0
            });
        });

        it('should handle empty string localStorage values', () => {
            mockLocalStorage.getItem.mockReturnValue('');

            const progress = service.getProgress();
            expect(progress).toEqual({
                visitCount: 0,
                quizAttempts: [],
                answeredTerms: new Set(),
                bestScore: 0
            });
        });

        it('should handle malformed JSON gracefully', () => {
            mockLocalStorage.getItem.mockReturnValue('{"invalid": json}');

            const progress = service.getProgress();
            expect(progress).toEqual({
                visitCount: 0,
                quizAttempts: [],
                answeredTerms: new Set(),
                bestScore: 0
            });
            expect(mockConsole.error).toHaveBeenCalled();
        });

        it('should handle data with wrong types', () => {
            const invalidData = {
                version: '1.0.0',
                visitCount: 'not a number',
                quizHistory: 'not an array',
                answeredTerms: 123,
                preferences: 'not an object'
            };

            mockLocalStorage.setItem('ai-glossary-user-data', JSON.stringify(invalidData));

            const progress = service.getProgress();
            expect(progress).toEqual({
                visitCount: 0,
                quizAttempts: [],
                answeredTerms: new Set(),
                bestScore: 0
            });
            expect(mockConsole.warn).toHaveBeenCalledWith(
                'Invalid stored data format, using defaults'
            );
        });
    });
});