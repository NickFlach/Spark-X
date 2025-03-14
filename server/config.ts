import dotenv from 'dotenv';

dotenv.config();

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    defaultModel: 'gpt-4-turbo-preview',
    defaultTemperature: 0.7,
  },
  agent: {
    maxMemoryEntries: 100,
    memoryRelevanceWindow: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    maxEnhancementIterations: 3,
  },
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'spark-x-secret',
    jwtExpiration: '24h',
    bcryptSaltRounds: 10,
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100, // 100 requests per window
  },
  blockchain: {
    provider: process.env.ETHEREUM_PROVIDER || 'http://localhost:8545',
    network: process.env.ETHEREUM_NETWORK || 'development',
    contractAddress: process.env.CONTRACT_ADDRESS || '',
    gasLimit: 3000000,
  },
  database: {
    url: process.env.DATABASE_URL || '',
    maxConnections: 10,
    idleTimeout: 30000,
  },
}; 