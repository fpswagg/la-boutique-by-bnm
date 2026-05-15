import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  // Single connection per Node isolate. Default pg Pool (max ~10) plus parallel
  // `next build` static generation exhausts Supabase session pooler (EMAXCONNSESSION).
  const adapter = new PrismaPg({
    connectionString,
    max: 1,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
  });

  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.__prisma ?? createPrismaClient();
globalForPrisma.__prisma = prisma;

export const db = prisma;
