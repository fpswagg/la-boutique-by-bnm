import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // v7: no directUrl here — CLI/migrations use this URL; use the direct TCP URL (not PgBouncer).
  datasource: {
    url: env("DIRECT_URL"),
  },
});
