# Spark-X Client

This is the client-side application for the Spark-X project.

## Setup

To set up the project, run the following commands:

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Install type definitions
npm install --save-dev @types/react @types/react-dom @types/node

# Install UI libraries
npm install lucide-react wouter @tanstack/react-query
```

Alternatively, you can run the setup script:

```bash
# On Windows
./setup.bat

# On Linux/Mac
chmod +x setup.sh
./setup.sh
```

## Fixing Linter Errors

The current linter errors are primarily related to missing module declarations and TypeScript configurations. Here's how to fix them:

1. **Missing module declarations**: The errors about missing modules like 'react', 'wouter', and 'lucide-react' can be fixed by installing the appropriate type definitions:

```bash
npm install --save-dev @types/react @types/react-dom
```

2. **JSX-related errors**: The errors about JSX elements can be fixed by ensuring the proper JSX configuration in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "allowSyntheticDefaultImports": true
  }
}
```

3. **React namespace errors**: Make sure to import React at the top of each file:

```typescript
import React from 'react';
```

4. **Implicit any types**: Add explicit type annotations to parameters:

```typescript
// Before
onChange={(e) => setValue(e.target.value)}

// After
onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
```

## Development

To start the development server:

```bash
npm run dev
```

## Building for Production

To build the application for production:

```bash
npm run build
```

## Project Structure

- `src/components`: Reusable UI components
  - `ui`: Basic UI components (buttons, inputs, etc.)
  - `layout`: Layout components (header, footer, etc.)
- `src/contexts`: React context providers
- `src/hooks`: Custom React hooks
- `src/lib`: Utility functions and libraries
- `src/pages`: Page components
  - `auth`: Authentication pages (login, register)
  - `ideas`: Idea-related pages (listing, detail, creation)
- `src/types`: TypeScript type definitions

## Directory Structure

```
client/
├── src/                # Source code
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React context providers
│   ├── lib/            # Utility functions and libraries
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── postcss.config.js   # PostCSS configuration
```

## Features

- **Authentication**: User login and registration
- **Idea Management**: Create, view, and manage ideas
- **Discovery**: Explore ideas from other users
- **Leaderboard**: View top-rated ideas and users
- **Analytics**: Analyze idea performance and metrics

## Technologies

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and development server
- **React Query**: Data fetching and state management
- **Wouter**: Lightweight routing library
