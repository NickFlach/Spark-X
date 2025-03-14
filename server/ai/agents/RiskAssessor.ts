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

interface RiskAssessmentTask {
  ideaId: number;
  title: string;
  description: string;
  context?: {
    industry?: string;
    marketSize?: string;
    technicalComplexity?: string;
    regulatoryEnvironment?: string;
  };
  existingRisks?: Array<{
    category: string;
    description: string;
    severity?: string;
  }>;
}

interface RiskAssessmentResult {
  riskProfile: {
    overallRiskScore: number; // 0-100
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    summary: string;
  };
  businessRisks: Array<{
    category: string;
    description: string;
    likelihood: number; // 0-100
    impact: number; // 0-100
    mitigationStrategies: string[];
    contingencyPlans: string[];
  }>;
  technicalRisks: Array<{
    category: string;
    description: string;
    likelihood: number;
    impact: number;
    mitigationStrategies: string[];
    technicalSafeguards: string[];
  }>;
  marketRisks: Array<{
    category: string;
    description: string;
    likelihood: number;
    impact: number;
    mitigationStrategies: string[];
    marketingStrategies: string[];
  }>;
  regulatoryRisks: Array<{
    category: string;
    description: string;
    likelihood: number;
    impact: number;
    regulations: string[];
    complianceRequirements: string[];
    mitigationStrategies: string[];
  }>;
  operationalRisks: Array<{
    category: string;
    description: string;
    likelihood: number;
    impact: number;
    mitigationStrategies: string[];
    operationalControls: string[];
  }>;
  riskMatrix: {
    highPriority: string[];
    mediumPriority: string[];
    lowPriority: string[];
    monitoring: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    ongoingMonitoring: string[];
  };
}

export class RiskAssessor extends BaseAgent {
  private openai: OpenAI;

  constructor(
    config: AgentConfig,
    resourceManager: ResourceManager,
    monitoringSystem: MonitoringSystem
  ) {
    super(config, resourceManager, monitoringSystem);

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  protected async executeTask(taskData: string): Promise<TaskResult> {
    try {
      const task = JSON.parse(taskData) as RiskAssessmentTask;

      const response = await this.openai.chat.completions.create({
        model: defaultConfig.openai.defaultModel,
        messages: [
          {
            role: 'system',
            content: `You are a Risk Assessment Specialist with expertise in business, technical, market, and regulatory risk analysis.
            Your goal is to provide comprehensive risk assessment by:
            1. Identifying potential risks across multiple dimensions
            2. Evaluating likelihood and impact of each risk
            3. Developing mitigation strategies and contingency plans
            4. Prioritizing risks and responses
            5. Creating monitoring and management plans
            
            Provide detailed, actionable risk analysis with practical mitigation strategies.`,
          },
          {
            role: 'user',
            content: `Please assess the risks for the following idea:
            
            Title: ${task.title}
            Description: ${task.description}
            Context: ${JSON.stringify(task.context || {}, null, 2)}
            Existing Risks: ${JSON.stringify(task.existingRisks || [], null, 2)}
            
            Please provide a comprehensive risk assessment with specific focus on business, technical, market, regulatory, and operational risks.`,
          },
        ],
        temperature: defaultConfig.openai.defaultTemperature,
      });

      const responseContent = response.choices[0]?.message?.content || '';
      const assessmentResult = this.parseAIResponse(responseContent);

      return {
        success: true,
        data: assessmentResult,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `RiskAssessor processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          code: 'RISK_ASSESSOR_ERROR',
          details: error,
        },
      };
    }
  }

  protected async handleMessageInternal(message: Message): Promise<void> {
    // Handle specific message types if needed
    if (message.type === 'RESET') {
      // Reset any internal state if needed
    }
  }

  private parseAIResponse(response: string): RiskAssessmentResult {
    // This is a placeholder implementation
    // In a real system, we would use more sophisticated parsing
    // and potentially additional AI calls to structure the response
    try {
      // Attempt to parse as JSON first
      return JSON.parse(response) as RiskAssessmentResult;
    } catch (error) {
      // If not valid JSON, return a default structure
      return {
        riskProfile: {
          overallRiskScore: 50,
          riskLevel: 'Medium',
          summary: response.substring(0, 200) + '...',
        },
        businessRisks: [],
        technicalRisks: [],
        marketRisks: [],
        regulatoryRisks: [],
        operationalRisks: [],
        riskMatrix: {
          highPriority: [],
          mediumPriority: [],
          lowPriority: [],
          monitoring: [],
        },
        recommendations: {
          immediate: [],
          shortTerm: [],
          longTerm: [],
          ongoingMonitoring: [],
        },
      };
    }
  }
} 