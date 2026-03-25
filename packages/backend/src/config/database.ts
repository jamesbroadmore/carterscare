import { MongoClient, Db } from "mongodb";
import env from "./env.js";

let client: MongoClient;
let db: Db;

export async function connectDatabase(): Promise<Db> {
  if (db) return db;

  try {
    client = new MongoClient(env.MONGO_URL);
    await client.connect();
    db = client.db(env.DB_NAME);

    console.log(`[v0] Connected to MongoDB: ${env.DB_NAME}`);
    return db;
  } catch (error) {
    console.error("[v0] Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (client) {
    await client.close();
    console.log("[v0] Disconnected from MongoDB");
  }
}

export function getDatabase(): Db {
  if (!db) throw new Error("Database not connected");
  return db;
}
