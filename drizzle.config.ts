import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/database/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "./database.db",
  },
});
