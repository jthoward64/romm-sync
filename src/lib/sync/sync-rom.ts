import { file, SHA1 } from "bun";
import { join } from "path";
import { retroArchPaths } from "../retroarch/paths";
import type { Rom } from "../Rom";
import { RommApiClient } from "../romm/RomM";

export async function doSync(rom: Rom) {
  if (rom.retroarchRom) {
    if (!rom.retroarchRom.rommFileId) {
      console.log(
        `ROM ${rom.rommRom.slug} (${rom.rommRom.id}) is not set for syncing.`
      );
      return;
    }

    const romFile = rom.rommRom.files.find(
      (f) => f.id === rom.retroarchRom?.rommFileId
    );

    if (!romFile) {
      console.log(
        `ROM file with ID ${rom.retroarchRom.rommFileId} not found for ROM ${rom.rommRom.slug} (${rom.rommRom.id}).`
      );
      return;
    }

    // If the rom does not have a retroarch path, we need to sync it
    const rommFileResponse =
      await RommApiClient.instance.romsApi.getRomContentApiRomsIdContentFileNameGetWithHttpInfo(
        {
          id: rom.rommRom.id,
          fileName: romFile.fileName,
        }
      );
    const rommFile = await rommFileResponse.getBodyAsFile();

    const retroarchPath =
      rom.retroarchRom.retroarchPath ||
      join(retroArchPaths.downloads, rommFile.name);
    const targetFile = file(retroarchPath);
    if (await targetFile.exists()) {
      const hash = SHA1.hash(targetFile);
      if (Buffer.from(hash.buffer).toString("hex") === romFile.sha1Hash) {
        console.log(
          `ROM ${rom.rommRom.slug} (${rom.rommRom.id}) is already synced.`
        );
        return;
      } else {
        console.log(
          `ROM ${rom.rommRom.slug} (${rom.rommRom.id}) has a different hash, re-syncing.`
        );
      }
    }
    await targetFile.write(rommFile.data);
  } else {
    console.log(
      `ROM ${rom.rommRom.slug} (${rom.rommRom.id}) does not have a RetroArch ROM entry, skipping sync.`
    );
  }
}
