# Design Document

## Overview

The AI Tools Showcase is a new major feature that will restructure the AI Learning Portal to have two main sections: "Learn" and "Tools". The current learning features (Glossary, Quiz, Progress) will be grouped under the "Learn" section, while the new AI Tools Showcase will be the primary feature under the "Tools" section. This creates a clearer information architecture that separates educational content from practical tool discovery. The design includes a new home page that serves as the entry point to both sections, maintaining consistency with the existing React TypeScript SPA structure.

## Architecture

### New Home Page Structure

The design will restructure the application to have a home page that presents two main sections:

1. **Home Page**: Landing page with two main feature areas
   - **Learn Section**: Access to Glossary, Quiz, and Progress (existing functionality)
   - **Tools Section**: Access to AI Tools Showcase (new functionality)

2. **Navigation Flow**: 
   - Home → Learn → (Glossary/Quiz/Progress)
   - Home → Tools → AI Tools Showcase

### Integration with Existing App Structure

The restructured application will:

1. **Navigation Redesign**: Replace current navigation with a home page that routes to two main sections
2. **View Management**: Extend `AppView` type to include 'home' and 'ai-tools' views
3. **Component Structure**: 
   - New HomePage component with Learn and Tools sections
   - Existing learning components (Glossary, Quiz, Progress) grouped under Learn
   - New AIToolsContainer for the Tools section
4. **Data Management**: Continue using static JSON files approach
5. **Styling Consistency**: Maintain existing design language while adding new home page styling

### Data Architecture

The feature will use a static JSON file approach consistent with the existing system:

```
public/
├── ai-tools.json          # Main tools data
├── glossary.json          # Existing glossary data
└── questions.json         # Existing quiz data
```

### Component Hierarchy

```
App
├── HomePage (new landing page)
│   ├── HomeHeader (title, description)
│   ├── LearnSection
│   │   ├── SectionCard (Glossary access)
│   │   ├── SectionCard (Quiz access)  
│   │   └── SectionCard (Progress access)
│   └── ToolsSection
│       └── SectionCard (AI Tools access)
├── LearnContainer (groups existing learning features)
│   ├── GlossaryContainer (existing)
│   ├── QuizContainer (existing)
│   └── ProgressTracker (existing)
└── AIToolsContainer (new)
    ├── AIToolsHeader (title, description, filters)
    ├── AIToolsGrid
    │   └── AIToolCard[] (individual tool cards)
    │       ├── ToolHeader (name, category, logo)
    │       ├── ToolDescription
    │       ├── UserExperiences[] (testimonials)
    │       ├── UseCases[] (specific use cases)
    │       └── ToolActions (links, resources)
    └── AIToolsFilters (category filter, search)
```

## Components and Interfaces

### Core Data Types

```typescript
// Extend existing types in src/types/index.ts

export type ToolCategory = 'code-assistant' | 'ide-extension' | 'research-tool' | 'debugging-tool' | 'testing-tool';

export interface UserExperience {
  id: string;
  quote: string;
  context: string;
  useCase: string;
  sentiment: 'positive' | 'mixed' | 'challenge';
  role?: UserRole; // Reuse existing UserRole type
}

export interface AITool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  officialLink?: string;
  internalSetupNotes?: string;
  userExperiences: UserExperience[];
  commonUseCases: string[];
  integrations?: string[];
  licensingNotes?: string;
  teamAdoption?: {
    level: 'individual' | 'team' | 'organization';
    notes: string;
  };
}

export interface AIToolsData {
  tools: AITool[];
  categories: {
    [key in ToolCategory]: {
      label: string;
      description: string;
    };
  };
}
```

### Main Components

#### HomePage Component

**Purpose**: New landing page component that presents the two main feature areas (Learn and Tools).

**Props**:
```typescript
interface HomePageProps {
  className?: string;
  onNavigate: (section: 'learn' | 'tools') => void;
}
```

**Key Features**:
- Display two main sections: Learn and Tools
- Provide clear navigation to each feature area
- Show progress indicators and statistics from existing user data
- Maintain responsive design and accessibility standards

#### LearnContainer Component

**Purpose**: Container component that groups the existing learning features (Glossary, Quiz, Progress) with their own sub-navigation.

**Props**:
```typescript
interface LearnContainerProps {
  className?: string;
  onBackToHome: () => void;
}
```

**Key Features**:
- Maintain existing navigation between Glossary, Quiz, and Progress
- Add "Back to Home" navigation option
- Preserve all existing functionality and state management

#### AIToolsContainer Component

**Purpose**: Main container component that manages the AI tools display, filtering, and search functionality.

**Props**:
```typescript
interface AIToolsContainerProps {
  className?: string;
}
```

**Key Features**:
- Load and display AI tools data from static JSON
- Implement category filtering (Code Assistant, IDE Extension, Research Tool, etc.)
- Provide search functionality across tool names and descriptions
- Handle loading and error states consistent with existing components
- Maintain responsive grid layout

