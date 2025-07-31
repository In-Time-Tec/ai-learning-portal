import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { QuizQuestion } from './QuizQuestion';
import { QuizQuestion as QuizQuestionType } from '../types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

const mockQuestion: QuizQuestionType = {
  id: 'test-question-001',
  term: 'Artificial Intelligence',
  question: 'What are systems that perform tasks normally requiring human intelligence called?',
  options: ['Machine Learning', 'Artificial Intelligence', 'Neural Networks', 'Deep Learning'],
  correctAnswer: 'Artificial Intelligence',
  glossaryLink: '#artificial-intelligence'
};

const mockOnAnswerSelected = jest.fn();

describe('QuizQuestion Component', () => {
  beforeEach(() => {
    mockOnAnswerSelected.mockClear();
  });

  describe('Rendering', () => {
    it('renders the question text correctly', () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(mockQuestion.question);
    });

    it('renders all answer options', () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      mockQuestion.options.forEach(option => {
        expect(screen.getByRole('radio', { name: new RegExp(option) })).toBeInTheDocument();
      });
    });

    it('renders with proper ARIA structure', () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      // Check for proper ARIA roles and labels
      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(mockQuestion.options.length);
    });

    it('has proper heading association', () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const heading = screen.getByRole('heading', { level: 3 });
      const radiogroup = screen.getByRole('radiogroup');
      
      expect(heading).toHaveAttribute('id', `question-${mockQuestion.id}`);
      expect(radiogroup).toHaveAttribute('aria-labelledby', `question-${mockQuestion.id}`);
    });
  });

  describe('Answer Selection', () => {
    it('calls onAnswerSelected when an option is clicked', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const correctOption = screen.getByRole('radio', { name: /Artificial Intelligence/ });
      await userEvent.click(correctOption);

      expect(mockOnAnswerSelected).toHaveBeenCalledWith(
        mockQuestion.id,
        'Artificial Intelligence',
        true
      );
    });

    it('shows correct feedback for correct answer', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const correctOption = screen.getByRole('radio', { name: /Artificial Intelligence/ });
      await userEvent.click(correctOption);

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('Correct! Well done.');
      });
    });

    it('shows incorrect feedback for wrong answer', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const incorrectOption = screen.getByRole('radio', { name: /Machine Learning/ });
      await userEvent.click(incorrectOption);

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(
          'Incorrect. The correct answer is "Artificial Intelligence".'
        );
      });
    });

    it('highlights correct answer after selection', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const incorrectOption = screen.getByRole('radio', { name: /Machine Learning/ });
      await userEvent.click(incorrectOption);

      await waitFor(() => {
        const correctOption = screen.getByRole('radio', { name: /Correct answer: Artificial Intelligence/ });
        expect(correctOption).toHaveClass('quiz-question__option--correct');
      });
    });

    it('highlights incorrect answer when wrong option is selected', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const incorrectOption = screen.getByRole('radio', { name: /Machine Learning/ });
      await userEvent.click(incorrectOption);

      await waitFor(() => {
        const selectedIncorrectOption = screen.getByRole('radio', { name: /Your incorrect answer: Machine Learning/ });
        expect(selectedIncorrectOption).toHaveClass('quiz-question__option--incorrect');
      });
    });

    it('prevents multiple selections after answer is given', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      // Select first answer
      const firstOption = screen.getByRole('radio', { name: /Machine Learning/ });
      await userEvent.click(firstOption);

      // Try to select second answer
      const secondOption = screen.getByRole('radio', { name: /Neural Networks/ });
      await userEvent.click(secondOption);

      // Should only be called once
      expect(mockOnAnswerSelected).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('responds to Enter key press', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const option = screen.getByRole('radio', { name: /Artificial Intelligence/ });
      option.focus();
      fireEvent.keyDown(option, { key: 'Enter', code: 'Enter' });

      expect(mockOnAnswerSelected).toHaveBeenCalledWith(
        mockQuestion.id,
        'Artificial Intelligence',
        true
      );
    });

    it('responds to Space key press', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const option = screen.getByRole('radio', { name: /Artificial Intelligence/ });
      option.focus();
      fireEvent.keyDown(option, { key: ' ', code: 'Space' });

      expect(mockOnAnswerSelected).toHaveBeenCalledWith(
        mockQuestion.id,
        'Artificial Intelligence',
        true
      );
    });

    it('has proper focus indicators', () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const options = screen.getAllByRole('radio');
      options.forEach(option => {
        expect(option).not.toBeDisabled();
      });
    });

    it('prevents keyboard interaction when disabled', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected}
          disabled={true}
        />
      );

      const option = screen.getByRole('radio', { name: /Artificial Intelligence/ });
      option.focus();
      fireEvent.keyDown(option, { key: 'Enter', code: 'Enter' });

      expect(mockOnAnswerSelected).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('disables all options when disabled prop is true', () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected}
          disabled={true}
        />
      );

      const options = screen.getAllByRole('radio');
      options.forEach(option => {
        expect(option).toBeDisabled();
      });
    });

    it('does not call onAnswerSelected when disabled', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected}
          disabled={true}
        />
      );

      const option = screen.getByRole('radio', { name: /Artificial Intelligence/ });
      await userEvent.click(option);

      expect(mockOnAnswerSelected).not.toHaveBeenCalled();
    });
  });

  describe('Glossary Link', () => {
    it('shows glossary link after answer is selected', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const option = screen.getByRole('radio', { name: /Artificial Intelligence/ });
      await userEvent.click(option);

      await waitFor(() => {
        const glossaryLink = screen.getByRole('link', { 
          name: `Learn more about ${mockQuestion.term} in the glossary` 
        });
        expect(glossaryLink).toHaveAttribute('href', mockQuestion.glossaryLink);
      });
    });

    it('has proper accessibility attributes for glossary link', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const option = screen.getByRole('radio', { name: /Artificial Intelligence/ });
      await userEvent.click(option);

      await waitFor(() => {
        const glossaryLink = screen.getByRole('link');
        expect(glossaryLink).toHaveAttribute('aria-label', 
          `Learn more about ${mockQuestion.term} in the glossary`);
      });
    });
  });

  describe('Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations after answer selection', async () => {
      const { container } = render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const option = screen.getByRole('radio', { name: /Artificial Intelligence/ });
      await userEvent.click(option);

      await waitFor(async () => {
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });

    it('has proper aria-live region for feedback', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const option = screen.getByRole('radio', { name: /Artificial Intelligence/ });
      await userEvent.click(option);

      await waitFor(() => {
        const feedback = screen.getByRole('status');
        expect(feedback).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('updates aria-describedby after feedback is shown', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const radiogroup = screen.getByRole('radiogroup');
      expect(radiogroup).not.toHaveAttribute('aria-describedby');

      const option = screen.getByRole('radio', { name: /Artificial Intelligence/ });
      await userEvent.click(option);

      await waitFor(() => {
        expect(radiogroup).toHaveAttribute('aria-describedby', `feedback-${mockQuestion.id}`);
      });
    });

    it('has proper aria-checked states', async () => {
      render(
        <QuizQuestion 
          question={mockQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      const selectedOption = screen.getByRole('radio', { name: /Artificial Intelligence/ });
      const unselectedOption = screen.getByRole('radio', { name: /Machine Learning/ });

      // Initially no option should be checked
      expect(selectedOption).toHaveAttribute('aria-checked', 'false');
      expect(unselectedOption).toHaveAttribute('aria-checked', 'false');

      await userEvent.click(selectedOption);

      await waitFor(() => {
        expect(selectedOption).toHaveAttribute('aria-checked', 'true');
        expect(unselectedOption).toHaveAttribute('aria-checked', 'false');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles question with minimum options (2)', () => {
      const minimalQuestion: QuizQuestionType = {
        ...mockQuestion,
        options: ['Option A', 'Option B'],
        correctAnswer: 'Option A'
      };

      render(
        <QuizQuestion 
          question={minimalQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      expect(screen.getAllByRole('radio')).toHaveLength(2);
    });

    it('handles very long question text', () => {
      const longQuestion: QuizQuestionType = {
        ...mockQuestion,
        question: 'This is a very long question that might wrap to multiple lines and should still be accessible and properly formatted for users with different screen sizes and assistive technologies.'
      };

      render(
        <QuizQuestion 
          question={longQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(longQuestion.question);
    });

    it('handles special characters in options', () => {
      const specialCharQuestion: QuizQuestionType = {
        ...mockQuestion,
        options: ['Option & Ampersand', 'Option "Quotes"', 'Option <Tags>', 'Option 100%'],
        correctAnswer: 'Option & Ampersand'
      };

      render(
        <QuizQuestion 
          question={specialCharQuestion} 
          onAnswerSelected={mockOnAnswerSelected} 
        />
      );

      specialCharQuestion.options.forEach(option => {
        expect(screen.getByRole('radio', { name: new RegExp(option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })).toBeInTheDocument();
      });
    });
  });
});