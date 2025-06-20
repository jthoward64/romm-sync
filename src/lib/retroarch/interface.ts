import { DbRetroArchRom } from "../database/RetroArchRom";
import { RommApiClient } from "../romm/RomM";
import { RetroArchRom } from "./RetroArch";

export async function getRetroarchRoms(): Promise<RetroArchRom[]> {
  const dbRoms = await DbRetroArchRom.all();

  return Promise.all(
    dbRoms.map(async (dbRom) => {
      const rommRom = await RommApiClient.instance.romsApi.getRomApiRomsIdGet({
        id: dbRom.rommRomId,
      });

      return new RetroArchRom(dbRom, rommRom);
    })
  );
}
