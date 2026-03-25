/**
 * Client service layer for database operations.
 */

import { ObjectId } from 'mongodb';
import { db } from '@/config/database.js';
import { logger } from '@/utils/logger.js';
import { NotFoundError, DatabaseError, isValidObjectId } from '@/utils/index.js';
import type { Client, ClientInput } from '@shared/types';

const COLLECTION_NAME = 'clients';

/**
 * Get all clients with optional pagination
 */
export async function getAllClients(skip: number = 0, limit: number = 20): Promise<Client[]> {
  try {
    const collection = db.collection<Client>(COLLECTION_NAME);
    const clients = await collection
      .find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();
    return clients;
  } catch (error) {
    logger.error('Failed to fetch clients', { skip, limit }, error as Error);
    throw new DatabaseError('Failed to fetch clients');
  }
}

/**
 * Get client by ID
 */
export async function getClientById(id: string): Promise<Client> {
  try {
    if (!isValidObjectId(id)) {
      throw new NotFoundError('Invalid client ID format');
    }

    const collection = db.collection<Client>(COLLECTION_NAME);
    const client = await collection.findOne({ _id: new ObjectId(id) });

    if (!client) {
      throw new NotFoundError('Client not found');
    }

    return client;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Failed to fetch client', { id }, error as Error);
    throw new DatabaseError('Failed to fetch client');
  }
}

/**
 * Create new client
 */
export async function createClient(input: ClientInput): Promise<Client> {
  try {
    const collection = db.collection<Client>(COLLECTION_NAME);

    const newClient: Client = {
      _id: new ObjectId(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newClient);

    if (!result.insertedId) {
      throw new DatabaseError('Failed to create client');
    }

    logger.info('Client created', { id: result.insertedId });
    return newClient;
  } catch (error) {
    logger.error('Failed to create client', { input }, error as Error);
    throw new DatabaseError('Failed to create client');
  }
}

/**
 * Update client
 */
export async function updateClient(id: string, updates: Partial<ClientInput>): Promise<Client> {
  try {
    if (!isValidObjectId(id)) {
      throw new NotFoundError('Invalid client ID format');
    }

    const collection = db.collection<Client>(COLLECTION_NAME);

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
      throw new NotFoundError('Client not found');
    }

    logger.info('Client updated', { id });
    return result.value;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Failed to update client', { id }, error as Error);
    throw new DatabaseError('Failed to update client');
  }
}

/**
 * Delete client
 */
export async function deleteClient(id: string): Promise<void> {
  try {
    if (!isValidObjectId(id)) {
      throw new NotFoundError('Invalid client ID format');
    }

    const collection = db.collection<Client>(COLLECTION_NAME);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      throw new NotFoundError('Client not found');
    }

    logger.info('Client deleted', { id });
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error('Failed to delete client', { id }, error as Error);
    throw new DatabaseError('Failed to delete client');
  }
}

/**
 * Count total clients
 */
export async function countClients(): Promise<number> {
  try {
    const collection = db.collection<Client>(COLLECTION_NAME);
    return await collection.countDocuments();
  } catch (error) {
    logger.error('Failed to count clients', {}, error as Error);
    throw new DatabaseError('Failed to count clients');
  }
}
