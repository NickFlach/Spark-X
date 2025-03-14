import express, { Router, Request, Response, NextFunction } from 'express';
import { createServer, Server } from 'http';
import { storage } from './storage';
import { config } from './config';
import { z } from 'zod';
import session from 'express-session';
import MemoryStore from 'memorystore';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { AuditLogger } from './security/AuditLogger';
import { SecurityMiddleware } from './security/SecurityMiddleware';

// Create a memory store for sessions
const SessionStore = MemoryStore(session);
const auditLogger = new AuditLogger();
const security = new SecurityMiddleware();

// Initialize passport for authentication
export async function setupAuth(app: express.Express): Promise<void> {
  app.use(
    session({
      secret: config.security.jwtSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === 'production' },
      store: new SessionStore({
        checkPeriod: 86400000, // Clear expired entries every 24h
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Configure password strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // This is a simplified implementation - in a real app, you'd use proper user authentication
        const user = await storage.get('users', username);
        if (!user) return done(null, false, { message: 'Invalid username or password' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return done(null, false, { message: 'Invalid username or password' });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.get('users', id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Register all routes
export async function registerRoutes(app: express.Express): Promise<Server> {
  const server = createServer(app);
  
  // Set up authentication
  await setupAuth(app);
  
  // API routes
  const apiRouter = Router();
  
  // User routes
  apiRouter.post('/users/register', async (req, res) => {
    try {
      // Validate user data
      const userSchema = z.object({
        username: z.string().min(3).max(50),
        email: z.string().email(),
        password: z.string().min(8),
      });
      
      const userData = userSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.query('users', { username: userData.username });
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, config.security.bcryptSaltRounds);
      
      // Create user
      const user = await storage.create('users', {
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        tokenBalance: 100, // Initial token balance
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      } else {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });
  
  apiRouter.post('/users/login', passport.authenticate('local'), (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });
  
  apiRouter.post('/users/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  apiRouter.get('/users/me', ensureAuthenticated, (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });
  
  // Apply API router
  app.use('/api', apiRouter);
  
  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('API Error:', err);
    auditLogger.logSecurityEvent(req, (req.user as any)?.id || 'unknown', 'error', {
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    res.status(500).json({ message: 'Internal server error' });
  });
  
  return server;
} 