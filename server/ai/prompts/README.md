# AI Prompts

This directory contains prompt templates and configurations for the AI agents in the Spark-X platform.

## Purpose

- Store reusable prompt templates for different agent tasks
- Maintain consistent prompt structures across agents
- Enable easy updates to prompts without changing agent code
- Support versioning of prompts for different use cases

## Structure

Prompts are organized by agent type and task:

```
prompts/
  ├── idea_enhancer/
  │   ├── innovation_prompt.ts
  │   └── market_context.ts
  ├── market_analyst/
  │   ├── market_analysis.ts
  │   └── competitor_analysis.ts
  ├── technical_advisor/
  │   ├── tech_stack_analysis.ts
  │   └── architecture_review.ts
  ├── risk_assessor/
  │   ├── risk_identification.ts
  │   └── mitigation_strategies.ts
  ├── implementation_planner/
  │   ├── project_planning.ts
  │   └── resource_allocation.ts
  ├── value_accelerator/
  │   ├── execution_optimization.ts
  │   └── value_delivery.ts
  ├── value_innovator/
  │   ├── value_stream_identification.ts
  │   └── innovation_path.ts
  └── real_value_engine/
      ├── business_metrics.ts
      └── action_planning.ts
```

## Usage

Import prompt templates in agent code:

```typescript
import { innovationPrompt } from '../prompts/idea_enhancer/innovation_prompt';

// Use the prompt in agent code
const response = await this.openai.chat.completions.create({
  model: defaultConfig.openai.defaultModel,
  messages: [
    { role: 'system', content: innovationPrompt },
    { role: 'user', content: userQuery }
  ],
  temperature: defaultConfig.openai.defaultTemperature,
});
``` 