import { fileURLToPath } from "bun";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./schema.ts";

export const db = drizzle("./database.db", { schema });

migrate(db, {
  migrationsFolder: fileURLToPath(import.meta.resolve("../../../drizzle")),
});
