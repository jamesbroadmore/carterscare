/**
 * Custom hooks for client management API operations
 * Provides ready-to-use mutations and queries for client CRUD
 */

import { useApiQuery, useApiMutation, useApiUpdateMutation, useApiDeleteMutation } from '@/hooks/useApi.js';
import type { Client, ClientInput } from '@shared/types';

/**
 * Fetch all clients with pagination
 */
export function useClientList(page: number = 1, limit: number = 20) {
  return useApiQuery<Client[]>(
    ['clients', { page, limit }],
    `/clients?page=${page}&limit=${limit}`,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  );
}

/**
 * Fetch single client by ID
 */
export function useClientById(id: string) {
  return useApiQuery<Client>(
    ['clients', id],
    `/clients/${id}`,
    {
      enabled: !!id,
      staleTime: 1000 * 60 * 10, // 10 minutes
    },
  );
}

/**
 * Create new client
 */
export function useCreateClient() {
  return useApiMutation<Client, ClientInput>(['clients', 'create'], '/clients', {
    onSuccess: () => {
      // Query invalidation happens in hook
    },
  });
}

/**
 * Update client
 */
export function useUpdateClient(id: string) {
  return useApiUpdateMutation<Client, Partial<ClientInput>>(
    ['clients', id, 'update'],
    `/clients/${id}`,
    {
      enabled: !!id,
    },
  );
}

/**
 * Delete client
 */
export function useDeleteClient(id: string) {
  return useApiDeleteMutation<null>(
    ['clients', id, 'delete'],
    `/clients/${id}`,
    {
      enabled: !!id,
    },
  );
}
