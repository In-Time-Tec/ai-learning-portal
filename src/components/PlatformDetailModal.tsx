import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { AgentPlatform } from '../types';
import './PlatformDetailModal.css';

// Lazy load tab components for better performance
const OverviewTab = lazy(() => import('./PlatformModalTabs').then(module => ({ default: module.OverviewTab })));
const FeaturesTab = lazy(() => import('./PlatformModalTabs').then(module => ({ default: module.FeaturesTab })));
const ResourcesTab = lazy(() => import('./PlatformModalTabs').then(module => ({ default: module.ResourcesTab })));
const TabLoadingSpinner = lazy(() => import('./PlatformModalTabs').then(module => ({ default: module.TabLoadingSpinner })));

interface PlatformDetailModalProps {
  platform: AgentPlatform;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'features' | 'resources';

const PlatformDetailModal: React.FC<PlatformDetailModalProps> = ({
  platform,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Tab navigation within modal
      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Arrow key navigation for tabs
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const tabButtons = modalRef.current?.querySelectorAll('[role="tab"]');
        if (tabButtons && document.activeElement && Array.from(tabButtons).includes(document.activeElement)) {
          event.preventDefault();
          const currentIndex = Array.from(tabButtons).indexOf(document.activeElement);
          let nextIndex;
          
          if (event.key === 'ArrowLeft') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : tabButtons.length - 1;
          } else {
            nextIndex = currentIndex < tabButtons.length - 1 ? currentIndex + 1 : 0;
          }
          
          const nextTab = tabButtons[nextIndex] as HTMLElement;
          nextTab.focus();
          nextTab.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Render tab content with lazy loading
  const renderTabContent = () => {
    return (
      <Suspense fallback={<TabLoadingSpinner />}>
        {activeTab === 'overview' && <OverviewTab platform={platform} />}
        {activeTab === 'features' && <FeaturesTab platform={platform} />}
        {activeTab === 'resources' && <ResourcesTab platform={platform} />}
      </Suspense>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      className="platform-modal__backdrop" 
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      role="presentation"
    >
      <div 
        className="platform-modal__container" 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="platform-modal__header">
          <div className="platform-modal__title-section">
            <h2 id="modal-title" className="platform-modal__title">
              {platform.name}
            </h2>
            <span className={`platform-modal__category-badge platform-modal__category-badge--${platform.category}`}>
              {platform.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
          </div>
          
          <button
            ref={closeButtonRef}
            className="platform-modal__close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="platform-modal__tabs" role="tablist" aria-label="Platform information sections">
          <button
            id="tab-overview"
            className={`platform-modal__tab ${activeTab === 'overview' ? 'platform-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
            role="tab"
            aria-selected={activeTab === 'overview'}
            aria-controls="tabpanel-overview"
            tabIndex={activeTab === 'overview' ? 0 : -1}
          >
            Overview
          </button>
          
          <button
            id="tab-features"
            className={`platform-modal__tab ${activeTab === 'features' ? 'platform-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('features')}
            role="tab"
            aria-selected={activeTab === 'features'}
            aria-controls="tabpanel-features"
            tabIndex={activeTab === 'features' ? 0 : -1}
          >
            Features
          </button>
          
          <button
            id="tab-resources"
            className={`platform-modal__tab ${activeTab === 'resources' ? 'platform-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('resources')}
            role="tab"
            aria-selected={activeTab === 'resources'}
            aria-controls="tabpanel-resources"
            tabIndex={activeTab === 'resources' ? 0 : -1}
          >
            Resources
          </button>
        </div>

        <main className="platform-modal__content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default PlatformDetailModal;