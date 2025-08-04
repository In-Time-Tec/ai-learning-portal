import { QuizQuestion } from '../types';

export class QuizDataService {
    private questions: QuizQuestion[] = [];
    private isLoaded = false;

    /**
     * Load quiz questions from the static JSON file
     */
    async loadQuestions(): Promise<QuizQuestion[]> {
        if (this.isLoaded) {
            return this.questions;
        }

        try {
            // Use process.env.PUBLIC_URL to handle different deployment paths
            const publicUrl = process.env.PUBLIC_URL || '';
            const response = await fetch(`${publicUrl}/questions.json`);
            if (!response.ok) {
                throw new Error(`Failed to load questions: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.questions || !Array.isArray(data.questions)) {
                throw new Error('Invalid questions data format: missing questions array');
            }

            // Validate each question has required fields
            const validQuestions = data.questions.filter((q: any) =>
                this.isValidQuestion(q)
            );

            if (validQuestions.length === 0) {
                throw new Error('No valid questions found in data file');
            }

            this.questions = validQuestions;
            this.isLoaded = true;
            return this.questions;
        } catch (error) {
            console.error('Error loading quiz questions:', error);
            throw error;
        }
    }

    /**
     * Select random questions excluding recently used terms
     * @param count Number of questions to select
     * @param excludeTerms Set of term IDs to exclude from selection
     * @returns Array of selected questions
     */
    selectRandomQuestions(count: number, excludeTerms: Set<string> = new Set()): QuizQuestion[] {
        if (!this.isLoaded || this.questions.length === 0) {
            throw new Error('Questions not loaded. Call loadQuestions() first.');
        }

        // Filter out excluded terms
        const availableQuestions = this.questions.filter(q => !excludeTerms.has(q.term));

        // If no questions available after filtering, reset and use all questions
        const questionsToUse = availableQuestions.length > 0 ? availableQuestions : this.questions;

        // If requesting more questions than available, return all available
        const actualCount = Math.min(count, questionsToUse.length);

        // Shuffle and select
        const shuffled = [...questionsToUse].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, actualCount);
    }

    /**
     * Validate if an answer is correct for a given question
     * @param questionId The ID of the question
     * @param answer The user's answer
     * @returns true if answer is correct, false otherwise
     */
    validateAnswer(questionId: string, answer: string): boolean {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) {
            throw new Error(`Question with ID ${questionId} not found`);
        }

        return question.correctAnswer === answer;
    }

    /**
     * Get a specific question by ID
     * @param questionId The ID of the question to retrieve
     * @returns The question or undefined if not found
     */
    getQuestionById(questionId: string): QuizQuestion | undefined {
        return this.questions.find(q => q.id === questionId);
    }

    /**
     * Get all loaded questions
     * @returns Array of all questions
     */
    getAllQuestions(): QuizQuestion[] {
        return [...this.questions];
    }

    /**
     * Get questions for a specific term
     * @param term The term to get questions for
     * @returns Array of questions for the term
     */
    getQuestionsByTerm(term: string): QuizQuestion[] {
        return this.questions.filter(q => q.term === term);
    }

    /**
     * Validate if a question object has all required fields
     * @param question The question object to validate
     * @returns true if valid, false otherwise
     */
    private isValidQuestion(question: any): boolean {
        return (
            typeof question.id === 'string' &&
            typeof question.term === 'string' &&
            typeof question.question === 'string' &&
            Array.isArray(question.options) &&
            question.options.length >= 2 &&
            question.options.every((opt: any) => typeof opt === 'string') &&
            typeof question.correctAnswer === 'string' &&
            question.options.includes(question.correctAnswer) &&
            typeof question.glossaryLink === 'string'
        );
    }
}

// Export a singleton instance
export const quizDataService = new QuizDataService();