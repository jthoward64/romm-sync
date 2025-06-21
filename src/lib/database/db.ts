import { readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { file, SHA1 } from "bun";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import unzipper from "unzipper";
// @ts-ignore
import drizzleZip from "../../../build/drizzle.zip" with { type: "file" };
import { dbPath, drizzleMigrationsPath, ensureAppDir } from "../../app-dirs.ts";
import * as schema from "./schema.ts";

await ensureAppDir();

export const db = drizzle(dbPath, { schema });

const drizzleZipFile = Buffer.from(await file(drizzleZip).arrayBuffer());
const bundledSha1 = Buffer.from(SHA1.hash(drizzleZipFile).buffer).toString(
  "hex",
);
const fsSha1 = await readFile(`${drizzleMigrationsPath}/sha1`, "utf-8").catch(
  () => "none",
);
if (bundledSha1.toLowerCase() !== fsSha1.toLowerCase()) {
  console.log("Unpacking Drizzle migrations...");
  await rm(drizzleMigrationsPath, { recursive: true, force: true });

  const directory = await unzipper.Open.buffer(drizzleZipFile);
  await directory.extract({ path: dirname(drizzleMigrationsPath) });
  await writeFile(`${drizzleMigrationsPath}/sha1`, bundledSha1, "utf-8");
} else {
  console.log("Drizzle migrations are already up to date.");
}

migrate(db, {
  migrationsFolder: drizzleMigrationsPath,
});
