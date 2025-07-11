import "use-server";

import { stat } from "node:fs/promises";
import { Temporal } from "@js-temporal/polyfill";
import type { retroarchRomSchema } from "../database/schema.js";
import type { LibRetroInfo } from "./libretro-info/LibretroInfo.js";

export class RetroArchCore {
  constructor(
    public readonly info: LibRetroInfo
    // private readonly paths: CorePaths,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).code === "ENOENT") {
        return false;
      }
      throw error;
    }
  }
}

export class RetroArchSaveFile extends RetroArchFile {}

export class RetroArchStateFile extends RetroArchFile {}

export class RetroArchRomFile extends RetroArchFile {
  constructor(retroarch: typeof retroarchRomSchema.$inferSelect) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
