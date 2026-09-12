import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migration ve şema işlemleri havuzlanmamış bağlantı üzerinden yapılır;
    // pooler (PgBouncer) bazı DDL ifadelerinde sorun çıkarıyor.
    url: process.env.DIRECT_URL || env("DATABASE_URL"),
  },
});
