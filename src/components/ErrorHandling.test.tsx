/**
 * Error Handling Tests
 * 
 * Tests for comprehensive error handling and recovery paths
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';
import { SkeletonLoader } from './SkeletonLoader';
import { GlossaryContainer } from './GlossaryContainer';
import { QuizContainer } from './QuizContainer';
import { ProgressTracker } from './ProgressTracker';
import { glossaryDataService } from '../services/GlossaryDataService';
import { quizDataService } from '../services/QuizDataService';
import { localStorageService } from '../services/LocalStorageService';

// Mock services
jest.mock('../services/GlossaryDataService');
jest.mock('../services/QuizDataService');
jest.mock('../services/LocalStorageService');

const mockGlossaryService = glossaryDataService as jest.Mocked<typeof glossaryDataService>;
const mockQuizService = quizDataService as jest.Mocked<typeof quizDataService>;
const mockLocalStorageService = localStorageService as jest.Mocked<typeof localStorageService>;

describe('Error Handling Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ErrorMessage Component', () => {
    it('should render network error with appropriate styling and suggestions', () => {
      const onRetry = jest.fn();
      
      render(
        <ErrorMessage
          message="Failed to load data"
          type="network"
          onRetry={onRetry}
        />
      );

      expect(screen.getByText('Connection Problem')).toBeInTheDocument();
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
      expect(screen.getByText('Check your internet connection')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });

    it('should render data error with appropriate styling', () => {
      render(
        <ErrorMessage
          message="Invalid data format"
          type="data"
        />
      );

      expect(screen.getByText('Data Loading Error')).toBeInTheDocument();
      expect(screen.getByText('Invalid data format')).toBeInTheDocument();
      expect(screen.getByText('The data file may be corrupted')).toBeInTheDocument();
    });

    it('should render storage error with appropriate styling', () => {
      render(
        <ErrorMessage
          message="localStorage unavailable"
          type="storage"
        />
      );

      expect(screen.getByText('Storage Error')).toBeInTheDocument();
      expect(screen.getByText('localStorage unavailable')).toBeInTheDocument();
      expect(screen.getByText('Your browser storage may be full')).toBeInTheDocument();
    });

    it('should call retry function when retry button is clicked', () => {
      const onRetry = jest.fn();
      
      render(
        <ErrorMessage
          message="Test error"
          onRetry={onRetry}
        />
      );

      fireEvent.click(screen.getByText('Try Again'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should disable retry button when retrying', () => {
      render(
        <ErrorMessage
          message="Test error"
          onRetry={jest.fn()}
          isRetrying={true}
        />
      );

      const retryButton = screen.getByText('Retrying...');
      expect(retryButton).toBeDisabled();
    });

    it('should render custom actions', () => {
      const customAction = jest.fn();
      
      render(
        <ErrorMessage
          message="Test error"
          actions={[
            { label: 'Custom Action', onClick: customAction, variant: 'primary' }
          ]}
        />
      );

      const actionButton = screen.getByText('Custom Action');
      expect(actionButton).toBeInTheDocument();
      
      fireEvent.click(actionButton);
      expect(customAction).toHaveBeenCalledTimes(1);
    });

    it('should show technical details in development mode', () => {
      render(
        <ErrorMessage
          message="Test error"
          showDetails={true}
          details="Stack trace here"
        />
      );

      expect(screen.getByText('Technical Details (Development Only)')).toBeInTheDocument();
    });
  });

  describe('LoadingSpinner Component', () => {
    it('should render with default props', () => {
      render(<LoadingSpinner />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render with custom message and size', () => {
      render(<LoadingSpinner size="large" message="Loading data..." />);
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should hide message when showMessage is false', () => {
      render(<LoadingSpinner showMessage={false} />);
      
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  describe('SkeletonLoader Component', () => {
    it('should render glossary skeleton', () => {
      render(<SkeletonLoader type="glossary" count={3} />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading content')).toBeInTheDocument();
    });

    it('should render quiz skeleton', () => {
      render(<SkeletonLoader type="quiz" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render progress skeleton', () => {
      render(<SkeletonLoader type="progress" />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});

describe('Component Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockLocalStorageService.getProgress.mockReturnValue({
      quizAttempts: [],
      answeredTerms: new Set(),
      bestScore: 0
    });
    mockLocalStorageService.isLocalStorageAvailable.mockReturnValue(true);
  });

  describe('GlossaryContainer Error Handling', () => {
    it('should show loading skeleton while loading', async () => {
      mockGlossaryService.loadGlossary.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<GlossaryContainer />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading content')).toBeInTheDocument();
    });

    it('should handle network errors gracefully', async () => {
      mockGlossaryService.loadGlossary.mockRejectedValue(
        new Error('Network error: Unable to connect to load glossary data')
      );

      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Glossary')).toBeInTheDocument();
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it('should handle data format errors', async () => {
      mockGlossaryService.loadGlossary.mockRejectedValue(
        new Error('Invalid glossary data format: missing terms array')
      );

      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Glossary')).toBeInTheDocument();
        expect(screen.getByText(/Invalid glossary data format/)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      mockGlossaryService.loadGlossary
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([
          {
            id: 'test',
            term: 'Test Term',
            definition: 'Test definition',
            externalLink: 'https://example.com',
            roleContext: {
              business: 'Business context',
              'pm-designer': 'PM context',
              engineer: 'Engineer context',
              'data-scientist': 'Data scientist context'
            }
          }
        ]);

      render(<GlossaryContainer />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Try Again'));

      await waitFor(() => {
        expect(screen.getByText('Test Term')).toBeInTheDocument();
      });
    });
  });

  describe('QuizContainer Error Handling', () => {
    it('should show loading skeleton while loading', async () => {
      mockQuizService.loadQuestions.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<QuizContainer />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading content')).toBeInTheDocument();
    });

    it('should handle network errors gracefully', async () => {
      mockQuizService.loadQuestions.mockRejectedValue(
        new Error('Network error: Unable to connect to load quiz questions')
      );

      render(<QuizContainer />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Quiz')).toBeInTheDocument();
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it('should handle localStorage errors', async () => {
      mockQuizService.loadQuestions.mockResolvedValue([]);
      mockLocalStorageService.getProgress.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      render(<QuizContainer />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Quiz')).toBeInTheDocument();
      });
    });

    it('should handle no questions available error', async () => {
      mockQuizService.loadQuestions.mockResolvedValue([]);
      mockQuizService.selectRandomQuestions.mockReturnValue([]);

      render(<QuizContainer />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Quiz')).toBeInTheDocument();
        expect(screen.getByText(/No questions available/)).toBeInTheDocument();
      });
    });
  });

  describe('ProgressTracker Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      mockLocalStorageService.getProgress.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      render(<ProgressTracker />);

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Progress')).toBeInTheDocument();
        expect(screen.getByText('localStorage unavailable')).toBeInTheDocument();
      });
    });

    it('should provide continue without progress option', async () => {
      mockLocalStorageService.getProgress.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      render(<ProgressTracker />);

      await waitFor(() => {
        expect(screen.getByText('Continue Without Progress')).toBeInTheDocument();
      });
    });
  });
});

describe('Service Error Handling', () => {
  describe('Network Timeout Handling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      // Reset the service to test actual implementation
      jest.unmock('../services/GlossaryDataService');
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
    });

    it('should handle fetch timeout in GlossaryDataService', async () => {
      // Mock fetch to never resolve
      global.fetch = jest.fn(() => new Promise(() => {}));

      const { GlossaryDataService } = await import('../services/GlossaryDataService');
      const service = new GlossaryDataService();
      const loadPromise = service.loadGlossary();
      
      // Fast-forward time to trigger timeout
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await expect(loadPromise).rejects.toThrow('Request timeout');
    });
  });

  describe('Malformed Data Handling', () => {
    beforeEach(() => {
      jest.unmock('../services/GlossaryDataService');
    });

    it('should handle malformed JSON in glossary data', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new SyntaxError('Unexpected token'))
      });

      const { GlossaryDataService } = await import('../services/GlossaryDataService');
      const service = new GlossaryDataService();

      await expect(service.loadGlossary()).rejects.toThrow(
        'Invalid glossary data format: file contains malformed JSON'
      );
    });

    it('should handle missing required fields in glossary data', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          terms: [
            { id: 'test', term: 'Test' } // Missing required fields
          ]
        })
      });

      const { GlossaryDataService } = await import('../services/GlossaryDataService');
      const service = new GlossaryDataService();

      await expect(service.loadGlossary()).rejects.toThrow(
        'No valid terms found in data file'
      );
    });
  });

  describe('Storage Quota Handling', () => {
    it('should handle localStorage quota exceeded error', () => {
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      
      // Mock localStorage.setItem to throw quota error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw quotaError;
      });

      // This should not throw, but handle gracefully
      expect(() => {
        localStorageService.updateProgress({ bestScore: 1 });
      }).not.toThrow();

      // Restore original method
      Storage.prototype.setItem = originalSetItem;
    });
  });
});

describe('Error Recovery Paths', () => {
  it('should allow users to navigate to different sections after error', async () => {
    mockGlossaryService.loadGlossary.mockRejectedValue(new Error('Network error'));

    render(<GlossaryContainer />);

    await waitFor(() => {
      expect(screen.getByText('Go to Quiz')).toBeInTheDocument();
    });

    // Mock window.location.hash assignment
    delete (window as any).location;
    window.location = { ...window.location, hash: '' };

    fireEvent.click(screen.getByText('Go to Quiz'));
    
    expect(window.location.hash).toBe('#quiz');
  });

  it('should allow page reload as recovery option', async () => {
    mockQuizService.loadQuestions.mockRejectedValue(new Error('Data error'));

    // Mock window.location.reload
    const mockReload = jest.fn();
    delete (window as any).location;
    window.location = { ...window.location, reload: mockReload };

    render(<QuizContainer />);

    await waitFor(() => {
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Reload Page'));
    
    expect(mockReload).toHaveBeenCalledTimes(1);
  });
});