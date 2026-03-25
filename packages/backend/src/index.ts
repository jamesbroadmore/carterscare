/**
 * Main Express application setup and initialization
 * Configures middleware, routes, error handling, and database connection
 */

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { connectDatabase, disconnectDatabase } from '@/config/database.js';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';
import { errorHandler, notFoundHandler } from '@/middleware/error-handler.js';
import { requestLogger, errorLogger } from '@/middleware/request-logger.js';
import { securityHeaders, rateLimit, validateContentType } from '@/middleware/security.js';
import apiRoutes from '@/routes/index.js';

const app = express();

/**
 * Middleware Setup
 */

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  }),
);

// Security middleware
app.use(securityHeaders);
app.use(validateContentType);
app.use(rateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// Request logging middleware
app.use(requestLogger);

/**
 * Health Check Endpoint
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * API Routes
 */
app.use('/api', apiRoutes);

/**
 * Error Handling
 */

// Error logging middleware (before error handler)
app.use(errorLogger);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

/**
 * Initialize Application
 */
async function initialize(): Promise<void> {
  try {
    logger.info('Starting application initialization...', { nodeEnv: env.NODE_ENV });

    // Connect to database
    logger.info('Connecting to MongoDB...');
    await connectDatabase();
    logger.info('Database connected successfully');

    // Start server
    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info('Server initialized', {
        url: `http://${env.HOST}:${env.PORT}`,
        environment: env.NODE_ENV,
        port: env.PORT,
        host: env.HOST,
      });
    });

    /**
     * Graceful shutdown handlers
     */
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} signal received: closing HTTP server`);
      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          await disconnectDatabase();
          logger.info('Database disconnected');
        } catch (error) {
          logger.error('Error disconnecting database', {}, error as Error);
        }
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception', {}, error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled rejection', { reason });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to initialize application', {}, error as Error);
    process.exit(1);
  }
}

// Start the application
initialize();

export default app;
