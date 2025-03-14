// Common types shared between client and server

export interface User {
  id: string;
  username: string;
  email: string;
  walletAddress?: string;
  bio?: string;
  avatar?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'published' | 'funded' | 'completed' | 'cancelled';
  fundingGoal?: number;
  currentFunding?: number;
  creatorId: string;
  creator?: User;
  tags?: string[];
  upvotes?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Comment {
  id: string;
  content: string;
  ideaId: string;
  userId: string;
  user?: User;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Funding {
  id: string;
  amount: number;
  ideaId: string;
  userId: string;
  user?: User;
  transactionHash?: string;
  createdAt: Date | string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

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
