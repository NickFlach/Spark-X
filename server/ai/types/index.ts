import { z } from 'zod';
import { AgentState } from '../types';

// Agent roles
export enum AgentRole {
  IDEA_ENHANCER = 'IDEA_ENHANCER',
  MARKET_ANALYST = 'MARKET_ANALYST',
  TECHNICAL_ADVISOR = 'TECHNICAL_ADVISOR',
  RISK_ASSESSOR = 'RISK_ASSESSOR',
  IMPLEMENTATION_PLANNER = 'IMPLEMENTATION_PLANNER',
  VALUE_ACCELERATOR = 'VALUE_ACCELERATOR',
  VALUE_INNOVATOR = 'VALUE_INNOVATOR',
  REAL_VALUE_ENGINE = 'REAL_VALUE_ENGINE',
}

// Agent configuration schema
export const agentConfigSchema = z.object({
  id: z.string(),
  role: z.nativeEnum(AgentRole),
  name: z.string(),
  description: z.string(),
  goals: z.array(z.string()),
  constraints: z.array(z.string()).optional(),
  allowedTools: z.array(z.string()).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  capabilities: z.array(z.string()),
  maxConcurrentTasks: z.number(),
  timeout: z.number(),
  retryAttempts: z.number(),
});

export type ExtendedAgentConfig = z.infer<typeof agentConfigSchema>;

// Agent state schema
export const agentStateSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(AgentState),
  currentTask: z.string().optional(),
  memory: z.record(z.unknown()).optional(),
  lastUpdated: z.date(),
});

export type ExtendedAgentState = z.infer<typeof agentStateSchema>;

// Message types
export interface ExtendedMessage {
  id: string;
  type: MessageType;
  from: string;
  to: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export type MessageType =
  | 'TASK'
  | 'RESULT'
  | 'INFO'
  | 'ERROR'
  | 'MARKET_UPDATE'
  | 'RESET'
  | 'STATUS_UPDATE'
  | 'UPDATE_CONTEXT'
  | 'UPDATE_EXECUTION_PLAN'
  | 'GENERATE_INNOVATION_PATHS'
  | 'MAP_STAKEHOLDERS'
  | 'UPDATE_METRICS'
  | 'GENERATE_ACTIONS'
  | 'UPDATE_MARKET'
  | 'TECH_UPDATE';

// Memory types
export interface AgentMemory {
  getRelevantHistory(): string;
  addEntry(entry: MemoryEntry): void;
  clear(): void;
  getEntries(filter?: MemoryFilter): MemoryEntry[];
}

export interface MemoryEntry {
  timestamp: number;
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface MemoryFilter {
  startTime?: number;
  endTime?: number;
  type?: string[];
  metadata?: Record<string, unknown>;
}

// Tool types
export interface AgentTool {
  name: string;
  description: string;
  function: (...args: any[]) => Promise<any>;
  parameters: Record<string, unknown>;
}

// Re-export all types from their respective files
export * from './agent.types';
export * from './message.types';
export * from './memory.types';

// Mission Control Panel types
export const mcpConfigSchema = z.object({
  agents: z.array(agentConfigSchema),
  defaultModel: z.string(),
  defaultTemperature: z.number().min(0).max(2),
  maxConcurrentTasks: z.number().positive(),
  timeoutMs: z.number().positive(),
});

export type MCPConfig = z.infer<typeof mcpConfigSchema>;

// Task types
export const taskSchema = z.object({
  id: z.string(),
  type: z.string(),
  input: z.record(z.unknown()),
  assignedAgent: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']),
  result: z.unknown().optional(),
  error: z.string().optional(),
  created: z.date(),
  updated: z.date(),
});

export type Task = z.infer<typeof taskSchema>; 