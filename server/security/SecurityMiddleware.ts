import { Request, Response, NextFunction } from 'express';
import { AuditLogger } from './AuditLogger';
import { TwoFactorAuth } from './TwoFactorAuth';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AuthenticatedRequest } from '../api/middleware/auth';

interface SecurityConfig {
  requireTwoFactor: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
}

export class SecurityMiddleware {
  private readonly config: SecurityConfig;
  private readonly loginAttempts: Map<string, number>;
  private readonly lockouts: Map<string, number>;
  private readonly auditLogger: AuditLogger;
  private readonly twoFactorAuth: TwoFactorAuth;

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      requireTwoFactor: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      ...config,
    };

    this.loginAttempts = new Map();
    this.lockouts = new Map();
    this.auditLogger = new AuditLogger();
    this.twoFactorAuth = new TwoFactorAuth();
  }

  /**
   * Middleware to enforce 2FA for protected routes
   */
  public require2FA = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!this.config.requireTwoFactor) {
      return next();
    }

    const token = req.headers['x-2fa-token'] as string;
    if (!token) {
      this.auditLogger.logSecurityEvent(req, req.user?.id || 'unknown', 'missing_2fa');
      return res.status(403).json({
        success: false,
        error: '2FA token required',
      });
    }

    const user2FASecret = await this.get2FASecret(req.user?.id || '');
    if (!user2FASecret) {
      this.auditLogger.logSecurityEvent(req, req.user?.id || 'unknown', '2fa_not_setup');
      return res.status(403).json({
        success: false,
        error: '2FA not set up',
      });
    }

    if (!this.twoFactorAuth.verifyToken(token, user2FASecret)) {
      this.auditLogger.logSecurityEvent(req, req.user?.id || 'unknown', 'invalid_2fa');
      return res.status(403).json({
        success: false,
        error: 'Invalid 2FA token',
      });
    }

    next();
  };

  /**
   * Middleware to check for account lockouts
   */
  public checkLockout = (req: Request, res: Response, next: NextFunction) => {
    const ip = this.getClientIp(req);
    const lockoutTime = this.lockouts.get(ip);

    if (lockoutTime && Date.now() < lockoutTime) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000);
      this.auditLogger.logSecurityEvent(req, 'unknown', 'account_locked');
      return res.status(429).json({
        success: false,
        error: `Account locked. Try again in ${remainingTime} seconds`,
      });
    }

    if (lockoutTime) {
      this.lockouts.delete(ip);
      this.loginAttempts.delete(ip);
    }

    next();
  };

  /**
   * Middleware to track failed login attempts
   */
  public trackLoginAttempt = (req: Request, success: boolean) => {
    const ip = this.getClientIp(req);

    if (success) {
      this.loginAttempts.delete(ip);
      this.lockouts.delete(ip);
      return;
    }

    const attempts = (this.loginAttempts.get(ip) || 0) + 1;
    this.loginAttempts.set(ip, attempts);

    if (attempts >= this.config.maxLoginAttempts) {
      this.lockouts.set(ip, Date.now() + this.config.lockoutDuration);
      this.auditLogger.logSecurityEvent(req, 'unknown', 'account_lockout', {
        attempts,
        duration: this.config.lockoutDuration,
      });
    }
  };

  /**
   * Security headers middleware
   */
  public securityHeaders = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: true,
    expectCt: {
      maxAge: 86400,
      enforce: true,
    },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  } as any);

  /**
   * Rate limiting middleware for API endpoints
   */
  public rateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: 'Too many requests from this IP',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  private async get2FASecret(userId: string): Promise<string | null> {
    // In a real implementation, this would fetch the user's
    // 2FA secret from a secure database
    return null;
  }

  private getClientIp(req: Request): string {
    return (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  }
}
