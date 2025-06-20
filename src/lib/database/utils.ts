import type { PlatformSchema } from "@tajetaje/romm-api";
import { stat } from "node:fs/promises";
import type { LibRetroInfo } from "../retroarch/libretro-info/LibretroInfo";
import { rommSystemForRetroarchInfo } from "../retroarch/mappings";
import { CorePaths, retroArchPaths } from "../retroarch/paths";
import { db } from "./db";

/**
 * Retrieves a core from the database based on the provided LibRetroInfo and platforms.
 * If the core does not exist, it creates a new entry in the database.
 *
 * @param platforms - An array of PlatformSchema objects representing available platforms.
 * @returns A promise that resolves to the DbRetroArchCore instance or null if creation fails.
 */
export async function getOrCreateCoreFromInfo(
  info: LibRetroInfo,
  platforms: PlatformSchema[]
) {
  const existing = await db.retroarchCore.findUnique({
    where: { fileName: info.infoFile.name },
  });
  if (existing) {
    return existing;
  }
  const { systemId, systemName } = info;
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

  let system = await db.retroarchSystem.findUnique({
    where: { systemId },
  });

  if (!system) {
    const rommSystem = rommSystemForRetroarchInfo(info, platforms);

    if (!rommSystem) {
      if (rommSystem === undefined) {
        console.error(
          `No matching ROMM system found for ${systemId}. Cannot parse system.`
        );
      }
      return null;
    }

    system = await db.retroarchSystem.create({
      data: {
        systemId,
        rommSystemId: rommSystem.id === -1 ? null : rommSystem.id,
        rommSlug: rommSystem.slug,
      },
    });
  }

  if (!system) {
    console.error(
      `Failed to retrieve system ID for ${systemId} after insertion.`
    );
    return null;
  }

  // this.insert(info.infoFile.name, exists, system.id);
  return db.retroarchCore.create({
    data: {
      fileName: info.infoFile.name,
      downloaded: exists,
      retroarchSystem: {
        connect: {
          systemId: system.systemId,
        },
      },
    },
  });
}
