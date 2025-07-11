import "use-server";

import type { SimpleRomSchema } from "@tajetaje/romm-api";
import { db } from "@/lib/database/db.js";
import { retroarchRomSchema } from "@/lib/database/schema.js";
import { Rom } from "@/lib/Rom.js";
import { RommApiClient } from "@/lib/romm/RomM.js";

export async function getAllRoms({
  onlySyncing = false,
  apiClient,
}: {
  onlySyncing?: boolean;
  apiClient: RommApiClient;
}) {
  const retroarchRoms = await db.select().from(retroarchRomSchema);
  let rommRoms: SimpleRomSchema[];
  if (!onlySyncing) {
    rommRoms = await apiClient.loadAllRoms();
  } else {
    rommRoms = await Promise.all(
      retroarchRoms
        .filter((rom) => rom.syncing)
        .map(async (rom) => {
          const rommRom = await apiClient.romsApi.getRomApiRomsIdGet({
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
