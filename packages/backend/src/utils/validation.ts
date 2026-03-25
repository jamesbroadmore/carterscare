/**
 * Validation utilities for request data and database operations.
 * Provides type-safe validation helpers.
 */

import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';

/**
 * Validate request body against a Zod schema
 */
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error', { path: req.path, errors: error.errors });
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate request query parameters against a Zod schema
 */
export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid query parameters',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Check if value is valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000);
}

/**
 * Validate pagination parameters
 */
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional()
    .default('20'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Calculate pagination offset and limit
 */
export function calculatePagination(page: number, limit: number) {
  const skip = Math.max(0, (page - 1) * Math.min(limit, 100));
  const take = Math.min(limit, 100);
  return { skip, take };
}
