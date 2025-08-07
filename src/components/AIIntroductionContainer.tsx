/**
 * AIIntroductionContainer Component
 * 
 * Main container component for the AI Introduction and Risks feature.
 * Displays comprehensive introduction content about AI advantages and cognitive risks,
 * providing balanced perspective before users engage with glossary and quiz features.
 */

import React, { useRef, useCallback } from 'react';
import './AIIntroductionContainer.css';

/**
 * Props interface for AIIntroductionContainer component
 */
interface AIIntroductionContainerProps {
  className?: string;
  onNavigate?: (destination: 'glossary' | 'quiz' | 'home') => void;
}

/**
 * Interface for individual introduction content sections
 */
interface IntroductionSection {
  id: string;
  title: string;
  subtitle?: string;
  content: string | React.ReactNode;
  variant?: 'default' | 'highlighted' | 'warning';
}

/**
 * Complete introduction content data structure
 */
interface IntroductionContent {
  sections: IntroductionSection[];
  navigation: {
    previous?: { label: string; destination: 'glossary' | 'quiz' | 'home' };
    next?: { label: string; destination: 'glossary' | 'quiz' | 'home' };
  };
}

/**
 * Static introduction content data with all six main sections
 */
const introductionContent: IntroductionContent = {
  sections: [
    {
      id: 'overview',
      title: 'Understanding AI: A Balanced Perspective',
      subtitle: 'Exploring both the promise and the perils of artificial intelligence',
      content: `
        Artificial Intelligence represents one of the most transformative technologies of our time, 
        offering unprecedented capabilities to augment human intelligence and automate complex tasks. 
        However, as we integrate AI more deeply into our work and decision-making processes, 
        we must also consider the subtle but significant risks it poses to our cognitive abilities.
        
        This introduction explores both the advantages and the hidden dangers of AI adoption, 
        helping you develop a nuanced understanding of how to engage with AI tools responsibly 
        while preserving essential human thinking and creativity.
      `,
      variant: 'default'
    },
    {
      id: 'approved-tools',
      title: 'Approved AI Tools at In Time Tec',
      subtitle: 'Official policy and licensing requirements',
      content: `
        As part of our evolving Acceptable Use and Approved Tools policies, we've identified 
        5 AI Tools that are allowed for use at In Time Tec:
        
        **Approved AI Tools:**
        • **GitHub Copilot** - AI-powered code completion and suggestions
        • **ChatGPT** - Conversational AI for research and problem-solving
        • **Cursor AI** - AI-enhanced code editor and development environment
        • **Microsoft Copilot** - Integrated AI assistant across Microsoft 365
        • **Claude AI** - Advanced AI assistant for analysis and writing tasks
        
        **Important Licensing Requirements:**
        These tools are approved for use **ONLY when a license is issued by the IT department**. 
        Our official policy document will be published shortly.
        
        **Current Users:** If you are currently using one of these tools and are paying with 
        a personal or corporate credit card, please respond to our licensing form and we will 
        go through the process of getting a license approved and provisioned for your use on 
        the company account: https://forms.office.com/r/SDvSssgQsQ
        
        **New Users:** If you don't currently use one of these tools but need to, please 
        submit a ticket to https://intimetec.freshservice.com/ and someone will assist you 
        with getting a license.
        
        This policy ensures we maintain security, compliance, and cost management while 
        enabling productive AI tool usage across the organization.
      `,
      variant: 'highlighted'
    },
    {
      id: 'too-much-too-soon',
      title: 'The "Too Much Too Soon" Problem',
      subtitle: 'Understanding AI\'s Cognitive Risks',
      content: `
        The rapid adoption of AI tools creates a phenomenon we call "too much too soon" - 
        where the convenience and speed of AI responses can bypass the critical thinking 
        processes that make us better thinkers and decision-makers.
        
        When we consistently rely on AI for first-draft thinking, research synthesis, 
        or problem-solving, we risk atrophying the very cognitive muscles that AI should 
        be helping us strengthen. The danger lies not in AI's capabilities, but in how 
        easily we can become dependent on them without realizing the trade-offs.
      `,
      variant: 'warning'
    },
    {
      id: 'invisible-degradation',
      title: 'The Invisible Degradation Effect',
      subtitle: 'How AI can quietly undermine cognitive abilities',
      content: `
        Three key risks emerge from unreflective AI use:
        
        **Critical Thinking Atrophy**: When we consistently accept AI's first responses 
        without questioning, analyzing, or building upon them, we lose practice in 
        evaluating information, identifying assumptions, and thinking critically.
        
        **Skill Substitution**: AI can replace rather than augment our reasoning processes. 
        Instead of using AI to help us think better, we let it think for us, gradually 
        losing confidence in our own analytical abilities.
        
        **Gradual Dependency**: The shift from AI as enhancement to AI as crutch happens 
        so gradually that we often don't notice until we find ourselves unable to perform 
        tasks we once handled easily without assistance.
        
        Like social media's impact on attention and communication skills, AI's cognitive 
        effects compound over time, making early awareness and intentional practices crucial.
      `,
      variant: 'warning'
    },
    {
      id: 'productive-friction',
      title: 'The Need for "Productive Friction"',
      subtitle: 'Learning from the Amish approach to technology',
      content: `
        The Amish community offers valuable insights into technology adoption through their 
        practice of "productive friction" - carefully evaluating whether new technologies 
        strengthen or weaken community bonds and essential skills.
        
        We can apply similar principles to AI adoption by asking:
        - Does this AI use enhance my thinking or replace it?
        - Am I using AI to explore ideas more deeply or to avoid thinking altogether?
        - Will this practice help me become a better thinker or create dependency?
        
        Productive friction means intentionally maintaining some cognitive effort in our 
        AI-assisted workflows, ensuring that we continue to develop and exercise our 
        reasoning abilities even as we leverage AI's capabilities.
      `,
      variant: 'highlighted'
    },
    {
      id: 'cultural-wisdom',
      title: 'Toward Cultural Wisdom for AI',
      subtitle: 'Principles for conscious AI engagement',
      content: `
        Developing cultural wisdom for AI means creating practices that preserve essential 
        human cognitive abilities while leveraging AI's strengths:
        
        **Use AI for research, preserve complex reasoning**: Let AI gather information 
        and provide starting points, but maintain ownership of analysis, synthesis, 
        and decision-making processes.
        
        **Distinguish augmentation from replacement**: Choose AI applications that make 
        you think better, not applications that think for you.
        
        **Maintain cognitive diversity**: Ensure your thinking processes don't become 
        homogenized by AI patterns. Seek out human perspectives, alternative approaches, 
        and non-AI sources of insight.
        
        The fundamental question we must each answer is: How do we harness AI's power 
        while protecting the essential human thinking and creativity that make us who we are?
      `,
      variant: 'highlighted'
    }
  ],
  navigation: {
    next: { label: 'Explore AI Glossary', destination: 'glossary' }
  }
};

