import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().pipe(z.coerce.number()).default("5000"),
  MONGO_URL: z.string().url("MongoDB connection URL is required"),
  DB_NAME: z.string().default("carter_s_care"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://localhost:5173")
    .transform((s) => s.split(",")),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("Invalid environment variables:", error.errors);
    process.exit(1);
  }
  throw error;
}

export default env;
