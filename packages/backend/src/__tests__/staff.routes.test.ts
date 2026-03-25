/**
 * Example integration tests for staff routes
 * Tests HTTP endpoints and request/response flow
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '@/index.js';

describe('Staff Routes', () => {
  describe('GET /api/staff', () => {
    it('should return list of staff with pagination', async () => {
      const response = await request(app)
        .get('/api/staff')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/staff')
        .query({ page: 2, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(5);
    });

    it('should return 400 for invalid pagination', async () => {
      const response = await request(app)
        .get('/api/staff')
        .query({ page: 'invalid', limit: 'invalid' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/staff', () => {
    it('should create staff with valid data', async () => {
      const newStaff = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: `jane.smith.${Date.now()}@example.com`,
      };

      const response = await request(app)
        .post('/api/staff')
        .send(newStaff);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(newStaff.firstName);
    });

    it('should return 400 for invalid data', async () => {
      const invalidStaff = {
        firstName: '',
        lastName: '',
        email: 'invalid-email',
      };

      const response = await request(app)
        .post('/api/staff')
        .send(invalidStaff);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteStaff = {
        firstName: 'Bob',
      };

      const response = await request(app)
        .post('/api/staff')
        .send(incompleteStaff);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/staff/:id', () => {
    it('should return 404 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/staff/invalid-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent staff', async () => {
      const response = await request(app)
        .get('/api/staff/000000000000000000000000');

      expect(response.status).toBe(404);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/staff')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });
});
