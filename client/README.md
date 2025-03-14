# Spark-X Client

This directory contains the client-side code for the Spark-X platform, built with React, TypeScript, and Tailwind CSS.

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

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
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