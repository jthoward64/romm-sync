import { Temporal } from "@js-temporal/polyfill";
import { stat } from "node:fs/promises";
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
}

export class RetroArchSave extends RetroArchFile {
  constructor(path: string) {
    super(path);
  }
}

export class RetroArchState extends RetroArchFile {
  constructor(path: string) {
    super(path);
  }
}

export class RetroArchRom extends RetroArchFile {
  constructor(path: string) {
    super(path);
  }

  async getSize(): Promise<number> {
    const statResult = await stat(this.path);
    return statResult.size;
  }
}
