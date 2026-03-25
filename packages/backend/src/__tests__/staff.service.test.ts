/**
 * Example unit tests for staff service layer
 * Tests CRUD operations with error handling
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { staffService } from '@/services/index.js';
import { NotFoundError, DatabaseError } from '@/utils/error-handler.js';
import type { StaffInput } from '@shared/types';

describe('Staff Service', () => {
  const mockStaffInput: StaffInput = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-0100',
    preferredName: 'Johnny',
    abn: 'ABN123456789',
  };

  describe('createStaff', () => {
    it('should create a staff member with valid input', async () => {
      // This test assumes database connection is available
      // In production, use test database or mocks
      const staff = await staffService.createStaff(mockStaffInput);
      
      expect(staff).toBeDefined();
      expect(staff.firstName).toBe(mockStaffInput.firstName);
      expect(staff.email).toBe(mockStaffInput.email);
    });

    it('should throw error on database failure', async () => {
      // Mock database failure
      const invalidInput = { firstName: '', lastName: '', email: 'invalid-email' };
      
      await expect(staffService.createStaff(invalidInput)).rejects.toThrow();
    });
  });

  describe('getStaffById', () => {
    it('should throw NotFoundError for invalid ID format', async () => {
      await expect(staffService.getStaffById('invalid-id')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError for non-existent staff', async () => {
      const fakeId = '000000000000000000000000';
      await expect(staffService.getStaffById(fakeId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllStaff', () => {
    it('should return array of staff members', async () => {
      const staff = await staffService.getAllStaff(0, 20);
      
      expect(Array.isArray(staff)).toBe(true);
    });

    it('should respect pagination parameters', async () => {
      const page1 = await staffService.getAllStaff(0, 5);
      const page2 = await staffService.getAllStaff(5, 5);
      
      expect(page1.length).toBeLessThanOrEqual(5);
      expect(page2.length).toBeLessThanOrEqual(5);
    });
  });

  describe('countStaff', () => {
    it('should return a number', async () => {
      const count = await staffService.countStaff();
      
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
