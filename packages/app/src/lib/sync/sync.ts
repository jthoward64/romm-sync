import "use-server";

import { Cron } from "croner";
import { getAllRoms } from "../interface.js";
import { doSync } from "./sync-rom.js";
import { RommApiClient } from "../romm/RomM.js";

export const syncJob = new Cron(
  // Every 30 minutes
  "0,30 * * * *",
  async () => {
    const apiClient = await RommApiClient.getInstance();

    if (!apiClient) {
      console.warn("RommApiClient is not initialized. Sync job skipped.");
      return;
    }

    const roms = await getAllRoms({ onlySyncing: true, apiClient });
    console.log(`Sync job triggered. Found ${roms.length} ROMs to sync.`);
    for (const rom of roms) {
      if (rom.retroarchRom?.syncing) {
        try {
          await doSync(rom, apiClient);
        } catch (error) {
          console.error(
            `Failed to sync ROM ${rom.rommRom.slug} (${rom.rommRom.id}):`,
            error
          );
        }
      } else {
        console.log(
          `ROM ${rom.rommRom.slug} (${rom.rommRom.id}) is not set for syncing, skipping.`
        );
      }
    }
  },
  { paused: true }
);
