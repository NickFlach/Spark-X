# AI Agent Prompts

This directory contains prompt templates used by the AI agents in the Spark-X platform.

## Structure

Each agent has its own set of prompts that define how it interacts with users and processes tasks. The prompts are organized by agent type:

- `idea-enhancer/` - Prompts for the Idea Enhancer agent
- `market-analyst/` - Prompts for the Market Analyst agent
- `risk-assessor/` - Prompts for the Risk Assessor agent
- `technical-advisor/` - Prompts for the Technical Advisor agent
- `implementation-planner/` - Prompts for the Implementation Planner agent

## Prompt Format

Prompts are defined as template strings with placeholders that are replaced with dynamic content at runtime. For example:

```typescript
export const ideaEnhancementPrompt = `
You are an Idea Enhancement Agent. Your task is to help improve the following idea:

IDEA: {{idea}}

Please provide suggestions to enhance this idea in the following areas:
1. Uniqueness
2. Market potential
3. Technical feasibility
4. User experience
5. Business model

Your response should be structured, detailed, and actionable.
`;
```

## Usage

Prompts are imported and used by the agent implementations in the `../agents` directory. They are typically combined with the agent's memory and the current task to generate a complete prompt for the AI model.

## Adding New Prompts

When adding new prompts, follow these guidelines:

1. Use descriptive variable names that indicate the purpose of the prompt
2. Include placeholders for dynamic content using the `{{placeholder}}` syntax
3. Structure the prompt to elicit the desired response format
4. Include clear instructions and context for the AI model
5. Document any special formatting or requirements in comments 