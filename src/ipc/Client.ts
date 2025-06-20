import {
  IpcServer,
  type IpcAction,
  type IpcArgument,
  type IpcResult,
} from "./Server";

export type IpcClientType = {
  [Action in IpcAction]: IpcArgument<Action> extends undefined
    ? (arg?: IpcArgument<Action>) => Promise<IpcResult<Action>>
    : (arg: IpcArgument<Action>) => Promise<IpcResult<Action>>;
};

function makeIpcClient(): IpcClientType {
  const client = {} as IpcClientType;
  for (const action of Object.keys(IpcServer) as IpcAction[]) {
    // @ts-ignore
    client[action] = (arg) => sendEvent(action, arg);
  }
  return client;
}

export const IpcClient = makeIpcClient();
