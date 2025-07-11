import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/lib/database/db.js";
import { retroarchRomSchema } from "@/lib/database/schema.js";
import { getOrCreateCoreFromInfo } from "@/lib/database/utils.js";
import { LibRetroInfo } from "@/lib/retroarch/libretro-info/LibretroInfo.js";
import { retroArchPaths } from "@/lib/retroarch/paths.js";
import { RommApiClient } from "@/lib/romm/RomM.js";
import { syncJob } from "@/lib/sync/sync.js";

export async function loadFromRomm(): Promise<boolean> {
  const instance = await RommApiClient.getInstance();

  if (!instance) {
    return false;
  }

  console.log("Syncing RomM data");

  const infoFiles = await LibRetroInfo.loadAll(retroArchPaths.info);

  const platforms =
    await instance.platformsApi.getSupportedPlatformsApiPlatformsSupportedGet();
  for (const info of infoFiles) {
    await getOrCreateCoreFromInfo(info, platforms);
  }

  console.log("Loaded platforms from RomM");

  const roms = await instance.loadAllRoms();
  if (!roms) {
    throw new Error("Failed to load ROMs from the API.");
  }

  const downloadedRoms = await readdir(retroArchPaths.downloads);
  for (const rom of roms) {
    const match = downloadedRoms.find((downloadedFile) =>
      rom.files.some((remoteFile) => remoteFile.fileName === downloadedFile)
    );
    const existingRom = await db
      .select()
      .from(retroarchRomSchema)
      .where(eq(retroarchRomSchema.rommRomId, rom.id))
      .limit(1);
    if (existingRom.length > 0) {
      await db
        .update(retroarchRomSchema)
        .set({
          retroarchPath: match ? join(retroArchPaths.downloads, match) : null,
          rommFileId:
            rom.files.find((file) => file.fileName === match)?.id ||
            retroarchRomSchema.rommFileId,
        })
        .where(eq(retroarchRomSchema.rommRomId, rom.id));
    } else {
      await db.insert(retroarchRomSchema).values({
        rommRomId: rom.id,
        retroarchPath: match ? join(retroArchPaths.downloads, match) : null,
        rommFileId:
          rom.files.find((file) => file.fileName === match)?.id || null,
      });
    }
  }

  console.log("Synced roms from RomM");

  syncJob.resume();
  if (!syncJob.previousRun()) {
    console.log("Sync job not run yet, triggering immediately.");
    await syncJob.trigger();
  }

  return true;
}
