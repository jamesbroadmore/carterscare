/**
 * Request logging middleware for tracking API calls
 * Records method, path, status, and duration
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger.js';

/**
 * Middleware to log incoming requests and outgoing responses
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const { method, path, ip } = req;

  // Log incoming request
  logger.debug(`→ ${method} ${path}`, {
    ip,
    userAgent: req.get('user-agent')?.substring(0, 50),
  });

  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log response
    if (statusCode >= 400) {
      logger.warn(`← ${method} ${path} ${statusCode} (${duration}ms)`, {
        duration,
        statusCode,
      });
    } else {
      logger.debug(`← ${method} ${path} ${statusCode} (${duration}ms)`, {
        duration,
        statusCode,
      });
    }

    return originalJson(data);
  };

  next();
}

/**
 * Middleware to log errors that occur during request processing
 */
export function errorLogger(err: Error, req: Request, _res: Response, next: NextFunction): void {
  logger.error(`✗ ${req.method} ${req.path}`, {
    error: err.message,
    stack: err.stack?.split('\n')[0],
  });

  next(err);
}
