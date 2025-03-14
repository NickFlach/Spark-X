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
};

interface ValueStream {
  immediate: {
    revenue: number;
    costReduction: number;
    timeToValue: string;
    implementationEffort: number;
  };
  strategic: {
    marketPosition: number;
    competitiveAdvantage: string[];
    moatComponents: string[];
    futurePotential: number;
  };
  technical: {
    feasibility: number;
    innovationScore: number;
    scalability: number;
    maintainability: number;
  };
}

interface InnovationPath {
  currentState: {
    value: number;
    complexity: number;
    dependencies: string[];
  };
  nextSteps: Array<{
    action: string;
    value: number;
    effort: number;
    timeline: string;
    risks: string[];
  }>;
  longTerm: {
    vision: string;
    milestones: string[];
    potentialValue: number;
    keyEnablers: string[];
  };
}

interface StakeholderMap {
  internal: Array<{
    role: string;
    needs: string[];
    value: string[];
    influence: number;
  }>;
  external: Array<{
    type: string;
    needs: string[];
    value: string[];
    influence: number;
  }>;
}

export class ValueInnovator extends BaseAgent {
  private valuePrompt: string;
  private valueStreams: ValueStream;
  private innovationPaths: InnovationPath[];
  private stakeholderMap: StakeholderMap;
  private analysisDepth: number;
  private openai: OpenAI;

