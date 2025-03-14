import { db } from './db';
import { config } from './config';

// Define a generic storage interface that can be implemented for different storage backends
export interface IStorage {
  // Basic CRUD operations
  get(collection: string, id: string): Promise<any>;
  getAll(collection: string, filter?: Record<string, any>): Promise<any[]>;
  create(collection: string, data: any): Promise<any>;
  update(collection: string, id: string, data: any): Promise<any>;
  delete(collection: string, id: string): Promise<boolean>;
  
  // Query operations
  query(collection: string, query: Record<string, any>, options?: QueryOptions): Promise<any[]>;
  count(collection: string, query?: Record<string, any>): Promise<number>;
  
  // Transaction support
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sort?: Record<string, 'asc' | 'desc'>;
  populate?: string[];
}

// In-memory storage implementation for development/testing
export class MemoryStorage implements IStorage {
  private data: Map<string, Map<string, any>> = new Map();
  private transactionData: Map<string, Map<string, any>> | null = null;
  
  constructor() {
    // Initialize with empty collections
    this.data.set('users', new Map());
    this.data.set('ideas', new Map());
    this.data.set('comments', new Map());
    this.data.set('votes', new Map());
    this.data.set('transactions', new Map());
  }
  
  async get(collection: string, id: string): Promise<any> {
    const store = this.getCurrentStore();
    const collectionMap = store.get(collection);
    if (!collectionMap) return undefined;
    return collectionMap.get(id);
  }
  
  async getAll(collection: string, filter?: Record<string, any>): Promise<any[]> {
    const store = this.getCurrentStore();
    const collectionMap = store.get(collection);
    if (!collectionMap) return [];
    
    const items = Array.from(collectionMap.values());
    if (!filter) return items;
    
    return items.filter(item => 
      Object.entries(filter).every(([key, value]) => item[key] === value)
    );
  }
  
  async create(collection: string, data: any): Promise<any> {
    const store = this.getCurrentStore();
    let collectionMap = store.get(collection);
    if (!collectionMap) {
      collectionMap = new Map();
      store.set(collection, collectionMap);
    }
    
    const id = data.id || crypto.randomUUID();
    const item = { ...data, id };
    collectionMap.set(id, item);
    return item;
  }
  
  async update(collection: string, id: string, data: any): Promise<any> {
    const store = this.getCurrentStore();
    const collectionMap = store.get(collection);
    if (!collectionMap) throw new Error(`Collection ${collection} not found`);
    
    const existingItem = collectionMap.get(id);
    if (!existingItem) throw new Error(`Item with id ${id} not found in ${collection}`);
    
    const updatedItem = { ...existingItem, ...data, id };
    collectionMap.set(id, updatedItem);
    return updatedItem;
  }
  
  async delete(collection: string, id: string): Promise<boolean> {
    const store = this.getCurrentStore();
    const collectionMap = store.get(collection);
    if (!collectionMap) return false;
    
    return collectionMap.delete(id);
  }
  
