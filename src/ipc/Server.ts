import { getRetroarchRoms } from "../lib/retroarch/interface";
import type { RetroArchRom } from "../lib/retroarch/RetroArch";
import type { IpcAction } from "./actions";

type IpcServerType = {
  [Action in IpcAction]: (arg?: unknown) => Promise<unknown>;
};

export class IpcServer implements IpcServerType {
  getDbRoms(): Promise<RetroArchRom[]> {
    return getRetroarchRoms();
  }
}

export type IpcArgument<Action extends IpcAction> = Parameters<
  IpcServer[Action]
>[0];
export type IpcResult<Action extends IpcAction> = ReturnType<IpcServer[Action]>;
