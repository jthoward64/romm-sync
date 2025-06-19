import { WebUI } from "@webui-dev/bun-webui";
import { homePage } from "./ui/home";

await import("./lib/init");

const webui = new WebUI();
await webui.show(await homePage());
await WebUI.wait();
