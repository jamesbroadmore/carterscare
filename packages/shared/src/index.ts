/**
 * API Response Types
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Status Check Types
 */

export interface StatusCheck {
  id: string;
  clientName: string;
  staffName: string;
  checkInTime: string;
  checkOutTime?: string;
  status: "checked_in" | "checked_out" | "pending";
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStatusCheckRequest {
  clientName: string;
  staffName: string;
  location?: string;
  notes?: string;
}

export interface UpdateStatusCheckRequest {
  checkOutTime?: string;
  status?: "checked_in" | "checked_out" | "pending";
  notes?: string;
}

/**
 * Staff Types
 */

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phone?: string;
  status: "active" | "inactive" | "on_leave";
  abn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffRequest {
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phone?: string;
  abn?: string;
}

/**
 * Client Types
 */

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  status: "active" | "inactive" | "discharged";
  address?: string;
  phone?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  emergencyContact?: string;
}

/**
 * Timesheet Types
 */

export interface Timesheet {
  id: string;
  staffId: string;
  clientId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimesheetRequest {
  staffId: string;
  clientId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

/**
 * Invoice Types
 */

export interface Invoice {
  id: string;
  invoiceNumber: string;
  staffId: string;
  status: "draft" | "submitted" | "approved" | "paid";
  subtotal: number;
  gst: number;
  total: number;
  abn?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  staffId: string;
  abn?: string;
  subtotal: number;
  gst: number;
  total: number;
  notes?: string;
}

/**
 * Error Types
 */

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const ErrorCodes = {
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  INVALID_INPUT: "INVALID_INPUT",
} as const;

/**
 * Request/Response Helpers
 */

export function createSuccessResponse<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      ...meta,
    },
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiResponse<null> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  };
}
