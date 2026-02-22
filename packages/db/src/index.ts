import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@Tolumak/env/server";
import pg from "pg";

import { PrismaClient } from "../prisma/generated";

const connectionString = env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Forcing fresh instance for now to avoid stale globalThis issues in development
const prisma = prismaClientSingleton();

console.log("Prisma models available:", Object.keys(prisma).filter(k => !k.startsWith('$')));

export default prisma;

// if (env.NODE_ENV !== "production") globalThis.prisma = prisma;
