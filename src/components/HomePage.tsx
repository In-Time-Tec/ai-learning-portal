/**
 * HomePage Component
 * 
 * Landing page component that presents the two main feature areas (Learn and Tools)
 * with section cards for navigation and user progress statistics display.
 */

import React from 'react';
import { UserProgress } from '../types';
import './HomePage.css';

interface HomePageProps {
  className?: string;
  userProgress: UserProgress;
  onNavigate: (section: 'learn' | 'ai-tools' | 'introduction') => void;
}

interface SectionCardProps {
  title: string;
  description: string;
  icon: string;
  stats?: string;
  onClick: () => void;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  icon,
  stats,
  onClick,
  className = ''
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={`home-page__section-card ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-describedby={stats ? `${title.toLowerCase().replace(/\s+/g, '-')}-stats` : undefined}
    >
      <div className="home-page__card-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="home-page__card-content">
        <h3 className="home-page__card-title">{title}</h3>
        <p className="home-page__card-description">{description}</p>
        {stats && (
          <div 
            id={`${title.toLowerCase().replace(/\s+/g, '-')}-stats`}
            className="home-page__card-stats"
            aria-label={`Statistics: ${stats}`}
          >
            {stats}
          </div>
        )}
      </div>
      <div className="home-page__card-arrow" aria-hidden="true">
        →
      </div>
    </button>
  );
};

export const HomePage: React.FC<HomePageProps> = ({
  className = '',
  userProgress,
  onNavigate
}) => {
  // Calculate learning progress statistics
  const totalTerms = 16; // Based on requirements - 16 AI terms
  const completedTerms = userProgress.answeredTerms.size;
  const completionPercentage = Math.round((completedTerms / totalTerms) * 100);
  
  // Format quiz statistics
  const quizAttempts = userProgress.quizAttempts.length;
  const bestScore = userProgress.bestScore;
  
  // Generate stats text for Learn section
  const learnStats = `${completedTerms}/${totalTerms} terms explored • ${completionPercentage}% complete${
    quizAttempts > 0 ? ` • Best quiz score: ${bestScore}` : ''
  }`;

  // Generate stats text for Tools section
  const toolsStats = `Discover AI tools used in your organization`;

  const handleLearnNavigation = () => {
    onNavigate('learn');
  };

  const handleToolsNavigation = () => {
    onNavigate('ai-tools');
  };

  const handleIntroductionNavigation = () => {
    onNavigate('introduction');
  };

  return (
    <div className={`home-page ${className}`}>
      <div className="home-page__header">
        <h1 className="home-page__title">AI Learning Portal</h1>
        <p className="home-page__description">
          Explore AI concepts and discover tools used in your organization. 
          Choose a section below to get started.
        </p>

      </div>

      <div className="home-page__sections">
        <section className="home-page__section home-page__section--introduction" aria-labelledby="introduction-section-title">
          <h2 id="introduction-section-title" className="home-page__section-title">
            Start Here
          </h2>
          <p className="home-page__section-description">
            Begin with a balanced perspective on AI's advantages and cognitive risks
          </p>
          
          <div className="home-page__cards">
            <SectionCard
              title="AI Introduction & Risks"
              description="Understand both the promise and perils of AI technology before diving into specific concepts"
              icon="🧠"
              stats="Essential reading for conscious AI engagement"
              onClick={handleIntroductionNavigation}
              className="home-page__introduction-card"
            />
          </div>
        </section>

        <div className="home-page__learn-tools-container">
          <section className="home-page__section" aria-labelledby="learn-section-title">
            <h2 id="learn-section-title" className="home-page__section-title">
              Learn
            </h2>
            <p className="home-page__section-description">
              Master AI fundamentals with interactive glossary, quizzes, and progress tracking
            </p>
            
            <div className="home-page__cards">
              <SectionCard
                title="Interactive Learning"
                description="Explore 16 essential AI terms with role-specific context, take quizzes, and track your progress"
                icon="📚"
                stats={learnStats}
                onClick={handleLearnNavigation}
                className="home-page__learn-card"
              />
            </div>
          </section>

          <section className="home-page__section" aria-labelledby="tools-section-title">
            <h2 id="tools-section-title" className="home-page__section-title">
              Tools
            </h2>
            <p className="home-page__section-description">
              Discover AI tools and real user experiences from within your organization
            </p>
            
            <div className="home-page__cards">
              <SectionCard
                title="AI Tools Showcase"
                description="Browse AI development tools, read user testimonials, and learn from real implementation experiences"
                icon="🛠️"
                stats={toolsStats}
                onClick={handleToolsNavigation}
                className="home-page__tools-card"
              />
            </div>
          </section>
        </div>
      </div>

      <div className="home-page__footer">
        <div className="home-page__progress-summary">
          <h3 className="home-page__progress-title">Your Progress</h3>
          <div className="home-page__progress-stats">
            <div className="home-page__stat">
              <span className="home-page__stat-value">{completedTerms}</span>
              <span className="home-page__stat-label">Terms Explored</span>
            </div>
            <div className="home-page__stat">
              <span className="home-page__stat-value">{quizAttempts}</span>
              <span className="home-page__stat-label">Quiz Attempts</span>
            </div>
            <div className="home-page__stat">
              <span className="home-page__stat-value">{bestScore}</span>
              <span className="home-page__stat-label">Best Score</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;