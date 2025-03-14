/**
 * Shared types for the Spark-X platform
 * This file contains types that are used across both frontend and server components
 */

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  ANALYST = 'analyst',
}

export interface AnalyticsData {
  id: string;
  userId: string;
  timestamp: Date;
  eventType: string;
  data: Record<string, any>;
  privacyLevel: PrivacyLevel;
}

export enum PrivacyLevel {
  PUBLIC = 'public',
  ANONYMOUS = 'anonymous',
  PRIVATE = 'private',
  ENCRYPTED = 'encrypted',
}

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  timestamp: Date;
  from: string;
  to: string;
  value: string;
  status: TransactionStatus;
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
