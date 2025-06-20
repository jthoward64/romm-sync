import { file } from "bun";
import { Webview } from "webview-bun";
import { IpcServer, type IpcAction, type IpcArgument, type IpcResponse, type IpcResult } from "../ipc/Server";
import html from "./dist/index.html" with { type: "file" };

const webview = new Webview();

webview.setHTML(await file(html).text());

console.log("Webview initialized with HTML content");


webview.bind("sendEvent", async <K extends IpcAction>(event:K, payload: IpcArgument<K>): Promise<IpcResponse<IpcResult<K>>> => {
  try {
    const result = await IpcServer[event](payload as any) as IpcResult<K>;
    Object.defineProperty(result, "ok", {
      value: true,
      writable: false,
      enumerable: true,
      configurable: false
    });
    return result as IpcResponse<IpcResult<K>>;
  } catch (error) {
    return { ok: false, error: { message: String(error) } };
  }
});

declare global {
  var sendEvent: <P,R>(
    event: string,
    payload: P
  ) => Promise<R>;
}

webview.runNonBlocking();

console.log("Webview is running");

await new Promise<void>((resolve) => {
  const interval = setInterval(() => {
    if (webview.unsafeHandle == null) {
      console.log("Webview closed, resolving promise");
      resolve();
      clearInterval(interval);
    }
  }, 1000);
});
