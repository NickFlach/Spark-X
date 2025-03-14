import { BaseAgent } from './BaseAgent';
import { AgentConfig, AgentState, Message, TaskResult } from '../types';
import { ResourceManager } from '../resource/ResourceManager';
import { MonitoringSystem } from '../monitoring/MonitoringSystem';
import OpenAI from 'openai';

// Define a local configuration since we don't have access to the original config
const defaultConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    defaultModel: 'gpt-4',
    defaultTemperature: 0.7,
  },
  agent: {
    maxEnhancementIterations: 3,
  },
};

export class IdeaEnhancer extends BaseAgent {
  private innovationPrompt: string;
  private marketContext: string;
  private enhancementIterations: number;
  private openai: OpenAI;

  constructor(
    config: AgentConfig,
    resourceManager: ResourceManager,
    monitoringSystem: MonitoringSystem
  ) {
    super(config, resourceManager, monitoringSystem);

    this.innovationPrompt = `You are an expert innovation consultant specializing in identifying and enhancing breakthrough ideas. 
Your goal is to analyze ideas and suggest improvements that increase their:
1. Innovation potential
2. Market viability
3. Technical feasibility
4. Competitive advantage
5. Scalability potential`;
    this.marketContext = '';
    this.enhancementIterations = 0;

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  protected async executeTask(taskData: string): Promise<TaskResult> {
    try {
      // Build context from previous interactions and market data
      const context = this.buildContext();

      // Get initial analysis
      const response = await this.openai.chat.completions.create({
        model: defaultConfig.openai.defaultModel,
        messages: [
          { role: 'system', content: this.innovationPrompt },
          { role: 'system', content: context },
          { role: 'user', content: taskData },
        ],
        temperature: defaultConfig.openai.defaultTemperature,
      });

      const initialAnalysis = response.choices[0]?.message?.content || '';

      // Iterate for improvements if needed
      let result = initialAnalysis;
      if (this.enhancementIterations < defaultConfig.agent.maxEnhancementIterations) {
        result = await this.iterateImprovements(taskData, initialAnalysis);
        this.enhancementIterations++;
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `IdeaEnhancer processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'IDEA_ENHANCER_ERROR',
          details: error,
        },
      };
    }
  }

  protected async handleMessageInternal(message: Message): Promise<void> {
    if (message.type === 'MARKET_UPDATE') {
      this.marketContext = message.content;
      // Store in a more persistent way if needed
    } else if (message.type === 'RESET') {
      this.enhancementIterations = 0;
      this.marketContext = '';
      // Clear any stored data if needed
    }
  }

  private async iterateImprovements(
    originalTask: string,
    initialAnalysis: string
  ): Promise<string> {
    const improvementPrompt = `Based on the initial analysis:
${initialAnalysis}

Please identify:
1. Potential weaknesses or limitations
2. Unexplored opportunities
3. Novel applications or markets
4. Technical innovations that could enhance the idea
5. Ways to strengthen the competitive advantage

Original idea:
${originalTask}`;

    const response = await this.openai.chat.completions.create({
      model: defaultConfig.openai.defaultModel,
      messages: [
        { role: 'system', content: this.innovationPrompt },
        { role: 'user', content: improvementPrompt },
      ],
      temperature: defaultConfig.openai.defaultTemperature,
    });

    return response.choices[0]?.message?.content || '';
  }

  private buildContext(): string {
    // In the main project, we might need a different way to access historical data
    return `Current Market Context:
${this.marketContext}

Enhancement Iteration: ${this.enhancementIterations + 1}`;
  }

  public async reset(): Promise<void> {
    await super.reset();
    this.enhancementIterations = 0;
    this.marketContext = '';
  }
} 