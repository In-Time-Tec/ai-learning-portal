import React, { useState, useCallback } from 'react';
import { QuizQuestion as QuizQuestionType } from '../types';
import './QuizQuestion.css';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswerSelected: (questionId: string, selectedAnswer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

interface AnswerState {
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  showFeedback: boolean;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  onAnswerSelected,
  disabled = false
}) => {
  const [answerState, setAnswerState] = useState<AnswerState>({
    selectedAnswer: null,
    isCorrect: null,
    showFeedback: false
  });

  const handleAnswerSelect = useCallback((selectedAnswer: string) => {
    if (disabled || answerState.showFeedback) {
      return;
    }

    const isCorrect = selectedAnswer === question.correctAnswer;
    
    setAnswerState({
      selectedAnswer,
      isCorrect,
      showFeedback: true
    });

    // Notify parent component
    onAnswerSelected(question.id, selectedAnswer, isCorrect);
  }, [question.id, question.correctAnswer, onAnswerSelected, disabled, answerState.showFeedback]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, answer: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleAnswerSelect(answer);
    }
  }, [handleAnswerSelect]);

  const getOptionClassName = (option: string): string => {
    const baseClass = 'quiz-question__option';
    
    if (!answerState.showFeedback) {
      return `${baseClass} ${disabled ? 'quiz-question__option--disabled' : ''}`;
    }

    if (option === question.correctAnswer) {
      return `${baseClass} quiz-question__option--correct`;
    }

    if (option === answerState.selectedAnswer && !answerState.isCorrect) {
      return `${baseClass} quiz-question__option--incorrect`;
    }

    return `${baseClass} quiz-question__option--neutral`;
  };

  const getOptionAriaLabel = (option: string): string => {
    if (!answerState.showFeedback) {
      return `Answer option: ${option}`;
    }

    if (option === question.correctAnswer) {
      return `Correct answer: ${option}`;
    }

    if (option === answerState.selectedAnswer && !answerState.isCorrect) {
      return `Your incorrect answer: ${option}`;
    }

    return `Answer option: ${option}`;
  };

  return (
    <div className="quiz-question" role="group" aria-labelledby={`question-${question.id}`}>
      <h3 
        id={`question-${question.id}`}
        className="quiz-question__text"
      >
        {question.question}
      </h3>
      
      <div 
        className="quiz-question__options"
        role="radiogroup"
        aria-labelledby={`question-${question.id}`}
        aria-describedby={answerState.showFeedback ? `feedback-${question.id}` : undefined}
      >
        {question.options.map((option, index) => (
          <button
            key={`${question.id}-option-${index}`}
            type="button"
            className={getOptionClassName(option)}
            onClick={() => handleAnswerSelect(option)}
            onKeyDown={(e) => handleKeyDown(e, option)}
            disabled={disabled || answerState.showFeedback}
            aria-label={getOptionAriaLabel(option)}
            role="radio"
            aria-checked={answerState.selectedAnswer === option}
          >
            <span className="quiz-question__option-text">
              {option}
            </span>
            {answerState.showFeedback && option === question.correctAnswer && (
              <span className="quiz-question__correct-indicator" aria-hidden="true">
                ✓
              </span>
            )}
            {answerState.showFeedback && option === answerState.selectedAnswer && !answerState.isCorrect && (
              <span className="quiz-question__incorrect-indicator" aria-hidden="true">
                ✗
              </span>
            )}
          </button>
        ))}
      </div>

      {answerState.showFeedback && (
        <div 
          id={`feedback-${question.id}`}
          className={`quiz-question__feedback ${
            answerState.isCorrect 
              ? 'quiz-question__feedback--correct' 
              : 'quiz-question__feedback--incorrect'
          }`}
          role="status"
          aria-live="polite"
        >
          {answerState.isCorrect ? (
            <span>
              <strong>Correct!</strong> Well done.
            </span>
          ) : (
            <span>
              <strong>Incorrect.</strong> The correct answer is "{question.correctAnswer}".
            </span>
          )}
          
          <a 
            href={question.glossaryLink}
            className="quiz-question__glossary-link"
            aria-label={`Learn more about ${question.term} in the glossary`}
          >
            Learn more about {question.term}
          </a>
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;