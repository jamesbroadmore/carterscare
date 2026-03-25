/**
 * Type-safe API client for frontend-backend communication
 * Handles request/response formatting, error handling, and type safety
 */

import type { ApiResponse, ApiErrorResponse } from '@shared/types';

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 10000;
  }

  /**
   * Fetch wrapper with timeout and error handling
   */
  private async fetch<T>(path: string, options?: FetchOptions): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const timeout = options?.timeout || this.timeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle response
      if (!response.ok) {
        const errorData = (await response.json()) as ApiErrorResponse;
        throw new Error(errorData.error.message || `HTTP ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your connection.');
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(path: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(path, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient({
  baseUrl: '/api',
  timeout: 10000,
});

export default apiClient;
