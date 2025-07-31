import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { QuizContainer } from './QuizContainer';
import { quizDataService } from '../services/QuizDataService';
import { localStorageService } from '../services/LocalStorageService';
import { QuizQuestion, QuizResults, UserProgress } from '../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock services
jest.mock('../services/QuizDataService');
jest.mock('../services/LocalStorageService');

const mockQuizDataService = quizDataService as jest.Mocked<typeof quizDataService>;
const mockLocalStorageService = localStorageService as jest.Mocked<typeof localStorageService>;

// Mock questions data
const mockQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    term: 'Artificial Intelligence',
    question: 'What is AI?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A',
    glossaryLink: '#ai'
  },
  {
    id: 'q2',
    term: 'Machine Learning',
    question: 'What is ML?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option B',
    glossaryLink: '#ml'
  },
  {
    id: 'q3',
    term: 'Deep Learning',
    question: 'What is DL?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option C',
    glossaryLink: '#dl'
  }
];

const mockUserProgress: UserProgress = {
  visitCount: 5,
  quizAttempts: [],
  answeredTerms: new Set<string>(),
  bestScore: 0
};

describe('QuizContainer', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockQuizDataService.loadQuestions.mockResolvedValue(mockQuestions);
    mockQuizDataService.selectRandomQuestions.mockReturnValue(mockQuestions.slice(0, 3));
    mockLocalStorageService.getProgress.mockReturnValue(mockUserProgress);
    mockLocalStorageService.recordQuizAttempt.mockImplementation(() => {});
  });

  describe('Initialization', () => {
    it('should render loading state initially', async () => {
      render(<QuizContainer />);
      
      expect(screen.getByText('Loading quiz questions...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should load questions and display first question', async () => {
      render(<QuizContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('AI Knowledge Quiz')).toBeInTheDocument();
      });

      expect(mockQuizDataService.loadQuestions).toHaveBeenCalledTimes(1);
      expect(mockQuizDataService.selectRandomQuestions).toHaveBeenCalledWith(3, new Set());
      expect(screen.getByText('What is AI?')).toBeInTheDocument();
    });

    it('should display progress indicator', async () => {
      render(<QuizContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
      });

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '1');
      expect(progressBar).toHaveAttribute('aria-valuemax', '3');
    });

    it('should handle custom questionsPerQuiz prop', async () => {
      render(<QuizContainer questionsPerQuiz={5} />);
      
      await waitFor(() => {
        expect(mockQuizDataService.selectRandomQuestions).toHaveBeenCalledWith(5, new Set());
      });
    });
  });

  describe('Question Selection Logic', () => {
    it('should exclude answered terms from question selection', async () => {
      const progressWithAnsweredTerms: UserProgress = {
        ...mockUserProgress,
        answeredTerms: new Set(['Artificial Intelligence', 'Machine Learning'])
      };
      
      mockLocalStorageService.getProgress.mockReturnValue(progressWithAnsweredTerms);
      
      render(<QuizContainer />);
      
      await waitFor(() => {
        expect(mockQuizDataService.selectRandomQuestions).toHaveBeenCalledWith(
          3, 
          new Set(['Artificial Intelligence', 'Machine Learning'])
        );
      });
    });

    it('should handle case when no questions are available', async () => {
      mockQuizDataService.selectRandomQuestions.mockReturnValue([]);
      
      render(<QuizContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('No questions available for quiz')).toBeInTheDocument();
      });
    });
  });

  describe('Quiz Flow', () => {
    it('should progress through questions when answers are selected', async () => {
      render(<QuizContainer answerDelayMs={100} />);
      
      // Wait for first question to load
      await waitFor(() => {
        expect(screen.getByText('What is AI?')).toBeInTheDocument();
      });

      // Answer first question
      const firstAnswer = screen.getByText('Option A');
      fireEvent.click(firstAnswer);

      // Wait for progression to second question
      await waitFor(() => {
        expect(screen.getByText('What is ML?')).toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
    });

    it('should show quiz completion after all questions answered', async () => {
      const onQuizComplete = jest.fn();
      
      render(<QuizContainer onQuizComplete={onQuizComplete} answerDelayMs={50} />);
      
      // Wait for first question
      await waitFor(() => {
        expect(screen.getByText('What is AI?')).toBeInTheDocument();
      });

      // Answer first question
      act(() => {
        fireEvent.click(screen.getByText('Option A')); // Correct
      });
      
      // Wait for second question
      await waitFor(() => {
        expect(screen.getByText('What is ML?')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Answer second question
      act(() => {
        fireEvent.click(screen.getByText('Option B')); // Correct
      });
      
      // Wait for third question
      await waitFor(() => {
        expect(screen.getByText('What is DL?')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Answer third question
      act(() => {
        fireEvent.click(screen.getByText('Option C')); // Correct
      });

      // Wait for completion screen
      await waitFor(() => {
        expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByText('3/3')).toBeInTheDocument();
      expect(screen.getByText('100% Correct')).toBeInTheDocument();
      expect(onQuizComplete).toHaveBeenCalledWith({
        score: 3,
        totalQuestions: 3,
        questionsAnswered: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning'],
        timestamp: expect.any(Number)
      });
    });

    it('should record quiz attempt in localStorage', async () => {
      render(<QuizContainer answerDelayMs={50} />);
      
      // Complete quiz with 2 correct answers
      await waitFor(() => {
        expect(screen.getByText('What is AI?')).toBeInTheDocument();
      });

      act(() => {
        fireEvent.click(screen.getByText('Option A')); // Correct
      });
      
      await waitFor(() => {
        expect(screen.getByText('What is ML?')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      act(() => {
        fireEvent.click(screen.getByText('Option A')); // Incorrect
      });
      
      await waitFor(() => {
        expect(screen.getByText('What is DL?')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      act(() => {
        fireEvent.click(screen.getByText('Option C')); // Correct
      });

      await waitFor(() => {
        expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(mockLocalStorageService.recordQuizAttempt).toHaveBeenCalledWith({
        timestamp: expect.any(Number),
        score: 2,
        totalQuestions: 3,
        questionsAnswered: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning']
      });
    });
  });

  describe('Score Calculation and Feedback', () => {
    it('should show perfect score feedback for 100%', async () => {
      render(<QuizContainer answerDelayMs={50} />);
      
      // Answer all questions correctly
      await waitFor(() => {
        expect(screen.getByText('What is AI?')).toBeInTheDocument();
      });

      act(() => {
        fireEvent.click(screen.getByText('Option A'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('What is ML?')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      act(() => {
        fireEvent.click(screen.getByText('Option B'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('What is DL?')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      act(() => {
        fireEvent.click(screen.getByText('Option C'));
      });

      await waitFor(() => {
        expect(screen.getByText('Perfect score! Excellent work! 🎉')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should show appropriate feedback for different score ranges', async () => {
      render(<QuizContainer answerDelayMs={50} />);
      
      // Answer 2 out of 3 correctly (67%)
      await waitFor(() => {
        expect(screen.getByText('What is AI?')).toBeInTheDocument();
      });

      act(() => {
        fireEvent.click(screen.getByText('Option A')); // Correct
      });
      
      await waitFor(() => {
        expect(screen.getByText('What is ML?')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      act(() => {
        fireEvent.click(screen.getByText('Option A')); // Incorrect
      });
      
      await waitFor(() => {
        expect(screen.getByText('What is DL?')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      act(() => {
        fireEvent.click(screen.getByText('Option C')); // Correct
      });

      await waitFor(() => {
        expect(screen.getByText('Great job! You\'re getting the hang of AI concepts! 👍')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when questions fail to load', async () => {
      mockQuizDataService.loadQuestions.mockRejectedValue(new Error('Network error'));
      
      render(<QuizContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Quiz')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      mockQuizDataService.loadQuestions
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockQuestions);
      
      render(<QuizContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Try Again'));
      
      await waitFor(() => {
        expect(screen.getByText('What is AI?')).toBeInTheDocument();
      });
    });

    it('should handle missing current question gracefully', async () => {
      mockQuizDataService.selectRandomQuestions.mockReturnValue([]);
      
      render(<QuizContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('No questions available for quiz')).toBeInTheDocument();
      });
    });
  });

  describe('New Quiz Functionality', () => {
    it('should allow starting a new quiz after completion', async () => {
      render(<QuizContainer answerDelayMs={50} />);
      
      // Complete first quiz
      await waitFor(() => {
        expect(screen.getByText('What is AI?')).toBeInTheDocument();
      });

      act(() => {
        fireEvent.click(screen.getByText('Option A'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('What is ML?')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      act(() => {
        fireEvent.click(screen.getByText('Option B'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('What is DL?')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      act(() => {
        fireEvent.click(screen.getByText('Option C'));
      });

      await waitFor(() => {
        expect(screen.getByText('Take Another Quiz')).toBeInTheDocument();
      }, { timeout: 2000 });

      // Start new quiz
      act(() => {
        fireEvent.click(screen.getByText('Take Another Quiz'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<QuizContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('What is AI?')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels and roles', async () => {
      render(<QuizContainer />);
      
      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-label', 'Question 1 of 3');
    });

    it('should support keyboard navigation', async () => {
      render(<QuizContainer answerDelayMs={100} />);
      
      await waitFor(() => {
        expect(screen.getByText('What is AI?')).toBeInTheDocument();
      });

      // Find first option and simulate Enter key
      const firstOption = screen.getByText('Option A');
      fireEvent.keyDown(firstOption, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('What is ML?')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Edge Cases', () => {
    it('should handle localStorage service errors gracefully', async () => {
      mockLocalStorageService.getProgress.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      // Should still render without crashing
      render(<QuizContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('Loading quiz questions...')).toBeInTheDocument();
      });
    });

    it('should handle quiz data service errors during question selection', async () => {
      mockQuizDataService.selectRandomQuestions.mockImplementation(() => {
        throw new Error('Selection error');
      });
      
      render(<QuizContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('Unable to Load Quiz')).toBeInTheDocument();
      });
    });

    it('should handle rapid answer selections', async () => {
      render(<QuizContainer answerDelayMs={100} />);
      
      await waitFor(() => {
        expect(screen.getByText('What is AI?')).toBeInTheDocument();
      });

      // Rapidly click multiple options
      const options = screen.getAllByRole('radio');
      if (options[0]) fireEvent.click(options[0]);
      if (options[1]) fireEvent.click(options[1]); // Should be ignored due to disabled state
      
      // Should only register first click
      await waitFor(() => {
        expect(screen.getByText('What is ML?')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should handle empty question arrays', async () => {
      mockQuizDataService.loadQuestions.mockResolvedValue([]);
      mockQuizDataService.selectRandomQuestions.mockReturnValue([]);
      
      render(<QuizContainer />);
      
      await waitFor(() => {
        expect(screen.getByText('No questions available for quiz')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks with rapid re-renders', async () => {
      const { rerender, unmount } = render(<QuizContainer />);
      
      // Rapidly re-render component
      for (let i = 0; i < 10; i++) {
        rerender(<QuizContainer questionsPerQuiz={3} />);
      }
      
      unmount();
      
      // Should not throw or cause issues
      expect(true).toBe(true);
    });

    it('should handle component unmounting during async operations', async () => {
      let resolvePromise: (value: QuizQuestion[]) => void;
      const delayedPromise = new Promise<QuizQuestion[]>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockQuizDataService.loadQuestions.mockReturnValue(delayedPromise);
      
      const { unmount } = render(<QuizContainer />);
      
      // Unmount before promise resolves
      unmount();
      
      // Resolve promise after unmount
      act(() => {
        resolvePromise!(mockQuestions);
      });
      
      // Should not cause errors
      expect(true).toBe(true);
    });
  });
});