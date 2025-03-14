/// <reference types="jest" />
import { BaseAgent } from '../BaseAgent';
import { AgentConfig, Message, TaskResult } from '../../types';
import { ResourceManager } from '../../resource/ResourceManager';
import { MonitoringSystem } from '../../monitoring/MonitoringSystem';

// Concrete implementation for testing
class TestAgent extends BaseAgent {
  protected async handleMessageInternal(message: Message): Promise<void> {
    // Simple echo implementation
    if (message.type === 'ECHO') {
      console.log(`Echo: ${message.content}`);
    }
  }

  protected async executeTask(taskData: string): Promise<TaskResult> {
    // Simple task implementation
    return {
      success: true,
      data: { processed: taskData },
      metrics: {
        processingTime: 100,
        resourceUsage: {
          cpu: 5,
          memory: 50,
          storage: 25,
        },
      },
    };
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent;
  let resourceManager: jest.Mocked<ResourceManager>;
  let monitoringSystem: jest.Mocked<MonitoringSystem>;

  const mockConfig: AgentConfig = {
    id: 'test-agent',
    role: 'tester',
    capabilities: ['test'],
    maxConcurrentTasks: 2,
    timeout: 5000,
    retryAttempts: 3,
  };

  beforeEach(() => {
    // Create mock dependencies
    resourceManager = {
      allocateResources: jest.fn().mockResolvedValue(true),
      releaseResources: jest.fn().mockResolvedValue(undefined),
      getMetrics: jest.fn(),
      getAllocation: jest.fn(),
      getResourceUtilization: jest.fn(),
      getCreditBalance: jest.fn(),
    } as any;

    monitoringSystem = {
      recordMetrics: jest.fn(),
      recordAgentMetrics: jest.fn(),
      getCurrentMetrics: jest.fn(),
      getMetricsHistory: jest.fn(),
      getHealthChecks: jest.fn(),
      getHealthCheck: jest.fn(),
      getSystemStatus: jest.fn(),
      cleanup: jest.fn(),
    } as any;

    agent = new TestAgent(mockConfig, resourceManager, monitoringSystem);
  });

  describe('initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(agent.getId()).toBe(mockConfig.id);
      expect(agent.getRole()).toBe(mockConfig.role);
      expect(agent.getCapabilities()).toEqual(mockConfig.capabilities);
      expect(agent.getState()).toBe('IDLE');
    });
  });

  describe('task processing', () => {
    it('should process a task successfully', async () => {
      const result = await agent.processTask('test data');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ processed: 'test data' });
      expect(resourceManager.allocateResources).toHaveBeenCalled();
      expect(resourceManager.releaseResources).toHaveBeenCalled();
      expect(monitoringSystem.recordAgentMetrics).toHaveBeenCalled();
    });

    it('should handle task processing errors', async () => {
      // Override executeTask to throw an error
      jest.spyOn(agent as any, 'executeTask').mockRejectedValueOnce(new Error('Test error'));

      await expect(agent.processTask('test data')).rejects.toThrow('Test error');
      expect(resourceManager.releaseResources).toHaveBeenCalled();
    });

    it('should respect max concurrent tasks limit', async () => {
      // Process tasks up to the limit
      await agent.processTask('task1');
      await agent.processTask('task2');

      // Attempt to process one more task
      await expect(agent.processTask('task3')).rejects.toThrow('maximum concurrent tasks limit');
    });
  });

  describe('message handling', () => {
    it('should process messages in queue', async () => {
      const message: Message = {
        id: 'msg1',
        type: 'ECHO',
        from: 'sender',
        to: 'test-agent',
        content: 'test message',
        timestamp: Date.now(),
      };

      await agent.handleMessage(message);
      // Verify message was processed (in this case, just logged)
      expect(monitoringSystem.recordAgentMetrics).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle errors and attempt recovery', async () => {
      // Override executeTask to throw an error
      jest.spyOn(agent as any, 'executeTask').mockRejectedValueOnce(new Error('Test error'));

      await expect(agent.processTask('test data')).rejects.toThrow('Test error');
      expect(agent.getState()).toBe('ERROR');

      // Wait for recovery attempt
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(agent.getState()).toBe('IDLE');
    });
  });

  describe('cleanup', () => {
    it('should clean up resources', () => {
      agent.cleanup();
      expect(agent.getState()).toBe('IDLE');
    });
  });
});
