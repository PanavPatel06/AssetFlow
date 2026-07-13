import { PrismaClient } from "@prisma/client";

// Standard Next.js singleton pattern: in dev, Next's hot-reload would
// otherwise create a fresh PrismaClient (and a fresh DB connection pool) on
// every file change, quickly exhausting Postgres connections.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