  async query(collection: string, query: Record<string, any>, options?: QueryOptions): Promise<any[]> {
    const items = await this.getAll(collection);
    
    // Filter by query
    const filtered = items.filter(item => 
      Object.entries(query).every(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle operators like $gt, $lt, etc.
          return this.matchComplexQuery(item[key], value);
        }
        return item[key] === value;
      })
    );
    
    // Apply sorting
    let result = filtered;
    if (options?.sort) {
      const sortEntries = Object.entries(options.sort);
      result = filtered.sort((a, b) => {
        for (const [key, direction] of sortEntries) {
          if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
          if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Apply pagination
    if (options?.offset !== undefined || options?.limit !== undefined) {
      const offset = options?.offset || 0;
      const limit = options?.limit || result.length;
      result = result.slice(offset, offset + limit);
    }
    
    return result;
  }
  
  async count(collection: string, query?: Record<string, any>): Promise<number> {
    if (!query) {
      const store = this.getCurrentStore();
      const collectionMap = store.get(collection);
      return collectionMap ? collectionMap.size : 0;
    }
    
    const items = await this.query(collection, query);
    return items.length;
  }
  
  async beginTransaction(): Promise<void> {
    if (this.transactionData) {
      throw new Error('Transaction already in progress');
    }
    
    // Clone current data for the transaction
    this.transactionData = new Map();
    for (const [collection, items] of this.data.entries()) {
      const collectionCopy = new Map();
      for (const [id, item] of items.entries()) {
        collectionCopy.set(id, { ...item });
      }
      this.transactionData.set(collection, collectionCopy);
    }
  }
  
  async commitTransaction(): Promise<void> {
    if (!this.transactionData) {
      throw new Error('No transaction in progress');
    }
    
    // Replace main data with transaction data
    this.data = this.transactionData;
    this.transactionData = null;
  }
  
  async rollbackTransaction(): Promise<void> {
    if (!this.transactionData) {
      throw new Error('No transaction in progress');
    }
    
    // Discard transaction data
    this.transactionData = null;
  }
  
  private getCurrentStore(): Map<string, Map<string, any>> {
    return this.transactionData || this.data;
  }
  
  private matchComplexQuery(value: any, query: Record<string, any>): boolean {
    for (const [operator, operand] of Object.entries(query)) {
      switch (operator) {
        case '$gt':
          if (!(value > operand)) return false;
          break;
        case '$gte':
          if (!(value >= operand)) return false;
          break;
        case '$lt':
          if (!(value < operand)) return false;
          break;
        case '$lte':
          if (!(value <= operand)) return false;
          break;
        case '$ne':
          if (value === operand) return false;
          break;
        case '$in':
          if (!Array.isArray(operand) || !operand.includes(value)) return false;
          break;
        case '$nin':
          if (!Array.isArray(operand) || operand.includes(value)) return false;
          break;
        default:
          return false;
      }
    }
    return true;
  }
}

// Database storage implementation using the database connection
export class DatabaseStorage implements IStorage {
  private transaction = false;
  
  async get(collection: string, id: string): Promise<any> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // This is a simplified implementation - in a real app, you'd use proper ORM queries
      // Using a type assertion to avoid TypeScript errors with the dynamic query
      const result = await (db.query as any).users.findFirst({
        where: (fields: any, operators: { eq: (a: any, b: any) => boolean }) => 
          operators.eq(fields.id, id)
      });
      return result;
    } catch (error) {
      console.error(`Error getting ${collection}/${id}:`, error);
      throw error;
    }
  }
  
  async getAll(collection: string, filter?: Record<string, any>): Promise<any[]> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // This is a simplified implementation - in a real app, you'd use proper ORM queries
      // and handle different collections appropriately
      return [];
    } catch (error) {
      console.error(`Error getting all ${collection}:`, error);
      throw error;
    }
  }
  
  async create(collection: string, data: any): Promise<any> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // This is a simplified implementation - in a real app, you'd use proper ORM queries
      return data;
    } catch (error) {
      console.error(`Error creating ${collection}:`, error);
      throw error;
    }
  }
  
  async update(collection: string, id: string, data: any): Promise<any> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // This is a simplified implementation - in a real app, you'd use proper ORM queries
      return { ...data, id };
    } catch (error) {
      console.error(`Error updating ${collection}/${id}:`, error);
      throw error;
    }
  }
  
  async delete(collection: string, id: string): Promise<boolean> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // This is a simplified implementation - in a real app, you'd use proper ORM queries
      return true;
    } catch (error) {
      console.error(`Error deleting ${collection}/${id}:`, error);
      throw error;
    }
  }
  
  async query(collection: string, query: Record<string, any>, options?: QueryOptions): Promise<any[]> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // This is a simplified implementation - in a real app, you'd use proper ORM queries
      return [];
    } catch (error) {
      console.error(`Error querying ${collection}:`, error);
      throw error;
    }
  }
  
  async count(collection: string, query?: Record<string, any>): Promise<number> {
    if (!db) throw new Error('Database not initialized');
    
    try {
      // This is a simplified implementation - in a real app, you'd use proper ORM queries
      return 0;
    } catch (error) {
      console.error(`Error counting ${collection}:`, error);
      throw error;
    }
  }
  
  async beginTransaction(): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    if (this.transaction) throw new Error('Transaction already in progress');
    
    // In a real implementation, you'd start a database transaction here
    this.transaction = true;
  }
  
  async commitTransaction(): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    if (!this.transaction) throw new Error('No transaction in progress');
    
    // In a real implementation, you'd commit the database transaction here
    this.transaction = false;
  }
  
  async rollbackTransaction(): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    if (!this.transaction) throw new Error('No transaction in progress');
    
    // In a real implementation, you'd rollback the database transaction here
    this.transaction = false;
  }
}

// Create and export the appropriate storage implementation based on environment
const isDevelopment = process.env.NODE_ENV !== 'production';
export const storage = db && !isDevelopment ? new DatabaseStorage() : new MemoryStorage(); 