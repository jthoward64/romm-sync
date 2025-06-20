import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { db } from "./database/db";
import { getOrCreateCoreFromInfo } from "./database/utils";
import { LibRetroInfo } from "./retroarch/libretro-info/LibretroInfo";
import { retroArchPaths } from "./retroarch/paths";
import { RommApiClient } from "./romm/RomM";

const dbAuth = await db.auth.findFirst();
if (!dbAuth) {
  throw new Error("No authentication credentials found in the database.");
}
RommApiClient.init(dbAuth);

const infoFiles = await LibRetroInfo.loadAll(retroArchPaths.info);

const platforms =
  await RommApiClient.instance.platformsApi.getSupportedPlatformsApiPlatformsSupportedGet();
for (const info of infoFiles) {
  await getOrCreateCoreFromInfo(info, platforms);
}

const roms = await RommApiClient.instance.loadAllRoms();
if (!roms) {
  throw new Error("Failed to load ROMs from the API.");
}

const downloadedRoms = await readdir(retroArchPaths.downloads);
for (const rom of roms) {
  const match = downloadedRoms.find((downloadedFile) =>
    rom.files.some((remoteFile) => remoteFile.fileName === downloadedFile)
  );

  db.retroarchRom.upsert({
    where: { rommRomId: rom.id },
    create: {
      rommRomId: rom.id,
      retroarchPath: (match && join(retroArchPaths.downloads, match)) || null,
      rommFileId: rom.files.find((file) => file.fileName === match)?.id || null,
    },
    update: {
      retroarchPath: (match && join(retroArchPaths.downloads, match)) || null,
      rommFileId: rom.files.find((file) => file.fileName === match)?.id || null,
    },
  });
}
