import { DbRetroArchRom } from "../lib/database/RetroArchRom";
import { getRetroarchRoms } from "../lib/retroarch/interface";
import type { RetroArchRom } from "../lib/retroarch/RetroArch";
import type { ipcActions } from "./actions";

export const IpcServer = {
  async getDbRoms(): Promise<RetroArchRom[]> {
    return getRetroarchRoms();
  },

  async setSync(arg: { id: number; enabled: boolean }): Promise<void> {
    const rom = await DbRetroArchRom.get(arg.id);
    if (!rom) {
      throw new Error(`RetroArchRom with id ${arg.id} not found`);
    }
    rom.syncing = arg.enabled;
    rom.update();
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
