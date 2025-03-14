import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import analyticsRoutes from './api/routes/analytics';
import { SecurityMiddleware } from './security/SecurityMiddleware';
import { AuditLogger } from './security/AuditLogger';
import { AuthenticatedRequest } from './api/middleware/auth';
import { BlockchainService } from './blockchain';

// Initialize services
const app = express();
const port = process.env.PORT || 3000;
const security = new SecurityMiddleware();
const auditLogger = new AuditLogger();
const blockchainService = new BlockchainService();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Security middleware
app.use(security.securityHeaders);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-2fa-token'],
  })
);

// Rate limiting
app.use('/api/', security.rateLimit);

// Account lockout protection
app.use('/api/auth', security.checkLockout);

// Audit logging for all API requests
app.use('/api/', (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    auditLogger.logApiAccess(req, req.user?.id || 'unknown', res.statusCode < 400, {
      duration,
      statusCode: res.statusCode,
    });
  });
  next();
});

// API Routes
app.use('/api/analytics', security.require2FA, analyticsRoutes);

// Blockchain status endpoint
app.get('/api/blockchain/status', async (req: express.Request, res: express.Response) => {
  try {
    const blockNumber = await blockchainService.getBlockNumber();
    res.json({
      success: true,
      data: {
        blockNumber,
        network: process.env.ETHEREUM_NETWORK || 'development',
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error fetching blockchain status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blockchain status',
    });
  }
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Error handling
app.use(
  (err: Error, req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    auditLogger.logSecurityEvent(req, req.user?.id || 'unknown', 'error', {
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
);

// Start server
app.listen(port, () => {
  console.log(`Unified Spark-X server running on port ${port}`);

  // Log blockchain connection status
  blockchainService
    .getBlockNumber()
    .then(blockNumber => {
      console.log(`Connected to blockchain at block ${blockNumber}`);
    })
    .catch(error => {
      console.error('Failed to connect to blockchain:', error);
    });
});
