import { BaseAgent } from './BaseAgent';
import { AgentConfig, AgentState, Message, TaskResult, AgentMetrics } from '../types';
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

interface ExecutionPlan {
  immediate: {
    tasks: Array<{
      id: string;
      title: string;
      description: string;
      value: number;
      effort: number;
      dependencies: string[];
      resources: string[];
      timeline: string;
      owner: string;
      status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    }>;
    blockers: Array<{
      id: string;
      description: string;
      impact: number;
      resolution: string;
      owner: string;
      status: 'open' | 'in_progress' | 'resolved';
    }>;
  };
  resources: {
    available: Array<{
      type: string;
      name: string;
      capacity: number;
      currentUsage: number;
    }>;
    required: Array<{
      type: string;
      name: string;
      quantity: number;
      priority: number;
    }>;
  };
  progress: {
    completed: number;
    inProgress: number;
    blocked: number;
    valueDelivered: number;
    timeElapsed: string;
    velocity: number;
  };
}

interface ExecutionMetrics {
  value: {
    delivered: number;
    projected: number;
    velocity: number;
    acceleration: number;
  };
  efficiency: {
    resourceUtilization: number;
    timeToValue: string;
    costPerValue: number;
  };
  quality: {
    successRate: number;
    stakeholderSatisfaction: number;
    technicalDebt: number;
  };
}

interface ExecutionContext {
  environment: {
    constraints: string[];
    opportunities: string[];
    risks: string[];
  };
  team: {
    members: Array<{
      role: string;
      skills: string[];
      availability: number;
      currentTasks: string[];
    }>;
    capacity: number;
    velocity: number;
  };
  assets: {
    available: string[];
    required: string[];
    gaps: string[];
  };
}

export class ValueAccelerator extends BaseAgent {
  private executionPrompt: string;
  private executionPlan: ExecutionPlan;
  private executionMetrics: ExecutionMetrics;
  private context: ExecutionContext;
  private analysisDepth: number;
  private openai: OpenAI;

