import { stat } from "node:fs/promises";
import { Temporal } from "@js-temporal/polyfill";
import type { RetroarchRom } from "@prisma/client";
import type { LibRetroInfo } from "./libretro-info/LibretroInfo.ts";
import type { CorePaths } from "./paths.ts";

export class RetroArchCore {
  constructor(
    public readonly info: LibRetroInfo,
    private readonly paths: CorePaths,
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
      // biome-ignore lint/suspicious/noExplicitAny: It's fine
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
  constructor(retroarch: RetroarchRom) {
    // biome-ignore lint/style/noNonNullAssertion: Checked below
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
