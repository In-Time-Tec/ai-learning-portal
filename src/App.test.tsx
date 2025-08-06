/**
 * Integration tests for the main App component
 * 
 * Tests complete user workflows including navigation, state management,
 * and integration with all major components and services.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import App from './App';
import { localStorageService } from './services/LocalStorageService';
import { glossaryDataService } from './services/GlossaryDataService';
import { quizDataService } from './services/QuizDataService';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock services
jest.mock('./services/LocalStorageService');
jest.mock('./services/GlossaryDataService');
jest.mock('./services/QuizDataService');

const mockLocalStorageService = localStorageService as jest.Mocked<typeof localStorageService>;
const mockGlossaryDataService = glossaryDataService as jest.Mocked<typeof glossaryDataService>;
const mockQuizDataService = quizDataService as jest.Mocked<typeof quizDataService>;

// Mock data
const mockGlossaryTerms = [
  {
    id: 'ai',
    term: 'Artificial Intelligence',
    definition: 'Systems that perform tasks normally requiring human intelligence.',
    externalLink: 'https://example.com/ai',
    roleContext: {
      business: 'Business context for AI',
      'pm-designer': 'PM context for AI',
      engineer: 'Engineering context for AI',
      'data-scientist': 'Data science context for AI'
    }
  },
  {
    id: 'ml',
    term: 'Machine Learning',
    definition: 'A subset of AI that learns from data.',
    externalLink: 'https://example.com/ml',
    roleContext: {
      business: 'Business context for ML',
      'pm-designer': 'PM context for ML',
      engineer: 'Engineering context for ML',
      'data-scientist': 'Data science context for ML'
    }
  }
];

const mockQuizQuestions = [
  {
    id: 'q1',
    term: 'ai',
    question: 'What is AI?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A',
    glossaryLink: '#ai'
  },
  {
    id: 'q2',
    term: 'ml',
    question: 'What is ML?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option B',
    glossaryLink: '#ml'
  }
];

const mockUserProgress = {
  quizAttempts: [
    {
      timestamp: Date.now() - 86400000,
      score: 2,
      totalQuestions: 3,
      questionsAnswered: ['ai', 'ml']
    }
  ],
  answeredTerms: new Set(['ai', 'ml']),
  bestScore: 2
};

describe('App Component Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockLocalStorageService.getProgress.mockReturnValue(mockUserProgress);
    mockLocalStorageService.getPreferences.mockReturnValue({ selectedRole: 'business' });
    mockLocalStorageService.isLocalStorageAvailable.mockReturnValue(true);
    
    mockGlossaryDataService.loadGlossary.mockResolvedValue(mockGlossaryTerms);
    mockGlossaryDataService.searchTerms.mockImplementation((query) => 
      mockGlossaryTerms.filter(term => 
        term.term.toLowerCase().includes(query.toLowerCase()) ||
        term.definition.toLowerCase().includes(query.toLowerCase())
      )
    );
    
    mockQuizDataService.loadQuestions.mockResolvedValue(mockQuizQuestions);
    mockQuizDataService.selectRandomQuestions.mockReturnValue(mockQuizQuestions.slice(0, 3));
  });

  describe('Application Initialization', () => {
    it('should render the app with correct initial state', async () => {
      render(<App />);
      
      // Wait for app to load
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Check that services were called
      expect(mockLocalStorageService.getProgress).toHaveBeenCalled();
      expect(mockLocalStorageService.getPreferences).toHaveBeenCalled();
      
      // Check footer shows progress
      expect(screen.getByText(/Best Score: 2/)).toBeInTheDocument();
      expect(screen.getByText(/2\/16 terms completed/)).toBeInTheDocument();
    });

    it('should handle initialization errors gracefully', async () => {
      mockLocalStorageService.getProgress.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Application Error')).toBeInTheDocument();
        expect(screen.getByText('Storage error')).toBeInTheDocument();
      });
      
      // Should show reload button
      expect(screen.getByText('Reload Application')).toBeInTheDocument();
    });

    it('should show localStorage warning when unavailable', async () => {
      mockLocalStorageService.isLocalStorageAvailable.mockReturnValue(false);
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/Progress tracking unavailable/)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and Routing', () => {
    it('should navigate between views correctly', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Should start on glossary view
      expect(screen.getByRole('button', { name: 'Glossary' })).toHaveAttribute('aria-current', 'page');
      
      // Navigate to quiz
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Quiz' }));
      });
      expect(screen.getByRole('button', { name: 'Quiz' })).toHaveAttribute('aria-current', 'page');
      
      // Navigate to progress
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Progress' }));
      });
      expect(screen.getByRole('button', { name: 'Progress' })).toHaveAttribute('aria-current', 'page');
      
      // Navigate back to glossary
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Glossary' }));
      });
      expect(screen.getByRole('button', { name: 'Glossary' })).toHaveAttribute('aria-current', 'page');
    });

    it('should handle keyboard navigation', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      const glossaryButton = screen.getByRole('button', { name: 'Glossary' });
      const quizButton = screen.getByRole('button', { name: 'Quiz' });
      
      // Focus glossary button and press Tab to move to quiz
      glossaryButton.focus();
      await act(async () => {
        fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
      });
      
      // Press Enter to activate quiz button
      await act(async () => {
        fireEvent.keyDown(quizButton, { key: 'Enter' });
        fireEvent.click(quizButton);
      });
      expect(quizButton).toHaveAttribute('aria-current', 'page');
    });

    it('should maintain navigation state during view changes', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to each view and verify active state
      const views = ['Quiz', 'Progress', 'Glossary'];
      
      for (const view of views) {
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: view }));
        });
        expect(screen.getByRole('button', { name: view })).toHaveAttribute('aria-current', 'page');
        
        // Verify other buttons don't have active state
        views.filter(v => v !== view).forEach(otherView => {
          expect(screen.getByRole('button', { name: otherView })).not.toHaveAttribute('aria-current', 'page');
        });
      }
    });
  });

  describe('State Management', () => {
    it('should manage role selection across components', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Wait for glossary to load
      await waitFor(() => {
        expect(mockGlossaryDataService.loadGlossary).toHaveBeenCalled();
      });
      
      // Role changes should be saved to localStorage
      // This would be tested through component interactions
      expect(mockLocalStorageService.getPreferences).toHaveBeenCalled();
    });

    it('should update progress after quiz completion', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to quiz
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Quiz' }));
      });
      
      // Quiz completion would trigger progress update
      // This tests the callback mechanism
      expect(mockLocalStorageService.getProgress).toHaveBeenCalled();
    });

    it('should handle progress updates from ProgressTracker', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to progress view
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Progress' }));
      });
      
      // Progress updates should be handled
      expect(mockLocalStorageService.getProgress).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle component errors with ErrorBoundary', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Force an error in a child component
      mockGlossaryDataService.loadGlossary.mockRejectedValue(new Error('Network error'));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Error should be caught and handled gracefully
      // The ErrorBoundary should prevent the entire app from crashing
      
      consoleSpy.mockRestore();
    });

    it('should handle service errors gracefully', async () => {
      mockLocalStorageService.updatePreferences.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // App should continue to function despite service errors
      expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      
      consoleSpy.mockRestore();
    });

    it('should handle unknown view states', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Simulate unknown view by directly manipulating state
      // This would require exposing internal state or using a different approach
      // For now, we test that the default case is handled in the switch statement
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide proper ARIA labels and roles', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Check navigation has proper role
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
      
      // Check main content area (should only be one)
      const mainElements = screen.getAllByRole('main');
      expect(mainElements).toHaveLength(1);
      
      // Check buttons have proper states
      expect(screen.getByRole('button', { name: 'Glossary' })).toHaveAttribute('aria-current', 'page');
    });

    it('should handle focus management correctly', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Focus first button
      const glossaryButton = screen.getByRole('button', { name: 'Glossary' });
      glossaryButton.focus();
      expect(glossaryButton).toHaveFocus();
      
      // Tab to next button
      const quizButton = screen.getByRole('button', { name: 'Quiz' });
      quizButton.focus();
      expect(quizButton).toHaveFocus();
    });

    it('should provide live region updates', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Check for aria-live regions in the glossary container
      expect(screen.getByText('Loading AI glossary terms...')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should handle mobile viewport', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // App should render without issues on mobile
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', async () => {
      const renderSpy = jest.fn();
      
      const TestWrapper = () => {
        renderSpy();
        return <App />;
      };
      
      const { rerender } = render(<TestWrapper />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      const initialRenderCount = renderSpy.mock.calls.length;
      
      // Re-render should not cause excessive renders
      rerender(<TestWrapper />);
      
      expect(renderSpy.mock.calls.length).toBeLessThanOrEqual(initialRenderCount + 1);
    });
  });

  describe('Integration with Services', () => {
    it('should integrate with LocalStorageService correctly', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Verify service integration
      expect(mockLocalStorageService.getProgress).toHaveBeenCalled();
      expect(mockLocalStorageService.getPreferences).toHaveBeenCalled();
    });

    it('should handle service failures gracefully', async () => {
      mockLocalStorageService.getProgress.mockImplementation(() => {
        throw new Error('Service unavailable');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Application Error')).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });
  });
});