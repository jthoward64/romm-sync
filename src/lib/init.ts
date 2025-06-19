import { DbAuth } from "./database/Auth";
import { DbRetroArchCore } from "./database/RetroArchCore";
import { LibRetroInfo } from "./retroarch/libretro-info/LibretroInfo";
import { retroArchPaths } from "./retroarch/paths";

const infoFiles = await LibRetroInfo.loadAll(retroArchPaths.info);

for (const info of infoFiles) {
  await DbRetroArchCore.getOrCreateFromInfo(info);
}

await DbAuth.initFromEnv();
