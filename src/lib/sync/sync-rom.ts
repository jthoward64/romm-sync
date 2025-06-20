import { RetroArchRomFile } from "../retroarch/RetroArch";
import type { Rom } from "../Rom";
import { RommApiClient } from "../romm/RomM";

export async function doSync(rom: Rom) {
  if (rom.retroarchRom) {
    if (!rom.retroarchRom.rommFileId) {
      return;
    }

    if (rom.retroarchRom.retroarchPath) {
      // If the rom has a retroarch path, it is probably already synced, but let's make sure
      const romFile = new RetroArchRomFile(rom.retroarchRom);
      if (await romFile.exists()) {
        return;
      }
    }

    // If the rom does not have a retroarch path, we need to sync it
    const rommFileResponse =
      await RommApiClient.instance.romsApi.getRomContentApiRomsIdContentFileNameGetWithHttpInfo(
        {
          id: rom.rommRom.id,
          fileName:
            rom.rommRom.files.find((f) => f.id === rom.retroarchRom?.rommFileId)
              ?.fileName || "",
        }
      );
    const rommFile = await rommFileResponse.getBodyAsFile();
  }
}
