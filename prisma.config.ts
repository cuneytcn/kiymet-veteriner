import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migration ve şema işlemleri havuzlanmamış bağlantı üzerinden yapılır;
// pooler (PgBouncer) bazı DDL ifadelerinde sorun çıkarıyor.
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // `prisma generate` bağlantı adresi istemez. Vercel kurulum (install) adımında
  // env değişkenleri henüz tanımlı olmadığından datasource'u koşullu ekliyoruz;
  // zorunlu tutulursa postinstall orada patlıyor.
  ...(url ? { datasource: { url } } : {}),
});
