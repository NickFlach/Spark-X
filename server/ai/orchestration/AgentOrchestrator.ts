import { BaseAgent } from '../agents/BaseAgent';
import { AgentState, Message, AgentMetrics } from '../types';
import { AuditLogger } from '../../security/AuditLogger';

interface AgentTask {
  id: string;
  type: string;
  priority: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  assignedAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  data: any;
}

interface OrchestratorConfig {
  maxConcurrentTasks: number;
  taskTimeout: number;
  retryAttempts: number;
  healthCheckInterval: number;
}

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent>;
  private tasks: Map<string, AgentTask>;
  private metrics: Map<string, AgentMetrics>;
  private auditLogger: AuditLogger;
  private config: OrchestratorConfig;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: OrchestratorConfig) {
    this.agents = new Map();
    this.tasks = new Map();
    this.metrics = new Map();
    this.auditLogger = new AuditLogger();
    this.config = config;
    this.startHealthChecks();
  }

  /**
   * Register a new agent with the orchestrator
   */
  public registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.getId(), agent);
    this.metrics.set(agent.getId(), {
      tasksProcessed: 0,
      successRate: 0,
      lastActive: new Date(),
      errors: [],
    });

    this.auditLogger.logSecurityEvent({} as any, 'system', 'agent_registered', {
      agentId: agent.getId(),
      agentRole: agent.getRole(),
    });
  }

  /**
   * Submit a new task for processing
   */
  public async submitTask(
    task: Omit<AgentTask, 'id' | 'status' | 'assignedAgent' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const newTask: AgentTask = {
      ...task,
      id: this.generateTaskId(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(newTask.id, newTask);
    await this.assignTask(newTask.id);

    this.auditLogger.logSecurityEvent({} as any, 'system', 'task_submitted', {
      taskId: newTask.id,
      taskType: task.type,
    });

    return newTask.id;
  }

  /**
   * Assign a task to an available agent
   */
  private async assignTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return;
    }

    const availableAgent = this.findAvailableAgent(task.type);
    if (!availableAgent) {
      // No available agent, task remains pending
      return;
    }

    task.assignedAgent = availableAgent.getId();
    task.status = 'assigned';
    task.updatedAt = new Date();

    try {
      await availableAgent.processTask(JSON.stringify(task.data));
      task.status = 'completed';
      this.updateAgentMetrics(availableAgent.getId(), true);
    } catch (error) {
      task.status = 'failed';
      this.updateAgentMetrics(availableAgent.getId(), false, error as Error);
    }

    task.updatedAt = new Date();
  }

  /**
   * Find an available agent for a task type
   */
  private findAvailableAgent(taskType: string): BaseAgent | undefined {
    return Array.from(this.agents.values()).find(
      agent => agent.getState() === AgentState.IDLE && this.canHandleTaskType(agent, taskType)
    );
  }

  /**
   * Check if an agent can handle a specific task type
   */
  private canHandleTaskType(agent: BaseAgent, taskType: string): boolean {
    // Implement task type compatibility check based on agent capabilities
    return true;
  }

  /**
   * Update agent metrics after task completion
   */
  private updateAgentMetrics(agentId: string, success: boolean, error?: Error): void {
    const metrics = this.metrics.get(agentId);
    if (!metrics) {
      return;
    }

    metrics.tasksProcessed++;
    metrics.lastActive = new Date();
    metrics.successRate = (metrics.tasksProcessed - metrics.errors.length) / metrics.tasksProcessed;

    if (!success && error) {
      metrics.errors.push({
        timestamp: new Date(),
        message: error.message,
        severity: 'high',
      });
    }
  }

  /**
   * Start health checks for all agents
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.checkAgentHealth();
    }, this.config.healthCheckInterval);
  }

  /**
   * Check health of all agents
   */
  private checkAgentHealth(): void {
    this.agents.forEach((agent, agentId) => {
      const state = agent.getState();
      const metrics = this.metrics.get(agentId);

      if (state === AgentState.ERROR || (metrics && metrics.errors.length > 5)) {
        this.handleAgentFailure(agentId);
      }
    });
  }

  /**
   * Handle agent failure
   */
  private handleAgentFailure(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return;
    }

    // Log failure
    this.auditLogger.logSecurityEvent({} as any, 'system', 'agent_failure', {
      agentId,
      state: agent.getState(),
    });

    // Attempt recovery
    this.recoverAgent(agentId);
  }

  /**
   * Attempt to recover a failed agent
   */
  private async recoverAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return;
    }

    try {
      await agent.reset();

      // Reset metrics
      this.metrics.set(agentId, {
        tasksProcessed: 0,
        successRate: 0,
        lastActive: new Date(),
        errors: [],
      });

      this.auditLogger.logSecurityEvent({} as any, 'system', 'agent_recovered', { agentId });
    } catch (error) {
      // If recovery fails, deregister the agent
      this.deregisterAgent(agentId);
    }
  }

  /**
   * Deregister an agent from the orchestrator
   */
  public deregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.metrics.delete(agentId);

    this.auditLogger.logSecurityEvent({} as any, 'system', 'agent_deregistered', { agentId });
  }

  /**
   * Get metrics for all agents
   */
  public getAgentMetrics(): Map<string, AgentMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Get the status of a specific task
   */
  public getTaskStatus(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Generate a unique task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up resources when shutting down
   */
  public shutdown(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Notify all agents to clean up
    this.agents.forEach(agent => {
      agent.shutdown();
    });

    this.agents.clear();
    this.tasks.clear();
    this.metrics.clear();

    this.auditLogger.logSecurityEvent({} as any, 'system', 'orchestrator_shutdown', {});
  }
}
