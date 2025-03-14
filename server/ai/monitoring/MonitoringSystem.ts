import { AuditLogger } from '../../security/AuditLogger';
import { AgentMetrics } from '../types';

interface SystemMetrics {
  timestamp: Date;
  cpu: number;
  memory: number;
  storage: number;
  network: {
    requests: number;
    errors: number;
    latency: number;
  };
  agents: {
    total: number;
    active: number;
    idle: number;
    error: number;
  };
}

interface HealthCheck {
  id: string;
  name: string;
  type: 'agent' | 'system' | 'resource';
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  details: Record<string, any>;
}

export class MonitoringSystem {
  private auditLogger: AuditLogger;
  private metrics: SystemMetrics[];
  private healthChecks: Map<string, HealthCheck>;
  private readonly maxMetricsHistory: number = 1000;
  private readonly healthCheckInterval: number = 60000; // 1 minute

  constructor() {
    this.auditLogger = new AuditLogger();
    this.metrics = [];
    this.healthChecks = new Map();
    this.startHealthChecks();
  }

  /**
   * Record system metrics
   */
  public recordMetrics(metrics: Omit<SystemMetrics, 'timestamp'>): void {
    const systemMetrics: SystemMetrics = {
      ...metrics,
      timestamp: new Date(),
    };

    this.metrics.push(systemMetrics);

    // Maintain history limit
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // Update health checks based on metrics
    this.updateHealthChecks(systemMetrics);
  }

  /**
   * Record agent metrics
   */
  public recordAgentMetrics(agentId: string, metrics: AgentMetrics): void {
    const healthCheck: HealthCheck = {
      id: `agent_${agentId}`,
      name: `Agent ${agentId} Health`,
      type: 'agent',
      status: this.determineAgentHealth(metrics),
      lastCheck: new Date(),
      details: {
        tasksProcessed: metrics.tasksProcessed,
        successRate: metrics.successRate,
        lastActive: metrics.lastActive,
        errorCount: metrics.errors.length,
      },
    };

    this.healthChecks.set(healthCheck.id, healthCheck);
    this.logHealthCheck(healthCheck);
  }

  /**
   * Start health check monitoring
   */
  private startHealthChecks(): void {
    setInterval(() => {
      this.runHealthChecks();
    }, this.healthCheckInterval);
  }

  /**
   * Run system health checks
   */
  private runHealthChecks(): void {
    // Check system resources
    this.checkSystemResources();

    // Check agent health
    this.checkAgentHealth();

    // Check resource utilization
    this.checkResourceUtilization();
  }

  /**
   * Check system resources
   */
  private checkSystemResources(): void {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (!latestMetrics) {
      return;
    }

    const healthCheck: HealthCheck = {
      id: 'system_resources',
      name: 'System Resources',
      type: 'system',
      status: this.determineSystemHealth(latestMetrics),
      lastCheck: new Date(),
      details: {
        cpu: latestMetrics.cpu,
        memory: latestMetrics.memory,
        storage: latestMetrics.storage,
      },
    };

    this.healthChecks.set(healthCheck.id, healthCheck);
    this.logHealthCheck(healthCheck);
  }

  /**
   * Check agent health
   */
  private checkAgentHealth(): void {
    const agentChecks = Array.from(this.healthChecks.values()).filter(
      check => check.type === 'agent'
    );

    const healthCheck: HealthCheck = {
      id: 'agent_cluster',
      name: 'Agent Cluster',
      type: 'system',
      status: this.determineClusterHealth(agentChecks),
      lastCheck: new Date(),
      details: {
        totalAgents: agentChecks.length,
        healthyAgents: agentChecks.filter(check => check.status === 'healthy').length,
        degradedAgents: agentChecks.filter(check => check.status === 'degraded').length,
        unhealthyAgents: agentChecks.filter(check => check.status === 'unhealthy').length,
      },
    };

    this.healthChecks.set(healthCheck.id, healthCheck);
    this.logHealthCheck(healthCheck);
  }

  /**
   * Check resource utilization
   */
  private checkResourceUtilization(): void {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (!latestMetrics) {
      return;
    }

    const healthCheck: HealthCheck = {
      id: 'resource_utilization',
      name: 'Resource Utilization',
      type: 'resource',
      status: this.determineResourceHealth(latestMetrics),
      lastCheck: new Date(),
      details: {
        network: latestMetrics.network,
        agents: latestMetrics.agents,
      },
    };

    this.healthChecks.set(healthCheck.id, healthCheck);
    this.logHealthCheck(healthCheck);
  }

  /**
   * Determine agent health status
   */
  private determineAgentHealth(metrics: AgentMetrics): HealthCheck['status'] {
    if (metrics.errors.length > 10) {
      return 'unhealthy';
    }
    if (metrics.successRate < 0.8) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Determine system health status
   */
  private determineSystemHealth(metrics: SystemMetrics): HealthCheck['status'] {
    if (metrics.cpu > 90 || metrics.memory > 90 || metrics.storage > 90) {
      return 'unhealthy';
    }
    if (metrics.cpu > 70 || metrics.memory > 70 || metrics.storage > 70) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Determine cluster health status
   */
  private determineClusterHealth(agentChecks: HealthCheck[]): HealthCheck['status'] {
    const unhealthyCount = agentChecks.filter(check => check.status === 'unhealthy').length;
    const degradedCount = agentChecks.filter(check => check.status === 'degraded').length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    }
    if (degradedCount > 0) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Determine resource health status
   */
  private determineResourceHealth(metrics: SystemMetrics): HealthCheck['status'] {
    const { network, agents } = metrics;

    if (network.errors > 0 || agents.error > 0) {
      return 'unhealthy';
    }

    if (network.latency > 1000 || agents.active / agents.total < 0.5) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Log health check results
   */
  private logHealthCheck(healthCheck: HealthCheck): void {
    if (healthCheck.status === 'unhealthy') {
      this.auditLogger.logSecurityEvent({} as any, 'system', 'health_check_failed', {
        healthCheck,
      });
    } else if (healthCheck.status === 'degraded') {
      this.auditLogger.logSecurityEvent({} as any, 'system', 'health_check_degraded', {
        healthCheck,
      });
    }
  }

  /**
   * Get current system metrics
   */
  public getCurrentMetrics(): SystemMetrics | undefined {
    return this.metrics[this.metrics.length - 1];
  }

  /**
   * Get metrics history
   */
  public getMetricsHistory(limit: number = 100): SystemMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Get all health checks
   */
  public getHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  /**
   * Get health check by ID
   */
  public getHealthCheck(id: string): HealthCheck | undefined {
    return this.healthChecks.get(id);
  }

  /**
   * Get system status summary
   */
  public getSystemStatus(): {
    overall: HealthCheck['status'];
    metrics: SystemMetrics | undefined;
    healthChecks: HealthCheck[];
  } {
    const healthChecks = this.getHealthChecks();
    const overall = this.determineOverallStatus(healthChecks);

    return {
      overall,
      metrics: this.getCurrentMetrics(),
      healthChecks,
    };
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(healthChecks: HealthCheck[]): HealthCheck['status'] {
    if (healthChecks.some(check => check.status === 'unhealthy')) {
      return 'unhealthy';
    }
    if (healthChecks.some(check => check.status === 'degraded')) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.metrics = [];
    this.healthChecks.clear();
  }

  /**
   * Update health checks based on metrics
   */
  private updateHealthChecks(metrics: SystemMetrics): void {
    // Update system resources health check
    this.checkSystemResources();

    // Update resource utilization health check
    this.checkResourceUtilization();
  }
}