/**
 * AIIntroductionContainer component implementation
 */
export const AIIntroductionContainer: React.FC<AIIntroductionContainerProps> = ({
  className = '',
  onNavigate
}) => {
  // Refs for focus management
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const tocRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  /**
   * Register section ref for focus management
   */
  const setSectionRef = useCallback((id: string, element: HTMLElement | null) => {
    sectionRefs.current[id] = element;
  }, []);

  /**
   * Handle navigation to other sections with focus management
   */
  const handleNavigation = useCallback((destination: 'glossary' | 'quiz' | 'home') => {
    if (onNavigate) {
      onNavigate(destination);
    }
  }, [onNavigate]);

  /**
   * Handle smooth scrolling to specific sections with focus management
   */
  const handleSectionScroll = useCallback((sectionId: string, focusAfterScroll = true) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Focus the section after scrolling for keyboard navigation
      if (focusAfterScroll) {
        setTimeout(() => {
          const sectionTitle = element.querySelector('h2');
          if (sectionTitle) {
            sectionTitle.focus();
          }
        }, 500); // Wait for smooth scroll to complete
      }
    }
  }, []);

  /**
   * Navigate to next section
   */
  const handleNextSection = useCallback((currentSectionId: string) => {
    const currentIndex = introductionContent.sections.findIndex(section => section.id === currentSectionId);
    if (currentIndex < introductionContent.sections.length - 1) {
      const nextSection = introductionContent.sections[currentIndex + 1];
      if (nextSection) {
        handleSectionScroll(nextSection.id);
      }
    } else {
      // If at last section, focus on footer navigation
      if (footerRef.current) {
        const nextButton = footerRef.current.querySelector('.ai-introduction-container__nav-button--glossary') as HTMLElement;
        if (nextButton) {
          nextButton.focus();
        }
      }
    }
  }, [handleSectionScroll]);

  /**
   * Navigate to previous section
   */
  const handlePreviousSection = useCallback((currentSectionId: string) => {
    const currentIndex = introductionContent.sections.findIndex(section => section.id === currentSectionId);
    if (currentIndex > 0) {
      const previousSection = introductionContent.sections[currentIndex - 1];
      if (previousSection) {
        handleSectionScroll(previousSection.id);
      }
    } else {
      // If at first section, focus on table of contents
      if (tocRef.current) {
        const firstTocLink = tocRef.current.querySelector('.ai-introduction-container__toc-link') as HTMLElement;
        if (firstTocLink) {
          firstTocLink.focus();
        }
      }
    }
  }, [handleSectionScroll]);



  /**
   * Get current section progress
   */
  const getCurrentSectionProgress = useCallback((sectionId: string) => {
    const currentIndex = introductionContent.sections.findIndex(section => section.id === sectionId);
    return {
      current: currentIndex + 1,
      total: introductionContent.sections.length,
      isFirst: currentIndex === 0,
      isLast: currentIndex === introductionContent.sections.length - 1
    };
  }, []);

  /**
   * Global keyboard navigation handler
   */
  const handleGlobalKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle if no input elements are focused
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.tagName === 'SELECT' ||
      activeElement.getAttribute('contenteditable') === 'true'
    );

    if (isInputFocused) return;

    switch (event.key) {
      case 'h':
      case 'H':
        // Jump to main heading
        event.preventDefault();
        const mainTitle = document.getElementById('main-title');
        if (mainTitle) {
          mainTitle.focus();
          mainTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      
      case 't':
      case 'T':
        // Jump to table of contents
        event.preventDefault();
        const tocTitle = document.getElementById('toc-title');
        if (tocTitle) {
          tocTitle.focus();
          tocTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      
      case 'n':
      case 'N':
        // Jump to navigation footer
        event.preventDefault();
        const completionTitle = document.getElementById('completion-title');
        if (completionTitle) {
          completionTitle.focus();
          completionTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
        // Jump to specific section by number
        event.preventDefault();
        const sectionNumber = parseInt(event.key) - 1;
        if (sectionNumber < introductionContent.sections.length) {
          const section = introductionContent.sections[sectionNumber];
          if (section) {
            handleSectionScroll(section.id);
          }
        }
        break;
    }
  }, [handleSectionScroll]);

  // Add global keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  return (
    <div 
      className={`ai-introduction-container ${className}`}
      aria-label="AI Introduction: Risks and Advantages"
    >
      {/* Skip Links for Accessibility */}
      <div className="ai-introduction-container__skip-links">
        <a 
          href="#main-content" 
          className="ai-introduction-container__skip-link"
          onFocus={(e) => e.currentTarget.style.top = '6px'}
          onBlur={(e) => e.currentTarget.style.top = '-40px'}
        >
          Skip to main content
        </a>
        <a 
          href="#table-of-contents" 
          className="ai-introduction-container__skip-link"
          onFocus={(e) => e.currentTarget.style.top = '6px'}
          onBlur={(e) => e.currentTarget.style.top = '-40px'}
        >
          Skip to table of contents
        </a>
        <a 
          href="#navigation-footer" 
          className="ai-introduction-container__skip-link"
          onFocus={(e) => e.currentTarget.style.top = '6px'}
          onBlur={(e) => e.currentTarget.style.top = '-40px'}
        >
          Skip to navigation
        </a>
      </div>

      {/* Introduction Header */}
      <header 
        className="ai-introduction-container__header"
        aria-labelledby="main-title"
      >
        <h1 
          id="main-title"
          className="ai-introduction-container__title"
          tabIndex={-1}
        >
          AI Introduction: Risks and Advantages
        </h1>
        <p 
          className="ai-introduction-container__description"
          aria-describedby="reading-progress"
        >
          A balanced perspective on artificial intelligence and its impact on human cognition
        </p>
        <div 
          id="reading-progress"
          className="ai-introduction-container__reading-progress"
          role="status"
          aria-live="polite"
        >
          <span className="ai-introduction-container__progress-text">
            {introductionContent.sections.length} sections • Estimated reading time: 10-12 minutes
          </span>
        </div>
      </header>

      {/* Table of Contents */}
      <nav 
        id="table-of-contents"
        ref={tocRef}
        className="ai-introduction-container__toc" 
        role="navigation"
        aria-labelledby="toc-title"
        aria-describedby="toc-description"
      >
        <h2 
          id="toc-title"
          className="ai-introduction-container__toc-title"
          tabIndex={-1}
        >
          Contents
        </h2>
        <p 
          id="toc-description" 
          className="ai-introduction-container__toc-description"
        >
          Navigate to any section using the links below or use arrow keys for keyboard navigation
        </p>
        <ul className="ai-introduction-container__toc-list">
          {introductionContent.sections.map((section, index) => (
            <li key={section.id} className="ai-introduction-container__toc-item">
              <button
                type="button"
                className="ai-introduction-container__toc-link"
                onClick={() => handleSectionScroll(section.id)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' && index < introductionContent.sections.length - 1) {
                    e.preventDefault();
                    const nextTocLink = tocRef.current?.querySelectorAll('.ai-introduction-container__toc-link')[index + 1] as HTMLElement;
                    if (nextTocLink) {
                      nextTocLink.focus();
                    }
                  } else if (e.key === 'ArrowUp' && index > 0) {
                    e.preventDefault();
                    const prevTocLink = tocRef.current?.querySelectorAll('.ai-introduction-container__toc-link')[index - 1] as HTMLElement;
                    if (prevTocLink) {
                      prevTocLink.focus();
                    }
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    const firstTocLink = tocRef.current?.querySelector('.ai-introduction-container__toc-link') as HTMLElement;
                    if (firstTocLink) {
                      firstTocLink.focus();
                    }
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    const tocLinks = tocRef.current?.querySelectorAll('.ai-introduction-container__toc-link');
                    const lastTocLink = tocLinks?.[tocLinks.length - 1] as HTMLElement;
                    if (lastTocLink) {
                      lastTocLink.focus();
                    }
                  }
                }}
                aria-describedby={`${section.id}-subtitle`}
                aria-label={`Go to section ${index + 1} of ${introductionContent.sections.length}: ${section.title}`}
              >
                <span className="ai-introduction-container__toc-number">{index + 1}.</span>
                {section.title}
              </button>
              {section.subtitle && (
                <span 
                  id={`${section.id}-subtitle`}
                  className="ai-introduction-container__toc-subtitle"
                >
                  {section.subtitle}
                </span>
              )}
            </li>
          ))}
        </ul>
        <div 
          className="ai-introduction-container__toc-hint"
          aria-labelledby="keyboard-nav-title"
        >
          <h3 
            id="keyboard-nav-title"
            className="ai-introduction-container__keyboard-nav-title"
          >
            💡 Keyboard Navigation
          </h3>
          <ul className="ai-introduction-container__keyboard-shortcuts">
            <li><kbd>↑↓</kbd> Navigate table of contents</li>
            <li><kbd>H</kbd> Jump to main heading</li>
            <li><kbd>T</kbd> Jump to table of contents</li>
            <li><kbd>N</kbd> Jump to navigation footer</li>
            <li><kbd>1-6</kbd> Jump to specific section</li>
            <li><kbd>Home/End</kbd> First/last item in lists</li>
            <li><kbd>Enter/Space</kbd> Activate buttons and links</li>
          </ul>
        </div>
      </nav>

      {/* Introduction Content Sections */}
      <div 
        id="main-content" 
        className="ai-introduction-container__content"
        aria-labelledby="main-title"
        aria-describedby="reading-progress"
        tabIndex={-1}
      >
        {introductionContent.sections.map((section, index) => {
          const progress = getCurrentSectionProgress(section.id);
          return (
            <section
              key={section.id}
              id={section.id}
              ref={(el) => setSectionRef(section.id, el)}
              className={`ai-introduction-container__section ai-introduction-container__section--${section.variant || 'default'}`}
              aria-labelledby={`${section.id}-title`}
              aria-describedby={`${section.id}-progress`}
              tabIndex={-1}
            >
              {/* Section Progress Indicator */}
              <div 
                id={`${section.id}-progress`}
                className="ai-introduction-container__section-progress"
                role="status"
                aria-live="polite"
                aria-label={`Reading progress: Section ${progress.current} of ${progress.total}`}
              >
                <span 
                  className="ai-introduction-container__progress-indicator"
                  aria-label={`Currently reading section ${progress.current} of ${progress.total} sections`}
                >
                  Section {progress.current} of {progress.total}
                </span>
                <div 
                  className="ai-introduction-container__progress-bar"
                  role="progressbar"
                  aria-valuenow={progress.current}
                  aria-valuemin={1}
                  aria-valuemax={progress.total}
                  aria-label={`Reading progress: ${Math.round((progress.current / progress.total) * 100)}% complete`}
                >
                  <div 
                    className="ai-introduction-container__progress-fill"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <header className="ai-introduction-container__section-header">
                <h2 
                  id={`${section.id}-title`}
                  className="ai-introduction-container__section-title"
                  tabIndex={-1}
                >
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="ai-introduction-container__section-subtitle">
                    {section.subtitle}
                  </p>
                )}
              </header>
              
              <div className="ai-introduction-container__section-content">
                {typeof section.content === 'string' ? (
                  <div 
                    className="ai-introduction-container__text-content"
                    dangerouslySetInnerHTML={{ 
                      __html: section.content
                        .split('\n\n')
                        .map(paragraph => paragraph.trim())
                        .filter(paragraph => paragraph.length > 0)
                        .map(paragraph => {
                          // Handle bold text formatting
                          const formattedParagraph = paragraph.replace(
                            /\*\*(.*?)\*\*/g, 
                            '<strong>$1</strong>'
                          );
                          return `<p>${formattedParagraph}</p>`;
                        })
                        .join('')
                    }}
                  />
                ) : (
                  section.content
                )}
              </div>

              {/* Section Navigation */}
              <nav 
                className="ai-introduction-container__section-nav" 
                role="navigation"
                aria-label={`Section navigation for ${section.title}`}
                aria-describedby={`${section.id}-nav-help`}
              >
                <div 
                  id={`${section.id}-nav-help`}
                  className="ai-introduction-container__nav-help sr-only"
                >
                  Use arrow keys to navigate between sections, or click buttons to jump to specific locations
                </div>
                <div className="ai-introduction-container__section-nav-buttons">
                  {!progress.isFirst && (
                    <button
                      type="button"
                      className="ai-introduction-container__section-nav-button ai-introduction-container__section-nav-button--previous"
                      onClick={() => handlePreviousSection(section.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          handlePreviousSection(section.id);
                        } else if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          handleNextSection(section.id);
                        }
                      }}
                      aria-label={`Go to previous section: ${introductionContent.sections[index - 1]?.title}`}
                    >
                      ← Previous
                    </button>
                  )}
                  
                  <button
                    type="button"
                    className="ai-introduction-container__section-nav-button ai-introduction-container__section-nav-button--toc"
                    onClick={() => {
                      if (tocRef.current) {
                        tocRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setTimeout(() => {
                          const firstTocLink = tocRef.current?.querySelector('.ai-introduction-container__toc-link') as HTMLElement;
                          if (firstTocLink) {
                            firstTocLink.focus();
                          }
                        }, 500);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Home') {
                        e.preventDefault();
                        const firstSection = introductionContent.sections[0];
                        if (firstSection) {
                          handleSectionScroll(firstSection.id);
                        }
                      } else if (e.key === 'End') {
                        e.preventDefault();
                        const lastSection = introductionContent.sections[introductionContent.sections.length - 1];
                        if (lastSection) {
                          handleSectionScroll(lastSection.id);
                        }
                      }
                    }}
                    aria-label="Return to table of contents"
                  >
                    ↑ Contents
                  </button>

                  {!progress.isLast ? (
                    <button
                      type="button"
                      className="ai-introduction-container__section-nav-button ai-introduction-container__section-nav-button--next"
                      onClick={() => handleNextSection(section.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          handleNextSection(section.id);
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          handlePreviousSection(section.id);
                        }
                      }}
                      aria-label={`Go to next section: ${introductionContent.sections[index + 1]?.title}`}
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="ai-introduction-container__section-nav-button ai-introduction-container__section-nav-button--finish"
                      onClick={() => {
                        if (footerRef.current) {
                          footerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          setTimeout(() => {
                            const nextButton = footerRef.current?.querySelector('.ai-introduction-container__nav-button--glossary') as HTMLElement;
                            if (nextButton) {
                              nextButton.focus();
                            }
                          }, 500);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown' || e.key === 'End') {
                          e.preventDefault();
                          if (footerRef.current) {
                            footerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            setTimeout(() => {
                              const nextButton = footerRef.current?.querySelector('.ai-introduction-container__nav-button--glossary') as HTMLElement;
                              if (nextButton) {
                                nextButton.focus();
                              }
                            }, 500);
                          }
                        }
                      }}
                      aria-label="Go to next steps"
                    >
                      Next Steps →
                    </button>
                  )}
                </div>
              </nav>
            </section>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <footer 
        id="navigation-footer"
        ref={footerRef} 
        className="ai-introduction-container__footer"
        aria-labelledby="completion-title"
        tabIndex={-1}
      >
        <div 
          className="ai-introduction-container__completion"
          role="region"
          aria-labelledby="completion-title"
        >
          <h2 
            id="completion-title"
            className="ai-introduction-container__completion-title"
            tabIndex={-1}
          >
            🎉 You've completed the AI Introduction!
          </h2>
          <p 
            className="ai-introduction-container__completion-text"
            aria-describedby="next-steps-description"
          >
            Now that you understand both the advantages and risks of AI, you're ready to explore 
            specific AI concepts and test your knowledge. Choose your next step:
          </p>
          <div 
            id="next-steps-description" 
            className="sr-only"
          >
            Three navigation options are available: explore the AI glossary, take the quiz, or return to the homepage
          </div>
        </div>

        <div 
          className="ai-introduction-container__navigation"
          role="navigation"
          aria-labelledby="next-steps-title"
        >
          <h3 
            id="next-steps-title" 
            className="ai-introduction-container__next-steps-title sr-only"
          >
            Next Steps Navigation
          </h3>
          <div 
            className="ai-introduction-container__nav-options"
            role="group"
            aria-labelledby="next-steps-title"
          >
            <div className="ai-introduction-container__nav-option">
              <button
                type="button"
                className="ai-introduction-container__nav-button ai-introduction-container__nav-button--glossary"
                onClick={() => handleNavigation('glossary')}
                aria-describedby="glossary-description"
              >
                📚 Explore AI Glossary
              </button>
              <p id="glossary-description" className="ai-introduction-container__nav-description">
                Learn 16 essential AI terms with role-specific context and examples
              </p>
            </div>

            <div className="ai-introduction-container__nav-option">
              <button
                type="button"
                className="ai-introduction-container__nav-button ai-introduction-container__nav-button--quiz"
                onClick={() => handleNavigation('quiz')}
                aria-describedby="quiz-description"
              >
                🧠 Take the Quiz
              </button>
              <p id="quiz-description" className="ai-introduction-container__nav-description">
                Test your understanding with interactive questions and get personalized feedback
              </p>
            </div>

            <div className="ai-introduction-container__nav-option">
              <button
                type="button"
                className="ai-introduction-container__nav-button ai-introduction-container__nav-button--home"
                onClick={() => handleNavigation('home')}
                aria-describedby="home-description"
              >
                🏠 Return to Home
              </button>
              <p id="home-description" className="ai-introduction-container__nav-description">
                Go back to the main portal to explore all available features
              </p>
            </div>
          </div>
        </div>

        {/* Reading Progress Summary */}
        <div 
          className="ai-introduction-container__reading-summary"
          role="region"
          aria-labelledby="summary-title"
        >
          <h3 
            id="summary-title" 
            className="ai-introduction-container__summary-title sr-only"
          >
            Reading Summary
          </h3>
          <div className="ai-introduction-container__summary-stats">
            <div className="ai-introduction-container__stat">
              <span className="ai-introduction-container__stat-number">{introductionContent.sections.length}</span>
              <span className="ai-introduction-container__stat-label">Sections Read</span>
            </div>
            <div className="ai-introduction-container__stat">
              <span className="ai-introduction-container__stat-number">100%</span>
              <span className="ai-introduction-container__stat-label">Complete</span>
            </div>
          </div>
          <p className="ai-introduction-container__summary-text">
            You now have a balanced understanding of AI's potential and pitfalls. 
            Use this knowledge to engage with AI tools more thoughtfully and effectively.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AIIntroductionContainer;