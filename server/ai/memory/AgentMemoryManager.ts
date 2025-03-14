import { AgentMemory, MemoryEntry, MemoryFilter } from '../types/index';

export class AgentMemoryManager implements AgentMemory {
  private entries: MemoryEntry[] = [];
  private maxEntries: number;
  private relevanceWindow: number; // Time window in milliseconds for relevant history

  constructor(maxEntries: number = 100, relevanceWindow: number = 24 * 60 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.relevanceWindow = relevanceWindow;
  }

  addEntry(entry: MemoryEntry): void {
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift(); // Remove oldest entry
    }
  }

  getEntries(filter?: MemoryFilter): MemoryEntry[] {
    if (!filter) {
      return [...this.entries];
    }

    return this.entries.filter(entry => {
      let matches = true;

      if (filter.startTime) {
        matches = matches && entry.timestamp >= filter.startTime;
      }

      if (filter.endTime) {
        matches = matches && entry.timestamp <= filter.endTime;
      }

      if (filter.type && filter.type.length > 0) {
        matches = matches && filter.type.includes(entry.type);
      }

      if (filter.metadata) {
        matches = matches && this.matchesMetadata(entry.metadata, filter.metadata);
      }

      return matches;
    });
  }

  getRelevantHistory(): string {
    const cutoffTime = Date.now() - this.relevanceWindow;
    const recentEntries = this.entries
      .filter(entry => entry.timestamp >= cutoffTime)
      .map(entry => `[${new Date(entry.timestamp).toISOString()}] ${entry.type}: ${entry.content}`)
      .join('\n');

    return recentEntries || 'No recent history available.';
  }

  clear(): void {
    this.entries = [];
  }

  private matchesMetadata(
    entryMetadata?: Record<string, unknown>,
    filterMetadata?: Record<string, unknown>
  ): boolean {
    if (!entryMetadata || !filterMetadata) {
      return !filterMetadata; // Match only if filter metadata is also undefined
    }

    return Object.entries(filterMetadata).every(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return this.matchesMetadata(
          entryMetadata[key] as Record<string, unknown>,
          value as Record<string, unknown>
        );
      }
      return entryMetadata[key] === value;
    });
  }
} 