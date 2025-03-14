import { z } from 'zod';
import { AgentRole } from './index';

// Agent capability types
export enum AgentCapability {
  TEXT_ANALYSIS = 'TEXT_ANALYSIS',
  MARKET_RESEARCH = 'MARKET_RESEARCH',
  TECHNICAL_EVALUATION = 'TECHNICAL_EVALUATION',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  PROJECT_PLANNING = 'PROJECT_PLANNING',
  VALUE_OPTIMIZATION = 'VALUE_OPTIMIZATION',
  INNOVATION_IDEATION = 'INNOVATION_IDEATION',
  BUSINESS_ANALYSIS = 'BUSINESS_ANALYSIS',
}

// Agent performance metrics
export interface AgentPerformanceMetrics {
  tasksCompleted: number;
  averageProcessingTime: number;
  successRate: number;
  errorRate: number;
  lastActiveTimestamp: number;
}

// Agent feedback
export interface AgentFeedback {
  id: string;
  agentId: string;
  taskId: string;
  rating: number; // 1-5
  comments: string;
  timestamp: number;
  source: 'USER' | 'SYSTEM' | 'OTHER_AGENT';
}

// Agent learning data
export interface AgentLearningData {
  id: string;
  agentId: string;
  dataType: 'EXAMPLE' | 'CORRECTION' | 'PREFERENCE';
  content: string;
  metadata: Record<string, unknown>;
  timestamp: number;
}

// Agent collaboration record
export interface AgentCollaboration {
  id: string;
  initiatorId: string;
  collaboratorIds: string[];
  taskId: string;
  startTimestamp: number;
  endTimestamp?: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  outcome: string;
}

// Agent resource usage
export interface AgentResourceUsage {
  cpuTime: number;
  memoryUsage: number;
  apiCalls: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
}

// Agent deployment configuration
export const agentDeploymentConfigSchema = z.object({
  agentId: z.string(),
  version: z.string(),
  environment: z.enum(['DEV', 'STAGING', 'PRODUCTION']),
  scalingPolicy: z.object({
    minInstances: z.number().min(1),
    maxInstances: z.number().min(1),
    scaleUpThreshold: z.number().min(0).max(1),
    scaleDownThreshold: z.number().min(0).max(1),
  }),
  resourceLimits: z.object({
    maxCpu: z.number().positive(),
    maxMemory: z.number().positive(),
    maxTokensPerMinute: z.number().positive(),
  }),
  monitoring: z.object({
    logLevel: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']),
    metricsEnabled: z.boolean(),
    alertThresholds: z.record(z.number()),
  }),
});

export type AgentDeploymentConfig = z.infer<typeof agentDeploymentConfigSchema>; 