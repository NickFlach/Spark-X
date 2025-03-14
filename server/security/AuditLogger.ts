import { createLogger, format, transports } from 'winston';
import { Request } from 'express';

interface AuditEvent {
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'failure';
  details?: any;
}

export class AuditLogger {
  private logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        new transports.File({ filename: 'logs/audit.log' }),
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
      ],
    });
  }

  public logEvent(event: AuditEvent): void {
    this.logger.info('Security Event', event);

    // If it's a security-critical event, also log to a separate file
    if (this.isSecurityCritical(event)) {
      this.logger.warn('Security Critical Event', {
        ...event,
        criticalityLevel: 'HIGH',
      });
    }
  }

  public logAuthAttempt(req: Request, userId: string, success: boolean, details?: any): void {
    this.logEvent({
      timestamp: new Date().toISOString(),
      userId,
      action: 'authentication',
      resource: 'auth',
      ip: this.getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      status: success ? 'success' : 'failure',
      details,
    });
  }

  public logApiAccess(req: Request, userId: string, success: boolean, details?: any): void {
    this.logEvent({
      timestamp: new Date().toISOString(),
      userId,
      action: 'api_access',
      resource: `${req.method} ${req.path}`,
      ip: this.getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      status: success ? 'success' : 'failure',
      details,
    });
  }

  public logSecurityEvent(req: Request, userId: string, action: string, details?: any): void {
    this.logEvent({
      timestamp: new Date().toISOString(),
      userId,
      action,
      resource: req.path,
      ip: this.getClientIp(req),
      userAgent: req.headers['user-agent'] || 'unknown',
      status: 'success',
      details,
    });
  }

  private isSecurityCritical(event: AuditEvent): boolean {
    const criticalActions = [
      'authentication_failure',
      'authorization_failure',
      'invalid_2fa',
      'password_change',
      'role_change',
      'permission_change',
      'api_key_generation',
      'security_setting_change',
    ];

    return criticalActions.includes(event.action) || event.details?.criticalityLevel === 'HIGH';
  }

  private getClientIp(req: Request): string {
    return (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  }
}
