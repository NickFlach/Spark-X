import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export const rateLimiter = (config: RateLimitConfig) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: {
      success: false,
      error: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
