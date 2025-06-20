import { Temporal } from "@js-temporal/polyfill";
import { stat } from "node:fs/promises";
import type { DbRetroArchRom } from "../database/RetroArchRom";
import type { LibRetroInfo } from "./libretro-info/LibretroInfo";
import type { CorePaths } from "./paths";

export class RetroArchCore {
  constructor(
    public readonly info: LibRetroInfo,
    private readonly paths: CorePaths
  ) {}
}

export class RetroArchFile {
  constructor(public readonly path: string) {}

  async read(): Promise<ArrayBuffer> {
    return await Bun.file(this.path).arrayBuffer();
  }

  async replace(data: ArrayBuffer): Promise<void> {
    await Bun.write(this.path, data);
  }

  async getUpdated(): Promise<Temporal.Instant> {
    const statResult = await stat(this.path);
    return Temporal.Instant.fromEpochMilliseconds(statResult.mtimeMs);
  }

  async exists(): Promise<boolean> {
    try {
      await stat(this.path);
      return true;
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        return false;
      }
      throw error;
    }
  }
}

export class RetroArchSaveFile extends RetroArchFile {
  constructor(path: string) {
    super(path);
  }
}

export class RetroArchStateFile extends RetroArchFile {
  constructor(path: string) {
    super(path);
  }
}

export class RetroArchRomFile extends RetroArchFile {
  constructor(retroarch: DbRetroArchRom) {
    super(retroarch.retroarchPath!);

    if (!retroarch.retroarchPath) {
      throw new Error("RetroArchRom must have a valid path");
    }
  }

  async getSize(): Promise<number> {
    const statResult = await stat(this.path);
    return statResult.size;
  }
}
