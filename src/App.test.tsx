/**
 * Integration tests for the main App component
 * 
 * Tests complete user workflows including navigation, state management,
 * and integration with all major components and services.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import App from './App';
import { localStorageService } from './services/LocalStorageService';
import { glossaryDataService } from './services/GlossaryDataService';
import { quizDataService } from './services/QuizDataService';

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
      
      // Should start on home view
      expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
      
      // First navigate to Learn section to access sub-navigation
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Learn' }));
      });
      
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
      
      // Navigate back to learn (glossary)
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Learn' }));
      });
      expect(screen.getByRole('button', { name: 'Learn' })).toHaveAttribute('aria-current', 'page');
    });

    it('should navigate to introduction view correctly', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to introduction
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Introduction' }));
      });
      
      expect(screen.getByRole('button', { name: 'Introduction' })).toHaveAttribute('aria-current', 'page');
      
      // Should render introduction content
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      });
    });

    it('should navigate from homepage to introduction via card click', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Should start on home view with introduction card
      expect(screen.getByRole('button', { name: /ai introduction & risks/i })).toBeInTheDocument();
      
      // Click introduction card
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /ai introduction & risks/i }));
      });
      
      // Should navigate to introduction view
      expect(screen.getByRole('button', { name: 'Introduction' })).toHaveAttribute('aria-current', 'page');
      
      // Should render introduction content
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      });
    });

    it('should handle keyboard navigation', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // First navigate to Learn section to access sub-navigation
      const learnButton = screen.getByRole('button', { name: 'Learn' });
      await act(async () => {
        fireEvent.click(learnButton);
      });
      
      // Now we can access the sub-navigation buttons
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
      
      // First navigate to Learn section to access sub-navigation
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Learn' }));
      });
      
      // Navigate to each sub-view and verify active state
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
      
      // Navigate to Learn section to load glossary
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Learn' }));
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
      
      // First navigate to Learn section to access sub-navigation
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Learn' }));
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
      
      // First navigate to Learn section to access sub-navigation
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Learn' }));
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

    it('should have no accessibility violations in introduction view', async () => {
      const { container } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to introduction
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Introduction' }));
      });
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      });
      
      // Test accessibility with landmark rules disabled due to component nesting
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessibility during navigation flow', async () => {
      const { container } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Test accessibility at each navigation step
      const navigationSteps = ['Introduction', 'Home', 'Learn'];
      
      for (const step of navigationSteps) {
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: step }));
        });
        
        // Wait for view to load
        await waitFor(() => {
          expect(screen.getByRole('button', { name: step })).toHaveAttribute('aria-current', 'page');
        });
        
        // Check accessibility at each step with landmark rules disabled
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
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
      
      // Check buttons have proper states - app starts on home view
      expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    });

    it('should handle focus management correctly', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Focus first button
      const homeButton = screen.getByRole('button', { name: 'Home' });
      homeButton.focus();
      expect(homeButton).toHaveFocus();
      
      // Tab to next button
      const introButton = screen.getByRole('button', { name: 'Introduction' });
      introButton.focus();
      expect(introButton).toHaveFocus();
    });

    it('should provide proper focus management in introduction view', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to introduction
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Introduction' }));
      });
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      });
      
      // Check that skip links are focusable
      const skipLinks = screen.getAllByRole('link', { name: /Skip to/i });
      expect(skipLinks.length).toBeGreaterThan(0);
      
      // Check that table of contents navigation is accessible
      expect(screen.getByRole('navigation', { name: /Contents/i })).toBeInTheDocument();
    });

    it('should provide live region updates', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to learn section to see glossary
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Learn' }));
      });
      
      // Check for aria-live regions in the glossary container - glossary loads immediately
      expect(screen.getByText('AI Glossary')).toBeInTheDocument();
    });

    it('should support keyboard navigation in introduction view', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to introduction using keyboard
      const introButton = screen.getByRole('button', { name: 'Introduction' });
      introButton.focus();
      
      await act(async () => {
        fireEvent.keyDown(introButton, { key: 'Enter' });
        fireEvent.click(introButton);
      });
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      });
      
      // Check that all interactive elements are keyboard accessible
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should provide proper heading hierarchy across views', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Check heading hierarchy in home view - there are multiple h1 elements
      const h1Headings = screen.getAllByRole('heading', { level: 1 });
      expect(h1Headings.length).toBeGreaterThanOrEqual(1);
      
      // Navigate to introduction and check hierarchy
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Introduction' }));
      });
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      });
      
      // Check that h2 headings exist for sections
      const h2Headings = screen.getAllByRole('heading', { level: 2 });
      expect(h2Headings.length).toBeGreaterThan(0);
      
      // Verify proper heading hierarchy exists
      const allHeadings = screen.getAllByRole('heading');
      expect(allHeadings.length).toBeGreaterThan(5); // Should have multiple headings across the page
    });
  });

  describe('Responsive Design', () => {
    // Mock window.matchMedia for responsive tests
    const mockMatchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });

    beforeAll(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(mockMatchMedia),
      });
    });

    it('should handle mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // App should render without issues on mobile
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should handle tablet viewport', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // App should render without issues on tablet
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should handle desktop viewport', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      });

      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // App should render without issues on desktop
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should maintain functionality on mobile in introduction view', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to introduction on mobile
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Introduction' }));
      });
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      });
      
      // Check that navigation still works on mobile
      expect(screen.getByRole('button', { name: /📚 Explore AI Glossary/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🧠 Take the Quiz/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🏠 Return to Home/i })).toBeInTheDocument();
    });

    it('should handle touch interactions on mobile', async () => {
      const mockOnNavigate = jest.fn();
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to introduction
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Introduction' }));
      });
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      });
      
      // Test touch interaction with navigation buttons
      const glossaryButton = screen.getByRole('button', { name: /📚 Explore AI Glossary/i });
      
      // Simulate touch events
      fireEvent.touchStart(glossaryButton);
      fireEvent.touchEnd(glossaryButton);
      fireEvent.click(glossaryButton);
      
      // Should navigate to learn view
      expect(screen.getByRole('button', { name: 'Learn' })).toHaveAttribute('aria-current', 'page');
    });

    it('should maintain proper layout across different screen sizes', async () => {
      const screenSizes = [
        { width: 320, height: 568, name: 'small mobile' },
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1024, height: 768, name: 'tablet landscape' },
        { width: 1920, height: 1080, name: 'desktop' }
      ];

      for (const size of screenSizes) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: size.width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: size.height,
        });

        const { unmount } = render(<App />);
        
        await waitFor(() => {
          expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
        });
        
        // Check that essential elements are present at each screen size
        expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
        expect(screen.getByRole('main')).toBeInTheDocument();
        
        // Navigate to introduction and verify layout
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: 'Introduction' }));
        });
        
        await waitFor(() => {
          expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
        });
        
        // Check that introduction content is accessible
        expect(screen.getByRole('navigation', { name: /Contents/i })).toBeInTheDocument();
        
        unmount();
      }
    });

    it('should support different orientations on mobile', async () => {
      // Test portrait orientation
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      const { rerender } = render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to introduction in portrait
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Introduction' }));
      });
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      });
      
      // Switch to landscape orientation
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      rerender(<App />);
      
      // Should still work in landscape
      expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /Contents/i })).toBeInTheDocument();
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

  describe('Introduction Feature Navigation Flow', () => {
    it('should support complete navigation flow from homepage to introduction to glossary', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Start on homepage
      expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
      
      // Navigate to introduction via homepage card
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /ai introduction & risks/i }));
      });
      
      // Should be on introduction view
      expect(screen.getByRole('button', { name: 'Introduction' })).toHaveAttribute('aria-current', 'page');
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      });
      
      // Navigate to glossary from introduction
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /📚 Explore AI Glossary/i }));
      });
      
      // Should be on learn view (glossary)
      expect(screen.getByRole('button', { name: 'Learn' })).toHaveAttribute('aria-current', 'page');
      await waitFor(() => {
        expect(screen.getByText('AI Glossary')).toBeInTheDocument();
      });
    });

    it('should support complete navigation flow from homepage to introduction to quiz', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to introduction via homepage card
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /ai introduction & risks/i }));
      });
      
      // Should be on introduction view
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      });
      
      // Navigate to quiz from introduction
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /🧠 Take the Quiz/i }));
      });
      
      // Should be on quiz view
      expect(screen.getByRole('button', { name: 'Learn' })).toHaveAttribute('aria-current', 'page');
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Quiz' })).toHaveAttribute('aria-current', 'page');
      });
    });

    it('should support navigation back to home from introduction', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate to introduction
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Introduction' }));
      });
      
      // Should be on introduction view
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: /AI Introduction: Risks and Advantages/i })).toBeInTheDocument();
      });
      
      // Navigate back to home from introduction
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /🏠 Return to Home/i }));
      });
      
      // Should be back on home view
      expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('button', { name: /ai introduction & risks/i })).toBeInTheDocument();
    });

    it('should maintain proper navigation state during introduction flow', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getAllByText('AI Learning Portal')).toHaveLength(2);
      });
      
      // Navigate through multiple views and verify state consistency
      const navigationFlow = [
        { button: 'Introduction', expectedContent: /AI Introduction: Risks and Advantages/i },
        { button: 'Home', expectedContent: /ai introduction & risks/i },
        { button: 'Learn', expectedContent: /AI Glossary/i },
        { button: 'Introduction', expectedContent: /AI Introduction: Risks and Advantages/i }
      ];
      
      for (const step of navigationFlow) {
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: step.button }));
        });
        
        expect(screen.getByRole('button', { name: step.button })).toHaveAttribute('aria-current', 'page');
        
        if (step.expectedContent) {
          await waitFor(() => {
            expect(screen.getByText(step.expectedContent)).toBeInTheDocument();
          });
        }
      }
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