import { AuditLogger } from '../../security/AuditLogger';

interface ResourceAllocation {
  agentId: string;
  credits: number;
  resources: {
    cpu: number;
    memory: number;
    storage: number;
  };
  timestamp: Date;
}

interface ResourceMetrics {
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    storage: number;
  };
  allocationHistory: ResourceAllocation[];
}

// Mock CreditManager interface to replace the Solidity import
interface CreditManager {
  deductCredits(amount: number): Promise<boolean>;
  getAvailableCredits(): Promise<number>;
}

export class ResourceManager {
  private creditManager: CreditManager;
  private auditLogger: AuditLogger;
  private allocations: Map<string, ResourceAllocation>;
  private metrics: ResourceMetrics;

  constructor(creditManager: CreditManager) {
    this.creditManager = creditManager;
    this.auditLogger = new AuditLogger();
    this.allocations = new Map();
    this.metrics = {
      totalCredits: 0,
      usedCredits: 0,
      availableCredits: 0,
      resourceUtilization: {
        cpu: 0,
        memory: 0,
        storage: 0,
      },
      allocationHistory: [],
    };
  }

  /**
   * Allocate resources to an agent
   */
  public async allocateResources(
    agentId: string,
    credits: number,
    resources: {
      cpu: number;
      memory: number;
      storage: number;
    }
  ): Promise<boolean> {
    try {
      // Check credit availability
      if (!(await this.checkCreditAvailability(credits))) {
        this.auditLogger.logSecurityEvent({} as any, 'system', 'resource_allocation_failed', {
          agentId,
          reason: 'insufficient_credits',
        });
        return false;
      }

      // Check resource availability
      if (!this.checkResourceAvailability(resources)) {
        this.auditLogger.logSecurityEvent({} as any, 'system', 'resource_allocation_failed', {
          agentId,
          reason: 'insufficient_resources',
        });
        return false;
      }

      // Create allocation
      const allocation: ResourceAllocation = {
        agentId,
        credits,
        resources,
        timestamp: new Date(),
      };

      // Store allocation
      this.allocations.set(agentId, allocation);
      this.metrics.allocationHistory.push(allocation);

      // Update metrics
      this.updateMetrics(allocation);

      // Deduct credits
      await this.deductCredits(credits);

      this.auditLogger.logSecurityEvent({} as any, 'system', 'resource_allocation_success', {
        agentId,
        credits,
        resources,
      });

      return true;
    } catch (error) {
      this.auditLogger.logSecurityEvent({} as any, 'system', 'resource_allocation_error', {
        agentId,
        error: (error as Error).message,
      });
      return false;
    }
  }

  /**
   * Release resources from an agent
   */
  public async releaseResources(agentId: string): Promise<void> {
    const allocation = this.allocations.get(agentId);
    if (!allocation) {
      return;
    }

    try {
      // Update metrics
      this.metrics.usedCredits -= allocation.credits;
      this.metrics.availableCredits += allocation.credits;
      this.metrics.resourceUtilization.cpu -= allocation.resources.cpu;
      this.metrics.resourceUtilization.memory -= allocation.resources.memory;
      this.metrics.resourceUtilization.storage -= allocation.resources.storage;

      // Remove allocation
      this.allocations.delete(agentId);

      this.auditLogger.logSecurityEvent({} as any, 'system', 'resource_release_success', {
        agentId,
        credits: allocation.credits,
      });
    } catch (error) {
      this.auditLogger.logSecurityEvent({} as any, 'system', 'resource_release_error', {
        agentId,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Check credit availability
   */
  private async checkCreditAvailability(credits: number): Promise<boolean> {
    return this.metrics.availableCredits >= credits;
  }

  /**
   * Check resource availability
   */
  private checkResourceAvailability(resources: {
    cpu: number;
    memory: number;
    storage: number;
  }): boolean {
    const currentUtilization = this.metrics.resourceUtilization;
    return (
      currentUtilization.cpu + resources.cpu <= 100 &&
      currentUtilization.memory + resources.memory <= 100 &&
      currentUtilization.storage + resources.storage <= 100
    );
  }

  /**
   * Update resource metrics
   */
  private updateMetrics(allocation: ResourceAllocation): void {
    this.metrics.usedCredits += allocation.credits;
    this.metrics.availableCredits -= allocation.credits;
    this.metrics.resourceUtilization.cpu += allocation.resources.cpu;
    this.metrics.resourceUtilization.memory += allocation.resources.memory;
    this.metrics.resourceUtilization.storage += allocation.resources.storage;
  }

  /**
   * Deduct credits from the system
   */
  private async deductCredits(credits: number): Promise<void> {
    // In a real implementation, this would interact with the blockchain
    this.metrics.totalCredits -= credits;
  }

  /**
   * Get current resource metrics
   */
  public getMetrics(): ResourceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get allocation for a specific agent
   */
  public getAllocation(agentId: string): ResourceAllocation | undefined {
    return this.allocations.get(agentId);
  }

  /**
   * Get all current allocations
   */
  public getAllAllocations(): Map<string, ResourceAllocation> {
    return new Map(this.allocations);
  }

  /**
   * Add credits to the system
   */
  public async addCredits(credits: number): Promise<void> {
    this.metrics.totalCredits += credits;
    this.metrics.availableCredits += credits;

    this.auditLogger.logSecurityEvent({} as any, 'system', 'credits_added', {
      amount: credits,
      newTotal: this.metrics.totalCredits,
    });
  }
}
