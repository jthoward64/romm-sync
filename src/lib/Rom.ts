import type { SimpleRomSchema } from "@tajetaje/romm-api";
import type { DbRetroArchRom } from "./database/RetroArchRom";

export class Rom {
  public retroarchRom?: DbRetroArchRom;

  constructor(
    public readonly rommRom: SimpleRomSchema,
    downloaded: {
      retroarch?: DbRetroArchRom;
    }
  ) {
    this.retroarchRom = downloaded.retroarch;
  }
}
