import React, { useState } from 'react';
import './PlatformVsToolsExplanation.css';

interface PlatformVsToolsExplanationProps {
  className?: string;
}

interface KeyDifference {
  aspect: string;
  platform: string;
  tool: string;
}

const keyDifferences: KeyDifference[] = [
  {
    aspect: "Scope",
    platform: "Comprehensive frameworks for building and managing multiple AI agents with complex workflows",
    tool: "Focused applications designed for specific tasks like code completion or research"
  },
  {
    aspect: "Autonomy",
    platform: "Enable creation of autonomous agents that can make decisions, plan, and execute multi-step processes",
    tool: "Provide assistance and suggestions but require human direction and decision-making"
  },
  {
    aspect: "Integration",
    platform: "Orchestrate multiple services, APIs, and data sources through agent workflows",
    tool: "Typically integrate with specific applications or environments (like IDEs or terminals)"
  },
  {
    aspect: "Complexity",
    platform: "Handle complex, multi-agent scenarios with coordination, memory, and state management",
    tool: "Excel at specific, well-defined tasks with immediate, focused outputs"
  },
  {
    aspect: "Use Cases",
    platform: "Business process automation, complex research workflows, multi-step problem solving",
    tool: "Code assistance, document search, terminal enhancement, specific productivity tasks"
  }
];

const PlatformVsToolsExplanation: React.FC<PlatformVsToolsExplanationProps> = ({
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`platform-vs-tools-explanation ${className}`}>
      <div className="explanation-header">
        <div className="explanation-title-section">
          <h2 className="explanation-title">
            AI Agent Platforms vs AI Tools: Understanding the Difference
          </h2>
          <p className="explanation-subtitle">
            AI Agent Platforms are comprehensive frameworks that enable the creation, orchestration, and management of autonomous AI agents, while AI Tools are specific applications that assist with particular tasks.
          </p>
        </div>
        
        <button
          className={`explanation-toggle ${isExpanded ? 'explanation-toggle--expanded' : ''}`}
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
          aria-controls="explanation-content"
          aria-label={isExpanded ? 'Hide detailed comparison' : 'Show detailed comparison'}
        >
          <span className="explanation-toggle-text">
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </span>
          <span className="explanation-toggle-icon" aria-hidden="true">
            {isExpanded ? '−' : '+'}
          </span>
        </button>
      </div>

      <div 
        id="explanation-content"
        className={`explanation-content ${isExpanded ? 'explanation-content--expanded' : ''}`}
        aria-hidden={!isExpanded}
        role="region"
      >
        <div className="explanation-overview">
          <div className="explanation-cards">
            <div className="explanation-card explanation-card--platforms">
              <div className="explanation-card-header">
                <span className="explanation-card-icon" aria-hidden="true">🤖</span>
                <h3 className="explanation-card-title">AI Agent Platforms</h3>
              </div>
              <div className="explanation-card-content">
                <p className="explanation-card-description">
                  Comprehensive frameworks that enable building, deploying, and managing autonomous AI agents capable of complex reasoning, planning, and multi-step task execution.
                </p>
                <div className="explanation-card-examples">
                  <h4 className="explanation-card-examples-title">Examples:</h4>
                  <ul className="explanation-card-examples-list">
                    <li>LangChain - Framework for chaining LLM operations</li>
                    <li>CrewAI - Multi-agent orchestration system</li>
                    <li>AutoGPT - Autonomous goal-driven agents</li>
                    <li>Google Vertex AI - Enterprise agent platform</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="explanation-card explanation-card--tools">
              <div className="explanation-card-header">
                <span className="explanation-card-icon" aria-hidden="true">🔧</span>
                <h3 className="explanation-card-title">AI Tools</h3>
              </div>
              <div className="explanation-card-content">
                <p className="explanation-card-description">
                  Specialized applications that use AI to enhance specific tasks and workflows, typically requiring human guidance and decision-making.
                </p>
                <div className="explanation-card-examples">
                  <h4 className="explanation-card-examples-title">Examples:</h4>
                  <ul className="explanation-card-examples-list">
                    <li>GitHub Copilot - Code completion assistant</li>
                    <li>Warp - AI-enhanced terminal</li>
                    <li>Perplexity - AI-powered research tool</li>
                    <li>Cursor IDE - AI-integrated code editor</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="explanation-comparison">
          <h3 className="explanation-comparison-title">Key Differences</h3>
          <div className="comparison-table">
            <div className="comparison-header">
              <div className="comparison-header-cell comparison-header-cell--aspect">Aspect</div>
              <div className="comparison-header-cell comparison-header-cell--platforms">AI Agent Platforms</div>
              <div className="comparison-header-cell comparison-header-cell--tools">AI Tools</div>
            </div>
            
            {keyDifferences.map((difference, index) => (
              <div key={index} className="comparison-row">
                <div className="comparison-cell comparison-cell--aspect">
                  <strong>{difference.aspect}</strong>
                </div>
                <div className="comparison-cell comparison-cell--platforms">
                  {difference.platform}
                </div>
                <div className="comparison-cell comparison-cell--tools">
                  {difference.tool}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="explanation-summary">
          <div className="summary-card">
            <h3 className="summary-title">When to Choose What?</h3>
            <div className="summary-content">
              <div className="summary-section">
                <h4 className="summary-section-title">Choose AI Agent Platforms when you need:</h4>
                <ul className="summary-list">
                  <li>Complex, multi-step automation workflows</li>
                  <li>Autonomous decision-making capabilities</li>
                  <li>Integration of multiple data sources and services</li>
                  <li>Scalable, enterprise-grade agent deployment</li>
                  <li>Custom agent development and orchestration</li>
                </ul>
              </div>
              
              <div className="summary-section">
                <h4 className="summary-section-title">Choose AI Tools when you need:</h4>
                <ul className="summary-list">
                  <li>Immediate assistance with specific tasks</li>
                  <li>Enhancement of existing workflows</li>
                  <li>Quick productivity improvements</li>
                  <li>Human-guided AI assistance</li>
                  <li>Integration with specific applications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformVsToolsExplanation;