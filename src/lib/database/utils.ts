import { stat } from "node:fs/promises";
import type { PlatformSchema } from "@tajetaje/romm-api";
import type { LibRetroInfo } from "../retroarch/libretro-info/LibretroInfo.ts";
import { rommSystemForRetroarchInfo } from "../retroarch/mappings.ts";
import { CorePaths, retroArchPaths } from "../retroarch/paths.ts";
import { db } from "./db.ts";
import { retroarchCore, retroarchSystemSchema } from "./schema.ts";

/**
 * Retrieves a core from the database based on the provided LibRetroInfo and platforms.
 * If the core does not exist, it creates a new entry in the database.
 *
 * @param platforms - An array of PlatformSchema objects representing available platforms.
 * @returns A promise that resolves to the DbRetroArchCore instance or null if creation fails.
 */
export async function getOrCreateCoreFromInfo(
  info: LibRetroInfo,
  platforms: PlatformSchema[],
) {
  const existing = await db.query.retroarchCore.findFirst({
    where: (table, { eq }) => eq(table.fileName, info.infoFile.name),
  });
  if (existing) {
    return existing;
  }
  const { systemId } = info;
  const paths = CorePaths.fromInfo(retroArchPaths, info);
  if (!paths) {
    return null;
  }

  const exists = await stat(paths.core)
    .then(() => true)
    .catch((error) => {
      if (error.code === "ENOENT") {
        return false;
      } else {
        console.error(`Error checking core file ${paths.core}:`, error);
        throw error;
      }
    });

  if (!systemId) {
    return null;
  }

  let system = await db.query.retroarchSystemSchema.findFirst({
    where: (table, { eq }) => eq(table.systemId, systemId),
  });

  if (!system) {
    const rommSystem = rommSystemForRetroarchInfo(info, platforms);

    if (!rommSystem) {
      if (rommSystem === undefined) {
        console.error(
          `No matching ROMM system found for ${systemId}. Cannot parse system.`,
        );
      }
      return null;
    }

    system = await db
      .insert(retroarchSystemSchema)
      .values({
        systemId,
        rommSystemId: rommSystem.id === -1 ? null : rommSystem.id,
        rommSlug: rommSystem.slug,
      })
      .returning()
      .then((rows) => rows[0]);
  }

  if (!system) {
    console.error(
      `Failed to retrieve system ID for ${systemId} after insertion.`,
    );
    return null;
  }

  // this.insert(info.infoFile.name, exists, system.id);
  return db.insert(retroarchCore).values({
    fileName: info.infoFile.name,
    downloaded: exists,
    retroarchSystemId: system.id,
  });
}
