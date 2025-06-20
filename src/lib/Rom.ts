import type { RetroarchRom } from "@prisma/client";
import type { SimpleRomSchema } from "@tajetaje/romm-api";

export class Rom {
  public retroarchRom?: RetroarchRom;

  constructor(
    public readonly rommRom: SimpleRomSchema,
    downloaded: {
      retroarch?: RetroarchRom;
    }
  ) {
    this.retroarchRom = downloaded.retroarch;
  }
}
