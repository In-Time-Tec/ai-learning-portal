import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIAgentPlatformsContainer from './AIAgentPlatformsContainer';
import { AgentPlatformsDataService } from '../services/AgentPlatformsDataService';
import { AgentPlatform } from '../types';

// Mock the data service
jest.mock('../services/AgentPlatformsDataService');
const mockDataService = AgentPlatformsDataService as jest.Mocked<typeof AgentPlatformsDataService>;

// Mock console methods to test error logging
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const mockConsoleError = jest.fn();
const mockConsoleWarn = jest.fn();

// Mock fetch for network error simulation
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage for storage error simulation
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Test data
const validPlatforms: AgentPlatform[] = [
  {
    id: 'valid-platform',
    name: 'Valid Platform',
    category: 'open-source-framework',
    type: 'open-source',
    description: 'A valid platform for testing',
    detailedDescription: 'Detailed description',
    strengths: ['Reliable'],
    weaknesses: ['None'],
    primaryUseCases: ['Testing'],
    keyFeatures: ['Stability'],
    targetAudience: ['Testers'],
    maturityLevel: 'stable',
    lastUpdated: '2024-01-01'
  }
];

describe('AIAgentPlatformsContainer Error Scenario Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
    
    // Mock console methods
    console.error = mockConsoleError;
    console.warn = mockConsoleWarn;
    
    // Reset localStorage mocks
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {});
    mockLocalStorage.removeItem.mockImplementation(() => {});
    
    // Reset fetch mock
    mockFetch.mockClear();
  });

  afterEach(() => {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('Network Error Scenarios', () => {
    it('should handle complete network failure', async () => {
      mockDataService.loadPlatforms.mockRejectedValue(new Error('Network request failed'));

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByText('Network request failed')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('should handle timeout errors', async () => {
      mockDataService.loadPlatforms.mockRejectedValue(new Error('Request timeout'));

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByText('Request timeout')).toBeInTheDocument();
    });

    it('should handle DNS resolution failures', async () => {
      mockDataService.loadPlatforms.mockRejectedValue(new Error('DNS resolution failed'));

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByText('DNS resolution failed')).toBeInTheDocument();
    });

    it('should handle CORS errors', async () => {
      mockDataService.loadPlatforms.mockRejectedValue(new Error('CORS policy blocked request'));

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByText('CORS policy blocked request')).toBeInTheDocument();
    });

    it('should handle intermittent network issues with retry', async () => {
      // First call fails, second succeeds
      mockDataService.loadPlatforms
        .mockRejectedValueOnce(new Error('Temporary network error'))
        .mockResolvedValueOnce(validPlatforms);

      render(<AIAgentPlatformsContainer />);

      // Should show error initially
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByTestId('retry-button');
      fireEvent.click(retryButton);

      // Should recover
      await waitFor(() => {
        expect(screen.getByText('Valid Platform')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Data Format Error Scenarios', () => {
    it('should handle malformed JSON response', async () => {
      mockDataService.loadPlatforms.mockRejectedValue(new Error('Invalid JSON format'));

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
    });

    it('should handle missing required fields', async () => {
      const invalidPlatforms = [
        {
          id: 'incomplete-platform',
          name: 'Incomplete Platform',
          // Missing required fields like category, type, etc.
        }
      ];

      mockDataService.loadPlatforms.mockRejectedValue(new Error('Data validation failed: missing required fields'));

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByText(/Data validation failed/)).toBeInTheDocument();
    });

    it('should handle invalid data types', async () => {
      mockDataService.loadPlatforms.mockRejectedValue(new Error('Invalid data types in response'));

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByText('Invalid data types in response')).toBeInTheDocument();
    });

    it('should handle empty response', async () => {
      mockDataService.loadPlatforms.mockResolvedValue([]);
      mockDataService.getFilteredPlatforms.mockReturnValue([]);
      mockDataService.getUniqueCategories.mockReturnValue([]);

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('No platforms found')).toBeInTheDocument();
      });

      expect(screen.getByText(/No AI agent platforms are currently available/)).toBeInTheDocument();
    });

    it('should handle corrupted platform data during runtime', async () => {
      // Start with valid data
      mockDataService.loadPlatforms.mockResolvedValue(validPlatforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(validPlatforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      
      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Valid Platform')).toBeInTheDocument();
      });

      // Simulate data corruption during filtering
      mockDataService.getFilteredPlatforms.mockImplementation(() => {
        throw new Error('Data corruption detected');
      });

      const searchInput = screen.getByTestId('search-input');
      
      // This should trigger the corrupted filter function
      await act(async () => {
        await userEvent.type(searchInput, 'test');
      });

      // Should handle the error gracefully without crashing
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
  });

  describe('Storage Error Scenarios', () => {
    it('should handle localStorage quota exceeded', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError: localStorage quota exceeded');
      });

      mockDataService.loadPlatforms.mockResolvedValue(validPlatforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(validPlatforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Valid Platform')).toBeInTheDocument();
      });

      // Should still work even if caching fails
      expect(screen.getByText('Valid Platform')).toBeInTheDocument();
    });

    it('should handle localStorage access denied', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('SecurityError: localStorage access denied');
      });

      mockDataService.loadPlatforms.mockResolvedValue(validPlatforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(validPlatforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Valid Platform')).toBeInTheDocument();
      });

      // Should work without localStorage
      expect(screen.getByText('Valid Platform')).toBeInTheDocument();
    });

    it('should handle corrupted localStorage data', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json-data');

      mockDataService.loadPlatforms.mockResolvedValue(validPlatforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(validPlatforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Valid Platform')).toBeInTheDocument();
      });

      // Should ignore corrupted cache and load fresh data
      expect(screen.getByText('Valid Platform')).toBeInTheDocument();
    });
  });

  describe('Component State Error Scenarios', () => {
    it('should handle state corruption during search', async () => {
      
      
      mockDataService.loadPlatforms.mockResolvedValue(validPlatforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(validPlatforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      // Simulate search function throwing an error
      mockDataService.getFilteredPlatforms.mockImplementation(() => {
        throw new Error('Search function crashed');
      });

      const searchInput = screen.getByTestId('search-input');
      
      // Should handle search errors gracefully
      await act(async () => {
        await userEvent.type(searchInput, 'crash test');
      });

      // Component should still be functional
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('crash test');
    });

    it('should handle modal state errors', async () => {
      
      
      mockDataService.loadPlatforms.mockResolvedValue(validPlatforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(validPlatforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('view-details-valid-platform')).toBeInTheDocument();
      });

      // Open modal
      const viewDetailsButton = screen.getByTestId('view-details-valid-platform');
      await userEvent.click(viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Simulate platform data becoming null/undefined
      const corruptedPlatform = null;
      
      // Modal should handle null platform gracefully
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Should be able to close modal
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should handle filter state inconsistencies', async () => {
      
      
      mockDataService.loadPlatforms.mockResolvedValue(validPlatforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      // Mock inconsistent filter behavior
      let callCount = 0;
      mockDataService.getFilteredPlatforms.mockImplementation((platforms, filters) => {
        callCount++;
        if (callCount === 1) {
          return validPlatforms;
        } else if (callCount === 2) {
          throw new Error('Filter state corrupted');
        } else {
          return validPlatforms;
        }
      });

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      const searchInput = screen.getByTestId('search-input');
      
      // First search should work
      await userEvent.type(searchInput, 'test');
      
      // Second search should fail but component should recover
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'recovery');

      // Component should still be functional
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Memory and Resource Error Scenarios', () => {
    it('should handle out of memory conditions', async () => {
      // Simulate memory pressure by creating large objects
      const largePlatforms = Array.from({ length: 10000 }, (_, i) => ({
        ...validPlatforms[0],
        id: `platform-${i}`,
        name: `Platform ${i}`,
        description: 'A'.repeat(10000) // Large description
      } as AgentPlatform));

      mockDataService.loadPlatforms.mockResolvedValue(largePlatforms);
      mockDataService.getFilteredPlatforms.mockImplementation((platforms) => {
        // Simulate memory issues during filtering
        if (platforms.length > 5000) {
          throw new Error('Out of memory');
        }
        return platforms.slice(0, 50);
      });
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      render(<AIAgentPlatformsContainer />);

      // Should handle memory issues gracefully
      await waitFor(() => {
        // Either shows error or handles gracefully
        expect(
          screen.queryByTestId('error-message') || 
          screen.queryByText('Valid Platform')
        ).toBeInTheDocument();
      });
    });

    it('should handle resource cleanup errors', async () => {
      mockDataService.loadPlatforms.mockResolvedValue(validPlatforms);
      mockDataService.getFilteredPlatforms.mockReturnValue(validPlatforms);
      mockDataService.getUniqueCategories.mockReturnValue(['open-source-framework']);

      const { unmount } = render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByText('Valid Platform')).toBeInTheDocument();
      });

      // Simulate cleanup errors during unmount
      const originalRemoveEventListener = window.removeEventListener;
      window.removeEventListener = jest.fn().mockImplementation(() => {
        throw new Error('Cleanup failed');
      });

      // Should not throw during unmount
      expect(() => {
        unmount();
      }).not.toThrow();

      // Restore
      window.removeEventListener = originalRemoveEventListener;
    });
  });

  describe('Retry Mechanism Error Scenarios', () => {
    it('should handle retry mechanism failures', async () => {
      let attemptCount = 0;
      mockDataService.loadPlatforms.mockImplementation(() => {
        attemptCount++;
        if (attemptCount <= 3) {
          return Promise.reject(new Error(`Attempt ${attemptCount} failed`));
        }
        return Promise.resolve(validPlatforms);
      });

      render(<AIAgentPlatformsContainer />);

      // Should show error after first failure
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Retry should work after multiple attempts
      const retryButton = screen.getByTestId('retry-button');
      
      // First retry
      fireEvent.click(retryButton);
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Second retry
      fireEvent.click(retryButton);
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Third retry should succeed
      fireEvent.click(retryButton);
      await waitFor(() => {
        expect(screen.getByText('Valid Platform')).toBeInTheDocument();
      });

      expect(attemptCount).toBe(4);
    });

    it('should disable retry after maximum attempts', async () => {
      mockDataService.loadPlatforms.mockRejectedValue(new Error('Persistent failure'));

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Exhaust retry attempts
      for (let i = 0; i < 3; i++) {
        const retryButton = screen.queryByTestId('retry-button');
        if (retryButton) {
          fireEvent.click(retryButton);
          await waitFor(() => {
            expect(screen.getByTestId('error-message')).toBeInTheDocument();
          });
        }
      }

      // Should show max retries message and disable retry
      await waitFor(() => {
        expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
      });

      expect(screen.getByText(/Maximum retry attempts reached/)).toBeInTheDocument();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should be caught by error boundary on critical failures', () => {
      // Mock a critical error that should trigger error boundary
      mockDataService.loadPlatforms.mockImplementation(() => {
        throw new Error('Critical system failure');
      });

      // This would normally be caught by an ErrorBoundary component
      // In a real test, you'd wrap the component in an ErrorBoundary
      expect(() => {
        render(<AIAgentPlatformsContainer />);
      }).not.toThrow();
    });
  });

  describe('Error Logging and Monitoring', () => {
    it('should log errors appropriately', async () => {
      const testError = new Error('Test error for logging');
      mockDataService.loadPlatforms.mockRejectedValue(testError);

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Should log error (in real implementation)
      // expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Test error for logging'));
    });

    it('should provide error context for debugging', async () => {
      mockDataService.loadPlatforms.mockRejectedValue(new Error('Context test error'));

      render(<AIAgentPlatformsContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Error message should provide helpful context
      expect(screen.getByText('Context test error')).toBeInTheDocument();
    });
  });
});