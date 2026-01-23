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

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (env.NODE_ENV !== "production") globalThis.prisma = prisma;
