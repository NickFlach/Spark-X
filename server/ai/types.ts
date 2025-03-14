export enum AgentState {
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  ERROR = 'ERROR',
  RECOVERING = 'RECOVERING',
}

export interface Message {
  id: string;
  type: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
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

export interface AgentConfig {
  id: string;
  role: string;
  capabilities: string[];
  maxConcurrentTasks: number;
  timeout: number;
  retryAttempts: number;
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
