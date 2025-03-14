import { z } from 'zod';
import { MessageType } from './index';

// Message priority levels
export enum MessagePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Message schema
export const messageSchema = z.object({
  id: z.string(),
  type: z.string(),
  from: z.string(),
  to: z.string(),
  content: z.string(),
  timestamp: z.number(),
  priority: z.nativeEnum(MessagePriority).optional(),
  metadata: z.record(z.unknown()).optional(),
  expiresAt: z.number().optional(),
  requiresAcknowledgement: z.boolean().optional(),
  acknowledgedAt: z.number().optional(),
  parentMessageId: z.string().optional(),
  threadId: z.string().optional(),
});

export type ExtendedMessage = z.infer<typeof messageSchema>;

// Message thread schema
export const messageThreadSchema = z.object({
  id: z.string(),
  topic: z.string(),
  participants: z.array(z.string()),
  createdAt: z.number(),
  updatedAt: z.number(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']),
  metadata: z.record(z.unknown()).optional(),
});

export type MessageThread = z.infer<typeof messageThreadSchema>;

// Message delivery status
export enum MessageDeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

// Message delivery receipt
export interface MessageDeliveryReceipt {
  messageId: string;
  recipientId: string;
  status: MessageDeliveryStatus;
  timestamp: number;
  error?: string;
}

// Message batch
export interface MessageBatch {
  id: string;
  messages: ExtendedMessage[];
  createdAt: number;
  senderId: string;
  recipientIds: string[];
  batchType: 'BROADCAST' | 'TARGETED' | 'SEQUENTIAL';
  deliveryStatus: Record<string, MessageDeliveryStatus>;
}

// Message template
export interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  type: MessageType;
  metadata: Record<string, unknown>;
}

// Message filter
export interface MessageFilter {
  fromIds?: string[];
  toIds?: string[];
  types?: MessageType[];
  startTime?: number;
  endTime?: number;
  priorities?: MessagePriority[];
  threadId?: string;
  containsText?: string;
  hasMetadata?: Record<string, unknown>;
} 