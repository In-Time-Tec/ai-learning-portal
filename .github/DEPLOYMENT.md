# Deployment Guide

## Overview

This project uses GitHub Actions for automated deployment to GitHub Pages. The deployment pipeline includes comprehensive testing, security scanning, and performance monitoring.

## Workflows

### 1. Main Deployment (`deploy.yml`)
- **Trigger**: Push to `main` branch
- **Purpose**: Production deployment to GitHub Pages
- **Steps**:
  - Run tests and linting
  - Build application
  - Check bundle size (500KB limit)
  - Run Lighthouse performance audit
  - Deploy to GitHub Pages

### 2. Continuous Integration (`ci.yml`)
- **Trigger**: Push/PR to `main` or `develop`
- **Purpose**: Quality assurance across multiple Node.js versions
- **Features**:
  - Multi-version testing (Node 16, 18, 20)
  - Code coverage reporting
  - Bundle analysis
  - Accessibility auditing

### 3. Security Scanning (`security.yml`)
- **Trigger**: Push/PR + weekly schedule
- **Purpose**: Security vulnerability detection
- **Tools**:
  - CodeQL static analysis
  - NPM audit for dependencies
  - Automated security reporting

### 4. Staging Deployment (`staging.yml`)
- **Trigger**: Push to `develop` or `staging` branches
- **Purpose**: Pre-production testing environment
- **Features**:
  - Staging banner overlay
  - Separate deployment branch (`gh-pages-staging`)
  - PR comment with staging URL

### 5. Release Management (`release.yml`)
- **Trigger**: Git tags (v*)
- **Purpose**: Versioned releases with changelog
- **Features**:
  - Automatic changelog generation
  - GitHub release creation
  - Tagged deployments

## Performance Budgets

### Bundle Size Limits
- **Production**: 500KB (hard limit)
- **Warning threshold**: 400KB
- **Monitoring**: Automated in CI pipeline

### Lighthouse Thresholds
- **Performance**: ≥90
- **Accessibility**: 100 (WCAG AAA compliance)
- **Best Practices**: ≥90
- **SEO**: ≥90

### Core Web Vitals
- **First Contentful Paint**: ≤2000ms
- **Largest Contentful Paint**: ≤2500ms
- **Cumulative Layout Shift**: ≤0.1
- **Total Blocking Time**: ≤300ms

## Security Features

### Automated Dependency Updates
- **Tool**: Dependabot
- **Schedule**: Weekly (Mondays, 9 AM UTC)
- **Scope**: NPM packages and GitHub Actions

### Vulnerability Scanning
- **Static Analysis**: CodeQL (weekly)
- **Dependency Audit**: NPM audit (on every push)
- **Security Level**: Moderate and above flagged

## Deployment Process

### Production Deployment
1. Push changes to `main` branch
2. GitHub Actions automatically:
   - Runs full test suite
   - Performs security scans
   - Builds optimized bundle
   - Checks performance budgets
   - Deploys to GitHub Pages

### Staging Deployment
1. Push changes to `develop` or `staging` branch
2. Staging environment deployed with warning banner
3. PR comments include staging URL for review

### Manual Deployment
```bash
# Test deployment pipeline locally
npm run build
npm test -- --watchAll=false

# Trigger staging deployment
git push origin develop

# Create release
git tag v1.0.0
git push origin v1.0.0
```

## Monitoring and Alerts

### Build Failures
- **Notification**: GitHub notifications
- **Action**: Check workflow logs in Actions tab
- **Common issues**: Test failures, bundle size exceeded, security vulnerabilities

### Performance Degradation
- **Detection**: Lighthouse CI in pull requests
- **Threshold**: Any metric below defined limits
- **Action**: Review performance impact before merge

### Security Vulnerabilities
- **Detection**: Weekly CodeQL scans + dependency audits
- **Severity**: Moderate and above require attention
- **Action**: Update dependencies or apply patches

## Troubleshooting

### Build Failures
```bash
# Local debugging
npm ci
npm run build
npm test -- --watchAll=false

# Check specific issues
npx eslint src --ext .ts,.tsx
npm audit
```

### Performance Issues
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Run Lighthouse locally
npx lighthouse http://localhost:3000 --view
```

### Deployment Issues
1. Check GitHub Actions logs
2. Verify GitHub Pages settings
3. Ensure `homepage` field in package.json is correct
4. Check branch permissions and secrets

## Configuration Files

- `.github/workflows/`: All workflow definitions
- `lighthouserc.json`: Performance budget configuration
- `.github/dependabot.yml`: Dependency update settings
- `package.json`: Build scripts and dependencies

## Environment Variables

### GitHub Secrets (if needed)
- `GITHUB_TOKEN`: Automatically provided
- Additional secrets can be added in repository settings

### Build Environment
- `NODE_ENV`: Set to 'production' for builds
- `REACT_APP_ENVIRONMENT`: Set to 'staging' for staging builds

## Best Practices

1. **Always test locally** before pushing to main
2. **Use staging environment** for feature testing
3. **Monitor performance budgets** in PR reviews
4. **Keep dependencies updated** via Dependabot
5. **Review security alerts** promptly
6. **Use semantic versioning** for releases