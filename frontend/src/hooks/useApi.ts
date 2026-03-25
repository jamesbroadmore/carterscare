/**
 * Generic API hook for React Query data fetching
 * Provides reusable pattern for fetching, creating, updating, and deleting data
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client.js';
import type { ApiResponse } from '@shared/types';

/**
 * Generic fetch hook for GET requests
 */
export function useApiQuery<T>(
  queryKey: string[],
  path: string,
  options?: UseQueryOptions<T>,
) {
  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<T>>(path);
        return response.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch data';
        toast.error(message);
        throw error;
      }
    },
    ...options,
  });
}

/**
 * Generic create mutation hook for POST requests
 */
export function useApiMutation<TData, TInput>(
  mutationKey: string[],
  path: string,
  options?: UseMutationOptions<TData, Error, TInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TInput>({
    mutationKey,
    mutationFn: async (input) => {
      try {
        const response = await apiClient.post<ApiResponse<TData>>(path, input);
        return response.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Operation failed';
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mutationKey });
      toast.success('Operation completed successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...options,
  });
}

/**
 * Generic update mutation hook for PATCH requests
 */
export function useApiUpdateMutation<TData, TInput>(
  mutationKey: string[],
  path: string,
  options?: UseMutationOptions<TData, Error, TInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TInput>({
    mutationKey,
    mutationFn: async (input) => {
      try {
        const response = await apiClient.patch<ApiResponse<TData>>(path, input);
        return response.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Update failed';
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mutationKey });
      toast.success('Updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...options,
  });
}

/**
 * Generic delete mutation hook for DELETE requests
 */
export function useApiDeleteMutation<TData>(
  mutationKey: string[],
  path: string,
  options?: UseMutationOptions<TData, Error, void>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, void>({
    mutationKey,
    mutationFn: async () => {
      try {
        const response = await apiClient.delete<ApiResponse<TData>>(path);
        return response.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Delete failed';
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mutationKey });
      toast.success('Deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...options,
  });
}
