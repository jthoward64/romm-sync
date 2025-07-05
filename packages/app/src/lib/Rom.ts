import type { SimpleRomSchema } from "@tajetaje/romm-api";
import type { retroarchRomSchema } from "./database/schema.js";

export class Rom {
  public retroarchRom?: typeof retroarchRomSchema.$inferSelect;

  constructor(
    public readonly rommRom: SimpleRomSchema,
    downloaded: {
      retroarch?: typeof retroarchRomSchema.$inferSelect;
    }
  ) {
    this.retroarchRom = downloaded.retroarch;
  }
}
