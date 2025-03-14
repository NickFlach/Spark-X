import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '../shared/schema';
import { config } from './config';

neonConfig.webSocketConstructor = ws;

// Use in-memory storage during development if DATABASE_URL is not set
const isDevelopment = process.env.NODE_ENV !== 'production';
if (!process.env.DATABASE_URL && !isDevelopment) {
  throw new Error('DATABASE_URL must be set in production');
}

export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export const db = pool ? drizzle({ client: pool, schema }) : null;

// Helper function to check if database is available
export async function checkDatabaseConnection(): Promise<boolean> {
  if (!pool) {
    return false;
  }
  
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
} 