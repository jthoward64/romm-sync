import { DbRetroArchRom } from "./database/RetroArchRom";
import { Rom } from "./Rom";
import { RommApiClient } from "./romm/RomM";

export async function getAllRoms() {
  const rommRoms = await RommApiClient.instance.loadAllRoms();
  const retroarchRoms = await DbRetroArchRom.all();

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
