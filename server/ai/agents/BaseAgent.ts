import { AgentState, Message, AgentConfig, AgentMetrics, TaskResult } from '../types';
import { ResourceManager } from '../resource/ResourceManager';
import { MonitoringSystem } from '../monitoring/MonitoringSystem';
import { AuditLogger } from '../../security/AuditLogger';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected state: AgentState;
  protected metrics: AgentMetrics;
  protected resourceManager: ResourceManager;
  protected monitoringSystem: MonitoringSystem;
  protected auditLogger: AuditLogger;
  protected activeTasks: number;
  protected messageQueue: Message[];

  constructor(
    config: AgentConfig,
    resourceManager: ResourceManager,
    monitoringSystem: MonitoringSystem
  ) {
    this.config = config;
    this.state = AgentState.IDLE;
    this.resourceManager = resourceManager;
    this.monitoringSystem = monitoringSystem;
    this.auditLogger = new AuditLogger();
    this.activeTasks = 0;
    this.messageQueue = [];

    // Initialize metrics
    this.metrics = {
      tasksProcessed: 0,
      successRate: 0,
      lastActive: new Date(),
      errors: [],
    };
  }

  /**
   * Get agent's unique identifier
   */
  public getId(): string {
    return this.config.id;
  }

  /**
   * Get agent's role
   */
  public getRole(): string {
    return this.config.role;
  }

  /**
   * Get agent's current state
   */
  public getState(): AgentState {
    return this.state;
  }

  /**
   * Get agent's capabilities
   */
  public getCapabilities(): string[] {
    return this.config.capabilities;
  }

  /**
   * Handle incoming messages
   */
  public async handleMessage(message: Message): Promise<void> {
    try {
      this.messageQueue.push(message);
      await this.processMessageQueue();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * Process a task
   */
  public async processTask(taskData: string): Promise<TaskResult> {
    if (this.state === AgentState.ERROR) {
      throw new Error('Agent is in error state and cannot process tasks');
    }

    if (this.activeTasks >= this.config.maxConcurrentTasks) {
      throw new Error('Agent has reached maximum concurrent tasks limit');
    }

    const startTime = Date.now();
    this.state = AgentState.BUSY;
    this.activeTasks++;

    try {
      // Allocate resources for the task
      const resources = await this.allocateResources();
      if (!resources) {
        throw new Error('Failed to allocate resources for task');
      }

      // Process the task
      const result = await this.executeTask(taskData);

      // Update metrics
      this.updateMetrics(result, Date.now() - startTime);

      return result;
    } catch (error) {
      const result: TaskResult = {
        success: false,
        error: {
          message: (error as Error).message,
          code: 'TASK_EXECUTION_ERROR',
          details: error,
        },
      };
      this.updateMetrics(result, Date.now() - startTime);
      throw error;
    } finally {
      this.activeTasks--;
      this.state = this.activeTasks > 0 ? AgentState.BUSY : AgentState.IDLE;
      await this.releaseResources();
    }
  }

  /**
   * Allocate resources for task processing
   */
  protected async allocateResources(): Promise<boolean> {
    return this.resourceManager.allocateResources(
      this.getId(),
      1, // 1 credit per task
      {
        cpu: 10, // 10% CPU
        memory: 100, // 100MB
        storage: 50, // 50MB
      }
    );
  }

  /**
   * Release allocated resources
   */
  protected async releaseResources(): Promise<void> {
    await this.resourceManager.releaseResources(this.getId());
  }

  /**
   * Update agent metrics
   */
  protected updateMetrics(result: TaskResult, processingTime: number): void {
    this.metrics.tasksProcessed++;
    this.metrics.lastActive = new Date();
    this.metrics.successRate =
      (this.metrics.tasksProcessed - this.metrics.errors.length) / this.metrics.tasksProcessed;

    if (!result.success) {
      this.metrics.errors.push({
        timestamp: new Date(),
        message: result.error?.message || 'Unknown error',
        severity: 'high',
      });
    }

    // Record metrics in monitoring system
    this.monitoringSystem.recordAgentMetrics(this.getId(), this.metrics);
  }

  /**
   * Handle errors
   */
  protected handleError(error: Error): void {
    this.state = AgentState.ERROR;
    this.metrics.errors.push({
      timestamp: new Date(),
      message: error.message,
      severity: 'high',
    });

    this.auditLogger.logSecurityEvent({} as any, 'system', 'agent_error', {
      agentId: this.getId(),
      error: error.message,
      state: this.state,
    });

    // Attempt recovery
    this.recover();
  }

  /**
   * Attempt to recover from error state
   */
  protected async recover(): Promise<void> {
    this.state = AgentState.RECOVERING;

    try {
      // Clear error state
      this.metrics.errors = [];
      this.state = AgentState.IDLE;

      this.auditLogger.logSecurityEvent({} as any, 'system', 'agent_recovered', {
        agentId: this.getId(),
      });
    } catch (error) {
      this.state = AgentState.ERROR;
      this.auditLogger.logSecurityEvent({} as any, 'system', 'agent_recovery_failed', {
        agentId: this.getId(),
        error: (error as Error).message,
      });
    }
  }

  /**
   * Process message queue
   */
  protected async processMessageQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (!message) {
        continue;
      }

      try {
        await this.handleMessageInternal(message);
      } catch (error) {
        this.handleError(error as Error);
      }
    }
  }

  /**
   * Abstract method to handle specific message types
   */
  protected abstract handleMessageInternal(message: Message): Promise<void>;

  /**
   * Abstract method to execute specific task types
   */
  protected abstract executeTask(taskData: string): Promise<TaskResult>;

  /**
   * Reset the agent to its initial state
   */
  public async reset(): Promise<void> {
    this.messageQueue = [];
    this.activeTasks = 0;
    this.state = AgentState.IDLE;
    this.metrics = {
      tasksProcessed: 0,
      successRate: 0,
      lastActive: new Date(),
      errors: [],
    };
  }

  /**
   * Shutdown the agent and release all resources
   */
  public async shutdown(): Promise<void> {
    // Release any allocated resources
    if (this.activeTasks > 0) {
      await this.releaseResources();
    }

    // Clear all pending tasks
    this.messageQueue = [];
    this.activeTasks = 0;
    this.state = AgentState.IDLE;

    this.auditLogger.logSecurityEvent({} as any, 'system', 'agent_shutdown', {
      agentId: this.getId(),
    });
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.messageQueue = [];
    this.activeTasks = 0;
    this.state = AgentState.IDLE;
  }
}
