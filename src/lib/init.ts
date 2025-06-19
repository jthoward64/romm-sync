import { DbAuth } from "./database/Auth";
import { DbRetroArchCore } from "./database/RetroArchCore";
import { DbRetroArchRom } from "./database/RetroArchRom";
import { LibRetroInfo } from "./retroarch/libretro-info/LibretroInfo";
import { retroArchPaths } from "./retroarch/paths";
import { RommApiClient } from "./romm/RomM";

const infoFiles = await LibRetroInfo.loadAll(retroArchPaths.info);

for (const info of infoFiles) {
  await DbRetroArchCore.getOrCreateFromInfo(info);
}

await DbAuth.initFromEnv();

const dbAuth = await DbAuth.get();
if (!dbAuth) {
  throw new Error("No authentication credentials found in the database.");
}
RommApiClient.init(dbAuth);

const roms = await RommApiClient.instance.loadAllRoms();
if (!roms) {
  throw new Error("Failed to load ROMs from the API.");
}
console.log(`Loaded ${roms.length} ROMs from the API.`);

for (const rom of roms) {
  rom.platformId;
  DbRetroArchRom.insert();
}
