# Spark-X Server

This directory contains the server-side code for the Spark-X platform, including API endpoints, database integration, and AI agent functionality.

## Directory Structure

```
server/
├── ai/                  # AI agent functionality
│   ├── agents/          # Agent implementations
│   ├── memory/          # Agent memory management
│   ├── types/           # Type definitions for AI components
│   ├── prompts/         # Prompt templates for agents
│   └── tools/           # Tools used by agents
├── api/                 # API endpoints
├── blockchain/          # Blockchain integration
├── security/            # Security middleware and utilities
├── revenue/             # Revenue management
├── config.ts            # Server configuration
├── db.ts                # Database connection
├── index.ts             # Main server entry point
├── routes.ts            # API route definitions
├── storage.ts           # Data storage abstraction
└── vite.ts              # Vite integration for development
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=your_database_url
   OPENAI_API_KEY=your_openai_api_key
   JWT_SECRET=your_jwt_secret
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- **Authentication**
  - `POST /api/users/register` - Register a new user
  - `POST /api/users/login` - Log in a user
  - `POST /api/users/logout` - Log out a user
  - `GET /api/users/me` - Get current user information

- **Ideas**
  - `GET /api/ideas` - Get all ideas
  - `GET /api/ideas/:id` - Get a specific idea
  - `POST /api/ideas` - Create a new idea
  - `PUT /api/ideas/:id` - Update an idea
  - `DELETE /api/ideas/:id` - Delete an idea

- **AI Agents**
  - `POST /api/ai/enhance` - Enhance an idea using AI
  - `POST /api/ai/analyze` - Analyze market potential
  - `POST /api/ai/assess-risk` - Assess risks for an idea
  - `POST /api/ai/technical-review` - Get technical feedback
  - `POST /api/ai/implementation-plan` - Generate implementation plan

## Database

The server uses a PostgreSQL database with Drizzle ORM for data access. The database schema is defined in the `shared/schema` directory.

## AI Integration

The server integrates with OpenAI's API to provide AI agent functionality. The agents are implemented in the `ai/agents` directory and use the OpenAI API to generate responses.

## Security

The server implements various security measures, including:
- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation with Zod

## Development

- **Linting**: `npm run lint`
- **Testing**: `npm run test`
- **Building**: `npm run build` 