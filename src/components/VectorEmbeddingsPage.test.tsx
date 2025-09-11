/**
 * VectorEmbeddingsPage Component Tests
 * 
 * Comprehensive test suite for the VectorEmbeddingsPage component including
 * rendering, accessibility, and responsive behavior.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { VectorEmbeddingsPage } from './VectorEmbeddingsPage';

describe('VectorEmbeddingsPage Component', () => {
  describe('Rendering', () => {
    it('renders the main title and description', () => {
      render(<VectorEmbeddingsPage />);

      expect(screen.getByRole('heading', { level: 1, name: /vector embeddings/i })).toBeInTheDocument();
      expect(screen.getByText(/explore how ai systems represent and understand text/i)).toBeInTheDocument();
    });

    it('renders all main sections', () => {
      render(<VectorEmbeddingsPage />);

      expect(screen.getByRole('heading', { name: /what are vector embeddings\?/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /interactive demonstration/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /real-world applications/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /key concepts/i })).toBeInTheDocument();
    });

    it('renders the embedded iframe with correct attributes', () => {
      render(<VectorEmbeddingsPage />);

      const iframe = screen.getByTitle('Vector Embeddings Interactive Demonstration');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://claude.site/public/artifacts/f78fe0d2-0eb6-480f-a35a-7d1dac81760a/embed');
      expect(iframe).toHaveAttribute('width', '100%');
      expect(iframe).toHaveAttribute('height', '1200');
      expect(iframe).toHaveClass('vector-embeddings-page__iframe');
      expect(iframe).toHaveAttribute('allowFullScreen');
    });

    it('renders all application cards', () => {
      render(<VectorEmbeddingsPage />);

      expect(screen.getByRole('heading', { name: /search & retrieval/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /recommendation systems/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /language translation/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /content classification/i })).toBeInTheDocument();
    });

    it('renders all key concept cards', () => {
      render(<VectorEmbeddingsPage />);

      expect(screen.getByRole('heading', { name: /dimensionality/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /similarity/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /training/i })).toBeInTheDocument();
    });

    it('displays overview content correctly', () => {
      render(<VectorEmbeddingsPage />);

      expect(screen.getByText(/vector embeddings are numerical representations/i)).toBeInTheDocument();
      expect(screen.getByText(/similar concepts are positioned close together/i)).toBeInTheDocument();
    });

    it('displays application descriptions correctly', () => {
      render(<VectorEmbeddingsPage />);

      expect(screen.getByText(/find relevant documents, images, or products/i)).toBeInTheDocument();
      expect(screen.getByText(/suggest content, products, or connections/i)).toBeInTheDocument();
      expect(screen.getByText(/map words and phrases across languages/i)).toBeInTheDocument();
      expect(screen.getByText(/automatically categorize text, images/i)).toBeInTheDocument();
    });

    it('displays key concept descriptions correctly', () => {
      render(<VectorEmbeddingsPage />);

      expect(screen.getByText(/embeddings typically have hundreds or thousands/i)).toBeInTheDocument();
      expect(screen.getByText(/distance between vectors indicates similarity/i)).toBeInTheDocument();
      expect(screen.getByText(/embeddings are learned from large datasets/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure for accessibility', () => {
      render(<VectorEmbeddingsPage />);

      // Check for proper semantic elements
      expect(screen.getAllByRole('region')).toHaveLength(4); // Overview, Interactive, Applications, Key Concepts sections
      expect(screen.getAllByRole('heading')).toHaveLength(12); // Main title + section titles + card titles
    });

    it('has proper heading hierarchy', () => {
      render(<VectorEmbeddingsPage />);

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBe(12);
      expect(headings[0]?.tagName).toBe('H1'); // Main title
      
      // Check that we have the right number of H2 and H3 headings
      const h2Headings = headings.filter(h => h.tagName === 'H2');
      const h3Headings = headings.filter(h => h.tagName === 'H3');
      expect(h2Headings.length).toBe(4); // Section titles
      expect(h3Headings.length).toBe(7); // Application cards (4) + Key concept cards (3)
    });

    it('has proper section labeling', () => {
      render(<VectorEmbeddingsPage />);

      // Check sections are properly labeled
      const overviewSection = screen.getByRole('region', { name: /what are vector embeddings/i });
      expect(overviewSection).toBeInTheDocument();

      const interactiveSection = screen.getByRole('region', { name: /interactive demonstration/i });
      expect(interactiveSection).toBeInTheDocument();

      const applicationsSection = screen.getByRole('region', { name: /real-world applications/i });
      expect(applicationsSection).toBeInTheDocument();

      const conceptsSection = screen.getByRole('region', { name: /key concepts/i });
      expect(conceptsSection).toBeInTheDocument();
    });

    it('has proper iframe accessibility attributes', () => {
      render(<VectorEmbeddingsPage />);

      const iframe = screen.getByTitle('Vector Embeddings Interactive Demonstration');
      expect(iframe).toHaveAttribute('title', 'Vector Embeddings Interactive Demonstration');
      expect(iframe).toHaveAttribute('allow', 'clipboard-write');
    });

    it('supports screen readers with proper semantic structure', () => {
      render(<VectorEmbeddingsPage />);

      // Check for proper section elements
      const sections = screen.getAllByRole('region');
      expect(sections.length).toBe(4);

      // Check for proper heading structure
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Responsive Design', () => {
    it('applies custom className when provided', () => {
      const { container } = render(
        <VectorEmbeddingsPage className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('vector-embeddings-page', 'custom-class');
    });

    it('applies default className when none provided', () => {
      const { container } = render(<VectorEmbeddingsPage />);

      expect(container.firstChild).toHaveClass('vector-embeddings-page');
    });
  });

  describe('Content Structure', () => {
    it('maintains proper content organization', () => {
      render(<VectorEmbeddingsPage />);

      // Check that content is organized in the expected order
      const headings = screen.getAllByRole('heading');
      const headingTexts = headings.map(h => h.textContent);

      expect(headingTexts[0]).toBe('Vector Embeddings');
      expect(headingTexts[1]).toBe('What are Vector Embeddings?');
      expect(headingTexts[2]).toBe('Interactive Demonstration');
      expect(headingTexts[3]).toBe('Real-World Applications');
      expect(headingTexts[8]).toBe('Key Concepts'); // After the 4 application cards (index 4-7)
    });

    it('includes all required application areas', () => {
      render(<VectorEmbeddingsPage />);

      const expectedApplications = [
        'Search & Retrieval',
        'Recommendation Systems',
        'Language Translation',
        'Content Classification'
      ];

      expectedApplications.forEach(app => {
        expect(screen.getByRole('heading', { name: new RegExp(app, 'i') })).toBeInTheDocument();
      });
    });

    it('includes all required key concepts', () => {
      render(<VectorEmbeddingsPage />);

      const expectedConcepts = [
        'Dimensionality',
        'Similarity',
        'Training'
      ];

      expectedConcepts.forEach(concept => {
        expect(screen.getByRole('heading', { name: new RegExp(concept, 'i') })).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Elements', () => {
    it('renders iframe container with proper structure', () => {
      render(<VectorEmbeddingsPage />);

      const iframe = screen.getByTitle('Vector Embeddings Interactive Demonstration');
      const container = iframe.parentElement;
      
      expect(container).toHaveClass('vector-embeddings-page__iframe-container');
      expect(iframe).toHaveClass('vector-embeddings-page__iframe');
    });

    it('provides proper context for the interactive demonstration', () => {
      render(<VectorEmbeddingsPage />);

      expect(screen.getByText(/explore how words and concepts are positioned in vector space with this interactive visualization/i)).toBeInTheDocument();
    });
  });

  describe('Educational Content', () => {
    it('provides comprehensive explanation of vector embeddings', () => {
      render(<VectorEmbeddingsPage />);

      // Check for key educational concepts
      expect(screen.getByText(/numerical representations of data/i)).toBeInTheDocument();
      expect(screen.getByText(/high-dimensional space/i)).toBeInTheDocument();
      expect(screen.getByText(/semantic meaning/i)).toBeInTheDocument();
    });

    it('explains practical applications clearly', () => {
      render(<VectorEmbeddingsPage />);

      // Check for practical application explanations
      expect(screen.getByText(/semantic similarity rather than just keyword matching/i)).toBeInTheDocument();
      expect(screen.getByText(/understanding user preferences/i)).toBeInTheDocument();
      expect(screen.getByText(/equivalent concepts near each other/i)).toBeInTheDocument();
    });

    it('covers technical concepts appropriately', () => {
      render(<VectorEmbeddingsPage />);

      // Check for technical concept coverage
      expect(screen.getByText(/hundreds or thousands of dimensions/i)).toBeInTheDocument();
      expect(screen.getByText(/closer vectors represent more similar concepts/i)).toBeInTheDocument();
      expect(screen.getByText(/learned from large datasets/i)).toBeInTheDocument();
    });
  });
});