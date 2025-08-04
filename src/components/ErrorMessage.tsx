/**
 * ErrorMessage Component
 * 
 * Displays user-friendly error messages with recovery options
 */

import React from 'react';
import './ErrorMessage.css';

export interface ErrorMessageProps {
  /** Error title */
  title?: string;
  /** Error message */
  message: string;
  /** Error type for styling */
  type?: 'network' | 'data' | 'storage' | 'validation' | 'generic';
  /** Retry callback */
  onRetry?: () => void;
  /** Whether retry is in progress */
  isRetrying?: boolean;
  /** Additional recovery actions */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  /** Additional CSS class */
  className?: string;
  /** Whether to show detailed error info in development */
  showDetails?: boolean;
  /** Detailed error information */
  details?: string;
}

const ERROR_CONFIGS = {
  network: {
    icon: '🌐',
    title: 'Connection Problem',
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Wait a moment and try again'
    ]
  },
  data: {
    icon: '📄',
    title: 'Data Loading Error',
    suggestions: [
      'The data file may be corrupted',
      'Try refreshing the page',
      'Contact support if the problem persists'
    ]
  },
  storage: {
    icon: '💾',
    title: 'Storage Error',
    suggestions: [
      'Your browser storage may be full',
      'Try clearing browser data',
      'Some features may not work properly'
    ]
  },
  validation: {
    icon: '⚠️',
    title: 'Invalid Data',
    suggestions: [
      'The data format is incorrect',
      'Try refreshing the page',
      'Contact support if the problem persists'
    ]
  },
  generic: {
    icon: '❌',
    title: 'Something Went Wrong',
    suggestions: [
      'An unexpected error occurred',
      'Try refreshing the page',
      'Contact support if the problem persists'
    ]
  }
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  type = 'generic',
  onRetry,
  isRetrying = false,
  actions = [],
  className = '',
  showDetails = process.env.NODE_ENV === 'development',
  details
}) => {
  const config = ERROR_CONFIGS[type];
  const displayTitle = title || config.title;

  return (
    <div className={`error-message error-message--${type} ${className}`} role="alert">
      <div className="error-message__container">
        <div className="error-message__header">
          <span className="error-message__icon" aria-hidden="true">
            {config.icon}
          </span>
          <h3 className="error-message__title">{displayTitle}</h3>
        </div>

        <div className="error-message__content">
          <p className="error-message__message">{message}</p>

          <div className="error-message__suggestions">
            <h4 className="error-message__suggestions-title">What you can try:</h4>
            <ul className="error-message__suggestions-list">
              {config.suggestions.map((suggestion, index) => (
                <li key={index} className="error-message__suggestion">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="error-message__actions">
          {onRetry && (
            <button
              type="button"
              className="error-message__button error-message__button--primary"
              onClick={onRetry}
              disabled={isRetrying}
            >
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
          )}

          {actions.map((action, index) => (
            <button
              key={index}
              type="button"
              className={`error-message__button error-message__button--${action.variant || 'secondary'}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}

          <button
            type="button"
            className="error-message__button error-message__button--secondary"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>

        {showDetails && details && (
          <details className="error-message__details">
            <summary className="error-message__details-summary">
              Technical Details (Development Only)
            </summary>
            <pre className="error-message__details-content">
              {details}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;