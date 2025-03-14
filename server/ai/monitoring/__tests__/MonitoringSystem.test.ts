/// <reference types="jest" />
import { MonitoringSystem } from '../MonitoringSystem';
import { AgentMetrics } from '../../types';

describe('MonitoringSystem', () => {
  let monitoringSystem: MonitoringSystem;

  beforeEach(() => {
    monitoringSystem = new MonitoringSystem();
  });

  describe('recordMetrics', () => {
    it('should record system metrics and update health checks', () => {
      const metrics = {
        cpu: 50,
        memory: 60,
        storage: 40,
        network: {
          requests: 100,
          errors: 0,
          latency: 200,
        },
        agents: {
          total: 10,
          active: 8,
          idle: 2,
          error: 0,
        },
      };

      monitoringSystem.recordMetrics(metrics);
      const currentMetrics = monitoringSystem.getCurrentMetrics();
      expect(currentMetrics).toBeDefined();
      expect(currentMetrics?.cpu).toBe(50);
      expect(currentMetrics?.memory).toBe(60);
      expect(currentMetrics?.storage).toBe(40);
    });
  });

  describe('recordAgentMetrics', () => {
    it('should record agent metrics and create health check', () => {
      const agentId = 'agent1';
      const metrics: AgentMetrics = {
        tasksProcessed: 100,
        successRate: 0.95,
        lastActive: new Date(),
        errors: [],
      };

      monitoringSystem.recordAgentMetrics(agentId, metrics);
      const healthCheck = monitoringSystem.getHealthCheck(`agent_${agentId}`);
      expect(healthCheck).toBeDefined();
      expect(healthCheck?.status).toBe('healthy');
      expect(healthCheck?.details.tasksProcessed).toBe(100);
      expect(healthCheck?.details.successRate).toBe(0.95);
    });

    it('should mark agent as unhealthy when error count is high', () => {
      const agentId = 'agent2';
      const metrics: AgentMetrics = {
        tasksProcessed: 50,
        successRate: 0.7,
        lastActive: new Date(),
        errors: Array(15).fill({
          timestamp: new Date(),
          message: 'Test error',
          severity: 'medium',
        }),
      };

      monitoringSystem.recordAgentMetrics(agentId, metrics);
      const healthCheck = monitoringSystem.getHealthCheck(`agent_${agentId}`);
      expect(healthCheck?.status).toBe('unhealthy');
    });

    it('should mark agent as degraded when success rate is low', () => {
      const agentId = 'agent3';
      const metrics: AgentMetrics = {
        tasksProcessed: 80,
        successRate: 0.75,
        lastActive: new Date(),
        errors: [],
      };

      monitoringSystem.recordAgentMetrics(agentId, metrics);
      const healthCheck = monitoringSystem.getHealthCheck(`agent_${agentId}`);
      expect(healthCheck?.status).toBe('degraded');
    });
  });

  describe('getSystemStatus', () => {
    it('should return overall system status based on health checks', () => {
      // Add some test health checks
      const metrics = {
        cpu: 80,
        memory: 85,
        storage: 60,
        network: {
          requests: 200,
          errors: 5,
          latency: 1200,
        },
        agents: {
          total: 5,
          active: 2,
          idle: 3,
          error: 1,
        },
      };

      monitoringSystem.recordMetrics(metrics);
      const status = monitoringSystem.getSystemStatus();
      expect(status.overall).toBe('degraded');
      expect(status.metrics).toBeDefined();
      expect(status.healthChecks.length).toBeGreaterThan(0);
    });
  });

  describe('cleanup', () => {
    it('should clear all metrics and health checks', () => {
      // Add some test data
      monitoringSystem.recordMetrics({
        cpu: 50,
        memory: 60,
        storage: 40,
        network: {
          requests: 100,
          errors: 0,
          latency: 200,
        },
        agents: {
          total: 10,
          active: 8,
          idle: 2,
          error: 0,
        },
      });

      monitoringSystem.recordAgentMetrics('agent1', {
        tasksProcessed: 100,
        successRate: 0.95,
        lastActive: new Date(),
        errors: [],
      });

      monitoringSystem.cleanup();
      expect(monitoringSystem.getCurrentMetrics()).toBeUndefined();
      expect(monitoringSystem.getHealthChecks()).toHaveLength(0);
    });
  });
});
