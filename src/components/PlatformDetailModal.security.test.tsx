import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlatformDetailModal from './PlatformDetailModal';
import { AgentPlatform } from '../types';

// Mock window.open for external link testing
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen
});

// Mock console methods to capture security warnings
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const mockConsoleWarn = jest.fn();
const mockConsoleError = jest.fn();

// Test data with various URL scenarios
const createPlatformWithUrls = (urls: Partial<Pick<AgentPlatform, 'officialWebsite' | 'documentation' | 'githubRepository' | 'pricing'>>): AgentPlatform => ({
  id: 'test-platform',
  name: 'Test Platform',
  category: 'open-source-framework',
  type: 'open-source',
  description: 'A test platform for security testing',
  detailedDescription: 'Detailed description for security testing',
  strengths: ['Secure'],
  weaknesses: ['None'],
  primaryUseCases: ['Security testing'],
  keyFeatures: ['Security features'],
  targetAudience: ['Security testers'],
  maturityLevel: 'stable',
  lastUpdated: '2024-01-01',
  ...urls
});

const defaultProps = {
  isOpen: true,
  onClose: jest.fn()
};

describe('PlatformDetailModal Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowOpen.mockClear();
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
    
    // Mock console methods
    console.warn = mockConsoleWarn;
    console.error = mockConsoleError;
  });

  afterEach(() => {
    // Restore console methods
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe('URL Validation and Sanitization', () => {
    it('should allow valid HTTPS URLs', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://example.com',
        documentation: 'https://docs.example.com',
        githubRepository: 'https://github.com/example/repo',
        pricing: 'https://example.com/pricing'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      // Navigate to resources tab
      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // All valid HTTPS links should be rendered
      expect(screen.getByRole('link', { name: /visit test platform official website/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view test platform documentation/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view test platform github repository/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view pricing information/i })).toBeInTheDocument();
    });

    it('should allow valid HTTP URLs with warning', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'http://example.com',
        documentation: 'http://docs.example.com'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // HTTP links should be rendered but may have warnings
      expect(screen.getByRole('link', { name: /visit test platform official website/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view test platform documentation/i })).toBeInTheDocument();
    });

    it('should block javascript: URLs', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'javascript:alert("xss")',
        documentation: 'javascript:void(0)'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // JavaScript URLs should be filtered out
      const suspiciousLinks = screen.queryAllByRole('link').filter(link => {
        const href = link.getAttribute('href');
        return href && href.startsWith('javascript:');
      });

      expect(suspiciousLinks).toHaveLength(0);
    });

    it('should block data: URLs', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'data:text/html,<script>alert("xss")</script>',
        documentation: 'data:application/javascript,alert("xss")'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Data URLs should be filtered out
      const suspiciousLinks = screen.queryAllByRole('link').filter(link => {
        const href = link.getAttribute('href');
        return href && href.startsWith('data:');
      });

      expect(suspiciousLinks).toHaveLength(0);
    });

    it('should block vbscript: URLs', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'vbscript:msgbox("xss")',
        documentation: 'vbscript:alert("test")'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // VBScript URLs should be filtered out
      const suspiciousLinks = screen.queryAllByRole('link').filter(link => {
        const href = link.getAttribute('href');
        return href && href.startsWith('vbscript:');
      });

      expect(suspiciousLinks).toHaveLength(0);
    });

    it('should handle malformed URLs gracefully', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'not-a-valid-url',
        documentation: '://malformed-url',
        githubRepository: 'ftp://invalid-protocol.com'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Should not crash and should handle malformed URLs
      expect(screen.getByText('Official Resources')).toBeInTheDocument();
    });

    it('should sanitize URLs with encoded malicious content', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://example.com/%6A%61%76%61%73%63%72%69%70%74%3A%61%6C%65%72%74%28%31%29', // encoded javascript:alert(1)
        documentation: 'https://example.com/redirect?url=javascript:alert("xss")'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Should handle encoded malicious content appropriately
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          // Should not contain decoded javascript: protocols
          expect(href.toLowerCase()).not.toContain('javascript:');
        }
      });
    });
  });

  describe('Link Security Attributes', () => {
    it('should add proper security attributes to external links', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://example.com',
        documentation: 'https://docs.example.com',
        githubRepository: 'https://github.com/example/repo'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Check all external links have proper security attributes
      const externalLinks = screen.getAllByRole('link');
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should prevent window.opener access', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://malicious-site.com'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      const websiteLink = screen.getByRole('link', { name: /visit test platform official website/i });
      
      // Should have noopener to prevent window.opener access
      expect(websiteLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });

    it('should prevent referrer leakage', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://tracking-site.com'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      const websiteLink = screen.getByRole('link', { name: /visit test platform official website/i });
      
      // Should have noreferrer to prevent referrer leakage
      expect(websiteLink).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
    });
  });

  describe('Content Security Policy Compliance', () => {
    it('should not execute inline scripts from URLs', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://example.com/page?script=<script>alert("xss")</script>'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Should not execute any inline scripts
      expect(document.querySelectorAll('script')).toHaveLength(0);
    });

    it('should sanitize URL parameters', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://example.com?param=<img src=x onerror=alert(1)>',
        documentation: 'https://docs.example.com?search="><script>alert("xss")</script>'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // URLs should be rendered safely without executing embedded scripts
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      
      // Should not create any script elements
      expect(document.querySelectorAll('script')).toHaveLength(0);
    });
  });

  describe('URL Validation Edge Cases', () => {
    it('should handle extremely long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2000);
      const platform = createPlatformWithUrls({
        officialWebsite: longUrl
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Should handle long URLs without crashing
      expect(screen.getByText('Official Resources')).toBeInTheDocument();
    });

    it('should handle URLs with special characters', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://example.com/path?param=value&other=测试',
        documentation: 'https://docs.example.com/path/with spaces/and-special-chars!@#$%'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Should handle special characters in URLs
      expect(screen.getByRole('link', { name: /visit test platform official website/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view test platform documentation/i })).toBeInTheDocument();
    });

    it('should handle null and undefined URLs', async () => {
      const platform = createPlatformWithUrls({
        githubRepository: ''
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Should handle missing URLs gracefully
      expect(screen.getByText('Official Resources')).toBeInTheDocument();
      
      // Should not render links for missing URLs
      expect(screen.queryByRole('link', { name: /visit test platform official website/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /view test platform documentation/i })).not.toBeInTheDocument();
    });
  });

  describe('Click Jacking Prevention', () => {
    it('should open links in new tabs to prevent click jacking', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://example.com'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      const websiteLink = screen.getByRole('link', { name: /visit test platform official website/i });
      
      // Should open in new tab
      expect(websiteLink).toHaveAttribute('target', '_blank');
    });

    it('should prevent frame embedding of external content', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://malicious-frame-site.com'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Should not create any iframe elements
      expect(document.querySelectorAll('iframe')).toHaveLength(0);
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should sanitize platform name in link labels', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://example.com'
      });
      
      // Override platform name with potentially malicious content
      platform.name = '<script>alert("xss")</script>Test Platform';

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Link labels should be sanitized
      const websiteLink = screen.getByRole('link', { name: /visit.*official website/i });
      expect(websiteLink).toBeInTheDocument();
      
      // Should not execute script in the name
      expect(document.querySelectorAll('script')).toHaveLength(0);
    });

    it('should handle HTML entities in URLs', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://example.com?param=&lt;script&gt;alert("xss")&lt;/script&gt;'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      const websiteLink = screen.getByRole('link', { name: /visit test platform official website/i });
      
      // Should handle HTML entities safely
      expect(websiteLink).toBeInTheDocument();
      expect(document.querySelectorAll('script')).toHaveLength(0);
    });
  });

  describe('Security Headers and Policies', () => {
    it('should not modify document security policies', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://example.com'
      });

      const originalCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      
      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Should not modify existing CSP
      const currentCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      expect(currentCSP).toBe(originalCSP);
    });

    it('should not add unsafe inline styles or scripts', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'https://example.com'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Should not add any inline styles with javascript
      const elementsWithInlineStyles = document.querySelectorAll('[style*="javascript"]');
      expect(elementsWithInlineStyles).toHaveLength(0);

      // Should not add any inline event handlers
      const elementsWithInlineEvents = document.querySelectorAll('[onclick], [onload], [onerror]');
      expect(elementsWithInlineEvents).toHaveLength(0);
    });
  });

  describe('Error Handling for Security Issues', () => {
    it('should log security violations appropriately', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'javascript:alert("security-test")'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Should handle security violations without crashing
      expect(screen.getByText('Official Resources')).toBeInTheDocument();
    });

    it('should provide fallback for blocked URLs', async () => {
      const platform = createPlatformWithUrls({
        officialWebsite: 'javascript:void(0)',
        documentation: 'data:text/html,test'
      });

      
      render(<PlatformDetailModal {...defaultProps} platform={platform} />);

      const resourcesTab = screen.getByRole('tab', { name: 'Resources' });
      await userEvent.click(resourcesTab);

      // Should show resources section even with blocked URLs
      expect(screen.getByText('Official Resources')).toBeInTheDocument();
      
      // Should not show links for blocked URLs
      expect(screen.queryByRole('link', { name: /visit test platform official website/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /view test platform documentation/i })).not.toBeInTheDocument();
    });
  });
});