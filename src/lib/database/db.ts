import { Database } from "bun:sqlite";
import { LibRetroInfo } from "../retroarch/libretro-info/LibretroInfo";
import { retroArchPaths } from "../retroarch/paths";
import { Auth as DbAuth } from "./Auth";
import { RetroArchCore as DbRetroArchCore } from "./RetroArchCore";
import { RetroArchRom as DbRetroArchRom } from "./RetroArchRom";
import { RetroArchSystem as DbRetroArchSystem } from "./RetroArchSystem";

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
