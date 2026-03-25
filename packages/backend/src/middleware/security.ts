/**
 * Security middleware for Express application
 * Adds security headers and implements rate limiting
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger.js';
import { TooManyRequestsError } from '@/utils/error-handler.js';

// Simple in-memory rate limiter (replace with Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Security headers middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent XSS attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Disable browser caching for sensitive endpoints
  if (req.path.includes('/auth') || req.path.includes('/user')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
}

/**
 * Rate limiting middleware
 * Limits requests to 100 per 15 minutes per IP
 */
export function rateLimit(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || 'unknown';
    const now = Date.now();

    // Clean up old entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }

    // Get or create rate limit entry
    let record = rateLimitStore.get(ip);

    if (!record) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(ip, record);
    }

    // Check if reset time has passed
    if (record.resetTime < now) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    // Increment counter
    record.count += 1;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    // Check if limit exceeded
    if (record.count > maxRequests) {
      logger.warn('Rate limit exceeded', { ip, count: record.count, maxRequests });
      const error = new TooManyRequestsError(
        `Rate limit exceeded. Maximum ${maxRequests} requests per ${Math.floor(windowMs / 60000)} minutes.`,
      );
      return next(error);
    }

    next();
  };
}

/**
 * Validation middleware to ensure required headers
 */
export function validateContentType(req: Request, res: Response, next: NextFunction): void {
  if (['POST', 'PATCH', 'PUT'].includes(req.method)) {
    const contentType = req.get('content-type');
    if (!contentType?.includes('application/json')) {
      logger.warn('Invalid content-type header', {
        method: req.method,
        path: req.path,
        contentType,
      });
    }
  }

  next();
}
