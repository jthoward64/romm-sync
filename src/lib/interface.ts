import type { SimpleRomSchema } from "@tajetaje/romm-api";
import { DbRetroArchRom } from "./database/RetroArchRom";
import { Rom } from "./Rom";
import { RommApiClient } from "./romm/RomM";

export async function getAllRoms({
  onlySyncing = false,
}: {
  onlySyncing?: boolean;
} = {}) {
  const retroarchRoms = await DbRetroArchRom.all();
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
