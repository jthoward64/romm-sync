import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { DbAuth } from "./database/Auth";
import { DbRetroArchCore } from "./database/RetroArchCore";
import { DbRetroArchRom } from "./database/RetroArchRom";
import { LibRetroInfo } from "./retroarch/libretro-info/LibretroInfo";
import { retroArchPaths } from "./retroarch/paths";
import { RommApiClient } from "./romm/RomM";

await DbAuth.initFromEnv();

const dbAuth = await DbAuth.get();
if (!dbAuth) {
  throw new Error("No authentication credentials found in the database.");
}
RommApiClient.init(dbAuth);

const infoFiles = await LibRetroInfo.loadAll(retroArchPaths.info);

const platforms =
  await RommApiClient.instance.platformsApi.getSupportedPlatformsApiPlatformsSupportedGet();
for (const info of infoFiles) {
  await DbRetroArchCore.getOrCreateFromInfo(info, platforms);
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

  const existingRom = await DbRetroArchRom.getByRommRomId(rom.id);

  if (existingRom) {
    existingRom.retroarchPath =
      (match && join(retroArchPaths.downloads, match)) || null;
    existingRom.update();
  } else {
    DbRetroArchRom.insert(
      false,
      rom.id,
      (match && join(retroArchPaths.downloads, match)) || null,
      rom.files.find((file) => file.fileName === match)?.id || null,
      null
    );
  }
}
