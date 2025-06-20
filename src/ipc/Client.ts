import { ipcActions } from "./actions";
import type { IpcAction, IpcArgument, IpcResponse, IpcResult } from "./Server";

export type IpcClientType = {
  [Action in IpcAction]: IpcArgument<Action> extends undefined
    ? (arg?: IpcArgument<Action>) => Promise<IpcResponse<IpcResult<Action>>>
    : (arg: IpcArgument<Action>) => Promise<IpcResponse<IpcResult<Action>>>;
};

function makeIpcClient(): IpcClientType {
  const client = {} as IpcClientType;
  for (const action of ipcActions) {
    // @ts-ignore
    client[action] = (arg) => sendEvent(action, arg);
  }
  return client;
}

export const IpcClient = makeIpcClient();
