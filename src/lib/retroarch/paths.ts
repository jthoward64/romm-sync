import { $ } from "bun";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { LibRetroInfo } from "./libretro-info/LibretroInfo";

async function getLibRetroShare(): Promise<string | null> {
  // "${flatpak info --show-location org.libretro.RetroArch}/share/libretro/" or "/usr/share/libretro/"
  try {
    const output = await $`flatpak info --show-location org.libretro.RetroArch`
      .text()
      .then((path) => path.trim());
    if (output) {
      return join(output, "files", "share", "libretro/");
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
  return null;
}

async function getRetroArchConfig(): Promise<string | null> {
  // ~/.var/app/org.libretro.RetroArch/config/retroarch/ or ~/.config/retroarch/
  const flatpakConfigPath = join(
    process.env.HOME || "",
    ".var",
    "app",
    "org.libretro.RetroArch",
    "config",
    "retroarch"
  );
  const systemConfigPath = join(process.env.HOME || "", ".config", "retroarch");
  try {
    const flatpakStat = await stat(flatpakConfigPath);
    if (flatpakStat.isDirectory()) {
      return flatpakConfigPath;
    }
  } catch (error) {
    console.debug(
      "Flatpak config path not found, falling back to system config path."
    );
  }

  try {
    const systemStat = await stat(systemConfigPath);
    if (systemStat.isDirectory()) {
      return systemConfigPath;
    }
  } catch (error) {
    console.debug("System config path not found.");
  }

  return null;
}

export class RetroArchPaths {
  constructor(public readonly share: string, public readonly data: string) {}

  get info(): string {
    return join(this.share, "info");
  }

  get thumbnails(): string {
    return join(this.data, "thumbnails");
  }
  get cores(): string {
    return join(this.data, "cores");
  }
  get playlists(): string {
    return join(this.data, "playlists");
  }
  get config(): string {
    return join(this.data, "config");
  }
  get saves(): string {
    return join(this.data, "saves");
  }
  get states(): string {
    return join(this.data, "states");
  }
  get system(): string {
    return join(this.data, "system");
  }
  get downloads(): string {
    return join(this.data, "downloads");
  }

  static async getPaths(): Promise<RetroArchPaths> {
    const share = await getLibRetroShare();
    if (!share) {
      throw new Error("Could not find libretro share directory.");
    }

    const config = await getRetroArchConfig();
    if (!config) {
      throw new Error("Could not find RetroArch config directory.");
    }

    return new RetroArchPaths(share, config);
  }
}

export class CorePaths {
  constructor(
    protected readonly paths: RetroArchPaths,
    public readonly coreUnderscoreName: string,
    public readonly coreName: string
  ) {}

  static fromInfo(
    paths: RetroArchPaths,
    coreInfo: LibRetroInfo
  ): CorePaths | null {
    if (!coreInfo.coreName) {
      return null;
    }
    return new CorePaths(paths, coreInfo.infoFile.name, coreInfo.coreName);
  }

  get info(): string {
    return join(this.paths.info, `${this.coreUnderscoreName}.info`);
  }

  get core(): string {
    return join(this.paths.cores, `${this.coreUnderscoreName}.so`);
  }

  get config(): string {
    return join(this.paths.config, this.coreName);
  }

  get saves(): string {
    return join(this.paths.saves, this.coreName);
  }

  get states(): string {
    return join(this.paths.states, this.coreName);
  }

  get system(): string {
    return join(this.paths.system, this.coreName);
  }
}

export const retroArchPaths = await RetroArchPaths.getPaths();
