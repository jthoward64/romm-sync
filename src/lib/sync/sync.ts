import { Cron } from "croner";
import { getAllRoms } from "../interface.ts";
import { doSync } from "./sync-rom.ts";

export const syncJob = new Cron(
  // Every 30 minutes
  "0,30 * * * *",
  async () => {
    const roms = await getAllRoms({ onlySyncing: true });
    console.log(`Sync job triggered. Found ${roms.length} ROMs to sync.`);
    for (const rom of roms) {
      if (rom.retroarchRom?.syncing) {
        try {
          await doSync(rom);
        } catch (error) {
          console.error(
            `Failed to sync ROM ${rom.rommRom.slug} (${rom.rommRom.id}):`,
            error,
          );
        }
      }
    }
  },
);
