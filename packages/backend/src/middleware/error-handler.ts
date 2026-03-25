import { Request, Response, NextFunction } from "express";
import { AppError, ErrorCodes, createErrorResponse } from "@shared/types";

export class ErrorHandler {
  static handle(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
    console.error("[v0] Error:", err);

    if (err instanceof AppError) {
      res.status(err.statusCode).json(createErrorResponse(err.code, err.message, err.details));
      return;
    }

    if (err instanceof SyntaxError && "body" in err) {
      res.status(400).json(createErrorResponse(ErrorCodes.INVALID_INPUT, "Invalid JSON in request body"));
      return;
    }

    res.status(500).json(
      createErrorResponse(ErrorCodes.INTERNAL_ERROR, "An unexpected error occurred")
    );
  }

  static notFound(_req: Request, res: Response): void {
    res.status(404).json(
      createErrorResponse(ErrorCodes.NOT_FOUND, "Resource not found")
    );
  }
}
