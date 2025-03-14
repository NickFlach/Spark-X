// User Types
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
  avatarUrl?: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

// Transaction Types
export type TransactionType = 'earn' | 'spend';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  createdAt: string;
}

// Blockchain Types
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  contractAddress: string;
}

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// Credit System Types
export interface CreditPurchase {
  id: string;
  userId: string;
  creditAmount: number;
  tokenAmount: number;
  createdAt: string;
}

export interface CreditUsage {
  id: string;
  userId: string;
  serviceType: string;
  creditAmount: number;
  createdAt: string;
}

// Enterprise Types
export enum VaultTier {
  NONE = 'NONE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export interface EnterpriseAccount {
  id: string;
  name: string;
  tier: VaultTier;
  creditBalance: number;
  tokenBalance: string;
  createdAt: string;
  updatedAt: string;
}
