import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlatformVsToolsExplanation from './PlatformVsToolsExplanation';

describe('PlatformVsToolsExplanation', () => {
  it('renders the component with title and subtitle', () => {
    render(<PlatformVsToolsExplanation />);
    
    expect(screen.getByText('AI Agent Platforms vs AI Tools: Understanding the Difference')).toBeInTheDocument();
    expect(screen.getByText(/AI Agent Platforms are comprehensive frameworks/)).toBeInTheDocument();
  });

  it('shows and hides detailed content when toggle button is clicked', () => {
    render(<PlatformVsToolsExplanation />);
    
    const toggleButton = screen.getByRole('button', { name: /show detailed comparison/i });
    expect(toggleButton).toBeInTheDocument();
    
    // Initially, content container should have collapsed class
    const contentContainer = screen.getByRole('region', { hidden: true });
    expect(contentContainer).toHaveAttribute('aria-hidden', 'true');
    
    // Click to expand
    fireEvent.click(toggleButton);
    
    // Now content container should be expanded
    expect(contentContainer).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText('Key Differences')).toBeInTheDocument();
    expect(screen.getAllByText('AI Agent Platforms')).toHaveLength(2); // Card title and table header
    expect(screen.getAllByText('AI Tools')).toHaveLength(2); // Card title and table header
    
    // Button text should change
    expect(screen.getByRole('button', { name: /hide detailed comparison/i })).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(toggleButton);
    
    // Content should be hidden again
    expect(contentContainer).toHaveAttribute('aria-hidden', 'true');
  });

  it('displays platform and tool examples when expanded', () => {
    render(<PlatformVsToolsExplanation />);
    
    const toggleButton = screen.getByRole('button', { name: /show detailed comparison/i });
    fireEvent.click(toggleButton);
    
    // Check for platform examples
    expect(screen.getByText('LangChain - Framework for chaining LLM operations')).toBeVisible();
    expect(screen.getByText('CrewAI - Multi-agent orchestration system')).toBeVisible();
    expect(screen.getByText('AutoGPT - Autonomous goal-driven agents')).toBeVisible();
    
    // Check for tool examples
    expect(screen.getByText('GitHub Copilot - Code completion assistant')).toBeVisible();
    expect(screen.getByText('Warp - AI-enhanced terminal')).toBeVisible();
    expect(screen.getByText('Perplexity - AI-powered research tool')).toBeVisible();
  });

  it('displays comparison table when expanded', () => {
    render(<PlatformVsToolsExplanation />);
    
    const toggleButton = screen.getByRole('button', { name: /show detailed comparison/i });
    fireEvent.click(toggleButton);
    
    // Check for comparison aspects
    expect(screen.getByText('Scope')).toBeVisible();
    expect(screen.getByText('Autonomy')).toBeVisible();
    expect(screen.getByText('Integration')).toBeVisible();
    expect(screen.getByText('Complexity')).toBeVisible();
    expect(screen.getByText('Use Cases')).toBeVisible();
  });

  it('displays summary section when expanded', () => {
    render(<PlatformVsToolsExplanation />);
    
    const toggleButton = screen.getByRole('button', { name: /show detailed comparison/i });
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('When to Choose What?')).toBeVisible();
    expect(screen.getByText('Choose AI Agent Platforms when you need:')).toBeVisible();
    expect(screen.getByText('Choose AI Tools when you need:')).toBeVisible();
    
    // Check for some specific recommendations
    expect(screen.getByText('Complex, multi-step automation workflows')).toBeVisible();
    expect(screen.getByText('Immediate assistance with specific tasks')).toBeVisible();
  });

  it('has proper accessibility attributes', () => {
    render(<PlatformVsToolsExplanation />);
    
    const toggleButton = screen.getByRole('button', { name: /show detailed comparison/i });
    
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('aria-controls', 'explanation-content');
    
    fireEvent.click(toggleButton);
    
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies custom className when provided', () => {
    const { container } = render(<PlatformVsToolsExplanation className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('platform-vs-tools-explanation');
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles keyboard navigation properly', () => {
    render(<PlatformVsToolsExplanation />);
    
    const toggleButton = screen.getByRole('button', { name: /show detailed comparison/i });
    
    // Focus the button
    toggleButton.focus();
    expect(toggleButton).toHaveFocus();
    
    // Press Enter to activate
    fireEvent.keyDown(toggleButton, { key: 'Enter' });
    
    expect(screen.getByText('Key Differences')).toBeVisible();
  });
});