#### AIToolCard Component

**Purpose**: Individual tool display component showing tool details, user experiences, and use cases.

**Props**:
```typescript
interface AIToolCardProps {
  tool: AITool;
  className?: string;
  onExperienceExpand?: (experienceId: string) => void;
}
```

**Key Features**:
- Display tool name, category, and description
- Show user testimonials and experiences
- List common use cases and integrations
- Provide links to official resources and internal setup notes
- Expandable sections for detailed user experiences
- Accessibility-compliant interaction patterns

#### AIToolsService

**Purpose**: Data service for loading and managing AI tools data, following the pattern of existing services.

**Key Methods**:
```typescript
class AIToolsService {
  async loadTools(): Promise<AITool[]>
  searchTools(query: string): AITool[]
  filterByCategory(category: ToolCategory): AITool[]
  getToolById(id: string): AITool | undefined
}
```

## Data Models

### AI Tools JSON Structure

The `public/ai-tools.json` file will contain structured data based on the meeting notes:

```json
{
  "categories": {
    "code-assistant": {
      "label": "Code Assistant",
      "description": "AI-powered coding assistance and code generation tools"
    },
    "ide-extension": {
      "label": "IDE Extension", 
      "description": "Integrated development environment extensions and plugins"
    },
    "research-tool": {
      "label": "Research Tool",
      "description": "Tools for research, documentation, and information gathering"
    }
  },
  "tools": [
    {
      "id": "warp",
      "name": "Warp",
      "category": "code-assistant",
      "description": "AI-powered terminal and development assistant",
      "officialLink": "https://warp.dev",
      "userExperiences": [
        {
          "id": "warp-exp-1",
          "quote": "Using as an Advisor instead of an Engineer",
          "context": "Customer Success Experience",
          "useCase": "Provides instructions, requests permissions to perform actions",
          "sentiment": "positive",
          "role": "business"
        },
        {
          "id": "warp-exp-2", 
          "quote": "Fully sold after a few hours",
          "context": "Team adoption",
          "useCase": "Regular meetings to upskill in Warp usage",
          "sentiment": "positive"
        }
      ],
      "commonUseCases": [
        "Debugging and refactoring",
        "Understanding code",
        "Validating code against acceptance criteria",
        "Framework documentation queries"
      ],
      "integrations": ["ADO (Azure DevOps)"],
      "teamAdoption": {
        "level": "team",
        "notes": "Having regular meetings to upskill in usage"
      }
    }
  ]
}
```

## Error Handling

### Data Loading Errors
- Follow existing error handling patterns from GlossaryContainer
- Implement retry functionality for network failures
- Provide fallback content when data is unavailable
- Display user-friendly error messages with actionable next steps

### User Experience Errors
- Handle missing or malformed tool data gracefully
- Provide default content when user experiences are unavailable
- Implement proper loading states during data fetching

## Testing Strategy

### Unit Testing
- Test AIToolsService data loading and filtering methods
- Test AIToolCard component rendering with various tool configurations
- Test search and filter functionality
- Test error handling scenarios

### Integration Testing
- Test navigation integration with existing App.tsx structure
- Test data loading from static JSON files
- Test responsive design across different screen sizes

### Accessibility Testing
- Ensure WCAG AAA compliance consistent with existing components
- Test keyboard navigation through tool cards and filters
- Test screen reader compatibility for user testimonials
- Verify proper ARIA labels and semantic HTML structure

### Component Testing
- Test AIToolsContainer with various data states (loading, error, success)
- Test filtering and search interactions
- Test tool card expansion and interaction states

## Visual Design

### Layout Structure
- **Header Section**: Title, description, and filter controls
- **Tools Grid**: Responsive card-based layout (3 columns desktop, 2 tablet, 1 mobile)
- **Tool Cards**: Consistent card design with hover states and expansion capabilities

### Design Consistency
- Maintain existing color scheme and typography from App.css
- Use consistent button styles and interaction patterns
- Follow existing spacing and layout conventions
- Implement same loading spinner and error message patterns

### Responsive Behavior
- Grid layout adapts to screen size (CSS Grid with auto-fit)
- Tool cards stack vertically on mobile devices
- Filter controls collapse to dropdown on smaller screens
- Maintain touch-friendly interaction targets

## Performance Considerations

### Data Loading
- Static JSON file approach ensures fast loading
- Implement client-side caching for tool data
- Use lazy loading for expanded user experience content

### Rendering Optimization
- Implement virtual scrolling if tool list becomes very large
- Use React.memo for tool card components to prevent unnecessary re-renders
- Optimize search and filter operations with debouncing

## Security Considerations

### Data Sanitization
- Sanitize user testimonial content to prevent XSS
- Validate external links before rendering
- Ensure proper encoding of user-generated content

### Privacy
- Maintain user anonymity in testimonials
- Avoid including sensitive internal information in tool descriptions
- Follow existing privacy patterns from the application