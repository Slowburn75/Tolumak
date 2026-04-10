import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default(""),
  BETTER_AUTH_SECRET: z.string().min(32).default(""),
  BETTER_AUTH_URL: z.url().default(""),
  CORS_ORIGIN: z.url().default(""),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development").optional(),
});

export const env = envSchema.parse(process.env);
