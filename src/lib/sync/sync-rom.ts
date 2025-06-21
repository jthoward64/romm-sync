import { join } from "node:path";
import { HttpMethod } from "@tajetaje/romm-api";
import { file, SHA1 } from "bun";
import type { Rom } from "../Rom.ts";
import { retroArchPaths } from "../retroarch/paths.ts";
import { RommApiClient } from "../romm/RomM.ts";

export async function doSync(rom: Rom) {
  if (rom.retroarchRom) {
    if (!rom.retroarchRom.rommFileId) {
      console.log(
        `ROM ${rom.rommRom.slug} (${rom.rommRom.id}) is not set for syncing.`,
      );
      return;
    }

    const romFile = rom.rommRom.files.find(
      (f) => f.id === rom.retroarchRom?.rommFileId,
    );

    if (!romFile) {
      console.log(
        `ROM file with ID ${rom.retroarchRom.rommFileId} not found for ROM ${rom.rommRom.slug} (${rom.rommRom.id}).`,
      );
      return;
    }

    // If the rom does not have a retroarch path, we need to sync it
    // We have to hack around the fact that openapi-generator incorrectly
    // parses the `getRomContentApiRomsIdContentFileNameGet` method
    const downloadResponse = await RommApiClient.instance.makeRequest(
      HttpMethod.GET,
      `/api/roms/${rom.rommRom.id}/content/${encodeURI(romFile.fileName)}`,
    );
    const downloadedFile = await downloadResponse.getBodyAsFile();

    const retroarchPath =
      rom.retroarchRom.retroarchPath ||
      join(retroArchPaths.downloads, romFile.fileName);
    const targetFile = file(retroarchPath);
    if (await targetFile.exists()) {
      const hash = SHA1.hash(await targetFile.arrayBuffer());
      if (Buffer.from(hash.buffer).toString("hex") === romFile.sha1Hash) {
        console.log(
          `ROM ${rom.rommRom.slug} (${rom.rommRom.id}) is already synced.`,
        );
        return;
      } else {
        console.log(
          `ROM ${rom.rommRom.slug} (${rom.rommRom.id}) has a different hash, re-syncing.`,
        );
      }
    }
    await targetFile.write(downloadedFile.data);
  } else {
    console.log(
      `ROM ${rom.rommRom.slug} (${rom.rommRom.id}) does not have a RetroArch ROM entry, skipping sync.`,
    );
  }
}
