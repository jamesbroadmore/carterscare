import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../config/database.js";
import {
  createSuccessResponse,
  ErrorCodes,
  AppError,
  Client,
  CreateClientRequest,
} from "@shared/types";

const router = Router();

/**
 * Create a client
 */
router.post("/", async (req: Request<unknown, unknown, CreateClientRequest>, res: Response) => {
  const { firstName, lastName, dateOfBirth, address, phone, emergencyContact } = req.body;

  if (!firstName || !lastName) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, "firstName and lastName are required", 400);
  }

  const db = getDatabase();

  const client: Client = {
    id: uuidv4(),
    firstName,
    lastName,
    dateOfBirth,
    address,
    phone,
    emergencyContact,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await db.collection("clients").insertOne(client as any);
    res.status(201).json(createSuccessResponse(client));
  } catch (error) {
    console.error("[v0] Error creating client:", error);
    throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to create client", 500);
  }
});

/**
 * Get all clients
 */
router.get("/", async (_req: Request, res: Response) => {
  const db = getDatabase();

  try {
    const clients = await db
      .collection("clients")
      .find({ status: "active" })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(createSuccessResponse(clients));
  } catch (error) {
    console.error("[v0] Error fetching clients:", error);
    throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to fetch clients", 500);
  }
});

/**
 * Get a specific client
 */
router.get("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
    const client = await db.collection("clients").findOne({ id });

    if (!client) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Client not found", 404);
    }

    res.json(createSuccessResponse(client));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("[v0] Error fetching client:", error);
    throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to fetch client", 500);
  }
});

/**
 * Update a client
 */
router.patch("/:id", async (req: Request<{ id: string }, unknown, Partial<CreateClientRequest>>, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, "No updates provided", 400);
  }

  try {
    const result = await db.collection("clients").findOneAndUpdate(
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
      throw new AppError(ErrorCodes.NOT_FOUND, "Client not found", 404);
    }

    res.json(createSuccessResponse(result.value));
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("[v0] Error updating client:", error);
    throw new AppError(ErrorCodes.INTERNAL_ERROR, "Failed to update client", 500);
  }
});

export default router;
