import type { SimpleRomSchema } from "@tajetaje/romm-api";
import { db } from "./database/db.js";
import { retroarchRomSchema } from "./database/schema.js";
import { Rom } from "./Rom.js";
import { RommApiClient } from "./romm/RomM.js";

export async function getAllRoms({
  onlySyncing = false,
}: {
  onlySyncing?: boolean;
} = {}) {
  const retroarchRoms = await db.select().from(retroarchRomSchema);
  let rommRoms: SimpleRomSchema[];
  if (!onlySyncing) {
    rommRoms = await RommApiClient.instance.loadAllRoms();
  } else {
    rommRoms = await Promise.all(
      retroarchRoms
        .filter((rom) => rom.syncing)
        .map(async (rom) => {
          const rommRom =
            await RommApiClient.instance.romsApi.getRomApiRomsIdGet({
              id: rom.rommRomId,
            });
          return rommRom;
        })
    );
  }

  return Promise.all(
    rommRoms.map(async (rommRom) => {
      const dbRom = retroarchRoms.find(
        (dbRom) => dbRom.rommRomId === rommRom.id
      );

      return new Rom(rommRom, {
        retroarch: dbRom,
      });
    })
  );
}