  constructor(
    config: AgentConfig,
    resourceManager: ResourceManager,
    monitoringSystem: MonitoringSystem
  ) {
    super(config, resourceManager, monitoringSystem);

    this.valuePrompt = `You are a Value Innovation Specialist with expertise in identifying and creating new value streams.
Your goal is to:
1. Identify immediate and strategic value opportunities
2. Map value to stakeholder needs
3. Create innovation paths that maximize value
4. Balance technical feasibility with business impact
5. Prioritize high-value, low-effort opportunities
6. Consider both short-term wins and long-term strategic advantages

Focus on practical, actionable insights that can drive measurable value creation.`;

    this.valueStreams = {
      immediate: {
        revenue: 0,
        costReduction: 0,
        timeToValue: '',
        implementationEffort: 0,
      },
      strategic: {
        marketPosition: 0,
        competitiveAdvantage: [],
        moatComponents: [],
        futurePotential: 0,
      },
      technical: {
        feasibility: 0,
        innovationScore: 0,
        scalability: 0,
        maintainability: 0,
      },
    };

    this.innovationPaths = [];
    this.stakeholderMap = {
      internal: [],
      external: [],
    };
    this.analysisDepth = 0;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  protected async executeTask(taskData: string): Promise<TaskResult> {
    try {
      // Build context from value data and previous analyses
      const context = this.buildContext();

      // Get initial value analysis
      const response = await this.openai.chat.completions.create({
        model: defaultConfig.openai.defaultModel,
        messages: [
          { role: 'system', content: this.valuePrompt },
          { role: 'system', content: context },
          { role: 'user', content: taskData },
        ],
        temperature: defaultConfig.openai.defaultTemperature,
      });

      const analysisText = response.choices[0]?.message?.content || '';
      const formattedAnalysis = this.formatAnalysis(analysisText);

      // Update value data based on analysis
      await this.updateValueData(analysisText);

      // Update agent metrics
      this.metrics.tasksProcessed += 1;
      this.metrics.lastActive = new Date();
      this.metrics.successRate = (this.metrics.successRate * (this.metrics.tasksProcessed - 1) + 1) / this.metrics.tasksProcessed;

      return {
        success: true,
        data: {
          analysis: formattedAnalysis,
          valueStreams: this.valueStreams,
          innovationPaths: this.innovationPaths,
          stakeholderMap: this.stakeholderMap,
        },
      };
    } catch (error) {
      // Update error metrics
      this.metrics.errors.push({
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error',
        severity: 'medium',
      });
      
      return {
        success: false,
        error: {
          message: `ValueInnovator processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'VALUE_INNOVATOR_ERROR',
          details: error,
        },
      };
    }
  }

  protected async handleMessageInternal(message: Message): Promise<void> {
    if (message.type === 'GENERATE_INNOVATION_PATHS') {
      if (message.metadata && typeof message.metadata.analysisData === 'string') {
        await this.generateInnovationPaths(message.metadata.analysisData);
      }
    } else if (message.type === 'MAP_STAKEHOLDERS') {
      if (message.metadata && typeof message.metadata.analysisData === 'string') {
        await this.mapStakeholders(message.metadata.analysisData);
      }
    } else if (message.type === 'RESET') {
      this.resetValueData();
    }
  }

  private async generateInnovationPaths(analysis: string): Promise<void> {
    try {
      const response = await this.openai.chat.completions.create({
        model: defaultConfig.openai.defaultModel,
        messages: [
          { role: 'system', content: this.valuePrompt },
          {
            role: 'user',
            content: `Based on the following analysis, generate detailed innovation paths that maximize value creation:
            
            ${analysis}`,
          },
        ],
        temperature: defaultConfig.openai.defaultTemperature,
      });

      const pathsText = response.choices[0]?.message?.content || '';
      this.extractInnovationPaths(pathsText);
    } catch (error) {
      console.error('Error generating innovation paths:', error);
    }
  }

  private async mapStakeholders(analysis: string): Promise<void> {
    try {
      const response = await this.openai.chat.completions.create({
        model: defaultConfig.openai.defaultModel,
        messages: [
          { role: 'system', content: this.valuePrompt },
          {
            role: 'user',
            content: `Based on the following analysis, map all stakeholders and their relationship to the value streams:
            
            ${analysis}`,
          },
        ],
        temperature: defaultConfig.openai.defaultTemperature,
      });

      const stakeholdersText = response.choices[0]?.message?.content || '';
      this.extractStakeholderMap(stakeholdersText);
    } catch (error) {
      console.error('Error mapping stakeholders:', error);
    }
  }

  private async updateValueData(analysis: string): Promise<void> {
    try {
      // Extract value streams data
      this.extractValueStreams(analysis);

      // Extract innovation paths
      this.extractInnovationPaths(analysis);

      // Extract stakeholder map
      this.extractStakeholderMap(analysis);

      // Increment analysis depth
      this.analysisDepth++;
    } catch (error) {
      console.error('Error updating value data:', error);
    }
  }

  private buildContext(): string {
    return `
Current Value Streams:
${JSON.stringify(this.valueStreams, null, 2)}

Current Innovation Paths:
${JSON.stringify(this.innovationPaths, null, 2)}

Current Stakeholder Map:
${JSON.stringify(this.stakeholderMap, null, 2)}

Analysis Depth: ${this.analysisDepth}
`;
  }

  private formatAnalysis(analysis: string): string {
    // Simple formatting for now
    return analysis;
  }

  private extractValueStreams(text: string): void {
    // This is a placeholder implementation
    // In a real system, we would use more sophisticated extraction
    // potentially with additional AI calls to structure the data
    
    // For now, we'll just update a few fields with mock data
    this.valueStreams.immediate.revenue += 0.1;
    this.valueStreams.strategic.marketPosition += 0.05;
    this.valueStreams.technical.feasibility = 
      Math.min(1, this.valueStreams.technical.feasibility + 0.1);
  }

  private extractInnovationPaths(text: string): void {
    // This is a placeholder implementation
    if (this.innovationPaths.length === 0) {
      this.innovationPaths.push({
        currentState: {
          value: 0.3,
          complexity: 0.5,
          dependencies: ['Market research', 'Technical feasibility'],
        },
        nextSteps: [
          {
            action: 'Prototype core functionality',
            value: 0.4,
            effort: 0.3,
            timeline: '2 weeks',
            risks: ['Technical complexity', 'Resource availability'],
          },
        ],
        longTerm: {
          vision: 'Establish market leadership through continuous innovation',
          milestones: ['MVP launch', 'Market validation', 'Scale operations'],
          potentialValue: 0.8,
          keyEnablers: ['Technical talent', 'Market access', 'Funding'],
        },
      });
    }
  }

  private extractStakeholderMap(text: string): void {
    // This is a placeholder implementation
    if (this.stakeholderMap.internal.length === 0) {
      this.stakeholderMap.internal.push({
        role: 'Product Management',
        needs: ['Clear requirements', 'Market validation'],
        value: ['Product-market fit', 'User satisfaction'],
        influence: 0.8,
      });
    }
    
    if (this.stakeholderMap.external.length === 0) {
      this.stakeholderMap.external.push({
        type: 'End Users',
        needs: ['Usability', 'Performance', 'Reliability'],
        value: ['Productivity', 'Cost savings'],
        influence: 0.9,
      });
    }
  }

  private resetValueData(): void {
    this.valueStreams = {
      immediate: {
        revenue: 0,
        costReduction: 0,
        timeToValue: '',
        implementationEffort: 0,
      },
      strategic: {
        marketPosition: 0,
        competitiveAdvantage: [],
        moatComponents: [],
        futurePotential: 0,
      },
      technical: {
        feasibility: 0,
        innovationScore: 0,
        scalability: 0,
        maintainability: 0,
      },
    };

    this.innovationPaths = [];
    this.stakeholderMap = {
      internal: [],
      external: [],
    };
    this.analysisDepth = 0;
  }
} 