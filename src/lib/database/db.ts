import { Database } from "bun:sqlite";
import { LibRetroInfo } from "../retroarch/libretro-info/LibretroInfo";
import { retroArchPaths } from "../retroarch/paths";
import { DbAuth } from "./Auth";
import { DbRetroArchCore } from "./RetroArchCore";
import { DbRetroArchRom } from "./RetroArchRom";
import { DbRetroArchSystem } from "./RetroArchSystem";

export const db = new Database(":memory:", {
  create: true,
  readwrite: true,
  strict: true,
});

const schema = `
${DbAuth.schema}
${DbRetroArchSystem.schema}
${DbRetroArchCore.schema}
${DbRetroArchRom.schema}
`;

db.exec(schema);

const infoFiles = await LibRetroInfo.loadAll(retroArchPaths.info);

for (const info of infoFiles) {
  await DbRetroArchCore.getOrCreateFromInfo(info);
}

await DbAuth.initFromEnv();
