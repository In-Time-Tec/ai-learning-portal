/**
 * HomePage Component Tests
 * 
 * Comprehensive test suite for the HomePage component including
 * navigation, display, accessibility, and responsive behavior.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomePage } from './HomePage';
import { UserProgress } from '../types';

// Mock user progress data for testing
const mockUserProgress: UserProgress = {
  quizAttempts: [
    {
      timestamp: Date.now() - 86400000, // 1 day ago
      score: 2,
      totalQuestions: 3,
      questionsAnswered: ['artificial-intelligence', 'machine-learning']
    },
    {
      timestamp: Date.now() - 43200000, // 12 hours ago
      score: 3,
      totalQuestions: 3,
      questionsAnswered: ['neural-network', 'deep-learning', 'nlp']
    }
  ],
  answeredTerms: new Set(['artificial-intelligence', 'machine-learning', 'neural-network', 'deep-learning', 'nlp']),
  bestScore: 3
};

const mockEmptyUserProgress: UserProgress = {
  quizAttempts: [],
  answeredTerms: new Set(),
  bestScore: 0
};

describe('HomePage Component', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('renders the main title and description', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByRole('heading', { name: /ai learning portal/i })).toBeInTheDocument();
      expect(screen.getByText(/explore ai concepts and discover tools/i)).toBeInTheDocument();
    });



    it('renders Start Here, Learn and Tools sections', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByRole('heading', { name: 'Start Here' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Learn' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument();
    });

    it('renders section cards with correct content', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      // Introduction section card
      expect(screen.getByRole('button', { name: /ai introduction & risks/i })).toBeInTheDocument();
      expect(screen.getByText(/understand both the promise and perils/i)).toBeInTheDocument();

      // Learn section card
      expect(screen.getByRole('button', { name: /interactive learning/i })).toBeInTheDocument();
      expect(screen.getByText(/explore 16 essential ai terms/i)).toBeInTheDocument();

      // Tools section card
      expect(screen.getByRole('button', { name: /ai tools showcase/i })).toBeInTheDocument();
      expect(screen.getByText(/browse ai development tools/i)).toBeInTheDocument();
    });

    it('displays progress statistics correctly', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      // Check progress summary section
      expect(screen.getByRole('heading', { name: /your progress/i })).toBeInTheDocument();
      
      // Check individual stats by their labels
      expect(screen.getByText('Terms Explored')).toBeInTheDocument();
      expect(screen.getByText('Quiz Attempts')).toBeInTheDocument();
      expect(screen.getByText('Best Score')).toBeInTheDocument();
    });

    it('displays learn section stats with progress information', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      // Should show terms completed, percentage, and best score
      expect(screen.getByText(/5\/16 terms explored • 31% complete • best quiz score: 3/i)).toBeInTheDocument();
    });

    it('handles empty user progress correctly', () => {
      render(
        <HomePage
          userProgress={mockEmptyUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText(/0\/16 terms explored • 0% complete/i)).toBeInTheDocument();
      // Check that stats show zeros
      expect(screen.getByText('Terms Explored')).toBeInTheDocument();
      expect(screen.getByText('Quiz Attempts')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('calls onNavigate with "introduction" when Introduction section card is clicked', async () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      const introductionCard = screen.getByRole('button', { name: /ai introduction & risks/i });
      fireEvent.click(introductionCard);

      expect(mockOnNavigate).toHaveBeenCalledWith('introduction');
      expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    });

    it('calls onNavigate with "learn" when Learn section card is clicked', async () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      const learnCard = screen.getByRole('button', { name: /interactive learning/i });
      fireEvent.click(learnCard);

      expect(mockOnNavigate).toHaveBeenCalledWith('learn');
      expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    });

    it('calls onNavigate with "ai-tools" when Tools section card is clicked', async () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      const toolsCard = screen.getByRole('button', { name: /ai tools showcase/i });
      fireEvent.click(toolsCard);

      expect(mockOnNavigate).toHaveBeenCalledWith('ai-tools');
      expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation with Enter key', async () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      const introductionCard = screen.getByRole('button', { name: /ai introduction & risks/i });
      introductionCard.focus();
      fireEvent.keyDown(introductionCard, { key: 'Enter', code: 'Enter' });

      expect(mockOnNavigate).toHaveBeenCalledWith('introduction');
    });

    it('supports keyboard navigation with Space key', async () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      const toolsCard = screen.getByRole('button', { name: /ai tools showcase/i });
      toolsCard.focus();
      fireEvent.keyDown(toolsCard, { key: ' ', code: 'Space' });

      expect(mockOnNavigate).toHaveBeenCalledWith('ai-tools');
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure for accessibility', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      // Check for proper semantic elements
      expect(screen.getAllByRole('region')).toHaveLength(3); // Introduction, Learn and Tools sections
      expect(screen.getAllByRole('button')).toHaveLength(3); // Navigation cards
      expect(screen.getAllByRole('heading')).toHaveLength(8); // Main, sections, cards, progress
    });

    it('has proper heading hierarchy', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThanOrEqual(2);
      expect(headings[0]?.tagName).toBe('H1'); // Main title
      expect(headings[1]?.tagName).toBe('H2'); // Learn section
      // The order includes card titles (H3) before the Tools section (H2)
      const h2Headings = headings.filter(h => h.tagName === 'H2');
      const h3Headings = headings.filter(h => h.tagName === 'H3');
      expect(h2Headings.length).toBe(3); // Start Here, Learn and Tools sections
      expect(h3Headings.length).toBeGreaterThanOrEqual(3); // Card titles and Progress title
    });

    it('has proper ARIA labels and descriptions', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      // Check section labeling by finding sections with proper aria-labelledby
      const introductionSection = screen.getByRole('region', { name: /start here/i });
      expect(introductionSection).toBeInTheDocument();

      const learnSection = screen.getByRole('region', { name: /learn/i });
      expect(learnSection).toBeInTheDocument();

      const toolsSection = screen.getByRole('region', { name: /tools/i });
      expect(toolsSection).toBeInTheDocument();

      // Check stats descriptions
      expect(screen.getByLabelText(/statistics: 5\/16 terms explored/i)).toBeInTheDocument();
    });

    it('supports screen readers with proper semantic structure', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      // Check for proper section elements
      const sections = screen.getAllByRole('region');
      expect(sections.length).toBeGreaterThanOrEqual(3); // Introduction, Learn and Tools sections

      // Check for proper button roles
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3); // Introduction, Learn and Tools cards
    });
  });

  describe('Responsive Design', () => {
    it('applies custom className when provided', () => {
      const { container } = render(
        <HomePage
          className="custom-class"
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      expect(container.firstChild).toHaveClass('home-page', 'custom-class');
    });

    it('handles long statistics text gracefully', () => {
      const longProgressData: UserProgress = {
        ...mockUserProgress,
        answeredTerms: new Set(Array.from({ length: 16 }, (_, i) => `term-${i}`)),
        quizAttempts: Array.from({ length: 50 }, (_, i) => ({
          timestamp: Date.now() - i * 3600000,
          score: Math.floor(Math.random() * 3) + 1,
          totalQuestions: 3,
          questionsAnswered: [`term-${i % 16}`]
        })),
        bestScore: 3
      };

      render(
        <HomePage
          userProgress={longProgressData}
          onNavigate={mockOnNavigate}
        />
      );

      // Should show 100% completion
      expect(screen.getByText(/16\/16 terms explored • 100% complete/i)).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument(); // Quiz attempts
    });
  });

  describe('Edge Cases', () => {
    it('handles missing onNavigate prop gracefully', () => {
      // This test ensures the component doesn't crash if onNavigate is undefined
      const { container } = render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={undefined as any}
        />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('calculates percentage correctly for edge cases', () => {
      const fullProgressData: UserProgress = {
        ...mockUserProgress,
        answeredTerms: new Set(Array.from({ length: 16 }, (_, i) => `term-${i}`))
      };

      render(
        <HomePage
          userProgress={fullProgressData}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText(/16\/16 terms explored • 100% complete/i)).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('provides visual feedback on hover (tested via CSS classes)', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      const learnCard = screen.getByRole('button', { name: /interactive learning/i });
      expect(learnCard).toHaveClass('home-page__section-card');
      expect(learnCard).toHaveClass('home-page__learn-card');
    });

    it('maintains focus management for keyboard users', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      const learnCard = screen.getByRole('button', { name: /interactive learning/i });
      const toolsCard = screen.getByRole('button', { name: /ai tools showcase/i });

      // Focus should be manageable
      learnCard.focus();
      expect(learnCard).toHaveFocus();

      toolsCard.focus();
      expect(toolsCard).toHaveFocus();
    });
  });

  describe('Content Validation', () => {
    it('displays correct icons for each section', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      // Icons are rendered as text content within the cards
      expect(screen.getByText('🧠')).toBeInTheDocument(); // Introduction icon
      expect(screen.getByText('📚')).toBeInTheDocument(); // Learn icon
      expect(screen.getByText('🛠️')).toBeInTheDocument(); // Tools icon
    });

    it('shows appropriate stats labels', () => {
      render(
        <HomePage
          userProgress={mockUserProgress}
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByText('Terms Explored')).toBeInTheDocument();
      expect(screen.getByText('Quiz Attempts')).toBeInTheDocument();
      expect(screen.getByText('Best Score')).toBeInTheDocument();
    });
  });
});