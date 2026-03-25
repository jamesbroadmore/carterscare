/**
 * Global error handling middleware for Express.
 * Catches all errors and formats them consistently.
 */

import type { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger.js';
import { AppError } from '@/utils/error-handler.js';
import type { ApiErrorResponse } from '@shared/types';

/**
 * Format error response for API
 */
function formatErrorResponse(statusCode: number, message: string, details?: Record<string, unknown>): ApiErrorResponse {
  return {
    success: false,
    error: {
      statusCode,
      message,
      details,
    },
  };
}

/**
 * Global error handler middleware
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // Log the error
  if (err instanceof Error) {
    logger.error('Unhandled error', { type: err.constructor.name }, err);
  } else {
    logger.error('Unhandled unknown error', { error: err });
  }

  // Handle application errors
  if (err instanceof AppError) {
    const response = formatErrorResponse(err.statusCode, err.message);
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    const response = formatErrorResponse(400, 'Invalid JSON in request body');
    res.status(400).json(response);
    return;
  }

  // Handle validation errors
  if (err instanceof TypeError) {
    const response = formatErrorResponse(400, 'Invalid request');
    res.status(400).json(response);
    return;
  }

  // Default to 500 error
  const response = formatErrorResponse(500, 'Internal server error');
  res.status(500).json(response);
}

/**
 * 404 Not Found middleware
 */
export function notFoundHandler(_req: Request, res: Response): void {
  const response = formatErrorResponse(404, 'Resource not found');
  res.status(404).json(response);
}

/**
 * Async route wrapper to catch promise rejections
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
