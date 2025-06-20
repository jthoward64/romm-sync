import { eq } from "drizzle-orm";
import { db } from "../lib/database/db.ts";
import { authSchema, retroarchRomSchema } from "../lib/database/schema.ts";
import { getAllRoms } from "../lib/interface.ts";
import type { Rom } from "../lib/Rom.ts";
import { syncJob } from "../lib/sync/sync.ts";
import type { ipcActions } from "./actions.ts";

export const IpcServer = {
  async getDbRoms(): Promise<{ roms: Rom[] }> {
    return { roms: await getAllRoms() };
  },

  async setSync(arg: {
    id: number;
    enabled: boolean;
  }): Promise<{ rom: typeof retroarchRomSchema.$inferSelect }> {
    // const rom = await DbRetroArchRom.getByRommRomId(arg.id);
    const rom = await db.query.retroarchRom.findFirst({
      where: (table, { eq }) => eq(table.rommRomId, arg.id),
    });
    if (!rom) {
      console.log(`No ROM found with ID ${arg.id}. Creating a new entry.`);
      await db.insert(retroarchRomSchema).values({
        syncing: arg.enabled,
        rommRomId: arg.id,
      });
    } else {
      console.log(
        `Updating ROM with ID ${arg.id} to set syncing to ${arg.enabled}.`,
      );
      await db
        .update(retroarchRomSchema)
        .set({
          syncing: arg.enabled,
          rommFileId: arg.enabled ? retroarchRomSchema.rommFileId : null,
          retroarchPath: arg.enabled ? retroarchRomSchema.retroarchPath : null,
        })
        .where(eq(retroarchRomSchema.rommRomId, arg.id));
    }
    const newRom = await db.query.retroarchRom.findFirst({
      where: (table, { eq }) => eq(table.rommRomId, arg.id),
    });
    if (!newRom) {
      throw new Error(`ROM with ID ${arg.id} not found after update.`);
    }

    await syncJob.trigger();

    return { rom: newRom };
  },

  async selectFile(arg: {
    romId: number;
    fileId: number | null;
  }): Promise<{ rom: typeof retroarchRomSchema.$inferSelect }> {
    const rom = await DbRetroArchRom.getByRommRomId(arg.romId);
    console.log(`Setting file ID ${arg.fileId} for ROM with ID ${arg.romId}.`);
    rom.rommFileId = arg.fileId;

    rom.update();

    await syncJob.trigger();

    return { rom };
  },

  async setTargetCore(arg: {
    romId: number;
    coreId: number | null;
  }): Promise<{ rom: typeof retroarchRomSchema.$inferSelect }> {
    const rom = await DbRetroArchRom.getByRommRomId(arg.romId);
    if (!rom) {
      throw new Error(`ROM with ID ${arg.romId} not found.`);
    }
    console.log(
      `Setting target core ID ${arg.coreId} for ROM with ID ${arg.romId}.`,
    );
    rom.targetCoreId = arg.coreId;

    rom.update();

    await syncJob.trigger();

    return { rom };
  },

  async log(arg: { message: string }): Promise<void> {
    console.log(`[IPC LOG] ${arg.message}`);
  },

  async getSettings(): Promise<{
    settings: {
      username: string;
      passwordSet: boolean;
      origin: string;
    } | null;
  }> {
    const auth = await DbAuth.get();
    if (!auth) {
      return { settings: null };
    }
    return {
      settings: {
        username: auth.username,
        passwordSet: auth.password !== null,
        origin: auth.origin,
      },
    };
  },

  async setSettings(arg: {
    username: string;
    password: string | null;
    origin: string;
  }): Promise<void> {
    const auth = await db.query.authSchema.findFirst({
      where: (table, { eq }) => eq(table.origin, arg.origin),
    });
    if (!auth) {
      if (!arg.username || !arg.password || !arg.origin) {
        throw new Error("Username, password, and origin must be provided.");
      }
      // DbAuth.set(arg.username, arg.password, arg.origin);
      await db.insert(authSchema).values({
        username: arg.username,
        password: arg.password,
        origin: arg.origin,
      });
    } else {
      // DbAuth.set(
      //   arg.username,
      //   arg.password || auth.password, // Keep existing password if null or empty
      //   arg.origin,
      // );
      await db.update(authSchema).set({
        username: arg.username,
        password: arg.password || authSchema.password, // Keep existing password if null or empty
        origin: arg.origin,
      });
    }
  },
} satisfies Record<
  (typeof ipcActions)[number],
  (...args: unknown[]) => Promise<unknown>
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
