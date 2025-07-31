import React, { useState, useEffect, useCallback } from 'react';
import { QuizQuestion as QuizQuestionComponent } from './QuizQuestion';
import { quizDataService } from '../services/QuizDataService';
import { localStorageService } from '../services/LocalStorageService';
import { QuizQuestion, QuizResults, QuizAttempt } from '../types';
import './QuizContainer.css';

interface QuizContainerProps {
  onQuizComplete?: (results: QuizResults) => void;
  questionsPerQuiz?: number;
  answerDelayMs?: number; // For testing purposes
}

interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    term: string;
  }>;
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
}

const DEFAULT_QUESTIONS_PER_QUIZ = 3;

export const QuizContainer: React.FC<QuizContainerProps> = ({
  onQuizComplete,
  questionsPerQuiz = DEFAULT_QUESTIONS_PER_QUIZ,
  answerDelayMs = 2000
}) => {
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    isLoading: true,
    error: null,
    isCompleted: false
  });

  /**
   * Initialize quiz by loading questions and selecting random ones
   */
  const initializeQuiz = useCallback(async () => {
    try {
      setQuizState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load all questions
      await quizDataService.loadQuestions();

      // Get user progress to determine which terms to exclude
      const userProgress = localStorageService.getProgress();
      const excludeTerms = userProgress.answeredTerms;

      // Select random questions avoiding recent repeats
      const selectedQuestions = quizDataService.selectRandomQuestions(
        questionsPerQuiz,
        excludeTerms
      );

      if (selectedQuestions.length === 0) {
        throw new Error('No questions available for quiz');
      }

      setQuizState(prev => ({
        ...prev,
        questions: selectedQuestions,
        currentQuestionIndex: 0,
        answers: [],
        isLoading: false,
        error: null,
        isCompleted: false
      }));

    } catch (error) {
      console.error('Error initializing quiz:', error);
      setQuizState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load quiz questions'
      }));
    }
  }, [questionsPerQuiz]);

  /**
   * Handle answer selection for current question
   */
  const handleAnswerSelected = useCallback((
    questionId: string,
    selectedAnswer: string,
    isCorrect: boolean
  ) => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    
    if (!currentQuestion || currentQuestion.id !== questionId) {
      console.error('Answer received for unexpected question');
      return;
    }

    const newAnswer = {
      questionId,
      selectedAnswer,
      isCorrect,
      term: currentQuestion.term
    };

    setQuizState(prev => ({
      ...prev,
      answers: [...prev.answers, newAnswer]
    }));

    // Move to next question after a brief delay for user to see feedback
    setTimeout(() => {
      setQuizState(prev => {
        const nextIndex = prev.currentQuestionIndex + 1;
        const isQuizComplete = nextIndex >= prev.questions.length;

        if (isQuizComplete) {
          // Calculate and record quiz results
          const score = [...prev.answers, newAnswer].filter(a => a.isCorrect).length;
          const totalQuestions = prev.questions.length;
          const questionsAnswered = [...prev.answers, newAnswer].map(a => a.term);
          
          const results: QuizResults = {
            score,
            totalQuestions,
            questionsAnswered,
            timestamp: Date.now()
          };

          // Record attempt in localStorage
          const attempt: QuizAttempt = {
            timestamp: results.timestamp,
            score: results.score,
            totalQuestions: results.totalQuestions,
            questionsAnswered: results.questionsAnswered
          };

          localStorageService.recordQuizAttempt(attempt);

          // Notify parent component
          if (onQuizComplete) {
            onQuizComplete(results);
          }

          return {
            ...prev,
            currentQuestionIndex: nextIndex,
            isCompleted: true
          };
        }

        return {
          ...prev,
          currentQuestionIndex: nextIndex
        };
      });
    }, answerDelayMs); // Configurable delay to show feedback

  }, [quizState.questions, quizState.currentQuestionIndex, onQuizComplete, answerDelayMs]);

  /**
   * Start a new quiz
   */
  const startNewQuiz = useCallback(() => {
    initializeQuiz();
  }, [initializeQuiz]);

  /**
   * Calculate current quiz progress
   */
  const getQuizProgress = useCallback(() => {
    if (quizState.questions.length === 0) {
      return { current: 0, total: 0, percentage: 0 };
    }

    const current = Math.min(quizState.currentQuestionIndex + 1, quizState.questions.length);
    const total = quizState.questions.length;
    const percentage = Math.round((quizState.currentQuestionIndex / quizState.questions.length) * 100);

    return { current, total, percentage };
  }, [quizState.questions.length, quizState.currentQuestionIndex]);

  /**
   * Get current quiz results
   */
  const getCurrentResults = useCallback((): QuizResults | null => {
    if (!quizState.isCompleted) {
      return null;
    }

    const score = quizState.answers.filter(a => a.isCorrect).length;
    const totalQuestions = quizState.questions.length;
    const questionsAnswered = quizState.answers.map(a => a.term);

    return {
      score,
      totalQuestions,
      questionsAnswered,
      timestamp: Date.now()
    };
  }, [quizState.isCompleted, quizState.answers, quizState.questions.length]);

  // Initialize quiz on component mount
  useEffect(() => {
    initializeQuiz();
  }, [initializeQuiz]);

  // Loading state
  if (quizState.isLoading) {
    return (
      <div className="quiz-container quiz-container--loading" role="status" aria-live="polite">
        <div className="quiz-container__loading">
          <div className="quiz-container__spinner" aria-hidden="true"></div>
          <p>Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (quizState.error) {
    return (
      <div className="quiz-container quiz-container--error" role="alert">
        <div className="quiz-container__error">
          <h3>Unable to Load Quiz</h3>
          <p>{quizState.error}</p>
          <button 
            type="button"
            className="quiz-container__retry-button"
            onClick={startNewQuiz}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Quiz completion state
  if (quizState.isCompleted) {
    const results = getCurrentResults();
    if (!results) {
      return null;
    }

    const scorePercentage = Math.round((results.score / results.totalQuestions) * 100);

    return (
      <div className="quiz-container quiz-container--completed">
        <div className="quiz-container__results" role="region" aria-labelledby="quiz-results-title">
          <h3 id="quiz-results-title">Quiz Complete!</h3>
          
          <div className="quiz-container__score">
            <div className="quiz-container__score-display">
              <span className="quiz-container__score-number">{results.score}</span>
              <span className="quiz-container__score-total">/{results.totalQuestions}</span>
            </div>
            <div className="quiz-container__score-percentage">
              {scorePercentage}% Correct
            </div>
          </div>

          <div className="quiz-container__feedback">
            {scorePercentage === 100 && (
              <p className="quiz-container__feedback--perfect">
                Perfect score! Excellent work! 🎉
              </p>
            )}
            {scorePercentage >= 67 && scorePercentage < 100 && (
              <p className="quiz-container__feedback--good">
                Great job! You're getting the hang of AI concepts! 👍
              </p>
            )}
            {scorePercentage >= 33 && scorePercentage < 67 && (
              <p className="quiz-container__feedback--okay">
                Good effort! Keep learning to improve your understanding. 📚
              </p>
            )}
            {scorePercentage < 33 && (
              <p className="quiz-container__feedback--needs-work">
                Keep studying! Review the glossary to strengthen your knowledge. 💪
              </p>
            )}
          </div>

          <div className="quiz-container__actions">
            <button 
              type="button"
              className="quiz-container__new-quiz-button"
              onClick={startNewQuiz}
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz state
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  const progress = getQuizProgress();

  if (!currentQuestion) {
    return (
      <div className="quiz-container quiz-container--error" role="alert">
        <div className="quiz-container__error">
          <h3>Quiz Error</h3>
          <p>No question available to display.</p>
          <button 
            type="button"
            className="quiz-container__retry-button"
            onClick={startNewQuiz}
          >
            Start New Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container" role="main" aria-labelledby="quiz-title">
      <div className="quiz-container__header">
        <h2 id="quiz-title">AI Knowledge Quiz</h2>
        
        <div className="quiz-container__progress" role="progressbar" 
             aria-valuenow={progress.current} 
             aria-valuemin={1} 
             aria-valuemax={progress.total}
             aria-label={`Question ${progress.current} of ${progress.total}`}>
          <div className="quiz-container__progress-bar">
            <div 
              className="quiz-container__progress-fill"
              style={{ width: `${progress.percentage}%` }}
              aria-hidden="true"
            ></div>
          </div>
          <div className="quiz-container__progress-text">
            Question {progress.current} of {progress.total}
          </div>
        </div>
      </div>

      <div className="quiz-container__question">
        <QuizQuestionComponent
          question={currentQuestion}
          onAnswerSelected={handleAnswerSelected}
          disabled={false}
        />
      </div>
    </div>
  );
};

export default QuizContainer;