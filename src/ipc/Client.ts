import { IpcActions, type IpcAction } from "./actions";
import type { IpcArgument, IpcResult } from "./Server";

export type IpcClientType = {
  [Action in IpcAction]: IpcArgument<Action> extends undefined
    ? (arg?: IpcArgument<Action>) => Promise<IpcResult<Action>>
    : (arg: IpcArgument<Action>) => Promise<IpcResult<Action>>;
};

function makeIpcClient(): IpcClientType {
  const client = {} as IpcClientType;
  for (const action of Object.values(IpcActions)) {
    client[action] = (arg) => sendEvent(action, arg);
  }
  return client;
}

export const IpcClient = makeIpcClient();
