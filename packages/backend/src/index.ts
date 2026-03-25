import "express-async-errors";
import express from "express";
import cors from "cors";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import env from "./config/env.js";
import { ErrorHandler } from "./middleware/error-handler.js";
import apiRoutes from "./routes/index.js";

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  })
);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", apiRoutes);

// 404 handler
app.use(ErrorHandler.notFound);

// Error handler (must be last)
app.use(ErrorHandler.handle);

const PORT = env.PORT;

async function start(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`[v0] Backend server running on http://localhost:${PORT}`);
      console.log(`[v0] Health check: http://localhost:${PORT}/health`);
      console.log(`[v0] Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("[v0] Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("[v0] Shutting down gracefully...");
  await disconnectDatabase();
  process.exit(0);
});

start();
