/**
 * Main App Component
 * 
 * Root application component that orchestrates all major components,
 * implements simple routing between glossary and quiz views,
 * and manages application-wide state.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlossaryContainer } from './components/GlossaryContainer';
import { QuizContainer } from './components/QuizContainer';
import { ProgressTracker } from './components/ProgressTracker';
import { localStorageService } from './services/LocalStorageService';
import { UserProgress, QuizResults, UserRole } from './types';
import './App.css';

type AppView = 'glossary' | 'quiz' | 'progress';

interface AppState {
  currentView: AppView;
  userProgress: UserProgress;
  selectedRole: UserRole | undefined;
  isLoading: boolean;
  error: string | null;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'glossary',
    userProgress: {
      visitCount: 0,
      quizAttempts: [],
      answeredTerms: new Set(),
      bestScore: 0
    },
    selectedRole: undefined,
    isLoading: true,
    error: null
  });

  /**
   * Initialize application state on mount
   */
  useEffect(() => {
    try {
      // Increment visit count and get user progress
      const visitCount = localStorageService.incrementVisitCount();
      const progress = localStorageService.getProgress();
      
      // Get user preferences
      const preferences = localStorageService.getPreferences();
      
      setAppState(prev => ({
        ...prev,
        userProgress: { ...progress, visitCount },
        selectedRole: preferences.selectedRole,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error initializing app:', error);
      setAppState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize application'
      }));
    }
  }, []);

  /**
   * Handle view navigation
   */
  const handleViewChange = useCallback((view: AppView) => {
    setAppState(prev => ({
      ...prev,
      currentView: view
    }));
  }, []);

  /**
   * Handle role selection changes
   */
  const handleRoleChange = useCallback((role: UserRole) => {
    setAppState(prev => ({
      ...prev,
      selectedRole: role
    }));

    // Save role preference
    try {
      localStorageService.updatePreferences({ selectedRole: role });
    } catch (error) {
      console.error('Error saving role preference:', error);
    }
  }, []);

  /**
   * Handle quiz completion
   */
  const handleQuizComplete = useCallback((_results: QuizResults) => {
    try {
      // Progress is automatically updated by QuizContainer via localStorageService
      // Refresh our local state to reflect the changes
      const updatedProgress = localStorageService.getProgress();
      
      setAppState(prev => ({
        ...prev,
        userProgress: updatedProgress
      }));
    } catch (error) {
      console.error('Error handling quiz completion:', error);
    }
  }, []);

  /**
   * Handle progress updates (e.g., from reset)
   */
  const handleProgressUpdate = useCallback((progress: UserProgress) => {
    setAppState(prev => ({
      ...prev,
      userProgress: progress
    }));
  }, []);

  /**
   * Handle application errors
   */
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Application error:', error, errorInfo);
    // Could send to error reporting service here
  }, []);

  /**
   * Render navigation
   */
  const renderNavigation = () => (
    <nav className="app__navigation" role="navigation" aria-label="Main navigation">
      <div className="app__nav-container">
        <button
          type="button"
          className={`app__nav-button ${appState.currentView === 'glossary' ? 'active' : ''}`}
          onClick={() => handleViewChange('glossary')}
          aria-current={appState.currentView === 'glossary' ? 'page' : undefined}
        >
          Glossary
        </button>
        
        <button
          type="button"
          className={`app__nav-button ${appState.currentView === 'quiz' ? 'active' : ''}`}
          onClick={() => handleViewChange('quiz')}
          aria-current={appState.currentView === 'quiz' ? 'page' : undefined}
        >
          Quiz
        </button>
        
        <button
          type="button"
          className={`app__nav-button ${appState.currentView === 'progress' ? 'active' : ''}`}
          onClick={() => handleViewChange('progress')}
          aria-current={appState.currentView === 'progress' ? 'page' : undefined}
        >
          Progress
        </button>
      </div>
    </nav>
  );

  /**
   * Render current view content
   */
  const renderCurrentView = () => {
    switch (appState.currentView) {
      case 'glossary':
        return (
          <GlossaryContainer
            {...(appState.selectedRole && { initialRole: appState.selectedRole })}
            onRoleChange={handleRoleChange}
            className="app__view-content"
          />
        );
      
      case 'quiz':
        return (
          <QuizContainer
            onQuizComplete={handleQuizComplete}
            questionsPerQuiz={3}
          />
        );
      
      case 'progress':
        return (
          <ProgressTracker
            progress={appState.userProgress}
            onProgressUpdate={handleProgressUpdate}
            className="app__view-content"
          />
        );
      
      default:
        return (
          <div className="app__error" role="alert">
            <h2>Unknown View</h2>
            <p>The requested view could not be found.</p>
            <button
              type="button"
              className="app__error-button"
              onClick={() => handleViewChange('glossary')}
            >
              Return to Glossary
            </button>
          </div>
        );
    }
  };

  // Loading state
  if (appState.isLoading) {
    return (
      <div className="app app--loading">
        <div className="app__loading" role="status" aria-live="polite">
          <div className="app__spinner" aria-hidden="true"></div>
          <p>Loading Interactive AI 101 Module...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (appState.error) {
    return (
      <div className="app app--error">
        <div className="app__error" role="alert">
          <h1>Application Error</h1>
          <p>{appState.error}</p>
          <button
            type="button"
            className="app__error-button"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={handleError}>
      <div className="app">
        <header className="app__header">
          <div className="app__header-content">
            <h1 className="app__title">Interactive AI 101 Module</h1>
            <p className="app__description">
              Learn AI concepts with role-specific context and interactive quizzes
            </p>
          </div>
          
          {renderNavigation()}
        </header>

        <main className="app__main" role="main">
          {renderCurrentView()}
        </main>

        <footer className="app__footer">
          <div className="app__footer-content">
            <p className="app__footer-text">
              Visit #{appState.userProgress.visitCount} • 
              {appState.userProgress.quizAttempts.length > 0 && (
                <> Best Score: {appState.userProgress.bestScore} • </>
              )}
              {appState.userProgress.answeredTerms.size}/16 terms completed
            </p>
            
            {!localStorageService.isLocalStorageAvailable() && (
              <p className="app__footer-warning" role="alert">
                ⚠️ Progress tracking unavailable - data will not persist between sessions
              </p>
            )}
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;