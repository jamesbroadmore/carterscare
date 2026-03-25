/**
 * Custom hooks for staff management API operations
 * Provides ready-to-use mutations and queries for staff CRUD
 */

import { useApiQuery, useApiMutation, useApiUpdateMutation, useApiDeleteMutation } from '@/hooks/useApi.js';
import type { Staff, StaffInput } from '@shared/types';

/**
 * Fetch all staff members with pagination
 */
export function useStaffList(page: number = 1, limit: number = 20) {
  return useApiQuery<Staff[]>(
    ['staff', { page, limit }],
    `/staff?page=${page}&limit=${limit}`,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  );
}

/**
 * Fetch single staff member by ID
 */
export function useStaffById(id: string) {
  return useApiQuery<Staff>(
    ['staff', id],
    `/staff/${id}`,
    {
      enabled: !!id,
      staleTime: 1000 * 60 * 10, // 10 minutes
    },
  );
}

/**
 * Create new staff member
 */
export function useCreateStaff() {
  return useApiMutation<Staff, StaffInput>(['staff', 'create'], '/staff', {
    onSuccess: () => {
      // Query invalidation happens in hook
    },
  });
}

/**
 * Update staff member
 */
export function useUpdateStaff(id: string) {
  return useApiUpdateMutation<Staff, Partial<StaffInput>>(
    ['staff', id, 'update'],
    `/staff/${id}`,
    {
      enabled: !!id,
    },
  );
}

/**
 * Delete staff member
 */
export function useDeleteStaff(id: string) {
  return useApiDeleteMutation<null>(
    ['staff', id, 'delete'],
    `/staff/${id}`,
    {
      enabled: !!id,
    },
  );
}
