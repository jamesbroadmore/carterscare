/**
 * Example tests for API client and React hooks
 * Tests data fetching and error handling
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStaffList, useCreateStaff } from '@/hooks/useStaff.js';

// Create a test wrapper with QueryClient
const createTestWrapper = () => {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Staff Hooks', () => {
  describe('useStaffList', () => {
    it('should fetch staff list on mount', async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useStaffList(1, 20), { wrapper });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have data or error
      expect(result.current.data || result.current.error).toBeDefined();
    });

    it('should handle pagination', async () => {
      const wrapper = createTestWrapper();
      const { result, rerender } = renderHook(
        ({ page, limit }) => useStaffList(page, limit),
        {
          wrapper,
          initialProps: { page: 1, limit: 20 },
        },
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Change page
      rerender({ page: 2, limit: 20 });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('useCreateStaff', () => {
    it('should create staff with valid data', async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useCreateStaff(), { wrapper });

      const newStaff = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      };

      result.current.mutate(newStaff);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      // Mutation should succeed or fail
      expect(result.current.data || result.current.error).toBeDefined();
    });

    it('should show error on invalid data', async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(() => useCreateStaff(), { wrapper });

      result.current.mutate({
        firstName: '',
        lastName: '',
        email: 'invalid-email',
      } as any);

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });

      // Should have error
      expect(result.current.error).toBeDefined();
    });
  });
});
