/**
 * Main App Component
 * 
 * Root application component that orchestrates all major components,
 * implements simple routing between glossary and quiz views,
 * and manages application-wide state.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './components/HomePage';
import { GlossaryContainer } from './components/GlossaryContainer';
import { QuizContainer } from './components/QuizContainer';
import { ProgressTracker } from './components/ProgressTracker';
import { AIToolsContainer } from './components/AIToolsContainer';
import { AIIntroductionContainer } from './components/AIIntroductionContainer';
import { localStorageService } from './services/LocalStorageService';
import { UserProgress, QuizResults, UserRole } from './types';
import './App.css';

type AppView = 'home' | 'learn' | 'ai-tools' | 'glossary' | 'quiz' | 'progress' | 'introduction';

interface AppState {
  currentView: AppView;
  userProgress: UserProgress;
  selectedRole: UserRole | undefined;
  isLoading: boolean;
  error: string | null;
}

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'home',
    userProgress: {
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
      // Get user progress and preferences
      const progress = localStorageService.getProgress();
      const preferences = localStorageService.getPreferences();

      setAppState(prev => ({
        ...prev,
        userProgress: progress,
        selectedRole: preferences.selectedRole,
        isLoading: false,
        error: null
      }));
    } catch (error) {
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
   * Handle HomePage navigation
   */
  const handleHomePageNavigation = useCallback((section: 'learn' | 'ai-tools' | 'introduction') => {
    if (section === 'learn') {
      handleViewChange('glossary'); // Navigate to glossary as the main learn view
    } else if (section === 'ai-tools') {
      handleViewChange('ai-tools');
    } else if (section === 'introduction') {
      handleViewChange('introduction');
    }
  }, [handleViewChange]);

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
      // Error saving role preference - continue silently
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
      // Error handling quiz completion - continue silently
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
          className={`app__nav-button ${appState.currentView === 'home' ? 'active' : ''}`}
          onClick={() => handleViewChange('home')}
          aria-current={appState.currentView === 'home' ? 'page' : undefined}
        >
          Home
        </button>

        <button
          type="button"
          className={`app__nav-button ${appState.currentView === 'introduction' ? 'active' : ''}`}
          onClick={() => handleViewChange('introduction')}
          aria-current={appState.currentView === 'introduction' ? 'page' : undefined}
        >
          Introduction
        </button>

        <button
          type="button"
          className={`app__nav-button ${['glossary', 'quiz', 'progress'].includes(appState.currentView) ? 'active' : ''}`}
          onClick={() => handleViewChange('glossary')}
          aria-current={['glossary', 'quiz', 'progress'].includes(appState.currentView) ? 'page' : undefined}
        >
          Learn
        </button>

        <button
          type="button"
          className={`app__nav-button ${appState.currentView === 'ai-tools' ? 'active' : ''}`}
          onClick={() => handleViewChange('ai-tools')}
          aria-current={appState.currentView === 'ai-tools' ? 'page' : undefined}
        >
          AI Tools
        </button>
      </div>
    </nav>
  );

  /**
   * Render current view content
   */
  const renderCurrentView = () => {
    switch (appState.currentView) {
      case 'home':
        return (
          <HomePage
            userProgress={appState.userProgress}
            onNavigate={handleHomePageNavigation}
            className="app__view-content"
          />
        );

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

      case 'ai-tools':
        return (
          <AIToolsContainer
            className="app__view-content"
          />
        );

      case 'introduction':
        return (
          <AIIntroductionContainer
            className="app__view-content"
            onNavigate={(destination) => handleViewChange(destination)}
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
              onClick={() => handleViewChange('home')}
            >
              Return to Home
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
          <p>Loading AI Learning Portal...</p>
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
            <h1 className="app__title">AI Learning Portal</h1>
            <p className="app__description">
              Explore AI concepts and discover tools used in your organization
            </p>
          </div>

          {renderNavigation()}
        </header>

        <main className="app__main" role="main">
          {/* Sub-navigation for Learn section */}
          {['glossary', 'quiz', 'progress'].includes(appState.currentView) && (
            <nav className="app__sub-navigation" role="navigation" aria-label="Learn section navigation">
              <div className="app__sub-nav-container">
                <button
                  type="button"
                  className={`app__sub-nav-button ${appState.currentView === 'glossary' ? 'active' : ''}`}
                  onClick={() => handleViewChange('glossary')}
                  aria-current={appState.currentView === 'glossary' ? 'page' : undefined}
                >
                  Glossary
                </button>

                <button
                  type="button"
                  className={`app__sub-nav-button ${appState.currentView === 'quiz' ? 'active' : ''}`}
                  onClick={() => handleViewChange('quiz')}
                  aria-current={appState.currentView === 'quiz' ? 'page' : undefined}
                >
                  Quiz
                </button>

                <button
                  type="button"
                  className={`app__sub-nav-button ${appState.currentView === 'progress' ? 'active' : ''}`}
                  onClick={() => handleViewChange('progress')}
                  aria-current={appState.currentView === 'progress' ? 'page' : undefined}
                >
                  Progress
                </button>
              </div>
            </nav>
          )}

          {renderCurrentView()}
        </main>

        <footer className="app__footer">
          <div className="app__footer-content">
            <p className="app__footer-text">
              {appState.userProgress.quizAttempts.length > 0 && (
                <>Best Score: {appState.userProgress.bestScore} • </>
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