  constructor(
    config: AgentConfig,
    resourceManager: ResourceManager,
    monitoringSystem: MonitoringSystem
  ) {
    super(config, resourceManager, monitoringSystem);

    this.executionPrompt = `You are an expert execution specialist focusing on rapid value delivery.
Your goal is to:
1. Break down value opportunities into actionable tasks
2. Optimize resource allocation and execution paths
3. Identify and resolve blockers quickly
4. Track and accelerate value delivery
5. Maintain quality while increasing velocity
6. Adapt to changing circumstances

Focus on practical execution strategies that maximize value delivery speed while maintaining quality.`;

    this.executionPlan = {
      immediate: {
        tasks: [],
        blockers: [],
      },
      resources: {
        available: [],
        required: [],
      },
      progress: {
        completed: 0,
        inProgress: 0,
        blocked: 0,
        valueDelivered: 0,
        timeElapsed: '',
        velocity: 0,
      },
    };

    this.executionMetrics = {
      value: {
        delivered: 0,
        projected: 0,
        velocity: 0,
        acceleration: 0,
      },
      efficiency: {
        resourceUtilization: 0,
        timeToValue: '',
        costPerValue: 0,
      },
      quality: {
        successRate: 0,
        stakeholderSatisfaction: 0,
        technicalDebt: 0,
      },
    };

    this.context = {
      environment: {
        constraints: [],
        opportunities: [],
        risks: [],
      },
      team: {
        members: [],
        capacity: 0,
        velocity: 0,
      },
      assets: {
        available: [],
        required: [],
        gaps: [],
      },
    };

    this.analysisDepth = 0;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  protected async executeTask(taskData: string): Promise<TaskResult> {
    try {
      // Build context from execution data and previous analyses
      const context = this.buildContext();

      // Get initial execution analysis
      const response = await this.openai.chat.completions.create({
        model: defaultConfig.openai.defaultModel,
        messages: [
          { role: 'system', content: this.executionPrompt },
          { role: 'system', content: context },
          { role: 'user', content: taskData },
        ],
        temperature: defaultConfig.openai.defaultTemperature,
      });

      const analysisText = response.choices[0]?.message?.content || '';
      const formattedAnalysis = this.formatAnalysis(analysisText);

      // Update execution data based on analysis
      await this.updateExecutionData(analysisText);

      // Update agent metrics from BaseAgent
      this.metrics.tasksProcessed += 1;
      this.metrics.lastActive = new Date();
      this.metrics.successRate = (this.metrics.successRate * (this.metrics.tasksProcessed - 1) + 1) / this.metrics.tasksProcessed;

      return {
        success: true,
        data: {
          analysis: formattedAnalysis,
          executionPlan: this.executionPlan,
          executionMetrics: this.executionMetrics,
        },
      };
    } catch (error) {
      // Update error metrics in BaseAgent
      this.metrics.errors.push({
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error',
        severity: 'medium',
      });
      
      return {
        success: false,
        error: {
          message: `ValueAccelerator processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'VALUE_ACCELERATOR_ERROR',
          details: error,
        },
      };
    }
  }

  protected async handleMessageInternal(message: Message): Promise<void> {
    if (message.type === 'UPDATE_CONTEXT') {
      if (message.metadata && typeof message.metadata.analysisData === 'string') {
        await this.updateContext(message.metadata.analysisData);
      }
    } else if (message.type === 'UPDATE_EXECUTION_PLAN') {
      if (message.metadata && typeof message.metadata.analysisData === 'string') {
        await this.generateExecutionPlan(message.metadata.analysisData);
      }
    } else if (message.type === 'RESET') {
      this.resetExecutionData();
    }
  }

  private async generateExecutionPlan(analysis: string): Promise<void> {
    try {
      const response = await this.openai.chat.completions.create({
        model: defaultConfig.openai.defaultModel,
        messages: [
          { role: 'system', content: this.executionPrompt },
          {
            role: 'user',
            content: `Based on the following analysis, generate a detailed execution plan with specific tasks, resource requirements, and expected progress metrics:
            
            ${analysis}`,
          },
        ],
        temperature: defaultConfig.openai.defaultTemperature,
      });

      const planText = response.choices[0]?.message?.content || '';
      await this.updateExecutionData(planText);
    } catch (error) {
      console.error('Error generating execution plan:', error);
    }
  }

  private async updateContext(analysis: string): Promise<void> {
    try {
      const response = await this.openai.chat.completions.create({
        model: defaultConfig.openai.defaultModel,
        messages: [
          { role: 'system', content: this.executionPrompt },
          {
            role: 'user',
            content: `Based on the following analysis, update the execution context with relevant constraints, opportunities, risks, team information, and asset requirements:
            
            ${analysis}`,
          },
        ],
        temperature: defaultConfig.openai.defaultTemperature,
      });

      const contextText = response.choices[0]?.message?.content || '';
      this.extractContextData(contextText);
    } catch (error) {
      console.error('Error updating context:', error);
    }
  }

  private async updateExecutionData(analysis: string): Promise<void> {
    try {
      // Extract execution plan data
      this.extractExecutionPlanData(analysis);

      // Extract metrics data
      this.extractMetricsData(analysis);

      // Extract context data
      this.extractContextData(analysis);

      // Increment analysis depth
      this.analysisDepth++;
    } catch (error) {
      console.error('Error updating execution data:', error);
    }
  }

  private buildContext(): string {
    return `
Current Execution Plan:
${JSON.stringify(this.executionPlan, null, 2)}

Current Execution Metrics:
${JSON.stringify(this.executionMetrics, null, 2)}

Current Context:
${JSON.stringify(this.context, null, 2)}

Analysis Depth: ${this.analysisDepth}
`;
  }

  private formatAnalysis(analysis: string): string {
    // Simple formatting for now
    return analysis;
  }

  private extractExecutionPlanData(text: string): void {
    // This is a placeholder implementation
    // In a real system, we would use more sophisticated extraction
    // potentially with additional AI calls to structure the data
    
    // For now, we'll just update a few fields with mock data
    this.executionPlan.progress.inProgress++;
    this.executionPlan.progress.valueDelivered += 0.1;
  }

  private extractMetricsData(text: string): void {
    // This is a placeholder implementation
    this.executionMetrics.value.velocity += 0.05;
    this.executionMetrics.efficiency.resourceUtilization = 
      Math.min(1, this.executionMetrics.efficiency.resourceUtilization + 0.1);
  }

  private extractContextData(text: string): void {
    // This is a placeholder implementation
    if (this.context.environment.constraints.length < 3) {
      this.context.environment.constraints.push(
        'Time constraint: rapid delivery required'
      );
    }
  }

  private resetExecutionData(): void {
    this.executionPlan = {
      immediate: {
        tasks: [],
        blockers: [],
      },
      resources: {
        available: [],
        required: [],
      },
      progress: {
        completed: 0,
        inProgress: 0,
        blocked: 0,
        valueDelivered: 0,
        timeElapsed: '',
        velocity: 0,
      },
    };

    this.executionMetrics = {
      value: {
        delivered: 0,
        projected: 0,
        velocity: 0,
        acceleration: 0,
      },
      efficiency: {
        resourceUtilization: 0,
        timeToValue: '',
        costPerValue: 0,
      },
      quality: {
        successRate: 0,
        stakeholderSatisfaction: 0,
        technicalDebt: 0,
      },
    };

    this.context = {
      environment: {
        constraints: [],
        opportunities: [],
        risks: [],
      },
      team: {
        members: [],
        capacity: 0,
        velocity: 0,
      },
      assets: {
        available: [],
        required: [],
        gaps: [],
      },
    };

    this.analysisDepth = 0;
  }
} 