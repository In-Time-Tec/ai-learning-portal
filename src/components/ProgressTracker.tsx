/**
 * ProgressTracker Component
 * 
 * Displays user progress including visit count, quiz statistics, and completed terms.
 * Provides progress visualization and reset functionality with full accessibility support.
 */

import React, { useState, useEffect } from 'react';
import { UserProgress, QuizAttempt } from '../types';
import { localStorageService } from '../services/LocalStorageService';
import './ProgressTracker.css';

interface ProgressTrackerProps {
  /** Current user progress data */
  progress?: UserProgress;
  /** Callback when progress data is updated */
  onProgressUpdate?: (progress: UserProgress) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * ProgressTracker component for displaying user statistics and progress
 */
export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress: externalProgress,
  onProgressUpdate,
  className = ''
}) => {
  const [internalProgress, setInternalProgress] = useState<UserProgress>(() => {
    try {
      return localStorageService.getProgress();
    } catch (error) {
      console.error('Error loading initial progress:', error);
      return {
        visitCount: 0,
        quizAttempts: [],
        answeredTerms: new Set(),
        bestScore: 0
      };
    }
  });
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Use external progress if provided, otherwise use internal state
  const currentProgress = externalProgress || internalProgress;

  useEffect(() => {
    if (!externalProgress) {
      // Update internal progress from localStorage
      const updatedProgress = localStorageService.getProgress();
      setInternalProgress(updatedProgress);
    }
  }, [externalProgress]);

  /**
   * Calculate completion percentage for progress visualization
   */
  const getCompletionPercentage = (): number => {
    const totalTerms = 16; // As specified in requirements
    const completedTerms = currentProgress.answeredTerms.size;
    return Math.round((completedTerms / totalTerms) * 100);
  };

  /**
   * Get average quiz score
   */
  const getAverageScore = (): number => {
    if (currentProgress.quizAttempts.length === 0) return 0;
    
    const totalScore = currentProgress.quizAttempts.reduce(
      (sum, attempt) => sum + attempt.score, 
      0
    );
    return Math.round(totalScore / currentProgress.quizAttempts.length);
  };

  /**
   * Get recent quiz attempts (last 5)
   */
  const getRecentAttempts = (): QuizAttempt[] => {
    return currentProgress.quizAttempts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  };

  /**
   * Handle reset confirmation
   */
  const handleResetRequest = (): void => {
    setShowResetConfirmation(true);
  };

  /**
   * Handle confirmed reset
   */
  const handleConfirmedReset = async (): Promise<void> => {
    setIsResetting(true);
    
    try {
      // Clear all data
      localStorageService.clearAllData();
      
      // Get fresh progress data
      const resetProgress = localStorageService.getProgress();
      
      if (externalProgress && onProgressUpdate) {
        onProgressUpdate(resetProgress);
      } else {
        setInternalProgress(resetProgress);
      }
      
      setShowResetConfirmation(false);
    } catch (error) {
      console.error('Error resetting progress:', error);
    } finally {
      setIsResetting(false);
    }
  };

  /**
   * Handle reset cancellation
   */
  const handleCancelReset = (): void => {
    setShowResetConfirmation(false);
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const completionPercentage = getCompletionPercentage();
  const averageScore = getAverageScore();
  const recentAttempts = getRecentAttempts();

  return (
    <div className={`progress-tracker ${className}`} role="region" aria-labelledby="progress-heading">
      <h2 id="progress-heading" className="progress-tracker__title">
        Your Learning Progress
      </h2>

      {/* Visit Counter */}
      <div className="progress-tracker__section">
        <h3 className="progress-tracker__section-title">Session Information</h3>
        <div className="progress-tracker__stat">
          <span className="progress-tracker__stat-label">Total Visits:</span>
          <span className="progress-tracker__stat-value" aria-label={`${currentProgress.visitCount} visits`}>
            {currentProgress.visitCount}
          </span>
        </div>
      </div>

      {/* Quiz Statistics */}
      <div className="progress-tracker__section">
        <h3 className="progress-tracker__section-title">Quiz Performance</h3>
        
        <div className="progress-tracker__stats-grid">
          <div className="progress-tracker__stat">
            <span className="progress-tracker__stat-label">Best Score:</span>
            <span className="progress-tracker__stat-value" aria-label={`Best score: ${currentProgress.bestScore} points`}>
              {currentProgress.bestScore}
            </span>
          </div>
          
          <div className="progress-tracker__stat">
            <span className="progress-tracker__stat-label">Total Attempts:</span>
            <span className="progress-tracker__stat-value" aria-label={`${currentProgress.quizAttempts.length} total attempts`}>
              {currentProgress.quizAttempts.length}
            </span>
          </div>
          
          <div className="progress-tracker__stat">
            <span className="progress-tracker__stat-label">Average Score:</span>
            <span className="progress-tracker__stat-value" aria-label={`Average score: ${averageScore} points`}>
              {averageScore}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="progress-tracker__section">
        <h3 className="progress-tracker__section-title">Term Completion</h3>
        
        <div className="progress-tracker__progress-container">
          <div className="progress-tracker__progress-info">
            <span className="progress-tracker__progress-text">
              {currentProgress.answeredTerms.size} of 16 terms completed
            </span>
            <span className="progress-tracker__progress-percentage" aria-label={`${completionPercentage}% complete`}>
              {completionPercentage}%
            </span>
          </div>
          
          <div 
            className="progress-tracker__progress-bar"
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Learning progress: ${completionPercentage}% complete`}
          >
            <div 
              className="progress-tracker__progress-fill"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {currentProgress.answeredTerms.size > 0 && (
          <div className="progress-tracker__completed-terms">
            <h4 className="progress-tracker__completed-title">Completed Terms:</h4>
            <ul className="progress-tracker__terms-list" aria-label="List of completed terms">
              {Array.from(currentProgress.answeredTerms).sort().map((term) => (
                <li key={term} className="progress-tracker__term-item">
                  {term}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recent Quiz Attempts */}
      {recentAttempts.length > 0 && (
        <div className="progress-tracker__section">
          <h3 className="progress-tracker__section-title">Recent Quiz Attempts</h3>
          <div className="progress-tracker__attempts-list">
            {recentAttempts.map((attempt, index) => (
              <div key={attempt.timestamp} className="progress-tracker__attempt">
                <div className="progress-tracker__attempt-info">
                  <span className="progress-tracker__attempt-score">
                    Score: {attempt.score}/{attempt.totalQuestions}
                  </span>
                  <span className="progress-tracker__attempt-date">
                    {formatDate(attempt.timestamp)}
                  </span>
                </div>
                <div className="progress-tracker__attempt-percentage">
                  {Math.round((attempt.score / attempt.totalQuestions) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Functionality */}
      <div className="progress-tracker__section progress-tracker__reset-section">
        {!showResetConfirmation ? (
          <button
            type="button"
            className="progress-tracker__reset-button"
            onClick={handleResetRequest}
            aria-describedby="reset-description"
          >
            Reset All Progress
          </button>
        ) : (
          <div className="progress-tracker__reset-confirmation" role="dialog" aria-labelledby="reset-confirm-title">
            <h4 id="reset-confirm-title" className="progress-tracker__reset-title">
              Confirm Reset
            </h4>
            <p className="progress-tracker__reset-warning">
              This will permanently delete all your progress data including visit count, quiz scores, and completed terms. This action cannot be undone.
            </p>
            <div className="progress-tracker__reset-actions">
              <button
                type="button"
                className="progress-tracker__reset-confirm"
                onClick={handleConfirmedReset}
                disabled={isResetting}
                aria-describedby="reset-warning"
              >
                {isResetting ? 'Resetting...' : 'Yes, Reset All Data'}
              </button>
              <button
                type="button"
                className="progress-tracker__reset-cancel"
                onClick={handleCancelReset}
                disabled={isResetting}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <p id="reset-description" className="progress-tracker__reset-description">
          Reset all progress data including visit count, quiz scores, and completed terms
        </p>
      </div>
    </div>
  );
};

export default ProgressTracker;