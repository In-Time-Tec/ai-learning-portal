# Project Structure

## Current State
The repository is in early development with minimal structure:

```
/
├── README.md           # Project overview
├── PhaseOne.md         # Detailed Phase 1 specifications
├── .git/              # Git repository data
└── .kiro/             # Kiro AI assistant configuration
    └── steering/      # AI assistant guidance documents
```

## Planned Structure
Based on Phase One requirements, the expected structure will be:

```
/
├── public/            # Static assets and index.html
├── src/               # React TypeScript source code
│   ├── components/    # Reusable UI components
│   │   ├── Glossary/  # Interactive glossary component
│   │   └── Quiz/      # Quiz widget component
│   ├── data/          # Static data files
│   │   └── questions.json  # Quiz questions and answers
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions and helpers
│   └── App.tsx        # Main application component
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── .github/
    └── workflows/     # GitHub Actions for deployment
```

## Key Components
- **Glossary Component**: Displays 16 AI terms with role-specific context
- **Quiz Widget**: Randomly selects 3 questions from term pool
- **Progress Tracking**: Client-side localStorage for user metrics
- **Static Data**: JSON files for quiz questions and term definitions

## Conventions
- Use TypeScript for all source code
- Component-based architecture with React functional components
- Static data management (no external APIs)
- Client-side routing if needed (React Router)
- Responsive design for various screen sizes