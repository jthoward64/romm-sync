import { defineConfig } from "drizzle-kit";
import { dbPath } from "./src/lib/app-dirs.js";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/database/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
});
