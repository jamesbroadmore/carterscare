/**
 * Staff service layer for database operations.
 * Centralizes business logic separate from routes.
 */

import { ObjectId } from 'mongodb';
import { db } from '@/config/database.js';
import { logger } from '@/utils/logger.js';
import { NotFoundError, DatabaseError, isValidObjectId } from '@/utils/index.js';
import type { Staff, StaffInput } from '@shared/types';

const COLLECTION_NAME = 'staff';

/**
 * Get all staff members with optional pagination
 */
export async function getAllStaff(skip: number = 0, limit: number = 20): Promise<Staff[]> {
  try {
    const collection = db.collection<Staff>(COLLECTION_NAME);
    const staff = await collection
      .find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();
    return staff;
  } catch (error) {
    logger.error('Failed to fetch staff', { skip, limit }, error as Error);
    throw new DatabaseError('Failed to fetch staff members');
  }
}

/**
 * Get staff member by ID
 */
export async function getStaffById(id: string): Promise<Staff> {
  try {
    if (!isValidObjectId(id)) {
      throw new NotFoundError('Invalid staff ID format');
    }

    const collection = db.collection<Staff>(COLLECTION_NAME);
    const staff = await collection.findOne({ _id: new ObjectId(id) });

    if (!staff) {
      throw new NotFoundError('Staff member not found');
    }

    return staff;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Failed to fetch staff member', { id }, error as Error);
    throw new DatabaseError('Failed to fetch staff member');
  }
}

/**
 * Create new staff member
 */
export async function createStaff(input: StaffInput): Promise<Staff> {
  try {
    const collection = db.collection<Staff>(COLLECTION_NAME);

    const newStaff: Staff = {
      _id: new ObjectId(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newStaff);

    if (!result.insertedId) {
      throw new DatabaseError('Failed to create staff member');
    }

    logger.info('Staff member created', { id: result.insertedId });
    return newStaff;
  } catch (error) {
    logger.error('Failed to create staff member', { input }, error as Error);
    throw new DatabaseError('Failed to create staff member');
  }
}

/**
 * Update staff member
 */
export async function updateStaff(id: string, updates: Partial<StaffInput>): Promise<Staff> {
  try {
    if (!isValidObjectId(id)) {
      throw new NotFoundError('Invalid staff ID format');
    }

    const collection = db.collection<Staff>(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );

    if (!result.value) {
      throw new NotFoundError('Staff member not found');
    }

    logger.info('Staff member updated', { id });
    return result.value;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Failed to update staff member', { id }, error as Error);
    throw new DatabaseError('Failed to update staff member');
  }
}

/**
 * Delete staff member
 */
export async function deleteStaff(id: string): Promise<void> {
  try {
    if (!isValidObjectId(id)) {
      throw new NotFoundError('Invalid staff ID format');
    }

    const collection = db.collection<Staff>(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new NotFoundError('Staff member not found');
    }

    logger.info('Staff member deleted', { id });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Failed to delete staff member', { id }, error as Error);
    throw new DatabaseError('Failed to delete staff member');
  }
}

/**
 * Count total staff members
 */
export async function countStaff(): Promise<number> {
  try {
    const collection = db.collection<Staff>(COLLECTION_NAME);
    return await collection.countDocuments();
  } catch (error) {
    logger.error('Failed to count staff', {}, error as Error);
    throw new DatabaseError('Failed to count staff members');
  }
}
