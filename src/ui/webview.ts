import { file } from "bun";
import { Webview } from "webview-bun";
import { DbRetroArchRom } from "../lib/database/RetroArchRom";
import html from "./ui/dist/index.html" with { type: "file" };

const webview = new Webview();

webview.setHTML(await file(html).text());

webview.bind("sendEvent", async (event:string, payload: any): Promise<any> => {
  // todo proxy this to main thread
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