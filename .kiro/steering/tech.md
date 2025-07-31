# Technology Stack

## Frontend
- **Framework**: React with TypeScript
- **Architecture**: Single Page Application (SPA)
- **Styling**: TBD (likely CSS modules or styled-components)
- **Compliance**: Must be WCAG AAA Compliant. 

## Deployment
- **Platform**: GitHub Pages
- **Build Process**: GitHub Actions
- **Branch Strategy**: Production builds deployed to `gh-pages` branch on merge

## Data Management
- **Quiz Data**: Static JSON files (`questions.json`)
- **User Tracking**: Client-side localStorage (no backend required)
- **State Management**: React state (no external state library needed for MVP)

## Development Workflow
- **Version Control**: Git with GitHub
- **CI/CD**: GitHub Actions for automated builds and deployment
- **Static Hosting**: Fully static site compatible with GitHub Pages

## Common Commands
Since this is early stage, specific build commands are TBD, but typical React TypeScript setup would include:

```bash
# Install dependencies
npm install

# Development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Architecture Constraints
- Must be fully static (no server-side rendering)
- All functionality must work with GitHub Pages limitations
- Client-side only data persistence using localStorage
- External API calls limited to static JSON files