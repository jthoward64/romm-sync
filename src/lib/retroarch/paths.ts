import { $ } from "bun";
import { stat } from "node:fs/promises";
import { join } from "node:path";

export async function getLibRetroShare(): Promise<string | null> {
  // "${flatpak info --show-location org.libretro.RetroArch}/share/libretro/" or "/usr/share/libretro/"
  try {
    const output = await $`flatpak info --show-location org.libretro.RetroArch`.text().then((path) => path.trim());
    if (output) {
      return join(output, 'files/share/libretro/');
    }
  } catch (error) {
    console.debug("Flatpak not found, falling back to system paths.");
  }
  try {
    const statResult = await stat("/usr/share/libretro/");
    if (statResult.isDirectory()) {
      return "/usr/share/libretro/";
    }
  } catch (error) {
    console.debug("System path /usr/share/libretro/ not found.");
  }
  return null
}