/**
 * Staff management routes with full CRUD operations.
 * All endpoints use the staff service layer for database operations.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { staffService } from '@/services/index.js';
import { logger } from '@/utils/logger.js';
import { validateBody, validateQuery, paginationSchema, calculatePagination } from '@/utils/validation.js';
import { AppError } from '@/utils/error-handler.js';
import { z } from 'zod';
import type { Staff, ApiResponse } from '@shared/types';

const router = Router();

// Validation schemas
const createStaffSchema = z.object({
  firstName: z.string().min(1, 'First name required').max(100),
  lastName: z.string().min(1, 'Last name required').max(100),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  preferredName: z.string().optional(),
  abn: z.string().optional(),
});

const updateStaffSchema = createStaffSchema.partial();

/**
 * GET /api/staff
 * Retrieve all staff members with pagination
 */
router.get('/', validateQuery(paginationSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { skip, take } = calculatePagination(page, limit);

    logger.debug('Fetching staff members', { page, limit });

    const staff = await staffService.getAllStaff(skip, take);
    const total = await staffService.countStaff();

    const response: ApiResponse<Staff[]> = {
      success: true,
      data: staff,
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
 * GET /api/staff/:id
 * Retrieve a specific staff member by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    logger.debug('Fetching staff member', { id });

    const staff = await staffService.getStaffById(id);

    const response: ApiResponse<Staff> = {
      success: true,
      data: staff,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/staff
 * Create a new staff member
 */
router.post('/', validateBody(createStaffSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = req.body;
    logger.info('Creating staff member', { email: input.email });

    const staff = await staffService.createStaff(input);

    const response: ApiResponse<Staff> = {
      success: true,
      data: staff,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/staff/:id
 * Update a staff member
 */
router.patch('/:id', validateBody(updateStaffSchema), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    logger.info('Updating staff member', { id });

    const staff = await staffService.updateStaff(id, updates);

    const response: ApiResponse<Staff> = {
      success: true,
      data: staff,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/staff/:id
 * Delete a staff member
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Deleting staff member', { id });

    await staffService.deleteStaff(id);

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
