// AI Agent Types

export enum AgentState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
  PAUSED = 'PAUSED',
}

export enum AgentRole {
  IDEA_ENHANCER = 'IDEA_ENHANCER',
  MARKET_ANALYST = 'MARKET_ANALYST',
  TECHNICAL_ADVISOR = 'TECHNICAL_ADVISOR',
  RISK_ASSESSOR = 'RISK_ASSESSOR',
  IMPLEMENTATION_PLANNER = 'IMPLEMENTATION_PLANNER',
}

export interface AgentConfig {
  role: AgentRole;
  name: string;
  description: string;
  goals: string[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: AgentTool[];
}

export interface AgentTool {
  name: string;
  description: string;
  function: (...args: any[]) => Promise<any>;
  parameters: Record<string, unknown>;
}

export interface Message {
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
  | 'STATUS_UPDATE';

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

export interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: Error;
}

export interface AgentMetrics {
  tasksProcessed: number;
  successRate: number;
  lastActive: Date;
  errors: Array<{
    timestamp: Date;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export interface TaskResult {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  metrics?: {
    processingTime: number;
    resourceUsage: {
      cpu: number;
      memory: number;
      storage: number;
    };
  };
}
