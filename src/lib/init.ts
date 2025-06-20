import { readdir } from "node:fs/promises";
import { DbAuth } from "./database/Auth";
import { DbRetroArchCore } from "./database/RetroArchCore";
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
console.log(`Loaded ${roms.length} ROMs from the API.`);

const downloadedRoms = await readdir(retroArchPaths.downloads);
for (const rom of roms) {
  const match = downloadedRoms.find((downloadedFile) =>
    rom.files.some((remoteFile) => remoteFile.fileName === downloadedFile)
  );
  if (match) {
    console.log(`Found downloaded ROM: ${match}`);
  } else {
    console.log(`ROM not found in downloads: ${rom.id}`);
  }

  // await DbRetroArchRom.insert();
}
