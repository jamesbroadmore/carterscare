/**
 * Client management routes with full CRUD operations.
 * All endpoints use the client service layer for database operations.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { clientService } from '@/services/index.js';
import { logger } from '@/utils/logger.js';
import { validateBody, validateQuery, paginationSchema, calculatePagination } from '@/utils/validation.js';
import { z } from 'zod';
import type { Client, ApiResponse } from '@shared/types';

const router = Router();

// Validation schemas
const createClientSchema = z.object({
  firstName: z.string().min(1, 'First name required').max(100),
  lastName: z.string().min(1, 'Last name required').max(100),
  dateOfBirth: z.string().datetime().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial();

/**
 * GET /api/clients
 * Retrieve all clients with pagination
 */
router.get('/', validateQuery(paginationSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { skip, take } = calculatePagination(page, limit);

    logger.debug('Fetching clients', { page, limit });

    const clients = await clientService.getAllClients(skip, take);
    const total = await clientService.countClients();

    const response: ApiResponse<Client[]> = {
      success: true,
      data: clients,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/clients/:id
 * Retrieve a specific client by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    logger.debug('Fetching client', { id });

    const client = await clientService.getClientById(id);

    const response: ApiResponse<Client> = {
      success: true,
      data: client,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/clients
 * Create a new client
 */
router.post('/', validateBody(createClientSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = req.body;
    logger.info('Creating client', { firstName: input.firstName, lastName: input.lastName });

    const client = await clientService.createClient(input);

    const response: ApiResponse<Client> = {
      success: true,
      data: client,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/clients/:id
 * Update a client
 */
router.patch('/:id', validateBody(updateClientSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    logger.info('Updating client', { id });

    const client = await clientService.updateClient(id, updates);

    const response: ApiResponse<Client> = {
      success: true,
      data: client,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/clients/:id
 * Delete a client
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Deleting client', { id });

    await clientService.deleteClient(id);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
