import { DbRetroArchRom } from "../lib/database/RetroArchRom";
import { getAllRoms } from "../lib/interface";
import type { Rom } from "../lib/Rom";
import { syncJob } from "../lib/sync/sync";
import type { ipcActions } from "./actions";

export const IpcServer = {
  async getDbRoms(): Promise<{ roms: Rom[] }> {
    return { roms: await getAllRoms() };
  },

  async setSync(arg: {
    id: number;
    enabled: boolean;
  }): Promise<{ rom: DbRetroArchRom }> {
    const rom = await DbRetroArchRom.getByRommRomId(arg.id);
    if (!rom) {
      console.log(`No ROM found with ID ${arg.id}. Creating a new entry.`);
      DbRetroArchRom.insert(
        arg.enabled,
        arg.id,
        null, // No retroarch path set yet
        null,
        null
      );
    } else {
      console.log(
        `Updating ROM with ID ${arg.id} to set syncing to ${arg.enabled}.`
      );
      rom.syncing = arg.enabled;
      if (!arg.enabled) {
        rom.rommFileId = null; // Clear the file ID if syncing is disabled
        rom.retroarchPath = null; // Clear the retroarch path if syncing is disabled
      }
      rom.update();
    }
    const newRom = await DbRetroArchRom.getByRommRomId(arg.id);
    if (!newRom) {
      throw new Error(`ROM with ID ${arg.id} not found after update.`);
    }

    await syncJob.trigger();

    return { rom: newRom };
  },

  async selectFile(arg: {
    romId: number;
    fileId: number | null;
  }): Promise<{ rom: DbRetroArchRom }> {
    const rom = await DbRetroArchRom.getByRommRomId(arg.romId);
    if (!rom) {
      throw new Error(`ROM with ID ${arg.romId} not found.`);
    }
    console.log(`Setting file ID ${arg.fileId} for ROM with ID ${arg.romId}.`);
    rom.rommFileId = arg.fileId;

    rom.update();

    await syncJob.trigger();

    return { rom };
  },

  async setTargetCore(arg: {
    romId: number;
    coreId: number | null;
  }): Promise<{ rom: DbRetroArchRom }> {
    const rom = await DbRetroArchRom.getByRommRomId(arg.romId);
    if (!rom) {
      throw new Error(`ROM with ID ${arg.romId} not found.`);
    }
    console.log(
      `Setting target core ID ${arg.coreId} for ROM with ID ${arg.romId}.`
    );
    rom.targetCoreId = arg.coreId;

    rom.update();

    await syncJob.trigger();

    return { rom };
  },

  async log(arg: { message: string }): Promise<void> {
    console.log(`[IPC LOG] ${arg.message}`);
  },
} satisfies Record<
  (typeof ipcActions)[number],
  (...args: any[]) => Promise<any>
>;

export type IpcResponse<T> =
  | (T & { ok: true })
  | { ok: false; error: { message: string } };

export type IpcAction = keyof typeof IpcServer;

export type IpcArgument<Action extends IpcAction> = Parameters<
  (typeof IpcServer)[Action]
>[0];
export type IpcResult<Action extends IpcAction> = Awaited<
  ReturnType<(typeof IpcServer)[Action]>
>;
