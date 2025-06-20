import { file } from "bun";
import { Webview } from "webview-bun";
import { DbRetroArchRom } from "./lib/database/RetroArchRom";
import html from "./ui/dist/index.html" with { type: "file" };

await import("./lib/init");

const webview = new Webview();

webview.setHTML(await file(html).text());

webview.bind("postMessage", async (event:string, payload: Record<string, unknown>): Promise<Record<string, unknown>> => {
  const result: Record<string,unknown> = {ok:true};

  switch (event) {
    case "getRoms": {
      result.roms = await DbRetroArchRom.all();
      break;
    }
    default: {
      return {
        ok: false,
        error:{
          message: "Invalid event"
        }
      }
    }
  }

  return result

});

declare global {
  var sendEvent: <P,R>(
    event: string,
    payload: P
  ) => Promise<R>;
}

webview.run();