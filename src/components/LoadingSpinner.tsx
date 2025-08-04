/**
 * LoadingSpinner Component
 * 
 * Reusable loading spinner with accessibility support and customizable size/text
 */

import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'small' | 'medium' | 'large';
  /** Loading message to display */
  message?: string;
  /** Additional CSS class */
  className?: string;
  /** Whether to show the message */
  showMessage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  className = '',
  showMessage = true
}) => {
  return (
    <div className={`loading-spinner loading-spinner--${size} ${className}`} role="status" aria-live="polite">
      <div className="loading-spinner__spinner" aria-hidden="true"></div>
      {showMessage && (
        <p className="loading-spinner__message">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;