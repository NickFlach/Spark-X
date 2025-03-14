import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import { log } from './vite';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS headers
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Logging middleware
app.use(function(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// Import routes
import('./routes').then(({ registerRoutes }) => {
  // Register API routes
  registerRoutes(app);
  
  // Import Vite setup
  import('./vite').then(({ setupVite, serveStatic }) => {
    // Setup Vite in development or serve static files in production
    if (process.env.NODE_ENV === 'development') {
      setupVite(app, server).then(() => {
        startServer();
      });
    } else {
      serveStatic(app);
      startServer();
    }
  });
});

// Error handling middleware
app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(`[ERROR] ${err.stack || err}`);
  res.status(status).json({ message });
});

// Start the server
function startServer() {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
