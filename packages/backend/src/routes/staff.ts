import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database.js";
import {
  createSuccessResponse,
  ErrorCodes,
  AppError,
  Staff,
  CreateStaffRequest,
} from "@shared/types";

const router = Router();

/**
 * Create a staff member
 */
router.post("/", async (req: Request<unknown, unknown, CreateStaffRequest>, res: Response) => {
  const { firstName, lastName, email, phone, preferredName, abn } = req.body;

  if (!firstName || !lastName || !email) {
    throw new AppError(
      ErrorCodes.VALIDATION_ERROR,
      "firstName, lastName, and email are required",
      400
    );
  }

  const db = getDatabase();

  // Check for duplicate email
  const existing = await db.collection("staff").findOne({ email });
  if (existing) {
    throw new AppError(ErrorCodes.DUPLICATE_ENTRY, "Email already in use", 409);
  }

  const staff: Staff = {
    id: uuidv4(),
    firstName,
    lastName,
    preferredName,
    email,
    phone,
    abn,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await db.collection("staff").insertOne(staff as any);
    res.status(201).json(createSuccessResponse(staff));
  } catch (error) {
    console.error("[v0] Error creating staff:", error);
    throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to create staff member", 500);
  }
});

/**
 * Get all staff
 */
router.get("/", async (_req: Request, res: Response) => {
  const db = getDatabase();

  try {
    const staff = await db
      .collection("staff")
      .find({ status: "active" })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(createSuccessResponse(staff));
  } catch (error) {
    console.error("[v0] Error fetching staff:", error);
    throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to fetch staff", 500);
  }
});

/**
 * Get a specific staff member
 */
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
    const staff = await db.collection("staff").findOne({ id });

    if (!staff) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Staff member not found", 404);
    }

    res.json(createSuccessResponse(staff));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("[v0] Error fetching staff:", error);
    throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to fetch staff", 500);
  }
});

/**
 * Update a staff member
 */
router.patch("/:id", async (req: Request<{ id: string }, unknown, Partial<CreateStaffRequest>>, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, "No updates provided", 400);
  }

  try {
    const result = await db.collection("staff").findOneAndUpdate(
      { id },
      {
        $set: {
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result.value) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Staff member not found", 404);
    }

    res.json(createSuccessResponse(result.value));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("[v0] Error updating staff:", error);
    throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to update staff", 500);
  }
});

export default router;
