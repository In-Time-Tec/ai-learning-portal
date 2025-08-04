# AI Learning Portal

A website for people to learn about artificial intelligence and how it can create abundance.

This is a work in progress. This project was created during the AI Workshop as a demonstration of Agentic Developer Environments. We can use this project as an organization to practice using Agentic tools as well as increase organizational understanding.

## Features

- **Interactive AI Glossary**: 16 core AI terms with role-specific context for different business personas
- **Quiz System**: Interactive 3-question quizzes with immediate feedback
- **Progress Tracking**: Client-side progress tracking using localStorage
- **Accessibility**: WCAG AAA compliant with full keyboard navigation and screen reader support
- **Performance**: Optimized for fast loading with performance budgets

## Development

### Prerequisites
- Node.js 16+ 
- npm

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Testing
```bash
# Run all tests
npm test -- --watchAll=false

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run accessibility tests
npm test -- --testNamePattern="accessibility" --watchAll=false

# Lint code
npx eslint src --ext .ts,.tsx
```

## Deployment

This project uses GitHub Actions for automated deployment to GitHub Pages. See [.github/DEPLOYMENT.md](.github/DEPLOYMENT.md) for detailed deployment information.

### Quick Deployment
- **Production**: Push to `main` branch
- **Staging**: Push to `develop` branch
- **Release**: Create and push a git tag (e.g., `v1.0.0`)

### Performance Budgets
- Bundle size limit: 500KB
- Lighthouse performance score: ≥90
- Accessibility score: 100 (WCAG AAA)

## Architecture

- **Frontend**: React with TypeScript
- **Styling**: CSS modules with accessibility-first design
- **Data**: Static JSON files for quiz questions and glossary terms
- **Storage**: Client-side localStorage for progress tracking
- **Deployment**: GitHub Pages with automated CI/CD

## Contributing

1. Create a feature branch from `develop`
2. Make your changes with tests
3. Ensure all tests pass and linting is clean
4. Create a pull request to `develop`
5. After review, changes will be merged and deployed

## License

This project is open source and available under the [MIT License](LICENSE). 