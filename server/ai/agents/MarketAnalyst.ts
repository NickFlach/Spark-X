import { BaseAgent } from './BaseAgent';
import { AgentConfig, AgentState, Message, TaskResult } from '../types';
import { ResourceManager } from '../resource/ResourceManager';
import { MonitoringSystem } from '../monitoring/MonitoringSystem';
import OpenAI from 'openai';

// Define a local configuration
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

interface MarketData {
  marketSize: number;
  growthRate: number;
  competitors: string[];
  trends: string[];
  opportunities: string[];
  risks: string[];
}

export class MarketAnalyst extends BaseAgent {
  private marketPrompt: string;
  private marketData: MarketData;
  private analysisDepth: number;
  private openai: OpenAI;

  constructor(
    config: AgentConfig,
    resourceManager: ResourceManager,
    monitoringSystem: MonitoringSystem
  ) {
    super(config, resourceManager, monitoringSystem);

    this.marketPrompt = `You are an expert market analyst specializing in identifying and analyzing market opportunities.
Your goal is to provide comprehensive market analysis by evaluating:
1. Market size and growth potential
2. Competitive landscape
3. Industry trends
4. Market opportunities
5. Potential risks and challenges
6. Entry barriers and moat components`;

    this.marketData = {
      marketSize: 0,
      growthRate: 0,
      competitors: [],
      trends: [],
      opportunities: [],
      risks: [],
    };

    this.analysisDepth = 0;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  protected async executeTask(taskData: string): Promise<TaskResult> {
    try {
      // Build context from market data and previous analyses
      const context = this.buildContext();

      // Get initial market analysis
      const response = await this.openai.chat.completions.create({
        model: defaultConfig.openai.defaultModel,
        messages: [
          { role: 'system', content: this.marketPrompt },
          { role: 'system', content: context },
          { role: 'user', content: taskData },
        ],
        temperature: defaultConfig.openai.defaultTemperature,
      });

      const initialAnalysis = response.choices[0]?.message?.content || '';

      // Update market data based on analysis
      await this.updateMarketData(initialAnalysis);

      // Perform deeper analysis if needed
      let result = initialAnalysis;
      if (this.analysisDepth < defaultConfig.agent.maxEnhancementIterations) {
        result = await this.performDeepAnalysis(taskData, initialAnalysis);
        this.analysisDepth++;
      }

      return {
        success: true,
        data: this.formatAnalysis(result),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `MarketAnalyst processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'MARKET_ANALYST_ERROR',
          details: error,
        },
      };
    }
  }

  protected async handleMessageInternal(message: Message): Promise<void> {
    if (message.type === 'MARKET_UPDATE') {
      await this.updateMarketData(message.content);
      // Store in a more persistent way if needed
    } else if (message.type === 'RESET') {
      this.analysisDepth = 0;
      this.marketData = {
        marketSize: 0,
        growthRate: 0,
        competitors: [],
        trends: [],
        opportunities: [],
        risks: [],
      };
      // Clear any stored data if needed
    }
  }

  private async performDeepAnalysis(
    originalTask: string,
    initialAnalysis: string
  ): Promise<string> {
    const deepAnalysisPrompt = `Based on the initial market analysis:
${initialAnalysis}

Please provide:
1. Detailed market segmentation analysis
2. Competitive advantage assessment
3. Market entry strategy recommendations
4. Risk mitigation strategies
5. Growth opportunity prioritization

Original market analysis request:
${originalTask}`;

    const response = await this.openai.chat.completions.create({
      model: defaultConfig.openai.defaultModel,
      messages: [
        { role: 'system', content: this.marketPrompt },
        { role: 'user', content: deepAnalysisPrompt },
      ],
      temperature: defaultConfig.openai.defaultTemperature,
    });

    return response.choices[0]?.message?.content || '';
  }

  private async updateMarketData(analysis: string): Promise<void> {
    // Extract market data from analysis using OpenAI
    const dataExtractionPrompt = `Extract the following market data from this analysis:
${analysis}

Provide the data in JSON format with these fields:
- marketSize (number)
- growthRate (number)
- competitors (string[])
- trends (string[])
- opportunities (string[])
- risks (string[])`;

    const response = await this.openai.chat.completions.create({
      model: defaultConfig.openai.defaultModel,
      messages: [
        {
          role: 'system',
          content: 'You are a data extraction specialist. Extract market data in JSON format.',
        },
        { role: 'user', content: dataExtractionPrompt },
      ],
      temperature: 0.1, // Lower temperature for more consistent extraction
    });

    try {
      const extractedData = JSON.parse(response.choices[0]?.message?.content || '{}');
      this.marketData = {
        ...this.marketData,
        ...extractedData,
      };
    } catch (error) {
      console.error('Error updating market data:', error);
    }
  }

  private buildContext(): string {
    // In the main project, we might need a different way to access historical data
    return `Current Market Data:
${JSON.stringify(this.marketData, null, 2)}

Analysis Depth: ${this.analysisDepth + 1}`;
  }

  private formatAnalysis(analysis: string): string {
    return `Market Analysis Report
=====================

${analysis}

Market Data Summary:
------------------
Market Size: ${this.marketData.marketSize}
Growth Rate: ${this.marketData.growthRate}%

Key Competitors:
${this.marketData.competitors.map(c => `- ${c}`).join('\n')}

Emerging Trends:
${this.marketData.trends.map(t => `- ${t}`).join('\n')}

Opportunities:
${this.marketData.opportunities.map(o => `- ${o}`).join('\n')}

Risks:
${this.marketData.risks.map(r => `- ${r}`).join('\n')}`;
  }

  public async reset(): Promise<void> {
    await super.reset();
    this.analysisDepth = 0;
    this.marketData = {
      marketSize: 0,
      growthRate: 0,
      competitors: [],
      trends: [],
      opportunities: [],
      risks: [],
    };
  }
} 