import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database.js";
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCodes,
  AppError,
  StatusCheck,
  CreateStatusCheckRequest,
} from "@shared/types";

const router = Router();

/**
 * Create a status check
 */
router.post("/", async (req: Request<unknown, unknown, CreateStatusCheckRequest>, res: Response) => {
  const { clientName, staffName, location, notes } = req.body;

  if (!clientName || !staffName) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, "clientName and staffName are required", 400);
  }

  const db = getDatabase();
  const statusCheck: StatusCheck = {
    id: uuidv4(),
    clientName,
    staffName,
    checkInTime: new Date().toISOString(),
    status: "checked_in",
    location,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await db.collection("status_checks").insertOne(statusCheck as any);
    res.status(201).json(createSuccessResponse(statusCheck));
  } catch (error) {
    console.error("[v0] Error creating status check:", error);
    throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to create status check", 500);
  }
});

/**
 * Get all status checks
 */
router.get("/", async (_req: Request, res: Response) => {
  const db = getDatabase();

  try {
    const checks = await db
      .collection("status_checks")
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    res.json(createSuccessResponse(checks));
  } catch (error) {
    console.error("[v0] Error fetching status checks:", error);
    throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to fetch status checks", 500);
  }
});

/**
 * Get a specific status check
 */
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
    const check = await db.collection("status_checks").findOne({ id });

    if (!check) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Status check not found", 404);
    }

    res.json(createSuccessResponse(check));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("[v0] Error fetching status check:", error);
    throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to fetch status check", 500);
  }
});

export default router;
