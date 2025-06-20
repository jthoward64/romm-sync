export type IpcResponse<T> =
  | (T & { ok: true })
  | { ok: false; error: { message: string } };

export const IpcActions = { getDbRoms: "getDbRoms" } as const;
export type IpcAction = (typeof IpcActions)[keyof typeof IpcActions];
