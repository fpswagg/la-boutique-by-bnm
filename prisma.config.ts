import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // v7: no directUrl here — CLI/migrations use this URL (plain PostgreSQL TCP, not a pooler).
  datasource: {
    url: env("DIRECT_URL"),
  },
});
