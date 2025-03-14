import { z } from 'zod';

// Memory entry schema
export const memoryEntrySchema = z.object({
  timestamp: z.number(),
  type: z.string(),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type MemoryEntry = z.infer<typeof memoryEntrySchema>;

// Memory category
export enum MemoryCategory {
  FACTUAL = 'FACTUAL',
  PROCEDURAL = 'PROCEDURAL',
  EPISODIC = 'EPISODIC',
  SEMANTIC = 'SEMANTIC',
  EMOTIONAL = 'EMOTIONAL',
}

// Memory retention policy
export interface MemoryRetentionPolicy {
  category: MemoryCategory;
  maxEntries?: number;
  maxAge?: number; // in milliseconds
  minImportance?: number; // 0-1
  pruningStrategy: 'LRU' | 'IMPORTANCE' | 'AGE' | 'HYBRID';
}

// Memory retrieval options
export interface MemoryRetrievalOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'importance' | 'relevance';
  sortDirection?: 'asc' | 'desc';
  includeExpired?: boolean;
  includeMetadata?: boolean;
  similarityThreshold?: number; // 0-1, for semantic search
}

// Memory search query
export interface MemorySearchQuery {
  text?: string;
  types?: string[];
  tags?: string[];
  startTime?: number;
  endTime?: number;
  minImportance?: number;
  categories?: MemoryCategory[];
  metadata?: Record<string, unknown>;
  semanticQuery?: string;
}

// Memory statistics
export interface MemoryStatistics {
  totalEntries: number;
  entriesByType: Record<string, number>;
  entriesByCategory: Record<MemoryCategory, number>;
  averageImportance: number;
  oldestEntry: number;
  newestEntry: number;
  sizeInBytes: number;
}

// Memory consolidation job
export interface MemoryConsolidationJob {
  id: string;
  agentId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startTime: number;
  endTime?: number;
  entriesProcessed: number;
  entriesConsolidated: number;
  error?: string;
}

// Memory backup
export interface MemoryBackup {
  id: string;
  agentId: string;
  timestamp: number;
  entryCount: number;
  sizeInBytes: number;
  format: 'JSON' | 'BINARY' | 'COMPRESSED';
  location: string;
  checksum: string;
}

export const memoryFilterSchema = z.object({
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  type: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type MemoryFilter = z.infer<typeof memoryFilterSchema>;

export interface AgentMemory {
  getRelevantHistory(): string;
  addEntry(entry: MemoryEntry): void;
  clear(): void;
  getEntries(filter?: MemoryFilter): MemoryEntry[];
}

export interface MemoryManager {
  entries: MemoryEntry[];
  maxEntries: number;
  relevanceWindow: number;
  addEntry(entry: MemoryEntry): void;
  getEntries(filter?: MemoryFilter): MemoryEntry[];
  getRelevantHistory(): string;
  clear(): void;
}

export interface MemoryStrategy {
  shouldKeep(entry: MemoryEntry): boolean;
  getRelevanceScore(entry: MemoryEntry): number;
  getMaxEntries(): number;
}

export interface MemoryEntryMetadata {
  importance: number;
  category: string;
  tags: string[];
  relatedEntries: string[];
  lastAccessed: number;
} 